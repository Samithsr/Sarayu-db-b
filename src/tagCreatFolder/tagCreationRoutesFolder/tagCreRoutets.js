const express = require("express");
const router = express.Router();

// Import tag creation controller functions
const {
  createTag,
  getAllTopics,
  getAllDevices,
  deleteTag,
  deleteTopics,
  assignTopicsEmployee,
  subscribeTopic,
  subscribeAllTopics,
  unsubscribeTopic,
  unsubscribeAllTopics,
  subScribeAllTopics,
  assignlayoutToManager,
  assignlayoutToEmployee,
  getRecent5Tagname,
  getAllAssignedTopic,
  deleteTagname
} = require("../tagCreationControllerFolder/tagCreController");

// Tag creation routes
router.post("/", createTag);
router.get("/getAllTopics", getAllTopics);
router.get("/getAllDevices", getAllDevices);
router.delete("/:id", deleteTag);
router.post("/deleteTopics", deleteTopics);
router.post("/assignTopicsEmployee", assignTopicsEmployee);
router.post("/subscribeTopic", subscribeTopic);
router.get("/subscribeAllTopics", subscribeAllTopics);
router.post("/unsubscribeTopic", unsubscribeTopic);
router.post("/unsubscribeAllTopics", unsubscribeAllTopics);
router.post("/subScribeAllTopics", subScribeAllTopics);
router.post("/assignlayoutToManager/:id", assignlayoutToManager);
router.post("/assignlayoutToEmployee/:id", assignlayoutToEmployee);
router.get("/get-recent-5-tagname", getRecent5Tagname);
router.get("/getAllAssignedTopic", getAllAssignedTopic);
router.delete("/deleteTagname/:tagname", deleteTagname);

module.exports = router;