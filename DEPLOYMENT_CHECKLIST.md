# ✅ Deployment Checklist - Land Acquisition Management System

## 📋 Pre-Deployment Setup

### Create Required Accounts
- [ ] GitHub Account - https://github.com/signup
- [ ] Railway Account - https://railway.app
- [ ] Vercel Account - https://vercel.com/signup
- [ ] Twilio Account (SMS) - https://www.twilio.com/try-twilio
- [ ] Google Gemini API Key - https://makersuite.google.com/app/apikey
- [ ] Email Service (Gmail App Password)

### Gather Required Information
- [ ] Twilio Account SID: `_______________________________`
- [ ] Twilio Auth Token: `_______________________________`
- [ ] Twilio Phone Number: `_______________________________`
- [ ] Gmail Address: `_______________________________`
- [ ] Gmail App Password: `_______________________________`
- [ ] Gemini API Key: `_______________________________`

---

## 🔧 Part 1: Backend Deployment (Railway)

### Step 1: Prepare Backend Code
- [ ] Verify `backend/package.json` has `"start": "node server.js"`
- [ ] Check `backend/.gitignore` exists
- [ ] Check `backend/.env.example` exists
- [ ] Verify CORS configuration updated in `server.js`

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```
- [ ] Code pushed to GitHub successfully

### Step 3: Create Railway Project
1. [ ] Go to https://railway.app/dashboard
2. [ ] Click "New Project"
3. [ ] Select "Deploy from GitHub repo"
4. [ ] Authorize Railway with GitHub
5. [ ] Select your repository
6. [ ] Select `main` branch

### Step 4: Configure Railway Backend
1. [ ] In project settings, set **Root Directory** to: `backend`
2. [ ] Verify build command is detected automatically

### Step 5: Add MySQL Database
1. [ ] Click "+ New" in Railway project
2. [ ] Select "Database" → "Add MySQL"
3. [ ] Wait for MySQL service to be ready
4. [ ] Note: Railway auto-creates MySQL environment variables

### Step 6: Set Backend Environment Variables

Go to Backend Service → Variables tab and add:

```env
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASS=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}
PORT=5000
NODE_ENV=production
```

- [ ] Database variables set

Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] JWT_SECRET=`_______________________________`
- [ ] FRONTEND_URL (leave blank for now, will update later)
- [ ] EMAIL_USER=`_______________________________`
- [ ] EMAIL_PASS=`_______________________________`
- [ ] EMAIL_HOST=smtp.gmail.com
- [ ] EMAIL_PORT=587
- [ ] TWILIO_ACCOUNT_SID=`_______________________________`
- [ ] TWILIO_AUTH_TOKEN=`_______________________________`
- [ ] TWILIO_PHONE_NUMBER=`_______________________________`
- [ ] GEMINI_API_KEY=`_______________________________`

### Step 7: Import Database Schema
1. [ ] Go to MySQL service in Railway
2. [ ] Click "Connect" tab
3. [ ] Copy MySQL Connection URL
4. [ ] Use MySQL client to connect
5. [ ] Import `LAMS_COMPLETE_WAMPSERVER.sql`
6. [ ] Verify tables created successfully

### Step 8: Deploy Backend
- [ ] Railway automatically deploys after configuration
- [ ] Check deployment logs for errors
- [ ] Copy Backend URL: `_______________________________`

### Step 9: Test Backend
- [ ] Visit backend URL in browser
- [ ] Backend should be accessible (may show "Cannot GET /")

---

## 🎨 Part 2: Frontend Deployment (Vercel)

### Step 10: Prepare Frontend Code

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.up.railway.app
```

- [ ] `.env.production` created
- [ ] Backend URL added to `.env.production`
- [ ] `frontend/vercel.json` exists (for SPA routing)
- [ ] `frontend/src/api.js` updated to use environment variable
- [ ] `frontend/.gitignore` exists

### Step 11: Test Local Build
```bash
cd frontend
npm install
npm run build
```
- [ ] Build successful (no errors)
- [ ] `dist` folder created

### Step 12: Push Frontend Changes
```bash
git add .
git commit -m "Configure frontend for production"
git push origin main
```
- [ ] Changes pushed to GitHub

### Step 13: Create Vercel Project
1. [ ] Go to https://vercel.com/dashboard
2. [ ] Click "Add New..." → "Project"
3. [ ] Select "Import Git Repository"
4. [ ] Choose your GitHub repository
5. [ ] Authorize Vercel with GitHub

### Step 14: Configure Vercel Project
- [ ] Framework Preset: **Vite**
- [ ] Root Directory: **frontend**
- [ ] Build Command: **npm run build** (auto-detected)
- [ ] Output Directory: **dist** (auto-detected)

### Step 15: Set Frontend Environment Variables

In Vercel → Environment Variables:
```
VITE_API_URL=https://your-backend-url.up.railway.app
```
- [ ] Environment variable added
- [ ] Set for all environments (Production, Preview, Development)

### Step 16: Deploy Frontend
- [ ] Click "Deploy"
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Copy Frontend URL: `_______________________________`

### Step 17: Test Frontend
- [ ] Visit frontend URL
- [ ] Page loads correctly
- [ ] No console errors

---

## ⚙️ Part 3: Connect Frontend & Backend

### Step 18: Update Backend CORS
1. [ ] Go to Railway → Backend Service → Variables
2. [ ] Update `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. [ ] Railway will automatically redeploy
4. [ ] Wait for redeployment to complete

### Step 19: Test Complete Application

**Test Authentication:**
- [ ] Visit frontend URL
- [ ] Try to register a new account
- [ ] Try to login
- [ ] Check if token is stored

**Test API Communication:**
- [ ] Open browser console (F12)
- [ ] Check Network tab
- [ ] API requests should return 200 status
- [ ] No CORS errors

**Test Main Features:**
- [ ] Create a project
- [ ] Upload files
- [ ] Send notifications
- [ ] Generate reports
- [ ] Test SMS (if configured)
- [ ] Test email (if configured)

---

## 🎉 Part 4: Post-Deployment

### Step 20: Configure Monitoring

**Railway:**
- [ ] Check deployment logs: Backend Service → Deployments
- [ ] Set up usage alerts if needed
- [ ] Note resource usage

**Vercel:**
- [ ] Check build logs: Project → Deployments
- [ ] Note bandwidth usage
- [ ] Check performance metrics

### Step 21: Optional - Custom Domains

**Vercel (Frontend):**
1. [ ] Go to Project Settings → Domains
2. [ ] Add custom domain
3. [ ] Update DNS records as instructed

**Railway (Backend):**
1. [ ] Go to Backend Service → Settings
2. [ ] Add custom domain
3. [ ] Update DNS records as instructed
4. [ ] Update `VITE_API_URL` in Vercel if domain changes

### Step 22: Set Up Automatic Deployments
- [ ] Verify Vercel auto-deploys on push to main branch
- [ ] Verify Railway auto-deploys on push to main branch
- [ ] Test by making a small change and pushing

### Step 23: Documentation
- [ ] Document deployment URLs in team wiki/docs
- [ ] Share credentials securely with team
- [ ] Document any custom configurations

---

## 🔍 Verification Checklist

### Backend Verification
- [ ] Backend URL accessible
- [ ] Database connected successfully
- [ ] No errors in Railway logs
- [ ] Environment variables set correctly
- [ ] API endpoints responding

### Frontend Verification
- [ ] Frontend URL accessible
- [ ] Page loads without errors
- [ ] API calls successful (check Network tab)
- [ ] No CORS errors
- [ ] Authentication works
- [ ] File uploads work

### Integration Verification
- [ ] Frontend can communicate with backend
- [ ] User registration works
- [ ] User login works
- [ ] Protected routes work
- [ ] File uploads complete successfully
- [ ] Email notifications sent (if configured)
- [ ] SMS notifications sent (if configured)
- [ ] Reports generate correctly

---

## 📝 Deployment Information

### URLs
- **Frontend (Vercel)**: `_______________________________`
- **Backend (Railway)**: `_______________________________`
- **Database**: Managed by Railway (internal)

### Costs (Estimated)
- **Vercel**: $0/month (Free tier: 100GB bandwidth)
- **Railway**: $5-10/month (Includes MySQL database)
- **Total**: ~$5-10/month

### Dashboards
- **Railway**: https://railway.app/dashboard
- **Vercel**: https://vercel.com/dashboard
- **GitHub**: https://github.com/YOUR_USERNAME/YOUR_REPO

---

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
**Symptom**: Console shows "blocked by CORS policy"
**Fix**: 
1. Verify `FRONTEND_URL` in Railway matches Vercel URL exactly
2. Check no trailing slash in URLs
3. Wait for Railway to redeploy after variable change

#### API Request Failures
**Symptom**: API calls fail with network errors
**Fix**:
1. Verify `VITE_API_URL` in Vercel is correct
2. Check backend is running (visit Railway URL)
3. Check Railway logs for errors

#### Database Connection Errors
**Symptom**: Backend logs show "Database connection failed"
**Fix**:
1. Verify MySQL service is running in Railway
2. Check database variables are set correctly
3. Verify tables were imported

#### Build Failures
**Symptom**: Vercel build fails
**Fix**:
1. Test `npm run build` locally
2. Check Vercel build logs
3. Verify all dependencies in package.json

#### 404 on Page Refresh
**Symptom**: Direct URLs or refresh shows 404
**Fix**:
1. Ensure `vercel.json` exists with rewrite rules
2. Redeploy frontend

---

## ✅ Final Checklist

- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Database imported and connected
- [ ] All environment variables set
- [ ] CORS configured correctly
- [ ] Authentication working
- [ ] API communication working
- [ ] Main features tested
- [ ] No console errors
- [ ] URLs documented
- [ ] Team notified

---

## 🎊 Success!

Congratulations! Your Land Acquisition Management System is now live!

### Next Steps:
1. Monitor application performance
2. Set up regular database backups
3. Review usage and costs monthly
4. Plan for scaling if needed
5. Collect user feedback
6. Iterate and improve

### Support:
- Full Guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Quick Start: [QUICK_START.md](./QUICK_START.md)
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: 1.0
