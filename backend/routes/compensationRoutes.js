const express = require("express");
const router = express.Router();
const compensationPaymentDetailsController = require("../controllers/compensationPaymentDetailsController");
const { verifyToken, requireFinancialOfficer, requireAll } = require("../middleware/authMiddleware");

// Standard compensation routes following valuation pattern

// Create or update compensation for a lot (FINANCIAL OFFICERS ONLY)
router.post("/plans/:plan_id/lots/:lot_id/compensation", 
  (req, res, next) => {
    console.log('🔥 === COMPENSATION POST ROUTE HIT === 🔥');
    console.log('Method:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('Params:', req.params);
    console.log('Body keys:', Object.keys(req.body || {}));
    console.log('User role:', req.user?.role);
    console.log('🔥 === END ROUTE DEBUG === 🔥');
    next();
  },
  verifyToken,
  requireFinancialOfficer,
  compensationPaymentDetailsController.createOrUpdateCompensation
);

// Get compensation for a specific lot (ALL AUTHENTICATED USERS CAN VIEW)
router.get("/plans/:plan_id/lots/:lot_id/compensation", 
  (req, res, next) => {
    console.log('🔥 === COMPENSATION GET ROUTE HIT === 🔥');
    console.log('Method:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('Params:', req.params);
    console.log('User role:', req.user?.role);
    console.log('🔥 === END ROUTE DEBUG === 🔥');
    next();
  },
  verifyToken,
  requireAll,
  compensationPaymentDetailsController.getCompensationByLot
);

// Get all compensations for a plan (ALL AUTHENTICATED USERS CAN VIEW)
router.get("/plans/:plan_id/compensations",
  verifyToken,
  requireAll,
  compensationPaymentDetailsController.getPaymentDetailsByPlan
);

// Additional routes for detailed payment tracking (FINANCIAL OFFICERS ONLY FOR EDITING)
// Create or update payment details for a specific owner
router.post("/plans/:plan_id/lots/:lot_id/owners/:owner_nic/payment-details", 
  verifyToken,
  requireFinancialOfficer,
  compensationPaymentDetailsController.createOrUpdatePaymentDetails
);

// Get payment details for a specific owner (ALL AUTHENTICATED USERS CAN VIEW)
router.get("/plans/:plan_id/lots/:lot_id/owners/:owner_nic/payment-details", 
  verifyToken,
  requireAll,
  compensationPaymentDetailsController.getPaymentDetailsByOwner
);

module.exports = router;