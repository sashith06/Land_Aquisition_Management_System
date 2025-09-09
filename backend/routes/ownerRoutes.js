const express = require('express');
const router = express.Router();
const OwnerController = require('../controllers/ownerController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/lots/:lotId/owners', OwnerController.addOwnersToLot);
router.get('/owners', OwnerController.getAllOwners);

// OTP endpoints for landowner login
router.post('/request-otp', OwnerController.requestOtp);
router.post('/verify-otp', OwnerController.verifyOtp);

// Landowner dashboard
router.get('/dashboard', verifyToken, OwnerController.getLandownerDashboard);

module.exports = router;
