const Manager = require("../../../models/managerModel");
const Company = require("../../../models/compaines");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");
const bcrypt = require("bcryptjs");

// @desc    Create a new manager
// @route   POST /api/v1/manager/create
// @access  Private (admin)
exports.createManager = asyncHandler(async (req, res, next) => {
  const { name, email, phoneNumber, password, confirmPassword, company } = req.body;
  
  // Validate required fields
  if (!name || !email || !phoneNumber || !password || !confirmPassword || !company) {
    return next(new ErrorResponse("All fields are required", 400));
  }
  
  // Check if passwords match
  if (password !== confirmPassword) {
    return next(new ErrorResponse("Passwords do not match", 400));
  }
  
  // Check if manager already exists
  const existingManager = await Manager.findOne({ email });
  if (existingManager) {
    return next(new ErrorResponse("Manager with this email already exists", 409));
  }
  
  // Check if company exists
  const companyExists = await Company.findById(company);
  if (!companyExists) {
    return next(new ErrorResponse("Company not found", 404));
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // Create manager
  const manager = await Manager.create({
    name,
    email,
    phoneNumber,
    password: hashedPassword,
    company,
    role: "manager"
  });
  
  // Remove password from response
  manager.password = undefined;
  
  res.status(201).json({
    success: true,
    data: manager
  });
});

// @desc    Get all managers
// @route   GET /api/v1/manager/all
// @access  Private (admin)
exports.getAllManagers = asyncHandler(async (req, res, next) => {
  const managers = await Manager.find().populate("company", "name email");
  
  res.status(200).json({
    success: true,
    count: managers.length,
    data: managers
  });
});

// @desc    Get single manager
// @route   GET /api/v1/manager/:id
// @access  Private (admin)
exports.getManagerById = asyncHandler(async (req, res, next) => {
  const manager = await Manager.findById(req.params.id).populate("company", "name email");
  
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: manager
  });
});

// @desc    Update manager
// @route   PUT /api/v1/manager/:id
// @access  Private (admin)
exports.updateManager = asyncHandler(async (req, res, next) => {
  const { name, email, phoneNumber, company } = req.body;
  
  const manager = await Manager.findById(req.params.id);
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id ${req.params.id}`, 404));
  }
  
  // If updating company, check if it exists
  if (company) {
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return next(new ErrorResponse("Company not found", 404));
    }
  }
  
  // Check if email is being updated and if it already exists
  if (email && email !== manager.email) {
    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return next(new ErrorResponse("Manager with this email already exists", 409));
    }
  }
  
  // Update manager
  const updatedManager = await Manager.findByIdAndUpdate(
    req.params.id,
    { name, email, phoneNumber, company },
    { new: true, runValidators: true }
  ).populate("company", "name email");
  
  res.status(200).json({
    success: true,
    data: updatedManager
  });
});

// @desc    Delete manager
// @route   DELETE /api/v1/manager/:id
// @access  Private (admin)
exports.deleteManager = asyncHandler(async (req, res, next) => {
  const manager = await Manager.findById(req.params.id);
  
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id ${req.params.id}`, 404));
  }
  
  await manager.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});