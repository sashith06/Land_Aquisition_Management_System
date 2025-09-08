const db = require("../config/db");

const Valuation = {};

// Create or update valuation details for a lot
Valuation.createOrUpdate = (valuationData, callback) => {
  // First check if valuation exists
  const checkSql = "SELECT id FROM lot_valuations WHERE lot_id = ? AND plan_id = ?";
  
  db.query(checkSql, [valuationData.lot_id, valuationData.plan_id], (err, results) => {
    if (err) {
      return callback(err);
    }
    
    if (results.length > 0) {
      // Update existing valuation
      const updateSql = `
        UPDATE lot_valuations 
        SET statutorily_amount = ?, addition_amount = ?, development_amount = ?, 
            court_amount = ?, thirty_three_amount = ?, board_of_review_amount = ?,
            total_value = ?, assessment_date = ?, assessor_name = ?, notes = ?,
            status = ?, updated_by = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      const updateParams = [
        valuationData.statutorily_amount || 0,
        valuationData.addition_amount || 0,
        valuationData.development_amount || 0,
        valuationData.court_amount || 0,
        valuationData.thirty_three_amount || 0,
        valuationData.board_of_review_amount || 0,
        valuationData.total_value || 0,
        valuationData.assessment_date,
        valuationData.assessor_name,
        valuationData.notes,
        valuationData.status || 'completed',
        valuationData.updated_by,
        results[0].id
      ];
      
      db.query(updateSql, updateParams, callback);
    } else {
      // Create new valuation
      const insertSql = `
        INSERT INTO lot_valuations 
        (plan_id, lot_id, statutorily_amount, addition_amount, development_amount, 
         court_amount, thirty_three_amount, board_of_review_amount, total_value,
         assessment_date, assessor_name, notes, status, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const insertParams = [
        valuationData.plan_id,
        valuationData.lot_id,
        valuationData.statutorily_amount || 0,
        valuationData.addition_amount || 0,
        valuationData.development_amount || 0,
        valuationData.court_amount || 0,
        valuationData.thirty_three_amount || 0,
        valuationData.board_of_review_amount || 0,
        valuationData.total_value || 0,
        valuationData.assessment_date,
        valuationData.assessor_name,
        valuationData.notes,
        valuationData.status || 'completed',
        valuationData.created_by
      ];
      
      db.query(insertSql, insertParams, callback);
    }
  });
};

// Get valuation details for a lot
Valuation.getByLotId = (lotId, planId, callback) => {
  const sql = `
    SELECT v.*, 
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
           CONCAT(u2.first_name, ' ', u2.last_name) as updated_by_name
    FROM lot_valuations v
    LEFT JOIN users u ON v.created_by = u.id
    LEFT JOIN users u2 ON v.updated_by = u2.id
    WHERE v.lot_id = ? AND v.plan_id = ?
  `;
  db.query(sql, [lotId, planId], callback);
};

// Get all valuations for a plan
Valuation.getByPlanId = (planId, callback) => {
  const sql = `
    SELECT v.*, l.lot_no,
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM lot_valuations v
    LEFT JOIN lots l ON v.lot_id = l.id
    LEFT JOIN users u ON v.created_by = u.id
    WHERE v.plan_id = ?
    ORDER BY l.lot_no ASC
  `;
  db.query(sql, [planId], callback);
};

module.exports = Valuation;
