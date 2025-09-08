const express = require("express");
const router = express.Router();
const valuationController = require("../controllers/valuationController");
const { verifyToken } = require("../middleware/authMiddleware");

// Middleware to check if user is Financial Officer
const checkFORole = (req, res, next) => {
  if (req.user.role !== 'FO') {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only Financial Officers can manage valuations."
    });
  }
  next();
};

// Create or update valuation for a lot
router.post("/plans/:plan_id/lots/:lot_id/valuation", 
  verifyToken, 
  checkFORole, 
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
