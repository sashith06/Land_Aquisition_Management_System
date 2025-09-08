const db = require("../config/db");

const Notification = {};

// Create new notification
Notification.create = (notification, callback) => {
  const sql = `
    INSERT INTO notifications (user_id, type, title, message, created_at) 
    VALUES (?, ?, ?, ?, NOW())
  `;
  db.query(sql, [
    notification.user_id, 
    notification.type, 
    notification.title, 
    notification.message
  ], callback);
};

// Get notifications for a user with pagination
Notification.getByUserId = (userId, limit = 10, callback) => {
  const sql = `
    SELECT id, type, title, message, is_read, created_at
    FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `;
  db.query(sql, [userId, limit], callback);
};

// Get unread notifications count for a user
Notification.getUnreadCount = (userId, callback) => {
  const sql = "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0";
  db.query(sql, [userId], callback);
};

// Get unread notifications count by type for a user
Notification.getCountByType = (userId, type, callback) => {
  const sql = "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND type = ? AND is_read = 0";
  db.query(sql, [userId, type], callback);
};

// Get all notifications for Chief Engineer (or general notifications)
Notification.getForChiefEngineer = (limit = 10, callback) => {
  const sql = `
    SELECT id, type, title, message, is_read, created_at
    FROM notifications 
    WHERE user_id = 1
    ORDER BY created_at DESC 
    LIMIT ?
  `;
  db.query(sql, [limit], callback);
};

// Create notification for all users with a specific role
Notification.createForRole = (notification, role, callback) => {
  const sql = `
    INSERT INTO notifications (user_id, type, title, message, created_at) 
    SELECT id, ?, ?, ?, NOW()
    FROM users 
    WHERE role = ? AND status = 'approved'
  `;
  db.query(sql, [
    notification.type, 
    notification.title, 
    notification.message, 
    role
  ], callback);
};

// Mark notification as read
Notification.markAsRead = (notificationId, callback) => {
  const sql = "UPDATE notifications SET is_read = 1 WHERE id = ?";
  db.query(sql, [notificationId], callback);
};

// Mark all notifications as read for a user
Notification.markAllAsRead = (userId, callback) => {
  const sql = "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0";
  db.query(sql, [userId], callback);
};

// Delete old notifications (older than 30 days)
Notification.deleteOld = (callback) => {
  const sql = "DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)";
  db.query(sql, callback);
};

// Create notification for Chief Engineer (system admin - CE role)
Notification.createForChiefEngineer = (type, title, message, relatedId = null, callback) => {
  const notification = {
    user_id: 1, // Chief Engineer (CE) is the system admin - user ID 1
    type,
    title,
    message
  };
  Notification.create(notification, callback);
};

// Notification types
Notification.TYPES = {
  USER_REGISTRATION: 'user_registration',
  USER_APPROVED: 'user_approved',
  USER_REJECTED: 'user_rejected',
  PROJECT_REQUEST: 'project_request',
  PROJECT_APPROVED: 'project_approved',
  PROJECT_REJECTED: 'project_rejected',
  PROJECT_ASSIGNED: 'project_assigned',
  MESSAGE_RECEIVED: 'message_received',
  MESSAGE_SENT: 'message_sent',
  SYSTEM_MESSAGE: 'system_message'
};

module.exports = Notification;
