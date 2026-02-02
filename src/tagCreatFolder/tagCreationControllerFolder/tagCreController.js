const Topics = require("../../../models/topicsModel");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");

// @desc    Create a new tag
// @route   POST /api/v1/tagCreation/tagCreation
// @access  Public
exports.createTag = asyncHandler(async (req, res, next) => {
  const { topic, device, label } = req.body;
  
  const tag = await Topics.findOne({ topic, device, label });
  
  if (tag) {
    return next(new ErrorResponse("Tag already exists!", 409));
  }
  
  const newTag = new Topics({ 
    topic, 
    device, 
    label
  });
  
  await newTag.save();
  
  res.status(201).json({
    success: true,
    data: newTag,
  });
});

// @desc    Get all tags
// @route   GET /api/v1/tagCreation/all
// @access  Public
exports.getAllTags = asyncHandler(async (req, res, next) => {
  const tags = await Topics.find().sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: tags.length,
    data: tags
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
  const { topic, device, label } = req.body;
  
  let tag = await Topics.findById(req.params.id);
  
  if (!tag) {
    return next(new ErrorResponse(`Tag not found with id of ${req.params.id}`, 404));
  }
  
  // Update tag fields
  if (topic) tag.topic = topic;
  if (device) tag.device = device;
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