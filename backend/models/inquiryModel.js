const db = require('../config/db');

class InquiryModel {
  // Create inquiries and inquiry_attachments tables if they don't exist
  static async createTables() {
    try {
      // Create inquiries table
      const createInquiriesTable = `
        CREATE TABLE IF NOT EXISTS inquiries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          lot_id INT NOT NULL,
          landowner_id INT NOT NULL,
          inquiry_text TEXT NOT NULL,
          is_read TINYINT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (lot_id) REFERENCES lots(id),
          FOREIGN KEY (landowner_id) REFERENCES users(id)
        )
      `;

      // Create inquiry_attachments table
      const createAttachmentsTable = `
        CREATE TABLE IF NOT EXISTS inquiry_attachments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          inquiry_id INT NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE
        )
      `;

      await new Promise((resolve, reject) => {
        db.query(createInquiriesTable, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Add is_read column if it doesn't exist (for existing tables)
      const alterTable = `
        ALTER TABLE inquiries 
        ADD COLUMN is_read TINYINT DEFAULT 0
      `;

      await new Promise((resolve, reject) => {
        db.query(alterTable, (err) => {
          if (err) {
            // Ignore if column already exists
            if (err.code === 'ER_DUP_FIELDNAME') {
              console.log('Column is_read already exists');
            } else {
              console.log('Error adding is_read column:', err.message);
            }
          }
          resolve(); // Continue anyway
        });
      });

      await new Promise((resolve, reject) => {
        db.query(createAttachmentsTable, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log('Inquiry tables created successfully');
    } catch (error) {
      console.error('Error creating inquiry tables:', error);
      throw error;
    }
  }
}

module.exports = InquiryModel;