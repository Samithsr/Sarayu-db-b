const session = require('express-session');
// const Redis = require('redis');
// const RedisStore = require('connect-redis').default;

// // Create Redis client
// const redisClient = Redis.createClient({
//   url: `redis://${process.env.REDIS_PASSWORD ? ':' + process.env.REDIS_PASSWORD + '@' : ''}${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
//   database: process.env.REDIS_DB || 0
// });

// redisClient.on('error', (err) => {
//   console.error('Redis connection error:', err);
// });

// redisClient.on('connect', () => {
//   console.log('Connected to Redis');
// });

// // Connect to Redis
// redisClient.connect().catch(console.error);

// Session configuration
const sessionConfig = session({
  // store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId', // Custom cookie name
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: 'lax' // CSRF protection
  }
});

module.exports = {
  sessionConfig,
  // redisClient
};
