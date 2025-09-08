const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");

// All notification routes require authentication
router.use(verifyToken);

// Get notifications for current user
router.get("/", notificationController.getNotifications);

// Get unread notifications count
router.get("/unread/count", notificationController.getUnreadCount);

// Get notification counts by type
router.get("/counts", notificationController.getNotificationCounts);

// Mark notification as read
router.put("/:id/read", notificationController.markAsRead);

// Mark all notifications as read
router.put("/mark-all-read", notificationController.markAllAsRead);

module.exports = router;
