const express = require("express");
const router = express.Router();

// Import tag creation controller functions
const {
  createTag,
  getAllTopics,
  getAllDevices,
  deleteTag,
  assignTopicsEmployee,
  subscribeTopic,
  subscribeAllTopics,
  subScribeAllTopics
} = require("../tagCreationControllerFolder/tagCreController");

// Tag creation routes
router.post("/", createTag);
router.get("/getAllTopics", getAllTopics);
router.get("/getAllDevices", getAllDevices);
router.delete("/:id", deleteTag);
router.post("/assignTopicsEmployee", assignTopicsEmployee);
router.post("/subscribeTopic", subscribeTopic);
router.get("/subscribeAllTopics", subscribeAllTopics);
router.post("/subScribeAllTopics", subScribeAllTopics);

module.exports = router;