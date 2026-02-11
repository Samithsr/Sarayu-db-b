const Employee = require("../../../models/employeeModel");
const Company = require("../../../models/company-model");
const Manager = require("../../../models/managerModel");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");
const bcrypt = require("bcryptjs");

// @desc    Create a new employee
// @route   POST /api/v1/employee/create
// @access  Public
exports.createEmployee = asyncHandler(async (req, res, next) => {
  const { 
    name, 
    email, 
    phoneNumber, 
    headerOne, 
    headerTwo, 
    password, 
    confirmPassword
  } = req.body;
  
  // Validate password confirmation
  if (password !== confirmPassword) {
    return next(new ErrorResponse("Password and confirm password do not match", 400));
  }
  
  // Check if employee already exists
  const existingEmployee = await Employee.findOne({ email });
  
  if (existingEmployee) {
    return next(new ErrorResponse("Employee with this email already exists", 409));
  }
  
  // Find or create default company
  let defaultCompany = await Company.findOne({ name: "Default Company" });
  if (!defaultCompany) {
    defaultCompany = new Company({
      name: "Default Company",
      email: "default@company.com",
      phonenumber: "0000000000",
      address: "Default Address",
      label: "Default Company"
    });
    await defaultCompany.save();
  }
  
  // Find or create default manager
  let defaultManager = await Manager.findOne({ name: "Default Manager" });
  if (!defaultManager) {
    defaultManager = new Manager({
      name: "Default Manager",
      email: "default@manager.com",
      phoneNumber: "0000000000",
      password: "defaultpassword123",
      company: defaultCompany._id
    });
    await defaultManager.save();
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // Create new employee with auto-assigned manager and company
  const newEmployee = new Employee({
    name,
    email,
    selectManager: defaultManager._id,
    phoneNumber,
    headerOne,
    headerTwo,
    password: hashedPassword,
    company: defaultCompany._id,
    role: "employee"
  });
  
  await newEmployee.save();
  
  // Populate company and manager details in response
  await newEmployee.populate("company", "name email");
  await newEmployee.populate("selectManager", "name email");
  
  // Remove password from response
  newEmployee.password = undefined;
  
  res.status(201).json({
    success: true,
    data: newEmployee,
  });
});

// @desc    Get all employees
// @route   GET /api/v1/employee/all
// @access  Public
exports.getAllEmployees = asyncHandler(async (req, res, next) => {
  const employees = await Employee.find()
    .populate("company", "name email")
    .populate("selectManager", "name email")
    .select("-password");
  
  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees
  });
});

// @desc    Get single employee
// @route   GET /api/v1/employee/:id
// @access  Public
exports.getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id)
    .populate("company", "name email")
    .populate("selectManager", "name email")
    .select("-password");
  
  if (!employee) {
    return next(new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: employee
  });
});

// @desc    Update employee
// @route   PUT /api/v1/employee/:id
// @access  Public
exports.updateEmployee = asyncHandler(async (req, res, next) => {
  const { 
    name, 
    email, 
    selectManager, 
    phoneNumber, 
    headerOne, 
    headerTwo, 
    company 
  } = req.body;
  
  let employee = await Employee.findById(req.params.id);
  
  if (!employee) {
    return next(new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404));
  }
  
  // If updating email, check if it's already taken
  if (email && email !== employee.email) {
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return next(new ErrorResponse("Email already exists", 409));
    }
  }
  
  // If updating company, check if it exists
  if (company && company !== employee.company) {
    const existingCompany = await Company.findById(company);
    if (!existingCompany) {
      return next(new ErrorResponse("Company not found", 404));
    }
  }
  
  // If updating manager, check if it exists
  if (selectManager && selectManager !== employee.selectManager) {
    const existingManager = await Manager.findById(selectManager);
    if (!existingManager) {
      return next(new ErrorResponse("Manager not found", 404));
    }
  }
  
  // Update employee fields
  if (name) employee.name = name;
  if (email) employee.email = email;
  if (selectManager) employee.selectManager = selectManager;
  if (phoneNumber) employee.phoneNumber = phoneNumber;
  if (headerOne) employee.headerOne = headerOne;
  if (headerTwo) employee.headerTwo = headerTwo;
  if (company) employee.company = company;
  
  await employee.save();
  
  // Remove password from response
  employee.password = undefined;
  
  res.status(200).json({
    success: true,
    data: employee
  });
});

// @desc    Delete employee
// @route   DELETE /api/v1/employee/:id
// @access  Public
exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);
  
  if (!employee) {
    return next(new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404));
  }
  
  await employee.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});