// controllers/authController.js

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const transporter = require("../config/emailTransporter"); // your nodemailer transporter
const OTP = require("../models/otpModel"); // expects callback-based methods used below
const User = require("../models/userModel");

// ---------- CONFIG ----------
const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_COOLDOWN_MS = 60 * 1000; // 1 minute between requests
const MAX_OTP_ATTEMPTS = 5;

// ---------- HELPERS ----------
function generateNumericOtp() {
  // crypto.randomInt is available in Node 12+
  return crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();
}

function isStrongPassword(pw) {
  // min 8 chars, at least 1 upper, 1 lower, 1 number, 1 special char
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*()_\-+=\[\]{};:'"\\|,.<>\/?]).{8,}$/;
  return re.test(pw);
}

function generateOtpEmail(name, otp) {
  const appName = "Land Acquisition Management System";
  const year = new Date().getFullYear();
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${appName} - Password Reset OTP</title>
  </head>
  <body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f6f8; padding:32px 12px;">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 30px rgba(11,22,39,0.06);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(90deg,#2563eb,#7c3aed); padding:28px 32px; text-align:center;">
                <div style="font-size:28px; color:#fff; font-weight:700;">🔐 ${appName}</div>
                <div style="color:rgba(255,255,255,0.9); font-size:13px; margin-top:6px;">Password Reset Verification</div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:28px 36px;">
                <p style="margin:0 0 12px 0; color:#102a43; font-size:15px;">Hi <strong>${name}</strong>,</p>
                <p style="margin:0 0 18px 0; color:#334e68; font-size:14px; line-height:1.5;">
                  We received a request to reset your password. Use the verification code below to continue. This code is one-time use and will expire shortly.
                </p>

                <div style="text-align:center; margin:20px 0;">
                  <div style="display:inline-block; padding:18px 28px; border-radius:10px; background:#f0f6ff; border:2px dashed #2563eb;">
                    <span style="font-family: 'Courier New', monospace; font-size:28px; letter-spacing:6px; color:#0b3b84; font-weight:700;">
                      ${otp}
                    </span>
                  </div>
                </div>

                <p style="margin:0 0 8px 0; color:#334e68; font-size:13px;">
                  <strong>Expires in:</strong> 10 minutes.
                </p>
                <p style="margin:0 0 12px 0; color:#334e68; font-size:13px;">
                  <strong>Note:</strong> Do not share this code with anyone. If you did not request this, please ignore this email or contact support.
                </p>

                <div style="margin-top:24px;">
                  <a href="#" style="display:inline-block; padding:10px 18px; border-radius:8px; text-decoration:none; background:linear-gradient(90deg,#2563eb,#7c3aed); color:#fff; font-weight:600; font-size:14px;">
                    Reset Password
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc; padding:18px 28px; text-align:center; color:#6b7280; font-size:12px;">
                © ${year} ${appName}. This is an automated message; please do not reply.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

// ---------- CONTROLLERS ----------

// Generate and send OTP
exports.generateOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    // find user
    User.findByEmail(email, async (userErr, users) => {
      if (userErr) {
        console.error("DB error in findByEmail:", userErr);
        return res.status(500).json({ error: "Database error" });
      }
      if (!users || users.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = users[0];

      // Cooldown - check last OTP created for this email
      OTP.getLatestByEmail(email, async (lastErr, lastRows) => {
        if (lastErr) {
          console.error("DB error in getLatestByEmail:", lastErr);
          // continue (don't leak too much) but prefer to stop to be safe
          return res.status(500).json({ error: "Database error" });
        }

        if (lastRows && lastRows.length > 0) {
          const last = lastRows[0];
          if (new Date() - new Date(last.created_at) < OTP_COOLDOWN_MS) {
            return res.status(429).json({ error: "Please wait a minute before requesting a new code" });
          }
        }

        // generate OTP
        const otp = generateNumericOtp();
        const hashedOTP = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

        // store OTP
        OTP.create(email, hashedOTP, expiresAt, (createErr) => {
          if (createErr) {
            console.error("DB error in OTP.create:", createErr);
            return res.status(500).json({ error: "Failed to store OTP" });
          }

          // send email
          const mailOptions = {
            from: `"LAMS System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset OTP - LAMS",
            text: `Your OTP for password reset is: ${otp}. This code expires in 10 minutes.`,
            html: generateOtpEmail(user.name || user.username || "User", otp),
          };

          transporter.sendMail(mailOptions, (mailErr, info) => {
            if (mailErr) {
              console.error("Email sending error:", mailErr);
              // optionally delete the OTP (to avoid orphaned codes) — implement if your model supports delete by email+created_at
              return res.status(500).json({ error: "Failed to send OTP email" });
            }

            return res.json({ message: "OTP sent to email" });
          });
        });
      });
    });
  } catch (e) {
    console.error("Unexpected error in generateOTP:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Reset password using OTP
exports.resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password required" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    // fetch latest unused OTP for this email
    OTP.getLatestUnusedByEmail(email, async (err, rows) => {
      if (err) {
        console.error("DB error in getLatestUnusedByEmail:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (!rows || rows.length === 0) return res.status(400).json({ error: "No valid OTP found" });

      const otpRecord = rows[0];

      // expiry check
      if (new Date() > new Date(otpRecord.expires_at)) {
        return res.status(400).json({ error: "OTP expired" });
      }

      // attempts check
      if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        return res.status(400).json({ error: "Maximum OTP attempts exceeded" });
      }

      // compare OTP (bcrypt)
      const isMatch = await bcrypt.compare(otp, otpRecord.otp_code);
      if (!isMatch) {
        // increment attempts (best-effort)
        OTP.incrementAttempts(otpRecord.id, (incErr) => {
          if (incErr) console.error("Failed to increment OTP attempts:", incErr);
        });
        return res.status(400).json({ error: "Invalid OTP" });
      }

      // At this point OTP is valid.
      // NOTE: Ideally this and the password update should be done in a DB transaction or using an atomic "mark-as-used if unused" update.
      OTP.markAsUsed(otpRecord.id, (markErr) => {
        if (markErr) console.error("Failed to mark OTP as used:", markErr);
      });

      // Hash new password and update user
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      User.findByEmail(email, (userErr, userRows) => {
        if (userErr) {
          console.error("Error finding user:", userErr);
          return res.status(500).json({ error: "Database error" });
        }

        if (!userRows || userRows.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        const userId = userRows[0].id;
        User.update(userId, { password: hashedPassword }, (updateErr) => {
          if (updateErr) {
            console.error("Error updating password:", updateErr);
            return res.status(500).json({ error: "Failed to update password" });
          }

          return res.json({ message: "Password reset successful" });
        });
      });
    });
  } catch (e) {
    console.error("Unexpected error in resetPasswordWithOTP:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Cleanup expired or used OTPs (endpoint or scheduled job can call this)
exports.cleanupOTPs = (req, res) => {
  OTP.deleteExpiredOrUsed((err) => {
    if (err) {
      console.error("Failed to clean OTPs:", err);
      return res.status(500).json({ error: "Failed to clean OTPs" });
    }
    res.json({ message: "Expired/used OTPs cleaned" });
  });
};
