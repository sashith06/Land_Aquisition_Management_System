const Valuation = require("../models/valuationModel");

// Create or update valuation
const createOrUpdateValuation = (req, res) => {
  const { plan_id, lot_id } = req.params;
  
  console.log('createOrUpdateValuation called with:', { plan_id, lot_id });
  
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

  const valuationData = {
    plan_id: parsedPlanId,
    lot_id: parsedLotId,
    ...req.body,
    created_by: req.user.id,
    updated_by: req.user.id
  };

  // Calculate total value
  const totalValue = (
    parseFloat(valuationData.statutorily_amount || 0) +
    parseFloat(valuationData.addition_amount || 0) +
    parseFloat(valuationData.development_amount || 0) +
    parseFloat(valuationData.court_amount || 0) +
    parseFloat(valuationData.thirty_three_amount || 0) +
    parseFloat(valuationData.board_of_review_amount || 0)
  );
  
  valuationData.total_value = totalValue;

  console.log('Saving valuation data:', valuationData);

  Valuation.createOrUpdate(valuationData, (err, result) => {
    if (err) {
      console.error("Error saving valuation:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error saving valuation" 
      });
    }

    console.log('Valuation saved successfully:', result);
    res.status(200).json({
      success: true,
      message: "Valuation saved successfully",
      data: {
        id: result.insertId || result.affectedRows,
        total_value: totalValue
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
  console.log('=== getValuationByLotId DEBUG END ===');

  console.log('getValuationByLotId called with:', { plan_id, lot_id });

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
        message: "Error fetching valuation" 
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

  Valuation.getByPlanId(parseInt(plan_id), (err, results) => {
    if (err) {
      console.error("Error fetching valuations:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching valuations" 
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  });
};

module.exports = {
  createOrUpdateValuation,
  getValuationByLotId,
  getValuationsByPlanId
};
