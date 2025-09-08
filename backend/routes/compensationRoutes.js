const express = require("express");
const router = express.Router();
const compensationController = require("../controllers/compensationController");
const { verifyToken } = require("../middleware/authMiddleware");

// Middleware to check if user is Financial Officer
const checkFORole = (req, res, next) => {
  if (req.user.role !== 'FO') {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only Financial Officers can manage compensations."
    });
  }
  next();
};

// Create or update compensation for a lot
router.post("/plans/:plan_id/lots/:lot_id/compensation", 
  verifyToken, 
  checkFORole, 
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
