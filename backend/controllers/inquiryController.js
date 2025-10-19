const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Create inquiry with optional files
exports.createInquiryWithFiles = [
  upload.array('files', 5),
  (req, res) => {
    const lot_id = req.body.lot_id;
    const landowner_id = req.user.id; // Logged-in user
    const inquiry_text = req.body.inquiry_text;

    db.query(
      "INSERT INTO inquiries (lot_id, landowner_id, inquiry_text) VALUES (?, ?, ?)",
      [lot_id, landowner_id, inquiry_text],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to create inquiry" });

        const inquiryId = result.insertId;

        // Save attachments if any
        if (req.files && req.files.length > 0) {
          const attachments = req.files.map(file => [inquiryId, file.originalname, file.path]);
          db.query(
            "INSERT INTO inquiry_attachments (inquiry_id, file_name, file_path) VALUES ?",
            [attachments],
            (err2) => {
              if (err2) console.error("Failed to save attachments:", err2);
            }
          );
        }

        res.json({ message: "Inquiry created successfully", id: inquiryId });
      }
    );
  }
];

// Get inquiries by lot with attachments
exports.getInquiriesByLot = (req, res) => {
  const lotId = req.params.lotId;
  db.query(
    `SELECT i.*, i.is_read, 
            a.id AS attachment_id, a.file_name, a.file_path 
     FROM inquiries i 
     LEFT JOIN inquiry_attachments a ON i.id = a.inquiry_id 
     WHERE i.lot_id = ?`,
    [lotId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to fetch inquiries" });

      // Group attachments under each inquiry
      const inquiries = {};
      rows.forEach(row => {
        if (!inquiries[row.id]) inquiries[row.id] = { ...row, attachments: [] };
        if (row.attachment_id) inquiries[row.id].attachments.push({
          id: row.attachment_id,
          file_name: row.file_name,
          file_path: row.file_path
        });
      });

      res.json(Object.values(inquiries));
    }
  );
};

// Delete inquiry (admin only)
exports.deleteInquiry = (req, res) => {
  const inquiryId = req.params.id;
  db.query(
    "DELETE FROM inquiries WHERE id = ?",
    [inquiryId],
    (err) => {
      if (err) return res.status(500).json({ error: "Failed to delete inquiry" });
      res.json({ message: "Inquiry deleted successfully" });
    }
  );
};

// Mark inquiry as read
exports.markAsRead = (req, res) => {
  const inquiryId = req.params.id;
  db.query(
    "UPDATE inquiries SET is_read = 1 WHERE id = ?",
    [inquiryId],
    (err) => {
      if (err) return res.status(500).json({ error: "Failed to mark as read" });
      res.json({ message: "Marked as read" });
    }
  );
};

// Get inquiries for the logged-in landowner
exports.getMyInquiries = (req, res) => {
  const landownerId = req.user.id;
  db.query(
    `SELECT i.*, i.is_read, 
            a.id AS attachment_id, a.file_name, a.file_path,
            l.lot_no
     FROM inquiries i 
     LEFT JOIN inquiry_attachments a ON i.id = a.inquiry_id 
     LEFT JOIN lots l ON i.lot_id = l.id
     WHERE i.landowner_id = ?`,
    [landownerId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to fetch inquiries" });

      // Group attachments under each inquiry
      const inquiries = {};
      rows.forEach(row => {
        if (!inquiries[row.id]) inquiries[row.id] = { 
          ...row, 
          attachments: [],
          lot_info: `Lot ${row.lot_no}`
        };
        if (row.attachment_id) inquiries[row.id].attachments.push({
          id: row.attachment_id,
          file_name: row.file_name,
          file_path: row.file_path
        });
      });

      res.json(Object.values(inquiries));
    }
  );
};

// Get unread inquiries count for officers
exports.getUnreadInquiriesCount = (req, res) => {
  db.query(
    "SELECT COUNT(*) as count FROM inquiries WHERE is_read = 0",
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to count unread inquiries" });
      res.json({ count: rows[0].count });
    }
  );
};

// Get recent inquiries for officers (for notifications)
exports.getRecentInquiries = (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  db.query(
    `SELECT i.id, i.inquiry_text, i.created_at, i.is_read,
            l.lot_no, CONCAT(u.first_name, ' ', u.last_name) as landowner_name
     FROM inquiries i 
     LEFT JOIN lots l ON i.lot_id = l.id
     LEFT JOIN users u ON i.landowner_id = u.id
     ORDER BY i.created_at DESC
     LIMIT ?`,
    [limit],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to fetch recent inquiries" });

      // Format inquiries to match notification structure
      const formattedInquiries = rows.map(row => ({
        id: `inquiry_${row.id}`, // Prefix to avoid ID conflicts
        type: 'inquiry_received',
        title: `Inquiry about Lot ${row.lot_no}`,
        message: `${row.landowner_name}: ${row.inquiry_text.substring(0, 100)}${row.inquiry_text.length > 100 ? '...' : ''}`,
        created_at: row.created_at,
        is_read: row.is_read,
        inquiry_id: row.id // Keep original ID for actions
      }));

      res.json(formattedInquiries);
    }
  );
};
