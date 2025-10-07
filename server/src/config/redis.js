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
      socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error(`Redis ${name} max retries reached`);
            return new Error('Max retries reached');
          }
          const delay = Math.min(retries * 100, 3000);
          logger.warn(`Redis ${name} reconnecting... attempt ${retries}, delay: ${delay}ms`);
          return delay;
        },
        connectTimeout: 10000,
        keepAlive: 30000,
      },
      password: process.env.REDIS_PASSWORD || undefined,
      database: db,
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

    client.on('reconnecting', () => {
      logger.info(`🔄 Redis ${name} reconnecting...`);
    });

    client.on('end', () => {
      logger.warn(`⚠️ Redis ${name} connection closed`);
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
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await this.disconnect();
        process.exit(0);
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

      if (this.cacheClient?.isOpen) {
        promises.push(this.cacheClient.quit());
      }
      if (this.sessionClient?.isOpen) {
        promises.push(this.sessionClient.quit());
      }
      if (this.queueClient?.isOpen) {
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

  /**
   * Health check for all Redis clients
   */
  async healthCheck() {
    try {
      const results = await Promise.all([
        this.cacheClient?.ping(),
        this.sessionClient?.ping(),
        this.queueClient?.ping(),
      ]);
      return results.every(result => result === 'PONG');
    } catch (error) {
      logger.error('Redis health check failed:', error.message);
      return false;
    }
  }
}

module.exports = new RedisClient();