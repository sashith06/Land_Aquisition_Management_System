const db = require("../config/db");

const Project = {};

// ============ CREATE NEW PROJECT ============
Project.create = (project, userId, callback) => {
  const sql = `
    INSERT INTO projects 
    (name, description, initial_estimated_cost, initial_extent_ha, initial_extent_perch,
     section_2_order, section_2_com, advance_tracing_no, advance_tracing_date,
     section_5_no, section_5_no_date, compensation_type, notes, created_by, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    project.name,
    project.description || project.notes || null, // Use notes if description is not provided
    project.initial_estimated_cost || null,
    project.initial_extent_ha || null,
    project.initial_extent_perch || null,
    project.section_2_order || null,
    project.section_2_com || null,
    project.advance_tracing_no || null,
    project.advance_tracing_date || null,
    project.section_5_no || null,
    project.section_5_no_date || null,
    project.compensation_type || 'regulation',
    project.notes || null,
    userId,
    "pending"
  ], callback);
};

// ============ UPDATE PROJECT ============
Project.update = (id, project, callback) => {
  let fields = [];
  let values = [];

  for (const [key, value] of Object.entries(project)) {
    if (value !== undefined) { // only update provided fields
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  // always update timestamp
  fields.push("updated_at = CURRENT_TIMESTAMP");

  const sql = `UPDATE projects SET ${fields.join(", ")} WHERE id = ?`;
  values.push(id);

  db.query(sql, values, callback);
};

// ============ GET PROJECTS ============
Project.findById = (id, callback) => {
  const sql = `
    SELECT p.*, p.rejection_reason,
           CONCAT(creator.first_name, ' ', creator.last_name) as creator_name, 
           CONCAT(approver.first_name, ' ', approver.last_name) as approver_name
    FROM projects p
    LEFT JOIN users creator ON p.created_by = creator.id
    LEFT JOIN users approver ON p.approved_by = approver.id
    WHERE p.id = ?
  `;
  db.query(sql, [id], callback);
};

// ============ GET PROJECTS WITH ROLE-BASED ACCESS ============
// Chief Engineer: All projects
// Project Engineer: Only projects they created
// Financial Officer: Only approved projects (for valuation/compensation work)
// Land Officer: Only projects assigned to them
Project.getByUserRole = (userId, userRole, callback) => {
  let sql = `
    SELECT p.*, p.rejection_reason,
           CONCAT(creator.first_name, ' ', creator.last_name) as creator_name, 
           CONCAT(approver.first_name, ' ', approver.last_name) as approver_name
    FROM projects p
    LEFT JOIN users creator ON p.created_by = creator.id
    LEFT JOIN users approver ON p.approved_by = approver.id
  `;
  
  let whereCondition = '';
  let params = [];
  
  switch(userRole) {
    case 'CE': // Chief Engineer - can see all projects
    case 'chief_engineer':
      whereCondition = '';
      break;
      
    case 'PE': // Project Engineer - only projects they created
    case 'project_engineer':
      whereCondition = 'WHERE p.created_by = ?';
      params = [userId];
      break;
      
    case 'FO': // Financial Officer - only approved projects (for valuation/compensation)
    case 'financial_officer':
      whereCondition = 'WHERE p.status = ?';
      params = ['approved'];
      break;
      
    case 'LO': // Land Officer - only assigned projects
    case 'land_officer':
      sql = `
        SELECT p.*, 
               CONCAT(creator.first_name, ' ', creator.last_name) as creator_name, 
               CONCAT(approver.first_name, ' ', approver.last_name) as approver_name,
               pa.assigned_at,
               CONCAT(assigner.first_name, ' ', assigner.last_name) as assigned_by_name
        FROM projects p
        LEFT JOIN users creator ON p.created_by = creator.id
        LEFT JOIN users approver ON p.approved_by = approver.id
        INNER JOIN project_assignments pa ON p.id = pa.project_id
        LEFT JOIN users assigner ON pa.assigned_by = assigner.id
        WHERE pa.land_officer_id = ? AND pa.status = 'active' AND p.status = 'approved'
      `;
      params = [userId];
      break;
      
    default:
      return callback(new Error('Invalid user role'));
  }
  
  const finalSql = sql + whereCondition + ' ORDER BY p.created_at DESC';
  db.query(finalSql, params, callback);
};

Project.getAll = (callback) => {
  const sql = `
    SELECT p.*, p.rejection_reason,
           CONCAT(creator.first_name, ' ', creator.last_name) as creator_name, 
           CONCAT(approver.first_name, ' ', approver.last_name) as approver_name
    FROM projects p
    LEFT JOIN users creator ON p.created_by = creator.id
    LEFT JOIN users approver ON p.approved_by = approver.id
    ORDER BY p.created_at DESC
  `;
  db.query(sql, callback);
};

Project.getByStatus = (status, callback) => {
  const sql = `
    SELECT p.*, p.rejection_reason,
           CONCAT(creator.first_name, ' ', creator.last_name) as creator_name, 
           CONCAT(approver.first_name, ' ', approver.last_name) as approver_name
    FROM projects p
    LEFT JOIN users creator ON p.created_by = creator.id
    LEFT JOIN users approver ON p.approved_by = approver.id
    WHERE p.status = ?
    ORDER BY p.created_at DESC
  `;
  db.query(sql, [status], callback);
};

Project.getPending = (callback) => {
  Project.getByStatus('pending', callback);
};

Project.getApproved = (callback) => {
  Project.getByStatus('approved', callback);
};

Project.getByCreator = (userId, callback) => {
  const sql = `
    SELECT p.*, p.rejection_reason,
           CONCAT(creator.first_name, ' ', creator.last_name) as creator_name, 
           CONCAT(approver.first_name, ' ', approver.last_name) as approver_name
    FROM projects p
    LEFT JOIN users creator ON p.created_by = creator.id
    LEFT JOIN users approver ON p.approved_by = approver.id
    WHERE p.created_by = ?
    ORDER BY p.created_at DESC
  `;
  db.query(sql, [userId], callback);
};

// Get only approved projects created by a specific user (for assignment)
Project.getApprovedProjectsByCreator = (userId, callback) => {
  const sql = `
    SELECT p.*, p.rejection_reason,
           CONCAT(creator.first_name, ' ', creator.last_name) as creator_name, 
           CONCAT(approver.first_name, ' ', approver.last_name) as approver_name
    FROM projects p
    LEFT JOIN users creator ON p.created_by = creator.id
    LEFT JOIN users approver ON p.approved_by = approver.id
    WHERE p.created_by = ? AND p.status = 'approved'
    ORDER BY p.created_at DESC
  `;
  db.query(sql, [userId], callback);
};

// ============ APPROVAL WORKFLOW ============
Project.approve = (projectId, approverId, callback) => {
  const sql = `
    UPDATE projects 
    SET status = 'approved', 
        approved_by = ?, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  db.query(sql, [approverId, projectId], callback);
};

Project.reject = (projectId, rejecterId, rejectionReason, callback) => {
  const sql = `
    UPDATE projects 
    SET status = 'rejected', 
        approved_by = ?, 
        rejection_reason = ?,
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  db.query(sql, [rejecterId, rejectionReason, projectId], callback);
};

// ============ STATISTICS ============
Project.getStats = (callback) => {
  const sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM projects
  `;
  db.query(sql, callback);
};

// ============ DELETE PROJECT ============
Project.delete = (projectId, callback) => {
  console.log(`Starting deletion of project ${projectId} and all related records`);
  
  // Use transaction to ensure all deletions succeed or none do
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return callback(err);
    }
    
    // Delete in proper order to respect foreign key constraints
    const deleteQueries = [
      // 1. Delete lot_valuations (references lots)
      "DELETE FROM lot_valuations WHERE lot_id IN (SELECT id FROM lots WHERE plan_id IN (SELECT id FROM plans WHERE project_id = ?))",
      // 2. Delete lot_compensations (references lots)
      "DELETE FROM lot_compensations WHERE lot_id IN (SELECT id FROM lots WHERE plan_id IN (SELECT id FROM plans WHERE project_id = ?))",
      // 3. Delete lot_owners (references lots)
      "DELETE FROM lot_owners WHERE lot_id IN (SELECT id FROM lots WHERE plan_id IN (SELECT id FROM plans WHERE project_id = ?))",
      // 4. Delete lots (references plans)
      "DELETE FROM lots WHERE plan_id IN (SELECT id FROM plans WHERE project_id = ?)",
      // 5. Delete plans (references projects)
      "DELETE FROM plans WHERE project_id = ?",
      // 6. Delete project assignments
      "DELETE FROM project_assignments WHERE project_id = ?",
      // 7. Delete project documents
      "DELETE FROM project_documents WHERE project_id = ?",
      // 8. Delete audit logs related to this project
      "DELETE FROM audit_logs WHERE table_name = 'projects' AND record_id = ?",
      // 9. Finally delete the project
      "DELETE FROM projects WHERE id = ?"
    ];
    
    let completedQueries = 0;
    let hasError = false;
    
    const executeNextQuery = () => {
      if (hasError || completedQueries >= deleteQueries.length) {
        if (hasError) {
          return db.rollback(() => {
            callback(new Error('Failed to delete project due to foreign key constraints'));
          });
        }
        
        // All queries completed successfully, commit transaction
        db.commit((err) => {
          if (err) {
            console.error('Error committing transaction:', err);
            return callback(err);
          }
          
          console.log(`Project ${projectId} and all related records deleted successfully`);
          callback(null, { message: 'Project and all related data deleted successfully' });
        });
        return;
      }
      
      const query = deleteQueries[completedQueries];
      const params = [projectId]; // All queries use projectId as parameter
      
      console.log(`Executing query ${completedQueries + 1}/${deleteQueries.length}:`, query);
      
      db.query(query, params, (err, result) => {
        if (err) {
          console.error(`Error executing query ${completedQueries + 1}:`, err);
          
          // If the error is due to a missing table, continue with the next query
          if (err.code === 'ER_NO_SUCH_TABLE') {
            console.log(`Table doesn't exist for query ${completedQueries + 1}, skipping...`);
            completedQueries++;
            return executeNextQuery();
          }
          
          // For other errors, fail the transaction
          hasError = true;
          return executeNextQuery();
        }
        
        console.log(`Query ${completedQueries + 1} completed, affected rows:`, result.affectedRows);
        completedQueries++;
        executeNextQuery();
      });
    };
    
    // Start executing queries
    executeNextQuery();
  });
};

// ============ GET PENDING PROJECTS ============
Project.getPendingProjects = (callback) => {
  const sql = `
    SELECT 
      p.*,
      CONCAT(u.first_name, ' ', u.last_name) as creator_name,
      u.email as creator_email
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.status = 'pending'
    ORDER BY p.created_at DESC
  `;
  db.query(sql, callback);
};

module.exports = Project;
