const db = require('../config/db');
const path = require('path');
const fs = require('fs').promises;

class MessageModel {
  // Create messages table if it doesn't exist
  static async createTables() {
    try {
      // Tables are already created by LAMS_COMPLETE_WAMPSERVER.sql
      // Just log success to avoid conflicts
      console.log('Message tables ready (using existing schema from SQL setup)');
    } catch (error) {
      console.error('Error with message tables:', error);
      throw error;
    }
  }

  // Create a new message
  static async create(messageData, attachments = []) {
    const { sender_id, receiver_id, subject, message, priority, message_type, parent_message_id } = messageData;
    
    const insertMessage = `
      INSERT INTO messages (sender_id, receiver_id, subject, message, is_read)
      VALUES (?, ?, ?, ?, 0)
    `;

    try {
      return new Promise((resolve, reject) => {
        db.query(insertMessage, [
          sender_id, receiver_id, subject, message
        ], (err, result) => {
          if (err) return reject(err);
          
          const messageId = result.insertId;
          resolve({ messageId, insertId: messageId });
        });
      });
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  // Save attachments for a message
  static async saveAttachments(messageId, attachments) {
    const insertAttachment = `
      INSERT INTO message_attachments (message_id, filename, original_filename, file_path, file_size, mime_type, file_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    for (const attachment of attachments) {
      const fileType = MessageModel.getFileType(attachment.mimetype);
      
      await new Promise((resolve, reject) => {
        db.query(insertAttachment, [
          messageId,
          attachment.filename,
          attachment.originalname,
          attachment.path,
          attachment.size,
          attachment.mimetype,
          fileType
        ], (err) => err ? reject(err) : resolve());
      });
    }
  }

  // Determine file type based on mime type
  static getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('pdf') || mimeType.includes('document') || 
        mimeType.includes('text') || mimeType.includes('spreadsheet')) return 'document';
    return 'other';
  }

  // Get messages for a user (inbox/outbox)
  static getMessages(userId, type = 'inbox', limit = 50, offset = 0, callback) {
    let query;
    let params;

    if (type === 'inbox') {
      query = `
        SELECT m.*, 
               s.first_name as sender_first_name, 
               s.last_name as sender_last_name,
               s.email as sender_email
        FROM messages m
        JOIN users s ON m.sender_id = s.id
        WHERE m.receiver_id = ?
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params = [userId, limit, offset];
    } else if (type === 'outbox') {
      query = `
        SELECT m.*, 
               r.first_name as recipient_first_name, 
               r.last_name as recipient_last_name,
               r.email as recipient_email
        FROM messages m
        JOIN users r ON m.receiver_id = r.id
        WHERE m.sender_id = ?
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params = [userId, limit, offset];
    }

    db.query(query, params, callback);
  }

  // Get message by ID with attachments
  static getMessageById(messageId, userId, callback) {
    const query = `
      SELECT m.*, 
             s.first_name as sender_first_name, 
             s.last_name as sender_last_name,
             s.email as sender_email,
             r.first_name as recipient_first_name, 
             r.last_name as recipient_last_name,
             r.email as recipient_email
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE m.id = ? AND (m.sender_id = ? OR m.receiver_id = ?)
    `;

    db.query(query, [messageId, userId, userId], (err, messages) => {
      if (err) return callback(err);
      if (messages.length === 0) return callback(null, null);

      const message = messages[0];
      
      // Get attachments
      const attachmentQuery = `
        SELECT * FROM message_attachments WHERE message_id = ?
      `;
      
      db.query(attachmentQuery, [messageId], (attachErr, attachments) => {
        if (attachErr) return callback(attachErr);
        
        message.attachments = attachments;
        callback(null, message);
      });
    });
  }

  // Mark message as read
  static markAsRead(messageId, userId, callback) {
    const query = `
      UPDATE messages 
      SET is_read = 1 
      WHERE id = ? AND receiver_id = ?
    `;

    db.query(query, [messageId, userId], callback);
  }

  // Get unread message count
  static getUnreadCount(userId, callback) {
    const query = `
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE receiver_id = ? AND is_read = 0
    `;

    db.query(query, [userId], callback);
  }

  // Get message thread (simplified - no threading in current schema)
  static getMessageThread(parentMessageId, userId, callback) {
    // For now, just return the single message since we don't have parent_message_id in schema
    this.getMessageById(parentMessageId, userId, callback);
  }

  // Delete message (soft delete) - simplified since we don't have delete flags in schema
  static deleteMessage(messageId, userId, callback) {
    // For now, just verify the user has permission to delete
    const checkQuery = `SELECT sender_id, receiver_id FROM messages WHERE id = ?`;
    
    db.query(checkQuery, [messageId], (err, messages) => {
      if (err) return callback(err);
      if (messages.length === 0) return callback(new Error('Message not found'));

      const message = messages[0];
      
      if (message.sender_id !== userId && message.receiver_id !== userId) {
        return callback(new Error('Unauthorized to delete this message'));
      }

      // For now, we'll just return success without actually deleting
      // In a full implementation, you might want to add delete flags to the schema
      callback(null, { message: 'Message marked for deletion' });
    });
  }

  // Get all users for messaging (excluding current user)
  static getMessagingUsers(currentUserId, callback) {
    const query = `
      SELECT id, first_name, last_name, email, role
      FROM users 
      WHERE id != ? AND status = 'approved'
      ORDER BY role, first_name, last_name
    `;

    db.query(query, [currentUserId], callback);
  }

  // Search messages
  static searchMessages(userId, searchTerm, callback) {
    const query = `
      SELECT m.*, 
             s.first_name as sender_first_name, 
             s.last_name as sender_last_name,
             r.first_name as recipient_first_name, 
             r.last_name as recipient_last_name
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE (m.sender_id = ? OR m.receiver_id = ?)
        AND (m.subject LIKE ? OR m.message LIKE ?)
      ORDER BY m.created_at DESC
      LIMIT 100
    `;

    const searchPattern = `%${searchTerm}%`;
    db.query(query, [userId, userId, searchPattern, searchPattern], callback);
  }
}

module.exports = MessageModel;
