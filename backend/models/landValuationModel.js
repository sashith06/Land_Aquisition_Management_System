const db = require("../config/db");

const LandValuation = {};

/**
 * Get all plans for a project with necessary details for valuation
 */
LandValuation.getPlansByProject = (projectId, callback) => {
  const sql = `
    SELECT 
      p.id,
      p.plan_identifier,
      p.description,
      p.divisional_secretary,
      p.total_extent,
      p.estimated_extent,
      p.current_extent_value,
      p.estimated_cost,
      p.created_at,
      pr.name as project_name
    FROM plans p
    LEFT JOIN projects pr ON p.project_id = pr.id
    WHERE p.project_id = ?
    ORDER BY p.created_at DESC
  `;
  
  db.query(sql, [projectId], callback);
};

/**
 * Get project details
 */
LandValuation.getProjectDetails = (projectId, callback) => {
  const sql = `
    SELECT 
      p.id,
      p.name,
      p.description,
      p.initial_estimated_cost,
      p.status,
      p.created_at,
      CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
      (SELECT COUNT(*) FROM plans WHERE project_id = p.id) as total_plans
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.id = ?
  `;
  
  db.query(sql, [projectId], callback);
};

/**
 * Get all projects accessible to user (based on role)
 */
LandValuation.getProjectsByRole = (userId, userRole, callback) => {
  let sql = `
    SELECT 
      p.id,
      p.name,
      p.description,
      p.status,
      p.created_at,
      CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
      (SELECT COUNT(*) FROM plans WHERE project_id = p.id) as total_plans
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
  `;
  
  let whereCondition = '';
  let params = [];
  
  // Role-based access control
  if (userRole === 'CE' || userRole === 'chief_engineer') {
    // Chief Engineer can see all projects
    whereCondition = '';
  } else if (userRole === 'PE' || userRole === 'project_engineer') {
    // Project Engineer can see only their projects
    whereCondition = 'WHERE p.created_by = ?';
    params = [userId];
  } else {
    // Other roles - no access
    whereCondition = 'WHERE 1=0'; // Return empty
  }
  
  sql += whereCondition + ' ORDER BY p.created_at DESC';
  
  db.query(sql, params, callback);
};

/**
 * Get the latest stored valuation for a project
 */
LandValuation.getStoredValuation = (projectId, callback) => {
  const sql = `
    SELECT 
      lv.*,
      CONCAT(u.first_name, ' ', u.last_name) as calculated_by_name
    FROM land_valuations lv
    LEFT JOIN users u ON lv.calculated_by = u.id
    WHERE lv.project_id = ?
    ORDER BY lv.calculated_at DESC
    LIMIT 1
  `;
  
  db.query(sql, [projectId], callback);
};

/**
 * Save valuation results (optional - for caching/history)
 */
LandValuation.saveValuationResults = (projectId, valuationData, userId, callback) => {
  const sql = `
    INSERT INTO land_valuations 
    (project_id, valuation_data, total_value, calculated_by, calculated_at)
    VALUES (?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
    valuation_data = VALUES(valuation_data),
    total_value = VALUES(total_value),
    calculated_by = VALUES(calculated_by),
    calculated_at = NOW()
  `;
  
  db.query(sql, [
    projectId,
    JSON.stringify(valuationData),
    valuationData.totalValue,
    userId
  ], callback);
};

/**
 * Get valuation history for a project
 */
LandValuation.getValuationHistory = (projectId, callback) => {
  const sql = `
    SELECT 
      lv.*,
      CONCAT(u.first_name, ' ', u.last_name) as calculated_by_name
    FROM land_valuations lv
    LEFT JOIN users u ON lv.calculated_by = u.id
    WHERE lv.project_id = ?
    ORDER BY lv.calculated_at DESC
    LIMIT 10
  `;
  
  db.query(sql, [projectId], callback);
};

/**
 * Get statistics for dashboard
 */
LandValuation.getValuationStats = (userId, userRole, callback) => {
  let sql = `
    SELECT 
      COUNT(DISTINCT p.id) as total_projects,
      COUNT(pl.id) as total_plans,
      SUM(pl.estimated_cost) as total_estimated_cost
    FROM projects p
    LEFT JOIN plans pl ON p.project_id = pl.id
  `;
  
  let whereCondition = '';
  let params = [];
  
  if (userRole === 'PE' || userRole === 'project_engineer') {
    whereCondition = 'WHERE p.created_by = ?';
    params = [userId];
  }
  // CE sees all projects - no where clause needed
  
  sql += whereCondition;
  
  db.query(sql, params, callback);
};

module.exports = LandValuation;
