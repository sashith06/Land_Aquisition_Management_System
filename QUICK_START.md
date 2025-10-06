# 🚀 LAMS - One-Click Startup Guide

## Quick Start (Easy Way)

### Windows Users
```bash
# Double-click or run in terminal:
start_lams.bat
```

### Linux/Mac Users  
```bash
# Make executable and run:
chmod +x start_lams.sh
./start_lams.sh
```

That's it! 🎉 The script automatically:
- ✅ Installs all dependencies
- ✅ Trains the AI model (first time)
- ✅ Starts all 3 services
- ✅ Opens your browser to http://localhost:5173

## 🔑 Login & Access AI Predictions

1. **Create Account** or **Login** at http://localhost:5173
2. **Role Required**: Chief Engineer or Project Engineer
3. **Access AI Predictions**:
   - Chief Engineer: Dashboard → "AI Cost Prediction" 
   - Project Engineer: Dashboard → "AI Cost Prediction"

## 💡 How AI Predictions Work

### New Improved Workflow:
1. **Select Project** → System automatically loads all project data
2. **Get Instant Prediction** → AI analyzes and predicts full cost
3. **View Results** → See cost analysis, confidence ranges, and insights

### No Manual Data Entry! 
- ✅ Project details auto-filled
- ✅ Plans/lots count auto-calculated  
- ✅ Location and district auto-detected
- ✅ Instant predictions with confidence ranges

## 🛠️ Manual Setup (If Needed)

If the auto-startup doesn't work:

```bash
# Terminal 1: AI API
cd ai_model
pip install -r requirements.txt
python train_land_model.py  # First time only
python predict_api.py       # Runs on port 5001

# Terminal 2: Backend
cd backend  
npm install  # First time only
npm start    # Runs on port 5000

# Terminal 3: Frontend
cd frontend
npm install  # First time only  
npm run dev  # Runs on port 5173
```

## 🎯 Features

- **🤖 AI Cost Prediction**: ML-powered project cost forecasting
- **👥 Role Management**: CE, PE, FO, LO with specific permissions
- **📊 Project Tracking**: Complete land acquisition workflow
- **💰 Financial Management**: Compensation and payment tracking
- **📈 Real-time Analytics**: Dashboard with live project status

## 🔧 Troubleshooting

### "AI Service Unavailable"
- Check that `python predict_api.py` is running in ai_model folder
- Install dependencies: `pip install -r requirements.txt`

### "No Projects Found"  
- Create projects first as Project Engineer
- Ensure you're logged in with CE or PE role

### Port Conflicts
- Default ports: 5000 (Backend), 5001 (AI API), 5173 (Frontend)
- Kill existing processes or change ports in config

## 📱 System Architecture

```
Frontend (React) :5173
    ↓
Backend (Node.js) :5000  
    ↓
AI API (Python Flask) :5001
    ↓
ML Model (RandomForest)
```

## 🎊 That's It!

Your LAMS system with AI cost prediction is ready to use! Select any project and get instant AI-powered cost predictions. 🚀