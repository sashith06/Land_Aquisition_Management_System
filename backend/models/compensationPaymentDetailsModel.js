const db = require('../config/db');

class CompensationPaymentDetails {
  // Create or update payment details
  static createOrUpdate(paymentData, callback) {
    const {
      plan_id,
      lot_id,
      owner_nic,
      owner_name,
      
      // Essential fields from frontend
      final_compensation_amount,
      
      // Compensation Payment Details (optional)
      compensation_full_payment_date,
      compensation_full_payment_cheque_no,
      compensation_full_payment_deducted_amount,
      compensation_full_payment_paid_amount,
      
      compensation_part_payment_01_date,
      compensation_part_payment_01_cheque_no,
      compensation_part_payment_01_deducted_amount,
      compensation_part_payment_01_paid_amount,
      
      compensation_part_payment_02_date,
      compensation_part_payment_02_cheque_no,
      compensation_part_payment_02_deducted_amount,
      compensation_part_payment_02_paid_amount,
      
      // Interest Payment Details (optional)
      interest_full_payment_date,
      interest_full_payment_cheque_no,
      interest_full_payment_deducted_amount,
      interest_full_payment_paid_amount,
      
      interest_part_payment_01_date,
      interest_part_payment_01_cheque_no,
      interest_part_payment_01_deducted_amount,
      interest_part_payment_01_paid_amount,
      
      interest_part_payment_02_date,
      interest_part_payment_02_cheque_no,
      interest_part_payment_02_deducted_amount,
      interest_part_payment_02_paid_amount,
      
      // Account Division Details (optional)
      send_account_division_date,
      calculated_interest_amount,
      account_division_sent_date,
      account_division_cheque_no,
      account_division_deducted_amount,
      account_division_paid_amount,
      
      // Metadata
      created_by,
      updated_by
    } = paymentData;

    // Check if record exists
    const checkQuery = `
      SELECT id FROM compensation_payment_details 
      WHERE plan_id = ? AND lot_id = ? AND owner_nic = ?
    `;

    db.query(checkQuery, [plan_id, lot_id, owner_nic], (checkErr, checkResult) => {
      if (checkErr) {
        console.error('Error checking existing payment details:', checkErr);
        return callback(checkErr);
      }

      if (checkResult.length > 0) {
        // Update existing record
        const updateQuery = `
          UPDATE compensation_payment_details SET
            owner_name = ?,
            final_compensation_amount = ?,
            compensation_full_payment_date = ?,
            compensation_full_payment_cheque_no = ?,
            compensation_full_payment_deducted_amount = ?,
            compensation_full_payment_paid_amount = ?,
            compensation_part_payment_01_date = ?,
            compensation_part_payment_01_cheque_no = ?,
            compensation_part_payment_01_deducted_amount = ?,
            compensation_part_payment_01_paid_amount = ?,
            compensation_part_payment_02_date = ?,
            compensation_part_payment_02_cheque_no = ?,
            compensation_part_payment_02_deducted_amount = ?,
            compensation_part_payment_02_paid_amount = ?,
            interest_full_payment_date = ?,
            interest_full_payment_cheque_no = ?,
            interest_full_payment_deducted_amount = ?,
            interest_full_payment_paid_amount = ?,
            interest_part_payment_01_date = ?,
            interest_part_payment_01_cheque_no = ?,
            interest_part_payment_01_deducted_amount = ?,
            interest_part_payment_01_paid_amount = ?,
            interest_part_payment_02_date = ?,
            interest_part_payment_02_cheque_no = ?,
            interest_part_payment_02_deducted_amount = ?,
            interest_part_payment_02_paid_amount = ?,
            send_account_division_date = ?,
            calculated_interest_amount = ?,
            account_division_sent_date = ?,
            updated_by = ?,
            updated_at = NOW()
          WHERE id = ?
        `;

        const updateValues = [
          owner_name,
          final_compensation_amount || 0,
          compensation_full_payment_date || null,
          compensation_full_payment_cheque_no || null,
          compensation_full_payment_deducted_amount || 0,
          compensation_full_payment_paid_amount || 0,
          compensation_part_payment_01_date || null,
          compensation_part_payment_01_cheque_no || null,
          compensation_part_payment_01_deducted_amount || 0,
          compensation_part_payment_01_paid_amount || 0,
          compensation_part_payment_02_date || null,
          compensation_part_payment_02_cheque_no || null,
          compensation_part_payment_02_deducted_amount || 0,
          compensation_part_payment_02_paid_amount || 0,
          interest_full_payment_date || null,
          interest_full_payment_cheque_no || null,
          interest_full_payment_deducted_amount || 0,
          interest_full_payment_paid_amount || 0,
          interest_part_payment_01_date || null,
          interest_part_payment_01_cheque_no || null,
          interest_part_payment_01_deducted_amount || 0,
          interest_part_payment_01_paid_amount || 0,
          interest_part_payment_02_date || null,
          interest_part_payment_02_cheque_no || null,
          interest_part_payment_02_deducted_amount || 0,
          interest_part_payment_02_paid_amount || 0,
          send_account_division_date || null,
          calculated_interest_amount || 0,
          account_division_sent_date || null,
          updated_by,
          checkResult[0].id
        ];

        db.query(updateQuery, updateValues, callback);
      } else {
        // Insert new record
        const insertQuery = `
          INSERT INTO compensation_payment_details (
            plan_id, lot_id, owner_nic, owner_name, final_compensation_amount,
            compensation_full_payment_date, compensation_full_payment_cheque_no,
            compensation_full_payment_deducted_amount, compensation_full_payment_paid_amount,
            compensation_part_payment_01_date, compensation_part_payment_01_cheque_no,
            compensation_part_payment_01_deducted_amount, compensation_part_payment_01_paid_amount,
            compensation_part_payment_02_date, compensation_part_payment_02_cheque_no,
            compensation_part_payment_02_deducted_amount, compensation_part_payment_02_paid_amount,
            interest_full_payment_date, interest_full_payment_cheque_no,
            interest_full_payment_deducted_amount, interest_full_payment_paid_amount,
            interest_part_payment_01_date, interest_part_payment_01_cheque_no,
            interest_part_payment_01_deducted_amount, interest_part_payment_01_paid_amount,
            interest_part_payment_02_date, interest_part_payment_02_cheque_no,
            interest_part_payment_02_deducted_amount, interest_part_payment_02_paid_amount,
            send_account_division_date, calculated_interest_amount, account_division_sent_date,
            created_by, updated_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertValues = [
          plan_id,
          lot_id,
          owner_nic,
          owner_name,
          final_compensation_amount || 0,
          compensation_full_payment_date || null,
          compensation_full_payment_cheque_no || null,
          compensation_full_payment_deducted_amount || 0,
          compensation_full_payment_paid_amount || 0,
          compensation_part_payment_01_date || null,
          compensation_part_payment_01_cheque_no || null,
          compensation_part_payment_01_deducted_amount || 0,
          compensation_part_payment_01_paid_amount || 0,
          compensation_part_payment_02_date || null,
          compensation_part_payment_02_cheque_no || null,
          compensation_part_payment_02_deducted_amount || 0,
          compensation_part_payment_02_paid_amount || 0,
          interest_full_payment_date || null,
          interest_full_payment_cheque_no || null,
          interest_full_payment_deducted_amount || 0,
          interest_full_payment_paid_amount || 0,
          interest_part_payment_01_date || null,
          interest_part_payment_01_cheque_no || null,
          interest_part_payment_01_deducted_amount || 0,
          interest_part_payment_01_paid_amount || 0,
          interest_part_payment_02_date || null,
          interest_part_payment_02_cheque_no || null,
          interest_part_payment_02_deducted_amount || 0,
          interest_part_payment_02_paid_amount || 0,
          send_account_division_date || null,
          calculated_interest_amount || 0,
          account_division_sent_date || null,
          created_by,
          updated_by
        ];

        db.query(insertQuery, insertValues, callback);
      }
    });
  }

  // Get payment details by plan_id, lot_id, and owner_nic
  static getByOwner(plan_id, lot_id, owner_nic, callback) {
    const query = `
      SELECT * FROM compensation_payment_details 
      WHERE plan_id = ? AND lot_id = ? AND owner_nic = ?
    `;

    db.query(query, [plan_id, lot_id, owner_nic], (err, results) => {
      if (err) {
        console.error('Error fetching payment details:', err);
        return callback(err);
      }

      // Format date columns to avoid timezone conversion issues
      const formattedResults = results.map(row => {
        const formatted = { ...row };
        
        // Format all date columns to YYYY-MM-DD strings
        const dateColumns = [
          'compensation_full_payment_date',
          'compensation_part_payment_01_date', 
          'compensation_part_payment_02_date',
          'interest_full_payment_date',
          'interest_part_payment_01_date',
          'interest_part_payment_02_date', 
          'account_division_sent_date'
        ];
        
        dateColumns.forEach(col => {
          if (formatted[col] && formatted[col] instanceof Date) {
            // Convert Date object to YYYY-MM-DD string without timezone conversion
            const year = formatted[col].getFullYear();
            const month = String(formatted[col].getMonth() + 1).padStart(2, '0');
            const day = String(formatted[col].getDate()).padStart(2, '0');
            formatted[col] = `${year}-${month}-${day}`;
          }
        });
        
        return formatted;
      });

      callback(null, formattedResults);
    });
  }

  // Get all payment details for a lot
  static getByLot(plan_id, lot_id, callback) {
    const query = `
      SELECT * FROM compensation_payment_details 
      WHERE plan_id = ? AND lot_id = ?
      ORDER BY owner_name
    `;

    db.query(query, [plan_id, lot_id], (err, results) => {
      if (err) {
        console.error('Error fetching payment details for lot:', err);
        return callback(err);
      }

      // Format date columns to avoid timezone conversion issues
      const formattedResults = results.map(row => {
        const formatted = { ...row };
        
        // Format all date columns to YYYY-MM-DD strings
        const dateColumns = [
          'compensation_full_payment_date',
          'compensation_part_payment_01_date', 
          'compensation_part_payment_02_date',
          'interest_full_payment_date',
          'interest_part_payment_01_date',
          'interest_part_payment_02_date', 
          'account_division_sent_date'
        ];
        
        dateColumns.forEach(col => {
          if (formatted[col] && formatted[col] instanceof Date) {
            // Convert Date object to YYYY-MM-DD string without timezone conversion
            const year = formatted[col].getFullYear();
            const month = String(formatted[col].getMonth() + 1).padStart(2, '0');
            const day = String(formatted[col].getDate()).padStart(2, '0');
            formatted[col] = `${year}-${month}-${day}`;
          }
        });
        
        return formatted;
      });

      callback(null, formattedResults);
    });
  }

  // Get all payment details for a plan
  static getByPlan(plan_id, callback) {
    const query = `
      SELECT cpd.*, l.lot_no 
      FROM compensation_payment_details cpd
      JOIN lots l ON cpd.lot_id = l.id
      WHERE cpd.plan_id = ?
      ORDER BY l.lot_no, cpd.owner_name
    `;

    db.query(query, [plan_id], (err, results) => {
      if (err) {
        return callback(err);
      }

      callback(null, results);
    });
  }

  // Delete payment details
  static delete(plan_id, lot_id, owner_nic, callback) {
    const query = `
      DELETE FROM compensation_payment_details 
      WHERE plan_id = ? AND lot_id = ? AND owner_nic = ?
    `;

    db.query(query, [plan_id, lot_id, owner_nic], callback);
  }

  // Get payment summary for a plan
  static getPaymentSummary(plan_id, callback) {
    console.log('CompensationPaymentDetails Model - getPaymentSummary called with plan_id:', plan_id);
    
    const query = `
      SELECT 
        l.lot_no,
        COUNT(cpd.id) as total_owners,
        SUM(COALESCE(cpd.compensation_full_payment_paid_amount, 0) + 
            COALESCE(cpd.compensation_part_payment_01_paid_amount, 0) + 
            COALESCE(cpd.compensation_part_payment_02_paid_amount, 0)) as total_compensation_paid,
        SUM(COALESCE(cpd.interest_full_payment_paid_amount, 0) + 
            COALESCE(cpd.interest_part_payment_01_paid_amount, 0) + 
            COALESCE(cpd.interest_part_payment_02_paid_amount, 0)) as total_interest_paid,
        SUM(COALESCE(cpd.compensation_full_payment_deducted_amount, 0) + 
            COALESCE(cpd.compensation_part_payment_01_deducted_amount, 0) + 
            COALESCE(cpd.compensation_part_payment_02_deducted_amount, 0) +
            COALESCE(cpd.interest_full_payment_deducted_amount, 0) + 
            COALESCE(cpd.interest_part_payment_01_deducted_amount, 0) + 
            COALESCE(cpd.interest_part_payment_02_deducted_amount, 0)) as total_deducted
      FROM compensation_payment_details cpd
      JOIN lots l ON cpd.lot_id = l.id
      WHERE cpd.plan_id = ?
      GROUP BY l.lot_no
      ORDER BY l.lot_no
    `;

    db.query(query, [plan_id], (err, results) => {
      if (err) {
        return callback(err);
      }

      callback(null, results);
    });
  }
}

module.exports = CompensationPaymentDetails;