const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, requireChiefEngineer, requireSystemAdmin } = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes that require System Admin (only admin@lams.gov.lk)
router.get("/users/approved", verifyToken, requireSystemAdmin, authController.getApprovedUsers);
router.get("/users/pending", verifyToken, requireSystemAdmin, authController.getPendingUsers);
router.get("/users/pending/count", verifyToken, requireSystemAdmin, authController.getPendingUsersCount);
router.get("/users/rejected", verifyToken, requireSystemAdmin, authController.getRejectedUsers);

router.put("/approve/:id", verifyToken, requireSystemAdmin, authController.approveUser);
router.put("/reject/:id", verifyToken, requireSystemAdmin, authController.rejectUser);
router.put("/users/:id", verifyToken, requireSystemAdmin, authController.updateUser);
router.delete("/users/:id", verifyToken, requireSystemAdmin, authController.deleteUser);

// Password reset routes (public)
router.post("/forgot-password", authController.forgotPassword);
router.put("/reset-password/:token", authController.resetPassword);

module.exports = router;
