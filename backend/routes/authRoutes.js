const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, requireChiefEngineer } = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes that require Chief Engineer role
router.get("/users/approved", verifyToken, requireChiefEngineer, authController.getApprovedUsers);
router.get("/users/pending", verifyToken, requireChiefEngineer, authController.getPendingUsers);
router.get("/users/rejected", verifyToken, requireChiefEngineer, authController.getRejectedUsers);

router.put("/approve/:id", verifyToken, requireChiefEngineer, authController.approveUser);
router.put("/reject/:id", verifyToken, requireChiefEngineer, authController.rejectUser);
router.put("/users/:id", verifyToken, requireChiefEngineer, authController.updateUser);
router.delete("/users/:id", verifyToken, requireChiefEngineer, authController.deleteUser);

// Password reset routes (public)
router.post("/forgot-password", authController.forgotPassword);
router.put("/reset-password/:token", authController.resetPassword);

module.exports = router;
