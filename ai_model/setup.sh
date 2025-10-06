#!/bin/bash

# Land Acquisition AI Model Setup Script
# This script sets up the AI prediction environment

echo "🚀 Setting up Land Acquisition AI Cost Prediction Model"
echo "==========================================================="

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

echo "✅ Python found: $(python --version)"

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip and try again."
    exit 1
fi

echo "✅ pip found: $(pip --version)"

# Create and activate virtual environment (optional but recommended)
read -p "🤔 Do you want to create a virtual environment? (recommended) [y/N]: " create_venv

if [[ $create_venv =~ ^[Yy]$ ]]; then
    echo "📦 Creating virtual environment..."
    python -m venv ai_env
    
    # Activate virtual environment
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        source ai_env/Scripts/activate
    else
        source ai_env/bin/activate
    fi
    
    echo "✅ Virtual environment created and activated"
fi

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check for Excel data files
echo "📊 Checking for Excel data files..."

if [ -f "Land New format.xlsx" ] || [ -f "Wele Junction old Data Base.xlsx" ]; then
    echo "✅ Excel data files found"
    HAS_DATA=true
else
    echo "⚠️  Excel data files not found"
    echo "   Place your Excel files in this directory:"
    echo "   - Land New format.xlsx"
    echo "   - Wele Junction old Data Base.xlsx"
    echo "   Or the script will create sample data for demonstration"
    HAS_DATA=false
fi

# Train the model
echo "🤖 Training the AI model..."
python train_land_model.py

if [ $? -eq 0 ]; then
    echo "✅ Model trained successfully"
    if [ -f "land_cost_model.pkl" ]; then
        echo "✅ Model file created: land_cost_model.pkl"
    else
        echo "❌ Model file not created"
        exit 1
    fi
else
    echo "❌ Model training failed"
    exit 1
fi

# Test the prediction API
echo "🧪 Testing prediction API..."
python -c "
import sys
sys.path.append('.')
from predict_api import load_model
if load_model():
    print('✅ Model loads successfully in API')
else:
    print('❌ Model failed to load in API')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    exit 1
fi

# Start the prediction server (optional)
read -p "🌐 Do you want to start the prediction API server now? [y/N]: " start_server

if [[ $start_server =~ ^[Yy]$ ]]; then
    echo "🚀 Starting prediction API server..."
    echo "   Server will run at http://localhost:5000"
    echo "   Press Ctrl+C to stop the server"
    echo ""
    python predict_api.py
else
    echo ""
    echo "✅ Setup completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Start the prediction API server:"
    echo "   python predict_api.py"
    echo ""
    echo "2. Start your LAMS backend server:"
    echo "   cd ../backend && npm start"
    echo ""
    echo "3. Start your LAMS frontend:"
    echo "   cd ../frontend && npm run dev"
    echo ""
    echo "4. Access AI Cost Prediction from:"
    echo "   - Chief Engineer Dashboard: /ce-dashboard/cost-prediction"
    echo "   - Project Engineer Dashboard: /pe-dashboard/cost-prediction"
    echo ""
    echo "🎉 AI Cost Prediction is ready to use!"
fi