const express = require("express");
const router = express.Router();
const lotController = require("../controllers/lotController");
const { verifyToken, requireAll, requireLandOfficer, requireEngineers } = require("../middleware/authMiddleware");

// Function for engineers or land officers
const requireEngineersOrLO = (req, res, next) => {
  if (['chief_engineer', 'project_engineer', 'land_officer'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied' });
  }
};

// Get advance tracing numbers for dropdown
router.get("/advance-tracing-numbers", verifyToken, requireAll, lotController.getAdvanceTracingNumbers);

// Create a lot (Land Officers only)
router.post("/create", verifyToken, requireLandOfficer, lotController.createLot);

// Get all lots for current user based on role (role-based access control)
router.get("/user/lots", verifyToken, requireAll, lotController.getLotsForUser);

// Get all lots for a plan (All authenticated users) - original method
router.get("/plan/:planId", verifyToken, requireAll, lotController.getLotsByPlan);

// Get lots for a plan with role-based access control
router.get("/plan/:planId/role-based", verifyToken, requireAll, lotController.getLotsByPlanWithRole);

// Owner management routes
router.get("/owners/all", verifyToken, requireAll, lotController.getAllOwners);

// Get single lot by ID (All authenticated users)
router.get("/:id", verifyToken, requireAll, lotController.getLotById);

// Get lot land details
router.get("/:id/land-details", verifyToken, requireAll, lotController.getLandDetails);

// Save/Create lot land details
router.post("/:id/land-details", verifyToken, requireAll, lotController.saveLandDetails);

// Add owner to lot
router.post("/:lotId/owners", verifyToken, requireEngineersOrLO, lotController.addOwnerToLot);

// Update lot (Land Officers only)
router.put("/:id", verifyToken, requireLandOfficer, lotController.updateLot);

// Update lot land details (Land Officers, Project Engineers, Chief Engineers)
router.put("/:id/land-details", verifyToken, requireAll, lotController.updateLotLandDetails);

// Remove owner from lot
router.delete("/:lotId/owners/:ownerId", verifyToken, requireEngineersOrLO, lotController.removeOwnerFromLot);

// Delete lot (Land Officers only)
router.delete("/:id", verifyToken, requireLandOfficer, lotController.deleteLot);

// Dashboard specific routes for CE and PE
router.get("/dashboard/all", verifyToken, lotController.getAllLotsWithProjectPlanInfo);
router.get("/dashboard/pe", verifyToken, lotController.getLotsForProjectEngineer);

module.exports = router;
