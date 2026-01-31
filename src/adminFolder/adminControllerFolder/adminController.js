const User = require("../../../models/userModel");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");
const Company = require("../../../models/company-model");
const Manager = require("../../../models/managerModel.js");
const Employee = require("../../../models/employeeModel.js");
const Admin = require("../../../models/adminModel.js");
const Topics = require("../../../models/topicsModel.js");
const GraphWhitelist = require("../../../models/graphWhitelistModel.js");
const ConfigDevice = require("../../../models/config-device.js");
const bcrypt = require("bcryptjs");

// @desc    Admin login
// @route   POST /api/v1/auth/admin/login
// @access  Public
exports.adminLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  const user = await Admin.findOne({ email }).select("+password");
  
  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  
  const isMatch = await user.verifyPass(password);
  
  if (!isMatch) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  
  const token = await user.getToken();
  
  res.status(200).json({
    success: true,
    data: user,
    token,
  });
});

// @desc    Create a new company
// @route   POST /api/v1/auth/companies
// @access  Private (admin)
exports.createCompany = asyncHandler(async (req, res, next) => {
  const { name, email, phonenumber, address, label } = req.body;
  
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

// @desc    Get all companies
// @route   GET /api/v1/auth/companies
// @access  Private (admin)
exports.getAllCompanies = asyncHandler(async (req, res, next) => {
  const companies = await Company.find().sort({ createdAt: -1 });
  
  res.status(200).json(companies);
});

// @desc    Get single company
// @route   GET /api/v1/auth/company/:companyId
// @access  Private (admin)
exports.getSingleCompany = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  
  const company = await Company.findById(companyId);
  
  if (!company) {
    return next(new ErrorResponse(`No company found with id ${companyId}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: company,
  });
});

// @desc    Delete company
// @route   DELETE /api/v1/auth/companies/:id
// @access  Private (admin)
exports.deleteCompany = asyncHandler(async (req, res, next) => {
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

// @desc    Delete any user (manager/employee)
// @route   DELETE /api/v1/auth/deleteAnyEmployee/:id
// @access  Private (admin)
exports.deleteAnyEmployeeCompany = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const manager = await Manager.findById(id);
  const employee = await Employee.findById(id);
  
  if (manager) {
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

// @desc    Get all managers of a company
// @route   GET /api/v1/auth/getallmanager/:companyId
// @access  Private (admin)
exports.getAllManager = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  
  const managers = await Manager.find({ company: companyId }).populate("company");
  
  res.status(200).json({
    success: true,
    data: managers,
  });
});

// @desc    Delete manager
// @route   DELETE /api/v1/auth/manager/:id
// @access  Private (admin)
exports.deleteManager = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const manager = await Manager.findById(id);
  
  if (!manager) {
    return next(new ErrorResponse(`No manager found with id ${id}`, 404));
  }
  
  await manager.deleteOne();
  
  res.status(200).json({
    success: true,
    data: [],
  });
});

// @desc    Get all employees of a company
// @route   GET /api/v1/auth/employee/getAllEmployeesOfSameCompany/:companyId
// @access  Private (admin)
exports.getAllEmployeesOfSameCompany = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  
  const employees = await Employee.find({ company: companyId })
    .populate("company");
  
  res.status(200).json({ success: true, data: employees });
});

// @desc    Get all device configurations
// @route   GET /api/v1/auth/deviceconfig
// @access  Private (admin)
exports.getAllDeviceConfig = asyncHandler(async (req, res, next) => {
  const device = await ConfigDevice.find({});
  
  res.status(200).json({ success: true, data: device });
});

// @desc    Get user topics with pagination
// @route   GET /api/v1/auth/getusertopics/:id
// @access  Private (admin)
exports.getAllUserTopics = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const skip = (page - 1) * limit;
  
  const topics = await Topics.findOne({ employee: id.toString() });
  
  if (!topics) {
    return res.status(404).json({
      success: false,
      message: "No topics found for this user",
    });
  }
  
  const allTopics = topics.rows || [];
  const totalTopics = allTopics.length;
  const paginatedTopics = allTopics.slice(skip, skip + limit);
  
  res.status(200).json({
    success: true,
    data: {
      topics: paginatedTopics,
      totalTopics: totalTopics,
      currentPage: page,
      totalPages: Math.ceil(totalTopics / limit),
    },
  });
});

// @desc    Get all users (manager and supervisor only)
// @route   GET /api/admin/users
// @access  Private (manager, supervisor)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (manager, supervisor)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (manager only)
// @route   PUT /api/admin/users/:id
// @access  Private (manager only)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    let user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (manager only)
// @route   DELETE /api/admin/users/:id
// @access  Private (manager only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Prevent self-deletion
    if (user._id.toString() === req.session.user.id) {
      return next(new ErrorResponse("Cannot delete your own account", 400));
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};