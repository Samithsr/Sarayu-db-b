const express = require("express");
const router = express.Router();

// Import authentication functions from auth.js
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword
} = require("../../../controller/auth.js");

// Import user management functions from adminController
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  adminLogin,
  createCompany,
  getAllCompanies,
  getSingleCompany,
  deleteCompany,
  deleteAnyEmployeeCompany,
  getAllManager,
  deleteManager,
  getAllSupervisorOfSameCompany,
  getAllEmployeesOfSameCompany,
  getAllDeviceConfig,
  getAllUserTopics
} = require("../adminControllerFolder/adminController");

// Middleware to protect routes and check roles
const { protect, authorize } = require("../../../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);

// Admin login route
router.post("/admin/login", adminLogin);

// Private routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

// Role-based routes
router.get("/users", protect, authorize("manager", "supervisor"), getUsers);
router.get("/users/:id", protect, authorize("manager", "supervisor"), getUser);
router.put("/users/:id", protect, authorize("manager"), updateUser);
router.delete("/users/:id", protect, authorize("manager"), deleteUser);

// Company management routes
router.post("/companies", protect, authorize("admin"), createCompany);
router.get("/companies", protect, authorize("admin"), getAllCompanies);
router.get("/company/:companyId", protect, authorize("admin"), getSingleCompany);
router.delete("/companies/:id", protect, authorize("admin"), deleteCompany);

// User management routes
router.delete("/deleteAnyEmployee/:id", protect, authorize("admin"), deleteAnyEmployeeCompany);

// Manager routes
router.get("/getallmanager/:companyId", protect, authorize("admin"), getAllManager);
router.delete("/manager/:id", protect, authorize("admin"), deleteManager);

// Supervisor routes
router.get("/supervisor/getAllSupervisorOfSameCompany/:companyId", protect, authorize("admin"), getAllSupervisorOfSameCompany);

// Employee routes
router.get("/employee/getAllEmployeesOfSameCompany/:companyId", protect, authorize("admin"), getAllEmployeesOfSameCompany);

// Device configuration routes
router.get("/deviceconfig", protect, authorize("admin"), getAllDeviceConfig);

// User topics routes
router.get("/getusertopics/:id", protect, authorize("admin"), getAllUserTopics);

module.exports = router;