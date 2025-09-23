
const express = require("express");
const router = express.Router();
const compensationController = require("../controllers/compensationController");
const { verifyToken, requireFinancialOfficer } = require("../middleware/authMiddleware");

// Create or update compensation for a lot
router.post("/plans/:plan_id/lots/:lot_id/compensation", 
  verifyToken, 
  requireFinancialOfficer,  // ✅ Fixed: Using consistent role middleware
  compensationController.createOrUpdateCompensation
);

// Get compensation for a specific lot
router.get("/plans/:plan_id/lots/:lot_id/compensation", 
  verifyToken, 
  compensationController.getCompensationByLotId
);

// Get all compensations for a plan
router.get("/plans/:plan_id/compensations", 
  verifyToken, 
  compensationController.getCompensationsByPlanId
);

module.exports = router;