/* eslint-disable linebreak-style */
/* eslint-disable padded-blocks */
/* eslint-disable comma-dangle */
/* eslint-disable object-curly-newline */
/* eslint-disable class-methods-use-this */
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * MongoDB Connection Configuration
 * Connects to MongoDB Atlas with retry logic
 */
class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4
      };

      this.connection = await mongoose.connect(process.env.MONGODB_URI, options);

      logger.info('✅ MongoDB Connected Successfully');
      logger.info(`📊 Database: ${this.connection.connection.name}`);
      logger.info(`🌐 Host: ${this.connection.connection.host}`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        logger.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️  MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('✅ MongoDB reconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      logger.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      logger.info('🔌 MongoDB connection closed');
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error.message);
    }
  }

  /**
   * Get connection status
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Get database instance
   */
  getDb() {
    return mongoose.connection.db;
  }
}

module.exports = new Database();
