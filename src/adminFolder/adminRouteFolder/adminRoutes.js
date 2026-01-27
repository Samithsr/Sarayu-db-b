const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require("../adminControllerFolder/adminController");

// Middleware to protect routes and check roles
const { protect, authorize } = require("../../../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Private routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

// Role-based routes
router.get("/users", protect, authorize("manager", "supervisor"), getUsers);
router.get("/users/:id", protect, authorize("manager", "supervisor"), getUser);
router.put("/users/:id", protect, authorize("manager"), updateUser);
router.delete("/users/:id", protect, authorize("manager"), deleteUser);

module.exports = router;