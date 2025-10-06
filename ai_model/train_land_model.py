#!/usr/bin/env python3
"""
Land Acquisition Cost Prediction Model Training Script
=======================================================

This script trains an AI regression model to predict Full_Expense for land acquisition projects
based on historical data from Excel files.

Features:
- Loads and merges multiple Excel data sources
- Handles missing values and data preprocessing 
- Trains RandomForestRegressor for interpretable predictions
- Supports two-phase prediction (rough → refined)
- Saves complete preprocessing pipeline and model
- Evaluates model performance with metrics

Author: LAMS Development Team
Date: October 2025
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

class LandCostPredictor:
    """
    Land acquisition cost prediction model with preprocessing pipeline
    """
    
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.feature_names = None
        self.target_column = 'Full_Expense'
        
    def load_excel_data(self, file_paths):
        """
        Load and merge Excel data files into training dataset
        
        Args:
            file_paths (list): List of Excel file paths
            
        Returns:
            pd.DataFrame: Merged and cleaned dataset
        """
        print("📊 Loading Excel data files...")
        dataframes = []
        
        for file_path in file_paths:
            if os.path.exists(file_path):
                try:
                    # Try different sheet names and engines
                    for sheet in [0, 'Sheet1', 'Data', None]:
                        try:
                            df = pd.read_excel(file_path, sheet_name=sheet, engine='openpyxl')
                            if not df.empty:
                                print(f"✅ Loaded {file_path} - Shape: {df.shape}")
                                dataframes.append(df)
                                break
                        except:
                            continue
                except Exception as e:
                    print(f"❌ Error loading {file_path}: {e}")
            else:
                print(f"⚠️ File not found: {file_path}")
        
        if not dataframes:
            print("⚠️ No data files found. Creating sample dataset...")
            return self.create_sample_data()
        
        # Merge all dataframes
        merged_df = pd.concat(dataframes, ignore_index=True, sort=False)
        print(f"📈 Total merged dataset shape: {merged_df.shape}")
        
        return merged_df
    
    def create_sample_data(self):
        """
        Create sample training data for demonstration purposes
        """
        print("🔧 Creating sample training dataset...")
        
        np.random.seed(42)
        n_samples = 200
        
        locations = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Anuradhapura', 'Kurunegala', 
                    'Ratnapura', 'Badulla', 'Batticaloa', 'Homagama-Diyagama']
        districts = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Anuradhapura', 'Kurunegala']
        land_types = ['Urban', 'Agricultural', 'Industrial', 'Residential', 'Commercial']
        project_stages = ['Initial', 'Processing', 'Completed']
        
        data = {
            'Location': np.random.choice(locations, n_samples),
            'District': np.random.choice(districts, n_samples),
            'Initial_Estimate_Extent_ha': np.random.uniform(0.5, 50.0, n_samples),
            'Initial_Estimated_Cost': np.random.uniform(1000000, 100000000, n_samples),
            'No_of_Plans': np.random.randint(1, 20, n_samples),
            'No_of_Lots': np.random.randint(5, 200, n_samples),
            'Land_Type': np.random.choice(land_types, n_samples),
            'Project_Stage': np.random.choice(project_stages, n_samples),
            'Year': np.random.randint(2018, 2025, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Generate realistic Full_Expense based on features
        base_cost = df['Initial_Estimated_Cost'] * np.random.uniform(1.1, 1.8, n_samples)
        location_multiplier = df['Location'].map({
            'Colombo': 1.5, 'Kandy': 1.2, 'Galle': 1.1, 'Jaffna': 0.9,
            'Anuradhapura': 0.8, 'Kurunegala': 0.9, 'Ratnapura': 0.85,
            'Badulla': 0.8, 'Batticaloa': 0.75, 'Homagama-Diyagama': 1.3
        }).fillna(1.0)
        
        land_type_multiplier = df['Land_Type'].map({
            'Urban': 1.4, 'Commercial': 1.6, 'Industrial': 1.2,
            'Residential': 1.1, 'Agricultural': 0.8
        }).fillna(1.0)
        
        extent_factor = 1 + (df['Initial_Estimate_Extent_ha'] / 100)
        complexity_factor = 1 + (df['No_of_Plans'] * 0.02) + (df['No_of_Lots'] * 0.001)
        
        df['Full_Expense'] = (base_cost * location_multiplier * land_type_multiplier * 
                             extent_factor * complexity_factor * np.random.uniform(0.9, 1.1, n_samples))
        
        return df
    
    def preprocess_data(self, df):
        """
        Clean and preprocess the dataset
        
        Args:
            df (pd.DataFrame): Raw dataset
            
        Returns:
            tuple: (features, target, feature_names)
        """
        print("🧹 Preprocessing data...")
        
        # Standardize column names (handle variations)
        column_mapping = {
            'location': 'Location',
            'district': 'District', 
            'initial_estimate_extent_ha': 'Initial_Estimate_Extent_ha',
            'initial_estimated_cost': 'Initial_Estimated_Cost',
            'no_of_plans': 'No_of_Plans',
            'no_of_lots': 'No_of_Lots',
            'land_type': 'Land_Type',
            'project_stage': 'Project_Stage',
            'year': 'Year',
            'full_expense': 'Full_Expense'
        }
        
        # Apply case-insensitive column mapping
        df.columns = df.columns.str.strip().str.replace(' ', '_')
        for old_col, new_col in column_mapping.items():
            for col in df.columns:
                if col.lower() == old_col.lower():
                    df = df.rename(columns={col: new_col})
        
        # Define expected features
        expected_features = [
            'Location', 'District', 'Initial_Estimate_Extent_ha', 'Initial_Estimated_Cost',
            'No_of_Plans', 'No_of_Lots', 'Land_Type', 'Project_Stage', 'Year'
        ]
        
        # Add missing columns with default values
        for feature in expected_features:
            if feature not in df.columns:
                if feature in ['No_of_Plans', 'No_of_Lots', 'Year']:
                    df[feature] = 0
                elif feature in ['District', 'Land_Type', 'Project_Stage']:
                    df[feature] = 'Unknown'
                else:
                    df[feature] = np.nan
        
        # Handle target column
        if self.target_column not in df.columns:
            print(f"❌ Target column '{self.target_column}' not found!")
            return None, None, None
        
        # Remove rows with missing target values
        df = df.dropna(subset=[self.target_column])
        
        # Handle missing values in features
        # Numeric columns - fill with median
        numeric_columns = ['Initial_Estimate_Extent_ha', 'Initial_Estimated_Cost', 
                          'No_of_Plans', 'No_of_Lots', 'Year']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
                df[col] = df[col].fillna(df[col].median())
        
        # Categorical columns - fill with mode or 'Unknown'
        categorical_columns = ['Location', 'District', 'Land_Type', 'Project_Stage']
        for col in categorical_columns:
            if col in df.columns:
                df[col] = df[col].astype(str).fillna('Unknown')
        
        # Remove outliers (optional)
        target_q99 = df[self.target_column].quantile(0.99)
        target_q01 = df[self.target_column].quantile(0.01)
        df = df[(df[self.target_column] >= target_q01) & (df[self.target_column] <= target_q99)]
        
        # Prepare features and target
        feature_columns = expected_features
        X = df[feature_columns].copy()
        y = df[self.target_column].copy()
        
        print(f"✅ Preprocessed dataset - Features: {X.shape}, Target: {y.shape}")
        print(f"📋 Features: {list(X.columns)}")
        
        return X, y, feature_columns
    
    def create_preprocessing_pipeline(self, X):
        """
        Create preprocessing pipeline for features
        """
        # Identify numeric and categorical columns
        numeric_features = ['Initial_Estimate_Extent_ha', 'Initial_Estimated_Cost', 
                           'No_of_Plans', 'No_of_Lots', 'Year']
        categorical_features = ['Location', 'District', 'Land_Type', 'Project_Stage']
        
        # Create transformers
        numeric_transformer = StandardScaler()
        categorical_transformer = Pipeline(steps=[
            ('encoder', LabelEncoder())
        ])
        
        # Note: For categorical features with many categories, we'll use LabelEncoder
        # This is simpler than OneHotEncoder for this use case
        
        return numeric_features, categorical_features
    
    def train_model(self, X, y):
        """
        Train the regression model
        """
        print("🤖 Training Random Forest model...")
        
        # Prepare data for training
        X_processed = X.copy()
        
        # Handle categorical variables with LabelEncoder
        categorical_columns = ['Location', 'District', 'Land_Type', 'Project_Stage']
        label_encoders = {}
        
        for col in categorical_columns:
            if col in X_processed.columns:
                le = LabelEncoder()
                X_processed[col] = le.fit_transform(X_processed[col].astype(str))
                label_encoders[col] = le
        
        # Scale numeric features
        numeric_columns = ['Initial_Estimate_Extent_ha', 'Initial_Estimated_Cost', 
                          'No_of_Plans', 'No_of_Lots', 'Year']
        scaler = StandardScaler()
        X_processed[numeric_columns] = scaler.fit_transform(X_processed[numeric_columns])
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y, test_size=0.2, random_state=42
        )
        
        # Train Random Forest (primary model)
        rf_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        rf_model.fit(X_train, y_train)
        
        # Train Linear Regression (backup model)
        lr_model = LinearRegression()
        lr_model.fit(X_train, y_train)
        
        # Evaluate models
        rf_pred = rf_model.predict(X_test)
        lr_pred = lr_model.predict(X_test)
        
        rf_r2 = r2_score(y_test, rf_pred)
        rf_mae = mean_absolute_error(y_test, rf_pred)
        
        lr_r2 = r2_score(y_test, lr_pred)
        lr_mae = mean_absolute_error(y_test, lr_pred)
        
        print(f"📊 Random Forest - R²: {rf_r2:.4f}, MAE: {rf_mae:,.0f}")
        print(f"📊 Linear Regression - R²: {lr_r2:.4f}, MAE: {lr_mae:,.0f}")
        
        # Choose best model
        if rf_r2 > lr_r2:
            self.model = rf_model
            print("✅ Selected Random Forest as final model")
        else:
            self.model = lr_model
            print("✅ Selected Linear Regression as final model")
        
        # Store preprocessing components
        self.preprocessor = {
            'label_encoders': label_encoders,
            'scaler': scaler,
            'feature_columns': list(X.columns)
        }
        
        return X_test, y_test
    
    def save_model(self, model_path='land_cost_model.pkl'):
        """
        Save the trained model and preprocessing pipeline
        """
        print(f"💾 Saving model to {model_path}...")
        
        model_package = {
            'model': self.model,
            'preprocessor': self.preprocessor,
            'feature_names': self.preprocessor['feature_columns'],
            'target_column': self.target_column,
            'version': '1.0',
            'created_date': pd.Timestamp.now().isoformat()
        }
        
        joblib.dump(model_package, model_path)
        print(f"✅ Model saved successfully!")
        
    def predict_expense(self, location, extent, estimated_cost, plans=0, lots=0,
                       land_type=None, project_stage=None, district=None, year=None):
        """
        Predict land acquisition expense
        
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
            float: Predicted full expense
        """
        if self.model is None:
            raise ValueError("Model not trained yet!")
        
        # Create input dataframe
        input_data = pd.DataFrame({
            'Location': [location],
            'District': [district or 'Unknown'],
            'Initial_Estimate_Extent_ha': [float(extent)],
            'Initial_Estimated_Cost': [float(estimated_cost)],
            'No_of_Plans': [int(plans)],
            'No_of_Lots': [int(lots)],
            'Land_Type': [land_type or 'Unknown'],
            'Project_Stage': [project_stage or 'Unknown'],
            'Year': [int(year) if year else 2024]
        })
        
        # Apply preprocessing
        X_processed = input_data.copy()
        
        # Apply label encoders
        for col, le in self.preprocessor['label_encoders'].items():
            if col in X_processed.columns:
                try:
                    X_processed[col] = le.transform(X_processed[col].astype(str))
                except ValueError:
                    # Handle unknown categories
                    X_processed[col] = 0
        
        # Apply scaling
        numeric_columns = ['Initial_Estimate_Extent_ha', 'Initial_Estimated_Cost', 
                          'No_of_Plans', 'No_of_Lots', 'Year']
        X_processed[numeric_columns] = self.preprocessor['scaler'].transform(X_processed[numeric_columns])
        
        # Make prediction
        prediction = self.model.predict(X_processed)[0]
        
        return float(prediction)

def main():
    """
    Main training pipeline
    """
    print("🚀 Land Acquisition Cost Prediction Model Training")
    print("=" * 60)
    
    # Initialize predictor
    predictor = LandCostPredictor()
    
    # Define data file paths (adjust as needed)
    data_files = [
        'Land New format.xlsx',  # Update path as needed
        'Wele Junction old Data Base.xlsx'  # Update path as needed
    ]
    
    # Load data
    df = predictor.load_excel_data(data_files)
    
    # Preprocess data
    X, y, feature_names = predictor.preprocess_data(df)
    
    if X is None:
        print("❌ Data preprocessing failed!")
        return
    
    # Train model
    X_test, y_test = predictor.train_model(X, y)
    
    # Save model
    predictor.save_model('land_cost_model.pkl')
    
    # Demo prediction
    print("\n🔮 Demo Prediction:")
    demo_prediction = predictor.predict_expense(
        location="Homagama-Diyagama",
        extent=4.5,
        estimated_cost=12000000,
        plans=2,
        lots=25,
        land_type="Urban",
        project_stage="Initial"
    )
    print(f"Predicted Full Expense: Rs. {demo_prediction:,.0f}")
    
    print("\n✅ Training completed successfully!")
    print("📁 Model saved as 'land_cost_model.pkl'")
    print("🔗 Ready for integration with Node.js backend")

if __name__ == "__main__":
    main()