const nodemailer = require("nodemailer");
require("dotenv").config();

// Normalize email password by removing whitespace
const normalizedEmailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : undefined;

// Create email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: normalizedEmailPass,
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 5000, // Reduced from 20000 to 5000ms
  greetingTimeout: 3000,   // Added greeting timeout
  socketTimeout: 5000,     // Added socket timeout
  pool: true,              // Use connection pooling
  maxConnections: 5,       // Max concurrent connections
  maxMessages: 100,        // Max messages per connection
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) console.error("Email transporter verification failed:", error);
  else console.log("Email transporter is ready");
});

module.exports = transporter;