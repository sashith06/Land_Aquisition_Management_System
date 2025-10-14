const express = require("express");
const router = express.Router();
const landownerController = require("../controllers/landownerController");
const { verifyToken } = require("../middleware/authMiddleware");
const { uploadDocument } = require("../middleware/uploadMiddleware");

// Public routes
router.post("/request-otp", landownerController.requestOTP);
router.post("/verify-otp", landownerController.verifyOTP);

// Protected routes
router.get("/lots", verifyToken, landownerController.getLandownerLots);
router.get("/profile", verifyToken, landownerController.getProfile);

// Document upload routes
router.post("/upload-document", verifyToken, uploadDocument, landownerController.uploadDocument);
router.get("/documents", verifyToken, landownerController.getDocuments);
router.get("/documents-by-nic/:nic", verifyToken, landownerController.getDocumentsByNIC);
router.delete("/documents/:document_type", verifyToken, landownerController.deleteDocument);

// Debug route
router.get("/debug-compensation/:nic", verifyToken, landownerController.debugCompensationData);

module.exports = router;