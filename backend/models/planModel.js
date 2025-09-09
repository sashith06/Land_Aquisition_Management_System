const db = require("../config/db");

const Plan = {};

// Create new plan with actual database schema
Plan.create = (plan, userId, callback) => {
  console.log('=== DEBUG: Plan.create called ===');
  console.log('Plan data:', plan);
  console.log('User ID:', userId);
  
  // Generate plan number if not provided
  const planNumber = plan.plan_number || `PLAN-${Date.now()}`;
  
  // Map the input data to actual database columns - save ALL form data
  const sql = `
    INSERT INTO plans 
    (project_id, plan_number, description, location, total_extent, status, created_by, 
     estimated_cost, estimated_extent, advance_trading_no, divisional_secretary, 
     current_extent_value, section_07_gazette_no, section_07_gazette_date, 
     section_38_gazette_no, section_38_gazette_date, section_5_gazette_no, pending_cost_estimate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    plan.project_id || null,
    planNumber,
    plan.description || null,
    plan.location || plan.divisional_secretary || null,
    plan.total_extent || plan.estimated_extent || null,
    plan.status || 'pending',
    userId,
    plan.estimated_cost || null,
    plan.estimated_extent || null,
    plan.advance_trading_no || null,
    plan.divisional_secretary || null,
    plan.current_extent_value || null,
    plan.section_07_gazette_no || null,
    plan.section_07_gazette_date || null,
    plan.section_38_gazette_no || null,
    plan.section_38_gazette_date || null,
    plan.section_5_gazette_no || null,
    plan.pending_cost_estimate || null
  ];

  console.log('Executing SQL with actual schema...');
  console.log('SQL:', sql);
  console.log('Params:', params);
  
  db.query(sql, params, callback);
};

// Get all plans - the actual table doesn't have project_id, so get all plans
Plan.getByProject = (project_id, callback) => {
  const sql = `
    SELECT p.*, 
           pr.name as project_name,
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM plans p
    LEFT JOIN projects pr ON p.project_id = pr.id
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.project_id = ?
    ORDER BY p.created_at DESC
  `;
  db.query(sql, [project_id], callback);
};

// Get single plan
Plan.findById = (id, callback) => {
  const sql = `
    SELECT p.*, 
           pr.name as project_name,
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM plans p
    LEFT JOIN projects pr ON p.project_id = pr.id
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.id = ?
  `;
  db.query(sql, [id], callback);
};

// Get plans created by a specific user
Plan.getByCreator = (userId, callback) => {
  const sql = `
    SELECT p.*, 
           pr.name as project_name,
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM plans p
    LEFT JOIN projects pr ON p.project_id = pr.id
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.created_by = ?
    ORDER BY p.created_at DESC
  `;
  db.query(sql, [userId], callback);
};

// Update plan
Plan.update = (id, plan, userId, callback) => {
  console.log('=== Plan.update MODEL DEBUG START ===');
  console.log('Plan ID:', id);
  console.log('User ID:', userId);
  console.log('Plan data received:', JSON.stringify(plan, null, 2));
  
  let fields = [];
  let values = [];

  // Only allow updates from the plan creator - using actual database columns
  const allowedFields = [
    'plan_number', 'description', 'location', 'total_extent', 'status',
    'estimated_cost', 'estimated_extent', 'advance_trading_no', 
    'divisional_secretary', 'current_extent_value', 'section_07_gazette_no',
    'section_07_gazette_date', 'section_38_gazette_no', 'section_38_gazette_date',
    'section_5_gazette_no', 'pending_cost_estimate'
  ];

  console.log('Allowed fields:', allowedFields);

  for (const [key, value] of Object.entries(plan)) {
    console.log(`Processing field: ${key} = ${value} (allowed: ${allowedFields.includes(key)})`);
    if (value !== undefined && allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  console.log('Fields to update:', fields);
  console.log('Values for update:', values);

  if (fields.length === 0) {
    console.log('No valid fields to update');
    console.log('=== Plan.update MODEL DEBUG END (NO FIELDS) ===');
    return callback(new Error('No valid fields to update'));
  }

  fields.push("updated_at = CURRENT_TIMESTAMP");

  const sql = `UPDATE plans SET ${fields.join(", ")} WHERE id = ? AND created_by = ?`;
  values.push(id, userId);

  console.log('Final SQL:', sql);
  console.log('Final values:', values);
  console.log('=== Plan.update MODEL DEBUG END ===');

  db.query(sql, values, callback);
};

// Delete plan - only by creator (with cascading deletes)
Plan.delete = (id, userId, callback) => {
  console.log('Plan.delete called with id:', id, 'userId:', userId);
  
  // Start a transaction to handle cascading deletes
  db.beginTransaction((err) => {
    if (err) {
      console.log('Transaction begin error:', err);
      return callback(err);
    }
    
    console.log('Starting cascading deletion for plan ID:', id);
    
    // First, delete related lot_owners records
    const deleteLotOwnersQuery = "DELETE FROM lot_owners WHERE plan_id = ?";
    console.log('Executing query:', deleteLotOwnersQuery, 'with params:', [id]);
    
    db.query(deleteLotOwnersQuery, [id], (err, result) => {
      if (err) {
        console.log('Error deleting lot_owners:', err);
        return db.rollback(() => {
          callback(err);
        });
      }
      
      console.log('Lot owners deleted:', result.affectedRows, 'records');
      
      // Then delete related lots
      const deleteLotsQuery = "DELETE FROM lots WHERE plan_id = ?";
      console.log('Executing query:', deleteLotsQuery, 'with params:', [id]);
      
      db.query(deleteLotsQuery, [id], (err, result) => {
        if (err) {
          console.log('Error deleting lots:', err);
          return db.rollback(() => {
            callback(err);
          });
        }
        
        console.log('Lots deleted:', result.affectedRows, 'records');
        
        // Finally, delete the plan itself (only if created by user)
        const deletePlanQuery = "DELETE FROM plans WHERE id = ? AND created_by = ?";
        console.log('Executing query:', deletePlanQuery, 'with params:', [id, userId]);
        
        db.query(deletePlanQuery, [id, userId], (err, result) => {
          if (err) {
            console.log('Error deleting plan:', err);
            return db.rollback(() => {
              callback(err);
            });
          }
          
          console.log('Plan deletion result:', result);
          
          // Commit the transaction
          db.commit((err) => {
            if (err) {
              console.log('Transaction commit error:', err);
              return db.rollback(() => {
                callback(err);
              });
            }
            
            console.log('Plan and related records deleted successfully');
            callback(null, result);
          });
        });
      });
    });
  });
};

// Get plans with permissions for Land Officers - simplified for actual schema
Plan.getByProjectWithPermissions = (project_id, userId, userRole, callback) => {
  const sql = `
    SELECT p.*, 
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM plans p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.created_by = ?
    ORDER BY p.created_at DESC
  `;
  db.query(sql, [userId], callback);
};

// Get plans with role-based access control - ALL users can see all plans
Plan.getByUserRole = (userId, userRole, callback) => {
  const sql = `
    SELECT p.*, 
           pr.name as project_name,
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM plans p
    LEFT JOIN projects pr ON p.project_id = pr.id
    LEFT JOIN users u ON p.created_by = u.id
    ORDER BY p.created_at DESC
  `;
  
  db.query(sql, [], callback);
};

// Get plans by project with role-based access - ALL users can see plans for any project
Plan.getByProjectWithRole = (project_id, userId, userRole, callback) => {
  // All authenticated users can see plans for any project
  Plan.getByProject(project_id, callback);
};

// Get all plans for assigned projects
Plan.getAllPlansForAssignedProjects = (landOfficerId, callback) => {
  const sql = `
    SELECT p.*, 
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM plans p
    LEFT JOIN users u ON p.created_by = u.id
    ORDER BY p.created_at DESC
  `;
  db.query(sql, [], callback);
};

// Update plan status
Plan.updateStatus = (id, status, callback) => {
  const sql = "UPDATE plans SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
  db.query(sql, [status, id], callback);
};

module.exports = Plan;
