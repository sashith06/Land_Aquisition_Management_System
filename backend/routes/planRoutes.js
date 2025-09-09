const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
const { verifyToken, requireAll, requireLandOfficer, requireFinancialOfficer, requireEngineers, requireOfficers } = require("../middleware/authMiddleware");

// Create a plan (Land Officers only - for assigned projects)
router.post("/create", verifyToken, requireLandOfficer, planController.createPlan);

// Role-based plan access - get all plans accessible to current user based on role
router.get("/user/plans", verifyToken, requireAll, planController.getPlansForUser);

// Get all plans by project (All authenticated users with role-based permissions)
router.get("/project/:project_id", verifyToken, requireAll, planController.getPlansByProject);

// Get plans created by current user (All authenticated users can view their own plans)
router.get("/my-plans", verifyToken, requireAll, planController.getMyPlans);

// Get all viewable plans for assigned projects (All authenticated users can view plans)
router.get("/viewable-plans", verifyToken, requireAll, planController.getAllViewablePlans);

// Get single plan by ID (All authenticated users)
router.get("/:id", verifyToken, requireAll, planController.getPlanById);

// Update plan (Land Officer only - own plans)
router.put("/:id", verifyToken, requireLandOfficer, planController.updatePlan);

// Update plan status (Role-based status transitions - restrict to officers)
router.put("/:id/status", verifyToken, requireOfficers, planController.updatePlanStatus);

// Delete plan (Land Officer only - own plans)
router.delete("/:id", verifyToken, requireLandOfficer, planController.deletePlan);

// Get assigned projects for current land officer
router.get("/assigned/projects", verifyToken, requireLandOfficer, planController.getAssignedProjects);

module.exports = router;
