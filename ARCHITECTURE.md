# 🏗️ Deployment Architecture

## 📊 System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        👥 END USERS                               │
│                    (Web Browsers)                                 │
└────────────────┬────────────────────────┬────────────────────────┘
                 │                        │
                 │ HTTPS                  │ HTTPS
                 │                        │
     ┌───────────▼──────────┐   ┌─────────▼──────────┐
     │   VERCEL CDN         │   │   RAILWAY API      │
     │   (Frontend)         │   │   (Backend)        │
     │                      │   │                    │
     │  ┌────────────────┐  │   │  ┌──────────────┐ │
     │  │  React + Vite  │  │───────│ Node.js +    │ │
     │  │  Components    │  │   │  │ Express.js   │ │
     │  └────────────────┘  │   │  └──────┬───────┘ │
     │                      │   │         │         │
     │  Environment Vars:   │   │         │         │
     │  • VITE_API_URL      │   │  Environment Vars: │
     │                      │   │  • DB_HOST         │
     └──────────────────────┘   │  • DB_USER         │
                                │  • DB_PASS         │
                                │  • JWT_SECRET      │
                                │  • FRONTEND_URL    │
                                │  • EMAIL_*         │
                                │  • TWILIO_*        │
                                │  • GEMINI_API_KEY  │
                                └─────────┬──────────┘
                                          │
                                          │ MySQL Connection
                                          │
                                ┌─────────▼──────────┐
                                │  RAILWAY MySQL     │
                                │   (Database)       │
                                │                    │
                                │  ┌──────────────┐  │
                                │  │   Tables:    │  │
                                │  │  • users     │  │
                                │  │  • projects  │  │
                                │  │  • lots      │  │
                                │  │  • plans     │  │
                                │  │  • ...more   │  │
                                │  └──────────────┘  │
                                └────────────────────┘

External Services (Optional):
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Twilio    │  │    Gmail     │  │Google Gemini │
│     SMS      │  │    Email     │  │      AI      │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🔄 Data Flow

### 1. User Login Flow
```
User Browser
    │
    │ 1. POST /api/auth/login
    │    { email, password }
    ▼
Vercel Frontend
    │
    │ 2. Forward to Backend
    ▼
Railway Backend
    │
    │ 3. Verify credentials
    ▼
MySQL Database
    │
    │ 4. Return user data
    ▼
Railway Backend
    │
    │ 5. Generate JWT token
    │ 6. Return { token, user }
    ▼
Vercel Frontend
    │
    │ 7. Store token in localStorage
    │ 8. Redirect to dashboard
    ▼
User sees Dashboard
```

### 2. API Request Flow
```
User Action (e.g., Create Project)
    │
    ▼
Frontend Component
    │
    │ 1. Get token from localStorage
    │ 2. Make API call with token
    ▼
api.js (Axios)
    │
    │ 3. Add Authorization header
    │    "Bearer <token>"
    ▼
Railway Backend
    │
    │ 4. Verify JWT token
    ▼
authMiddleware.js
    │
    │ 5. Check permissions
    ▼
Controller (e.g., projectController.js)
    │
    │ 6. Execute business logic
    ▼
MySQL Database
    │
    │ 7. Query/Insert/Update
    │ 8. Return data
    ▼
Railway Backend
    │
    │ 9. Format response
    │ 10. Send JSON
    ▼
Frontend
    │
    │ 11. Update UI
    ▼
User sees result
```

---

## 🌐 Network Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Internet Layer                         │
└─────────────┬───────────────────────────┬───────────────┘
              │                           │
              │                           │
    ┌─────────▼─────────┐       ┌─────────▼─────────┐
    │  Vercel Edge      │       │  Railway Edge     │
    │  Network          │       │  Network          │
    │  (Global CDN)     │       │  (US/EU)          │
    └─────────┬─────────┘       └─────────┬─────────┘
              │                           │
    ┌─────────▼─────────┐       ┌─────────▼─────────┐
    │  Static Assets    │       │  Application      │
    │  - HTML           │       │  - Node.js        │
    │  - CSS            │       │  - Express        │
    │  - JavaScript     │       │  - APIs           │
    │  - Images         │       └─────────┬─────────┘
    └───────────────────┘                 │
                                ┌─────────▼─────────┐
                                │  Private Network  │
                                │  - MySQL          │
                                │  - Internal Only  │
                                └───────────────────┘
```

---

## 🔐 Security Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Security Layers                      │
└──────────────────────────────────────────────────────┘

Layer 1: Transport Security
┌────────────────────────────────────────┐
│  • HTTPS Only (SSL/TLS)                │
│  • Automatic certificates (Vercel)     │
│  • Encrypted data transmission         │
└────────────────────────────────────────┘

Layer 2: Authentication
┌────────────────────────────────────────┐
│  • JWT tokens                          │
│  • Token expiration                    │
│  • Secure password hashing (bcrypt)    │
└────────────────────────────────────────┘

Layer 3: Authorization
┌────────────────────────────────────────┐
│  • Role-based access control           │
│  • Permission middleware               │
│  • Route protection                    │
└────────────────────────────────────────┘

Layer 4: Application Security
┌────────────────────────────────────────┐
│  • CORS configuration                  │
│  • Input validation                    │
│  • SQL injection prevention            │
│  • XSS protection                      │
└────────────────────────────────────────┘

Layer 5: Infrastructure Security
┌────────────────────────────────────────┐
│  • Environment variables (secrets)     │
│  • Private database network            │
│  • No exposed credentials              │
└────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Overview

```
┌─────────────────────────────────────────────────────┐
│                    MySQL Database                    │
└─────────────────────────────────────────────────────┘

Core Tables:
┌──────────┐     ┌──────────┐     ┌──────────┐
│  users   │────▶│ projects │────▶│  plans   │
└──────────┘     └──────────┘     └──────────┘
     │                                   │
     │ role                              │
     │ permissions                       │
     ▼                                   ▼
┌──────────┐                       ┌──────────┐
│  roles   │                       │   lots   │
└──────────┘                       └──────────┘
                                        │
                                        │
                                        ▼
                              ┌──────────────────┐
                              │  landowners      │
                              └──────────────────┘
                                        │
                                        │
                              ┌─────────▼─────────┐
                              │  compensation     │
                              └───────────────────┘

Supporting Tables:
• notifications
• messages
• assignments
• valuations
• progress_tracking
• inquiries
```

---

## 🔄 Deployment Pipeline

```
Developer Makes Changes
        │
        │ 1. Edit code locally
        │ 2. Test locally
        ▼
Git Commit & Push
        │
        │ git push origin main
        ▼
┌───────────────────────────────────────┐
│          GitHub Repository             │
│  (Single source of truth)             │
└───────┬───────────────────┬───────────┘
        │                   │
        │                   │
        │ Webhook           │ Webhook
        │                   │
┌───────▼─────────┐   ┌─────▼───────────┐
│  Vercel Build   │   │ Railway Build   │
│  Server         │   │ Server          │
│                 │   │                 │
│  1. npm install │   │ 1. npm install  │
│  2. npm build   │   │ 2. npm start    │
│  3. Deploy CDN  │   │ 3. Deploy API   │
└───────┬─────────┘   └─────┬───────────┘
        │                   │
        │ Success           │ Success
        │                   │
┌───────▼─────────┐   ┌─────▼───────────┐
│  Production     │   │  Production     │
│  Frontend       │   │  Backend        │
│  (Live)         │   │  (Live)         │
└─────────────────┘   └─────────────────┘
        │                   │
        └────────┬──────────┘
                 │
                 ▼
        Application Updated
        (Automatic)
```

---

## 💾 Storage Architecture

```
Frontend (Vercel):
┌─────────────────────────────────────┐
│  Static Files                       │
│  • HTML, CSS, JS (built assets)     │
│  • Cached globally on CDN           │
│  • No server-side storage needed    │
└─────────────────────────────────────┘

Backend (Railway):
┌─────────────────────────────────────┐
│  Ephemeral Storage                  │
│  • /uploads folder (temporary)      │
│  • ⚠️ Lost on restart/redeploy      │
│  • Use external storage for         │
│    permanent files (S3, Cloudinary) │
└─────────────────────────────────────┘

Database (Railway MySQL):
┌─────────────────────────────────────┐
│  Persistent Storage                 │
│  • All database data                │
│  • Survives restarts                │
│  • ✅ Permanent storage              │
└─────────────────────────────────────┘
```

---

## 🌍 Geographic Distribution

```
User in Asia          User in Europe        User in Americas
     │                     │                      │
     │                     │                      │
     ▼                     ▼                      ▼
┌─────────┐          ┌─────────┐           ┌─────────┐
│ Vercel  │          │ Vercel  │           │ Vercel  │
│ Edge    │          │ Edge    │           │ Edge    │
│ (Tokyo) │          │ Edge    │           │ (US)    │
└────┬────┘          │(Frankfurt)          └────┬────┘
     │               └────┬────┘                 │
     │                    │                      │
     └────────────────────┼──────────────────────┘
                          │
                    (Fastest route)
                          │
                          ▼
                  ┌───────────────┐
                  │  Railway API  │
                  │  (US/EU)      │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │     MySQL     │
                  │   Database    │
                  └───────────────┘

Frontend: Global CDN (fast everywhere)
Backend: Centralized (one region)
```

---

## 🔧 Component Interaction

```
┌──────────────────────────────────────────────────────────┐
│                     Frontend (React)                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Pages    │  │ Components │  │   Utils    │        │
│  │ (Routes)   │  │   (UI)     │  │  (Helpers) │        │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │
│        │               │               │                │
│        └───────────────┼───────────────┘                │
│                        │                                │
│                   ┌────▼────┐                           │
│                   │  api.js │                           │
│                   │ (Axios) │                           │
│                   └────┬────┘                           │
└────────────────────────┼──────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
┌────────────────────────▼──────────────────────────────┐
│                  Backend (Express)                     │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐    ┌────────────┐    ┌──────────┐      │
│  │  Routes  │───▶│Middleware  │───▶│Controllers│      │
│  └──────────┘    │• Auth      │    └─────┬─────┘      │
│                  │• CORS      │          │            │
│                  │• Upload    │          │            │
│                  └────────────┘          │            │
│                                          │            │
│                                    ┌─────▼─────┐      │
│                                    │  Models   │      │
│                                    │(DB Logic) │      │
│                                    └─────┬─────┘      │
└──────────────────────────────────────────┼────────────┘
                                           │
                                           │ SQL Queries
                                           │
                                    ┌──────▼──────┐
                                    │   MySQL     │
                                    │  Database   │
                                    └─────────────┘
```

---

## 📈 Scaling Architecture

```
Current Setup (Small Scale):
┌─────────────┐       ┌─────────────┐
│   Vercel    │       │   Railway   │
│  Frontend   │───────│   Backend   │
│             │       │      +      │
│             │       │   MySQL     │
└─────────────┘       └─────────────┘

Cost: ~$5-10/month
Users: Up to 10,000/month


Future Growth (Medium Scale):
┌─────────────┐       ┌─────────────┐
│   Vercel    │       │   Railway   │
│  Frontend   │───────│   Backend   │
│             │       │  (Multiple  │
│             │       │  Instances) │
└─────────────┘       └──────┬──────┘
                             │
                      ┌──────▼──────┐
                      │ Railway DB  │
                      │   (MySQL)   │
                      └─────────────┘

Cost: ~$20-50/month
Users: Up to 100,000/month


Enterprise Scale:
┌─────────────┐       ┌─────────────────┐
│   Vercel    │       │ Load Balancer   │
│  Frontend   │───────│                 │
│  (Pro)      │       └────────┬────────┘
└─────────────┘                │
                    ┌──────────┼──────────┐
                    │          │          │
            ┌───────▼───┐ ┌────▼────┐ ┌──▼───────┐
            │Backend #1 │ │Backend #2│ │Backend #3│
            └─────┬─────┘ └────┬─────┘ └────┬─────┘
                  │            │            │
                  └──────────┬─┴────────────┘
                             │
                      ┌──────▼──────┐
                      │   MySQL     │
                      │  (Cluster)  │
                      └─────────────┘

Cost: $500+/month
Users: Millions/month
```

---

## 🎯 Key Architectural Decisions

### Why Vercel for Frontend?
✅ **Global CDN** - Fast loading worldwide  
✅ **Auto-scaling** - Handles traffic spikes  
✅ **Zero config** - Works out of the box  
✅ **Free tier** - Good for starting  

### Why Railway for Backend?
✅ **Integrated DB** - MySQL included  
✅ **Simple deploy** - Git-based  
✅ **Fair pricing** - Pay for what you use  
✅ **Good DX** - Developer-friendly  

### Why MySQL?
✅ **Relational** - Complex data relationships  
✅ **ACID** - Data integrity  
✅ **Mature** - Well-tested  
✅ **Railway native** - Easy integration  

---

## 🔄 Environment Separation

```
Development:
┌───────────────────┐       ┌───────────────────┐
│  localhost:5173   │       │  localhost:5000   │
│  (Frontend Dev)   │───────│  (Backend Dev)    │
└───────────────────┘       └────────┬──────────┘
                                     │
                            ┌────────▼──────────┐
                            │  Local MySQL      │
                            │  (WAMP/XAMPP)     │
                            └───────────────────┘


Production:
┌───────────────────┐       ┌───────────────────┐
│  your-app         │       │  your-app         │
│  .vercel.app      │───────│  .railway.app     │
│  (Frontend Prod)  │       │  (Backend Prod)   │
└───────────────────┘       └────────┬──────────┘
                                     │
                            ┌────────▼──────────┐
                            │  Railway MySQL    │
                            │  (Production DB)  │
                            └───────────────────┘
```

---

This architecture provides:
- ✅ High availability
- ✅ Good performance
- ✅ Easy maintenance
- ✅ Cost-effective
- ✅ Scalable
