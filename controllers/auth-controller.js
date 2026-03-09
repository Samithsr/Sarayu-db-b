const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../middlewares/errorResponse");
const User = require("../src/models/user-model");
const Employee = require("../src/models/employee-model");
const SubscribedTopic = require("../src/models/subscribed-topic-model");
const ConfigDevice = require("../src/models/config-device");
const logger = require("../middlewares/logger");


const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  const isMatch = await user.verifyPass(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  
  // Store user data in session
  req.session.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  
  // Save session
  await req.session.save();
  
  // Log session creation
  logger.info("User session created", {
    sessionId: req.sessionID,
    user: req.session.user,
    timestamp: new Date().toISOString()
  });
  
  res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

const logout = asyncHandler(async (req, res, next) => {
  // Log session before destruction
  const sessionData = req.session ? {
    sessionId: req.sessionID,
    user: req.session.user
  } : null;
  
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      logger.error("Error destroying session", { error: err.message, sessionData });
      return next(new ErrorResponse("Error logging out", 500));
    }
    
    // Log session destruction
    logger.info("User session destroyed", {
      sessionData,
      timestamp: new Date().toISOString()
    });
    
    // Clear the cookie
    res.clearCookie('sessionId');
    
    res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  });
});

//to add or to remove the suscribed topics
const subscribedTopics = asyncHandler(async (req, res) => {
  const { topic } = req.body;
  console.log("ajhsdvkjasdvjasvdjasd : ",topic);
  const foundTopic = await SubscribedTopic.findOne({ topic });
  if (!foundTopic) {
    await SubscribedTopic.create({ topic });
    return res.status(201).json({ success: true, data: [] });
  } else {
    await foundTopic.deleteOne();
    return res.status(200).json({ success: true, data: [] });
  }
});

//to get all the subscribed topics
const getSubscribedTopics = asyncHandler(async (req, res, next) => {
  const subscribedTopics = await SubscribedTopic.find({}, { _id: 0, topic: 1 });
  res.status(200).json({ success: true, data: subscribedTopics });
});

// config device starts here
const addDeviceConfig = asyncHandler(async (req, res, next) => {
  const { gateway, slaveid, address, functioncode, size } = req.body;
  const device = await ConfigDevice.create({
    gateway,
    slaveid,
    address,
    functioncode,
    size,
  });
  res.status(201).json({ success: true, data: device });
});

const removeDeviceConfig = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const device = await ConfigDevice.findById(id);
  if (!device) {
    return next(new ErrorResponse(`No resource found`, 404));
  }
  await device.deleteOne();
  res.status(200).json({ success: true, data: [] });
});

const updateDeviceConfig = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const device = await ConfigDevice.findByIdAndUpdate(id, req.body);
  if (!device) {
    return next(new ErrorResponse("No resource found", 404));
  }
  res.status(200).json({ success: true, data: device });
});

const getAllDeviceConfig = asyncHandler(async (req, res, next) => {
  const device = await ConfigDevice.find({});
  res.status(200).json({ success: true, data: device });
});
// config device ends here

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

module.exports = {
  // Common APIs only
  getAllUserTopics,
  login,
  logout,
  subscribedTopics,
  getSubscribedTopics,
  addDeviceConfig,
  removeDeviceConfig,
  updateDeviceConfig,
  getAllDeviceConfig,
};
