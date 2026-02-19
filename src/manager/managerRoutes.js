const express = require("express");
const router = express.Router();

// Import manager controller functions
const {
  createManager,
  getAllManager,
  getManagerByCompanyId,
  loginAsManager
} = require("./managerController");

// Manager routes
router.post("/create/:companyId", createManager);
router.get("/getAllManager/:companyId", getAllManager);
router.get("/getManagerByCompanyId/:companyId", getManagerByCompanyId);
router.post("/login", loginAsManager);

module.exports = router;