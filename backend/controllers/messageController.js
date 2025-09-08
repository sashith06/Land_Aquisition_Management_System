const MessageModel = require('../models/messageModel');
const Notification = require('../models/notificationModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/messages');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${name}_${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images and documents
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and documents are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per message
  },
  fileFilter: fileFilter
});

class MessageController {
  
  // Initialize message tables
  static async initializeTables(req, res) {
    try {
      await MessageModel.createTables();
      res.json({ success: true, message: 'Message tables initialized successfully' });
    } catch (error) {
      console.error('Error initializing message tables:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error initializing message tables',
        error: error.message 
      });
    }
  }

  // Create a new message
  static createMessage = [
    upload.array('attachments', 5),
    async (req, res) => {
      try {
        const { recipient_id, subject, content, priority, message_type, parent_message_id } = req.body;
        const sender_id = req.user.id;

        // Validate required fields
        if (!recipient_id || !subject || !content) {
          return res.status(400).json({
            success: false,
            message: 'Recipient, subject, and content are required'
          });
        }

        const messageData = {
          sender_id,
          recipient_id: parseInt(recipient_id),
          subject: subject.trim(),
          content: content.trim(),
          priority: priority || 'normal',
          message_type: message_type || 'message',
          parent_message_id: parent_message_id ? parseInt(parent_message_id) : null
        };

        const attachments = req.files || [];
        const result = await MessageModel.create(messageData, attachments);

        // Create notification for message recipient
        try {
          // Get sender and recipient details for notification
          const db = require('../config/db');
          
          // Get sender details
          const senderQuery = 'SELECT first_name, last_name FROM users WHERE id = ?';
          db.query(senderQuery, [sender_id], (senderErr, senderResult) => {
            if (!senderErr && senderResult.length > 0) {
              const sender = senderResult[0];
              const senderName = `${sender.first_name} ${sender.last_name}`;
              
              // Create notification for recipient
              const notification = {
                user_id: messageData.recipient_id,
                type: Notification.TYPES.MESSAGE_RECEIVED,
                title: 'New Message Received',
                message: `You have received a new message from ${senderName}: "${messageData.subject}"`,
                related_id: result.messageId,
                related_type: 'message'
              };

              Notification.create(notification, (notifErr) => {
                if (notifErr) {
                  console.error('Error creating message notification:', notifErr);
                }
              });
            }
          });

        } catch (notificationError) {
          console.error('Error creating notification:', notificationError);
        }

        res.json({
          success: true,
          message: 'Message sent successfully',
          messageId: result.messageId,
          attachments: attachments.length
        });

      } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({
          success: false,
          message: 'Error sending message',
          error: error.message
        });
      }
    }
  ];

  // Get messages (inbox/outbox)
  static getMessages(req, res) {
    try {
      const userId = req.user.id;
      const { type = 'inbox', page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      MessageModel.getMessages(userId, type, parseInt(limit), offset, (err, messages) => {
        if (err) {
          console.error('Error fetching messages:', err);
          return res.status(500).json({
            success: false,
            message: 'Error fetching messages',
            error: err.message
          });
        }

        res.json({
          success: true,
          messages: messages,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: messages.length === parseInt(limit)
          }
        });
      });
    } catch (error) {
      console.error('Error in getMessages:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching messages',
        error: error.message
      });
    }
  }

  // Get specific message by ID
  static getMessageById(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      MessageModel.getMessageById(parseInt(messageId), userId, (err, message) => {
        if (err) {
          console.error('Error fetching message:', err);
          return res.status(500).json({
            success: false,
            message: 'Error fetching message',
            error: err.message
          });
        }

        if (!message) {
          return res.status(404).json({
            success: false,
            message: 'Message not found'
          });
        }

        // Mark as read if recipient is viewing
        if (message.recipient_id === userId && !message.is_read) {
          MessageModel.markAsRead(parseInt(messageId), userId, (markErr) => {
            if (markErr) {
              console.error('Error marking message as read:', markErr);
            }
          });
          message.is_read = 1;
        }

        res.json({
          success: true,
          message: message
        });
      });
    } catch (error) {
      console.error('Error in getMessageById:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching message',
        error: error.message
      });
    }
  }

  // Get message thread (conversation)
  static getMessageThread(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      MessageModel.getMessageThread(parseInt(messageId), userId, (err, thread) => {
        if (err) {
          console.error('Error fetching message thread:', err);
          return res.status(500).json({
            success: false,
            message: 'Error fetching message thread',
            error: err.message
          });
        }

        res.json({
          success: true,
          thread: thread
        });
      });
    } catch (error) {
      console.error('Error in getMessageThread:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching message thread',
        error: error.message
      });
    }
  }

  // Mark message as read
  static markAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      MessageModel.markAsRead(parseInt(messageId), userId, (err, result) => {
        if (err) {
          console.error('Error marking message as read:', err);
          return res.status(500).json({
            success: false,
            message: 'Error marking message as read',
            error: err.message
          });
        }

        // Also mark related message notifications as read
        try {
          const db = require('../config/db');
          const markNotificationQuery = `
            UPDATE notifications 
            SET is_read = 1, read_at = NOW() 
            WHERE user_id = ? AND related_id = ? AND related_type = 'message' AND type = 'message_received'
          `;
          
          db.query(markNotificationQuery, [userId, parseInt(messageId)], (notifErr) => {
            if (notifErr) {
              console.error('Error marking message notification as read:', notifErr);
            }
          });
        } catch (notificationError) {
          console.error('Error updating message notifications:', notificationError);
        }

        res.json({
          success: true,
          message: 'Message marked as read'
        });
      });
    } catch (error) {
      console.error('Error in markAsRead:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking message as read',
        error: error.message
      });
    }
  }

  // Get unread message count
  static getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      MessageModel.getUnreadCount(userId, (err, result) => {
        if (err) {
          console.error('Error fetching unread count:', err);
          return res.status(500).json({
            success: false,
            message: 'Error fetching unread count',
            error: err.message
          });
        }

        const count = result[0] ? result[0].count : 0;
        res.json({
          success: true,
          unreadCount: count
        });
      });
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching unread count',
        error: error.message
      });
    }
  }

  // Delete message
  static deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      MessageModel.deleteMessage(parseInt(messageId), userId, (err, result) => {
        if (err) {
          console.error('Error deleting message:', err);
          return res.status(500).json({
            success: false,
            message: 'Error deleting message',
            error: err.message
          });
        }

        res.json({
          success: true,
          message: 'Message deleted successfully'
        });
      });
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting message',
        error: error.message
      });
    }
  }

  // Get users for messaging
  static getMessagingUsers(req, res) {
    try {
      const userId = req.user.id;

      MessageModel.getMessagingUsers(userId, (err, users) => {
        if (err) {
          console.error('Error fetching messaging users:', err);
          return res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: err.message
          });
        }

        // Group users by role for better organization
        const groupedUsers = users.reduce((acc, user) => {
          if (!acc[user.role]) {
            acc[user.role] = [];
          }
          acc[user.role].push({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: user.role,
            department: user.department
          });
          return acc;
        }, {});

        res.json({
          success: true,
          users: users.map(user => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: user.role,
            department: user.department
          })),
          groupedUsers: groupedUsers
        });
      });
    } catch (error) {
      console.error('Error in getMessagingUsers:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  }

  // Search messages
  static searchMessages(req, res) {
    try {
      const { q } = req.query;
      const userId = req.user.id;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
      }

      MessageModel.searchMessages(userId, q.trim(), (err, messages) => {
        if (err) {
          console.error('Error searching messages:', err);
          return res.status(500).json({
            success: false,
            message: 'Error searching messages',
            error: err.message
          });
        }

        res.json({
          success: true,
          messages: messages,
          searchQuery: q.trim()
        });
      });
    } catch (error) {
      console.error('Error in searchMessages:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching messages',
        error: error.message
      });
    }
  }

  // Download attachment
  static downloadAttachment(req, res) {
    try {
      const { messageId, attachmentId } = req.params;
      const userId = req.user.id;

      // First verify user has access to the message
      MessageModel.getMessageById(parseInt(messageId), userId, (err, message) => {
        if (err) {
          console.error('Error verifying message access:', err);
          return res.status(500).json({
            success: false,
            message: 'Error verifying access'
          });
        }

        if (!message) {
          return res.status(404).json({
            success: false,
            message: 'Message not found or access denied'
          });
        }

        // Get attachment details
        const attachmentQuery = `
          SELECT * FROM message_attachments 
          WHERE id = ? AND message_id = ?
        `;

        const db = require('../config/db');
        db.query(attachmentQuery, [parseInt(attachmentId), parseInt(messageId)], (attachErr, attachments) => {
          if (attachErr) {
            console.error('Error fetching attachment:', attachErr);
            return res.status(500).json({
              success: false,
              message: 'Error fetching attachment'
            });
          }

          if (attachments.length === 0) {
            return res.status(404).json({
              success: false,
              message: 'Attachment not found'
            });
          }

          const attachment = attachments[0];
          const filePath = path.resolve(attachment.file_path);

          // Check if file exists
          fs.access(filePath)
            .then(() => {
              res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_filename}"`);
              res.setHeader('Content-Type', attachment.mime_type);
              res.sendFile(filePath);
            })
            .catch(() => {
              res.status(404).json({
                success: false,
                message: 'File not found on server'
              });
            });
        });
      });
    } catch (error) {
      console.error('Error in downloadAttachment:', error);
      res.status(500).json({
        success: false,
        message: 'Error downloading attachment',
        error: error.message
      });
    }
  }
}

module.exports = MessageController;
