# Quick Fix for Container Restart Issue

## What Was Wrong

The container was restarting because the build command was failing and exiting. The error `Restarting (1)` means the process exited with code 1.

## Solution

I've created a **[start-dev.sh](start-dev.sh)** script that:
1. ✅ Has better error handling
2. ✅ Shows clear step-by-step progress
3. ✅ Keeps container alive even if build fails (for debugging)
4. ✅ Provides detailed error messages

## Files Updated

1. **[start-dev.sh](start-dev.sh)** - New startup script with error handling
2. **[docker-compose.dev.yml](docker-compose.dev.yml)** - Now uses the startup script
3. **[package.json](package.json)** - Has http-server dependency

---

## URGENT: Push to GitHub and Test Now

### Step 1: Push Changes (FROM YOUR LOCAL MACHINE)

```bash
cd "c:\Users\Shahmir Sultan\Documents\main1"

# Add all files
git add start-dev.sh docker-compose.dev.yml package.json QUICK_FIX.md

# Commit
git commit -m "Add startup script with error handling to fix container restart issue"

# Push
git push origin main
```

### Step 2: Test on EC2 (SSH TO YOUR EC2)

```bash
# SSH to EC2
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Go to Jenkins workspace
cd /var/lib/jenkins/workspace/PetApp-CI

# Pull latest changes
sudo git pull origin main

# Make the script executable
sudo chmod +x start-dev.sh

# Clean everything
sudo docker-compose -f docker-compose.dev.yml -p petshop-jenkins down
sudo docker system prune -af

# Start containers
sudo docker-compose -f docker-compose.dev.yml -p petshop-jenkins up -d

# IMMEDIATELY watch the logs
sudo docker logs -f petshop_web_dev
```

### What You Should See in Logs:

```
=========================================
Starting Pet Shop Development Build
=========================================
Step 1: Installing dependencies...
npm ci
...
added 266 packages
Step 2: Building application...
npm run build
vite v5.4.19 building for production...
✓ built in 5.32s
Step 3: Starting HTTP server...
Application will be available on http://localhost:3000
Starting up http-server, serving dist
Available on:
  http://0.0.0.0:3000
Hit CTRL-C to stop the server
```

If you see an error, the script will show:
```
ERROR: [error message]
Keeping container alive for debugging...
```

This means the container stays running so you can debug!

### Step 3: Check Container Status

```bash
# Check if containers are running
sudo docker ps

# Should show:
# - petshop_web_dev (Up X minutes) - NOT restarting!
# - petshop_db_dev (Up X minutes, healthy)
```

### Step 4: Test the Application

```bash
# Test from EC2
curl http://localhost:3000

# Should return HTML content

# Test from browser
# Open: http://your-ec2-ip:3000
```

---

## If It Still Fails - Debugging Steps

### 1. Check the logs for the exact error

```bash
sudo docker logs petshop_web_dev
```

Look for error messages after each step.

### 2. Check if files are there

```bash
sudo docker exec petshop_web_dev ls -la /app
```

Should show all your source files including `start-dev.sh`.

### 3. Check if start-dev.sh is executable

```bash
sudo docker exec petshop_web_dev ls -l /app/start-dev.sh
```

### 4. Manually run commands inside container

```bash
# Access container shell
sudo docker exec -it petshop_web_dev sh

# Try npm ci
npm ci

# Try build
npm run build

# Check if dist was created
ls -la dist/

# Try starting server
npx http-server dist -p 3000
```

### 5. Check environment variables

```bash
sudo docker exec petshop_web_dev env | grep VITE
```

Should show your Supabase variables.

---

## Common Errors and Solutions

### Error: "npm ci failed"
**Cause:** package-lock.json issue or network problem
**Solution:**
```bash
# On EC2, check if package-lock.json exists
ls -la package-lock.json

# If missing, create it
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Error: "npm run build failed"
**Cause:** TypeScript errors or missing dependencies
**Solution:**
```bash
# Check build logs in container
sudo docker logs petshop_web_dev

# Look for TypeScript errors
# Fix them in your local code, commit, and push
```

### Error: "dist folder not created after build"
**Cause:** Build failed silently
**Solution:**
```bash
# Check vite.config.ts
cat vite.config.ts

# Ensure it builds to 'dist' folder (it should)
```

### Error: "http-server failed to start"
**Cause:** http-server not installed
**Solution:**
```bash
# Ensure package.json has http-server
grep http-server package.json

# Should show: "http-server": "^14.1.1"
```

### Error: "Permission denied" on start-dev.sh
**Solution:**
```bash
# Make it executable
sudo chmod +x start-dev.sh

# Rebuild
sudo docker-compose -f docker-compose.dev.yml -p petshop-jenkins down
sudo docker-compose -f docker-compose.dev.yml -p petshop-jenkins up -d
```

---

## Alternative: Simple Test Without Script

If the script approach doesn't work, you can test with a simpler command:

**Edit docker-compose.dev.yml temporarily:**
```yaml
command: sh -c "npm ci && npm run build && ls -la dist && npx http-server dist -p 3000 || tail -f /dev/null"
```

This will:
1. Install dependencies
2. Build the app
3. List dist contents
4. Start http-server
5. If any step fails, keep container alive with `tail -f /dev/null`

---

## Success Checklist

- [ ] start-dev.sh is in the repository
- [ ] start-dev.sh is executable (`chmod +x`)
- [ ] docker-compose.dev.yml uses `sh /app/start-dev.sh`
- [ ] package.json has http-server dependency
- [ ] All files pushed to GitHub
- [ ] Git pulled on EC2
- [ ] Containers started: `docker-compose up -d`
- [ ] Container shows "Up" not "Restarting"
- [ ] Logs show "Starting up http-server"
- [ ] `curl http://localhost:3000` returns HTML
- [ ] Browser shows app at `http://your-ec2-ip:3000`

---

## Next Steps After Success

1. ✅ Run Jenkins pipeline to verify automated build works
2. ✅ Stop containers before submission: `docker-compose down`
3. ✅ Submit GitHub URL to assignment form
4. ✅ Add qasimalik@gmail.com as collaborator

Good luck! The startup script should give you much better visibility into what's failing.
