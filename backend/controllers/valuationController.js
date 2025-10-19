const Valuation = require("../models/valuationModel");

// Create or update valuation
const createOrUpdateValuation = (req, res) => {
  const { plan_id, lot_id } = req.params;
  
  console.log('=== VALUATION CONTROLLER DEBUG ===');
  console.log('User:', req.user);
  console.log('User ID:', req.user?.id);
  console.log('User Role:', req.user?.role);
  console.log('createOrUpdateValuation called with:', { plan_id, lot_id });
  console.log('Request Body:', req.body);
  console.log('Original status from frontend:', req.body.status);
  console.log('=== END DEBUG ===');
  
  // Validate parameters
  const parsedLotId = parseInt(lot_id);
  const parsedPlanId = parseInt(plan_id);
  
  if (isNaN(parsedLotId) || isNaN(parsedPlanId)) {
    console.error('Invalid lot_id or plan_id:', { lot_id, plan_id, parsedLotId, parsedPlanId });
    return res.status(400).json({ 
      success: false, 
      message: "Invalid lot_id or plan_id. Must be numbers." 
    });
  }

  // Validate required user information
  if (!req.user || !req.user.id) {
    console.error('Missing user information in request');
    return res.status(401).json({
      success: false,
      message: "User authentication required"
    });
  }

  // Helper function to safely parse float values
  const safeParseFloat = (value, defaultValue = 0) => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Helper function to validate and convert status
  const validateStatus = (status) => {
    const validStatuses = ['draft', 'submitted', 'approved', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return 'draft'; // Default to draft if invalid
    }
    return status;
  };

  // Explicitly define valuation data instead of using spread operator
  const valuationData = {
    plan_id: parsedPlanId,
    lot_id: parsedLotId,
    statutorily_amount: safeParseFloat(req.body.statutorily_amount),
    addition_amount: safeParseFloat(req.body.addition_amount),
    development_amount: safeParseFloat(req.body.development_amount),
    court_amount: safeParseFloat(req.body.court_amount),
    thirty_three_amount: safeParseFloat(req.body.thirty_three_amount),
    board_of_review_amount: safeParseFloat(req.body.board_of_review_amount),
    assessment_date: req.body.assessment_date || new Date().toISOString().split('T')[0],
    assessor_name: req.body.assessor_name || null,
    notes: req.body.notes || null,
    status: validateStatus(req.body.status),
    created_by: req.user.id,
    updated_by: req.user.id
  };

  console.log('Status validation result:', {
    original: req.body.status,
    converted: valuationData.status
  });

  // Calculate total value with better error handling
  try {
    const totalValue = (
      valuationData.statutorily_amount +
      valuationData.addition_amount +
      valuationData.development_amount +
      valuationData.court_amount +
      valuationData.thirty_three_amount +
      valuationData.board_of_review_amount
    );
    
    valuationData.total_value = totalValue;
    
    console.log('Calculated total value:', totalValue);
    console.log('Final valuation data to save:', valuationData);
  } catch (error) {
    console.error('Error calculating total value:', error);
    return res.status(400).json({
      success: false,
      message: "Error calculating total value. Please check numeric inputs.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  console.log('Saving valuation data:', valuationData);

  // Validate that we have valid numbers for all amount fields
  const numericFields = [
    'statutorily_amount', 'addition_amount', 'development_amount', 
    'court_amount', 'thirty_three_amount', 'board_of_review_amount', 'total_value'
  ];
  
  for (const field of numericFields) {
    if (isNaN(valuationData[field])) {
      console.error(`Invalid numeric value for ${field}:`, valuationData[field]);
      return res.status(400).json({
        success: false,
        message: `Invalid numeric value for ${field}`,
        field: field,
        value: valuationData[field]
      });
    }
  }

  Valuation.createOrUpdate(valuationData, (err, result) => {
    if (err) {
      console.error("Error saving valuation - Full error object:", err);
      console.error("Error message:", err.message);
      console.error("Error code:", err.code);
      console.error("Error errno:", err.errno);
      console.error("Error sqlState:", err.sqlState);
      console.error("Error sqlMessage:", err.sqlMessage);
      console.error("Error stack:", err.stack);
      
      return res.status(500).json({ 
        success: false, 
        message: "Error saving valuation",
        error: process.env.NODE_ENV === 'development' ? {
          message: err.message,
          code: err.code,
          errno: err.errno,
          sqlState: err.sqlState,
          sqlMessage: err.sqlMessage
        } : undefined
      });
    }

    console.log('Valuation saved successfully:', result);
    res.status(200).json({
      success: true,
      message: "Valuation saved successfully",
      data: {
        id: result.insertId || result.affectedRows,
        total_value: valuationData.total_value
      }
    });
  });
};

// Get valuation by lot ID
const getValuationByLotId = (req, res) => {
  const { plan_id, lot_id } = req.params;

  console.log('=== getValuationByLotId DEBUG START ===');
  console.log('Raw req.params:', req.params);
  console.log('plan_id:', plan_id, 'type:', typeof plan_id);
  console.log('lot_id:', lot_id, 'type:', typeof lot_id);
  console.log('User:', req.user);
  console.log('=== getValuationByLotId DEBUG END ===');

  // Validate parameters
  const parsedLotId = parseInt(lot_id);
  const parsedPlanId = parseInt(plan_id);
  
  console.log('After parseInt - parsedLotId:', parsedLotId, 'parsedPlanId:', parsedPlanId);
  
  if (isNaN(parsedLotId) || isNaN(parsedPlanId)) {
    console.error('Invalid lot_id or plan_id:', { lot_id, plan_id, parsedLotId, parsedPlanId });
    return res.status(400).json({ 
      success: false, 
      message: "Invalid lot_id or plan_id. Must be numbers." 
    });
  }

  Valuation.getByLotId(parsedLotId, parsedPlanId, (err, results) => {
    if (err) {
      console.error("Error fetching valuation:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching valuation",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      data: results.length > 0 ? results[0] : null
    });
  });
};

// Get all valuations for a plan
const getValuationsByPlanId = (req, res) => {
  const { plan_id } = req.params;

  console.log('getValuationsByPlanId called with plan_id:', plan_id);

  const parsedPlanId = parseInt(plan_id);
  
  if (isNaN(parsedPlanId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid plan_id. Must be a number."
    });
  }

  Valuation.getByPlanId(parsedPlanId, (err, results) => {
    if (err) {
      console.error("Error fetching valuations:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching valuations",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  });
};

// Test database connection and table structure
const testDatabase = (req, res) => {
  const db = require("../config/db");
  
  // Test table structure
  const sql = "DESCRIBE lot_valuations";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database test error:", err);
      return res.status(500).json({
        success: false,
        message: "Database test failed",
        error: err.message
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Database connection successful",
      tableStructure: results
    });
  });
};

module.exports = {
  createOrUpdateValuation,
  getValuationByLotId,
  getValuationsByPlanId,
  testDatabase
};