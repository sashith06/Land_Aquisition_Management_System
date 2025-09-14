const express = require("express");
const router = express.Router();
const landownerController = require("../controllers/landownerController");
const { verifyToken } = require("../middleware/authMiddleware");

// Public routes
router.post("/request-otp", landownerController.requestOTP);
router.post("/verify-otp", landownerController.verifyOTP);

// Protected routes
router.get("/lots", verifyToken, landownerController.getLandownerLots);
router.get("/profile", verifyToken, landownerController.getProfile);

module.exports = router;