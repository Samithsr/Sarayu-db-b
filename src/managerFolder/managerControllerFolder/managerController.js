const Manager = require("../../../models/managerModel");
const Company = require("../../../models/company-model");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");
const bcrypt = require("bcryptjs");

// @desc    Create a new manager
// @route   POST /api/v1/manager/create
// @access  Public
exports.createManager = asyncHandler(async (req, res, next) => {
  const { name, email, phoneNumber, password, company } = req.body;
  
  const manager = await Manager.findOne({ email });
  
  if (manager) {
    return next(new ErrorResponse("Manager already exists!", 409));
  }
  
  const newManager = new Manager({ name, email, phoneNumber, password, company });
  await newManager.save();
  
  res.status(201).json({
    success: true,
    data: newManager,
  });
});

// @desc    Get all managers
// @route   GET /api/v1/manager/all
// @access  Public
exports.getAllManagers = asyncHandler(async (req, res, next) => {
  const managers = await Manager.find().populate("company", "name email").select("-password");
  
  res.status(200).json({
    success: true,
    count: managers.length,
    data: managers
  });
});

// @desc    Get single manager
// @route   GET /api/v1/manager/:id
// @access  Public
exports.getManager = asyncHandler(async (req, res, next) => {
  const manager = await Manager.findById(req.params.id).populate("company", "name email").select("-password");
  
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: manager
  });
});

// @desc    Update manager
// @route   PUT /api/v1/manager/:id
// @access  Public
exports.updateManager = asyncHandler(async (req, res, next) => {
  const { name, email, phoneNumber, company } = req.body;
  
  let manager = await Manager.findById(req.params.id);
  
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id of ${req.params.id}`, 404));
  }
  
  // If updating email, check if it's already taken
  if (email && email !== manager.email) {
    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return next(new ErrorResponse("Email already exists", 409));
    }
  }
  
  // If updating company, check if it exists
  if (company && company !== manager.company) {
    const existingCompany = await Company.findById(company);
    if (!existingCompany) {
      return next(new ErrorResponse("Company not found", 404));
    }
  }
  
  // Update manager fields
  if (name) manager.name = name;
  if (email) manager.email = email;
  if (phoneNumber) manager.phoneNumber = phoneNumber;
  if (company) manager.company = company;
  
  await manager.save();
  
  // Remove password from response
  manager.password = undefined;
  
  res.status(200).json({
    success: true,
    data: manager
  });
});

// @desc    Delete manager
// @route   DELETE /api/v1/manager/:id
// @access  Public
exports.deleteManager = asyncHandler(async (req, res, next) => {
  const manager = await Manager.findById(req.params.id);
  
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id of ${req.params.id}`, 404));
  }
  
  await manager.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});