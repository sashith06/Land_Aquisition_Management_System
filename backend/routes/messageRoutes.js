const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');

// Apply authentication middleware to all message routes
router.use(verifyToken);

// Initialize message tables (admin/development endpoint)
router.post('/initialize', MessageController.initializeTables);

// Create new message (with file upload support)
router.post('/', MessageController.createMessage);

// Get messages (inbox/outbox)
router.get('/', MessageController.getMessages);

// Get unread message count
router.get('/unread-count', MessageController.getUnreadCount);

// Get users available for messaging
router.get('/users', MessageController.getMessagingUsers);

// Search messages
router.get('/search', MessageController.searchMessages);

// Get specific message by ID
router.get('/:messageId', MessageController.getMessageById);

// Get message thread/conversation
router.get('/:messageId/thread', MessageController.getMessageThread);

// Mark message as read
router.patch('/:messageId/read', MessageController.markAsRead);

// Delete message
router.delete('/:messageId', MessageController.deleteMessage);

// Download attachment
router.get('/:messageId/attachments/:attachmentId/download', MessageController.downloadAttachment);

module.exports = router;
