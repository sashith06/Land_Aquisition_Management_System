@echo off
setlocal EnableDelayedExpansion

REM LAMS Auto-Startup Script for Windows
REM This script automatically starts all required services for the Land Acquisition Management System

echo 🚀 Starting Land Acquisition Management System (LAMS)
echo ======================================================

REM Create logs directory
if not exist "logs" mkdir logs

REM Check if we're in the right directory
if not exist "backend" (
    echo ❌ Please run this script from the LAMS root directory
    echo    Expected structure: backend/, frontend/, ai_model/
    pause
    exit /b 1
)

REM Step 1: Setup and start AI Prediction API
echo 🤖 Setting up AI Prediction Service...

if not exist "ai_model" (
    echo ❌ ai_model directory not found
    pause
    exit /b 1
)

cd ai_model

REM Check Python installation
C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python313\python.exe --version >nul 2>&1
if errorlevel 1 (
    py --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Python is not installed. Please install Python 3.8+ and try again.
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=py
    )
) else (
    set PYTHON_CMD=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python313\python.exe
)

echo ✅ Using Python
%PYTHON_CMD% --version

REM Install dependencies if requirements.txt exists
if exist "requirements.txt" (
    echo 📦 Installing Python dependencies...
    %PYTHON_CMD% -m pip install -r requirements.txt >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Python dependencies installed
    ) else (
        echo ⚠️  Some dependencies may have failed to install
    )
)

REM Train model if not exists
if not exist "land_cost_model.pkl" (
    echo 🔧 Training AI model ^(first time setup^)...
    %PYTHON_CMD% train_land_model.py
    if !errorlevel! equ 0 (
        echo ✅ AI model trained successfully
    ) else (
        echo ❌ Failed to train AI model
        pause
        exit /b 1
    )
) else (
    echo ✅ AI model already exists
)

REM Start AI API in background
echo 🔄 Starting AI Prediction API...
start "LAMS-AI-API" /min %PYTHON_CMD% predict_api.py
timeout /t 3 /nobreak >nul
echo ✅ AI Prediction API started on port 5001

cd ..

REM Step 2: Start Backend Server  
echo 🔧 Starting Backend Server...

if not exist "backend" (
    echo ❌ backend directory not found
    pause
    exit /b 1
)

cd backend

REM Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js and try again.
    pause
    exit /b 1
)

echo ✅ Using Node.js
node --version

REM Install dependencies if package.json exists
if exist "package.json" (
    if not exist "node_modules" (
        echo 📦 Installing Node.js dependencies...
        npm install >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✅ Node.js dependencies installed
        ) else (
            echo ❌ Failed to install Node.js dependencies
            pause
            exit /b 1
        )
    ) else (
        echo ✅ Node.js dependencies already installed
    )
)

REM Start backend in background
echo 🔄 Starting Backend Server...
start "LAMS-Backend" /min npm start
timeout /t 3 /nobreak >nul
echo ✅ Backend Server started on port 5000

cd ..

REM Step 3: Start Frontend Server
echo 🎨 Starting Frontend Server...

if not exist "frontend" (
    echo ❌ frontend directory not found
    pause
    exit /b 1
)

cd frontend

REM Install dependencies if package.json exists
if exist "package.json" (
    if not exist "node_modules" (
        echo 📦 Installing Frontend dependencies...
        npm install >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✅ Frontend dependencies installed
        ) else (
            echo ❌ Failed to install Frontend dependencies
            pause
            exit /b 1
        )
    ) else (
        echo ✅ Frontend dependencies already installed
    )
)

REM Start frontend in background
echo 🔄 Starting Frontend Server...
start "LAMS-Frontend" /min npm run dev
timeout /t 5 /nobreak >nul
echo ✅ Frontend Server started on port 5173

cd ..

REM Summary
echo.
echo 🎉 LAMS System Started Successfully!
echo =====================================
echo.
echo 📡 Services Running:
echo   🤖 AI Prediction API: http://localhost:5001
echo   🔧 Backend Server:    http://localhost:5000  
echo   🎨 Frontend App:      http://localhost:5173
echo.
echo 🌐 Access Your Application:
echo   👉 Open: http://localhost:5173
echo.
echo 📋 Available Features:
echo   ✅ User Authentication ^& Role Management
echo   ✅ Project ^& Plan Management
echo   ✅ Land Acquisition Tracking
echo   ✅ Financial Management
echo   ✅ AI Cost Prediction ^(CE ^& PE dashboards^)
echo.
echo 💡 Tip: AI Cost Prediction is available in:
echo    - Chief Engineer Dashboard → AI Cost Prediction
echo    - Project Engineer Dashboard → AI Cost Prediction
echo.
echo 🛑 To stop all services, close the terminal windows or use Task Manager
echo.

REM Open browser automatically
timeout /t 2 /nobreak >nul
echo 🌐 Opening browser...
start http://localhost:5173

echo 📝 All services are running in separate windows
echo 🔄 This window can be closed - services will continue running
echo.
pause