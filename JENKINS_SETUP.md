# Jenkins Setup Guide for Part-II (CI/CD Pipeline)

This guide will help you install and configure Jenkins on AWS EC2 Ubuntu instance for automated containerized builds.

## Assignment Requirements (Part-II)

✅ Jenkins running on AWS EC2
✅ Code in GitHub repository
✅ Jenkins pipeline fetches code from GitHub
✅ Build in containerized environment using Docker
✅ Volume attached for code (no Dockerfile)
✅ Different ports and container names from Part-I
✅ Uses Git, Pipeline, and Docker Pipeline plugins

---

## Part 1: Jenkins Installation on EC2

### Step 1: Connect to Your EC2 Instance

```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### Step 2: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 3: Install Java (Jenkins Requirement)

```bash
# Install OpenJDK 17
sudo apt install -y openjdk-17-jdk

# Verify installation
java -version
```

### Step 4: Install Jenkins

```bash
# Add Jenkins repository key
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# Add Jenkins repository
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update package list
sudo apt update

# Install Jenkins
sudo apt install -y jenkins

# Start Jenkins service
sudo systemctl start jenkins

# Enable Jenkins to start on boot
sudo systemctl enable jenkins

# Check Jenkins status
sudo systemctl status jenkins
```

### Step 5: Configure EC2 Security Group

Add inbound rules in your EC2 Security Group:
- **Port 8080** - Jenkins Web UI (HTTP)
- **Port 3000** - Development Application (HTTP)
- **Port 5433** - PostgreSQL Dev Database
- **Port 80** - Production Application (from Part-I)

### Step 6: Access Jenkins

1. Open browser: `http://your-ec2-public-ip:8080`
2. Get initial admin password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

3. Copy the password and paste it in Jenkins web UI

### Step 7: Jenkins Initial Setup

1. Choose "Install suggested plugins"
2. Wait for plugins to install
3. Create your first admin user:
   - Username: `admin`
   - Password: (choose a strong password)
   - Full name: Your Name
   - Email: your-email@example.com
4. Click "Save and Continue"
5. Keep the Jenkins URL as default
6. Click "Save and Finish"
7. Click "Start using Jenkins"

---

## Part 2: Install Required Jenkins Plugins

### Step 1: Navigate to Plugin Manager

1. Dashboard → Manage Jenkins → Plugins
2. Click "Available plugins" tab

### Step 2: Install Plugins

Search and install these plugins:
- ✅ **Git plugin** (usually pre-installed)
- ✅ **Pipeline** (usually pre-installed)
- ✅ **Docker Pipeline**
- ✅ **GitHub Integration**

To install:
1. Check the boxes next to each plugin
2. Click "Install without restart"
3. Wait for installation to complete

---

## Part 3: Configure Jenkins for Docker

### Step 1: Add Jenkins User to Docker Group

```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Verify docker access
sudo -u jenkins docker ps
```

### Step 2: Install Docker Compose for Jenkins

```bash
# Install docker-compose plugin (if not already installed)
sudo apt install -y docker-compose-plugin

# Verify
docker compose version
```

---

## Part 4: Configure Jenkins Credentials

### Step 1: Add Supabase Credentials

1. Dashboard → Manage Jenkins → Credentials
2. Click "(global)" domain
3. Click "Add Credentials"

Add each credential as "Secret text":

**Credential 1:**
- Kind: Secret text
- Secret: `https://jbrobnevnyouaalxuoaw.supabase.co`
- ID: `VITE_SUPABASE_URL`
- Description: Supabase URL

**Credential 2:**
- Kind: Secret text
- Secret: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your full key)
- ID: `VITE_SUPABASE_PUBLISHABLE_KEY`
- Description: Supabase Publishable Key

**Credential 3:**
- Kind: Secret text
- Secret: `jbrobnevnyouaalxuoaw`
- ID: `VITE_SUPABASE_PROJECT_ID`
- Description: Supabase Project ID

**Credential 4:**
- Kind: Secret text
- Secret: `SecurePassword123!`
- ID: `DB_PASSWORD`
- Description: Database Password

---

## Part 5: Create Jenkins Pipeline Job

### Step 1: Create New Pipeline

1. Dashboard → New Item
2. Enter name: `PetShop-CI-Pipeline`
3. Select "Pipeline"
4. Click "OK"

### Step 2: Configure Pipeline

**General Section:**
- Description: `Automated build pipeline for Pet Shop application`
- ✅ Check "GitHub project"
- Project URL: `https://github.com/shahmirsultan/pet-app/`

**Build Triggers:**
- ✅ Check "GitHub hook trigger for GITScm polling" (for automatic builds)
- OR ✅ Check "Poll SCM" and set schedule: `H/5 * * * *` (every 5 minutes)

**Pipeline Section:**
- Definition: `Pipeline script from SCM`
- SCM: `Git`
- Repository URL: `https://github.com/shahmirsultan/pet-app.git`
- Credentials: (leave as "none" for public repo)
- Branch: `*/main`
- Script Path: `Jenkinsfile`

**Save the configuration**

---

## Part 6: Push Files to GitHub

### Step 1: Prepare Files

Ensure these files are in your project:
- ✅ `Jenkinsfile`
- ✅ `docker-compose.dev.yml`
- ✅ `.env.example`
- ✅ All source code

### Step 2: Commit and Push

```bash
# Navigate to your project directory (on your local machine)
cd "c:\Users\Shahmir Sultan\Documents\main1"

# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/shahmirsultan/pet-app.git

# Add all files
git add .

# Commit files
git commit -m "Add Jenkins pipeline configuration for Part-II"

# Push to GitHub
git push -u origin main
```

---

## Part 7: Add Collaborator to GitHub

1. Go to: https://github.com/shahmirsultan/pet-app/
2. Click "Settings" tab
3. Click "Collaborators" in left sidebar
4. Click "Add people"
5. Enter: `qasimalik@gmail.com`
6. Click "Add qasimalik@gmail.com to this repository"
7. Select permission level: "Write" or "Admin"
8. Click "Send invitation"

---

## Part 8: Run the Pipeline

### Step 1: Trigger Build Manually

1. Go to Jenkins Dashboard
2. Click on "PetShop-CI-Pipeline"
3. Click "Build Now"
4. Watch the build progress in "Build History"
5. Click on build number (e.g., #1) to see details
6. Click "Console Output" to see logs

### Step 2: Verify Pipeline Stages

The pipeline will execute these stages:
1. ✅ Cleanup Previous Build
2. ✅ Checkout Code (from GitHub)
3. ✅ Verify Files
4. ✅ Load Environment Variables
5. ✅ Build Application (in Docker containers)
6. ✅ Verify Build
7. ✅ Health Check

### Step 3: Access the Application

Once pipeline succeeds:
- Application URL: `http://your-ec2-public-ip:3000`
- Database Port: `5433`

---

## Part 9: Verify Requirements

### Verify Docker Containers

```bash
# SSH to EC2
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Check running containers
docker ps

# You should see:
# - petshop_web_dev (on port 3000)
# - petshop_db_dev (on port 5433)
```

### Verify Volumes

```bash
# Check volumes
docker volume ls | grep petshop

# You should see:
# - postgres_data_dev (database persistence)
# - node_modules_dev (dependencies cache)
```

### Verify Code Volume Mount

```bash
# Check docker-compose.dev.yml
cat docker-compose.dev.yml

# Verify the web service has volume mount:
# volumes:
#   - ./:/app  <-- This mounts code as volume (no Dockerfile for web)
```

### Verify Different Ports

```bash
# Check ports are different from Part-I
docker ps

# Part-I (Production):
# - petshop_web: port 80
# - petshop_db: port 5432

# Part-II (Development/Jenkins):
# - petshop_web_dev: port 3000
# - petshop_db_dev: port 5433
```

---

## Part 10: Stopping the Pipeline Environment

**IMPORTANT:** The assignment requires the containerized environment to be DOWN initially.

### Stop Containers (Before Submission)

```bash
# SSH to EC2
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Navigate to Jenkins workspace
cd /var/lib/jenkins/workspace/PetShop-CI-Pipeline

# Stop the containers
docker-compose -f docker-compose.dev.yml -p petshop-jenkins down

# Verify containers are stopped
docker ps | grep petshop
```

The instructor (qasimalik@gmail.com) will trigger the pipeline to bring the environment up.

---

## Troubleshooting

### Jenkins Can't Access Docker

```bash
# Ensure jenkins user is in docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Verify
sudo -u jenkins docker ps
```

### Pipeline Fails at Git Checkout

- Verify GitHub repository URL is correct
- For private repos, add GitHub credentials in Jenkins
- Check network connectivity from EC2 to GitHub

### Credentials Not Found

- Verify credential IDs match exactly:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_PROJECT_ID`
  - `DB_PASSWORD`
- IDs are case-sensitive

### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :5433

# Stop conflicting services
docker stop <container_name>
```

### Container Fails to Start

```bash
# Check logs
docker-compose -f docker-compose.dev.yml -p petshop-jenkins logs

# Check specific service
docker logs petshop_web_dev
docker logs petshop_db_dev
```

---

## Assignment Submission Checklist

### Files to Include in Report

✅ **Part-II docker-compose.yml:**
- File: `docker-compose.dev.yml`
- Shows volume mount for code
- Different ports (3000, 5433)
- Different container names

✅ **Jenkins Pipeline Script:**
- File: `Jenkinsfile`
- Shows Git integration
- Shows Docker Pipeline usage
- Shows containerized build

### Screenshots to Include

1. Jenkins Dashboard showing the pipeline job
2. Pipeline execution with all stages (Console Output)
3. Jenkins credentials configuration page
4. GitHub repository showing Jenkinsfile and docker-compose.dev.yml
5. Running containers (`docker ps`)
6. Volume inspection (`docker volume ls`)
7. Application running on port 3000
8. GitHub collaborator invitation sent to qasimalik@gmail.com

### URLs to Submit

- **Part-I URL:** `http://your-ec2-ip` (production on port 80)
- **Part-II URL:** `https://github.com/shahmirsultan/pet-app/` (GitHub repository)

### Important Notes

1. ✅ Add qasimalik@gmail.com as collaborator to GitHub repo
2. ✅ Stop the dev containers before submission
3. ✅ Keep Part-I production environment running
4. ✅ Document all micro steps with screenshots
5. ✅ Include both docker-compose files in report

---

## Key Differences: Part-I vs Part-II

| Aspect | Part-I (Production) | Part-II (Jenkins/Dev) |
|--------|---------------------|------------------------|
| **Deployment** | Manual docker build | Jenkins automated pipeline |
| **Docker Image** | Built from Dockerfile | Uses base Node image |
| **Code Delivery** | Copied into image | Mounted as volume |
| **Web Port** | 80 | 3000 |
| **DB Port** | 5432 | 5433 |
| **Web Container** | petshop_web | petshop_web_dev |
| **DB Container** | petshop_db | petshop_db_dev |
| **Compose File** | docker-compose.yml | docker-compose.dev.yml |
| **Network** | petshop_network | petshop_network_dev |

---

## Additional Resources

- Jenkins Documentation: https://www.jenkins.io/doc/
- Docker Compose: https://docs.docker.com/compose/
- Jenkins Pipeline Syntax: https://www.jenkins.io/doc/book/pipeline/syntax/
- Docker Pipeline Plugin: https://plugins.jenkins.io/docker-workflow/

---

## Support

If you encounter issues:
1. Check Jenkins console output for detailed error messages
2. Verify all credentials are configured correctly
3. Ensure EC2 security groups allow required ports
4. Check Docker logs: `docker-compose logs`
5. Verify Jenkins has Docker access: `sudo -u jenkins docker ps`

Good luck with your assignment!
