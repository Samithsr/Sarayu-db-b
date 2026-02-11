const express = require("express");
const router = express.Router();

// Import employee controller functions
const {
  createEmployee
} = require("../employeeControlerFolder/employeeController");

// Employee routes
router.post("/create/:companyId/:supervisorId", createEmployee);

module.exports = router;