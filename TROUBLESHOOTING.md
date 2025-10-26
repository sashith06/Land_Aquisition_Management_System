# 🔧 Deployment Troubleshooting Guide

Quick solutions to common deployment issues for your Land Acquisition Management System.

---

## 🚨 Critical Issues

### 1. Backend Won't Start on Railway

#### Symptoms:
- Build succeeds but application crashes
- Railway logs show "Application failed to start"
- Error: "Cannot find module" or "ENOENT"

#### Solutions:

**A. Check package.json start script**
```json
{
  "scripts": {
    "start": "node server.js"  // ✅ Must point to your main file
  }
}
```

**B. Verify root directory in Railway**
- Go to Railway → Service Settings
- Root Directory should be: `backend`

**C. Check Railway logs**
```bash
# Install Railway CLI
npm i -g @railway/cli

# View logs
railway logs
```

**D. Verify all dependencies installed**
- Check `package.json` includes all required packages
- No dev dependencies used in production

---

### 2. Database Connection Errors

#### Symptoms:
- "ECONNREFUSED" error
- "Access denied for user"
- "Unknown database"
- Backend crashes on startup

#### Solutions:

**A. Verify MySQL service is running**
1. Go to Railway dashboard
2. Check MySQL service status (should be "Active")
3. If crashed, click "Restart"

**B. Check database environment variables**
```env
# Should reference Railway's MySQL service
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASS=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}
```

**C. Test database connection**
1. Click on MySQL service → "Connect"
2. Copy connection string
3. Test with MySQL client (TablePlus, MySQL Workbench)

**D. Import database schema**
```bash
# Connect to Railway MySQL
railway connect MySQL

# Then run your SQL file
source LAMS_COMPLETE_WAMPSERVER.sql
```

**E. Check connection timeout**
Edit `backend/config/db.js`:
```javascript
connectTimeout: 20000 // Increase to 20 seconds
```

---

### 3. CORS Errors

#### Symptoms:
- Browser console: "blocked by CORS policy"
- Frontend can't access backend API
- Network requests fail with CORS error

#### Solutions:

**A. Update FRONTEND_URL in Railway**
1. Go to Railway → Backend Service → Variables
2. Set `FRONTEND_URL` to your exact Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. ⚠️ **No trailing slash!**
4. Railway will auto-redeploy

**B. Verify CORS configuration in server.js**
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

**C. Clear browser cache**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear browser cache completely

**D. Check Railway logs**
Look for: `CORS blocked origin: https://...`
This tells you which origin is being blocked

---

### 4. Frontend Build Fails on Vercel

#### Symptoms:
- Vercel deployment fails
- Error during "Building" phase
- "Module not found" errors

#### Solutions:

**A. Test build locally first**
```bash
cd frontend
npm install
npm run build
```
Fix any errors shown locally before redeploying

**B. Check node version**
Vercel uses Node 18 by default. Add to `package.json`:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**C. Verify all dependencies**
```bash
# Install missing packages
npm install

# Check for peer dependency warnings
npm ls
```

**D. Check Vercel build logs**
1. Go to Vercel → Project → Deployments
2. Click failed deployment
3. View build logs for exact error

**E. Common fixes**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### 5. API Requests Fail (Frontend can't reach Backend)

#### Symptoms:
- Network errors in browser console
- "Failed to fetch" errors
- 404 or 500 errors on API calls

#### Solutions:

**A. Verify VITE_API_URL in Vercel**
1. Go to Vercel → Project → Settings → Environment Variables
2. Check `VITE_API_URL` is set correctly:
   ```
   VITE_API_URL=https://your-app.up.railway.app
   ```
3. ⚠️ **No trailing slash!**
4. Redeploy if changed

**B. Check api.js configuration**
```javascript
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
console.log('API Base URL:', BASE_URL); // Check browser console
```

**C. Test backend directly**
Visit in browser: `https://your-backend.railway.app/api/health`
Should return a response (not 404)

**D. Check Railway backend is running**
- Railway Dashboard → Backend Service
- Status should be "Active"
- Check logs for errors

**E. Verify network tab**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Reproduce the error
4. Check which URL is being called
5. Verify it matches your Railway URL

---

## ⚠️ Common Issues

### 6. 404 Errors on Page Refresh

#### Symptoms:
- Direct URLs work initially
- Refresh or bookmarked pages show 404
- Only homepage works

#### Solution:

**A. Add vercel.json**
Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**B. Redeploy**
```bash
git add frontend/vercel.json
git commit -m "Add Vercel SPA routing config"
git push origin main
```

---

### 7. Environment Variables Not Working

#### Symptoms:
- Variables show as undefined
- Features requiring API keys don't work
- Console logs show empty values

#### Solutions:

**A. Frontend (Vercel) - Must use VITE_ prefix**
```env
# ✅ Correct
VITE_API_URL=https://backend.railway.app

# ❌ Wrong
API_URL=https://backend.railway.app
```

**B. Access in code correctly**
```javascript
// ✅ Correct
const apiUrl = import.meta.env.VITE_API_URL

// ❌ Wrong (for Vite)
const apiUrl = process.env.VITE_API_URL
```

**C. Redeploy after adding variables**
- Vercel: Changes to env vars require redeployment
- Railway: Auto-redeploys after variable changes

**D. Check variable is set for all environments**
In Vercel:
- Check "Production", "Preview", and "Development" checkboxes

---

### 8. File Uploads Not Working

#### Symptoms:
- File upload returns error
- Files upload but not accessible
- 404 on uploaded file URLs

#### Solutions:

**A. Railway file storage**
Railway uses ephemeral storage. Files are lost on redeploy.

**Solution: Use external storage**
- AWS S3
- Cloudinary
- Railway Volumes (for persistence)

**B. Temporary fix (files lost on restart)**
Ensure uploads directory exists:
```javascript
const fs = require('fs');
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
```

**C. Update file serving**
```javascript
app.use('/uploads', express.static('uploads'));
```

**D. CORS for file access**
Ensure files are accessible from frontend domain

---

### 9. Authentication Issues

#### Symptoms:
- Login successful but immediately logs out
- "Unauthorized" errors
- Token not persisting

#### Solutions:

**A. Check JWT_SECRET is set**
Railway → Backend → Variables:
```env
JWT_SECRET=your-random-32-character-string
```

**B. Verify token storage**
```javascript
// Frontend should store token
localStorage.setItem('token', response.data.token);

// And send with requests
config.headers.Authorization = `Bearer ${token}`;
```

**C. Check token expiration**
Backend might be setting short expiration:
```javascript
// In backend auth controller
jwt.sign(payload, process.env.JWT_SECRET, { 
  expiresIn: '24h' // Increase if needed
});
```

**D. CORS credentials**
Both frontend and backend need:
```javascript
// Backend
app.use(cors({ credentials: true }));

// Frontend
axios.create({ 
  withCredentials: true 
});
```

---

### 10. Slow Performance

#### Symptoms:
- Slow page loads
- Delayed API responses
- Timeout errors

#### Solutions:

**A. Check Railway plan**
- Free tier has limited resources
- Consider upgrading to Hobby plan ($5/mo)

**B. Optimize database queries**
```sql
-- Add indexes to frequently queried columns
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_project_id ON lots(project_id);
```

**C. Enable Railway database connection pooling**
```javascript
const pool = mysql.createPool({
  connectionLimit: 10,
  queueLimit: 0
});
```

**D. Optimize frontend bundle**
Already done in vite.config.js with code splitting

---

## 🔍 Debugging Tools

### Railway CLI
```bash
# Install
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Open shell
railway shell
```

### Vercel CLI
```bash
# Install
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# View logs
vercel logs
```

### Browser DevTools
```javascript
// Check environment variables (Frontend)
console.log('API URL:', import.meta.env.VITE_API_URL);

// Check API calls (Frontend)
// Open DevTools → Network tab → Filter by "Fetch/XHR"

// Check console for errors
// DevTools → Console tab
```

---

## 📊 Health Checks

### Backend Health Check
Add to `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: db.state === 'authenticated' ? 'connected' : 'disconnected'
  });
});
```

Test: `https://your-backend.railway.app/health`

### Frontend Health Check
Add to `App.jsx`:
```javascript
useEffect(() => {
  console.log('Environment:', {
    apiUrl: import.meta.env.VITE_API_URL,
    mode: import.meta.env.MODE
  });
}, []);
```

---

## 🆘 Getting More Help

### Railway Support
1. Railway Dashboard → Help (bottom left)
2. Railway Discord: https://discord.gg/railway
3. Railway Docs: https://docs.railway.app

### Vercel Support
1. Vercel Dashboard → Support
2. Vercel Community: https://github.com/vercel/vercel/discussions
3. Vercel Docs: https://vercel.com/docs

### Check Logs First
Always check logs before asking for help:
- **Railway**: Project → Service → Logs
- **Vercel**: Project → Deployments → View Logs

### Provide This Information
When asking for help:
1. Exact error message
2. When it started happening
3. What you changed recently
4. Relevant logs (screenshot or paste)
5. Environment (Railway/Vercel)

---

## ✅ Prevention Checklist

Avoid issues by:
- [ ] Test builds locally before deploying
- [ ] Keep dependencies up to date
- [ ] Monitor resource usage
- [ ] Set up error tracking (Sentry)
- [ ] Regular database backups
- [ ] Document environment variables
- [ ] Use version control properly
- [ ] Test after each deployment

---

## 🔄 Emergency Rollback

If deployment breaks everything:

### Vercel Rollback
1. Go to Vercel → Project → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### Railway Rollback
1. Go to Railway → Service → Deployments
2. Find last working deployment
3. Click "Redeploy"

### Git Rollback
```bash
# Revert last commit
git revert HEAD

# Push
git push origin main
```

---

**Remember**: Most issues are due to:
1. Environment variables not set correctly
2. CORS misconfiguration
3. Incorrect URLs (trailing slashes, http vs https)
4. Database not imported

Check these first! 🔍
