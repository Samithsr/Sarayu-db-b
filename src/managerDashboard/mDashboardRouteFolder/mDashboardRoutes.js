const express = require("express");
const router = express.Router();

// Import manager dashboard controller functions
const {
  getAllCompanies,
  getAllDevices
} = require("../mDashboardControllerFolder/mDashboardController");

// Get all companies route (no auth for testing)
router.get("/getAllCompanies", getAllCompanies);

// Get all devices route (no auth for testing)
router.get("/getAllDevices", getAllDevices);

module.exports = router;