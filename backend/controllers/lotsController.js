const db = require('../config/db');
const jwt = require('jsonwebtoken');
const AssignmentModel = require('../models/assignmentModel');

class LotsController {
  
  // Create a new lot - Only Land Officers for their assigned projects
  static async createLot(req, res) {
    try {
      const { plan_id, lot_no, extent_ha, extent_perch, land_type } = req.body;
      
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      
      if (decoded.role !== 'land_officer') {
        return res.status(403).json({ error: 'Only land officers can create lots' });
      }
      
      // Check if the plan exists and if the land officer has permission
      const planCheckSql = `
        SELECT p.project_id 
        FROM plans p 
        INNER JOIN project_assignments pa ON pa.project_id = p.project_id 
        WHERE p.id = ? AND pa.land_officer_id = ? AND pa.status = 'active'
      `;
      
      db.query(planCheckSql, [plan_id, userId], (checkErr, checkResult) => {
        if (checkErr) {
          console.error('Error checking plan permission:', checkErr);
          return res.status(500).json({ error: 'Failed to verify permissions' });
        }
        
        if (checkResult.length === 0) {
          return res.status(403).json({ error: 'You are not assigned to this project or plan does not exist' });
        }
        
        // Create the lot
        const createSql = `
          INSERT INTO lots (plan_id, lot_no, extent_ha, extent_perch, land_type, created_by, status)
          VALUES (?, ?, ?, ?, ?, ?, 'created')
        `;
        
        db.query(createSql, [plan_id, lot_no, extent_ha, extent_perch, land_type, userId], (err, result) => {
          if (err) {
            console.error('Error creating lot:', err);
            return res.status(500).json({ error: 'Failed to create lot' });
          }
          
          res.json({ 
            message: 'Lot created successfully', 
            lotId: result.insertId 
          });
        });
      });
      
    } catch (error) {
      console.error('Error in createLot:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Get lots by plan with role-based permissions
  static async getLotsByPlan(req, res) {
    try {
      const { plan_id } = req.params;
      
      console.log('=== DEBUG: getLotsByPlan ===');
      console.log('Plan ID:', plan_id);
      
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      const userRole = decoded.role;
      
      console.log('User ID:', userId);
      console.log('User Role:', userRole);
      
      let sql = `
        SELECT l.*, 
               CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
               CONCAT(vu.first_name, ' ', vu.last_name) as valuation_officer_name,
               CONCAT(cu.first_name, ' ', cu.last_name) as compensation_officer_name
        FROM lots l
        LEFT JOIN users u ON l.created_by = u.id
        LEFT JOIN users vu ON l.valuation_officer_id = vu.id
        LEFT JOIN users cu ON l.compensation_officer_id = cu.id
        WHERE l.plan_id = ?
        ORDER BY l.created_at DESC
      `;
      
      db.query(sql, [plan_id], (err, rows) => {
        if (err) {
          console.error('Error fetching lots:', err);
          return res.status(500).json({ error: 'Failed to fetch lots' });
        }
        
        console.log('Raw lots from database:', rows);
        console.log('Number of lots found:', rows.length);
        
        // Add permissions based on role
        const lotsWithPermissions = rows.map(lot => {
          let permissions = {
            can_edit: false,
            can_delete: false,
            can_add_valuation: false,
            can_add_compensation: false,
            can_view: true
          };
          
          switch (userRole) {
            case 'land_officer':
              permissions.can_edit = lot.created_by === userId;
              permissions.can_delete = lot.created_by === userId;
              break;
            case 'financial_officer':
              permissions.can_add_valuation = true;
              permissions.can_add_compensation = true;
              break;
            case 'project_engineer':
            case 'chief_engineer':
              // View only access
              break;
          }
          
          return { ...lot, permissions };
        });
        
        console.log('Final lots with permissions:', lotsWithPermissions);
        console.log('=== END DEBUG ===');
        
        res.json(lotsWithPermissions);
      });
      
    } catch (error) {
      console.error('Error in getLotsByPlan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Update lot - Only creators can edit basic details
  static async updateLot(req, res) {
    try {
      const { id } = req.params;
      const { lot_no, extent_ha, extent_perch, land_type } = req.body;
      
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      
      if (decoded.role !== 'land_officer') {
        return res.status(403).json({ error: 'Only land officers can update lot details' });
      }
      
      const sql = `
        UPDATE lots 
        SET lot_no = ?, extent_ha = ?, extent_perch = ?, land_type = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND created_by = ?
      `;
      
      db.query(sql, [lot_no, extent_ha, extent_perch, land_type, userId, id, userId], (err, result) => {
        if (err) {
          console.error('Error updating lot:', err);
          return res.status(500).json({ error: 'Failed to update lot' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Lot not found or you do not have permission to update it' });
        }
        
        res.json({ message: 'Lot updated successfully' });
      });
      
    } catch (error) {
      console.error('Error in updateLot:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Add valuation details - Financial Officers only
  static async addValuation(req, res) {
    try {
      const { id } = req.params;
      const { valuation_amount, valuation_date, valuation_notes } = req.body;
      
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      
      if (decoded.role !== 'financial_officer') {
        return res.status(403).json({ error: 'Only financial officers can add valuation details' });
      }
      
      const sql = `
        UPDATE lots 
        SET valuation_amount = ?, valuation_date = ?, valuation_officer_id = ?, 
            valuation_notes = ?, status = 'valuation_completed', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.query(sql, [valuation_amount, valuation_date, userId, valuation_notes, id], (err, result) => {
        if (err) {
          console.error('Error adding valuation:', err);
          return res.status(500).json({ error: 'Failed to add valuation details' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Lot not found' });
        }
        
        res.json({ message: 'Valuation details added successfully' });
      });
      
    } catch (error) {
      console.error('Error in addValuation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Add compensation details - Financial Officers only
  static async addCompensation(req, res) {
    try {
      const { id } = req.params;
      const { compensation_amount, compensation_date, compensation_notes } = req.body;
      
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      
      if (decoded.role !== 'financial_officer') {
        return res.status(403).json({ error: 'Only financial officers can add compensation details' });
      }
      
      const sql = `
        UPDATE lots 
        SET compensation_amount = ?, compensation_date = ?, compensation_officer_id = ?, 
            compensation_notes = ?, status = 'compensation_completed', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.query(sql, [compensation_amount, compensation_date, userId, compensation_notes, id], (err, result) => {
        if (err) {
          console.error('Error adding compensation:', err);
          return res.status(500).json({ error: 'Failed to add compensation details' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Lot not found' });
        }
        
        res.json({ message: 'Compensation details added successfully' });
      });
      
    } catch (error) {
      console.error('Error in addCompensation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Delete lot - Only creators can delete
  static async deleteLot(req, res) {
    try {
      const { id } = req.params;
      
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      
      if (decoded.role !== 'land_officer') {
        return res.status(403).json({ error: 'Only land officers can delete lots' });
      }
      
      const sql = "DELETE FROM lots WHERE id = ? AND created_by = ?";
      
      db.query(sql, [id, userId], (err, result) => {
        if (err) {
          console.error('Error deleting lot:', err);
          return res.status(500).json({ error: 'Failed to delete lot' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Lot not found or you do not have permission to delete it' });
        }
        
        res.json({ message: 'Lot deleted successfully' });
      });
      
    } catch (error) {
      console.error('Error in deleteLot:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = LotsController;
