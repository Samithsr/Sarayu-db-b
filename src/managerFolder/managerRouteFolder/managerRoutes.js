const express = require("express");
const router = express.Router();

// Import manager controller functions
const {
  createManager,
  deleteManager
} = require("../managerControllerFolder/managerController");

// Manager routes
router.post("/create/:companyId", createManager);
router.delete("/:id", deleteManager);

module.exports = router;