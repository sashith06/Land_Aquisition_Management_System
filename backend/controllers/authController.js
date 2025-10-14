// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const { validatePassword, generateSecurePassword } = require("../utils/passwordValidator");

// ===================== EMAIL SETUP =====================
const normalizedEmailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : undefined;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: normalizedEmailPass,
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 20000,
});

transporter.verify((error, success) => {
  if (error) console.error("Email transporter verification failed:", error);
  else console.log("Email transporter is ready");
});

// ===================== HELPER =====================
function generatePassword(length = 12) {
  // Use the secure password generator from our validator
  return generateSecurePassword(length);
}

// ===================== REGISTER =====================
exports.register = async (req, res) => {
  const { firstName, lastName, email, role, password } = req.body;
  console.log('Registration attempt:', { firstName, lastName, email, role });
  
  if (!firstName || !lastName || !email || !role)
    return res.status(400).json({ error: "All fields are required" });

  // Restrict registration to only PE, LO, FO roles (CE is reserved for admin@lams.gov.lk only)
  if (!['PE', 'LO', 'FO'].includes(role)) {
    return res.status(400).json({ 
      error: "Invalid role. Only Project Engineer (PE), Land Officer (LO), and Financial Officer (FO) roles are allowed for registration. Chief Engineer (CE) is reserved for the system administrator (admin@lams.gov.lk)." 
    });
  }

  try {
    let plainPassword = password;
    
    // If password is provided, validate it
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: "Password does not meet security requirements", 
          passwordErrors: passwordValidation.errors 
        });
      }
    } else {
      // Generate a secure password if none provided
      plainPassword = generatePassword();
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    User.create({ firstName, lastName, email, role, password: hashedPassword }, (err, result) => {
      if (err) {
        console.error('User creation error:', err);
        const errorMessage = err.message || err.sqlMessage || err.toString();
        return res.status(500).json({ error: `Registration failed: ${errorMessage}` });
      }

      console.log('User created successfully with ID:', result.insertId);

      // Create notification for Chief Engineer
      Notification.createForChiefEngineer(
        Notification.TYPES.USER_REGISTRATION,
        'New User Registration',
        `New user ${firstName} ${lastName} (${email}) has requested ${role} access.`,
        (notifErr) => {
          if (notifErr) console.error("Error creating notification:", notifErr);
        }
      );

      // Notify Chief Engineer
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "umeshsandeepa1@gmail.com",
        subject: "New User Registration Request",
        text: `New user (${email}) requested registration.`,
      });

      // Send temp password if auto-generated
      if (!password) {
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your Temporary Password",
          text: `Your temporary password is: ${plainPassword}`,
        });
      }

      res.json({ message: "Registration request sent. Wait for approval." });
    });
  } catch (err) {
    console.error('Registration controller error:', err);
    res.status(500).json({ error: `Registration failed: ${err.message}` });
  }
};

// ===================== LOGIN =====================
exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  // Fixed Chief Engineer login (CE = admin - only admin@lams.gov.lk allowed)
  if (email === "admin@lams.gov.lk" && password === "Admin@123") {
    const token = jwt.sign({ id: 1, role: "chief_engineer", email: "admin@lams.gov.lk" }, "secretkey", { expiresIn: "1h" });
    return res.json({ 
      message: "Login successful", 
      token, 
      role: "chief_engineer",
      user: {
        id: 1,
        email: "admin@lams.gov.lk",
        role: "chief_engineer",
        firstName: "Chief",
        lastName: "Engineer"
      }
    });
  }

  User.findByEmail(email, async (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (rows.length === 0) return res.status(400).json({ error: "User not found" });

    const user = rows[0];
    if (user.status !== 'approved')
      return res.status(403).json({ error: "Account not approved yet." });

    // Special restriction: Only admin@lams.gov.lk can have CE (admin) privileges
    if (user.role === 'CE' && user.email !== 'admin@lams.gov.lk') {
      return res.status(403).json({ 
        error: "Access denied. Only the system administrator (admin@lams.gov.lk) can access Chief Engineer privileges." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Map database roles to application roles
    // Note: CE is the system admin role - only admin@lams.gov.lk is allowed
    const roleMap = {
      'CE': 'chief_engineer', // CE is the system admin role (only admin@lams.gov.lk)
      'PE': 'project_engineer', 
      'FO': 'financial_officer',
      'LO': 'land_officer',
      'admin': 'chief_engineer' // Legacy admin role also maps to chief_engineer
    };

    const appRole = roleMap[user.role] || user.role;

    // Include email in JWT token for admin verification
    const tokenPayload = { 
      id: user.id, 
      role: appRole, 
      email: user.email 
    };

    const token = jwt.sign(tokenPayload, "secretkey", { expiresIn: "1h" });
    res.json({ 
      message: "Login successful", 
      token, 
      role: appRole,
      user: {
        id: user.id,
        email: user.email,
        role: appRole,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  });
};

// ===================== APPROVE USER =====================
exports.approveUser = (req, res) => {
  const { id } = req.params;
  console.log("Attempting to approve user with ID:", id);

  User.approve(id, (err) => {
    if (err) {
      console.error("Error approving user:", err);
      return res.status(500).json({ error: err.message || err });
    }
    console.log("User approved successfully, fetching user details...");

    User.findById(id, (err, rows) => {
      if (err) {
        console.error("Error finding user by ID:", err);
        return res.status(500).json({ error: err.message || err });
      }
      if (rows.length === 0) {
        console.log("User not found after approval");
        return res.status(404).json({ error: "User not found" });
      }

      const user = rows[0];
      console.log("Found user:", user.email, "Role:", user.role);
      user.joinDate = user.updated_at ? user.updated_at.toISOString().split("T")[0] : null;

      // Create notification for the approved user
      console.log("Creating notification for approved user...");
      Notification.create({
        user_id: user.id,
        type: Notification.TYPES.USER_APPROVED,
        title: 'Registration Approved',
        message: 'Your registration has been approved. You can now login to the system.'
      }, (notifErr) => {
        if (notifErr) console.error("Error creating notification:", notifErr);
        else console.log("Notification created successfully");
      });

      console.log("Sending approval email...");
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Registration Approved",
        text: "You are successfully registered. You can now login.",
      }, (emailErr) => {
        if (emailErr) console.error("Error sending email:", emailErr);
        else console.log("Approval email sent successfully");
      });

      console.log("Sending success response...");
      res.json({ message: "User approved", user });
    });
  });
};

// ===================== REJECT USER =====================
exports.rejectUser = (req, res) => {
  const { id } = req.params;

  User.reject(id, (err) => {
    if (err) return res.status(500).json({ error: err });

    User.findById(id, (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      if (rows.length === 0) return res.status(404).json({ error: "User not found" });

      const user = rows[0];
      user.rejectionDate = user.updated_at ? user.updated_at.toISOString().split("T")[0] : null;

      // Create notification for the rejected user
      Notification.create({
        user_id: user.id,
        type: Notification.TYPES.USER_REJECTED,
        title: 'Registration Rejected',
        message: 'Sorry, your registration request has been rejected. Please contact support for more information.'
      }, (notifErr) => {
        if (notifErr) console.error("Error creating notification:", notifErr);
      });

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Registration Rejected",
        text: "Sorry, your registration request has been rejected.",
      });

      res.json({ message: "User rejected", user });
    });
  });
};

// ===================== DELETE USER =====================
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  console.log('=== DELETE USER REQUEST ===');
  console.log('User ID to delete:', id);
  console.log('Request user:', req.user);
  
  User.delete(id, (err, result) => {
    if (err) {
      console.error('Delete user error:', err);
      return res.status(500).json({
        error: err.message || 'Failed to delete user',
        details: err.sqlMessage || err.toString()
      });
    }
    console.log('Delete user result:', result);
    res.json(result || { message: "User deleted successfully." });
  });
};

// ===================== UPDATE USER =====================
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  if (userData.password) {
    // Validate new password
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: "Password does not meet security requirements", 
        passwordErrors: passwordValidation.errors 
      });
    }

    bcrypt.hash(userData.password, 10, (err, hashed) => {
      if (err) return res.status(500).json({ error: err });
      userData.password = hashed;

      User.update(id, userData, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "User updated successfully." });
      });
    });
  } else {
    User.update(id, userData, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "User updated successfully." });
    });
  }
};

// ===================== GET USERS =====================
exports.getPendingUsers = (req, res) => {
  User.getPending((err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};

exports.getApprovedUsers = (req, res) => {
  User.getApproved((err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};

exports.getRejectedUsers = (req, res) => {
  User.getRejected((err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};

// ===================== GET PENDING USERS COUNT =====================
exports.getPendingUsersCount = (req, res) => {
  User.getPendingCount((err, count) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ count });
  });
};

// ===================== FORGOT / RESET PASSWORD =====================
exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const token = crypto.randomBytes(20).toString("hex");
  const expires = new Date(Date.now() + 3600000);

  User.setResetToken(email, token, expires, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(400).json({ error: "No user with this email" });

    const resetUrl = `http://localhost:3000/reset-password/${token}`;

    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetUrl}`,
    });

    res.json({ message: "Password reset email sent" });
  });
};

exports.resetPassword = (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: "New password required" });

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      error: "Password does not meet security requirements", 
      passwordErrors: passwordValidation.errors 
    });
  }

  User.findByResetToken(token, async (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (rows.length === 0) return res.status(400).json({ error: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    User.updatePassword(rows[0].id, hashedPassword, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Password reset successful" });
    });
  });
};
