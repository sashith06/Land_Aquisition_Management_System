const Notification = require("../models/notificationModel");

// Get notifications for current user
exports.getNotifications = (req, res) => {
  const userId = req.user.id;
  const limit = req.query.limit || 10;

  Notification.getByUserId(userId, parseInt(limit), (err, notifications) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }
    res.json(notifications);
  });
};

// Get unread notifications count for current user
exports.getUnreadCount = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  Notification.getUnreadCount(userId, (err, result) => {
    if (err) {
      console.error("Error fetching unread count:", err);
      return res.status(500).json({ error: "Failed to fetch unread count" });
    }
    res.json({ count: result[0].count });
  });
};

// Get notification counts by type for current user/role
exports.getNotificationCounts = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // Get counts for different types based on role
  let queries = [];
  
  if (userRole === 'Chief Engineer') {
    queries.push(
      // Pending user approvals
      new Promise((resolve, reject) => {
        Notification.getCountByType(userId, 'user_registration', (err, result) => {
          if (err) reject(err);
          else resolve({ type: 'user_registrations', count: result[0].count });
        });
      }),
      // Pending project approvals
      new Promise((resolve, reject) => {
        Notification.getCountByType(userId, 'project_request', (err, result) => {
          if (err) reject(err);
          else resolve({ type: 'project_requests', count: result[0].count });
        });
      })
    );
  }

  Promise.all(queries)
    .then(results => {
      const counts = {};
      results.forEach(result => {
        counts[result.type] = result.count;
      });
      res.json(counts);
    })
    .catch(err => {
      console.error("Error fetching notification counts:", err);
      res.status(500).json({ error: "Failed to fetch notification counts" });
    });
};

// Mark notification as read
exports.markAsRead = (req, res) => {
  const { id } = req.params;

  Notification.markAsRead(id, (err, result) => {
    if (err) {
      console.error("Error marking notification as read:", err);
      return res.status(500).json({ error: "Failed to mark notification as read" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ message: "Notification marked as read" });
  });
};

// Mark all notifications as read for current user
exports.markAllAsRead = (req, res) => {
  const userId = req.user.id;

  Notification.markAllAsRead(userId, (err, result) => {
    if (err) {
      console.error("Error marking all notifications as read:", err);
      return res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
    res.json({ message: "All notifications marked as read", count: result.affectedRows });
  });
};
