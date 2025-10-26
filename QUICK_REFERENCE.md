# 🎯 Deployment Quick Reference Card

**Print this or keep it open while deploying!**

---

## 📱 Essential URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Railway | https://railway.app/dashboard | Backend + Database |
| Vercel | https://vercel.com/dashboard | Frontend |
| GitHub | https://github.com | Code repository |

---

## 🔑 Environment Variables

### Backend (Railway)
```env
✅ REQUIRED:
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASS=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}
PORT=5000
NODE_ENV=production
JWT_SECRET=[32+ character random string]
FRONTEND_URL=https://your-app.vercel.app

⚠️ OPTIONAL (for features):
EMAIL_USER=[email]
EMAIL_PASS=[app password]
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
TWILIO_ACCOUNT_SID=[twilio]
TWILIO_AUTH_TOKEN=[twilio]
TWILIO_PHONE_NUMBER=[twilio]
GEMINI_API_KEY=[google ai]
```

### Frontend (Vercel)
```env
✅ REQUIRED:
VITE_API_URL=https://your-app.up.railway.app
```

---

## ⚡ 5-Minute Deployment

```bash
# 1. Push to GitHub (1 min)
git add .
git commit -m "Deploy"
git push origin main

# 2. Railway Backend (2 min)
# - New Project → GitHub repo
# - Root: backend
# - Add MySQL
# - Set env vars
# - Import SQL

# 3. Vercel Frontend (1 min)
# - New Project → GitHub repo
# - Root: frontend
# - Set VITE_API_URL
# - Deploy

# 4. Connect (1 min)
# - Update FRONTEND_URL in Railway
# - Test!
```

---

## 🔧 Common Commands

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test Local Build
cd frontend && npm run build

# View Railway Logs
railway logs

# View Vercel Logs
vercel logs
```

---

## 🐛 Quick Fixes

| Problem | Fix |
|---------|-----|
| CORS Error | Update `FRONTEND_URL` in Railway |
| API Fails | Check `VITE_API_URL` in Vercel |
| 404 on Refresh | Ensure `vercel.json` exists |
| DB Error | Verify MySQL running in Railway |
| Build Fails | Test `npm run build` locally |

---

## ✅ Success Checklist

- [ ] Backend URL: `______________________`
- [ ] Frontend URL: `______________________`
- [ ] Login works
- [ ] No CORS errors
- [ ] No console errors
- [ ] Features working

---

## 🆘 Emergency

**Frontend broken?**
→ Vercel → Deployments → Rollback

**Backend broken?**
→ Railway → Deployments → Redeploy old version

**Need help?**
→ Open TROUBLESHOOTING.md

---

## 📊 Cost

- Vercel: **$0/month** (free)
- Railway: **$5-10/month**
- **Total: ~$5-10/month**

---

## 🎯 Deployment Order

```
1. Backend (Railway) → Get URL
2. Frontend (Vercel) → Use backend URL
3. Update Railway → Use frontend URL
4. Test → Celebrate! 🎉
```

---

**Time Needed**: 30-45 minutes  
**Difficulty**: ⭐⭐ (Easy with guide)  
**Full Guide**: DEPLOYMENT_GUIDE.md

---

## 📞 Support

- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- Docs: See README_DEPLOYMENT.md

---

**Last Updated**: October 26, 2025
