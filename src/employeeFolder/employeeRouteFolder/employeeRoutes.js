const express = require("express");
const router = express.Router();

// Import employee controller functions
const {
  createEmployee,
  getAllEmployeesOfSameCompany,
  getEmployeesByManagerId,
  loginAsEmployee,
  addTagnamesToTheEmployee,
  assignDigitalMeterToEmployee,
  getAssignedDigitalMeterToEmployee,
  getAllUserTopics,
  assignDigitalMeterEmployee
} = require("../employeeControlerFolder/employeeController");

// Employee routes
console.log("=== Registering Employee Routes ===");
router.post("/create/:managerId/:companyId", createEmployee);
console.log("Route registered: POST /create/:managerId/:companyId");

router.get("/getAllEmployeesOfSameCompany/:companyId", getAllEmployeesOfSameCompany);
console.log("Route registered: GET /getAllEmployeesOfSameCompany/:companyId");

router.get("/getAllEmployeesOfSameCompany", getAllEmployeesOfSameCompany);
console.log("Route registered: GET /getAllEmployeesOfSameCompany");

router.get("/getEmployeesByManagerId/:managerId", getEmployeesByManagerId);
console.log("Route registered: GET /getEmployeesByManagerId/:managerId");

router.post("/login", loginAsEmployee);
console.log("Route registered: POST /login");

router.post("/addTagnamesToTheEmployee/:id", addTagnamesToTheEmployee);
console.log("Route registered: POST /addTagnamesToTheEmployee/:id");

router.post("/assignDigitalMeterToEmployee/:id", assignDigitalMeterToEmployee);
console.log("Route registered: POST /assignDigitalMeterToEmployee/:id");

router.get("/getAssignedDigitalMeterToEmployee/:id", getAssignedDigitalMeterToEmployee);
console.log("Route registered: GET /getAssignedDigitalMeterToEmployee/:id");

router.get("/getAllUserTopics/:id", getAllUserTopics);
console.log("Route registered: GET /getAllUserTopics/:id");

router.post("/assignDigitalMeterEmployee", (req, res, next) => {
  console.log("=== assignDigitalMeterEmployee route hit ===");
  console.log("Request URL:", req.originalUrl);
  console.log("Request method:", req.method);
  console.log("Request params:", req.params);
  next();
}, assignDigitalMeterEmployee);
console.log("Route registered: POST /assignDigitalMeterEmployee");

module.exports = router;