const express = require('express');
const router = express.Router();
const AssignmentController = require('../controllers/assignmentController');
const { verifyToken, requireProjectEngineer, requireLandOfficer, requireAll, requireChiefEngineer, authorize } = require('../middleware/authMiddleware');

// Test endpoint to check database connection (no auth required)
router.get('/test-db', async (req, res) => {
  try {
    const db = require('../config/db');
    db.query('SELECT COUNT(*) as total_users, SUM(CASE WHEN role = "LO" AND status = "approved" THEN 1 ELSE 0 END) as approved_land_officers FROM users', (err, rows) => {
      if (err) {
        console.error('Test DB query error:', err);
        return res.status(500).json({ error: 'Database connection failed', details: err.message });
      }
      res.json({
        message: 'Database connection successful',
        data: rows[0]
      });
    });
  } catch (error) {
    console.error('Test DB connection error:', error);
    res.status(500).json({ error: 'Database test failed', details: error.message });
  }
});

// Get all approved land officers (project engineers and chief engineers can access)
router.get('/land-officers', verifyToken, authorize('project_engineer', 'chief_engineer'), AssignmentController.getLandOfficers);

// Assign a project to a land officer (only project engineers can assign)
router.post('/assign', verifyToken, requireProjectEngineer, AssignmentController.assignProject);

// Get projects assigned to the current land officer (only land officers can access)
router.get('/assigned-projects', verifyToken, requireLandOfficer, AssignmentController.getAssignedProjects);

// Check if current user can edit a specific project (all authenticated users)
router.get('/can-edit/:projectId', verifyToken, requireAll, AssignmentController.canEditProject);

// Get all assignments for a project (project engineers and chief engineers)
router.get('/project/:projectId', verifyToken, authorize('project_engineer', 'chief_engineer'), AssignmentController.getProjectAssignments);

// Remove assignment (only project engineers)
router.post('/remove', verifyToken, requireProjectEngineer, AssignmentController.removeAssignment);

module.exports = router;
