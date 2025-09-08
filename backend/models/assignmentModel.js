const db = require('../config/db');
const dbPromise = require('../config/db').promise;

class AssignmentModel {
  // Create project_assignments table if it doesn't exist
  static async createTable() {
    // First, check if table exists and has correct structure
    const checkTableQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'project_assignments' 
      AND COLUMN_NAME = 'assigned_at'
    `;
    
    try {
      const [checkResult] = await dbPromise.execute(checkTableQuery);
      
      // If assigned_at column doesn't exist, drop and recreate table
      if (checkResult.length === 0) {
        console.log('Dropping and recreating project_assignments table with correct structure...');
        await dbPromise.execute('DROP TABLE IF EXISTS project_assignments');
      }
    } catch (error) {
      console.log('Table check failed, proceeding with creation...');
    }
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS project_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        land_officer_id INT NOT NULL,
        assigned_by INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive') DEFAULT 'active',
        UNIQUE KEY unique_assignment (project_id, land_officer_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (land_officer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;
    
    try {
      const [result] = await dbPromise.execute(createTableQuery);
      console.log('Project assignments table ready');
    } catch (error) {
      console.error('Error creating project_assignments table:', error);
      throw error;
    }
  }

  // Get all approved land officers
  static async getLandOfficers() {
    const query = `
      SELECT id, first_name, last_name, email
      FROM users 
      WHERE role = 'LO' AND status = 'approved'
      ORDER BY first_name, last_name
    `;
    
    try {
      console.log('Executing land officers query:', query);
      console.log('Using database promise connection...');
      
      // Test connection first
      const [testResult] = await dbPromise.execute('SELECT 1 as test');
      console.log('Database connection test successful:', testResult);
      
      const [rows] = await dbPromise.execute(query);
      console.log('Query executed successfully, found', rows.length, 'land officers');
      console.log('Land officers data:', JSON.stringify(rows, null, 2));
      return rows;
    } catch (error) {
      console.error('Error fetching land officers from DB:', error);
      console.error('DB Error details:', error.message, error.code, error.sqlState);
      
      // Try with callback-based connection as fallback
      console.log('Attempting fallback with callback-based connection...');
      try {
        const fallbackResult = await new Promise((resolve, reject) => {
          db.query(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
        console.log('Callback connection successful, found', fallbackResult.length, 'land officers');
        return fallbackResult;
      } catch (fallbackError) {
        console.error('Fallback connection also failed:', fallbackError);
        throw error; // throw original error
      }
    }
  }

  // Assign a project to a land officer
  static async assignProject(projectId, landOfficerId, assignedBy) {
    const query = `
      INSERT INTO project_assignments (project_id, land_officer_id, assigned_by)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        assigned_by = VALUES(assigned_by),
        assigned_at = CURRENT_TIMESTAMP,
        status = 'active'
    `;
    
    try {
      const [result] = await dbPromise.execute(query, [projectId, landOfficerId, assignedBy]);
      return result;
    } catch (error) {
      console.error('Error assigning project:', error);
      throw error;
    }
  }

    // Get projects assigned to a specific land officer
  static async getAssignedProjects(landOfficerId) {
    const query = `
      SELECT 
        p.*,
        pa.assigned_at,
        pa.status as assignment_status,
        u.first_name as assigned_by_first_name,
        u.last_name as assigned_by_last_name
      FROM project_assignments pa
      JOIN projects p ON pa.project_id = p.id
      JOIN users u ON pa.assigned_by = u.id
      WHERE pa.land_officer_id = ? AND pa.status = 'active' AND p.status = 'approved'
      ORDER BY pa.assigned_at DESC
    `;
    
    try {
      const [rows] = await dbPromise.execute(query, [landOfficerId]);
      return rows;
    } catch (error) {
      console.error('Error fetching assigned projects:', error);
      throw error;
    }
  }

  // Check if a land officer can edit a specific project
  static async canEditProject(landOfficerId, projectId) {
    const query = `
      SELECT COUNT(*) as count
      FROM project_assignments 
      WHERE land_officer_id = ? AND project_id = ? AND status = 'active'
    `;
    
    try {
      const [rows] = await dbPromise.execute(query, [landOfficerId, projectId]);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking project edit permission:', error);
      throw error;
    }
  }

    // Get all assignments for a project
  static async getProjectAssignments(projectId) {
    const query = `
      SELECT 
        pa.id,
        pa.project_id,
        pa.land_officer_id,
        pa.assigned_by,
        pa.assigned_at,
        pa.status,
        u.first_name,
        u.last_name,
        u.email
      FROM project_assignments pa
      JOIN users u ON pa.land_officer_id = u.id
      WHERE pa.project_id = ? AND pa.status = 'active'
      ORDER BY pa.assigned_at DESC
    `;
    
    try {
      const [rows] = await dbPromise.execute(query, [projectId]);
      return rows;
    } catch (error) {
      console.error('Error fetching project assignments:', error);
      throw error;
    }
  }

  // Remove assignment
  static async removeAssignment(projectId, landOfficerId) {
    const query = `
      UPDATE project_assignments 
      SET status = 'inactive' 
      WHERE project_id = ? AND land_officer_id = ?
    `;
    
    try {
      const [result] = await dbPromise.execute(query, [projectId, landOfficerId]);
      return result;
    } catch (error) {
      console.error('Error removing assignment:', error);
      throw error;
    }
  }
}

module.exports = AssignmentModel;
