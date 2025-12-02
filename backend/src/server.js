require("dotenv").config();
const { validateEnv } = require("./config/env");
const database = require("./config/database");
const redisClient = require("./config/redis");
const createApp = require("./app");
const logger = require("./utils/logger");
const workerManager = require('./workers');

async function startServer() {
  try {
    logger.info("🚀 Starting Social Media Marketing Platform API...");
    logger.info("================================================");

    validateEnv();
    await database.connect();
    await redisClient.connect();

    // START WORKERS
    workerManager.start();

    const app = createApp();
    const PORT = process.env.APP_PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info("================================================");
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📍 URL: ${process.env.APP_URL}`);
      logger.info("================================================");
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        await workerManager.stop(); // STOP WORKERS
        await database.disconnect();
        await redisClient.disconnect();

        logger.info("✅ Graceful shutdown completed");
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

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

startServer();