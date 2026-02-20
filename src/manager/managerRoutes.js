const express = require("express");
const router = express.Router();

// Import manager controller functions
const {
  createManager,
  getAllManager,
  getManagerByCompanyId,
  loginAsManager,
  addTagnamesToTheManager,
  assignDigitalMeterToManager
} = require("./managerController");

// Manager routes
console.log("=== Registering Manager Routes ===");
router.post("/create/:companyId", createManager);
console.log("Route registered: POST /create/:companyId");

router.get("/getAllManager/:companyId", getAllManager);
console.log("Route registered: GET /getAllManager/:companyId");

router.get("/getManagerByCompanyId/:companyId", getManagerByCompanyId);
console.log("Route registered: GET /getManagerByCompanyId/:companyId");

router.post("/login", loginAsManager);
console.log("Route registered: POST /login");

router.post("/addTagnamesToTheManager/:id", addTagnamesToTheManager);
console.log("Route registered: POST /addTagnamesToTheManager/:id");

router.post("/assignDigitalMeter/:id", (req, res, next) => {
  console.log("=== assignDigitalMeter route hit ===");
  console.log("Request URL:", req.originalUrl);
  console.log("Request method:", req.method);
  console.log("Request params:", req.params);
  next();
}, assignDigitalMeterToManager);
console.log("Route registered: POST /assignDigitalMeter/:id");

router.post("/assignDigitalMeterManager", assignDigitalMeterToManager);
console.log("Route registered: POST /assignDigitalMeterManager");

router.post("/assignDigitalMeterToManager/:id", (req, res, next) => {
  console.log("=== assignDigitalMeterToManager route hit ===");
  console.log("Request URL:", req.originalUrl);
  console.log("Request method:", req.method);
  console.log("Request params:", req.params);
  next();
}, assignDigitalMeterToManager);
console.log("Route registered: POST /assignDigitalMeterToManager/:id");

module.exports = router;