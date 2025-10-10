const express = require("express");
const router = express.Router();
const valuationController = require("../controllers/valuationController");
const { verifyToken, requireFinancialOfficer } = require("../middleware/authMiddleware");

// Create or update valuation for a lot
router.post("/plans/:plan_id/lots/:lot_id/valuation", 
  (req, res, next) => {
    console.log('🔥 === VALUATION POST ROUTE HIT === 🔥');
    console.log('Method:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('Params:', req.params);
    console.log('Body keys:', Object.keys(req.body || {}));
    console.log('Headers Authorization:', req.headers.authorization ? 'Present' : 'Missing');
    console.log('🔥 === END ROUTE DEBUG === 🔥');
    next();
  },
  verifyToken,
  (req, res, next) => {
    console.log('🔥 === AFTER TOKEN VERIFICATION === 🔥');
    console.log('User from token:', req.user);
    console.log('User role:', req.user?.role);
    console.log('🔥 === END TOKEN DEBUG === 🔥');
    next();
  },
  // requireFinancialOfficer,  // ✅ Temporarily commented out for debugging
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

// Test database connection (for debugging)
router.get("/test-database", 
  verifyToken, 
  valuationController.testDatabase
);

// Simple test route to check if routes are loading
router.get("/test-route", (req, res) => {
  console.log('🚀 TEST ROUTE HIT - Valuation routes are working! 🚀');
  res.json({ success: true, message: "Valuation routes are working!" });
});

module.exports = router;