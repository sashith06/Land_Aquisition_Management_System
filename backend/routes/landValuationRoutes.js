const express = require('express');
const router = express.Router();
const landValuationController = require('../controllers/landValuationController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Get all projects for valuation (based on user role)
router.get('/projects', landValuationController.getProjects);

// Get project details with plans
router.get('/projects/:projectId', landValuationController.getProjectDetails);

// Calculate valuation for a project
router.post('/projects/:projectId/calculate', landValuationController.calculateValuation);

// Get valuation history
router.get('/projects/:projectId/history', landValuationController.getValuationHistory);

// Get statistics
router.get('/stats', landValuationController.getStats);

// Clear cache (CE only)
router.post('/cache/clear', landValuationController.clearCache);

module.exports = router;
