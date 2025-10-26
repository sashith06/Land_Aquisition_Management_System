# 🚀 Deployment Guide: Land Acquisition Management System

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Backend Deployment (Railway)](#backend-deployment-railway)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Environment Variables Reference](#environment-variables-reference)

---

## 🎯 Overview

This guide will walk you through deploying your **Land Acquisition Management System** with:
- **Frontend**: Vercel (React + Vite application)
- **Backend**: Railway (Node.js + Express API)
- **Database**: Railway MySQL (included with backend)

### Why These Platforms?

#### Why Vercel for Frontend?
- ✅ **Optimized for React/Vite**: Automatically detects and configures build settings
- ✅ **Global CDN**: Fast content delivery worldwide
- ✅ **Automatic HTTPS**: SSL certificates included
- ✅ **Easy Deployments**: Git integration for automatic deployments
- ✅ **Free Tier**: Generous free plan for small to medium projects
- ✅ **Zero Configuration**: Works out of the box

#### Why Railway for Backend?
- ✅ **Easy Setup**: Simple deployment process
- ✅ **Database Included**: Built-in MySQL database support
- ✅ **Environment Variables**: Secure credential management
- ✅ **Auto-scaling**: Handles traffic spikes automatically
- ✅ **Logs & Monitoring**: Built-in debugging tools
- ✅ **Reasonable Pricing**: $5/month starter plan

---

## 📦 Prerequisites

### Required Accounts
1. **GitHub Account** - To store your code
   - Sign up: https://github.com/signup
   - **Why?** Both Vercel and Railway deploy directly from Git repositories

2. **Vercel Account** - For frontend deployment
   - Sign up: https://vercel.com/signup
   - **Why?** This will host your React application

3. **Railway Account** - For backend deployment
   - Sign up: https://railway.app
   - **Why?** This will host your Node.js API and MySQL database

### Required Tools
- Git installed on your computer
- Your project code ready

### Required Services (for backend functionality)
- **Twilio Account** (for SMS notifications)
  - Sign up: https://www.twilio.com/try-twilio
- **Email Service** (Gmail/SMTP credentials)
- **Google Gemini API Key** (for AI features)
  - Get it from: https://makersuite.google.com/app/apikey

---

## 🔧 Backend Deployment (Railway)

### Step 1: Prepare Your Backend Code

**Why?** Railway needs specific configurations to run your Node.js application correctly.

#### 1.1 Create `.gitignore` file in backend folder

Create: `backend/.gitignore`

```gitignore
node_modules/
.env
uploads/
*.log
.DS_Store
```

**Why?** 
- Prevents uploading unnecessary files (node_modules is huge!)
- Protects sensitive data (.env contains secrets)
- Keeps repository clean

#### 1.2 Verify `package.json` start script

Open `backend/package.json` and ensure:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

**Why?** Railway uses the `start` script to launch your application.

#### 1.3 Update CORS Configuration

Edit `backend/server.js` to allow your Vercel domain:

```javascript
// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Why?** 
- Allows your frontend to communicate with backend
- Prevents CORS (Cross-Origin Resource Sharing) errors
- Uses environment variable for flexibility

### Step 2: Push Code to GitHub

**Why?** Railway deploys directly from GitHub repositories.

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare for deployment"

# Create repository on GitHub (via web interface)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy Backend on Railway

#### 3.1 Create New Project

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. **Why?** Railway monitors your GitHub repo and auto-deploys on code changes

#### 3.2 Select Repository

1. Authorize Railway to access your GitHub
2. Select your repository
3. Select the **main** branch
4. **Why?** Railway needs permission to read your code

#### 3.3 Configure Root Directory

1. In project settings, set **Root Directory** to `backend`
2. **Why?** Your backend code is in a subdirectory, not the root

#### 3.4 Add MySQL Database

1. Click **"+ New"** in your project
2. Select **"Database"** → **"Add MySQL"**
3. **Why?** Your app needs a database; Railway provides managed MySQL

**Important:** Railway will automatically create these environment variables:
- `MYSQL_URL`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

### Step 4: Configure Environment Variables

**Why?** Your app needs API keys, database credentials, and configuration settings.

In Railway dashboard, go to your backend service → **Variables** tab:

```env
# Database (use Railway's provided variables or custom)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASS=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# Frontend URL (add after deploying frontend)
FRONTEND_URL=https://your-app.vercel.app

# Email Configuration (Gmail example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
```

**Important Notes:**
- `${{MySQL.MYSQL_HOST}}` references Railway's MySQL service variables
- Generate JWT_SECRET: Use a random string generator or run in terminal:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### Step 5: Initialize Database

**Why?** Your database needs tables and initial data.

#### 5.1 Connect to Railway MySQL

1. In Railway dashboard, click on **MySQL service**
2. Go to **"Connect"** tab
3. Copy the **MySQL Connection URL**
4. Use a MySQL client (TablePlus, MySQL Workbench, or Railway CLI)

#### 5.2 Import Database Schema

Run your SQL file:

```bash
# Using Railway CLI
railway connect MySQL
# Then paste your SQL schema

# Or upload via MySQL client using the connection URL
```

Import `LAMS_COMPLETE_WAMPSERVER.sql` file.

**Why?** Creates all necessary tables, relationships, and initial data.

### Step 6: Deploy Backend

1. Railway automatically deploys after configuration
2. Wait for build to complete (check logs)
3. Copy your **backend URL** (e.g., `https://your-app.up.railway.app`)

**Why?** Your frontend needs this URL to make API calls.

### Step 7: Test Backend

Visit: `https://your-backend-url.up.railway.app/api/auth/health` (if you have a health endpoint)

**Why?** Confirms backend is running correctly.

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend Code

**Why?** Frontend needs to know where your backend API is located.

#### 1.1 Create `.env.production` file in frontend folder

Create: `frontend/.env.production`

```env
VITE_API_URL=https://your-backend-url.up.railway.app
```

**Why?**
- Vite uses `VITE_` prefix for environment variables
- `.env.production` is used for production builds
- Keeps backend URL configurable

#### 1.2 Update API Configuration

Edit `frontend/src/api.js`:

```javascript
import axios from "axios";
import { logout } from "./utils/auth";

// Use environment variable or fallback to localhost
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ✅ Create a general API instance for all endpoints
const api = axios.create({
  baseURL: BASE_URL,
});

// ✅ Use /api/auth since backend is mounted there  
const API = axios.create({
  baseURL: `${BASE_URL}/api/auth`,
});

// Rest of your code...
```

**Why?**
- `import.meta.env.VITE_API_URL` reads the environment variable
- Falls back to localhost for development
- Single place to update API URL

#### 1.3 Create `.gitignore` in frontend folder

Create: `frontend/.gitignore`

```gitignore
node_modules/
dist/
.env
.env.local
.env.production
.DS_Store
```

**Why?** Prevents uploading build files and environment variables.

### Step 2: Test Local Build

**Why?** Ensures your app builds successfully before deploying.

```bash
cd frontend
npm install
npm run build
```

If successful, you'll see a `dist` folder created.

### Step 3: Push Frontend Code to GitHub

If you haven't already pushed frontend changes:

```bash
git add .
git commit -m "Configure frontend for production"
git push
```

### Step 4: Deploy to Vercel

#### 4.1 Import Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub repository

**Why?** Vercel needs access to your code to build and deploy.

#### 4.2 Configure Project

**Framework Preset:** Vite  
**Root Directory:** `frontend`  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  

**Why?**
- Vercel needs to know which framework you're using
- Must build from the frontend subfolder
- Vite outputs to `dist` folder

#### 4.3 Add Environment Variables

In Vercel project settings → **Environment Variables**:

```
VITE_API_URL=https://your-backend-url.up.railway.app
```

**Why?** Your frontend needs to know where to send API requests.

#### 4.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Copy your **Vercel URL** (e.g., `https://your-app.vercel.app`)

**Why?** Vercel builds and deploys your React application to their global CDN.

### Step 5: Update Backend CORS

**Why?** Backend needs to allow requests from your Vercel domain.

1. Go to Railway dashboard
2. Update `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Railway will automatically redeploy

**Why?** Prevents CORS errors when frontend calls backend API.

---

## ⚙️ Post-Deployment Configuration

### Step 1: Test Complete Flow

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try logging in
3. Test main features

**Why?** Ensures frontend and backend communicate correctly.

### Step 2: Configure Custom Domain (Optional)

#### On Vercel:
1. Go to Project Settings → **Domains**
2. Add your custom domain
3. Update DNS records (as instructed by Vercel)

#### On Railway:
1. Go to your backend service → **Settings**
2. Add custom domain
3. Update DNS records

**Why?** Professional appearance and easier to remember.

### Step 3: Set Up Monitoring

#### Railway:
- Check **"Deployments"** tab for logs
- Set up usage alerts

#### Vercel:
- Check **"Deployments"** tab for build logs
- Monitor bandwidth usage

**Why?** Catch errors early and stay within free tier limits.

### Step 4: Configure Automatic Deployments

Both platforms auto-deploy on Git push by default.

**Why?** 
- Push to GitHub → automatic deployment
- No manual deployment needed
- Always in sync with your code

---

## 🐛 Troubleshooting

### Backend Issues

#### Problem: "Cannot connect to database"
**Solution:**
1. Check Railway MySQL service is running
2. Verify environment variables in Railway
3. Check logs: Railway Dashboard → Backend Service → Logs

**Why?** Database connection failures are common during initial setup.

#### Problem: "Internal Server Error 500"
**Solution:**
1. Check Railway logs for error details
2. Verify all environment variables are set
3. Ensure database tables exist

#### Problem: "CORS Error"
**Solution:**
1. Verify `FRONTEND_URL` in Railway matches your Vercel URL
2. Check CORS configuration in `server.js`
3. Ensure credentials: true is set

**Why?** CORS blocks cross-origin requests by default.

### Frontend Issues

#### Problem: "API request failed"
**Solution:**
1. Check `VITE_API_URL` in Vercel environment variables
2. Verify backend URL is correct and accessible
3. Check browser console for exact error

#### Problem: "Build failed on Vercel"
**Solution:**
1. Check Vercel deployment logs
2. Ensure `npm run build` works locally
3. Verify all dependencies in `package.json`

**Why?** Build errors often indicate missing dependencies or code issues.

#### Problem: "404 on refresh"
**Solution:**
Add `vercel.json` in frontend folder:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Why?** SPAs (Single Page Applications) need to redirect all routes to index.html.

### Database Issues

#### Problem: "Table doesn't exist"
**Solution:**
1. Connect to Railway MySQL
2. Import `LAMS_COMPLETE_WAMPSERVER.sql`
3. Verify tables exist

#### Problem: "Connection timeout"
**Solution:**
1. Check Railway MySQL is running
2. Increase `connectTimeout` in `db.js`
3. Verify network connectivity

---

## 📝 Environment Variables Reference

### Backend (Railway)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | Database host | `${MySQL.MYSQL_HOST}` | ✅ Yes |
| `DB_USER` | Database user | `${MySQL.MYSQL_USER}` | ✅ Yes |
| `DB_PASS` | Database password | `${MySQL.MYSQL_PASSWORD}` | ✅ Yes |
| `DB_NAME` | Database name | `${MySQL.MYSQL_DATABASE}` | ✅ Yes |
| `DB_PORT` | Database port | `${MySQL.MYSQL_PORT}` | ✅ Yes |
| `PORT` | Server port | `5000` | ✅ Yes |
| `JWT_SECRET` | JWT signing key | Random 32+ char string | ✅ Yes |
| `FRONTEND_URL` | Frontend URL | `https://app.vercel.app` | ✅ Yes |
| `EMAIL_USER` | Email username | `your@email.com` | ⚠️ For email |
| `EMAIL_PASS` | Email password | App-specific password | ⚠️ For email |
| `TWILIO_ACCOUNT_SID` | Twilio SID | From Twilio dashboard | ⚠️ For SMS |
| `TWILIO_AUTH_TOKEN` | Twilio token | From Twilio dashboard | ⚠️ For SMS |
| `GEMINI_API_KEY` | Google AI key | From Google AI Studio | ⚠️ For AI |

### Frontend (Vercel)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `https://api.railway.app` | ✅ Yes |

---

## 🎉 Congratulations!

Your Land Acquisition Management System is now live!

### What You've Achieved:
✅ Backend API running on Railway  
✅ MySQL database hosted and configured  
✅ Frontend React app on Vercel  
✅ Secure HTTPS connections  
✅ Automatic deployments on Git push  
✅ Environment variables configured  
✅ CORS properly set up  

### Next Steps:
1. **Test thoroughly** - Try all features in production
2. **Monitor usage** - Check Railway and Vercel dashboards
3. **Set up backups** - Schedule database backups
4. **Add custom domain** - For professional appearance
5. **Configure CDN** - Already done with Vercel!
6. **Set up error tracking** - Consider Sentry or LogRocket

### Useful Links:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`
- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard

### Cost Breakdown:
- **Vercel Free Tier**: $0/month (100GB bandwidth, unlimited projects)
- **Railway**: ~$5-10/month (500 hours execution, includes MySQL)
- **Total**: ~$5-10/month

---

## 📞 Support & Resources

### Railway Documentation
- Getting Started: https://docs.railway.app/getting-started
- MySQL Guide: https://docs.railway.app/databases/mysql
- Environment Variables: https://docs.railway.app/develop/variables

### Vercel Documentation
- Getting Started: https://vercel.com/docs
- Environment Variables: https://vercel.com/docs/environment-variables
- Custom Domains: https://vercel.com/docs/custom-domains

### Common Commands

```bash
# Railway CLI
npm i -g @railway/cli
railway login
railway link
railway logs

# Vercel CLI
npm i -g vercel
vercel login
vercel --prod

# Git commands
git add .
git commit -m "Update"
git push
```

---

**Last Updated:** October 26, 2025  
**Version:** 1.0  
**Project:** Land Acquisition Management System
