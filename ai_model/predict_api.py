#!/usr/bin/env python3
"""
Land Acquisition Cost Prediction API Server
============================================

Flask API server that serves ML predictions for land acquisition cost estimation.
Integrates with Node.js backend via REST API.

Endpoints:
- POST /predict: Get cost prediction
- GET /health: Health check
- GET /model-info: Model information

Author: LAMS Development Team
Date: October 2025
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for Node.js integration

# Global model storage
MODEL = None
MODEL_INFO = None

def load_model(model_path='land_cost_model.pkl'):
    """
    Load the trained model and preprocessing pipeline
    """
    global MODEL, MODEL_INFO
    
    try:
        if os.path.exists(model_path):
            MODEL = joblib.load(model_path)
            MODEL_INFO = {
                'model_type': type(MODEL['model']).__name__,
                'feature_count': len(MODEL['feature_names']),
                'features': MODEL['feature_names'],
                'version': MODEL.get('version', '1.0'),
                'created_date': MODEL.get('created_date', 'Unknown'),
                'status': 'loaded'
            }
            logger.info(f"✅ Model loaded successfully from {model_path}")
            return True
        else:
            logger.error(f"❌ Model file not found: {model_path}")
            return False
    except Exception as e:
        logger.error(f"❌ Error loading model: {e}")
        return False

def predict_expense(location, extent, estimated_cost, plans=0, lots=0,
                   land_type=None, project_stage=None, district=None, year=None):
    """
    Make prediction using loaded model
    
    Args:
        location (str): Project location
        extent (float): Initial estimate extent in hectares
        estimated_cost (float): Initial estimated cost
        plans (int): Number of plans (default: 0)
        lots (int): Number of lots (default: 0)
        land_type (str): Type of land (optional)
        project_stage (str): Project stage (optional)
        district (str): District (optional)
        year (int): Year (optional)
        
    Returns:
        dict: Prediction result with confidence metrics
    """
    if MODEL is None:
        raise ValueError("Model not loaded!")
    
    try:
        # Create input dataframe
        input_data = pd.DataFrame({
            'Location': [str(location)],
            'District': [str(district) if district else 'Unknown'],
            'Initial_Estimate_Extent_ha': [float(extent)],
            'Initial_Estimated_Cost': [float(estimated_cost)],
            'No_of_Plans': [int(plans)],
            'No_of_Lots': [int(lots)],
            'Land_Type': [str(land_type) if land_type else 'Unknown'],
            'Project_Stage': [str(project_stage) if project_stage else 'Unknown'],
            'Year': [int(year) if year else datetime.now().year]
        })
        
        # Apply preprocessing
        X_processed = input_data.copy()
        
        # Apply label encoders
        for col, le in MODEL['preprocessor']['label_encoders'].items():
            if col in X_processed.columns:
                try:
                    X_processed[col] = le.transform(X_processed[col].astype(str))
                except ValueError:
                    # Handle unknown categories by using most frequent class
                    X_processed[col] = 0
                    logger.warning(f"Unknown category in {col}, using default value")
        
        # Apply scaling
        numeric_columns = ['Initial_Estimate_Extent_ha', 'Initial_Estimated_Cost', 
                          'No_of_Plans', 'No_of_Lots', 'Year']
        X_processed[numeric_columns] = MODEL['preprocessor']['scaler'].transform(X_processed[numeric_columns])
        
        # Make prediction
        prediction = MODEL['model'].predict(X_processed)[0]
        
        # Calculate confidence metrics if using RandomForest
        confidence_interval = None
        if hasattr(MODEL['model'], 'estimators_'):
            # Get predictions from all trees
            tree_predictions = [tree.predict(X_processed)[0] for tree in MODEL['model'].estimators_]
            std_dev = np.std(tree_predictions)
            confidence_interval = {
                'lower': float(prediction - 2 * std_dev),
                'upper': float(prediction + 2 * std_dev),
                'std_dev': float(std_dev)
            }
        
        # Calculate prediction phase
        phase = "Phase 1 (Rough)" if plans == 0 and lots == 0 else "Phase 2 (Refined)"
        
        # Calculate cost increase percentage
        cost_increase_pct = ((prediction - estimated_cost) / estimated_cost) * 100 if estimated_cost > 0 else 0
        
        result = {
            'predicted_full_expense': float(prediction),
            'initial_estimated_cost': float(estimated_cost),
            'cost_increase_amount': float(prediction - estimated_cost),
            'cost_increase_percentage': float(cost_increase_pct),
            'prediction_phase': phase,
            'confidence_interval': confidence_interval,
            'input_features': {
                'location': location,
                'extent_ha': float(extent),
                'estimated_cost': float(estimated_cost),
                'plans': int(plans),
                'lots': int(lots),
                'land_type': land_type,
                'project_stage': project_stage,
                'district': district,
                'year': year or datetime.now().year
            },
            'prediction_timestamp': datetime.now().isoformat()
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'service': 'Land Cost Prediction API',
        'model_loaded': MODEL is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/model-info', methods=['GET'])
def model_info():
    """
    Get model information
    """
    if MODEL is None:
        return jsonify({
            'error': 'Model not loaded',
            'status': 'no_model'
        }), 503
    
    return jsonify(MODEL_INFO)

@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint
    
    Expected JSON body:
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
    
    Returns:
    {
        "predicted_full_expense": 13750000,
        "cost_increase_percentage": 14.58,
        "prediction_phase": "Phase 2 (Refined)",
        ...
    }
    """
    if MODEL is None:
        return jsonify({
            'error': 'Model not loaded',
            'message': 'Please ensure the model file exists and restart the server'
        }), 503
    
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No JSON data provided',
                'message': 'Please provide prediction parameters in JSON format'
            }), 400
        
        # Validate required fields
        required_fields = ['location', 'initial_estimate_extent_ha', 'initial_estimated_cost']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'missing_fields': missing_fields,
                'required_fields': required_fields
            }), 400
        
        # Extract parameters
        location = data.get('location')
        extent = data.get('initial_estimate_extent_ha')
        estimated_cost = data.get('initial_estimated_cost')
        plans = data.get('no_of_plans', 0)
        lots = data.get('no_of_lots', 0)
        land_type = data.get('land_type')
        project_stage = data.get('project_stage')
        district = data.get('district')
        year = data.get('year')
        
        # Validate numeric inputs
        try:
            extent = float(extent)
            estimated_cost = float(estimated_cost)
            plans = int(plans)
            lots = int(lots)
            if year:
                year = int(year)
        except (ValueError, TypeError):
            return jsonify({
                'error': 'Invalid numeric values',
                'message': 'Please ensure extent, cost, plans, lots, and year are valid numbers'
            }), 400
        
        # Make prediction
        result = predict_expense(
            location=location,
            extent=extent,
            estimated_cost=estimated_cost,
            plans=plans,
            lots=lots,
            land_type=land_type,
            project_stage=project_stage,
            district=district,
            year=year
        )
        
        logger.info(f"Prediction made for {location}: Rs. {result['predicted_full_expense']:,.0f}")
        
        return jsonify({
            'success': True,
            'prediction': result
        })
        
    except Exception as e:
        logger.error(f"Prediction endpoint error: {e}")
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500

@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    """
    Batch prediction endpoint for multiple projects
    """
    if MODEL is None:
        return jsonify({
            'error': 'Model not loaded'
        }), 503
    
    try:
        data = request.get_json()
        projects = data.get('projects', [])
        
        if not projects:
            return jsonify({
                'error': 'No projects provided',
                'message': 'Please provide a list of projects to predict'
            }), 400
        
        results = []
        for i, project in enumerate(projects):
            try:
                result = predict_expense(
                    location=project.get('location'),
                    extent=project.get('initial_estimate_extent_ha'),
                    estimated_cost=project.get('initial_estimated_cost'),
                    plans=project.get('no_of_plans', 0),
                    lots=project.get('no_of_lots', 0),
                    land_type=project.get('land_type'),
                    project_stage=project.get('project_stage'),
                    district=project.get('district'),
                    year=project.get('year')
                )
                results.append({
                    'index': i,
                    'success': True,
                    'prediction': result
                })
            except Exception as e:
                results.append({
                    'index': i,
                    'success': False,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'predictions': results,
            'total_projects': len(projects),
            'successful_predictions': sum(1 for r in results if r['success'])
        })
        
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        return jsonify({
            'error': 'Batch prediction failed',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Land Cost Prediction API Server")
    print("=" * 50)
    
    # Load model on startup
    if load_model():
        print(f"✅ Model loaded: {MODEL_INFO['model_type']}")
        print(f"📊 Features: {len(MODEL_INFO['features'])}")
        print(f"🗓️ Version: {MODEL_INFO['version']}")
    else:
        print("⚠️ Model not loaded - please run train_land_model.py first")
        print("🔄 Server will start but predictions will fail until model is available")
    
    print("\n📡 API Endpoints:")
    print("  GET  /health      - Health check")
    print("  GET  /model-info  - Model information") 
    print("  POST /predict     - Single prediction")
    print("  POST /predict-batch - Batch predictions")
    
    print(f"\n🌐 Server starting on http://localhost:5001")
    print("🔗 Ready for Node.js backend integration")
    
    app.run(host='0.0.0.0', port=5001, debug=False)