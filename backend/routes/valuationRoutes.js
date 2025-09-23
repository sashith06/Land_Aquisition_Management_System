const express = require("express");
const router = express.Router();
const valuationController = require("../controllers/valuationController");
const { verifyToken, requireFinancialOfficer } = require("../middleware/authMiddleware");

// Create or update valuation for a lot
router.post("/plans/:plan_id/lots/:lot_id/valuation", 
  verifyToken, 
  requireFinancialOfficer,  // ✅ Fixed: Using consistent role middleware
  valuationController.createOrUpdateValuation
);

// Get valuation for a specific lot
router.get("/plans/:plan_id/lots/:lot_id/valuation", 
  verifyToken, 
  (req, res, next) => {
    console.log('=== VALUATION ROUTE DEBUG ===');
    console.log('Full URL:', req.originalUrl);
    console.log('Route params:', req.params);
    console.log('========================');
    next();
  },
  valuationController.getValuationByLotId
);

// Get all valuations for a plan
router.get("/plans/:plan_id/valuations", 
  verifyToken, 
  valuationController.getValuationsByPlanId
);

module.exports = router;