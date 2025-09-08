const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Public route for dashboard statistics (no authentication required for public display)
router.get('/dashboard', statsController.getDashboardStats);

// Protected route for detailed statistics (requires authentication)
router.get('/detailed', statsController.getDetailedStats);

module.exports = router;
