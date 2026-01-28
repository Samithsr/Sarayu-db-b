const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
  database: process.env.REDIS_DB || 0
});

// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisClient.on('ready', () => {
  console.log('Redis is ready to use');
});

redisClient.on('end', () => {
  console.log('Redis connection ended');
});

// Connect to Redis
redisClient.connect().catch(console.error);

module.exports = redisClient;
