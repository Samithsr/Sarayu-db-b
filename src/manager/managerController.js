const Manager = require("../../models/manager-Model");
const Company = require("../../models/company-model");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const jwt = require("jsonwebtoken");

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

// Get all managers of a company or all managers
const getAllManager = asyncHandler(async (req, res, next) => {
  try {
    const { companyId } = req.params;
    console.log("Fetching managers - companyId:", companyId);
    
    let managers, managerCount;
    
    if (companyId) {
      // Get managers for specific company
      managers = await Manager.find({ company: companyId }).populate("company");
      managerCount = await Manager.countDocuments({ company: companyId });
      console.log(`Found ${managerCount} managers for company ${companyId}`);
    } else {
      // Get all managers
      managers = await Manager.find().populate("company");
      managerCount = await Manager.countDocuments();
      console.log(`Found ${managerCount} total managers`);
    }
    
    console.log("Managers:", managers);
    
    res.status(200).json({
      success: true,
      count: managerCount,
      data: managers,
    });
  } catch (error) {
    console.error("Error fetching managers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch managers",
      details: error.message
    });
  }
});

// Get managers by company ID
const getManagerByCompanyId = asyncHandler(async (req, res, next) => {
  try {
    const { companyId } = req.params;
    console.log("Fetching managers for company:", companyId);
    
    const managers = await Manager.find({ company: companyId }).populate("company");
    const managerCount = await Manager.countDocuments({ company: companyId });
    
    console.log(`Found ${managerCount} managers for company ${companyId}`);
    console.log("Managers:", managers);
    
    res.status(200).json({
      success: true,
      count: managerCount,
      data: managers,
    });
  } catch (error) {
    console.error("Error fetching managers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch managers",
      details: error.message
    });
  }
});

// Manager login
const loginAsManager = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  console.log("Login attempt for email:", email);
  
  const user = await Manager.findOne({ email })
    .select("+password")
    .populate("company");
    
  console.log("User found:", user ? "Yes" : "No");
  
  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  
  const isMatch = await user.verifyPass(password);
  console.log("Password match:", isMatch ? "Yes" : "No");
  
  if (!isMatch) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  
  // Set defaults if environment variables are missing
  const jwtSecret = process.env.JWT_SECRET || 'x-auth-token';
  const jwtExpire = process.env.JWT_EXPIRE || '30d';
  
  console.log("JWT Secret:", jwtSecret ? "Set" : "Missing");
  
  const token = jwt.sign({ id: user._id }, jwtSecret, {
    expiresIn: jwtExpire,
  });
  
  console.log("Login successful for:", email);
  
  res.status(200).json({
    success: true,
    user,
    token,
  });
});

module.exports = {
  createManager,
  getAllManager,
  getManagerByCompanyId,
  loginAsManager
};
