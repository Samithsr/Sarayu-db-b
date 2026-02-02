const express = require("express");
const router = express.Router();

// Import tag creation controller functions
const {
  createTag,
  getAllTags,
  getTag,
  updateTag,
  deleteTag
} = require("../tagCreationControllerFolder/TagCreController");

// Tag creation routes
router.post("/tagCreation", createTag);
router.get("/all", getAllTags);
router.get("/:id", getTag);
router.put("/:id", updateTag);
router.delete("/:id", deleteTag);

module.exports = router;