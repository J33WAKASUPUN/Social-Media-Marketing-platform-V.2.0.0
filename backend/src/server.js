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
      await this.shutdown(1);
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
      const PORT = process.env.APP_PORT || process.env.PORT || 5000;
      
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
      if (this.isShuttingDown) {
        logger.warn("⚠️  Shutdown already in progress...");
        return;
      }

      logger.info(`\n📴 ${signal} received. Starting graceful shutdown...`);
      this.isShuttingDown = true;

      // Set timeout for forced shutdown
      const forceTimeout = setTimeout(() => {
        logger.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 10000);

      try {
        // Close HTTP server (stop accepting new connections)
        if (this.server) {
          logger.info("🔌 Closing HTTP server...");
          await new Promise((resolve) => {
            this.server.close(resolve);
          });
          logger.info("✅ HTTP server closed");
        }

        // Stop background workers
        logger.info("🔌 Stopping workers...");
        await workerManager.stop();
        logger.info("✅ Workers stopped");

        // Close Redis connections
        logger.info("🔌 Closing Redis connections...");
        await redisClient.disconnect();
        logger.info("✅ Redis connections closed");

        // Close database connection
        logger.info("🔌 Closing database connection...");
        await database.disconnect();
        logger.info("✅ Database connection closed");

        clearTimeout(forceTimeout);
        logger.info("✅ Graceful shutdown completed");
        process.exit(0);
      } catch (error) {
        clearTimeout(forceTimeout);
        logger.error("❌ Error during shutdown:", error);
        process.exit(1);
      }
    };

    // Handle termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error("❌ Uncaught Exception:", {
        message: error.message,
        stack: error.stack,
      });
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      logger.error("❌ Unhandled Rejection:", {
        promise: promise,
        reason: reason instanceof Error
          ? { message: reason.message, stack: reason.stack }
          : reason,
      });

      if (process.env.NODE_ENV === "development") {
        logger.warn("⚠️  Server continuing in development mode");
      } else {
        gracefulShutdown("UNHANDLED_REJECTION");
      }
    });
  }

  /**
   * Shutdown the application
   */
  async shutdown(exitCode = 0) {
    try {
      if (this.server) {
        await new Promise((resolve) => this.server.close(resolve));
      }
      await workerManager.stop();
      await redisClient.disconnect();
      await database.disconnect();
      process.exit(exitCode);
    } catch (error) {
      logger.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  }

  /**
   * Log startup information
   */
  logStartupInfo() {
    const PORT = process.env.APP_PORT || process.env.PORT || 5000;
    
    logger.info("\n" + "=".repeat(60));
    logger.info("🎉 APPLICATION READY");
    logger.info("=".repeat(60));
    logger.info(`📦 App: Social Media Marketing Platform`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🚀 Server: ${process.env.APP_URL || `http://localhost:${PORT}`}`);
    logger.info(`💻 Client: ${process.env.CLIENT_URL}`);
    logger.info(`🗄️  Database: ${database.isConnected() ? "✅ Connected" : "❌ Disconnected"}`);
    logger.info(`⚡ Redis: ${redisClient.getCache()?.isOpen ? "✅ Connected" : "❌ Disconnected"}`);
    logger.info(`👷 Workers: ✅ Running`);
    logger.info(`🕐 Started: ${new Date().toISOString()}`);
    logger.info(`📝 Health: ${process.env.APP_URL || `http://localhost:${PORT}`}/health`);
    logger.info(`📚 API Docs: ${process.env.APP_URL || `http://localhost:${PORT}`}/api-docs`);
    logger.info("=".repeat(60) + "\n");
  }
}

// Create and start server
const bootstrap = new ServerBootstrap();

if (require.main === module) {
  bootstrap.start().catch((error) => {
    logger.error("❌ Fatal error during startup:", error);
    process.exit(1);
  });
}

module.exports = bootstrap;