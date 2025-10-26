# Railway Environment Variables Configuration

## How to Add Variables in Railway:

1. Go to your Railway project dashboard
2. Click on your **backend service**
3. Go to **"Variables"** tab
4. Click **"+ New Variable"** button
5. Add each variable below one by one

---

## Variables to Add:

### Database Connection (Use Railway References)
```
DB_HOST = ${{MySQL.MYSQLHOST}}
DB_PORT = ${{MySQL.MYSQLPORT}}
DB_NAME = ${{MySQL.MYSQLDATABASE}}
DB_USER = ${{MySQL.MYSQLUSER}}
DB_PASS = ${{MySQL.MYSQLPASSWORD}}
```

### Application Configuration
```
PORT = 5000
NODE_ENV = production
JWT_SECRET = secretkey
FRONTEND_URL = http://localhost:3000
```

### Email Configuration (Gmail)
```
EMAIL_USER = lamsgr06@gmail.com
EMAIL_PASS = yvtj brli hkjy fsqa
```

### Gemini AI Configuration
```
GEMINI_API_KEY = AIzaSyC3ffGrtPDPx7lB3MmeIEfmaAip8sYUJMI
```

### Google Search Configuration (Optional)
```
GOOGLE_SEARCH_API_KEY = AIzaSyBVV7S25fIYAhQkTOSuz1tgJ7wXpx4tq0k
GOOGLE_SEARCH_CX = 750055035d50c49b9
```

### Twilio SMS Configuration
```
TWILIO_ACCOUNT_SID = your_twilio_account_sid
TWILIO_AUTH_TOKEN = your_twilio_auth_token
TWILIO_PHONE_NUMBER = +1234567890
```

---

## Copy-Paste Format (All Variables at Once)

If Railway allows bulk import, use this format:

```
DB_HOST="${{MySQL.MYSQLHOST}}"
DB_PORT="${{MySQL.MYSQLPORT}}"
DB_NAME="${{MySQL.MYSQLDATABASE}}"
DB_USER="${{MySQL.MYSQLUSER}}"
DB_PASS="${{MySQL.MYSQLPASSWORD}}"
PORT="5000"
NODE_ENV="production"
JWT_SECRET="secretkey"
FRONTEND_URL="http://localhost:3000"
EMAIL_USER="lamsgr06@gmail.com"
EMAIL_PASS="yvtj brli hkjy fsqa"
GEMINI_API_KEY="AIzaSyC3ffGrtPDPx7lB3MmeIEfmaAip8sYUJMI"
GOOGLE_SEARCH_API_KEY="AIzaSyBVV7S25fIYAhQkTOSuz1tgJ7wXpx4tq0k"
GOOGLE_SEARCH_CX="750055035d50c49b9"
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
```

---

## Important Notes:

1. **Railway References**: The `${{MySQL.VARIABLE}}` syntax automatically links to your MySQL service
2. **Security**: These variables are only stored in Railway's secure environment
3. **Auto-Deploy**: After adding variables, Railway will automatically redeploy your backend
4. **FRONTEND_URL**: Update this after deploying your frontend to Vercel

---

## Total Variables: 17

- 5 Database variables
- 4 Application variables  
- 2 Email variables
- 1 Gemini AI variable
- 2 Google Search variables
- 3 Twilio variables

---

## After Adding Variables:

1. Wait for automatic redeployment (1-2 minutes)
2. Check deployment logs for any errors
3. Verify backend is running by visiting your Railway URL
4. Proceed to Step 7: Import Database Schema
