const Employee = require("../../../models/employeeModel");
const Topics = require("../../../models/topicsModel");
const AssignTopics = require("../../../models/assignTopics");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");
const jwt = require("jsonwebtoken");

//create a employee
const createEmployee = asyncHandler(async (req, res, next) => {
  const { managerId, companyId } = req.params;
  const { name, email, password, phonenumber, mqttTopic , headerOne , headerTwo } = req.body;
  const employee = await Employee.create({
    name,
    email,
    password,
    phonenumber,
    headerOne , 
    headerTwo,
    company: companyId,
    manager: managerId,
  });
  res.status(201).json({
    success: true,
    data: employee,
  });
});

// Get all employees of a company or all employees
const getAllEmployeesOfSameCompany = asyncHandler(async (req, res, next) => {
  try {
    const { companyId } = req.params;
    console.log("Fetching employees - companyId:", companyId);
    
    let employees, employeeCount;
    
    if (companyId) {
      // Get employees for specific company
      employees = await Employee.find({ company: companyId })
        .populate("company")
        .populate("manager");
      employeeCount = await Employee.countDocuments({ company: companyId });
      console.log(`Found ${employeeCount} employees for company ${companyId}`);
    } else {
      // Get all employees
      employees = await Employee.find()
        .populate("company")
        .populate("manager");
      employeeCount = await Employee.countDocuments();
      console.log(`Found ${employeeCount} total employees`);
    }
    
    console.log("Employees:", employees);
    
    res.status(200).json({
      success: true,
      count: employeeCount,
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch employees",
      details: error.message
    });
  }
});

// Get employees by manager ID
const getEmployeesByManagerId = asyncHandler(async (req, res, next) => {
  try {
    const { managerId } = req.params;
    console.log("Fetching employees for manager:", managerId);
    
    const employees = await Employee.find({ manager: managerId })
      .populate("company")
      .populate("manager");
    const employeeCount = await Employee.countDocuments({ manager: managerId });
    
    console.log(`Found ${employeeCount} employees for manager ${managerId}`);
    console.log("Employees:", employees);
    
    res.status(200).json({
      success: true,
      count: employeeCount,
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch employees",
      details: error.message
    });
  }
});

//Login as employee
const loginAsEmployee = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  console.log("Login attempt for email:", email);
  
  const user = await Employee.findOne({ email })
    .select("+password")
    .populate("company")
    .populate("manager");
    
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

const addTagnamesToTheEmployee = async (req, res, next) => {
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
    // Get employee information first to get company and manager IDs
    const employee = await Employee.findById(id).populate("manager");
    if (!employee) {
      return res.status(404).json({ error: "Employee not found." });
    }
    
    console.log("Employee found:", employee);
    console.log("Employee company:", employee.company);
    console.log("Employee manager:", employee.manager);

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
      
      // Create assignment in assignTopics model
      const assignment = await AssignTopics.create({
        employee: id,
        topic: existingTopic._id,
        company: employee.company,
        manager: employee.manager._id
      });
      
      topicAssignments.push(assignment);
    }

    // Update employee with topics array
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { $addToSet: { topics: topics.map(t => t.topic) } },
      { new: true }
    );

    return res.status(200).json({
      message: "Topics and assignments created successfully.",
      Employee: {
        _id: updatedEmployee._id,
        name: updatedEmployee.name,
        topics: updatedEmployee.topics,
        company: updatedEmployee.company,
        manager: updatedEmployee.manager
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
  createEmployee,
  getAllEmployeesOfSameCompany,
  getEmployeesByManagerId,
  loginAsEmployee,
  addTagnamesToTheEmployee
};