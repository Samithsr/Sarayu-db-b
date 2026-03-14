const express = require("express");
const {
  login,
  logout,
  signup,
} = require("../controllers/auth-controller");

const router = express.Router();

// Authentication only routes
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").post(logout);

module.exports = router;
