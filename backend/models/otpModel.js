const db = require("../config/db"); // Your MySQL connection

const OTP = {
  create: (email, hashedOtp, expiresAt, callback) => {
    const query = `
      INSERT INTO password_reset_otps (email, otp_code, expires_at)
      VALUES (?, ?, ?)
    `;
    db.query(query, [email, hashedOtp, expiresAt], callback);
  },

  getLatestUnusedByEmail: (email, callback) => {
    const query = `
      SELECT * FROM password_reset_otps
      WHERE email = ? AND is_used = 0
      ORDER BY created_at DESC LIMIT 1
    `;
    db.query(query, [email], callback);
  },

  getLatestByEmail: (email, callback) => {
    const query = `
      SELECT * FROM password_reset_otps
      WHERE email = ?
      ORDER BY created_at DESC LIMIT 1
    `;
    db.query(query, [email], callback);
  },

  markAsUsed: (id, callback) => {
    const query = `UPDATE password_reset_otps SET is_used = 1 WHERE id = ?`;
    db.query(query, [id], callback);
  },

  incrementAttempts: (id, callback) => {
    const query = `UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = ?`;
    db.query(query, [id], callback);
  },

  deleteExpiredOrUsed: (callback) => {
    const query = `DELETE FROM password_reset_otps WHERE expires_at < NOW() OR is_used = 1`;
    db.query(query, callback);
  },
};

module.exports = OTP;
