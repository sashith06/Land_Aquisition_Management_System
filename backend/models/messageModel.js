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
    console.log('=== MESSAGE MODEL CREATE DEBUG ===');
    console.log('Message data received:', messageData);
    
    const { sender_id, recipient_id, subject, content, priority, message_type, parent_message_id } = messageData;
    
    const insertMessage = `
      INSERT INTO messages (sender_id, receiver_id, subject, message, is_read, priority, message_type)
      VALUES (?, ?, ?, ?, 0, ?, ?)
    `;

    try {
      return new Promise((resolve, reject) => {
        const queryParams = [
          sender_id, 
          recipient_id,  // Maps to receiver_id in database
          subject, 
          content,       // Maps to message in database
          priority || 'normal',
          message_type || 'general'
        ];
        
        console.log('SQL Query:', insertMessage);
        console.log('Query params:', queryParams);
        
        db.query(insertMessage, queryParams, async (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return reject(err);
          }
          
          console.log('Message inserted, ID:', result.insertId);
          const messageId = result.insertId;
          
          // Save attachments if any
          if (attachments && attachments.length > 0) {
            console.log('Saving attachments:', attachments.length);
            try {
              await MessageModel.saveAttachments(messageId, attachments, sender_id);
              console.log('Attachments saved successfully');
            } catch (attachErr) {
              console.error('Error saving attachments:', attachErr);
              return reject(attachErr);
            }
          }
          
          console.log('Message creation completed successfully');
          resolve({ messageId, insertId: messageId });
        });
      });
    } catch (error) {
      console.error('Error in message creation:', error);
      throw error;
    }
  }

  // Save attachments for a message
  static async saveAttachments(messageId, attachments, uploadedBy) {
    if (!attachments || attachments.length === 0) return;
    
    const insertAttachment = `
      INSERT INTO message_attachments (message_id, filename, original_filename, file_path, file_size, mime_type, file_type, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
          fileType,
          uploadedBy
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
    } else if (type === 'compose') {
      // For compose type, return empty array since it's just for the compose interface
      return callback(null, []);
    } else {
      // Default to inbox if unknown type
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
    console.log(`=== MARK AS READ ===`);
    console.log(`Message ID: ${messageId}, User ID: ${userId}`);
    
    const query = `
      UPDATE messages 
      SET is_read = 1 
      WHERE id = ? AND receiver_id = ?
    `;

    db.query(query, [messageId, userId], (err, result) => {
      if (err) {
        console.error('Error marking message as read:', err);
        return callback(err);
      }
      
      console.log('Mark as read result:', result);
      console.log('Affected rows:', result.affectedRows);
      
      callback(err, result);
    });
  }

  // Get unread message count
  static getUnreadCount(userId, callback) {
    console.log(`=== GET UNREAD COUNT ===`);
    console.log(`User ID: ${userId}`);
    
    const query = `
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE receiver_id = ? AND is_read = 0
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error getting unread count:', err);
        return callback(err);
      }
      
      const count = results[0].count;
      console.log('Unread count result:', count);
      
      callback(err, results);
    });
  }

  // Get message thread (simplified - no threading in current schema)
  static getMessageThread(parentMessageId, userId, callback) {
    // For now, just return the single message since we don't have parent_message_id in schema
    this.getMessageById(parentMessageId, userId, callback);
  }

  // Delete message - hard delete with cascading attachment deletion
  static deleteMessage(messageId, userId, callback) {
    console.log(`=== DELETE MESSAGE MODEL ===`);
    console.log(`Message ID: ${messageId}, User ID: ${userId}`);
    
    // First, verify the user has permission to delete
    const checkQuery = `SELECT sender_id, receiver_id FROM messages WHERE id = ?`;
    
    db.query(checkQuery, [messageId], (err, messages) => {
      if (err) {
        console.error('Error checking message permissions:', err);
        return callback(err);
      }
      if (messages.length === 0) {
        console.log('Message not found');
        return callback(new Error('Message not found'));
      }

      const message = messages[0];
      console.log('Message found:', message);
      
      if (message.sender_id !== userId && message.receiver_id !== userId) {
        console.log('Unauthorized delete attempt');
        return callback(new Error('Unauthorized to delete this message'));
      }

      // Start transaction to delete message and its attachments
      console.log('Starting delete transaction...');
      db.beginTransaction((err) => {
        if (err) {
          console.error('Error starting transaction:', err);
          return callback(err);
        }

        // First delete attachments
        const deleteAttachmentsQuery = `DELETE FROM message_attachments WHERE message_id = ?`;
        console.log('Deleting attachments...');
        
        db.query(deleteAttachmentsQuery, [messageId], (err, attachmentResult) => {
          if (err) {
            console.error('Error deleting attachments:', err);
            return db.rollback(() => {
              callback(err);
            });
          }

          console.log('Attachments deleted:', attachmentResult.affectedRows);

          // Then delete the message
          const deleteMessageQuery = `DELETE FROM messages WHERE id = ?`;
          console.log('Deleting message...');
          
          db.query(deleteMessageQuery, [messageId], (err, result) => {
            if (err) {
              console.error('Error deleting message:', err);
              return db.rollback(() => {
                callback(err);
              });
            }

            console.log('Message delete result:', result);

            if (result.affectedRows === 0) {
              console.log('No message was deleted (affectedRows = 0)');
              return db.rollback(() => {
                callback(new Error('Message not found or already deleted'));
              });
            }

            // Commit transaction
            db.commit((err) => {
              if (err) {
                console.error('Error committing transaction:', err);
                return db.rollback(() => {
                  callback(err);
                });
              }
              
              console.log('Transaction committed successfully');
              callback(null, { 
                success: true, 
                message: 'Message and attachments deleted successfully',
                affectedRows: result.affectedRows 
              });
            });
          });
        });
      });
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
