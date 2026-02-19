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
  assignlayoutToEmployee
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
router.post("/assignlayoutToManager/{manager_id}", assignlayoutToManager);
router.post("/assignlayoutToEmployee/{employee_id}", assignlayoutToEmployee);

module.exports = router;