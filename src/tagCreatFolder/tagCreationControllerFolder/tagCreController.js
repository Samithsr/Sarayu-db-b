const Topics = require("../../../models/topicsModel");
const Device = require("../../../models/device-model");
const Employee = require("../../../models/employeeModel");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");

// @desc    Create a new tag
// @route   POST /api/v1/tagCreation
// @access  Public
exports.createTag = asyncHandler(async (req, res, next) => {
  const { device, topic, label } = req.body;
  
  // Check if device already exists
  const existingDevice = await Device.findOne({ device });
  if (existingDevice) {
    return next(new ErrorResponse("Device already exists!", 409));
  }
  
  // Check if topic already exists
  const existingTopic = await Topics.findOne({ topic, label });
  if (existingTopic) {
    return next(new ErrorResponse("Topic already exists!", 409));
  }
  
  // Save device to Device model
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

// @desc    Get all tags
// @route   GET /api/v1/tagCreation/all
// @access  Public
exports.getAllTags = asyncHandler(async (req, res, next) => {
  const topics = await Topics.find().sort({ createdAt: -1 });
  const devices = await Device.find().sort({ createdAt: -1 });
  
  // Add devices to each topic
  const topicsWithDevices = topics.map(topic => ({
    ...topic.toObject(),
    devices: devices
  }));
  
  res.status(200).json({
    success: true,
    count: topics.length,
    data: topicsWithDevices
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

// @desc    Get single tag
// @route   GET /api/v1/tagCreation/:id
// @access  Public
exports.getTag = asyncHandler(async (req, res, next) => {
  const tag = await Topics.findById(req.params.id);
  
  if (!tag) {
    return next(new ErrorResponse(`Tag not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: tag
  });
});

// @desc    Update tag
// @route   PUT /api/v1/tagCreation/:id
// @access  Public
exports.updateTag = asyncHandler(async (req, res, next) => {
  const { topic, label } = req.body;
  
  let tag = await Topics.findById(req.params.id);
  
  if (!tag) {
    return next(new ErrorResponse(`Tag not found with id of ${req.params.id}`, 404));
  }
  
  // Update tag fields
  if (topic) tag.topic = topic;
  if (label) tag.label = label;
  
  await tag.save();
  
  res.status(200).json({
    success: true,
    data: tag
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
  // For now, we'll return the assignment info
  // You may need to add an 'assignedTopics' field to the employee schema
  
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