// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/userModel");

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
function generatePassword(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ===================== REGISTER =====================
exports.register = async (req, res) => {
  const { firstName, lastName, email, role, password } = req.body;
  if (!firstName || !lastName || !email || !role)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const plainPassword = password || generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    User.create({ firstName, lastName, email, role, password: hashedPassword }, (err) => {
      if (err) return res.status(500).json({ error: err });

      // Notify Chief Engineer
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "chiefengineer@gmail.com",
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
    res.status(500).json({ error: err.message });
  }
};

// ===================== LOGIN =====================
exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  // Fixed Chief Engineer login
  if (email === "admin@lams.gov.lk" && password === "Admin@123") {
    const token = jwt.sign({ id: "admin", role: "chief_engineer" }, "secretkey", { expiresIn: "1h" });
    return res.json({ 
      message: "Login successful", 
      token, 
      role: "chief_engineer",
      user: {
        id: "admin",
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
    if (user.status !== "approved")
      return res.status(403).json({ error: "Account not approved yet." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, "secretkey", { expiresIn: "1h" });
    res.json({ 
      message: "Login successful", 
      token, 
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  });
};

// ===================== APPROVE USER =====================
exports.approveUser = (req, res) => {
  const { id } = req.params;

  User.approve(id, (err) => {
    if (err) return res.status(500).json({ error: err });

    User.findById(id, (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      if (rows.length === 0) return res.status(404).json({ error: "User not found" });

      const user = rows[0];
      user.joinDate = user.approved_at ? user.approved_at.toISOString().split("T")[0] : null;

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Registration Approved",
        text: "You are successfully registered. You can now login.",
      });

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
      user.rejectionDate = user.rejected_at ? user.rejected_at.toISOString().split("T")[0] : null;

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
  User.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "User deleted successfully." });
  });
};

// ===================== UPDATE USER =====================
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
