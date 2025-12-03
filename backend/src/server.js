require("dotenv").config();
const { validateEnv } = require("./config/env");
const database = require("./config/database");
const redisClient = require("./config/redis");
const createApp = require("./app");
const logger = require("./utils/logger");
const workerManager = require('./workers');

// DEPLOYMENT FIX V5.0.1
class ServerBootstrap {
  constructor() {
    this.server = null;
    this.isShuttingDown = false;
  }

  async start() {
    try {
      logger.info("🚀 Initializing Social Media Platform...");

      // 1. CREATE APP & START HTTP SERVER IMMEDIATELY
      // This ensures Azure sees the app as "Healthy" instantly
      const app = createApp();
      await this.startHttpServer(app);

      // 2. Validate Env
      try {
        validateEnv();
      } catch (e) {
        logger.error("❌ Environment Validation Failed:", e.message);
        // We don't exit, we let the logs show the error
      }

      // 3. Connect Databases (Background)
      this.connectServices();

    } catch (error) {
      logger.error("❌ Fatal Error during startup:", error);
      process.exit(1);
    }
  }

  async connectServices() {
    try {
      // MongoDB
      logger.info("🔌 Connecting to MongoDB...");
      await database.connect();
      logger.info("✅ MongoDB Connected");

      // Redis
      logger.info("🔌 Connecting to Redis...");
      await redisClient.connect();
      logger.info("✅ Redis Connected");

      // Workers
      logger.info("👷 Starting Workers...");
      workerManager.start();
      logger.info("✅ Workers Running");
      
      this.logStartupInfo();

    } catch (error) {
      logger.error("❌ Service Connection Failed:", error.message);
      // We do NOT exit here. This allows you to see the logs in Azure.
    }
  }

  async startHttpServer(app) {
    return new Promise((resolve, reject) => {
      const PORT = process.env.PORT || 5000;
      this.server = app.listen(PORT, '0.0.0.0', (err) => {
        if (err) return reject(err);
        logger.info(`✅ HTTP Server listening on port ${PORT}`);
        resolve();
      });
    });
  }

  logStartupInfo() {
    logger.info(`
    ================================================
    🎉 FULLY STARTED
    🚀 URL: ${process.env.APP_URL}
    ================================================
    `);
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
}

const bootstrap = new ServerBootstrap();
bootstrap.start();