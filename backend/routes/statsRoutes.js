const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Public route for dashboard statistics (no authentication required for public display)
router.get('/dashboard', statsController.getDashboardStats);

// Protected route for detailed statistics (requires authentication)
router.get('/detailed', statsController.getDetailedStats);

// New route for comprehensive dashboard analytics
router.get('/analytics', statsController.getDashboardAnalytics);

// Route for real-time project progress data
router.get('/progress', statsController.getProjectProgressData);

// Route for detailed project hierarchy with filtering
router.get('/project-hierarchy', statsController.getProjectHierarchy);

// Route for comprehensive progress analytics using new progress system
router.get('/progress-analytics', statsController.getProgressAnalytics);

module.exports = router;
