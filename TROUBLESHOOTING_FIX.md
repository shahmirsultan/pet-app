# Troubleshooting Fix for Part-II

## Problem Identified

The original `docker-compose.dev.yml` had issues:
1. ❌ `vite` command not found (npm install wasn't working properly)
2. ❌ Node modules volume was causing conflicts
3. ❌ `npx serve` package wasn't available

## Solution Applied

### Changes Made:

1. **Updated [docker-compose.dev.yml](docker-compose.dev.yml):**
   - Changed from `npm install` to `npm ci` (cleaner install)
   - Removed `node_modules_dev` volume (was causing conflicts)
   - Changed from `npx serve` to `npx http-server` (more reliable)
   - Simplified volume mounting (just code, no node_modules volume)

2. **Updated [package.json](package.json):**
   - Added `http-server` as a dependency

3. **Updated [Jenkinsfile](Jenkinsfile):**
   - Increased wait time to 60 seconds for build to complete
   - Added retry logic (5 attempts with 10-second intervals)
   - Better logging to see what's happening

---

## Testing on EC2

### Step 1: Push Changes to GitHub

```bash
# On your local machine
cd "c:\Users\Shahmir Sultan\Documents\main1"

# Add the updated files
git add docker-compose.dev.yml package.json Jenkinsfile TROUBLESHOOTING_FIX.md

# Commit
git commit -m "Fix docker-compose.dev.yml to properly serve the application"

# Push to GitHub
git push origin main
```

### Step 2: Test Manually on EC2 First

SSH to your EC2 instance and test the fix manually:

```bash
# SSH to EC2
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Navigate to Jenkins workspace
cd /var/lib/jenkins/workspace/PetApp-CI

# Pull latest changes
git pull origin main

# Clean everything
docker-compose -f docker-compose.dev.yml -p petshop-jenkins down
docker system prune -af
docker volume prune -f

# Start fresh
docker-compose -f docker-compose.dev.yml -p petshop-jenkins up -d

# Watch the logs (this is important!)
docker logs -f petshop_web_dev
```

You should see output like:
```
npm ci
...
npm run build
...
vite build
...
npx http-server dist -p 3000
Starting up http-server, serving dist
http-server version: 14.1.1
...
Available on:
  http://0.0.0.0:3000
```

Press `Ctrl+C` to exit logs.

### Step 3: Test the Application

```bash
# Test from inside the container
docker exec petshop_web_dev wget --spider -q http://localhost:3000 && echo "SUCCESS!" || echo "FAILED"

# Test from the EC2 instance
curl http://localhost:3000

# You should see HTML output

# Test from your browser
# Open: http://your-ec2-ip:3000
```

### Step 4: Check Container Status

```bash
# Check running containers
docker ps

# You should see:
# - petshop_web_dev (port 3000)
# - petshop_db_dev (port 5433)

# Check logs if needed
docker logs petshop_web_dev
docker logs petshop_db_dev

# Check volumes
docker volume ls | grep petshop
```

### Step 5: Run Jenkins Pipeline

Once manual test works:

1. Go to Jenkins: `http://your-ec2-ip:8080`
2. Click on "PetShop-CI-Pipeline"
3. Click "Build Now"
4. Watch the build progress
5. Check "Console Output"

The pipeline should now succeed!

---

## What Changed in docker-compose.dev.yml

### Before (Broken):
```yaml
web_dev:
  image: node:18-alpine
  command: sh -c "npm install && npm run build && npx serve -s dist -l 3000"
  volumes:
    - ./:/app
    - node_modules_dev:/app/node_modules  # ❌ This was causing issues
```

### After (Fixed):
```yaml
web_dev:
  image: node:18-alpine
  command: sh -c "npm ci && npm run build && npx http-server dist -p 3000"
  volumes:
    - ./:/app  # ✅ Simple volume mount
```

---

## Key Improvements

1. **npm ci vs npm install:**
   - `npm ci` does a clean install from package-lock.json
   - Faster and more reliable in Docker containers

2. **Removed node_modules volume:**
   - The volume was preventing proper installation
   - Now modules install directly in the mounted code directory

3. **http-server instead of serve:**
   - `http-server` is more reliable
   - Added to package.json so it's always available
   - Better logging and error messages

4. **Better Jenkinsfile:**
   - Waits 60 seconds for build to complete
   - Retries 5 times with 10-second intervals
   - Shows logs at each step

---

## Expected Timeline

When running `docker-compose up -d`:

1. **0-10 seconds:** Pull images, create containers
2. **10-30 seconds:** `npm ci` (install dependencies)
3. **30-60 seconds:** `npm run build` (Vite build)
4. **60+ seconds:** `http-server` starts serving on port 3000

Total: **~1-2 minutes** for complete startup

---

## Debugging Commands

If something goes wrong:

```bash
# 1. Check container status
docker ps -a

# 2. View full logs
docker logs petshop_web_dev

# 3. Access container shell
docker exec -it petshop_web_dev sh

# 4. Inside container, check if app is running
wget -O- http://localhost:3000

# 5. Check if dist folder was created
ls -la /app/dist

# 6. Check if http-server is running
ps aux | grep http-server

# 7. Exit container
exit

# 8. Restart container if needed
docker restart petshop_web_dev

# 9. View logs in real-time
docker logs -f petshop_web_dev
```

---

## Common Issues and Solutions

### Issue: "vite: not found"
**Solution:** Already fixed! We now use `npm ci` which properly installs all dependencies.

### Issue: "ERR! Failed at the build script"
**Solution:** Check logs with `docker logs petshop_web_dev`. Likely a TypeScript error. Make sure all source code is on EC2.

### Issue: Port 3000 already in use
**Solution:**
```bash
# Find what's using port 3000
sudo lsof -i :3000
# Kill that process or use different port
```

### Issue: Container keeps restarting
**Solution:**
```bash
# Check why it's failing
docker logs petshop_web_dev
# Likely the build command failed
```

### Issue: "Cannot find module"
**Solution:**
```bash
# Clean rebuild
docker-compose -f docker-compose.dev.yml -p petshop-jenkins down
docker volume prune -f
docker-compose -f docker-compose.dev.yml -p petshop-jenkins up -d --build
```

---

## Verification Checklist

Before considering it working:

- [ ] Containers are running: `docker ps` shows both containers
- [ ] Database is healthy: `docker exec petshop_db_dev pg_isready -U petshop_user`
- [ ] Web logs show http-server started: `docker logs petshop_web_dev | grep "http-server"`
- [ ] Application responds: `curl http://localhost:3000` returns HTML
- [ ] Browser access works: `http://your-ec2-ip:3000` shows the app
- [ ] Jenkins pipeline succeeds: All stages green
- [ ] Volume persists data: Database data survives container restart

---

## Quick Test Script

Save this as `test-app.sh` and run it:

```bash
#!/bin/bash

echo "=== Testing Pet Shop Application ==="

echo "1. Checking containers..."
docker ps | grep petshop

echo ""
echo "2. Checking database health..."
docker exec petshop_db_dev pg_isready -U petshop_user -d petshop_db_dev

echo ""
echo "3. Checking web container logs (last 10 lines)..."
docker logs --tail=10 petshop_web_dev

echo ""
echo "4. Testing application from inside container..."
docker exec petshop_web_dev wget --spider -q http://localhost:3000 && echo "✅ SUCCESS" || echo "❌ FAILED"

echo ""
echo "5. Testing application from EC2 instance..."
curl -s http://localhost:3000 | head -c 100 && echo "... ✅ SUCCESS" || echo "❌ FAILED"

echo ""
echo "6. Checking volumes..."
docker volume ls | grep petshop

echo ""
echo "=== Test Complete ==="
```

Run it:
```bash
chmod +x test-app.sh
./test-app.sh
```

---

## Success Output Example

When everything works, you should see:

```bash
$ docker ps
CONTAINER ID   IMAGE              STATUS         PORTS                    NAMES
abc123def456   node:18-alpine     Up 2 minutes   0.0.0.0:3000->3000/tcp   petshop_web_dev
def456ghi789   postgres:15-alpine Up 2 minutes   0.0.0.0:5433->5432/tcp   petshop_db_dev

$ docker logs --tail=20 petshop_web_dev
...
Starting up http-server, serving dist
http-server version: 14.1.1
...
Available on:
  http://0.0.0.0:3000
Hit CTRL-C to stop the server

$ curl http://localhost:3000
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    ...
```

---

## Next Steps After Success

1. ✅ Stop the containers (for assignment submission):
   ```bash
   docker-compose -f docker-compose.dev.yml -p petshop-jenkins down
   ```

2. ✅ Keep Part-I running:
   ```bash
   docker ps | grep petshop_web  # Should show Part-I on port 80
   ```

3. ✅ Submit assignment with GitHub URL

4. ✅ Instructor will trigger Jenkins to start Part-II

Good luck! 🚀
