const asyncHandler = require("../../middlewares/asyncHandler");
const ErrorResponse = require("../../middlewares/errorResponse");
const Employee = require("../../src/models/employee-model");
const Manager = require("../../src/models/manager-model");
const Favorites = require("../../src/models/favorites-model");
const AssignTopics = require("../../src/models/assign-topics-model");
const AssignedDigitalMeter = require("../../src/models/assigned-digital-meter-model");
const Layout = require("../../src/models/layout-model");
const GraphWhiteList = require("../../src/models/graphwhitelist-model");
const { subscribeToDevice } = require("../../middlewares/mqttHandler");
const logger = require("../../middlewares/logger");

//Login as employee
const loginAsEmployee = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await Employee.findOne({ email })
    .select("+password")
    .populate("company")
    .populate("manager");
  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  const isMatch = await user.verifyPass(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  
  // Store employee data in session
  req.session.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: 'employee',
    company: user.company._id,
    manager: user.manager ? user.manager._id : null
  };
  
  // Save session
  await req.session.save();
  
  // Log employee session creation
  logger.info("Employee session created", {
    sessionId: req.sessionID,
    user: req.session.user,
    timestamp: new Date().toISOString()
  });
  
  res.status(200).json({
    success: true,
    message: "Employee login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'employee',
      company: user.company,
      manager: user.manager
    }
  });
});

const getSinlgeEmployee = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const employee = await Employee.findById(id)
    .populate("company")
    .populate("manager");
  if (!employee) {
    return next(new ErrorResponse(`No employee found with id ${id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: employee,
  });
});

const addFavoriteManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { favoriteItem, itemType } = req.body;

    if (!favoriteItem) {
      return res.status(400).json({ message: "Favorite item is required" });
    }

    const manager = await Manager.findById(id);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // Check if favorite already exists for this manager
    const existingFavorite = await Favorites.findOne({
      user: id,
      userType: 'Manager',
      favoriteItem: favoriteItem
    });

    if (!existingFavorite) {
      await Favorites.create({
        user: id,
        userType: 'Manager',
        favoriteItem: favoriteItem,
        itemType: itemType || 'topic',
        isActive: true
      });
    }

    // Get all active favorites for the manager
    const allFavorites = await Favorites.find({
      user: id,
      userType: 'Manager',
      isActive: true
    }).select('favoriteItem itemType');

    res.status(200).json({
      message: "Item added to favorites",
      favorites: allFavorites,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding favorite", error: error.message });
  }
};

// Remove a topic from favorites
const removeFavoriteManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const manager = await Manager.findById(id);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const index = manager.favorites.indexOf(topic);
    if (index !== -1) {
      manager.favorites.splice(index, 1);
      await manager.save();
    }

    res.status(200).json({
      message: "Topic removed from favorites",
      favorites: manager.favorites,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing favorite", error: error.message });
  }
};

const addTagnamesToTheManager = async (req, res, next) => {
  const { id } = req.params;
  const { topics } = req.body;

  if (!Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({ error: "Topics must be a non-empty array." });
  }

  try {
    // Check if manager exists
    const manager = await Manager.findById(id);
    if (!manager) {
      return res.status(404).json({ error: "Manager not found." });
    }

    // Add each topic to the AssignTopics table
    for (const topic of topics) {
      // Check if topic already exists for this manager
      const existingTopic = await AssignTopics.findOne({
        user: id,
        userType: 'Manager',
        topic: topic
      });

      if (!existingTopic) {
        await AssignTopics.create({
          user: id,
          userType: 'Manager',
          topic: topic,
          isActive: true
        });
      }
    }

    // Get all active topics for the manager
    const allTopics = await AssignTopics.find({
      user: id,
      userType: 'Manager',
      isActive: true
    }).select('topic');

    return res.status(200).json({
      message: "Topics updated successfully.",
      topics: allTopics.map(item => item.topic),
    });
  } catch (error) {
    console.error("Error updating topics:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating topics." });
  }
};

const deleteTagnamesToTheManager = async (req, res) => {
  const { id } = req.params;
  const { topic } = req.body;

  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ error: "A valid topic must be provided." });
  }

  try {
    const updatedEmployee = await Manager.findByIdAndUpdate(
      id,
      { $pull: { topics: topic } },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ error: "Manager not found." });
    }

    return res.status(200).json({
      message: "Topic deleted successfully.",
      Manager: updatedEmployee,
    });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the topic." });
  }
};

// digitalmeter assign constroller for manager
const assignDigitalMeterToManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedDigitalMeters } = req.body;
    
    const manager = await Manager.findById(id);
    if (!manager) {
      return res.status(404).json({ error: "Manager not found" });
    }

    if (assignedDigitalMeters && Array.isArray(assignedDigitalMeters)) {
      for (const newMeter of assignedDigitalMeters) {
        // Check if a meter with this topic already exists for this manager
        const existingMeter = await AssignedDigitalMeter.findOne({
          user: id,
          userType: 'Manager',
          topic: newMeter.topic
        });

        if (existingMeter) {
          // Update existing meter
          await AssignedDigitalMeter.findByIdAndUpdate(existingMeter._id, {
            meterType: newMeter.meterType,
            minValue: newMeter.minValue,
            maxValue: newMeter.maxValue,
            ticks: newMeter.ticks,
            label: newMeter.label,
            isActive: true
          });
        } else {
          // Create new meter assignment
          await AssignedDigitalMeter.create({
            user: id,
            userType: 'Manager',
            topic: newMeter.topic,
            meterType: newMeter.meterType,
            minValue: newMeter.minValue,
            maxValue: newMeter.maxValue,
            ticks: newMeter.ticks,
            label: newMeter.label
          });
        }
      }
    }

    // Get all assigned meters for the manager
    const allMeters = await AssignedDigitalMeter.find({ 
      user: id, 
      userType: 'Manager' 
    });
    
    res.status(200).json({
      success: true,
      data: allMeters
    });
  } catch (error) {
    console.error("Error in assignDigitalMeterToManager:", error);
    res.status(400).json({ error: error.message });
  }
};

const assignlayoutToManager = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { layoutName, layoutConfig } = req.body;
  
  // Check if manager exists
  const manager = await Manager.findById(id);
  if (!manager) {
    return next(new ErrorResponse("Manager not found", 404));
  }

  // Check if layout already exists for this manager
  const existingLayout = await Layout.findOne({
    user: id,
    userType: 'Manager'
  });

  if (existingLayout) {
    // Update existing layout
    await Layout.findByIdAndUpdate(existingLayout._id, {
      layoutName: layoutName || existingLayout.layoutName,
      layoutConfig: layoutConfig || existingLayout.layoutConfig,
      isActive: true
    });
  } else {
    // Create new layout
    await Layout.create({
      user: id,
      userType: 'Manager',
      layoutName: layoutName || 'default',
      layoutConfig: layoutConfig || {}
    });
  }

  res.status(200).json({ success: true, data: [] });
});

const addGraphWatchListManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const manager = await Manager.findById(id);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // Check current count of graph watch list items for this manager
    const currentCount = await GraphWhiteList.countDocuments({
      user: id,
      userType: 'Manager',
      isActive: true
    });

    if(currentCount >= 3){
      return next(new ErrorResponse("Maximum limit reached!",400))
    }

    // Check if topic already exists for this manager
    const existingTopic = await GraphWhiteList.findOne({
      user: id,
      userType: 'Manager',
      topic: topic
    });

    if (!existingTopic) {
      await GraphWhiteList.create({
        user: id,
        userType: 'Manager',
        topic: topic,
        isActive: true
      });
    }

    // Get all active graph watch list items for the manager
    const allTopics = await GraphWhiteList.find({
      user: id,
      userType: 'Manager',
      isActive: true
    }).select('topic');

    res.status(200).json({
      message: "Topic added to graphwl",
      graphwl: allTopics.map(item => item.topic),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding graphwl",
      error: error.message,
    });
  }
};

const removeGraphWatchListManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const manager = await Manager.findById(id);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const index = manager.graphwl.indexOf(topic);
    if (index !== -1) {
      manager.graphwl.splice(index, 1);
      await manager.save();
    }

    res.status(200).json({
      message: "Topic removed from graphwl",
      graphwl: manager.graphwl,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing graphwl", error: error.message });
  }
};

module.exports = {
  loginAsEmployee,
  getSinlgeEmployee,
  addFavoriteManager,
  removeFavoriteManager,
  addTagnamesToTheManager,
  deleteTagnamesToTheManager,
  assignDigitalMeterToManager,
  assignlayoutToManager,
  addGraphWatchListManager,
  removeGraphWatchListManager,
};