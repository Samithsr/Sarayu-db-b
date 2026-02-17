const express = require("express");
const router = express.Router();

// Import employee controller functions
const {
  createEmployee,
  getAllEmployeesOfSameCompany,
  getEmployeesByManagerId
} = require("../employeeControlerFolder/employeeController");

// Employee routes
router.post("/create/:managerId/:companyId", createEmployee);
router.get("/getAllEmployeesOfSameCompany/:companyId", getAllEmployeesOfSameCompany);
router.get("/getAllEmployeesOfSameCompany", getAllEmployeesOfSameCompany);
router.get("/getEmployeesByManagerId/:managerId", getEmployeesByManagerId);

module.exports = router;