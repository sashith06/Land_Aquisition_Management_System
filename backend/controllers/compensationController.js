const Compensation = require("../models/compensationModel");

// Create or update compensation
const createOrUpdateCompensation = (req, res) => {
  const { plan_id, lot_id } = req.params;
  
  console.log('createOrUpdateCompensation called with:', { plan_id, lot_id });
  
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

  const compensationData = {
    plan_id: parsedPlanId,
    lot_id: parsedLotId,
    ...req.body,
    created_by: req.user.id,
    updated_by: req.user.id
  };

  // Calculate total compensation from owner data
  let totalCompensation = 0;
  if (compensationData.owner_data && Array.isArray(compensationData.owner_data)) {
    totalCompensation = compensationData.owner_data.reduce((sum, owner) => {
      return sum + parseFloat(owner.compensation_amount || 0);
    }, 0);
  }
  
  compensationData.total_compensation = totalCompensation;

  console.log('Saving compensation data:', compensationData);

  Compensation.createOrUpdate(compensationData, (err, result) => {
    if (err) {
      console.error("Error saving compensation:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error saving compensation" 
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

  console.log('getCompensationByLotId called with:', { plan_id, lot_id });

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
        message: "Error fetching compensation" 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No compensation found for this lot"
      });
    }

    console.log('Compensation found:', results[0]);
    res.status(200).json({
      success: true,
      data: results[0]
    });
  });
};

// Get all compensations for a plan
const getCompensationsByPlanId = (req, res) => {
  const { plan_id } = req.params;

  Compensation.getByPlanId(parseInt(plan_id), (err, results) => {
    if (err) {
      console.error("Error fetching compensations:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching compensations" 
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
