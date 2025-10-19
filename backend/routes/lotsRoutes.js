const express = require("express");
const router = express.Router();
const LotsController = require("../controllers/lotsController");
const { verifyToken, requireAll, requireLandOfficer, requireFinancialOfficer } = require("../middleware/authMiddleware");

// Create a lot (Land Officers only - for assigned projects)
router.post("/create", verifyToken, requireLandOfficer, LotsController.createLot);

// Get lots by plan (All authenticated users with role-based permissions)
router.get("/plan/:plan_id", verifyToken, requireAll, LotsController.getLotsByPlan);

// Update lot basic details (Land Officer only - own lots)
router.put("/:id", verifyToken, requireLandOfficer, LotsController.updateLot);

// Add valuation details (Financial Officer only)
router.put("/:id/valuation", verifyToken, requireFinancialOfficer, LotsController.addValuation);

// Add compensation details (Financial Officer only)
router.put("/:id/compensation", verifyToken, requireFinancialOfficer, LotsController.addCompensation);

// Delete lot (Land Officer only - own lots)
router.delete("/:id", verifyToken, requireLandOfficer, LotsController.deleteLot);

module.exports = router;
