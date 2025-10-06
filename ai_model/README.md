# Land Acquisition AI Cost Prediction Setup

## 🚀 Quick Start Guide

### 1. Install Python Dependencies

```bash
cd ai_model
pip install -r requirements.txt
```

### 2. Train the Model

```bash
# Run the training script
python train_land_model.py
```

This will:
- Load your Excel data files (or create sample data if files not found)
- Train a RandomForest regression model
- Save the model as `land_cost_model.pkl`

### 3. Start the Prediction API Server

```bash
# Start the Flask API server
python predict_api.py
```

The API will be available at `http://localhost:5000`

### 4. Start Your LAMS Application

```bash
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2) 
cd frontend
npm run dev
```

## 📊 Data Files

Place your Excel files in the `ai_model` directory:
- `Land New format.xlsx`
- `Wele Junction old Data Base.xlsx`

Expected columns:
- Location (string)
- District (string, optional)
- Initial_Estimate_Extent_ha (float)
- Initial_Estimated_Cost (float)
- No_of_Plans (int, optional)
- No_of_Lots (int, optional)
- Land_Type (string, optional)
- Project_Stage (string, optional)
- Year (int, optional)
- **Full_Expense (float)** ← Target column

## 🔧 API Endpoints

### Health Check
```
GET http://localhost:5000/health
```

### Model Information
```
GET http://localhost:5000/model-info
```

### Single Prediction
```
POST http://localhost:5000/predict
Content-Type: application/json

{
  "location": "Homagama-Diyagama",
  "initial_estimate_extent_ha": 4.5,
  "initial_estimated_cost": 12000000,
  "no_of_plans": 2,
  "no_of_lots": 25,
  "land_type": "Urban",
  "project_stage": "Initial",
  "district": "Colombo",
  "year": 2024
}
```

### Batch Predictions
```
POST http://localhost:5000/predict-batch
Content-Type: application/json

{
  "projects": [
    {
      "location": "Project 1",
      "initial_estimate_extent_ha": 4.5,
      "initial_estimated_cost": 12000000
    },
    {
      "location": "Project 2", 
      "initial_estimate_extent_ha": 6.2,
      "initial_estimated_cost": 18000000
    }
  ]
}
```

## 🎯 Frontend Integration

### Access AI Cost Prediction

1. **Chief Engineer Dashboard**: `/ce-dashboard/cost-prediction`
2. **Project Engineer Dashboard**: `/pe-dashboard/cost-prediction`

### Features
- **Phase 1 Prediction**: Basic inputs (location, extent, cost)
- **Phase 2 Prediction**: Detailed inputs (+ plans, lots, land type)
- **Real-time Results**: Instant cost predictions with confidence intervals
- **Professional UI**: Clean, intuitive interface for engineers

## 🔄 Retraining the Model

When you have new data:

1. Add new Excel files to the `ai_model` directory
2. Run the training script again:
   ```bash
   python train_land_model.py
   ```
3. Restart the prediction API server:
   ```bash
   python predict_api.py
   ```

## 🏗️ Architecture

```
Frontend (React)
    ↓ HTTP requests
Backend (Node.js/Express)
    ↓ HTTP requests  
AI API (Python/Flask)
    ↓ Model inference
Machine Learning Model (RandomForest/LinearRegression)
```

## 🛠️ Troubleshooting

### "Model not loaded" error
- Ensure `train_land_model.py` has been run successfully
- Check that `land_cost_model.pkl` exists in the ai_model directory

### "Prediction service unavailable" error
- Ensure the Python API server is running on port 5000
- Check that all dependencies are installed: `pip install -r requirements.txt`

### Frontend integration issues
- Verify the backend server is running and accessible
- Check browser console for API request errors
- Ensure user has engineer role (only CE and PE can access)

## 📈 Model Performance

The AI model provides:
- **R² Score**: Measures prediction accuracy (higher is better)
- **Mean Absolute Error**: Average prediction error in LKR
- **Confidence Intervals**: Prediction range estimates
- **Feature Importance**: Which factors most influence cost

## 🔒 Security

- Only Chief Engineers and Project Engineers can access predictions
- All API calls are authenticated through the main backend
- Rate limiting and input validation on prediction endpoints

## 📝 Notes

- Predictions are estimates based on historical data
- Actual costs may vary due to market conditions and unforeseen circumstances
- Use predictions for planning and budgeting purposes
- Regular model retraining with new data improves accuracy