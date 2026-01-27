const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/userModel");

// Middleware to protect routes - verify session
exports.protect = async (req, res, next) => {
  try {
    // Check if session exists and has user data
    if (!req.session || !req.session.user) {
      return next(new ErrorResponse("Not authorized to access this route", 401));
    }

    // Get user from database
    const user = await User.findById(req.session.user.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 401));
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    next(new ErrorResponse("Not authorized to access this route", 401));
  }
};

// Middleware to grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse("Not authorized to access this route", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
