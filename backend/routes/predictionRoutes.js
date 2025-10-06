const express = require("express");
const router = express.Router();
const axios = require("axios");
const { verifyToken, requireEngineers } = require("../middleware/authMiddleware");

// Configuration for Python prediction API
const PREDICTION_API_URL = process.env.PREDICTION_API_URL || 'http://localhost:5001';

// Helper function to call Python prediction API
const callPredictionAPI = async (endpoint, data = null) => {
  try {
    const config = {
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      }
    };

    let response;
    if (data) {
      response = await axios.post(`${PREDICTION_API_URL}${endpoint}`, data, config);
    } else {
      response = await axios.get(`${PREDICTION_API_URL}${endpoint}`, config);
    }

    return response.data;
  } catch (error) {
    console.error(`Prediction API Error (${endpoint}):`, error.message);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Prediction service is not available. Please ensure the Python API server is running.');
    } else if (error.response) {
      throw new Error(error.response.data?.message || 'Prediction service error');
    } else {
      throw new Error('Failed to connect to prediction service');
    }
  }
};

// Get prediction service health status
router.get("/health", verifyToken, requireEngineers, async (req, res) => {
  try {
    const healthData = await callPredictionAPI('/health');
    res.json({
      success: true,
      service_status: healthData
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Prediction service unavailable',
      message: error.message
    });
  }
});

// Get model information
router.get("/model-info", verifyToken, requireEngineers, async (req, res) => {
  try {
    const modelInfo = await callPredictionAPI('/model-info');
    res.json({
      success: true,
      model_info: modelInfo
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Failed to get model information',
      message: error.message
    });
  }
});

// Single project cost prediction
router.post("/predict", verifyToken, requireEngineers, async (req, res) => {
  try {
    const {
      location,
      initial_estimate_extent_ha,
      initial_estimated_cost,
      no_of_plans,
      no_of_lots,
      land_type,
      project_stage,
      district,
      year
    } = req.body;

    // Validate required fields
    if (!location || !initial_estimate_extent_ha || !initial_estimated_cost) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required_fields: ['location', 'initial_estimate_extent_ha', 'initial_estimated_cost']
      });
    }

    // Prepare prediction request
    const predictionRequest = {
      location,
      initial_estimate_extent_ha: parseFloat(initial_estimate_extent_ha),
      initial_estimated_cost: parseFloat(initial_estimated_cost),
      no_of_plans: parseInt(no_of_plans || 0),
      no_of_lots: parseInt(no_of_lots || 0),
      land_type: land_type || null,
      project_stage: project_stage || null,
      district: district || null,
      year: year ? parseInt(year) : null
    };

    // Call Python prediction API
    const predictionResult = await callPredictionAPI('/predict', predictionRequest);

    res.json({
      success: true,
      prediction: predictionResult.prediction
    });

  } catch (error) {
    console.error('Prediction endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Prediction failed',
      message: error.message
    });
  }
});

// Batch prediction for multiple projects
router.post("/predict-batch", verifyToken, requireEngineers, async (req, res) => {
  try {
    const { projects } = req.body;

    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid projects data',
        message: 'Please provide an array of projects to predict'
      });
    }

    // Validate each project has required fields
    const requiredFields = ['location', 'initial_estimate_extent_ha', 'initial_estimated_cost'];
    const invalidProjects = projects.filter((project, index) => {
      const missingFields = requiredFields.filter(field => !project[field]);
      return missingFields.length > 0;
    });

    if (invalidProjects.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project data',
        message: 'Some projects are missing required fields',
        required_fields: requiredFields
      });
    }

    // Call Python batch prediction API
    const batchResult = await callPredictionAPI('/predict-batch', { projects });

    res.json({
      success: true,
      batch_prediction: batchResult
    });

  } catch (error) {
    console.error('Batch prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch prediction failed',
      message: error.message
    });
  }
});

// Get prediction from project data (convenience endpoint)
router.get("/predict-project/:projectId", verifyToken, requireEngineers, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Get project data from database (you'll need to implement this)
    // This is a placeholder - you should fetch actual project data
    const projectData = await getProjectData(projectId); // Implement this function
    
    if (!projectData) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Extract prediction parameters from project data
    const predictionRequest = {
      location: projectData.location || projectData.project_name,
      initial_estimate_extent_ha: projectData.estimated_extent || 0,
      initial_estimated_cost: projectData.estimated_cost || 0,
      no_of_plans: projectData.plans_count || 0,
      no_of_lots: projectData.lots_count || 0,
      land_type: projectData.land_type || null,
      project_stage: projectData.status || null,
      district: projectData.district || null,
      year: new Date(projectData.created_at).getFullYear()
    };

    // Call prediction API
    const predictionResult = await callPredictionAPI('/predict', predictionRequest);

    res.json({
      success: true,
      project_id: projectId,
      project_data: projectData,
      prediction: predictionResult.prediction
    });

  } catch (error) {
    console.error('Project prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'Project prediction failed',
      message: error.message
    });
  }
});

// Placeholder function - implement based on your project model
async function getProjectData(projectId) {
  // TODO: Implement actual database query to get project data
  // This should return project data with fields like:
  // {
  //   id, project_name, location, estimated_extent, estimated_cost,
  //   plans_count, lots_count, land_type, status, district, created_at
  // }
  return null;
}

module.exports = router;