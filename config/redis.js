// /config/redisConfig.js

const redis = require('redis');

// Create a Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379', // Use .env for Redis URL or fallback to localhost
});

// Error handling for Redis client
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Optional: Logging when Redis client connects successfully
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Export the Redis client for use in other parts of the app
module.exports = redisClient;
