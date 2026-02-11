const express = require("express");
const router = express.Router();

// Import supervisor controller functions
const {
  createSupervisor
} = require("./supervisorController");

// Supervisor routes
router.post("/create/:companyId", createSupervisor);

module.exports = router;