const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");

const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");
const redisClient = require("./config/redis");
const RedisSessionStore = require("./config/redisSessionStore");
const adminRoutes = require("./src/adminFolder/adminRouteFolder/adminRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Session middleware with Redis
app.use(
  session({
    store: new RedisSessionStore(),
    secret: process.env.JWT_SECRET || "fallbacksecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      // maxAge: 1000 * 60 * 60 * 24, // 1 day
      maxAge: 1000 * 5, // 30 days
    },
    name: 'sessionId' // Custom session name
  })
);

// Routes
// Admin Authentication & User Management Routes
// - POST /api/v1/auth/register - Register new user
// - POST /api/v1/auth/login - User login
// - POST /api/v1/auth/logout - User logout
// - GET /api/v1/auth/me - Get current user
// - GET /api/v1/auth/users - Get all users (manager/supervisor)
// - GET /api/v1/auth/users/:id - Get single user (manager/supervisor)
// - PUT /api/v1/auth/users/:id - Update user (manager only)
// - DELETE /api/v1/auth/users/:id - Delete user (manager only)
app.use("/api/v1/auth", adminRoutes);

app.get("/", (req, res) => {
  res.send("Sarayu Backend Server is running...");
});

// db connection
connectDB();

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
