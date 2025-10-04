// Permission middleware for role-based access control

// Middleware to check if user is a Financial Officer
const requireFinancialOfficer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  if (req.user.role !== 'financial_officer') {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only Financial Officers can perform this action."
    });
  }

  next();
};

// Middleware to check if user is a Project Engineer
const requireProjectEngineer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  if (req.user.role !== 'project_engineer') {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only Project Engineers can perform this action."
    });
  }

  next();
};

// Middleware to check if user is a Chief Engineer
const requireChiefEngineer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  if (req.user.role !== 'chief_engineer') {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only Chief Engineers can perform this action."
    });
  }

  next();
};

// Middleware to check if user is a Land Officer
const requireLandOfficer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  if (req.user.role !== 'land_officer') {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only Land Officers can perform this action."
    });
  }

  next();
};

// Middleware to check if user has any of the specified roles
const requireAnyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  requireFinancialOfficer,
  requireProjectEngineer,
  requireChiefEngineer,
  requireLandOfficer,
  requireAnyRole
};