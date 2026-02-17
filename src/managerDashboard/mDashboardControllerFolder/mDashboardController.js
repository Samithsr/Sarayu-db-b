const Company = require("../../../models/company-model");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");

// @desc    Get all companies
// @route   GET /api/v1/managerDashboard/getAllCompanies
// @access  Private (manager)
exports.getAllCompanies = asyncHandler(async (req, res, next) => {
  const companies = await Company.find().sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: companies.length,
    data: companies
  });
});