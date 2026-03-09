const express = require("express");
const { authenticate, authorize } = require("../../middlewares/auth");
const {
  loginAsEmployee,
  getSinlgeEmployee,
  addFavoriteManager,
  removeFavoriteManager,
  addTagnamesToTheManager,
  deleteTagnamesToTheManager,
  assignDigitalMeterToManager,
  assignlayoutToManager,
  addGraphWatchListManager,
  removeGraphWatchListManager,
} = require("./employeeController");

const router = express.Router();

// Employee authentication
router.route("/employee/login").post(loginAsEmployee);
router.route("/employee/:id").get(authenticate, getSinlgeEmployee);

// Manager management (Employee can manage manager features)
router.post("/manager/:id/favorites", authenticate, addFavoriteManager);
router.delete("/manager/:id/favorites", authenticate, removeFavoriteManager);
router.post("/manager/assign-topics/:id", authenticate, addTagnamesToTheManager);
router.put("/manager/delete-topic/:id", authenticate, deleteTagnamesToTheManager);
router.put("/digitalmeter/manager/:id", authenticate, assignDigitalMeterToManager);
router.put("/layoutassign/manager/:id", authenticate, assignlayoutToManager);
router.post("/manager/:id/graphwl", authenticate, addGraphWatchListManager);
router.delete("/manager/:id/graphwl", authenticate, removeGraphWatchListManager);

module.exports = router;