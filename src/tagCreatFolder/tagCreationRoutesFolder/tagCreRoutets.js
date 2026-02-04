const express = require("express");
const router = express.Router();

// Import tag creation controller functions
const {
  createTag,
  getAllTags,
  getAllTopics,
  getTag,
  updateTag,
  deleteTag,
  assignTopicsEmployee
} = require("../tagCreationControllerFolder/TagCreController");

// Tag creation routes
router.post("/", createTag);
router.get("/all", getAllTags);
router.get("/getAllTopics", getAllTopics);
router.get("/:id", getTag);
router.put("/:id", updateTag);
router.delete("/:id", deleteTag);
router.post("/assignTopicsEmployee", assignTopicsEmployee);

module.exports = router;