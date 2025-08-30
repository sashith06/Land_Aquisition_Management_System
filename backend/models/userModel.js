const db = require("../config/db");

const User = {};

// Create new user
User.create = (user, callback) => {
  const sql = `
    INSERT INTO users (first_name, last_name, email, role, password, status) 
    VALUES (?, ?, ?, ?, ?, 'pending')
  `;
  db.query(sql, [user.firstName, user.lastName, user.email, user.role, user.password], callback);
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
  db.query("UPDATE users SET status='approved', approved_at=NOW() WHERE id = ?", [id], callback);
};

// Reject user
User.reject = (id, callback) => {
  db.query("UPDATE users SET status='rejected', rejected_at=NOW() WHERE id = ?", [id], callback);
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

// Get pending users
User.getPending = (callback) => {
  db.query("SELECT *, CONCAT(first_name, ' ', last_name) AS name FROM users WHERE status='pending'", (err, rows) => {
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

// Get approved users
User.getApproved = (callback) => {
  db.query("SELECT *, CONCAT(first_name, ' ', last_name) AS name FROM users WHERE status='approved'", (err, rows) => {
    if (err) return callback(err);
    rows = rows.map(u => ({
      ...u,
      name: u.name || (u.first_name + ' ' + u.last_name),
      avatar: u.avatar || '',
      department: u.department || '',
      joinDate: u.approved_at ? u.approved_at.toISOString().split('T')[0] : '',
    }));
    callback(null, rows);
  });
};

// Get rejected users
User.getRejected = (callback) => {
  db.query("SELECT *, CONCAT(first_name, ' ', last_name) AS name FROM users WHERE status='rejected'", (err, rows) => {
    if (err) return callback(err);
    rows = rows.map(u => ({
      ...u,
      name: u.name || (u.first_name + ' ' + u.last_name),
      avatar: u.avatar || '',
      department: u.department || '',
      requestDate: u.created_at ? u.created_at.toISOString().split('T')[0] : '',
      rejectionDate: u.rejected_at ? u.rejected_at.toISOString().split('T')[0] : '',
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
