const db = require("../config/db");

const LandownerOTP = {
  // Create a new OTP record
  create: (nic, mobile, hashedOtp, expiresAt, callback) => {
    const query = `
      INSERT INTO landowner_otps (nic, mobile, otp_code, expires_at)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [nic, mobile, hashedOtp, expiresAt], callback);
  },

  // Get the latest unused OTP for a landowner
  getLatestUnusedByNicAndMobile: (nic, mobile, callback) => {
    const query = `
      SELECT * FROM landowner_otps
      WHERE nic = ? AND mobile = ? AND is_used = 0 AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1
    `;
    db.query(query, [nic, mobile], callback);
  },

  // Mark OTP as used
  markAsUsed: (id, callback) => {
    const query = `UPDATE landowner_otps SET is_used = 1 WHERE id = ?`;
    db.query(query, [id], callback);
  },

  // Increment failed attempts
  incrementAttempts: (id, callback) => {
    const query = `UPDATE landowner_otps SET attempts = attempts + 1 WHERE id = ?`;
    db.query(query, [id], callback);
  },

  // Delete expired or used OTPs (cleanup)
  deleteExpiredOrUsed: (callback) => {
    const query = `DELETE FROM landowner_otps WHERE expires_at < NOW() OR is_used = 1`;
    db.query(query, callback);
  },

  // Check if user is in cooldown period
  checkCooldown: (nic, mobile, cooldownMs, callback) => {
    const query = `
      SELECT created_at FROM landowner_otps
      WHERE nic = ? AND mobile = ?
      ORDER BY created_at DESC LIMIT 1
    `;
    db.query(query, [nic, mobile], (err, results) => {
      if (err) return callback(err);
      
      if (results.length === 0) {
        return callback(null, false); // No previous OTP, no cooldown
      }

      const lastOtpTime = new Date(results[0].created_at);
      const now = new Date();
      const timeDiff = now - lastOtpTime;
      
      const inCooldown = timeDiff < cooldownMs;
      callback(null, inCooldown, cooldownMs - timeDiff);
    });
  }
};

module.exports = LandownerOTP;