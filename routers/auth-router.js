const express = require("express");
const { authenticate, authorize, authorizeCompanyAccess } = require("../middlewares/auth");
const {
  login,
  logout,
  getAllUserTopics,
  subscribedTopics,
  getSubscribedTopics,
  addDeviceConfig,
  removeDeviceConfig,
  updateDeviceConfig,
  getAllDeviceConfig,
} = require("../controllers/auth-controller");

// Import route modules
const adminRoutes = require("../src/admin/adminRoutes");
const managerRoutes = require("../src/manager/managerRoutes");
const employeeRoutes = require("../src/employee/employeeRoutes");

const router = express.Router();

// Common authentication routes
router.route("/login").post(login);
router.route("/logout").post(authenticate, logout);

// Common utility routes
router.route("/subscribedTopics").post(authenticate, subscribedTopics).get(authenticate, getSubscribedTopics);
router.route("/deviceconfig").get(authenticate, getAllDeviceConfig).post(authenticate, addDeviceConfig);
router.route("/deviceconfig/:id").put(authenticate, updateDeviceConfig).delete(authenticate, removeDeviceConfig);
router.get("/getusertopics/:id", authenticate, getAllUserTopics);

// Mount specialized routes
router.use("/", adminRoutes);
router.use("/", managerRoutes);
router.use("/", employeeRoutes);

module.exports = router;
