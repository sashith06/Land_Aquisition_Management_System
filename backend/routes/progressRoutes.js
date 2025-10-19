const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { verifyToken } = require('../middleware/authMiddleware');

// You can protect progress endpoints if needed; using auth middleware for consistency
router.get('/progress/plan/:plan_id', verifyToken, progressController.getPlanProgress);
router.get('/progress/plan/:plan_id/lot/:lot_id', verifyToken, progressController.getLotProgress);
router.get('/progress/project/:project_id', verifyToken, progressController.getProjectProgress);

module.exports = router;
