# 🚀 Quick Deployment Checklist

Use this checklist to deploy your Land Acquisition Management System quickly.

## ✅ Pre-Deployment Checklist

### 1. Accounts Setup
- [ ] Create GitHub account
- [ ] Create Railway account
- [ ] Create Vercel account
- [ ] Create Twilio account (for SMS)
- [ ] Get Google Gemini API key (for AI features)
- [ ] Set up email service (Gmail app password)

### 2. Code Preparation
- [ ] All code committed to Git
- [ ] `.gitignore` files in place
- [ ] Environment variable examples documented
- [ ] Database schema file ready (`LAMS_COMPLETE_WAMPSERVER.sql`)

---

## 🔧 Backend Deployment (Railway)

### Step-by-Step
1. [ ] Push code to GitHub
2. [ ] Create new Railway project
3. [ ] Connect GitHub repository
4. [ ] Set root directory to `backend`
5. [ ] Add MySQL database to project
6. [ ] Configure environment variables (see below)
7. [ ] Import database schema
8. [ ] Wait for deployment
9. [ ] Copy backend URL: `_____________________________`

### Environment Variables to Set
```
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASS=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}
PORT=5000
NODE_ENV=production
JWT_SECRET=[generate random string]
FRONTEND_URL=[will add after Vercel deployment]
EMAIL_USER=[your email]
EMAIL_PASS=[your email app password]
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
TWILIO_ACCOUNT_SID=[your Twilio SID]
TWILIO_AUTH_TOKEN=[your Twilio token]
TWILIO_PHONE_NUMBER=[your Twilio number]
GEMINI_API_KEY=[your Gemini key]
```

---

## 🎨 Frontend Deployment (Vercel)

### Step-by-Step
1. [ ] Create `.env.production` with backend URL
2. [ ] Update `api.js` to use environment variable
3. [ ] Test local build: `npm run build`
4. [ ] Push code to GitHub
5. [ ] Import project to Vercel
6. [ ] Set root directory to `frontend`
7. [ ] Set framework preset to `Vite`
8. [ ] Add environment variable: `VITE_API_URL`
9. [ ] Deploy
10. [ ] Copy frontend URL: `_____________________________`

### Environment Variables to Set
```
VITE_API_URL=[your Railway backend URL]
```

---

## ⚙️ Post-Deployment

1. [ ] Update Railway `FRONTEND_URL` with Vercel URL
2. [ ] Wait for Railway to redeploy
3. [ ] Test login functionality
4. [ ] Test API communication
5. [ ] Test file uploads
6. [ ] Test email notifications
7. [ ] Test SMS notifications
8. [ ] Test all main features

---

## 🔗 Your Deployment URLs

Fill these in after deployment:

- **Frontend (Vercel)**: `https://_____________________________.vercel.app`
- **Backend (Railway)**: `https://_____________________________.up.railway.app`
- **Database**: Managed by Railway (internal connection)

---

## 🛠️ Quick Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Backend Locally
```bash
cd backend
npm install
npm start
```

### Test Frontend Locally
```bash
cd frontend
npm install
npm run dev
```

### Build Frontend
```bash
cd frontend
npm run build
```

---

## 🐛 Common Issues & Fixes

### Issue: CORS Error
✅ **Fix**: Update `FRONTEND_URL` in Railway with exact Vercel URL

### Issue: Database Connection Failed
✅ **Fix**: Verify Railway MySQL service is running and variables are correct

### Issue: 404 on Refresh
✅ **Fix**: Ensure `vercel.json` is in frontend folder with rewrite rules

### Issue: API Requests Failing
✅ **Fix**: Check `VITE_API_URL` in Vercel matches Railway backend URL

### Issue: Build Failed
✅ **Fix**: Test `npm run build` locally first, check error logs

---

## 📞 Need Help?

1. Check logs:
   - Railway: Project → Service → Logs
   - Vercel: Project → Deployments → View Logs

2. Test connections:
   - Backend health: `https://your-backend.railway.app/api/health`
   - Frontend: `https://your-app.vercel.app`

3. Verify environment variables:
   - Railway: Project → Variables tab
   - Vercel: Project → Settings → Environment Variables

---

**Estimated Time**: 30-45 minutes for first deployment

**See full guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
