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

// Delete user (with proper cascading deletes for all related records)
User.delete = (id, callback) => {
  console.log(`=== USER DELETE MODEL START ===`);
  console.log(`User ID: ${id}`);

  // First check if user exists
  db.query('SELECT id, username, email, role FROM users WHERE id = ?', [id], (err, userResults) => {
    if (err) {
      console.error('Error checking if user exists:', err);
      return callback(new Error(`Database error: ${err.message}`));
    }

    if (userResults.length === 0) {
      console.log(`User ${id} not found`);
      return callback(new Error('User not found'));
    }

    const user = userResults[0];
    console.log(`Found user: ${user.username} (${user.email})`);

    // Prevent deletion of system administrator
    if (id === 1) {
      console.log('Attempted to delete system administrator');
      return callback(new Error('Cannot delete system administrator'));
    }

    // Start a transaction to ensure all deletes succeed or all fail
    db.query('START TRANSACTION', (err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return callback(new Error(`Transaction error: ${err.message}`));
      }

      console.log('Transaction started - beginning cascading deletes');

      // Step 1: Delete audit logs (references user_id)
      console.log('Step 1: Deleting audit logs...');
      db.query('DELETE FROM audit_logs WHERE user_id = ?', [id], (err, result) => {
        if (err) {
          console.error('Error deleting audit logs:', err);
          return rollbackAndCallback(err);
        }
        console.log(`Deleted ${result.affectedRows} audit log entries`);

        // Step 2: Delete notifications (references user_id)
        console.log('Step 2: Deleting notifications...');
        db.query('DELETE FROM notifications WHERE user_id = ?', [id], (err, result) => {
          if (err) {
            console.error('Error deleting notifications:', err);
            return rollbackAndCallback(err);
          }
          console.log(`Deleted ${result.affectedRows} notifications`);

          // Step 3: Delete message attachments uploaded by this user
          console.log('Step 3: Deleting message attachments...');
          db.query('DELETE FROM message_attachments WHERE uploaded_by = ?', [id], (err, result) => {
            if (err) {
              console.error('Error deleting message attachments:', err);
              return rollbackAndCallback(err);
            }
            console.log(`Deleted ${result.affectedRows} message attachments`);

            // Step 4: Delete messages (both sent and received by this user)
            console.log('Step 4: Deleting messages...');
            db.query('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', [id, id], (err, result) => {
              if (err) {
                console.error('Error deleting messages:', err);
                return rollbackAndCallback(err);
              }
              console.log(`Deleted ${result.affectedRows} messages`);

              // Step 5: Delete project documents uploaded by this user
              console.log('Step 5: Deleting project documents...');
              db.query('DELETE FROM project_documents WHERE uploaded_by = ?', [id], (err, result) => {
                if (err) {
                  console.error('Error deleting project documents:', err);
                  return rollbackAndCallback(err);
                }
                console.log(`Deleted ${result.affectedRows} project documents`);

                // Step 6: Delete documents uploaded by this user
                console.log('Step 6: Deleting documents...');
                db.query('DELETE FROM documents WHERE uploaded_by = ?', [id], (err, result) => {
                  if (err) {
                    console.error('Error deleting documents:', err);
                    return rollbackAndCallback(err);
                  }
                  console.log(`Deleted ${result.affectedRows} documents`);

                  // Step 7: Delete lot valuations created/updated/approved by this user
                  console.log('Step 7: Deleting lot valuations...');
                  db.query('DELETE FROM lot_valuations WHERE created_by = ? OR updated_by = ? OR approved_by = ?', [id, id, id], (err, result) => {
                    if (err) {
                      console.error('Error deleting lot valuations:', err);
                      return rollbackAndCallback(err);
                    }
                    console.log(`Deleted ${result.affectedRows} lot valuations`);

                    // Step 8: Delete lot compensations created/updated/approved by this user
                    console.log('Step 8: Deleting lot compensations...');
                    db.query('DELETE FROM lot_compensations WHERE created_by = ? OR updated_by = ? OR approved_by = ?', [id, id, id], (err, result) => {
                      if (err) {
                        console.error('Error deleting lot compensations:', err);
                        return rollbackAndCallback(err);
                      }
                      console.log(`Deleted ${result.affectedRows} lot compensations`);

                      // Step 9: Delete valuations created/approved by this user
                      console.log('Step 9: Deleting valuations...');
                      db.query('DELETE FROM valuations WHERE created_by = ? OR approved_by = ?', [id, id], (err, result) => {
                        if (err) {
                          console.error('Error deleting valuations:', err);
                          return rollbackAndCallback(err);
                        }
                        console.log(`Deleted ${result.affectedRows} valuations`);

                        // Step 10: Delete compensations created/approved by this user
                        console.log('Step 10: Deleting compensations...');
                        db.query('DELETE FROM compensations WHERE created_by = ? OR approved_by = ?', [id, id], (err, result) => {
                          if (err) {
                            console.error('Error deleting compensations:', err);
                            return rollbackAndCallback(err);
                          }
                          console.log(`Deleted ${result.affectedRows} compensations`);

                          // Step 11: Delete lot owners created/updated by this user
                          console.log('Step 11: Deleting lot owners...');
                          db.query('DELETE FROM lot_owners WHERE created_by = ? OR updated_by = ?', [id, id], (err, result) => {
                            if (err) {
                              console.error('Error deleting lot owners:', err);
                              return rollbackAndCallback(err);
                            }
                            console.log(`Deleted ${result.affectedRows} lot owners`);

                            // Step 12: Delete lots created/updated by this user
                            console.log('Step 12: Deleting lots...');
                            db.query('DELETE FROM lots WHERE created_by = ? OR updated_by = ?', [id, id], (err, result) => {
                              if (err) {
                                console.error('Error deleting lots:', err);
                                return rollbackAndCallback(err);
                              }
                              console.log(`Deleted ${result.affectedRows} lots`);

                              // Step 13: Delete plans created by this user
                              console.log('Step 13: Deleting plans...');
                              db.query('DELETE FROM plans WHERE created_by = ?', [id], (err, result) => {
                                if (err) {
                                  console.error('Error deleting plans:', err);
                                  return rollbackAndCallback(err);
                                }
                                console.log(`Deleted ${result.affectedRows} plans`);

                                // Step 14: Delete project assignments (both assigned to and assigned by this user)
                                console.log('Step 14: Deleting project assignments...');
                                db.query('DELETE FROM project_assignments WHERE land_officer_id = ? OR assigned_by = ?', [id, id], (err, result) => {
                                  if (err) {
                                    console.error('Error deleting project assignments:', err);
                                    return rollbackAndCallback(err);
                                  }
                                  console.log(`Deleted ${result.affectedRows} project assignments`);

                                  // Step 15: Update projects to remove references to this user (set to NULL)
                                  console.log('Step 15: Updating project references...');
                                  db.query('UPDATE projects SET approved_by = NULL WHERE approved_by = ?', [id], (err, result) => {
                                    if (err) {
                                      console.error('Error updating project approved_by:', err);
                                      return rollbackAndCallback(err);
                                    }
                                    console.log(`Updated ${result.affectedRows} projects (approved_by set to NULL)`);

                                    db.query('UPDATE projects SET rejected_by = NULL WHERE rejected_by = ?', [id], (err, result) => {
                                      if (err) {
                                        console.error('Error updating project rejected_by:', err);
                                        return rollbackAndCallback(err);
                                      }
                                      console.log(`Updated ${result.affectedRows} projects (rejected_by set to NULL)`);

                                      // Note: We don't update created_by as that would break the audit trail

                                      // Step 16: Finally, delete the user
                                      console.log('Step 16: Deleting user...');
                                      db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
                                        if (err) {
                                          console.error('Error deleting user:', err);
                                          return rollbackAndCallback(err);
                                        }

                                        console.log('User delete result:', result);
                                        console.log('Affected rows:', result.affectedRows);

                                        if (result.affectedRows === 0) {
                                          console.log('No user was deleted');
                                          return rollbackAndCallback(new Error('User not found or already deleted'));
                                        }

                                        // Commit the transaction
                                        db.query('COMMIT', (err) => {
                                          if (err) {
                                            console.error('Error committing transaction:', err);
                                            return rollbackAndCallback(err);
                                          }

                                          const message = `User ${user.username} (ID: ${id}) and all related records deleted successfully`;
                                          console.log(message);
                                          console.log('=== USER DELETE MODEL END ===');
                                          callback(null, { message, deletedUser: user.username });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    // Helper function to rollback transaction and callback with error
    function rollbackAndCallback(error) {
      console.error('Rolling back transaction due to error:', error);
      db.query('ROLLBACK', (rollbackErr) => {
        if (rollbackErr) {
          console.error('Error rolling back transaction:', rollbackErr);
        }
        callback(new Error(`Failed to delete user: ${error.message}`));
      });
    }
  });
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
