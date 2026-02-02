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
const managerRoutes = require("./src/managerFolder/managerRouteFolder/managerroutes");
const employeeRoutes = require("./src/employeeFolder/employeeRouteFolder/employeeRoutes");
const tagCreationRoutes = require("./src/tagCreatFolder/tagCreationRoutesFolder/tagCreRoutets");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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

// Manager Routes
// - POST /api/v1/manager/create - Create new manager
// - GET /api/v1/manager/all - Get all managers
// - GET /api/v1/manager/:id - Get single manager
// - PUT /api/v1/manager/:id - Update manager
// - DELETE /api/v1/manager/:id - Delete manager
app.use("/api/v1/manager", managerRoutes);

// Employee Routes
// - POST /api/v1/employee/create - Create new employee
// - GET /api/v1/employee/all - Get all employees
// - GET /api/v1/employee/:id - Get single employee
// - PUT /api/v1/employee/:id - Update employee
// - DELETE /api/v1/employee/:id - Delete employee
app.use("/api/v1/employee", employeeRoutes);

// Tag Creation Routes
// - POST /api/v1/tagCreation/tagCreation - Create new tag
// - GET /api/v1/tagCreation/all - Get all tags
// - GET /api/v1/tagCreation/:id - Get single tag
// - PUT /api/v1/tagCreation/:id - Update tag
// - DELETE /api/v1/tagCreation/:id - Delete tag
app.use("/api/v1/tagCreation", tagCreationRoutes);

app.get("/", (req, res) => {
  res.send("Sarayu Backend Server is running...");
});

// db connection
connectDB();

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
