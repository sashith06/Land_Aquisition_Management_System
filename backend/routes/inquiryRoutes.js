const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { verifyToken, requireLandOfficer, requireEngineers, requireAll, requireSystemAdmin, requireLandowner, requireOfficers } = require('../middleware/authMiddleware');

// Landowner creates inquiry
router.post('/create', verifyToken, requireLandowner, inquiryController.createInquiryWithFiles);

// Get inquiries by lot (all staff)
router.get('/lot/:lotId', verifyToken, requireAll, inquiryController.getInquiriesByLot);

// Admin deletes inquiry
router.delete('/:id', verifyToken, requireSystemAdmin, inquiryController.deleteInquiry);

// Mark inquiry as read (only land officers)
router.put('/:id/read', verifyToken, requireLandOfficer, inquiryController.markAsRead);

// Get my inquiries (for landowners)
router.get('/my', verifyToken, requireLandowner, inquiryController.getMyInquiries);

// Get unread inquiries count (for all staff)
router.get('/unread-count', verifyToken, requireAll, inquiryController.getUnreadInquiriesCount);

// Get recent inquiries for notifications (for all staff)
router.get('/recent', verifyToken, requireAll, inquiryController.getRecentInquiries);

module.exports = router;
