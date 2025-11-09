# Docker Deployment Guide for AWS EC2

This guide will help you deploy this React web application on an AWS EC2 Ubuntu instance using Docker.

## Prerequisites

- AWS EC2 Ubuntu instance (t2.micro or larger)
- WinSCP installed on your Windows machine
- SSH access to your EC2 instance
- Security Group configured to allow:
  - Port 22 (SSH)
  - Port 80 (HTTP)
  - Port 443 (HTTPS - optional)

## Project Structure

This project includes:
- **Dockerfile**: Multi-stage build for the React application
- **docker-compose.yml**: Orchestrates web app and PostgreSQL database
- **nginx.conf**: Nginx configuration for serving the React app
- **.dockerignore**: Excludes unnecessary files from Docker image
- **.env**: Environment variables (copy from .env.example)

## Step 1: Prepare Files for Transfer

1. Ensure your `.env` file exists with proper Supabase credentials
2. All Docker files are ready in the project root

## Step 2: Transfer Files to EC2

Using WinSCP:

1. Open WinSCP and connect to your EC2 instance:
   - Host name: Your EC2 public IP
   - User name: `ubuntu`
   - Private key: Your `.pem` file

2. Navigate to `/home/ubuntu/` on the remote server

3. Create a new directory: `petshop-app`

4. Transfer these files/folders to `/home/ubuntu/petshop-app/`:
   - All project files (src, public, etc.)
   - Dockerfile
   - docker-compose.yml
   - nginx.conf
   - .dockerignore
   - .env (your actual environment file)
   - package.json
   - package-lock.json
   - All configuration files (vite.config.ts, tsconfig.json, etc.)

## Step 3: Connect to EC2 via SSH

```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

## Step 4: Install Docker and Docker Compose

```bash
# Update package list
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list again
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Apply group changes (or logout and login again)
newgrp docker

# Verify installations
docker --version
docker compose version
```

## Step 5: Build and Deploy

```bash
# Navigate to project directory
cd /home/ubuntu/petshop-app

# Verify .env file exists
ls -la .env

# Build the Docker image
docker build -t petshop-web .

# Start all services using docker-compose
docker compose up -d

# Check running containers
docker ps

# View logs
docker compose logs -f
```

## Step 6: Verify Deployment

1. Open your browser and navigate to: `http://your-ec2-public-ip`
2. You should see your application running

## Step 7: Push Image to Docker Hub (Optional)

```bash
# Login to Docker Hub
docker login

# Tag the image
docker tag petshop-web your-dockerhub-username/petshop-web:latest

# Push to Docker Hub
docker push your-dockerhub-username/petshop-web:latest
```

## Useful Docker Commands

```bash
# Stop all services
docker compose down

# Restart services
docker compose restart

# View logs for specific service
docker compose logs web
docker compose logs postgres

# Access container shell
docker exec -it petshop_web sh
docker exec -it petshop_db psql -U petshop_user -d petshop_db

# Remove all containers and volumes
docker compose down -v

# Rebuild and restart
docker compose up -d --build

# Check volume data
docker volume ls
docker volume inspect petshop_app_postgres_data
```

## Database Persistence

The PostgreSQL database uses a named volume `postgres_data` which persists data even when containers are stopped or removed. This satisfies the assignment requirement for persistent database storage.

To verify volume persistence:
```bash
# Check volumes
docker volume ls

# Inspect the database volume
docker volume inspect petshop_app_postgres_data
```

## Troubleshooting

### Port already in use
```bash
# Check what's using port 80
sudo lsof -i :80

# Stop nginx if it's running
sudo systemctl stop nginx
```

### Container fails to start
```bash
# Check logs
docker compose logs

# Check specific service
docker compose logs web
docker compose logs postgres
```

### Permission denied errors
```bash
# Ensure user is in docker group
sudo usermod -aG docker ubuntu
newgrp docker
```

### Environment variables not working
```bash
# Verify .env file exists
cat .env

# Rebuild with no cache
docker compose build --no-cache
docker compose up -d
```

## Security Best Practices

1. Change default database password in `.env`
2. Configure AWS Security Groups properly
3. Consider setting up HTTPS with Let's Encrypt
4. Keep Docker and system packages updated
5. Use secrets management for production

## Clean Up

To completely remove the deployment:
```bash
# Stop and remove containers, networks, and volumes
docker compose down -v

# Remove Docker images
docker rmi petshop-web
docker rmi postgres:15-alpine
docker rmi nginx:alpine
```

## Assignment Compliance

This deployment satisfies the following requirements:

✅ Uses Docker for containerization
✅ Deployed on AWS EC2 (IaaS)
✅ Web application uses a database (PostgreSQL/Supabase)
✅ Dockerfile created for building web server image
✅ docker-compose.yml orchestrates the application
✅ Database volume attached for data persistence
✅ Image can be pushed to Docker Hub

## Support

For issues or questions:
- Check Docker logs: `docker compose logs`
- Verify EC2 security groups
- Ensure all files were transferred correctly
- Verify .env file has correct values
