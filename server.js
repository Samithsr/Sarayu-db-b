const winston = require("winston");
const connectDB = require("./env/db");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");
const errorHandler = require("./middlewares/error");
const dotenv = require("dotenv");
const { sessionConfig } = require("./middlewares/session");
const authRoute = require("./routers/auth-router");
const mainRoute = require("./routers/main-router");
const supportmailRoute = require("./routers/supportmail-router");
const mqttRoutes = require("./routers/mqttRoutes");
const backupdbRoute = require("./src/backup/backupRoute");
const http = require("http");
const { Server } = require("socket.io");
const { subscribeToTopic, getLatestLiveMessage } = require("./middlewares/mqttHandler");
const SubscribedTopic = require("./src/models/subscribed-topic-model");

// Load environment variables
dotenv.config({ path: "./.env" });

// Initialize Express
const app = express();

// Logger configuration
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Middleware
app.use(sessionConfig);
app.use(express.json());
app.use(fileupload());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ 
  origin: "http://localhost:5000", 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true, // Enable credentials for sessions
  exposedHeaders: ['Content-Length', 'Content-Disposition'],
  maxAge: 86400
}));
app.use(cookieParser());

// Increase request timeout and enable chunked responses
app.use((req, res, next) => {
  req.setTimeout(600000); // 10-minute timeout
  res.setTimeout(600000); // 10-minute timeout
  res.flush = res.flush || (() => {}); // Ensure flush is available
  logger.info(`Requested to: ${req.url}`, {
    method: req.method,
    body: req.body,
    session: req.session ? {
      sessionId: req.sessionID,
      user: req.session.user || null,
      cookie: req.session.cookie || null
    } : null,
    headers: req.headers
  });
  next();
});

// Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1", mainRoute);
app.use("/api/v1/supportmail", supportmailRoute);
app.use("/api/v1/mqtt", mqttRoutes);
app.use("/api/v1/backupdb", backupdbRoute);

// Error handling
app.use(errorHandler);

// Database connection
connectDB();

// Store active MQTT topics and their associated data
const activeTopics = new Map();

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Handle Socket.IO client connections and events
io.on("connection", (socket) => {
  const subscriptions = new Map();

  socket.on("subscribeToTopic", async (topic) => {
    if (!topic || subscriptions.has(topic)) return;

    try {
      socket.join(topic);
      subscriptions.set(topic, true);

      if (!activeTopics.has(topic)) {
        activeTopics.set(topic, { 
          clients: new Set(), 
          lastMessage: null, 
          lastSentTime: null, 
          interval: null 
        });
        startTopicStream(topic);
      }

      activeTopics.get(topic).clients.add(socket.id);

      const latestMessage = await getLatestLiveMessage(topic);
      if (latestMessage) {
        socket.emit("liveMessage", { success: true, message: latestMessage, topic });
      }
    } catch (error) {
      logger.error(`Subscription error for ${topic}: ${error.message}`);
    }
  });

  socket.on("unsubscribeFromTopic", (topic) => {
    if (subscriptions.has(topic)) {
      socket.leave(topic);
      subscriptions.delete(topic);

      if (activeTopics.has(topic)) {
        const topicData = activeTopics.get(topic);
        topicData.clients.delete(socket.id);

        if (topicData.clients.size === 0) {
          clearInterval(topicData.interval);
          activeTopics.delete(topic);
        }
      }
    }
  });

  // Clean up subscriptions on client disconnection
  socket.on("disconnect", () => {
    subscriptions.forEach((_, topic) => {
      socket.leave(topic);

      if (activeTopics.has(topic)) {
        const topicData = activeTopics.get(topic);
        topicData.clients.delete(socket.id);

        if (topicData.clients.size === 0) {
          clearInterval(topicData.interval);
          activeTopics.delete(topic);
        }
      }
    });
    subscriptions.clear();
  });
});

// Stream real-time messages for a given topic
const startTopicStream = (topic) => {
  const topicData = activeTopics.get(topic);

  topicData.interval = setInterval(async () => {
    try {
      const currentTime = Date.now();
      const latestMessage = await getLatestLiveMessage(topic);

      if (latestMessage) {
        const hasChanged = !topicData.lastMessage || 
                          topicData.lastMessage.message.message !== latestMessage.message.message;
        const timeSinceLastSent = topicData.lastSentTime ? 
                                  (currentTime - topicData.lastSentTime) : 
                                  Infinity;

        if (hasChanged || timeSinceLastSent >= 1000) {
          io.to(topic).emit("liveMessage", { success: true, message: latestMessage, topic });
          topicData.lastMessage = latestMessage;
          topicData.lastSentTime = currentTime;
        }
      }
    } catch (error) {
      logger.error(`Stream error for ${topic}: ${error.message}`);
    }
  }, 200);
};

// Start server with Socket.IO
const port = process.env.PORT || 5000;
server.listen(port, "0.0.0.0", () => {
  logger.info(`API Server with Socket.IO running on port ${port}`);

  setTimeout(async () => {
    try {
      const SubscribedTopicList = await SubscribedTopic.find({}, { _id: 0, topic: 1 });
      if (SubscribedTopicList?.length > 0) {
        const topicsToSubscribe = [];
        
        SubscribedTopicList.forEach(({ topic }) => {
          topicsToSubscribe.push(topic);              
          topicsToSubscribe.push(`${topic}|backup`);  
        });

        await Promise.all(topicsToSubscribe.map(topic => subscribeToTopic(topic)));
        logger.info("MQTT topics (including backup topics) subscribed successfully");
      }
    } catch (err) {
      logger.error(`Error subscribing to topics: ${err.message}`);
    }
  }, 5000);
});