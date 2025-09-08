const db = require("../config/db");

const Project = {};

// ============ CREATE NEW PROJECT ============
Project.create = (project, userId, callback) => {
  const sql = `
    INSERT INTO projects 
    (name, description, initial_estimated_cost, created_by, status) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    project.name,
    project.description || null,
    project.initial_estimated_cost || null,
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
    SELECT p.*, 
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
    SELECT p.*, 
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
    SELECT p.*, 
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
    SELECT p.*, 
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
    SELECT p.*, 
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
    SELECT p.*, 
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
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  db.query(sql, [projectId], callback);
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
  // First delete related notifications
  const deleteNotificationsSql = `DELETE FROM notifications WHERE related_id = ? AND related_type = 'project'`;
  
  db.query(deleteNotificationsSql, [projectId], (notifErr) => {
    if (notifErr) return callback(notifErr);
    
    // Then delete the project (plans will be deleted automatically due to CASCADE)
    const deleteProjectSql = `DELETE FROM projects WHERE id = ?`;
    db.query(deleteProjectSql, [projectId], callback);
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
