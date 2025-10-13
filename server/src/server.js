require("dotenv").config();
const { validateEnv } = require("./config/env");
const database = require("./config/database");
const redisClient = require("./config/redis");
const createApp = require("./app");
const logger = require("./utils/logger");

/**
 * Start Server
 */
async function startServer() {
  try {
    logger.info("🚀 Starting Social Media Marketing Platform API...");
    logger.info("================================================");

    // Validate environment variables
    validateEnv();

    // Connect to MongoDB
    await database.connect();

    // Connect to Redis
    await redisClient.connect();

    // Create Express app
    const app = createApp();

    // Start listening
    const PORT = process.env.APP_PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info("================================================");
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📍 URL: ${process.env.APP_URL}`);
      logger.info("================================================");
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        // Close database connections
        await database.disconnect();
        await redisClient.disconnect();

        logger.info("✅ Graceful shutdown completed");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
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

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("❌ Unhandled Rejection at:", {
        promise: promise,
        reason:
          reason instanceof Error
            ? {
                message: reason.message,
                stack: reason.stack,
              }
            : reason,
      });

      // DON'T CRASH THE SERVER IMMEDIATELY IN DEVELOPMENT
      if (process.env.NODE_ENV === "development") {
        logger.warn("⚠️ Server continuing in development mode");
      } else {
        gracefulShutdown("UNHANDLED_REJECTION");
      }
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
