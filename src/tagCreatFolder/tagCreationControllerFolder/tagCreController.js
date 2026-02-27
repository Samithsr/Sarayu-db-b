const Topics = require("../../../models/topicsModel");
const Employee = require("../../../models/employeeModel");
const Manager = require("../../../models/manager-Model");
const SubscribedTopic = require("../../../models/subscribedTopic-model");
const Layout = require("../../../models/layout-model");
const AssignTopics = require("../../../models/assignTopics");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");
const redisClient = require("../../../config/redis");

// Redis cache utilities
const CACHE_PREFIX = "sarayu:";
const TTL_LONG = 3600; // 1 hour

const safeRedisGet = async (key) => {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

const safeRedisSet = async (key, value, ttl) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

// @desc    Create a new tag
// @route   POST /api/v1/tagCreation
// @access  Public
exports.createTag = asyncHandler(async (req, res, next) => {
  const { device, topic, label } = req.body;
  
  // Only check if topic already exists (allow device duplicates)
  const existingTopic = await Topics.findOne({ topic, label });
  if (existingTopic) {
    return next(new ErrorResponse("Topic already exists!", 409));
  }
  
  // Save topic directly to Topics model with device field
  const newTopic = new Topics({ topic, label, device });
  await newTopic.save();
  
  res.status(201).json({
    success: true,
    data: newTopic,
  });
});

// @desc    Get all topics with devices
// @route   GET /api/v1/tagCreation/getAllTopics
// @access  Public
exports.getAllTopics = asyncHandler(async (req, res, next) => {
  const topics = await Topics.find().sort({ createdAt: -1 });
  
  console.log('Topics found:', topics.length);
  
  res.status(200).json({
    success: true,
    count: topics.length,
    data: topics
  });
});

// @desc    Delete tag
// @route   DELETE /api/v1/tagCreation/:id
// @access  Public
exports.deleteTag = asyncHandler(async (req, res, next) => {
  const tag = await Topics.findById(req.params.id);
  
  if (!tag) {
    return next(new ErrorResponse(`Tag not found with id of ${req.params.id}`, 404));
  }
  
  await tag.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Delete multiple topics
// @route   POST /api/v1/tagCreation/deleteTopics
// @access  Public
exports.deleteTopics = asyncHandler(async (req, res, next) => {
  const { topic } = req.body;
  
  if (!topic || typeof topic !== 'string') {
    return next(new ErrorResponse("Please provide a topic name", 400));
  }
  
  // Find and delete topic by topic name
  const deletedTopic = await Topics.findOneAndDelete({ topic });
  
  if (!deletedTopic) {
    return next(new ErrorResponse('Topic not found', 404));
  }
  
  // Also delete from SubscribedTopic model if exists
  await SubscribedTopic.deleteOne({ topic });
  
  res.status(200).json({
    success: true,
    message: `Deleted topic "${topic}" successfully`,
    data: {
      deletedTopic: deletedTopic
    }
  });
});

// @desc    Assign topics to employee
// @route   POST /api/v1/tagCreation/assignTopicsEmployee
// @access  Public
exports.assignTopicsEmployee = asyncHandler(async (req, res, next) => {
  const { employeeId, topicId, topicIds } = req.body;
  
  // Handle both topicId and topicIds for flexibility
  let finalTopicIds = [];
  
  if (topicId) {
    // Single topic ID
    finalTopicIds = [topicId];
  } else if (topicIds) {
    // Array of topic IDs
    if (Array.isArray(topicIds)) {
      finalTopicIds = topicIds;
    } else {
      return next(new ErrorResponse("topicIds must be an array", 400));
    }
  }
  
  if (!finalTopicIds || finalTopicIds.length === 0) {
    return next(new ErrorResponse("Topic ID(s) are required", 400));
  }
  
  // Check if employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return next(new ErrorResponse(`Employee not found with id of ${employeeId}`, 404));
  }
  
  // Validate all topics exist
  const topics = await Topics.find({ '_id': { $in: finalTopicIds } });
  if (topics.length === 0) {
    return next(new ErrorResponse('No valid topics found', 404));
  }
  
  if (topics.length !== finalTopicIds.length) {
    return next(new ErrorResponse('One or more topics not found', 404));
  }
  
  const assignments = [];
  const errors = [];
  
  // Process each topic
  for (const topicId of finalTopicIds) {
    try {
      // Check if topic is already assigned to another employee under the same manager
      const existingAssignment = await AssignTopics.findOne({ 
        topic: topicId,
        manager: employee.manager
      });
      
      if (existingAssignment) {
        const topic = topics.find(t => t._id.toString() === topicId.toString());
        errors.push(`Topic "${topic.topic}" is already assigned to another employee under the same manager`);
        continue;
      }
      
      // Check if this employee already has this specific topic assigned
      const existingEmployeeAssignment = await AssignTopics.findOne({ 
        employee: employeeId, 
        topic: topicId 
      });
      
      if (existingEmployeeAssignment) {
        const topic = topics.find(t => t._id.toString() === topicId.toString());
        errors.push(`Topic "${topic.topic}" is already assigned to this employee`);
        continue;
      }
      
      // Create new assignment
      const assignment = await AssignTopics.create({
        employee: employeeId,
        topic: topicId,
        company: employee.company,
        manager: employee.manager
      });
      
      assignments.push(assignment);
      
    } catch (error) {
      errors.push(`Error assigning topic ${topicId}: ${error.message}`);
    }
  }
  
  // Update employee's topics array
  if (assignments.length > 0) {
    await Employee.findByIdAndUpdate(
      employeeId,
      { $addToSet: { topics: { $each: finalTopicIds } } },
      { new: true }
    );
  }
  
  res.status(200).json({
    success: true,
    message: `${assignments.length} topic(s) assigned to employee successfully`,
    data: {
      assignments: assignments,
      assignedTopics: assignments.map(a => a.topic),
      errors: errors
    },
    count: assignments.length
  });
});

// @desc    Subscribe to topics
// @route   POST /api/v1/tagCreation/subscribeTopic
// @access  Public
exports.subscribeTopic = asyncHandler(async (req, res) => {
  const { topic } = req.body;
  console.log("subscribeTopic request:", topic);
  
  // Find the topic in Topics model to get device info
  const topicDoc = await Topics.findOne({ topic });
  if (!topicDoc) {
    return res.status(404).json({ success: false, message: "Topic not found" });
  }
  
  const foundTopic = await SubscribedTopic.findOne({ topic });
  if (!foundTopic) {
    // Create new subscription with device info
    await SubscribedTopic.create({ topic, device: topicDoc.device });
    return res.status(201).json({ success: true, data: [] });
  } else {
    await foundTopic.deleteOne();
    return res.status(200).json({ success: true, data: [] });
  }
});

// @desc    Get all subscribed topics
// @route   GET /api/v1/tagCreation/subscribeAllTopics
// @access  Public
exports.subscribeAllTopics = asyncHandler(async (req, res, next) => {
  const subscribedTopics = await SubscribedTopic.find({}, { _id: 0, topic: 1 });
  res.status(200).json({ success: true, data: subscribedTopics });
});

// @desc    Unsubscribe from a topic
// @route   POST /api/v1/tagCreation/unsubscribeTopic
// @access  Public
exports.unsubscribeTopic = asyncHandler(async (req, res, next) => {
  const { topic } = req.body;
  console.log("unsubscribeTopic request:", topic);
  
  const foundTopic = await SubscribedTopic.findOne({ topic });
  if (!foundTopic) {
    return res.status(404).json({ success: false, message: "Topic not subscribed" });
  }
  
  await foundTopic.deleteOne();
  return res.status(200).json({ 
    success: true, 
    message: "Unsubscribed successfully",
    data: { topic }
  });
});

// @desc    Unsubscribe from all topics
// @route   POST /api/v1/tagCreation/unsubscribeAllTopics
// @access  Public
exports.unsubscribeAllTopics = asyncHandler(async (req, res, next) => {
  const result = await SubscribedTopic.deleteMany({});
  
  res.status(200).json({
    success: true,
    message: `Unsubscribed from ${result.deletedCount} topics`,
    data: {
      deletedCount: result.deletedCount
    }
  });
});

// @desc    Get all devices from Topics model
// @route   GET /api/v1/getAllDevices
// @access  Public
exports.getAllDevices = asyncHandler(async (req, res, next) => {
  // Get all topics and extract unique devices
  const topics = await Topics.find().sort({ createdAt: -1 });
  const devices = [...new Set(topics.map(topic => topic.device).filter(Boolean))];
  
  console.log('Devices found:', devices.length);
  
  res.status(200).json({
    success: true,
    count: devices.length,
    data: devices.map(device => ({ device }))
  });
});

// @desc    Subscribe to all existing topics
// @route   POST /api/v1/tagCreation/subScribeAllTopics
// @access  Public
exports.subScribeAllTopics = asyncHandler(async (req, res, next) => {
  // Get all existing topics from Topics model
  const allTopics = await Topics.find({}, { topic: 1 });
  
  if (allTopics.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No topics found to subscribe",
      data: []
    });
  }
  
  // Subscribe to all topics
  const subscribedTopics = [];
  for (const topicDoc of allTopics) {
    const topic = topicDoc.topic;
    
    // Check if already subscribed
    const existingSubscription = await SubscribedTopic.findOne({ topic });
    if (!existingSubscription) {
      // Create new subscription
      await SubscribedTopic.create({ topic });
      subscribedTopics.push(topic);
    }
  }
  
  res.status(201).json({
    success: true,
    message: `Subscribed to ${subscribedTopics.length} topics`,
    data: subscribedTopics
  });
});

// @desc    Assign layout to manager
// @route   POST /api/v1/tagCreation/assignlayoutToManager/:id
// @access  Public
exports.assignlayoutToManager = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { layout } = req.body;
  
  // Check if manager exists
  const manager = await Manager.findById(id);
  if (!manager) {
    return next(new ErrorResponse(`Manager not found with id of ${id}`, 404));
  }
  
  // Update manager with layout (existing logic)
  await Manager.findByIdAndUpdate(id, { layout });
  
  // Save to Layout model (new logic)
  try {
    await Layout.findOneAndUpdate(
      { 
        manager: id,
        employee: null
      },
      {
        name: layout.name || `Manager Layout ${id}`,
        description: layout.description || `Layout for manager ${manager.name}`,
        layoutType: layout.layoutType || "layout1",
        components: layout.components || [],
        company: manager.company,
        manager: id,
        employee: null
      },
      { upsert: true, new: true }
    );
    console.log("Layout saved to Layout model for manager:", id);
  } catch (error) {
    console.error("Error saving layout to Layout model:", error);
  }
  
  res.status(200).json({ success: true, data: [] });
});

// @desc    Assign layout to employee
// @route   POST /api/v1/tagCreation/assignlayoutToEmployee/:id
// @access  Public
exports.assignlayoutToEmployee = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { layout } = req.body;
  
  // Check if employee exists
  const employee = await Employee.findById(id);
  if (!employee) {
    return next(new ErrorResponse(`Employee not found with id of ${id}`, 404));
  }
  
  // Update employee with layout (existing logic)
  await Employee.findByIdAndUpdate(id, { layout });
  
  // Save to Layout model (new logic)
  try {
    await Layout.findOneAndUpdate(
      { 
        employee: id,
        manager: null
      },
      {
        name: layout.name || `Employee Layout ${id}`,
        description: layout.description || `Layout for employee ${employee.name}`,
        layoutType: layout.layoutType || "layout1",
        components: layout.components || [],
        company: employee.company,
        manager: null,
        employee: id
      },
      { upsert: true, new: true }
    );
    console.log("Layout saved to Layout model for employee:", id);
  } catch (error) {
    console.error("Error saving layout to Layout model:", error);
  }
  
  res.status(200).json({ success: true, data: [] });
});

// @desc    Get recent 5 tag names without messages
// @route   GET /api/v1/tagCreation/get-recent-5-tagname
// @access  Public
exports.getRecent5Tagname = asyncHandler(async (req, res, next) => {
  try {
    const cacheKey = `${CACHE_PREFIX}recent-5-tagname`;
    const cachedData = await safeRedisGet(cacheKey);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Get topics that have messages (if MessagesModel exists)
    let topicsWithMessages = [];
    try {
      topicsWithMessages = await MessagesModel.distinct("topic").lean();
    } catch (error) {
      console.log('MessagesModel not found, proceeding without message filtering');
    }

    // Get topics without messages, sorted by creation date, limited to 5
    const topics = await Topics.find({ topic: { $nin: topicsWithMessages } })
      .select("topic -_id")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const response = { success: true, data: topics };
    await safeRedisSet(cacheKey, response, TTL_LONG);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getRecent5Tagname:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @desc    Get all assigned topics
// @route   GET /api/v1/tagCreation/getAllAssignedTopic
// @access  Public
exports.getAllAssignedTopic = asyncHandler(async (req, res, next) => {
  try {
    // Get all assigned topics with populated data
    const assignedTopics = await AssignTopics.find()
      .populate('employee', 'name email')
      .populate('topic', 'topic label device')
      .populate('company', 'name')
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });

    console.log('Found assigned topics:', assignedTopics.length);

    res.status(200).json({
      success: true,
      count: assignedTopics.length,
      data: assignedTopics
    });
  } catch (error) {
    console.error('Error in getAllAssignedTopic:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned topics",
      error: error.message
    });
  }
});

// @desc    Disable assigned topic (soft delete)
// @route   POST /api/v1/disableAssignedTopic
// @access  Public
exports.disableAssignedTopic = asyncHandler(async (req, res, next) => {
  const { assignmentId } = req.body;
  
  if (!assignmentId) {
    return next(new ErrorResponse("Assignment ID is required", 400));
  }
  
  try {
    // Find the assignment and disable it (soft delete)
    const assignment = await AssignTopics.findByIdAndUpdate(
      assignmentId,
      { 
        status: 'disabled',
        disabledAt: new Date()
      },
      { new: true }
    );
    
    if (!assignment) {
      return next(new ErrorResponse(`Assignment with ID "${assignmentId}" not found`, 404));
    }
    
    console.log(`Assigned topic ${assignmentId} disabled successfully`);
    
    res.status(200).json({
      success: true,
      message: `Assigned topic ${assignmentId} disabled successfully`,
      data: {
        assignmentId: assignmentId,
        status: 'disabled',
        disabledAt: assignment.disabledAt
      }
    });
  } catch (error) {
    console.error('Error disabling assigned topic:', error);
    res.status(500).json({
      success: false,
      message: "Failed to disable assigned topic",
      error: error.message
    });
  }
});

// @desc    Delete tag by tag ID
// @route   DELETE /api/v1/deleteTagname
// @access  Public
exports.deleteTagname = asyncHandler(async (req, res, next) => {
  const { tagId } = req.body;
  
  if (!tagId) {
    return next(new ErrorResponse("Tag ID is required in request body", 400));
  }
  
  try {
    // Find and delete topic by ID
    const deletedTopic = await Topics.findByIdAndDelete(tagId);
    
    if (!deletedTopic) {
      return next(new ErrorResponse(`Tag with ID "${tagId}" not found`, 404));
    }
    
    // Also delete from SubscribedTopic model if exists (using topic name)
    await SubscribedTopic.deleteOne({ topic: deletedTopic.topic });
    
    // Also delete any assignments related to this topic
    await AssignTopics.deleteMany({ topic: deletedTopic._id });
    
    console.log(`Deleted tag with ID "${tagId}" successfully`);
    
    res.status(200).json({
      success: true,
      message: `Tag with ID "${tagId}" deleted successfully`,
      data: {
        deletedTopic: deletedTopic,
        tagId: tagId
      }
    });
  } catch (error) {
    console.error('Error deleting tag by ID:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete tag",
      error: error.message
    });
  }
});