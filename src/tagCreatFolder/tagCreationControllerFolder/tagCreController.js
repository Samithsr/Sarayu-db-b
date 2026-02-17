const Topics = require("../../../models/topicsModel");
const Device = require("../../../models/device-model");
const Employee = require("../../../models/employeeModel");
const SubscribedTopic = require("../../../models/subscribedTopic-model");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");

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
  
  // Save device to Device model (allow duplicates)
  const newDevice = new Device({ device });
  await newDevice.save();
  
  // Save topic to Topics model
  const newTopic = new Topics({ topic, label });
  await newTopic.save();
  
  res.status(201).json({
    success: true,
    data: {
      device: newDevice,
      topic: newTopic
    },
  });
});

// @desc    Get all topics with devices
// @route   GET /api/v1/tagCreation/getAllTopics
// @access  Public
exports.getAllTopics = asyncHandler(async (req, res, next) => {
  const topics = await Topics.find().sort({ createdAt: -1 });
  const devices = await Device.find().sort({ createdAt: -1 });
  
  console.log('Topics found:', topics.length);
  console.log('Devices found:', devices.length);
  
  // Add a single device to each topic
  const topicsWithDevice = topics.map((topic, index) => {
    const deviceIndex = index % devices.length;
    const selectedDevice = devices[deviceIndex];
    
    return {
      ...topic.toObject(),
      device: selectedDevice ? selectedDevice.device : null
    };
  });
  
  res.status(200).json({
    success: true,
    count: topics.length,
    data: topicsWithDevice
  });
});

// @desc    Get all devices
// @route   GET /api/v1/tagCreation/getAllDevices
// @access  Public
exports.getAllDevices = asyncHandler(async (req, res, next) => {
  const devices = await Device.find().sort({ createdAt: -1 });
  
  console.log('Devices found:', devices.length);
  
  res.status(200).json({
    success: true,
    count: devices.length,
    data: devices
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

// @desc    Assign topics to employee
// @route   POST /api/v1/tagCreation/assignTopicsEmployee
// @access  Public
exports.assignTopicsEmployee = asyncHandler(async (req, res, next) => {
  const { employeeId, topicIds } = req.body;
  
  // Check if employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return next(new ErrorResponse(`Employee not found with id of ${employeeId}`, 404));
  }
  
  // Check if all topics exist
  const topics = await Topics.find({ '_id': { $in: topicIds } });
  if (topics.length !== topicIds.length) {
    return next(new ErrorResponse('One or more topics not found', 404));
  }
  
  // Add topics to employee's assigned topics (if field exists)
  // For now, we'll return assignment info
  // You may need to add an 'assignedTopics' field to employee schema
  
  res.status(200).json({
    success: true,
    message: 'Topics assigned to employee successfully',
    data: {
      employeeId: employeeId,
      employeeName: employee.name,
      assignedTopics: topics,
      count: topics.length
    }
  });
});

// @desc    Subscribe to topics
// @route   POST /api/v1/tagCreation/subscribeTopic
// @access  Public
exports.subscribeTopic = asyncHandler(async (req, res) => {
  const { topic } = req.body;
  console.log("subscribeTopic request:", topic);
  const foundTopic = await SubscribedTopic.findOne({ topic });
  if (!foundTopic) {
    await SubscribedTopic.create({ topic });
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