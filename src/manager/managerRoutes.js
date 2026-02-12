const express = require("express");
const router = express.Router();

// Import manager controller functions
const {
  createManager
} = require("./managerController");

// Manager routes
router.post("/create/:companyId", createManager);

module.exports = router;