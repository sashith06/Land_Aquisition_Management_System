const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");

// Create a plan
router.post("/create", planController.createPlan);

// Get all plans by project
router.get("/project/:project_id", planController.getPlansByProject);

// Get single plan by ID
router.get("/:id", planController.getPlanById);

module.exports = router;
