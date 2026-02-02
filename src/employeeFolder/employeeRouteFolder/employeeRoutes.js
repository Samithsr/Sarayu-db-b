const express = require("express");
const router = express.Router();

// Import employee controller functions
const {
  createEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee
} = require("../employeeControlerFolder/employeeController");

// Employee routes
router.post("/create", createEmployee);
router.get("/all", getAllEmployees);
router.get("/:id", getEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;