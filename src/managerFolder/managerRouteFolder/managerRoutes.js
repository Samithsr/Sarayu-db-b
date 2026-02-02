const express = require("express");
const router = express.Router();

// Import manager controller functions
const {
  createManager,
  getAllManagers,
  getManager,
  updateManager,
  deleteManager
} = require("../managerControllerFolder/managerController");

// Manager routes
router.post("/create", createManager);
router.get("/all", getAllManagers);
router.get("/:id", getManager);
router.put("/:id", updateManager);
router.delete("/:id", deleteManager);

module.exports = router;