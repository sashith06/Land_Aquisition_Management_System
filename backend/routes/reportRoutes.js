const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authMiddleware');

// Financial Progress Report Routes
router.get('/financial-progress', verifyToken, reportController.getFinancialProgressReport);

// Physical Progress Report Routes  
router.get('/physical-progress', verifyToken, reportController.getPhysicalProgressReport);

module.exports = router;