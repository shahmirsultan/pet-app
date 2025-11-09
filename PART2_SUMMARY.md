# Part-II Assignment Summary

## Quick Reference Guide

### GitHub Repository
**URL:** https://github.com/shahmirsultan/pet-app/

### Key Files Created for Part-II

1. **[Jenkinsfile](Jenkinsfile)** - Jenkins Pipeline Script
2. **[docker-compose.dev.yml](docker-compose.dev.yml)** - Development Environment Configuration
3. **[JENKINS_SETUP.md](JENKINS_SETUP.md)** - Complete Installation Guide

---

## Assignment Requirements Checklist

### ✅ Part-II Requirements Met

- ✅ **Jenkins on AWS EC2:** Installation guide provided
- ✅ **Code in GitHub:** Repository at https://github.com/shahmirsultan/pet-app/
- ✅ **Jenkins Pipeline Script:** `Jenkinsfile` created
- ✅ **Git Plugin:** Used in pipeline (Checkout Code stage)
- ✅ **Pipeline Plugin:** Jenkinsfile uses declarative pipeline syntax
- ✅ **Docker Pipeline Plugin:** Used for containerized build
- ✅ **Volume for Code:** `./:/app` volume mount in docker-compose.dev.yml (no Dockerfile)
- ✅ **Different Ports:** 3000 (web), 5433 (db) vs Part-I's 80, 5432
- ✅ **Different Container Names:** petshop_web_dev, petshop_db_dev
- ✅ **Persistent DB Volume:** postgres_data_dev volume attached
- ✅ **Automated Build:** Pipeline fetches from GitHub and builds in containers

---

## What You Need to Do Next

### Step 1: Push Files to GitHub

```bash
cd "c:\Users\Shahmir Sultan\Documents\main1"

# Add all files
git add .

# Commit
git commit -m "Add Jenkins pipeline configuration for Part-II assignment"

# Push to GitHub
git push origin main
```

### Step 2: Set Up Jenkins on EC2

Follow the detailed guide in **[JENKINS_SETUP.md](JENKINS_SETUP.md)**

Quick summary:
1. Install Java 17
2. Install Jenkins
3. Configure EC2 Security Group (ports: 8080, 3000, 5433)
4. Access Jenkins at `http://your-ec2-ip:8080`
5. Install plugins: Git, Pipeline, Docker Pipeline
6. Add Jenkins user to Docker group

### Step 3: Configure Jenkins Credentials

Add these credentials in Jenkins (Manage Jenkins → Credentials):

| ID | Value | Description |
|----|-------|-------------|
| `VITE_SUPABASE_URL` | https://jbrobnevnyouaalxuoaw.supabase.co | Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | eyJhbGci... (your key) | Supabase Key |
| `VITE_SUPABASE_PROJECT_ID` | jbrobnevnyouaalxuoaw | Project ID |
| `DB_PASSWORD` | SecurePassword123! | Database Password |

### Step 4: Create Jenkins Pipeline Job

1. New Item → "PetShop-CI-Pipeline" → Pipeline
2. Configure:
   - GitHub project: https://github.com/shahmirsultan/pet-app/
   - SCM: Git
   - Repository URL: https://github.com/shahmirsultan/pet-app.git
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
3. Save

### Step 5: Add Collaborator to GitHub

1. Go to GitHub repository settings
2. Collaborators → Add people
3. Enter: `qasimalik@gmail.com`
4. Send invitation

### Step 6: Stop Development Environment

**IMPORTANT:** Before submission, stop the dev containers:

```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
cd /var/lib/jenkins/workspace/PetShop-CI-Pipeline
docker-compose -f docker-compose.dev.yml -p petshop-jenkins down
```

The instructor will trigger the pipeline to bring it up.

---

## URLs for Assignment Submission

### Google Form Submission

**Form URL:** https://forms.gle/ubA9DRzQSudr2qhY6

Submit these URLs:

1. **Part-I URL (Production Deployment):**
   ```
   http://your-ec2-public-ip
   ```
   (Application running on port 80)

2. **Part-II URL (Jenkins Pipeline):**
   ```
   https://github.com/shahmirsultan/pet-app/
   ```
   (GitHub repository with Jenkinsfile)

---

## Files to Include in Report

### For Part-I
- ✅ `Dockerfile`
- ✅ `docker-compose.yml`
- ✅ Screenshots of running application
- ✅ Screenshots of Docker Hub

### For Part-II
- ✅ `docker-compose.dev.yml`
- ✅ `Jenkinsfile`
- ✅ Screenshots of Jenkins dashboard
- ✅ Screenshots of pipeline execution
- ✅ Screenshots of running containers (port 3000, 5433)
- ✅ Screenshots of GitHub repository
- ✅ Screenshot of collaborator invitation

---

## Key Differences: Part-I vs Part-II

### Part-I (Production - Manual Deployment)
```yaml
# docker-compose.yml
services:
  web:
    build: .                          # Uses Dockerfile
    container_name: petshop_web       # Production name
    ports:
      - "80:80"                       # Production port

  postgres:
    container_name: petshop_db
    ports:
      - "5432:5432"
```

### Part-II (Development - Jenkins Automated)
```yaml
# docker-compose.dev.yml
services:
  web_dev:
    image: node:18-alpine             # Base image (no Dockerfile)
    container_name: petshop_web_dev   # Dev name
    volumes:
      - ./:/app                       # Code as volume
    ports:
      - "3000:3000"                   # Dev port

  postgres_dev:
    container_name: petshop_db_dev
    ports:
      - "5433:5432"
```

---

## Pipeline Stages Explained

### 1. Cleanup Previous Build
- Stops and removes previous containers
- Cleans up Docker system

### 2. Checkout Code
- **Uses Git Plugin**
- Fetches code from https://github.com/shahmirsultan/pet-app.git
- Checks out `main` branch

### 3. Verify Files
- Ensures required files exist
- Validates docker-compose.dev.yml and package.json

### 4. Load Environment Variables
- **Uses Jenkins Credentials**
- Creates .env file with Supabase configuration
- Securely injects sensitive data

### 5. Build Application
- **Uses Docker Pipeline Plugin**
- Runs `docker-compose up -d`
- Builds app in containerized environment
- Code mounted as volume (not copied via Dockerfile)

### 6. Verify Build
- Checks containers are running
- Views logs
- Tests application accessibility

### 7. Health Check
- Verifies database connectivity
- Checks container status
- Validates volumes and networks

---

## Testing the Pipeline

### Manual Trigger
1. Jenkins Dashboard → PetShop-CI-Pipeline
2. Click "Build Now"
3. View "Console Output"

### Automatic Trigger (Optional)
- Configure GitHub webhook
- Pipeline triggers on git push

### Access Application After Build
- **URL:** `http://your-ec2-ip:3000`
- **Database:** `your-ec2-ip:5433`

---

## Verification Commands

```bash
# SSH to EC2
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Check containers (should show both Part-I and Part-II)
docker ps

# Part-I containers:
# - petshop_web (port 80)
# - petshop_db (port 5432)

# Part-II containers (when running):
# - petshop_web_dev (port 3000)
# - petshop_db_dev (port 5433)

# Check volumes
docker volume ls | grep petshop

# Check Jenkins workspace
ls -la /var/lib/jenkins/workspace/PetShop-CI-Pipeline/

# Verify code is mounted as volume
docker inspect petshop_web_dev | grep -A 10 Mounts
```

---

## Common Issues and Solutions

### Issue: Jenkins can't access Docker
**Solution:**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue: Port already in use
**Solution:**
```bash
# Check what's using the port
sudo lsof -i :3000
# Stop conflicting container
docker stop <container_name>
```

### Issue: Credentials not found
**Solution:**
- Verify credential IDs match exactly (case-sensitive)
- IDs must be: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, etc.

### Issue: Pipeline fails at checkout
**Solution:**
- Verify GitHub URL is correct
- Check network connectivity
- For private repos, add GitHub credentials

---

## Success Criteria

### Your assignment is successful when:

1. ✅ Part-I application running on port 80
2. ✅ Part-II code on GitHub with Jenkinsfile
3. ✅ Jenkins installed and configured on EC2
4. ✅ Pipeline job created and can run successfully
5. ✅ Pipeline fetches code from GitHub
6. ✅ Pipeline builds in Docker containers
7. ✅ Code mounted as volume (not built into image)
8. ✅ Different ports and names from Part-I
9. ✅ Database volume for persistence
10. ✅ qasimalik@gmail.com added as collaborator
11. ✅ Dev environment stopped (ready for instructor to trigger)
12. ✅ Complete report with screenshots submitted

---

## Final Checklist Before Submission

- [ ] All files pushed to GitHub
- [ ] Jenkinsfile in repository root
- [ ] docker-compose.dev.yml in repository root
- [ ] Jenkins installed on EC2
- [ ] Jenkins accessible at port 8080
- [ ] Pipeline job created and tested
- [ ] Credentials configured in Jenkins
- [ ] qasimalik@gmail.com added as collaborator
- [ ] Part-I still running on port 80
- [ ] Part-II containers stopped
- [ ] Screenshots taken for report
- [ ] Report includes all micro steps
- [ ] Google form submitted with correct URLs

---

## Contact Information for Report

**GitHub Repository:** https://github.com/shahmirsultan/pet-app/

**Collaborator:** qasimalik@gmail.com

**EC2 Instance:** (Include your EC2 IP in report)
- Part-I: http://your-ec2-ip:80
- Part-II: http://your-ec2-ip:3000 (when pipeline runs)
- Jenkins: http://your-ec2-ip:8080

---

Good luck with your submission! 🚀
