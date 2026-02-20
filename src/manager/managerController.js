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

  if (!Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({ error: "Topics must be a non-empty array." });
  }

  try {
    // Get manager information first to get company ID
    const manager = await Manager.findById(id);
    if (!manager) {
      return res.status(404).json({ error: "Manager not found." });
    }

    // Create array of topic objects to save to Topics model
    const createdTopics = [];
    const topicAssignments = [];
    
    for (const topicData of topics) {
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
      }
      
      createdTopics.push(existingTopic);
      
      // Create assignment in assignTopics model
      const assignment = await AssignTopics.create({
        employee: id, // Using manager ID as employee for this case
        topic: existingTopic._id,
        company: manager.company,
        manager: id
      });
      
      topicAssignments.push(assignment);
    }

    // Update manager with topics array
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
    return res.status(400).json({ error: error.message });
  }
};

const assignDigitalMeterToManager = async (req, res) => {
  console.log("=== assignDigitalMeterToManager called ===");
  console.log("Request params:", req.params);
  console.log("Request body:", req.body);
  
  try {
    const { id } = req.params;
    console.log("Looking for manager with ID:", id);
    const updates = req.body;
    console.log("Request body:", updates);
    
    const manager = await Manager.findById(id);
    console.log("Manager found:", manager ? "Yes" : "No");
    console.log("Manager data:", manager);
    
    if (!manager) {
      console.log("Returning 404 - Manager not found");
      return res.status(404).json({ error: "Manager not found" });
    }

    const { assignedDigitalMeters } = updates;
    console.log("Assigned digital meters from request:", assignedDigitalMeters);
    
    if (assignedDigitalMeters && Array.isArray(assignedDigitalMeters)) {
      assignedDigitalMeters.forEach((newMeter) => {
        const existingMeterIndex = manager.assignedDigitalMeters.findIndex(
          (meter) => meter.topic === newMeter.topic
        );
        console.log("Processing meter:", newMeter.topic, "existing index:", existingMeterIndex);
        
        if (existingMeterIndex !== -1) {
          manager.assignedDigitalMeters[existingMeterIndex] = {
            ...manager.assignedDigitalMeters[existingMeterIndex],
            ...newMeter,
          };
          console.log("Updated existing meter at index:", existingMeterIndex);
        } else {
          manager.assignedDigitalMeters.push(newMeter);
          console.log("Added new meter:", newMeter.topic);
        }
      });
    }
    delete updates.assignedDigitalMeters;
    Object.assign(manager, updates);
    console.log("Saving manager with updates:", manager);
    await manager.save();
    console.log("Manager saved successfully");

    res.status(200).json(manager);
  } catch (error) {
    console.error("Error in assignDigitalMeterToManager:", error);
    res.status(400).json({ error: error.message });
  }
};

const assignDigitalMeterManager = (req, res, next) => {
  console.log("=== assignDigitalMeterManager called ===");
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
                employee: null, // No employee for manager assignment
                topic: createdTopic._id,
                company: null, // No company for manager assignment
                manager: null // No manager for manager assignment
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

    // Update all managers with the new digital meters
    Manager.updateMany(
      {},
      { $addToSet: { assignedDigitalMeters: { $each: assignedDigitalMeters } } }
    ).then(updatedManagers => {
      console.log("Updated managers count:", updatedManagers.modifiedCount);
      
      res.status(200).json({
        message: "Digital meters assigned to all managers successfully.",
        updatedCount: updatedManagers.modifiedCount
      });
    }).catch(error => {
      console.error("Error in assignDigitalMeterManager:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      return res.status(400).json({ error: error.message });
    });
  } catch (error) {
    console.error("Error in assignDigitalMeterManager:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createManager,
  getAllManager,
  getManagerByCompanyId,
  loginAsManager,
  addTagnamesToTheManager,
  assignDigitalMeterToManager,
  assignDigitalMeterManager
};
