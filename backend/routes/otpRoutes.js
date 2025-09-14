const express = require("express");
const router = express.Router();
const otpController = require("../controllers/otpController");

router.post("/generate", otpController.generateOTP);
// Removed separate verify endpoint - verification is now consolidated into reset-password
router.post("/reset-password", otpController.resetPasswordWithOTP);
router.delete("/cleanup", otpController.cleanupOTPs); // optional cron trigger

module.exports = router;
