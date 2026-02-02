const express = require("express");
const router = express.Router();
const {
  createManager,
  getAllManagers,
  getManagerById,
  updateManager,
  deleteManager
} = require("../managerControllerFolder/managerController");
const { protect, authorize } = require("../../../middleware/auth");

// Manager routes
router.post("/create", createManager);
router.get("/all", getAllManagers);
router.get("/:id", getManagerById);
router.put("/:id", updateManager);
router.delete("/:id", deleteManager);

module.exports = router;