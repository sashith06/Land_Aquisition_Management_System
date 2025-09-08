const db = require("../config/db");

const Compensation = {};

// Create or update compensation details for a lot
Compensation.createOrUpdate = (compensationData, callback) => {
  // Check if compensation exists
  const checkSql = "SELECT id FROM lot_compensations WHERE lot_id = ? AND plan_id = ?";
  
  db.query(checkSql, [compensationData.lot_id, compensationData.plan_id], (err, results) => {
    if (err) {
      return callback(err);
    }
    
    if (results.length > 0) {
      // Update existing compensation
      const updateSql = `
        UPDATE lot_compensations 
        SET owner_data = ?, compensation_payment = ?, interest_payment = ?, 
            interest_voucher = ?, account_division = ?, total_compensation = ?,
            status = ?, updated_by = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      const updateParams = [
        JSON.stringify(compensationData.owner_data || []),
        JSON.stringify(compensationData.compensation_payment || {}),
        JSON.stringify(compensationData.interest_payment || {}),
        JSON.stringify(compensationData.interest_voucher || {}),
        JSON.stringify(compensationData.account_division || {}),
        compensationData.total_compensation || 0,
        compensationData.status || 'completed',
        compensationData.updated_by,
        results[0].id
      ];
      
      db.query(updateSql, updateParams, callback);
    } else {
      // Create new compensation
      const insertSql = `
        INSERT INTO lot_compensations 
        (plan_id, lot_id, owner_data, compensation_payment, interest_payment, 
         interest_voucher, account_division, total_compensation, status, 
         created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const insertParams = [
        compensationData.plan_id,
        compensationData.lot_id,
        JSON.stringify(compensationData.owner_data || []),
        JSON.stringify(compensationData.compensation_payment || {}),
        JSON.stringify(compensationData.interest_payment || {}),
        JSON.stringify(compensationData.interest_voucher || {}),
        JSON.stringify(compensationData.account_division || {}),
        compensationData.total_compensation || 0,
        compensationData.status || 'completed',
        compensationData.created_by
      ];
      
      db.query(insertSql, insertParams, callback);
    }
  });
};

// Get compensation details for a lot
Compensation.getByLotId = (lotId, planId, callback) => {
  const sql = `
    SELECT c.*, 
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
           CONCAT(u2.first_name, ' ', u2.last_name) as updated_by_name
    FROM lot_compensations c
    LEFT JOIN users u ON c.created_by = u.id
    LEFT JOIN users u2 ON c.updated_by = u2.id
    WHERE c.lot_id = ? AND c.plan_id = ?
  `;
  db.query(sql, [lotId, planId], (err, results) => {
    if (err) return callback(err);
    
    if (results.length > 0) {
      // Parse JSON fields
      const compensation = results[0];
      try {
        compensation.owner_data = JSON.parse(compensation.owner_data || '[]');
        compensation.compensation_payment = JSON.parse(compensation.compensation_payment || '{}');
        compensation.interest_payment = JSON.parse(compensation.interest_payment || '{}');
        compensation.interest_voucher = JSON.parse(compensation.interest_voucher || '{}');
        compensation.account_division = JSON.parse(compensation.account_division || '{}');
      } catch (parseErr) {
        return callback(parseErr);
      }
    }
    
    callback(null, results);
  });
};

// Get all compensations for a plan
Compensation.getByPlanId = (planId, callback) => {
  const sql = `
    SELECT c.*, l.lot_no,
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM lot_compensations c
    LEFT JOIN lots l ON c.lot_id = l.id
    LEFT JOIN users u ON c.created_by = u.id
    WHERE c.plan_id = ?
    ORDER BY l.lot_no ASC
  `;
  db.query(sql, [planId], (err, results) => {
    if (err) return callback(err);
    
    // Parse JSON fields for each result
    results.forEach(compensation => {
      try {
        compensation.owner_data = JSON.parse(compensation.owner_data || '[]');
        compensation.compensation_payment = JSON.parse(compensation.compensation_payment || '{}');
        compensation.interest_payment = JSON.parse(compensation.interest_payment || '{}');
        compensation.interest_voucher = JSON.parse(compensation.interest_voucher || '{}');
        compensation.account_division = JSON.parse(compensation.account_division || '{}');
      } catch (parseErr) {
        // Leave as string if parsing fails
      }
    });
    
    callback(null, results);
  });
};

module.exports = Compensation;
