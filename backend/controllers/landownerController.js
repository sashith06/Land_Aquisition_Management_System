const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const transporter = require("../config/emailTransporter");
const db = require("../config/db");
const LandownerOTP = require("../models/landownerOtpModel");

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_COOLDOWN_MS = 60 * 1000; // 1 minute between requests

function generateNumericOtp() {
  return crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();
}

function generateOtpSMS(name, otp) {
  return `Hi ${name}, your OTP for LAMS landowner login is: ${otp}. This code expires in 10 minutes.`;
}

// Request OTP for landowner login
exports.requestOTP = async (req, res) => {
  try {
    const { nic, mobile } = req.body;

    if (!nic || !mobile) {
      return res.status(400).json({ message: "NIC and mobile number are required" });
    }

    // Validate NIC format (12 digits)
    if (!/^\d{12}$/.test(nic)) {
      return res.status(400).json({ message: "NIC must be 12 digits" });
    }

    // Validate mobile format (+947XXXXXXXX)
    if (!/^\+947\d{8}$/.test(mobile)) {
      return res.status(400).json({ message: "Invalid mobile format (e.g., +947XXXXXXXX)" });
    }

    // Check cooldown period
    LandownerOTP.checkCooldown(nic, mobile, OTP_COOLDOWN_MS, async (err, inCooldown, remainingTime) => {
      if (err) {
        console.error("Cooldown check error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (inCooldown) {
        return res.status(429).json({ 
          message: `Please wait ${Math.ceil(remainingTime / 1000)} seconds before requesting another OTP` 
        });
      }

      // Check if landowner exists in database
      const query = `
        SELECT o.id, o.name, o.nic, o.mobile
        FROM owners o
        WHERE o.nic = ? AND o.mobile = ? AND o.status = 'active'
      `;

      db.query(query, [nic, mobile], async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "Landowner not found or inactive" });
        }

        const landowner = results[0];

        // Generate OTP and hash it
        const otp = generateNumericOtp();
        const hashedOTP = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

        // Store OTP in database
        LandownerOTP.create(nic, mobile, hashedOTP, expiresAt, (err, result) => {
          if (err) {
            console.error("Error storing OTP:", err);
            return res.status(500).json({ message: "Failed to generate OTP" });
          }

          // Clean up old OTPs
          LandownerOTP.deleteExpiredOrUsed(() => {});

          // In production, send SMS here
          console.log(`OTP for ${nic}: ${otp}`); // Remove in production
          console.log(`SMS to ${mobile}: ${generateOtpSMS(landowner.name, otp)}`);

          res.json({
            message: "OTP sent to your mobile number",
            // Remove the line below in production - only for testing
            otp: otp
          });
        });
      });
    });

  } catch (error) {
    console.error("Error in requestOTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify OTP and login landowner
exports.verifyOTP = async (req, res) => {
  try {
    const { nic, mobile, otp } = req.body;

    if (!nic || !mobile || !otp) {
      return res.status(400).json({ message: "NIC, mobile, and OTP are required" });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "OTP must be 6 digits" });
    }

    // Get the latest unused OTP for this landowner
    LandownerOTP.getLatestUnusedByNicAndMobile(nic, mobile, async (err, otpResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (otpResults.length === 0) {
        return res.status(400).json({ message: "No valid OTP found. Please request a new OTP." });
      }

      const otpRecord = otpResults[0];

      // Check if too many attempts
      if (otpRecord.attempts >= 3) {
        // Mark as used to prevent further attempts
        LandownerOTP.markAsUsed(otpRecord.id, () => {});
        return res.status(400).json({ message: "Too many invalid attempts. Please request a new OTP." });
      }

      // Verify the OTP
      const isValidOTP = await bcrypt.compare(otp, otpRecord.otp_code);

      if (!isValidOTP) {
        // Increment attempts
        LandownerOTP.incrementAttempts(otpRecord.id, () => {});
        
        const remainingAttempts = 3 - (otpRecord.attempts + 1);
        if (remainingAttempts <= 0) {
          LandownerOTP.markAsUsed(otpRecord.id, () => {});
          return res.status(400).json({ message: "Invalid OTP. Too many attempts. Please request a new OTP." });
        }
        
        return res.status(400).json({ 
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.` 
        });
      }

      // OTP is valid, mark as used
      LandownerOTP.markAsUsed(otpRecord.id, (err) => {
        if (err) {
          console.error("Error marking OTP as used:", err);
          return res.status(500).json({ message: "Database error" });
        }

        // Get landowner details
        const query = `
          SELECT o.id, o.name, o.nic, o.mobile, o.address
          FROM owners o
          WHERE o.nic = ? AND o.mobile = ? AND o.status = 'active'
        `;

        db.query(query, [nic, mobile], (err, results) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
          }

          if (results.length === 0) {
            return res.status(404).json({ message: "Landowner not found" });
          }

          const landowner = results[0];

          // Generate JWT token
          const token = jwt.sign(
            {
              id: landowner.id,
              nic: landowner.nic,
              name: landowner.name,
              role: 'landowner'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          );

          // Clean up old OTPs
          LandownerOTP.deleteExpiredOrUsed(() => {});

          res.json({
            message: "Login successful",
            token,
            landowner: {
              id: landowner.id,
              name: landowner.name,
              nic: landowner.nic,
              mobile: landowner.mobile,
              address: landowner.address,
              role: 'landowner',
              firstName: landowner.name.split(' ')[0] || landowner.name,
              lastName: landowner.name.split(' ').slice(1).join(' ') || ''
            }
          });
        });
      });
    });

  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get landowner's lots
exports.getLandownerLots = async (req, res) => {
  try {
    const landownerId = req.user.id;

    const query = `
      SELECT
        lo.lot_id,
        lo.ownership_percentage,
        l.lot_no,
        l.extent_ha,
        l.extent_perch,
        l.land_type,
        p.plan_identifier,
        pr.name as project_name,
        pr.status as project_status,
        v.total_value as valuation_amount,
        c.total_compensation as compensation_amount,
        c.status as compensation_status
      FROM lot_owners lo
      JOIN lots l ON lo.lot_id = l.id
      JOIN plans p ON l.plan_id = p.id
      JOIN projects pr ON p.project_id = pr.id
      LEFT JOIN lot_valuations v ON l.id = v.lot_id AND p.id = v.plan_id
      LEFT JOIN lot_compensations c ON l.id = c.lot_id AND p.id = c.plan_id
      WHERE lo.owner_id = ? AND lo.status = 'active'
      ORDER BY pr.name, p.plan_identifier, l.lot_no
    `;

    db.query(query, [landownerId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      // Group by project and plan
      const groupedData = {};
      results.forEach(row => {
        const projectKey = row.project_name;
        const planKey = row.plan_identifier;

        if (!groupedData[projectKey]) {
          groupedData[projectKey] = {};
        }

        if (!groupedData[projectKey][planKey]) {
          groupedData[projectKey][planKey] = [];
        }

        groupedData[projectKey][planKey].push({
          lotId: row.lot_id,
          lotNo: row.lot_no,
          extentHa: row.extent_ha,
          extentPerch: row.extent_perch,
          landType: row.land_type,
          ownershipPercentage: row.ownership_percentage,
          valuationAmount: row.valuation_amount,
          compensationAmount: row.compensation_amount,
          compensationStatus: row.compensation_status,
          projectStatus: row.project_status
        });
      });

      res.json({
        success: true,
        data: groupedData
      });
    });

  } catch (error) {
    console.error("Error in getLandownerLots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get landowner profile
exports.getProfile = async (req, res) => {
  try {
    const landownerId = req.user.id;

    const query = `
      SELECT id, name, nic, mobile, address, owner_type, created_at
      FROM owners
      WHERE id = ? AND status = 'active'
    `;

    db.query(query, [landownerId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Landowner not found" });
      }

      res.json({
        success: true,
        landowner: results[0]
      });
    });

  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Upload document (ID card or Bank book)
exports.uploadDocument = async (req, res) => {
  try {
    console.log('Upload request received:', {
      body: req.body,
      file: req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename,
        path: req.file.path
      } : null,
      user: req.user ? { id: req.user.id } : null
    });

    const { document_type } = req.body;
    const landownerId = req.user.id;

    if (!document_type || !['id_card', 'bank_book'].includes(document_type)) {
      console.log('Invalid document type:', document_type);
      return res.status(400).json({ message: "Invalid document type. Must be 'id_card' or 'bank_book'" });
    }

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;
    console.log('File object details:', file);

    // Move file from temp to correct location
    const fs = require('fs');
    const path = require('path');
    
    const targetDir = document_type === 'id_card' ? 'ID' : 'Bank';
    const finalDir = path.join('uploads', targetDir);
    
    // Ensure target directory exists
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    
    // Generate final filename
    const ext = path.extname(file.originalname);
    const finalFilename = `${landownerId}_${document_type}_${Date.now()}${ext}`;
    const finalPath = path.join(finalDir, finalFilename);
    
    // Move file from temp to final location
    try {
      fs.renameSync(file.path, finalPath);
      console.log('File moved from', file.path, 'to', finalPath);
    } catch (moveError) {
      console.error('Error moving file:', moveError);
      return res.status(500).json({ message: "Error moving uploaded file" });
    }

    // Check if document already exists for this landowner
    const checkQuery = `
      SELECT id FROM landowner_documents 
      WHERE landowner_id = ? AND document_type = ?
    `;
    console.log('Executing check query with params:', [landownerId, document_type]);
    
    db.query(checkQuery, [landownerId, document_type], (checkErr, checkResults) => {
      if (checkErr) {
        console.error("Error checking existing document:", checkErr);
        return res.status(500).json({ message: "Database error", error: checkErr.message });
      }

      console.log('Check query results:', checkResults);
      
      // Use the final file path
      const filePath = finalPath;
      
      const query = checkResults.length > 0 
        ? `UPDATE landowner_documents SET 
           file_name = ?, file_path = ?, file_size = ?, mime_type = ?, updated_at = CURRENT_TIMESTAMP
           WHERE landowner_id = ? AND document_type = ?`
        : `INSERT INTO landowner_documents 
           (landowner_id, document_type, file_name, file_path, file_size, mime_type) 
           VALUES (?, ?, ?, ?, ?, ?)`;

      const queryParams = checkResults.length > 0
        ? [finalFilename, filePath, file.size, file.mimetype, landownerId, document_type]
        : [landownerId, document_type, finalFilename, filePath, file.size, file.mimetype];

      console.log('Executing query:', query);
      console.log('Query params:', queryParams);
      
      db.query(query, queryParams, (err, results) => {
        if (err) {
          console.error("Error saving document:", err);
          return res.status(500).json({ message: "Failed to save document", error: err.message });
        }

        console.log('Document saved successfully');
        
        res.status(200).json({
          message: `${document_type.replace('_', ' ')} uploaded successfully`,
          document: {
            id: checkResults.length > 0 ? checkResults[0].id : results.insertId,
            document_type,
            file_name: finalFilename,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.mimetype
          }
        });
      });
    });

  } catch (error) {
    console.error("Error in uploadDocument:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get landowner documents
exports.getDocuments = async (req, res) => {
  try {
    const landownerId = req.user.id;

    const query = `
      SELECT id, document_type, file_name, file_path, file_size, mime_type, uploaded_at, updated_at
      FROM landowner_documents 
      WHERE landowner_id = ?
      ORDER BY document_type, updated_at DESC
    `;

    db.query(query, [landownerId], (err, results) => {
      if (err) {
        console.error("Error fetching documents:", err);
        return res.status(500).json({ message: "Database error" });
      }

      const documents = {
        id_card: null,
        bank_book: null
      };

      results.forEach(doc => {
        documents[doc.document_type] = {
          id: doc.id,
          file_name: doc.file_name,
          file_path: doc.file_path,
          file_size: doc.file_size,
          mime_type: doc.mime_type,
          uploaded_at: doc.uploaded_at,
          updated_at: doc.updated_at
        };
      });

      res.status(200).json({
        message: "Documents retrieved successfully",
        documents
      });
    });

  } catch (error) {
    console.error("Error in getDocuments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { document_type } = req.params;
    const landownerId = req.user.id;

    if (!document_type || !['id_card', 'bank_book'].includes(document_type)) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    const query = `
      DELETE FROM landowner_documents 
      WHERE landowner_id = ? AND document_type = ?
    `;

    db.query(query, [landownerId, document_type], (err, results) => {
      if (err) {
        console.error("Error deleting document:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.status(200).json({
        message: `${document_type.replace('_', ' ')} deleted successfully`
      });
    });

  } catch (error) {
    console.error("Error in deleteDocument:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get documents by NIC (for officials to view landowner documents)
exports.getDocumentsByNIC = async (req, res) => {
  try {
    const { nic } = req.params;

    if (!nic) {
      return res.status(400).json({ message: "NIC is required" });
    }

    console.log(`Fetching documents for NIC: ${nic}`);

    // Enhanced query to handle potential NIC format issues and multiple owner records
    const query = `
      SELECT DISTINCT ld.id, ld.document_type, ld.file_name, ld.file_path, ld.file_size, ld.mime_type, ld.uploaded_at, ld.updated_at,
             o.id as owner_id, o.name as owner_name
      FROM landowner_documents ld
      JOIN owners o ON ld.landowner_id = o.id
      WHERE UPPER(TRIM(o.nic)) = UPPER(TRIM(?))
        AND o.status = 'active'
      ORDER BY ld.document_type, ld.updated_at DESC
    `;

    db.query(query, [nic], (err, results) => {
      if (err) {
        console.error("Error fetching documents by NIC:", err);
        return res.status(500).json({ message: "Database error" });
      }

      console.log(`Found ${results.length} documents for NIC ${nic}:`, results);

      const documents = {
        id_card: null,
        bank_book: null
      };

      // Take the most recent document of each type
      results.forEach(doc => {
        if (!documents[doc.document_type] || 
            new Date(doc.updated_at) > new Date(documents[doc.document_type].updated_at)) {
          documents[doc.document_type] = {
            id: doc.id,
            file_name: doc.file_name,
            file_path: doc.file_path,
            file_size: doc.file_size,
            mime_type: doc.mime_type,
            uploaded_at: doc.uploaded_at,
            updated_at: doc.updated_at,
            owner_id: doc.owner_id,
            owner_name: doc.owner_name
          };
        }
      });

      console.log(`Returning documents for NIC ${nic}:`, documents);

      res.status(200).json({
        message: "Documents retrieved successfully",
        documents,
        nic,
        debug: {
          query_results_count: results.length,
          found_owner_ids: [...new Set(results.map(r => r.owner_id))]
        }
      });
    });

  } catch (error) {
    console.error("Error in getDocumentsByNIC:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
