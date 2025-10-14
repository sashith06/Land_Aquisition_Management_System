const express = require("express");
const router = express.Router();
const compensationPaymentDetailsController = require("../controllers/compensationPaymentDetailsController");
const { verifyToken, requireFinancialOfficer, requireAll } = require("../middleware/authMiddleware");

// Standard compensation routes following valuation pattern

// Create or update compensation for a lot (FINANCIAL OFFICERS ONLY)
router.post("/plans/:plan_id/lots/:lot_id/compensation", 
  verifyToken,
  requireFinancialOfficer,
  compensationPaymentDetailsController.createOrUpdateCompensation
);

// Get compensation for a specific lot (ALL AUTHENTICATED USERS CAN VIEW)
router.get("/plans/:plan_id/lots/:lot_id/compensation", 
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

// Calculate interest for a compensation record (FINANCIAL OFFICERS ONLY)
router.post("/plans/:plan_id/lots/:lot_id/owners/:owner_nic/calculate-interest",
  verifyToken,
  requireFinancialOfficer,
  compensationPaymentDetailsController.calculateInterest
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