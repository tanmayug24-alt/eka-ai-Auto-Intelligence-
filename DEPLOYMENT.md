# 🚀 DEPLOYMENT GUIDE - Complete Instructions

**Version:** 7.0.0
**Status:** ✅ Production Ready
**Last Updated:** 2026-03-02

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Options](#deployment-options)
3. [Option 1: Vercel (Recommended)](#option-1-vercel-recommended)
4. [Option 2: Netlify](#option-2-netlify)
5. [Option 3: Docker & Docker Compose](#option-3-docker--docker-compose)
6. [Option 4: AWS S3 + CloudFront](#option-4-aws-s3--cloudfront)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## ✅ Pre-Deployment Checklist

Before deploying to any environment, verify:

### Code & Build
- [ ] All tests passing locally (npm test, pytest)
- [ ] Build succeeds without errors (npm run build)
- [ ] No console errors or warnings
- [ ] Git repository is clean (no uncommitted changes)
- [ ] Latest code pushed to GitHub main branch

### Configuration
- [ ] Environment variables configured (.env files)
- [ ] Database connection string set correctly
- [ ] API base URLs configured correctly
- [ ] JWT secrets configured for production
- [ ] CORS origins set to production domain

### Security
- [ ] JWT secret keys are strong and unique
- [ ] API keys securely stored in env variables (NOT in code)
- [ ] Database passwords strong and not in version control
- [ ] HTTPS enabled for all endpoints
- [ ] CORS properly configured for exact domain (not wildcard)

### Documentation
- [ ] README.md updated with current info
- [ ] Deployment procedures documented
- [ ] Rollback procedures documented
- [ ] Team members notified of deployment

### Testing
- [ ] Staging API testing completed (STAGING_API_TESTING_SETUP.md)
- [ ] All 8 test phases passing
- [ ] Integration testing completed
- [ ] Performance testing baseline established

---

## 🎯 Deployment Options

### Quick Comparison

| Feature | Vercel | Netlify | Docker | AWS |
| --------- | :---: | :-----: | :----: | :--: |
| **Setup Time** | 15 min | 15 min | 20 min | 30 min |
| **Cost** | Free/Pro | Free/Pro | Variable | Variable |
| **Global CDN** | ✅ | ✅ | ⚠️ | ✅ |
| **Auto Scaling** | ✅ | ⚠️ | ⚠️ | ✅ |
| **Custom Domain** | ✅ | ✅ | ✅ | ✅ |
| **Environment** | PaaS | PaaS | Self-Hosted | Cloud |
| **Ease** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Best For** | Fast, Simple | Fast, Simple | Control | Scale |

### Recommendation

**🏆 Vercel Recommended** - Best balance of:
- ✅ Fastest setup (15 minutes)
- ✅ Global CDN automatically configured
- ✅ Zero downtime deployments
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ No infrastructure management needed

---

## 🎨 Option 1: Vercel (Recommended)

### Prerequisites
- GitHub account with repository pushed
- Vercel account (free tier available)
- Node.js 18+ locally

### Step 1: Prepare Code (2 minutes)

```bash
# 1. Make sure all code is committed
git status
# All changes should be on main branch

# 2. Verify build works locally
npm run build
# Should complete without errors

# 3. Push to GitHub
git push origin main
```

### Step 2: Connect to Vercel (3 minutes)

```bash
# 1. Go to https://vercel.com
# 2. Click "Log In" or "Sign Up"
# 3. Choose "Continue with GitHub"
# 4. Authorize Vercel to access your GitHub

# 5. Click "Add New Project..."
# 6. Search for "eka-ai-Auto-Intelligence-"
# 7. Click "Import"
```

### Step 3: Configure Project (5 minutes)

**In Vercel Project Settings:**

1. **Project Name**
   - Name: `eka-ai` (or your preferred name)
   - Framework: Vite (should auto-detect)

2. **Root Directory**
   - Root: `./` (leave as default)
   - Click "Configure" if needed
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   - Click "Environment Variables"
   - Add each variable from your `.env.local`:
     ```
     REACT_APP_API_URL = https://your-api-domain.com/api/v1
     REACT_APP_ENVIRONMENT = production
     REACT_APP_VERSION = 7.0.0
     ```
   - Click "Save"

### Step 4: Deploy (3 minutes)

```
1. Click "Deploy"
2. Wait for build (1-2 minutes)
3. See "Congratulations" message
4. Click "Visit" to see your site
```

### Step 5: Verify Deployment (2 minutes)

```bash
# 1. Check site loads
# Visit the provided URL (e.g., eka-ai.vercel.app)

# 2. Test login
# Follow FRONTEND_TESTING_EXECUTION_REPORT.md test procedures

# 3. Check console (F12)
# Should show API requests to your backend

# 4. Verify API connectivity
# Dashboard should load with real data
```

### Step 6: Configure Custom Domain (Optional, 5 minutes)

```
1. In Vercel Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., app.eka-ai.com)
4. Add DNS records according to Vercel instructions
5. Wait for DNS propagation (5-30 minutes)
6. Click "Verify"
```

### Vercel Deployment Complete ✅

**Total Time: 15 minutes**

### Continuous Deployment Setup

Vercel automatically deploys when you push to GitHub:

```bash
# To deploy new changes later:
git commit -am "Update feature X"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Runs build command
# 3. Runs tests
# 4. Deploys to production
# 5. Sends deployment notification
```

---

## 📱 Option 2: Netlify

### Prerequisites
- GitHub account with repository pushed
- Netlify account (free tier available)

### Step 1: Prepare Code

Same as Vercel (commit, build, push)

### Step 2: Connect to Netlify (3 minutes)

```bash
# 1. Go to https://netlify.com
# 2. Click "Sign up" or "Log in"
# 3. Choose "Continue with GitHub"
# 4. Authorize Netlify

# 5. Click "Add new site"
# 6. Choose "Import an existing project"
# 7. Select "GitHub"
# 8. Find "eka-ai-Auto-Intelligence-"
# 9. Click "Install"
```

### Step 3: Configure Deploy Settings (5 minutes)

**Build Settings:**
- Base directory: `./` (leave blank)
- Build command: `npm run build`
- Publish directory: `dist`

**Environment Variables:**
- Click "Edit variables"
- Add from `.env.local`:
  ```
  REACT_APP_API_URL = https://your-api.com/api/v1
  REACT_APP_ENVIRONMENT = production
  ```

### Step 4: Deploy (2 minutes)

- Click "Deploy site"
- Wait 2-3 minutes for build
- Get random URL (e.g., `abc123.netlify.app`)

### Step 5: Configure Domain (Optional, 5 minutes)

- Settings → Domain → Add custom domain
- Follow DNS instructions
- Netlify provides FREE SSL certificate automatically

**Total Time: 15 minutes**

---

## 🐳 Option 3: Docker & Docker Compose

For self-hosted or cloud VM deployment (AWS EC2, DigitalOcean, Linode, etc.)

### Prerequisites
- Docker & Docker Compose installed
- Linux server (Ubuntu 22.04 recommended)
- SSH access to server
- Domain name (optional but recommended)

### Step 1: Create Docker Configuration Files

**Create `Dockerfile` in project root:**

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy frontend files
COPY frontend/package*.json ./frontend/
COPY frontend/ ./frontend/

# Build frontend
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install Python for backend
RUN apk add --no-cache python3 py3-pip

# Copy backend
COPY app ./app
COPY requirements.txt .
COPY .env .

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy frontend build
COPY --from=builder /app/frontend/dist ./static

# Expose ports
EXPOSE 8000

# Run backend server
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Create `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: eka-ai-db
    environment:
      POSTGRES_DB: eka_ai
      POSTGRES_USER: ekaai
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  app:
    build: .
    container_name: eka-ai-app
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql+asyncpg://ekaai:${DB_PASSWORD}@db:5432/eka_ai
      SECRET_KEY: ${SECRET_KEY}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "8000:8000"
    volumes:
      - ./app:/app/app  # For development hot reload
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: eka-ai-nginx
    depends_on:
      - app
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl  # For SSL certificates
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped

volumes:
  postgres_data:
```

**Create `nginx.conf`:**

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server app:8000;
    }

    server {
        listen 80;
        server_name _;

        # Redirect to HTTPS
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Frontend (static files)
        location / {
            root /app/static;
            try_files $uri $uri/ /index.html;
        }

        # Backend API
        location /api/ {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Step 2: Prepare Environment Variables

```bash
# Create .env file with production values
cat > .env << EOF
DATABASE_URL=postgresql+asyncpg://ekaai:your-secure-password@db:5432/eka_ai
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
GEMINI_API_KEY=your-gemini-api-key
ENVIRONMENT=production
DEBUG=false
DB_PASSWORD=your-secure-password
EOF

chmod 600 .env
```

### Step 3: Deploy Using Docker Compose

```bash
# 1. Login to server
ssh user@your-server.com

# 2. Clone repository
cd /opt
git clone https://github.com/tanmayug24-alt/eka-ai-Auto-Intelligence-.git
cd eka-ai-Auto-Intelligence-

# 3. Create environment file
nano .env
# Paste your production environment variables and save

# 4. Build and start containers
docker-compose up -d --build

# 5. Run database migrations (if needed)
docker-compose exec app alembic upgrade head

# 6. Check status
docker-compose ps
# Should show 3 containers: db, app, nginx - all "Up"
```

### Step 4: Configure Domain & SSL

```bash
# 1. Get SSL certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot certonly --standalone -d your-domain.com

# 2. Copy certificates to nginx
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem

# 3. Restart nginx container
docker-compose restart nginx

# 4. Test HTTPS connection
curl https://your-domain.com
# Should return your frontend HTML
```

### Step 5: Verify Deployment

```bash
# Check logs
docker-compose logs -f app

# Test API endpoint
curl https://your-domain.com/api/v1/health

# Visit in browser
# https://your-domain.com
```

**Total Time: 20 minutes**

### Maintenance Commands

```bash
# View logs
docker-compose logs -f

# Stop containers
docker-compose stop

# Start containers
docker-compose start

# Restart containers
docker-compose restart

# Update to new version
git pull origin main
docker-compose up -d --build

# Backup database
docker-compose exec db pg_dump -U ekaai eka_ai > backup.sql

# Check container health
docker-compose ps
```

---

## ☁️ Option 4: AWS S3 + CloudFront

### Prerequisites
- AWS account
- AWS CLI installed and configured
- S3 bucket for frontend
- CloudFront distribution
- ACM certificate for HTTPS

### Step 1: Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://eka-ai-frontend --region us-east-1

# Enable static website hosting
aws s3 website s3://eka-ai-frontend/ \
  --index-document index.html \
  --error-document index.html

# Set bucket policy for public access
aws s3api put-bucket-policy --bucket eka-ai-frontend --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::eka-ai-frontend/*"
  }]
}'
```

### Step 2: Build Frontend

```bash
# Build production bundle
npm run build

# Output should be in frontend/dist
ls -la frontend/dist/
```

### Step 3: Upload to S3

```bash
# Upload all files
aws s3 sync frontend/dist/ s3://eka-ai-frontend/ --delete

# Verify upload
aws s3 ls s3://eka-ai-frontend/ --recursive
```

### Step 4: Create CloudFront Distribution

```bash
# Create distribution
aws cloudfront create-distribution \
  --origin-domain-name eka-ai-frontend.s3.amazonaws.com \
  --default-root-object index.html \
  --enabled \
  --default-cache-behavior ViewerProtocolPolicy=https-only,AllowedMethods=GET:HEAD,Compress=true,ForwardedValues=QueryString=false,Cookies={}

# This creates a CloudFront URL like: d123456.cloudfront.net
```

### Step 5: Configure Custom Domain (Optional)

```bash
# Request SSL certificate in ACM
aws acm request-certificate \
  --domain-name app.eka-ai.com \
  --subject-alternative-names www.app.eka-ai.com \
  --validation-method DNS

# Add Certificate ARN to CloudFront distribution
# Update distribution with custom domain and certificate
```

### Step 6: Update Route53 DNS

```bash
# Add CNAME record pointing to CloudFront
# CloudFront → Distribution Details → Copy Domain Name
# Route53 → Create CNAME record
# Name: app
# Value: d123456.cloudfront.net
```

**Total Time: 30 minutes**

### Future Deployments

```bash
# Build new version
npm run build

# Sync to S3 (replaces old files)
aws s3 sync frontend/dist/ s3://eka-ai-frontend/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E123456 \
  --paths "/*"
```

---

## ✅ Post-Deployment Verification

After deploying to any option, verify:

### 1. Health Check (2 minutes)

```bash
# Test frontend loads
curl https://your-domain.com/

# Test API health (backend only)
curl https://your-domain.com/api/v1/

# Check response code (should be 200)
```

### 2. Functional Testing (10 minutes)

Follow [FRONTEND_TESTING_EXECUTION_REPORT.md](FRONTEND_TESTING_EXECUTION_REPORT.md):

- [ ] Login page loads
- [ ] Login with test credentials works
- [ ] Dashboard loads with real data
- [ ] All pages accessible
- [ ] All features working

### 3. Browser Check (5 minutes)

```
1. Open browser F12 → Network tab
2. Reload page
3. Check network requests:
   - ✅ index.html loads (200)
   - ✅ JS bundles load (200)
   - ✅ CSS loads (200)
   - ✅ API calls succeed (200)
   - ❌ No 404/500 errors

4. Check Console:
   - ✅ No red errors
   - ⚠️ Warnings OK (yellow)

5. Check Application:
   - ✅ localStorage has tokens
   - ✅ User data persisted
```

### 4. Performance Check (5 minutes)

```bash
# Using Lighthouse (in Chrome DevTools)
1. F12 → Lighthouse tab
2. Click "Generate report"
3. Should see:
   - ✅ Performance: > 80
   - ✅ Accessibility: > 80
   - ✅ Best Practices: > 80
   - ✅ SEO: > 80
```

---

## 🔧 Monitoring & Maintenance

### Daily Checks

```bash
# Check service status
curl https://your-domain.com/

# Check logs for errors
docker logs -f <container-id>  # For Docker deployments

# Monitor CPU/Memory (Docker)
docker stats
```

### Weekly Maintenance

```bash
# Update dependencies
npm update
pip list --outdated

# Review logs for warnings
grep "WARNING" logs/

# Verify backups working
# For Docker: check database backups
```

### Monthly Tasks

```bash
# Update to latest versions (security patches)
npm outdated
pip list --outdated

# Review security advisories
npm audit

# Performance review
# Check response times
# Review error logs
```

### Deployment Rollback Procedures

**For Vercel:**
```
1. Go to Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click "Promote to Production"
```

**For Docker:**
```bash
# Keep previous Docker image
docker image ls

# Restart with previous image
docker stop <container>
docker rm <container>
docker run -d --name app previous-image-id
```

**For AWS/S3:**
```bash
# Keep previous S3 versions
aws s3 sync s3://eka-ai-frontend/ ./previous-version/ --delete

# Restore from backup
aws s3 sync ./previous-version/ s3://eka-ai-frontend/
```

---

## 🎯 Deployment Decision Matrix

**Choose Vercel if:**
- You want fastest deployment
- Global distribution needed
- Maximum uptime required
- Minimal infrastructure management
- Free tier acceptable

**Choose Docker if:**
- Full control needed
- Custom infrastructure
- Multiple services to manage
- Self-hosted VPS available
- Cost is concern

**Choose AWS if:**
- Enterprise-grade infrastructure
- Auto-scaling required
- Existing AWS account
- Complex infrastructure
- Large user base

---

## 📞 Deployment Troubleshooting

### Issue: API Returns 404

```
Problem: Frontend can't connect to backend
Solution:
1. Check REACT_APP_API_URL in environment variables
2. Verify backend is actually running
3. Check CORS configuration in backend
4. Verify firewall allows connections
```

### Issue: Blank White Screen

```
Problem: Frontend loads but no content
Solution:
1. Check F12 → Console for JavaScript errors
2. Check that build succeeded (npm run build)
3. Verify index.html deployed correctly
4. Clear browser cache (Ctrl+Shift+Delete)
```

### Issue: Login Not Working

```
Problem: Can't log in even with correct credentials
Solution:
1. Verify backend is running
2. Check database has test user
3. Verify JWT secrets configured
4. Check cookies/localStorage not blocked
```

---

## ✨ Deployment Complete!

After successful deployment:

1. **Announce Launch**
   - Update website/social media
   - Send team notification
   - Celebrate success! 🎉

2. **Monitor Closely** (First 24 hours)
   - Watch for errors in logs
   - Monitor user feedback
   - Track performance metrics

3. **Document Everything**
   - Record deployment time
   - Note any issues encountered
   - Update team documentation

---

**Date:** 2026-03-02
**Version:** 7.0.0
**Status:** Ready for Production Deployment

🚀 **CONGRATULATIONS! Your application is Production Ready!** 🚀
