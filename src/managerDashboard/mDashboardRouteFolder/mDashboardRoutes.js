const express = require("express");
const router = express.Router();

// Import manager dashboard controller functions
const {
  getAllCompanies
} = require("../mDashboardControllerFolder/mDashboardController");

// Get all companies route (no auth for testing)
router.get("/getAllCompanies", getAllCompanies);

module.exports = router;