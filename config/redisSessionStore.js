const redisClient = require('./redis');
const EventEmitter = require('events');

class RedisSessionStore extends EventEmitter {
  constructor() {
    super();
    this.client = redisClient;
  }

  // Get session data from Redis
  async get(sid, callback) {
    try {
      const data = await this.client.get(`sess:${sid}`);
      if (!data) {
        return callback(null, null);
      }
      const session = JSON.parse(data);
      return callback(null, session);
    } catch (error) {
      return callback(error);
    }
  }

  // Set session data in Redis
  async set(sid, session, callback) {
    try {
      const ttl = session.cookie.maxAge || 86400000; // Default 1 day
      await this.client.setEx(`sess:${sid}`, Math.ceil(ttl / 1000), JSON.stringify(session));
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }

  // Destroy session in Redis
  async destroy(sid, callback) {
    try {
      await this.client.del(`sess:${sid}`);
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }

  // Clear all sessions
  async clear(callback) {
    try {
      const keys = await this.client.keys('sess:*');
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }

  // Touch session to update TTL
  async touch(sid, session, callback) {
    try {
      const ttl = session.cookie.maxAge || 86400000; // Default 1 day
      await this.client.expire(`sess:${sid}`, Math.ceil(ttl / 1000));
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }
}

module.exports = RedisSessionStore;
