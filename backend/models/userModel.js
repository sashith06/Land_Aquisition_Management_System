const db = require("../config/db");

const User = {};

// Create new user (only PE, LO, FO roles allowed - CE is reserved for admin@lams.gov.lk only)
User.create = (user, callback) => {
  // Restrict role creation to only PE, LO, FO (CE is reserved for the system administrator admin@lams.gov.lk)
  if (!['PE', 'LO', 'FO'].includes(user.role)) {
    return callback(new Error('Invalid role. Only PE, LO, and FO roles are allowed for registration. CE is reserved for the system administrator (admin@lams.gov.lk).'));
  }
  
  const sql = `
    INSERT INTO users (username, first_name, last_name, email, role, password, status) 
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;
  // Generate username from email (part before @) with fallback
  let username = '';
  if (user.email && user.email.includes('@')) {
    username = user.email.split('@')[0];
  }
  
  // If username is still empty, generate a random one
  if (!username || username.trim() === '') {
    username = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  }
  
  // Ensure username is unique by adding timestamp if needed
  username = username.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
  
  console.log('Creating user with username:', username, 'email:', user.email, 'role:', user.role);
  db.query(sql, [username, user.firstName, user.lastName, user.email, user.role, user.password], callback);
};

// Find user by email
User.findByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], callback);
};

// Find user by ID
User.findById = (id, callback) => {
  db.query("SELECT * FROM users WHERE id = ?", [id], callback);
};


// Approve user
User.approve = (id, callback) => {
  db.query("UPDATE users SET status='approved' WHERE id = ?", [id], callback);
};

// Reject user
User.reject = (id, callback) => {
  db.query("UPDATE users SET status='rejected' WHERE id = ?", [id], callback);
};

// Delete user
User.delete = (id, callback) => {
  db.query("DELETE FROM users WHERE id = ?", [id], callback);
};

// Update user
User.update = (id, userData, callback) => {
  // Remove fields that shouldn't be updated directly
  const { firstName, lastName, email, role, password } = userData;
  const fields = [];
  const values = [];
  if (firstName) { fields.push('first_name=?'); values.push(firstName); }
  if (lastName) { fields.push('last_name=?'); values.push(lastName); }
  if (email) { fields.push('email=?'); values.push(email); }
  if (role) { fields.push('role=?'); values.push(role); }
  if (password) { fields.push('password=?'); values.push(password); }
  if (fields.length === 0) return callback(null);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);
  db.query(sql, values, callback);
};

// Get pending users (only PE, LO, FO roles - exclude admin and CE)
User.getPending = (callback) => {
  db.query("SELECT *, CONCAT(first_name, ' ', last_name) AS name FROM users WHERE status='pending' AND role IN ('PE', 'LO', 'FO')", (err, rows) => {
    if (err) return callback(err);
    // Add default fields for frontend compatibility
    rows = rows.map(u => ({
      ...u,
      name: u.name || (u.first_name + ' ' + u.last_name),
      avatar: u.avatar || '',
      department: u.department || '',
      requestDate: u.created_at ? u.created_at.toISOString().split('T')[0] : '',
    }));
    callback(null, rows);
  });
};

// Get pending users count (only PE, LO, FO roles)
User.getPendingCount = (callback) => {
  db.query("SELECT COUNT(*) as count FROM users WHERE status='pending' AND role IN ('PE', 'LO', 'FO')", (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0].count);
  });
};

// Get approved users (only PE, LO, FO roles)
User.getApproved = (callback) => {
  db.query("SELECT *, CONCAT(first_name, ' ', last_name) AS name FROM users WHERE status='approved' AND role IN ('PE', 'LO', 'FO')", (err, rows) => {
    if (err) return callback(err);
    rows = rows.map(u => ({
      ...u,
      name: u.name || (u.first_name + ' ' + u.last_name),
      avatar: u.avatar || '',
      department: u.department || '',
      joinDate: u.updated_at ? u.updated_at.toISOString().split('T')[0] : '',
    }));
    callback(null, rows);
  });
};

// Get rejected users (only PE, LO, FO roles)
User.getRejected = (callback) => {
  db.query("SELECT *, CONCAT(first_name, ' ', last_name) AS name FROM users WHERE status='rejected' AND role IN ('PE', 'LO', 'FO')", (err, rows) => {
    if (err) return callback(err);
    rows = rows.map(u => ({
      ...u,
      name: u.name || (u.first_name + ' ' + u.last_name),
      avatar: u.avatar || '',
      department: u.department || '',
      rejectedDate: u.updated_at ? u.updated_at.toISOString().split('T')[0] : '',
    }));
    callback(null, rows);
  });
};

// ================= PASSWORD RESET FUNCTIONS =================

// Save reset token
User.setResetToken = (email, token, expires, callback) => {
  const sql = "UPDATE users SET reset_token=?, reset_token_expires=? WHERE email=?";
  db.query(sql, [token, expires, email], callback);
};

// Find user by reset token (valid & not expired)
User.findByResetToken = (token, callback) => {
  const sql = "SELECT * FROM users WHERE reset_token=? AND reset_token_expires > NOW()";
  db.query(sql, [token], callback);
};

// Update password & clear token
User.updatePassword = (id, hashedPassword, callback) => {
  const sql = "UPDATE users SET password=?, reset_token=NULL, reset_token_expires=NULL WHERE id=?";
  db.query(sql, [hashedPassword, id], callback);
};


module.exports = User;
