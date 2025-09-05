const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
const { verifyToken, requireAll, requireProjectEngineer } = require("../middleware/authMiddleware");

// Create a plan (Project Engineers only)
router.post("/create", verifyToken, requireProjectEngineer, planController.createPlan);

// Get all plans by project (All authenticated users)
router.get("/project/:project_id", verifyToken, requireAll, planController.getPlansByProject);

// Get single plan by ID (All authenticated users)
router.get("/:id", verifyToken, requireAll, planController.getPlanById);

module.exports = router;
