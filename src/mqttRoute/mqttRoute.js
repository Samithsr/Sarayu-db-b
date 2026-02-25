const express = require("express");
const router = express.Router();

// Import the mqttController which contains all the route logic
const mqttController = require("./mqttController");

// Mount all routes from mqttController at the root level
// This makes all endpoints available like:
// POST /messages, POST /realtime-data/last-2-hours, etc.
router.use(mqttController);

module.exports = router;