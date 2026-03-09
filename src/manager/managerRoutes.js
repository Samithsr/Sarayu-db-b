const express = require("express");
const { authenticate, authorize } = require("../../middlewares/auth");
const {
  loginAsManager,
  getSinlgeManager,
  getAllOperatorsForManager,
  addFavoriteEmployee,
  removeFavoriteEmployee,
  addTagnamesToTheEmployee,
  deleteTagnamesToTheEmployee,
  assignDigitalMeterToEmployee,
  assignlayoutToEmployee,
  addGraphWatchListEmployee,
  removeGraphWatchListEmployee,
  subscribeToEmployeeTopic,
} = require("./managerController");

const router = express.Router();

// Manager authentication
router.route("/manager/login").post(loginAsManager);
router.route("/manager/:id").get(authenticate, getSinlgeManager);
router.route("/manager/getalloperators/:id").get(authenticate, getAllOperatorsForManager);

// Employee management (Manager can manage employees)
router.post("/employee/:id/favorites", authenticate, addFavoriteEmployee);
router.delete("/employee/:id/favorites", authenticate, removeFavoriteEmployee);
router.post("/employee/assign-topics/:id", authenticate, addTagnamesToTheEmployee);
router.put("/employee/delete-topic/:id", authenticate, deleteTagnamesToTheEmployee);
router.put("/digitalmeter/employee/:id", authenticate, assignDigitalMeterToEmployee);
router.put("/layoutassign/employee/:id", authenticate, assignlayoutToEmployee);
router.post("/employee/:id/graphwl", authenticate, addGraphWatchListEmployee);
router.delete("/employee/:id/graphwl", authenticate, removeGraphWatchListEmployee);
router.post("/subscribeToEmployeeTopic", authenticate, subscribeToEmployeeTopic);

module.exports = router;