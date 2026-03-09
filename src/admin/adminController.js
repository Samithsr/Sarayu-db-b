const asyncHandler = require("../../middlewares/asyncHandler");
const ErrorResponse = require("../../middlewares/errorResponse");
const User = require("../../src/models/user-model");
const Company = require("../../src/models/company-model");
const Employee = require("../../src/models/employee-model");
const Admin = require("../../src/models/admin-model");
const Manager = require("../../src/models/manager-model");
const mongoose = require("mongoose");
const logger = require("../../middlewares/logger");

const adminLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await Admin.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  const isMatch = await user.verifyPass(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  
  // Store admin data in session
  req.session.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: 'admin'
  };
  
  // Save session
  await req.session.save();
  
  // Log admin session creation
  logger.info("Admin session created", {
    sessionId: req.sessionID,
    user: req.session.user,
    timestamp: new Date().toISOString()
  });
  
  res.status(200).json({
    success: true,
    message: "Admin login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'admin'
    }
  });
});

const createCompany = asyncHandler(async (req, res, next) => {
  const { name, email, phonenumber, address , label} = req.body;
  const company = await Company.findOne({ name });
  if (company) {
    return next(new ErrorResponse("Company already exists!", 409));
  }

  const newCompany = new Company({ name, email, phonenumber, address });
  await newCompany.save();
  res.status(201).json({
    success: true,
    data: newCompany,
  });
});

//get single company
const getSingleCompany = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await Company.findById(companyId);
  if (!company) {
    return next(
      new ErrorResponse(`No company found with id ${companyId}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: company,
  });
});

//delete company
const deleteCompany = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const company = await Company.findById(id);
  if (!company) {
    return next(new ErrorResponse(`No company found with id ${id}`, 404));
  }
  await company.deleteOne();
  res.status(200).json({
    success: true,
    data: [],
  });
});

// Get all companies
const getAllCompanies = asyncHandler(async (req, res, next) => {
  const companies = await Company.find().sort({ createdAt: -1 });
  res.status(200).json(companies);
});

const createManager = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const { name, email, password, phonenumber, mqttTopic } = req.body;
  console.log(password);
  const findManager = await Manager.findOne({ email });
  if (findManager) {
    return next(new ErrorResponse("Email already exists!", 500));
  }
  const manager = await Manager.create({
    name,
    email,
    password,
    phonenumber,
    mqttTopic,
    company: companyId,
  });
  res.status(201).json({
    success: true,
    data: manager,
  });
});

const getAllManagerOfSameCompany = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;

  const managers = await Manager.find({ company: companyId })
    .populate("company")
    .populate("employees");

  res.status(200).json({
    success: true,
    count: managers.length,
    data: managers,
  });
});

//create a employee
const createEmployee = asyncHandler(async (req, res, next) => {
  const { companyId, managerId } = req.params;
  const { name, email, password, phonenumber, mqttTopic , companyName , street } = req.body;
  const employee = await Employee.create({
    name,
    email,
    password,
    phonenumber,
    mqttTopic,
    companyName , 
    street,
    company: companyId,
    manager: managerId,
  });
  res.status(201).json({
    success: true,
    data: employee,
  });
});

const createEmployeeWithoutManager = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const { name, email, password, phonenumber, mqttTopic, companyName, street } = req.body;
  const employee = await Employee.create({
    name,
    email,
    password,
    phonenumber,
    mqttTopic,
    companyName, 
    street,
    company: companyId,
  });
  res.status(201).json({
    success: true,
    data: employee,
  });
});

//change manager of a company
const changeManagerForEmployee = asyncHandler(async (req, res, next) => {
  const { empId, managerId } = req.params;
  const employee = await Employee.findByIdAndUpdate(
    empId,
    { manager: managerId },
    { new: true }
  );
  res.status(200).json({
    success: true,
    data: employee,
  });
});

const changeManagerForAllEmployee = asyncHandler(async (req, res, next) => {
  const { oldManagerId, newManagerId } = req.params;
  await Employee.updateMany(
    { manager: oldManagerId },
    { manager: newManagerId }
  );
  res.status(200).json({
    success: true,
    data: [],
  });
});

const swapManagerForAllEmployee = asyncHandler(async (req, res, next) => {
  const { firstManagerId, secondManagerId } = req.params;
  const temporaryManagerId = new mongoose.Types.ObjectId();
  await Employee.updateMany(
    { manager: firstManagerId },
    { manager: temporaryManagerId }
  );
  await Employee.updateMany(
    { manager: secondManagerId },
    { manager: firstManagerId }
  );
  await Employee.updateMany(
    { manager: temporaryManagerId },
    { manager: secondManagerId }
  );
  res.status(200).json({
    success: true,
    message: "Managers swapped successfully for all employees.",
  });
});

const getAllEmployeesOfSameCompany = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const employees = await Employee.find({ company: companyId })
    .populate("company")
    .populate("manager");

  res.status(200).json({ success: true, data: employees });
});

const removeManagerFromEmployee = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const employee = await Employee.findByIdAndUpdate(
    id,
    { $unset: { manager: "" } },
    { new: true }
  );
  if (!employee) {
    return next(new ErrorResponse(`No employee found with id ${id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: employee,
  });
});

const deleteAnyEmployeeCompany = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const manager = await Manager.findById(id);
  const employee = await Employee.findById(id);

  if (manager) {
    await Employee.updateMany(
      { manager: manager.id },
      { $unset: { manager: "" } }
    );
    await manager.deleteOne();
    return res.status(200).json({
      success: true,
      data: [],
    });
  }
  if (employee) {
    await employee.deleteOne();
    return res.status(200).json({
      success: true,
      data: [],
    });
  }
  return next(new ErrorResponse(`No user found with id ${id}`, 404));
});

const resetPasswordForManager = asyncHandler(async (req, res, next) => {
  const { email, activePassword, newPassword } = req.body;
  const manager = await Manager.findOne({ email }).select("+password");
  if (!manager) {
    return next(new ErrorResponse(`No user found with email ${email}`, 404));
  }
  const verifyPass = await manager.verifyPass(activePassword);
  if (!verifyPass) {
    return next(new ErrorResponse(`Active password did't matched`, 401));
  }
  manager.password = newPassword;
  await manager.save();
  res.status(200).json({
    success: true,
    data: "password changed successfully",
  });
});

const resetPasswordForEmployee = asyncHandler(async (req, res, next) => {
  const { email, newPassword, activePassword } = req.body;
  const employee = await Employee.findOne({ email }).select("+password");
  if (!employee) {
    return next(
      new ErrorResponse(`No employee found with email ${email}`, 404)
    );
  }
  const verifyPass = await employee.verifyPass(activePassword);
  if (!verifyPass) {
    return next(new ErrorResponse(`Active password did't matched`, 401));
  }
  employee.password = newPassword;
  await employee.save();
  res.status(200).json({
    success: true,
    data: "password changed successfully",
  });
});

module.exports = {
  adminLogin,
  createCompany,
  deleteCompany,
  deleteAnyEmployeeCompany,
  getSingleCompany,
  getAllCompanies,
  createManager,
  getAllManagerOfSameCompany,
  createEmployee,
  getAllEmployeesOfSameCompany,
  changeManagerForEmployee,
  changeManagerForAllEmployee,
  swapManagerForAllEmployee,
  createEmployeeWithoutManager,
  removeManagerFromEmployee,
  resetPasswordForManager,
  resetPasswordForEmployee,
};