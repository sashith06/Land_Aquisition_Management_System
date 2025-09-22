const Compensation = require("../models/compensationModel");

// Create or update compensation
const createOrUpdateCompensation = (req, res) => {
  const { plan_id, lot_id } = req.params;
  
  console.log('=== COMPENSATION CONTROLLER DEBUG ===');
  console.log('User:', req.user);
  console.log('User ID:', req.user?.id);
  console.log('User Role:', req.user?.role);
  console.log('createOrUpdateCompensation called with:', { plan_id, lot_id });
  console.log('Request Body:', req.body);
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

  const compensationData = {
    plan_id: parsedPlanId,
    lot_id: parsedLotId,
    ...req.body,
    created_by: req.user.id,
    updated_by: req.user.id
  };

  // Calculate total compensation from owner data with better error handling
  let totalCompensation = 0;
  try {
    if (compensationData.owner_data && Array.isArray(compensationData.owner_data)) {
      totalCompensation = compensationData.owner_data.reduce((sum, owner) => {
        const amount = parseFloat(owner.compensation_amount || 0);
        if (isNaN(amount)) {
          console.warn('Invalid compensation amount for owner:', owner);
          return sum;
        }
        return sum + amount;
      }, 0);
    }
    
    compensationData.total_compensation = totalCompensation;
    console.log('Calculated total compensation:', totalCompensation);
  } catch (error) {
    console.error('Error calculating total compensation:', error);
    return res.status(400).json({
      success: false,
      message: "Error calculating total compensation. Please check owner data."
    });
  }

  console.log('Saving compensation data:', compensationData);

  Compensation.createOrUpdate(compensationData, (err, result) => {
    if (err) {
      console.error("Error saving compensation:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error saving compensation",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    console.log('Compensation saved successfully:', result);
    res.status(200).json({
      success: true,
      message: "Compensation saved successfully",
      data: {
        id: result.insertId || result.affectedRows,
        total_compensation: totalCompensation
      }
    });
  });
};

// Get compensation by lot ID
const getCompensationByLotId = (req, res) => {
  const { plan_id, lot_id } = req.params;

  console.log('=== getCompensationByLotId DEBUG START ===');
  console.log('Raw req.params:', req.params);
  console.log('plan_id:', plan_id, 'type:', typeof plan_id);
  console.log('lot_id:', lot_id, 'type:', typeof lot_id);
  console.log('User:', req.user);
  console.log('=== getCompensationByLotId DEBUG END ===');

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

  Compensation.getByLotId(parsedLotId, parsedPlanId, (err, results) => {
    if (err) {
      console.error("Error fetching compensation:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching compensation",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // Instead of returning 404 for no results, return null data (like valuation does)
    console.log('Compensation results:', results);
    res.status(200).json({
      success: true,
      data: results.length > 0 ? results[0] : null
    });
  });
};

// Get all compensations for a plan
const getCompensationsByPlanId = (req, res) => {
  const { plan_id } = req.params;

  console.log('getCompensationsByPlanId called with plan_id:', plan_id);

  const parsedPlanId = parseInt(plan_id);
  
  if (isNaN(parsedPlanId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid plan_id. Must be a number."
    });
  }

  Compensation.getByPlanId(parsedPlanId, (err, results) => {
    if (err) {
      console.error("Error fetching compensations:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching compensations",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  });
};

module.exports = {
  createOrUpdateCompensation,
  getCompensationByLotId,
  getCompensationsByPlanId
};