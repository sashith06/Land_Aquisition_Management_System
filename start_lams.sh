#!/bin/bash

# LAMS Auto-Startup Script
# This script automatically starts all required services for the Land Acquisition Management System

echo "🚀 Starting Land Acquisition Management System (LAMS)"
echo "======================================================"

# Function to check if a port is in use
check_port() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        lsof -i :$port >/dev/null 2>&1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -lan | grep ":$port " >/dev/null 2>&1
    else
        return 1
    fi
}

# Function to start a service in the background
start_service() {
    local name=$1
    local command=$2
    local port=$3
    local logfile=$4
    
    echo "🔄 Starting $name..."
    
    if check_port $port; then
        echo "✅ $name is already running on port $port"
        return 0
    fi
    
    # Start the service in background
    nohup bash -c "$command" > "$logfile" 2>&1 &
    local pid=$!
    
    # Wait a moment for the service to start
    sleep 3
    
    # Check if the service is running
    if check_port $port; then
        echo "✅ $name started successfully on port $port (PID: $pid)"
        echo $pid > "${name,,}_pid.txt"
        return 0
    else
        echo "❌ Failed to start $name"
        return 1
    fi
}

# Create logs directory
mkdir -p logs

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    echo "❌ Please run this script from the LAMS root directory"
    echo "   Expected structure: backend/, frontend/, ai_model/"
    exit 1
fi

# Step 1: Setup and start AI Prediction API
echo "🤖 Setting up AI Prediction Service..."

if [ ! -d "ai_model" ]; then
    echo "❌ ai_model directory not found"
    exit 1
fi

cd ai_model

# Check Python installation
if ! command -v python3 >/dev/null 2>&1 && ! command -v python >/dev/null 2>&1; then
    echo "❌ Python is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD="python3"
if ! command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python"
fi

echo "✅ Using Python: $($PYTHON_CMD --version)"

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    $PYTHON_CMD -m pip install -r requirements.txt >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Python dependencies installed"
    else
        echo "⚠️  Some dependencies may have failed to install"
    fi
fi

# Train model if not exists
if [ ! -f "land_cost_model.pkl" ]; then
    echo "🔧 Training AI model (first time setup)..."
    $PYTHON_CMD train_land_model.py
    if [ $? -eq 0 ]; then
        echo "✅ AI model trained successfully"
    else
        echo "❌ Failed to train AI model"
        exit 1
    fi
else
    echo "✅ AI model already exists"
fi

# Start AI API
start_service "AI-API" "$PYTHON_CMD predict_api.py" 5001 "../logs/ai_api.log"

cd ..

# Step 2: Start Backend Server
echo "🔧 Starting Backend Server..."

if [ ! -d "backend" ]; then
    echo "❌ backend directory not found"
    exit 1
fi

cd backend

# Check Node.js installation
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

echo "✅ Using Node.js: $(node --version)"

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing Node.js dependencies..."
        npm install >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Node.js dependencies installed"
        else
            echo "❌ Failed to install Node.js dependencies"
            exit 1
        fi
    else
        echo "✅ Node.js dependencies already installed"
    fi
fi

# Start backend
start_service "Backend" "npm start" 5000 "../logs/backend.log"

cd ..

# Step 3: Start Frontend Server
echo "🎨 Starting Frontend Server..."

if [ ! -d "frontend" ]; then
    echo "❌ frontend directory not found"
    exit 1
fi

cd frontend

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing Frontend dependencies..."
        npm install >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Frontend dependencies installed"
        else
            echo "❌ Failed to install Frontend dependencies"
            exit 1
        fi
    else
        echo "✅ Frontend dependencies already installed"
    fi
fi

# Start frontend
start_service "Frontend" "npm run dev" 5173 "../logs/frontend.log"

cd ..

# Summary
echo ""
echo "🎉 LAMS System Started Successfully!"
echo "====================================="
echo ""
echo "📡 Services Running:"
echo "  🤖 AI Prediction API: http://localhost:5001"
echo "  🔧 Backend Server:    http://localhost:5000"
echo "  🎨 Frontend App:      http://localhost:5173"
echo ""
echo "🌐 Access Your Application:"
echo "  👉 Open: http://localhost:5173"
echo ""
echo "📋 Available Features:"
echo "  ✅ User Authentication & Role Management"
echo "  ✅ Project & Plan Management"
echo "  ✅ Land Acquisition Tracking"
echo "  ✅ Financial Management"
echo "  ✅ AI Cost Prediction (CE & PE dashboards)"
echo ""
echo "📁 Logs saved to: logs/ directory"
echo ""
echo "🛑 To stop all services:"
echo "   ./stop_lams.sh"
echo ""
echo "💡 Tip: AI Cost Prediction is available in:"
echo "   - Chief Engineer Dashboard → AI Cost Prediction"
echo "   - Project Engineer Dashboard → AI Cost Prediction"

# Create stop script
cat > stop_lams.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping LAMS Services..."

# Kill processes by PID files
for service in ai-api backend frontend; do
    pidfile="${service}_pid.txt"
    if [ -f "$pidfile" ]; then
        pid=$(cat "$pidfile")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            echo "✅ Stopped $service (PID: $pid)"
        fi
        rm -f "$pidfile"
    fi
done

# Kill by port (backup method)
for port in 5000 5001 5173; do
    if command -v lsof >/dev/null 2>&1; then
        pids=$(lsof -ti :$port 2>/dev/null)
        if [ -n "$pids" ]; then
            echo "$pids" | xargs kill 2>/dev/null
            echo "✅ Stopped services on port $port"
        fi
    fi
done

echo "🏁 All LAMS services stopped"
EOF

chmod +x stop_lams.sh

echo "📝 Stop script created: ./stop_lams.sh"