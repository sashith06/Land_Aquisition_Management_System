const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/users/approved", authController.getApprovedUsers);
router.get("/users/pending", authController.getPendingUsers);
router.get("/users/rejected", authController.getRejectedUsers);

router.put("/approve/:id", authController.approveUser);
router.put("/reject/:id", authController.rejectUser);
router.put("/users/:id", authController.updateUser);
router.delete("/users/:id", authController.deleteUser);

router.post("/forgot-password", authController.forgotPassword);
router.put("/reset-password/:token", authController.resetPassword);

module.exports = router;
