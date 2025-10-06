const redis = require('redis');
const logger = require('../utils/logger');

/**
 * Redis Connection Configuration
 * Manages multiple Redis databases for cache, session, and queue
 */
class RedisClient {
  constructor() {
    this.cacheClient = null;
    this.sessionClient = null;
    this.queueClient = null;
  }

  /**
   * Create Redis client with specific DB
   */
  createClient(db, name) {
    const client = redis.createClient({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error(`Redis ${name} connection refused`);
          return new Error('Redis server refused connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Redis retry time exhausted');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      },
    });

    client.on('connect', () => {
      logger.info(`✅ Redis ${name} connected (DB: ${db})`);
    });

    client.on('error', (err) => {
      logger.error(`❌ Redis ${name} error:`, err.message);
    });

    client.on('ready', () => {
      logger.info(`🚀 Redis ${name} ready`);
    });

    return client;
  }

  /**
   * Initialize all Redis connections
   */
  async connect() {
    try {
      // Cache database (DB 0)
      this.cacheClient = this.createClient(
        parseInt(process.env.REDIS_DB_CACHE || 0, 10),
        'Cache'
      );

      // Session database (DB 1)
      this.sessionClient = this.createClient(
        parseInt(process.env.REDIS_DB_SESSION || 1, 10),
        'Session'
      );

      // Queue database (DB 2)
      this.queueClient = this.createClient(
        parseInt(process.env.REDIS_DB_QUEUE || 2, 10),
        'Queue'
      );

      await Promise.all([
        this.cacheClient.connect(),
        this.sessionClient.connect(),
        this.queueClient.connect(),
      ]);

      logger.info('✅ All Redis clients connected');

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
      });

      return true;
    } catch (error) {
      logger.error('❌ Redis connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Disconnect all Redis clients
   */
  async disconnect() {
    try {
      const promises = [];

      if (this.cacheClient) {
        promises.push(this.cacheClient.quit());
      }
      if (this.sessionClient) {
        promises.push(this.sessionClient.quit());
      }
      if (this.queueClient) {
        promises.push(this.queueClient.quit());
      }

      await Promise.all(promises);
      logger.info('🔌 All Redis clients disconnected');
    } catch (error) {
      logger.error('Error disconnecting Redis:', error.message);
    }
  }

  /**
   * Get cache client
   */
  getCache() {
    return this.cacheClient;
  }

  /**
   * Get session client
   */
  getSession() {
    return this.sessionClient;
  }

  /**
   * Get queue client
   */
  getQueue() {
    return this.queueClient;
  }
}

module.exports = new RedisClient();
