require("dotenv").config();
const { validateEnv } = require("./config/env");
const database = require("./config/database");
const redisClient = require("./config/redis");
const createApp = require("./app");
const logger = require("./utils/logger");
const workerManager = require('./workers');

/**
 * Application Bootstrap and Startup
 */
class ServerBootstrap {
  constructor() {
    this.server = null;
    this.isShuttingDown = false;
  }

  /**
   * Initialize and start server
   */
  async start() {
    try {
      logger.info("🚀 Starting Social Media Marketing Platform API...");
      logger.info("================================================");

      // Step 1: Validate environment
      logger.info("⚙️  Step 1: Validating environment variables...");
      validateEnv();
      logger.info("✅ Environment validated");

      // Step 2: Connect to MongoDB with timeout
      logger.info("⚙️  Step 2: Connecting to database...");
      const dbStartTime = Date.now();
      await this.connectWithTimeout(
        database.connect(),
        "Database",
        30000
      );
      logger.info(`✅ Database connected in ${Date.now() - dbStartTime}ms`);

      // Step 3: Connect to Redis with timeout
      logger.info("⚙️  Step 3: Connecting to Redis...");
      const redisStartTime = Date.now();
      await this.connectWithTimeout(
        redisClient.connect(),
        "Redis",
        30000
      );
      logger.info(`✅ Redis connected in ${Date.now() - redisStartTime}ms`);

      // Step 4: Start background workers
      logger.info("⚙️  Step 4: Starting background workers...");
      workerManager.start();
      logger.info("✅ Workers started");

      // Step 5: Create Express app
      logger.info("⚙️  Step 5: Initializing Express application...");
      const app = createApp();
      logger.info("✅ Express app initialized");

      // Step 6: Start HTTP server
      logger.info("⚙️  Step 6: Starting HTTP server...");
      await this.startHttpServer(app);
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();

      // Log success info
      this.logStartupInfo();

      logger.info("✅ Application started successfully!");
      logger.info("================================================\n");

    } catch (error) {
      logger.error("❌ Failed to start server:", {
        message: error.message,
        stack: error.stack
      });
      // Don't kill the process immediately, try to stay alive for logs
      logger.error("⚠️ Critical Failure. Server NOT started.");
    }
  }

  /**
   * Connect with timeout protection
   */
  async connectWithTimeout(promise, name, timeout) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`${name} connection timeout after ${timeout}ms`)),
          timeout
        )
      )
    ]);
  }

  /**
   * Start HTTP server
   */
  async startHttpServer(app) {
    return new Promise((resolve, reject) => {
      const PORT = process.env.PORT || 5000;
      
      this.server = app.listen(PORT, '0.0.0.0', (err) => {
        if (err) {
          logger.error("❌ Failed to start HTTP server:", err);
          reject(err);
        } else {
          logger.info(`✅ Server running on port ${PORT}`);
          resolve();
        }
      });

      // Handle server errors
      this.server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`❌ Port ${PORT} is already in use`);
        } else {
          logger.error("❌ Server error:", error);
        }
        reject(error);
      });
    });
  }

  /**
   * Setup graceful shutdown handlers
   */
  setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      if (this.isShuttingDown) return;

      logger.info(`\n📴 ${signal} received. Starting graceful shutdown...`);
      this.isShuttingDown = true;

      try {
        if (this.server) {
          logger.info("🔌 Closing HTTP server...");
          await new Promise((resolve) => this.server.close(resolve));
          logger.info("✅ HTTP server closed");
        }

        logger.info("🔌 Closing connections...");
        await workerManager.stop();
        await redisClient.disconnect();
        await database.disconnect();
        
        logger.info("✅ Graceful shutdown completed");
        process.exit(0);
      } catch (error) {
        logger.error("❌ Error during shutdown:", error);
        process.exit(1);
      }
    };

    process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.once("SIGINT", () => gracefulShutdown("SIGINT"));
  }

  /**
   * Log startup information
   */
  logStartupInfo() {
    const PORT = process.env.PORT || 5000;
    logger.info("\n" + "=".repeat(60));
    logger.info("🎉 APPLICATION READY");
    logger.info(`🚀 Server: ${process.env.APP_URL || `http://localhost:${PORT}`}`);
    logger.info(`🗄️  Database: ${database.isConnected() ? "✅ Connected" : "❌ Disconnected"}`);
    logger.info(`⚡ Redis: ${redisClient.getCache()?.isOpen ? "✅ Connected" : "❌ Disconnected"}`);
    logger.info(`📝 Health: ${process.env.APP_URL || `http://localhost:${PORT}`}/health`);
    logger.info("=".repeat(60) + "\n");
  }
}

// Create and start server
const bootstrap = new ServerBootstrap();
bootstrap.start(); // Start immediately