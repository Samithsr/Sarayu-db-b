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

  console.log("=== addTagnamesToTheEmployee called ===");
  console.log("Employee ID:", id);
  console.log("Topics received:", topics);

  if (!Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({ error: "Topics must be a non-empty array." });
  }

  try {
    // Get employee information first to get company and manager IDs
    console.log("Looking for employee with ID:", id);
    const employee = await Employee.findById(id).populate("manager");
    console.log("Employee found:", employee ? "Yes" : "No");
    
    if (!employee) {
      console.log("Employee not found, returning 404");
      return res.status(404).json({ error: "Employee not found." });
    }

    console.log("Employee details:", {
      _id: employee._id,
      name: employee.name,
      company: employee.company,
      manager: employee.manager
    });

    // Create assignments in assignTopics model for each topic
    const topicAssignments = [];
    
    for (const topic of topics) {
      console.log("Processing topic:", topic);
      
      // Find or create topic in Topics model
      let existingTopic = await Topics.findOne({ topic: topic });
      console.log("Existing topic found:", existingTopic ? "Yes" : "No");
      
      if (!existingTopic) {
        console.log("Creating new topic:", topic);
        existingTopic = await Topics.create({
          topic: topic,
          label: topic, // Use topic as label for simplicity
          device: "default" // Use default device
        });
        console.log("New topic created:", existingTopic._id);
      }
      
      // Create assignment in assignTopics model
      console.log("Creating assignment for topic:", existingTopic._id);
      const assignment = await AssignTopics.create({
        employee: id,
        topic: existingTopic._id,
        company: employee.company,
        manager: employee.manager._id
      });
      
      console.log("Assignment created:", assignment._id);
      topicAssignments.push(assignment);
    }

    console.log("Updating employee with topics:", topics);
    // Update employee with topics array
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { $addToSet: { topics: { $each: topics } } },
      { new: true }
    );

    console.log("Employee updated successfully");
    console.log("Updated employee topics:", updatedEmployee.topics);

    return res.status(200).json({
      message: "Topics and assignments created successfully.",
      employee: updatedEmployee,
      assignments: topicAssignments.map(assignment => ({
        _id: assignment._id,
        topic: assignment.topic
      }))
    });
  } catch (error) {
    console.error("Error updating topics:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(400).json({ error: error.message });
  }
};

const assignDigitalMeterToEmployee = async (req, res) => {
  try {
    console.log("=== assignDigitalMeterToEmployee called ===");
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);
    console.log("Request URL:", req.originalUrl);
    console.log("Request method:", req.method);
    console.log("Request headers:", req.headers);
    
    const { id } = req.params;
    console.log("Extracted ID:", id);
    console.log("ID type:", typeof id);
    console.log("ID is null:", id === null);
    console.log("ID is undefined:", id === undefined);
    
    if (!id) {
      console.log("ERROR: Employee ID is missing or null");
      return res.status(400).json({ error: "Employee ID is required" });
    }
    
    if (typeof id !== 'string') {
      console.log("ERROR: Employee ID is not a string");
      return res.status(400).json({ error: "Employee ID must be a string" });
    }
    
    const updates = req.body;
    console.log("Updates:", updates);
    console.log("Updates type:", typeof updates);
    console.log("Updates is null:", updates === null);
    console.log("Updates is undefined:", updates === undefined);
    
    if (!updates || typeof updates !== 'object') {
      console.log("ERROR: Request body is missing or not an object");
      return res.status(400).json({ error: "Request body must contain assignedDigitalMeters array" });
    }
    
    console.log("Finding employee with ID:", id);
    const employee = await Employee.findById(id);
    console.log("Employee found:", employee ? "Yes" : "No");
    console.log("Employee object:", employee);
    
    if (!employee) {
      console.log("ERROR: Employee not found in database");
      return res.status(404).json({ error: "Employee not found" });
    }

    const { assignedDigitalMeters } = updates;
    console.log("Assigned digital meters from request:", assignedDigitalMeters);
    console.log("Assigned digital meters type:", typeof assignedDigitalMeters);
    console.log("Is array:", Array.isArray(assignedDigitalMeters));
    console.log("Array length:", assignedDigitalMeters ? assignedDigitalMeters.length : 0);
    
    if (!assignedDigitalMeters) {
      console.log("WARNING: No assignedDigitalMeters provided");
      return res.status(400).json({ error: "assignedDigitalMeters array is required" });
    }
    
    if (!Array.isArray(assignedDigitalMeters)) {
      console.log("ERROR: assignedDigitalMeters is not an array");
      return res.status(400).json({ error: "assignedDigitalMeters must be an array" });
    }
    
    if (assignedDigitalMeters && Array.isArray(assignedDigitalMeters)) {
      console.log("Processing", assignedDigitalMeters.length, "digital meters");
      assignedDigitalMeters.forEach((newMeter, index) => {
        console.log(`Processing meter ${index}:`, newMeter);
        console.log("Current employee assignedDigitalMeters:", employee.assignedDigitalMeters);
        console.log("Employee assignedDigitalMeters type:", typeof employee.assignedDigitalMeters);
        
        if (!employee.assignedDigitalMeters || !Array.isArray(employee.assignedDigitalMeters)) {
          console.log("WARNING: employee.assignedDigitalMeters is not an array, initializing");
          employee.assignedDigitalMeters = [];
        }
        
        const existingMeterIndex = employee.assignedDigitalMeters.findIndex(
          (meter) => meter && meter.topic === newMeter.topic
        );
        console.log("Existing meter index:", existingMeterIndex);
        
        if (existingMeterIndex !== -1) {
          employee.assignedDigitalMeters[existingMeterIndex] = {
            ...employee.assignedDigitalMeters[existingMeterIndex],
            ...newMeter,
          };
          console.log("Updated existing meter at index:", existingMeterIndex);
        } else {
          employee.assignedDigitalMeters.push(newMeter);
          console.log("Added new meter:", newMeter.topic);
        }
      });
    }
    
    delete updates.assignedDigitalMeters;
    Object.assign(employee, updates);
    console.log("Employee before save:", employee);
    
    console.log("Saving employee...");
    await employee.save();
    console.log("Employee saved successfully");

    res.status(200).json(employee);
  } catch (error) {
    console.error("ERROR in assignDigitalMeterToEmployee:", error);
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Error stack:", error.stack);
    res.status(400).json({ 
      error: error.message,
      details: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
};

const getAllUserTopics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const employee = await Employee.findById(id, { _id: 0, topics: 1 });

    if (!employee || !employee.topics) {
      return res.status(404).json({
        success: false,
        message: "No topics found for this user",
      });
    }

    const allTopics = employee.topics;
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const assignDigitalMeterEmployee = (req, res, next) => {
  console.log("=== assignDigitalMeterEmployee called ===");
  console.log("Request body:", req.body);
  
  try {
    const { assignedDigitalMeters } = req.body;
    console.log("Assigned digital meters from request:", assignedDigitalMeters);
    
    if (assignedDigitalMeters && Array.isArray(assignedDigitalMeters)) {
      assignedDigitalMeters.forEach((newMeter) => {
        console.log("Processing meter:", newMeter.topic);
        
        // Find or create topic in Topics model
        Topics.findOne({ topic: newMeter.topic }).then(existingTopic => {
          console.log("Existing topic found:", existingTopic ? "Yes" : "No");
          
          if (!existingTopic) {
            console.log("Creating new topic:", newMeter.topic);
            Topics.create({
              topic: newMeter.topic,
              label: newMeter.topic, // Use topic as label for simplicity
              device: newMeter.meterType || "default" // Use meterType as device
            }).then(createdTopic => {
              console.log("New topic created:", createdTopic._id);
              
              // Create assignment in assignTopics model
              AssignTopics.create({
                employee: null, // No employee for bulk assignment
                topic: createdTopic._id,
                company: null, // No company for bulk assignment
                manager: null // No manager for bulk assignment
              }).then(assignment => {
                console.log("Assignment created:", assignment._id);
              });
            });
          } else {
            // Create assignment for existing topic
            AssignTopics.create({
              employee: null,
              topic: existingTopic._id,
              company: null,
              manager: null
            }).then(assignment => {
              console.log("Assignment created:", assignment._id);
            });
          }
        });
      });
    }

    // Update all employees with the new digital meters
    Employee.updateMany(
      {},
      { $addToSet: { assignedDigitalMeters: { $each: assignedDigitalMeters } } }
    ).then(updatedEmployees => {
      console.log("Updated employees count:", updatedEmployees.modifiedCount);
      
      res.status(200).json({
        message: "Digital meters assigned to all employees successfully.",
        updatedCount: updatedEmployees.modifiedCount
      });
    }).catch(error => {
      console.error("Error in assignDigitalMeterEmployee:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      return res.status(400).json({ error: error.message });
    });
  } catch (error) {
    console.error("Error in assignDigitalMeterEmployee:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createEmployee,
  getAllEmployeesOfSameCompany,
  getEmployeesByManagerId,
  loginAsEmployee,
  addTagnamesToTheEmployee,
  assignDigitalMeterToEmployee,
  getAllUserTopics,
  assignDigitalMeterEmployee
};