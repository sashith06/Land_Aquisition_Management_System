import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  BarChart3, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Info,
  FileText,
  Building,
  Calendar
} from 'lucide-react';
import api from '../api';

const CostPredictionTool = ({ userRole }) => {
  const [predictionData, setPredictionData] = useState({
    location: '',
    district: '',
    initial_estimate_extent_ha: '',
    initial_estimated_cost: '',
    no_of_plans: '',
    no_of_lots: '',
    land_type: '',
    project_stage: '',
    year: new Date().getFullYear()
  });

  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [predictionPhase, setPredictionPhase] = useState(1);

  // Dropdown options
  const landTypes = ['Urban', 'Agricultural', 'Industrial', 'Residential', 'Commercial'];
  const projectStages = ['Initial', 'Processing', 'Completed'];
  const districts = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Anuradhapura', 'Kurunegala',
    'Ratnapura', 'Badulla', 'Batticaloa', 'Matara', 'Hambantota', 'Kalutara'
  ];

  useEffect(() => {
    loadModelInfo();
  }, []);

  useEffect(() => {
    // Determine prediction phase based on plans and lots
    const hasPlansAndLots = predictionData.no_of_plans && predictionData.no_of_lots;
    setPredictionPhase(hasPlansAndLots ? 2 : 1);
  }, [predictionData.no_of_plans, predictionData.no_of_lots]);

  const loadModelInfo = async () => {
    try {
      const response = await api.get('/api/predictions/model-info');
      if (response.data.success) {
        setModelInfo(response.data.model_info);
      }
    } catch (error) {
      console.error('Failed to load model info:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setPredictionData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear previous prediction when inputs change
    if (prediction) {
      setPrediction(null);
    }
  };

  const validateInputs = () => {
    const required = ['location', 'initial_estimate_extent_ha', 'initial_estimated_cost'];
    const missing = required.filter(field => !predictionData[field]);
    
    if (missing.length > 0) {
      setError(`Please fill in required fields: ${missing.join(', ')}`);
      return false;
    }

    const extent = parseFloat(predictionData.initial_estimate_extent_ha);
    const cost = parseFloat(predictionData.initial_estimated_cost);

    if (isNaN(extent) || extent <= 0) {
      setError('Please enter a valid extent (hectares)');
      return false;
    }

    if (isNaN(cost) || cost <= 0) {
      setError('Please enter a valid estimated cost');
      return false;
    }

    return true;
  };

  const handlePredict = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/predictions/predict', predictionData);
      
      if (response.data.success) {
        setPrediction(response.data.prediction);
      } else {
        setError('Prediction failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setError(error.response?.data?.message || 'Failed to get prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPredictionData({
      location: '',
      district: '',
      initial_estimate_extent_ha: '',
      initial_estimated_cost: '',
      no_of_plans: '',
      no_of_lots: '',
      land_type: '',
      project_stage: '',
      year: new Date().getFullYear()
    });
    setPrediction(null);
    setError(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Calculator size={32} />
          <div>
            <h1 className="text-2xl font-bold">AI Cost Prediction Tool</h1>
            <p className="text-blue-100">Predict land acquisition project expenses using machine learning</p>
          </div>
        </div>

        {modelInfo && (
          <div className="bg-blue-500/30 rounded-lg p-3 text-sm">
            <div className="flex items-center space-x-4">
              <span>Model: {modelInfo.model_type}</span>
              <span>Features: {modelInfo.feature_count}</span>
              <span>Version: {modelInfo.version}</span>
              <span className="flex items-center space-x-1">
                <CheckCircle size={16} />
                <span>Active</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <FileText size={20} />
            <span>Project Details</span>
          </h2>

          <div className="space-y-4">
            {/* Required Fields */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-700 mb-3">Required Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={predictionData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Homagama-Diyagama"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District
                  </label>
                  <select
                    value={predictionData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extent (Hectares) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={predictionData.initial_estimate_extent_ha}
                    onChange={(e) => handleInputChange('initial_estimate_extent_ha', e.target.value)}
                    placeholder="4.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Estimated Cost (LKR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={predictionData.initial_estimated_cost}
                    onChange={(e) => handleInputChange('initial_estimated_cost', e.target.value)}
                    placeholder="12000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Optional Fields */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-700 mb-3">
                Additional Details 
                <span className="text-sm text-gray-500 ml-2">(for refined prediction)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Plans
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={predictionData.no_of_plans}
                    onChange={(e) => handleInputChange('no_of_plans', e.target.value)}
                    placeholder="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Lots
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={predictionData.no_of_lots}
                    onChange={(e) => handleInputChange('no_of_lots', e.target.value)}
                    placeholder="25"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Land Type
                  </label>
                  <select
                    value={predictionData.land_type}
                    onChange={(e) => handleInputChange('land_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Land Type</option>
                    {landTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Stage
                  </label>
                  <select
                    value={predictionData.project_stage}
                    onChange={(e) => handleInputChange('project_stage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Stage</option>
                    {projectStages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    min="2018"
                    max="2030"
                    value={predictionData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Prediction Phase Indicator */}
            <div className={`p-3 rounded-lg ${predictionPhase === 2 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center space-x-2">
                <Info size={16} className={predictionPhase === 2 ? 'text-green-600' : 'text-yellow-600'} />
                <span className={`text-sm font-medium ${predictionPhase === 2 ? 'text-green-700' : 'text-yellow-700'}`}>
                  {predictionPhase === 1 ? 'Phase 1 - Rough Prediction' : 'Phase 2 - Refined Prediction'}
                </span>
              </div>
              <p className={`text-xs mt-1 ${predictionPhase === 2 ? 'text-green-600' : 'text-yellow-600'}`}>
                {predictionPhase === 1 
                  ? 'Add plans and lots data for more accurate prediction'
                  : 'All key data provided for maximum accuracy'
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handlePredict}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Predicting...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp size={16} />
                    <span>Predict Cost</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prediction Results */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <BarChart3 size={20} />
            <span>Prediction Results</span>
          </h2>

          {!prediction ? (
            <div className="text-center py-12">
              <Calculator size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Enter project details and click "Predict Cost" to see results</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Prediction */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Predicted Full Expense</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(prediction.predicted_full_expense)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{prediction.prediction_phase}</p>
                </div>
              </div>

              {/* Cost Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Initial Estimate</span>
                  </div>
                  <div className="text-xl font-semibold text-gray-800">
                    {formatCurrency(prediction.initial_estimated_cost)}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp size={16} className="text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Cost Increase</span>
                  </div>
                  <div className="text-xl font-semibold text-orange-600">
                    {formatCurrency(prediction.cost_increase_amount)}
                  </div>
                  <div className="text-sm text-orange-500">
                    {formatPercentage(prediction.cost_increase_percentage)}
                  </div>
                </div>
              </div>

              {/* Confidence Interval */}
              {prediction.confidence_interval && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Prediction Confidence Range</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm text-gray-600">Lower Bound</span>
                      <div className="font-semibold text-blue-600">
                        {formatCurrency(prediction.confidence_interval.lower)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Upper Bound</span>
                      <div className="font-semibold text-blue-600">
                        {formatCurrency(prediction.confidence_interval.upper)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Input Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">Input Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-600">Location:</span> {prediction.input_features.location}</div>
                  <div><span className="text-gray-600">Extent:</span> {prediction.input_features.extent_ha} ha</div>
                  <div><span className="text-gray-600">Plans:</span> {prediction.input_features.plans}</div>
                  <div><span className="text-gray-600">Lots:</span> {prediction.input_features.lots}</div>
                  {prediction.input_features.land_type && (
                    <div><span className="text-gray-600">Land Type:</span> {prediction.input_features.land_type}</div>
                  )}
                  {prediction.input_features.district && (
                    <div><span className="text-gray-600">District:</span> {prediction.input_features.district}</div>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-gray-500 text-center">
                Predicted on {new Date(prediction.prediction_timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Guide */}
      <div className="mt-6 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center space-x-2">
          <Info size={20} />
          <span>How to Use This Tool</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">Phase 1 - Rough Prediction</h4>
            <p>Enter basic project details (location, extent, initial cost) for a preliminary cost estimate based on historical patterns.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Phase 2 - Refined Prediction</h4>
            <p>Add detailed information (plans, lots, land type) for a more accurate prediction that considers project complexity.</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-xs text-blue-600">
            <strong>Note:</strong> Predictions are based on historical data and machine learning models. 
            Actual costs may vary due to market conditions, regulations, and unforeseen circumstances.
            Use these predictions as estimates for planning purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CostPredictionTool;