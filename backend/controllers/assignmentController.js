const AssignmentModel = require('../models/assignmentModel');
const Notification = require('../models/notificationModel');

class AssignmentController {
  // Get all approved land officers
  static async getLandOfficers(req, res) {
    try {
      const landOfficers = await AssignmentModel.getLandOfficers();
      res.json(landOfficers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch land officers' });
    }
  }

  // Assign a project to a land officer
  static async assignProject(req, res) {
    try {
      const { projectId, landOfficerId } = req.body;
      const assignedBy = req.user.id; // From JWT middleware
      
      // First, get project details and land officer details for the notification
      const db = require('../config/db');
      
      // Get project details and verify it's approved
      const [projectResult] = await new Promise((resolve, reject) => {
        db.query('SELECT name, status FROM projects WHERE id = ?', [projectId], (err, rows) => {
          if (err) reject(err);
          else resolve([rows]);
        });
      });
      
      if (projectResult.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      // Check if project is approved by Chief Engineer
      if (projectResult[0].status !== 'approved') {
        return res.status(400).json({ 
          error: 'Project must be approved by Chief Engineer before assignment',
          currentStatus: projectResult[0].status
        });
      }
      
      // Get land officer details
      const [officerResult] = await new Promise((resolve, reject) => {
        db.query('SELECT first_name, last_name FROM users WHERE id = ?', [landOfficerId], (err, rows) => {
          if (err) reject(err);
          else resolve([rows]);
        });
      });
      
      // Get project engineer details
      const [engineerResult] = await new Promise((resolve, reject) => {
        db.query('SELECT first_name, last_name FROM users WHERE id = ?', [assignedBy], (err, rows) => {
          if (err) reject(err);
          else resolve([rows]);
        });
      });
      
      if (officerResult.length === 0) {
        return res.status(404).json({ error: 'Land officer not found' });
      }
      
      const projectName = projectResult[0].name;
      const officerName = `${officerResult[0].first_name} ${officerResult[0].last_name}`;
      const engineerName = `${engineerResult[0].first_name} ${engineerResult[0].last_name}`;
      
      // Assign the project
      const result = await AssignmentModel.assignProject(projectId, landOfficerId, assignedBy);
      
      // Create notification for the land officer
      const notification = {
        user_id: landOfficerId,
        type: 'project_assigned',
        title: 'New Project Assignment',
        message: `You have been assigned to project "${projectName}" by Project Engineer ${engineerName}. You can now create plans and lots for this project.`
      };
      
      // Create the notification (using callback-based approach)
      Notification.create(notification, (notifErr) => {
        // Don't fail the assignment if notification fails
      });
      
      res.json({ 
        message: `Project "${projectName}" has been successfully assigned to ${officerName}`,
        assignmentId: result.insertId 
      });
    } catch (error) {
      console.error('Error assigning project:', error);
      res.status(500).json({ error: 'Failed to assign project' });
    }
  }

  // Get projects assigned to the current land officer
  static async getAssignedProjects(req, res) {
    try {
      const projects = await AssignmentModel.getAssignedProjects(req.user.id);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching assigned projects:', error);
      res.status(500).json({ error: 'Failed to fetch assigned projects' });
    }
  }

  // Check if current user can edit a specific project
  static async canEditProject(req, res) {
    try {
      const { projectId } = req.params;
      
      // Only land officers need to check assignment
      if (req.user.role !== 'LO') {
        return res.json({ canEdit: false });
      }
      
      const canEdit = await AssignmentModel.canEditProject(req.user.id, projectId);
      res.json({ canEdit });
    } catch (error) {
      console.error('Error checking edit permission:', error);
      res.status(500).json({ error: 'Failed to check edit permission' });
    }
  }

  // Get all assignments for a project (for project engineers)
  static async getProjectAssignments(req, res) {
    try {
      const { projectId } = req.params;
      const assignments = await AssignmentModel.getProjectAssignments(projectId);
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching project assignments:', error);
      res.status(500).json({ error: 'Failed to fetch project assignments' });
    }
  }

  // Remove assignment
  static async removeAssignment(req, res) {
    try {
      const { projectId, landOfficerId } = req.body;
      
      await AssignmentModel.removeAssignment(projectId, landOfficerId);
      res.json({ message: 'Assignment removed successfully' });
    } catch (error) {
      console.error('Error removing assignment:', error);
      res.status(500).json({ error: 'Failed to remove assignment' });
    }
  }
}

module.exports = AssignmentController;
