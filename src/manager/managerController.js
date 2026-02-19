const Manager = require("../../models/manager-Model");
const Company = require("../../models/company-model");
const Topics = require("../../models/topicsModel");
const AssignTopics = require("../../models/assignTopics");
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

const addTagnamesToTheManager = async (req, res, next) => {
  const { id } = req.params;
  const { topics } = req.body;

  console.log("Request body:", req.body);
  console.log("Topics received:", topics);

  if (!topics) {
    return res.status(400).json({ error: "Topics field is required." });
  }

  if (!Array.isArray(topics)) {
    return res.status(400).json({ error: "Topics must be an array." });
  }

  if (topics.length === 0) {
    return res.status(400).json({ error: "Topics array cannot be empty." });
  }

  try {
    // Get manager information first to get company ID
    const manager = await Manager.findById(id);
    if (!manager) {
      return res.status(404).json({ error: "Manager not found." });
    }
    
    console.log("Manager found:", manager);
    console.log("Manager company:", manager.company);

    // Create array of topic objects to save to Topics model
    const createdTopics = [];
    const topicAssignments = [];
    
    for (const topicData of topics) {
      console.log("Processing topic:", topicData);
      
      // Check if topicData has required fields
      if (!topicData.topic || !topicData.label || !topicData.device) {
        return res.status(400).json({ 
          error: "Each topic must have topic, label, and device fields." 
        });
      }
      
      // Create topic in Topics model if it doesn't exist
      let existingTopic = await Topics.findOne({ topic: topicData.topic });
      
      if (!existingTopic) {
        existingTopic = await Topics.create({
          topic: topicData.topic,
          label: topicData.label,
          device: topicData.device
        });
        console.log("Created new topic:", existingTopic);
      } else {
        console.log("Using existing topic:", existingTopic);
      }
      
      createdTopics.push(existingTopic);
      
      // Create assignment in assignTopics model with proper company ID
      const assignment = await AssignTopics.create({
        employee: id, // Using manager ID as employee for this case
        topic: existingTopic._id,
        company: manager.company, // Use manager's company ID
        manager: id
      });
      
      topicAssignments.push(assignment);
    }

    // Update manager with topics array (save directly to manager)
    const updatedManager = await Manager.findByIdAndUpdate(
      id,
      { $addToSet: { topics: topics.map(t => t.topic) } },
      { new: true }
    );

    return res.status(200).json({
      message: "Topics and assignments created successfully.",
      Manager: {
        _id: updatedManager._id,
        name: updatedManager.name,
        topics: updatedManager.topics,
        company: updatedManager.company
      },
      CreatedTopics: createdTopics,
      Assignments: topicAssignments.map(assignment => ({
        _id: assignment._id,
        topic: assignment.topic
      }))
    });
  } catch (error) {
    console.error("Error updating topics:", error);
    console.error("Validation error details:", error.message);
    return res
      .status(500)
      .json({ error: "An error occurred while updating topics.", details: error.message });
  }
};

module.exports = {
  createManager,
  getAllManager,
  getManagerByCompanyId,
  loginAsManager,
  addTagnamesToTheManager
};
