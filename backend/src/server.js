require("dotenv").config();
const { validateEnv } = require("./config/env");
const database = require("./config/database");
const redisClient = require("./config/redis");
const createApp = require("./app");
const logger = require("./utils/logger");
const workerManager = require('./workers');

// CRITICAL FIX: Start HTTP server FIRST, connect to services in background
class ServerBootstrap {
  constructor() {
    this.server = null;
    this.isShuttingDown = false;
    this.servicesReady = false;
  }

  async start() {
    try {
      logger.info("🚀 Initializing Social Media Platform...");

      // 1. Validate Environment (non-blocking)
      try {
        validateEnv();
        logger.info("✅ Environment validated");
      } catch (error) {
        logger.error("⚠️ Environment validation failed:", error.message);
        // Continue anyway - let health checks show the issue
      }

      // 2. Create Express app
      const app = createApp();
      
      // 3. START HTTP SERVER IMMEDIATELY (CRITICAL for Azure)
      await this.startHttpServer(app);
      logger.info("✅ HTTP Server is LIVE - Azure health checks will pass");

      // 4. Connect to external services in the background
      this.connectServicesInBackground();

      // 5. Setup graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error("❌ FATAL ERROR during startup:", error);
      process.exit(1);
    }
  }

  /**
   * Starts HTTP server immediately (non-blocking)
   */
  async startHttpServer(app) {
    return new Promise((resolve, reject) => {
      const PORT = process.env.PORT || 5000;
      const HOST = '0.0.0.0'; // Critical for Docker/Azure
      
      this.server = app.listen(PORT, HOST, (err) => {
        if (err) {
          logger.error("❌ Failed to start HTTP server:", err);
          return reject(err);
        }
        
        logger.info(`
╔════════════════════════════════════════════════╗
║  ✅ HTTP SERVER STARTED                        ║
║  📍 Port: ${PORT}                              ║
║  🌐 Host: ${HOST}                              ║
║  🏥 Health: /health, /ready, /ping            ║
╚════════════════════════════════════════════════╝
        `);
        
        resolve();
      });

      // Handle server errors
      this.server.on('error', (error) => {
        logger.error("❌ Server error:", error);
        reject(error);
      });
    });
  }

  /**
   * Connect to MongoDB, Redis, and Workers in the background
   * This does NOT block the HTTP server from starting
   */
  connectServicesInBackground() {
    // Use setImmediate to ensure this runs AFTER the server is listening
    setImmediate(async () => {
      try {
        logger.info("🔄 Connecting to external services...");

        // MongoDB with timeout protection
        try {
          logger.info("🔌 Connecting to MongoDB...");
          await this.withTimeout(
            database.connect(),
            30000,
            "MongoDB connection timeout"
          );
          logger.info("✅ MongoDB Connected");
        } catch (error) {
          logger.error("❌ MongoDB connection failed:", error.message);
          logger.error("⚠️ App will run in degraded mode without MongoDB");
        }

        // Redis with timeout protection
        try {
          logger.info("🔌 Connecting to Redis...");
          await this.withTimeout(
            redisClient.connect(),
            30000,
            "Redis connection timeout"
          );
          logger.info("✅ Redis Connected");
        } catch (error) {
          logger.error("❌ Redis connection failed:", error.message);
          logger.error("⚠️ App will run in degraded mode without Redis");
        }

        // Workers (only if Redis is connected)
        if (redisClient.getCache()?.isOpen) {
          try {
            logger.info("👷 Starting background workers...");
            workerManager.start();
            logger.info("✅ Workers started");
          } catch (error) {
            logger.error("❌ Worker startup failed:", error.message);
          }
        } else {
          logger.warn("⚠️ Skipping workers - Redis not available");
        }

        this.servicesReady = true;
        this.logFullStartup();

      } catch (error) {
        logger.error("❌ Background service connection error:", error);
        logger.warn("⚠️ App running in degraded mode");
      }
    });
  }

  /**
   * Helper: Wrap promise with timeout
   */
  withTimeout(promise, timeoutMs, errorMessage) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      )
    ]);
  }

  /**
   * Log final startup information
   */
  logFullStartup() {
    const mongoStatus = database.isConnected() ? '✅' : '❌';
    const redisStatus = redisClient.getCache()?.isOpen ? '✅' : '❌';
    
    logger.info(`
╔════════════════════════════════════════════════╗
║  🎉 PLATFORM FULLY INITIALIZED                 ║
║                                                ║
║  🌐 URL: ${process.env.APP_URL || 'http://localhost:5000'}
║  ${mongoStatus} MongoDB: ${database.isConnected() ? 'Connected' : 'Disconnected'}
║  ${redisStatus} Redis:   ${redisClient.getCache()?.isOpen ? 'Connected' : 'Disconnected'}
║                                                ║
║  📊 Environment: ${process.env.NODE_ENV || 'development'}
║  🔧 Version: 2.0.0                            ║
╚════════════════════════════════════════════════╝
    `);
  }

  /**
   * Graceful shutdown handler
   */
  setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      if (this.isShuttingDown) {
        logger.warn("⚠️ Shutdown already in progress...");
        return;
      }

      logger.info(`\n📴 Received ${signal}. Starting graceful shutdown...`);
      this.isShuttingDown = true;

      try {
        // 1. Stop accepting new requests
        if (this.server) {
          logger.info("🔌 Closing HTTP server...");
          await new Promise((resolve) => {
            this.server.close(resolve);
          });
          logger.info("✅ HTTP server closed");
        }

        // 2. Stop workers
        logger.info("👷 Stopping workers...");
        await workerManager.stop().catch(err => {
          logger.error("Error stopping workers:", err.message);
        });

        // 3. Close Redis
        logger.info("🔌 Closing Redis connection...");
        await redisClient.disconnect().catch(err => {
          logger.error("Error closing Redis:", err.message);
        });

        // 4. Close MongoDB
        logger.info("🔌 Closing MongoDB connection...");
        await database.disconnect().catch(err => {
          logger.error("Error closing MongoDB:", err.message);
        });

        logger.info("✅ Graceful shutdown completed");
        process.exit(0);

      } catch (error) {
        logger.error("❌ Error during shutdown:", error);
        process.exit(1);
      }
    };

    // Register signal handlers
    process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.once("SIGINT", () => gracefulShutdown("SIGINT"));
    
    // Handle uncaught errors
    process.on("uncaughtException", (error) => {
      logger.error("❌ Uncaught Exception:", error);
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("UNHANDLED_REJECTION");
    });
  }
}

// ============================================
// START THE SERVER
// ============================================
const bootstrap = new ServerBootstrap();
bootstrap.start().catch((error) => {
  logger.error("❌ Failed to start server:", error);
  process.exit(1);
});