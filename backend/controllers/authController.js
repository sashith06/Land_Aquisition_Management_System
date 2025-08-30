// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/userModel");

// Setup email transporter
// Normalize email password (remove accidental spaces) and create SMTP transporter
const normalizedEmailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : undefined;
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: normalizedEmailPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 20000,
});

// Verify transporter configuration at startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email transporter is ready');
  }
});

// ===================== HELPER =====================
function generatePassword(length = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

// ===================== REGISTER =====================
exports.register = async (req, res) => {
  const { firstName, lastName, email, role, password } = req.body;
  if (!firstName || !lastName || !email || !role)
    return res.status(400).json({ error: "All fields are required" });

  const plainPassword = password || generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  User.create(
    { firstName, lastName, email, role, password: hashedPassword },
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "chiefengineer@gmail.com",
        subject: "New User Registration Request",
        text: `New user (${email}) requested registration.`,
      }, (err, info) => {
        if (err) console.error('Failed to send registration notification to chief:', err);
        else console.log('Registration notification sent to chief:', info.response);
      });

      if (!password) {
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your Temporary Password",
          text: `Your temporary password is: ${plainPassword}`,
        }, (err, info) => {
          if (err) console.error('Failed to send temporary password email:', err);
          else console.log('Temporary password email sent:', info.response);
        });
      }

      res.json({ message: "Registration request sent. Wait for approval." });
    }
  );
};

// ===================== LOGIN =====================
exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  User.findByEmail(email, async (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (rows.length === 0) return res.status(400).json({ error: "User not found" });

    const user = rows[0];
    if (user.status !== "approved")
      return res.status(403).json({ error: "Account not approved yet." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, "secretkey", { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  });
};

// ===================== APPROVE / REJECT / DELETE / UPDATE =====================
exports.approveUser = (req, res) => {
  const { id } = req.params;
  User.approve(id, (err) => {
    if (err) return res.status(500).json({ error: err });

    User.findById(id, (err, rows) => {
      if (err) return console.log(err);
      if (rows.length > 0) {
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: rows[0].email,
          subject: "Registration Approved",
          text: "You are successfully registered. You can now login.",
        }, (err, info) => {
          if (err) console.error('Failed to send approval email:', err);
          else console.log('Approval email sent:', info.response);
        });
      }
    });

    res.json({ message: "User approved and email sent." });
  });
};

exports.rejectUser = (req, res) => {
  const { id } = req.params;
  User.reject(id, (err) => {
    if (err) return res.status(500).json({ error: err });

    User.findById(id, (err, rows) => {
      if (err) return console.log(err);
      if (rows.length > 0) {
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: rows[0].email,
          subject: "Registration Rejected",
          text: "Sorry, your registration request has been rejected.",
        }, (err, info) => {
          if (err) console.error('Failed to send rejection email:', err);
          else console.log('Rejection email sent:', info.response);
        });
      }
    });

    res.json({ message: "User rejected and email sent." });
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  User.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "User deleted successfully." });
  });
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  if (userData.password) {
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

// ===================== FORGOT / RESET PASSWORD =====================
exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const token = crypto.randomBytes(20).toString("hex");
  const expires = new Date(Date.now() + 3600000);

  User.setResetToken(email, token, expires, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(400).json({ error: "No user with this email" });

    // ✅ Send link pointing to frontend
    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetUrl}`,
    }, (err, info) => {
      if (err) console.error('Failed to send password reset email:', err);
      else console.log('Password reset email sent:', info.response);
    });

    res.json({ message: "Password reset email sent" });
  });
};


exports.resetPassword = (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: "New password required" });

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

exports.approveUser = (req, res) => {
  const { id } = req.params;

  User.approve(id, (err) => {
    if (err) return res.status(500).json({ error: err });

    User.findById(id, (err, rows) => {
      if (err) return res.status(500).json({ error: err });

      if (rows.length > 0) {
        const user = rows[0];
        // Format joinDate
        user.joinDate = user.approved_at ? user.approved_at.toISOString().split('T')[0] : null;

        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Registration Approved",
          text: "You are successfully registered. You can now login.",
        }, (err, info) => {
          if (err) console.error('Failed to send approval email:', err);
          else console.log('Approval email sent:', info.response);
        });

        res.json({ message: "User approved", user });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    });
  });
};

exports.rejectUser = (req, res) => {
  const { id } = req.params;

  User.reject(id, (err) => {
    if (err) return res.status(500).json({ error: err });

    User.findById(id, (err, rows) => {
      if (err) return res.status(500).json({ error: err });

      if (rows.length > 0) {
        const user = rows[0];
        // Format rejectionDate
        user.rejectionDate = user.rejected_at ? user.rejected_at.toISOString().split('T')[0] : null;

        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Registration Rejected",
          text: "Sorry, your registration request has been rejected.",
        }, (err, info) => {
          if (err) console.error('Failed to send rejection email:', err);
          else console.log('Rejection email sent:', info.response);
        });

        res.json({ message: "User rejected", user });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    });
  });
};
