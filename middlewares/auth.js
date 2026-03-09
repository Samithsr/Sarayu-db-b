const ErrorResponse = require('./errorResponse');

// Middleware to check if user is authenticated
const authenticate = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next(new ErrorResponse('Access denied. Please login to continue.', 401));
  }
  req.user = req.session.user;
  next();
};

// Middleware to check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return next(new ErrorResponse('Access denied. Please login to continue.', 401));
    }
    
    if (!roles.includes(req.session.user.role)) {
      return next(new ErrorResponse(`Access denied. ${req.session.user.role} role is not authorized.`, 403));
    }
    
    req.user = req.session.user;
    next();
  };
};

// Middleware to check if user can access specific company
const authorizeCompanyAccess = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next(new ErrorResponse('Access denied. Please login to continue.', 401));
  }

  const user = req.session.user;
  const { companyId } = req.params;

  // Admin can access all companies
  if (user.role === 'admin') {
    req.user = user;
    return next();
  }

  // Check if user belongs to the requested company
  if (user.company && user.company.toString() !== companyId) {
    return next(new ErrorResponse('Access denied. You can only access your own company.', 403));
  }

  req.user = user;
  next();
};

module.exports = {
  authenticate,
  authorize,
  authorizeCompanyAccess
};
