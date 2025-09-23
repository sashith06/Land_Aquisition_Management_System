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
              address: landowner.address
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
