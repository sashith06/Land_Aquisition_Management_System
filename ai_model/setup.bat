@echo off
REM Land Acquisition AI Model Setup Script for Windows
REM This script sets up the AI prediction environment on Windows

echo 🚀 Setting up Land Acquisition AI Cost Prediction Model
echo ===========================================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

echo ✅ Python found
python --version

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is not installed. Please install pip and try again.
    pause
    exit /b 1
)

echo ✅ pip found
pip --version

REM Ask about virtual environment
set /p create_venv="🤔 Do you want to create a virtual environment? (recommended) [y/N]: "

if /i "%create_venv%"=="y" (
    echo 📦 Creating virtual environment...
    python -m venv ai_env
    
    REM Activate virtual environment
    call ai_env\Scripts\activate.bat
    
    echo ✅ Virtual environment created and activated
)

REM Install Python dependencies
echo 📥 Installing Python dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Check for Excel data files
echo 📊 Checking for Excel data files...

if exist "Land New format.xlsx" (
    echo ✅ Excel data files found
    set HAS_DATA=true
) else if exist "Wele Junction old Data Base.xlsx" (
    echo ✅ Excel data files found
    set HAS_DATA=true
) else (
    echo ⚠️  Excel data files not found
    echo    Place your Excel files in this directory:
    echo    - Land New format.xlsx
    echo    - Wele Junction old Data Base.xlsx
    echo    Or the script will create sample data for demonstration
    set HAS_DATA=false
)

REM Train the model
echo 🤖 Training the AI model...
python train_land_model.py

if errorlevel 1 (
    echo ❌ Model training failed
    pause
    exit /b 1
)

echo ✅ Model trained successfully

if exist "land_cost_model.pkl" (
    echo ✅ Model file created: land_cost_model.pkl
) else (
    echo ❌ Model file not created
    pause
    exit /b 1
)

REM Test the prediction API
echo 🧪 Testing prediction API...
python -c "import sys; sys.path.append('.'); from predict_api import load_model; exit(0 if load_model() else 1)"

if errorlevel 1 (
    echo ❌ Model failed to load in API
    pause
    exit /b 1
)

echo ✅ Model loads successfully in API

REM Ask about starting server
set /p start_server="🌐 Do you want to start the prediction API server now? [y/N]: "

if /i "%start_server%"=="y" (
    echo 🚀 Starting prediction API server...
    echo    Server will run at http://localhost:5000
    echo    Press Ctrl+C to stop the server
    echo.
    python predict_api.py
) else (
    echo.
    echo ✅ Setup completed successfully!
    echo.
    echo 📋 Next Steps:
    echo 1. Start the prediction API server:
    echo    python predict_api.py
    echo.
    echo 2. Start your LAMS backend server:
    echo    cd ..\backend && npm start
    echo.
    echo 3. Start your LAMS frontend:
    echo    cd ..\frontend && npm run dev
    echo.
    echo 4. Access AI Cost Prediction from:
    echo    - Chief Engineer Dashboard: /ce-dashboard/cost-prediction
    echo    - Project Engineer Dashboard: /pe-dashboard/cost-prediction
    echo.
    echo 🎉 AI Cost Prediction is ready to use!
    pause
)