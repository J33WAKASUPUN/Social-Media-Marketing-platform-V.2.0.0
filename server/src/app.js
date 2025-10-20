const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
const logger = require("./utils/logger");
const { apiLimiter } = require("./middlewares/rateLimiter");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const database = require("./config/database");
const redisClient = require("./config/redis");

/**
 * Initialize Express Application
 */
function createApp() {
  const app = express();

  // ============================================
  // SECURITY MIDDLEWARE
  // ============================================
  app.use(helmet());
  app.use(mongoSanitize());

  // ============================================
  // CORS CONFIGURATION
  // ============================================
  const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  // ============================================
  // BODY PARSING - SKIP FOR FILE UPLOADS
  // ============================================
  // ⚠️ CRITICAL: Only parse JSON/URL-encoded for non-upload routes
  app.use((req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    
    // Skip body parsing for multipart/form-data (file uploads)
    if (contentType.includes('multipart/form-data')) {
      logger.info('⏭️ Skipping body parser for multipart/form-data', {
        path: req.path,
        method: req.method,
      });
      return next();
    }
    
    // For all other content types, parse JSON and URL-encoded
    express.json({ limit: "10mb" })(req, res, (err) => {
      if (err) return next(err);
      express.urlencoded({ extended: true, limit: "10mb" })(req, res, next);
    });
  });

  // ============================================
  // COMPRESSION
  // ============================================
  app.use(compression());

  // ============================================
  // HTTP REQUEST LOGGING
  // ============================================
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined", { stream: logger.stream }));
  }

  // ============================================
  // SERVE STATIC FILES
  // ============================================
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.use("/uploads/media", (req, res, next) => {
    const filePath = path.join(__dirname, "../uploads/media", req.path);
    const ext = path.extname(req.path).toLowerCase();
    
    // Set proper MIME type for videos
    const mimeTypes = {
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
    };
    
    if (mimeTypes[ext]) {
      res.type(mimeTypes[ext]);
    }
    
    next();
  }, express.static(path.join(__dirname, "../uploads/media")));

  // ============================================
  // HEALTH CHECK ENDPOINT
  // ============================================
  app.get("/health", async (req, res) => {
    const mongoStatus = database.isConnected() ? "connected" : "disconnected";
    const redisStatus = (await redisClient.healthCheck())
      ? "connected"
      : "disconnected";

    const health = {
      status:
        mongoStatus === "connected" && redisStatus === "connected"
          ? "ok"
          : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: "MB",
      },
    };

    const statusCode = health.status === "ok" ? 200 : 503;
    res.status(statusCode).json(health);
  });

  // ============================================
  // API DOCUMENTATION (SWAGGER) - BEFORE API ROUTES
  // ============================================
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // ============================================
  // API ROUTES
  // ============================================
  const authRoutes = require("./routes/auth");
  const organizationRoutes = require("./routes/organizations");
  const brandRoutes = require("./routes/brands");
  const channelRoutes = require("./routes/channels");
  const postRoutes = require("./routes/posts"); 
  const analyticsRoutes = require('./routes/analytics');
  const mediaRoutes = require('./routes/media');
  const notificationRoutes = require('./routes/notifications'); 

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/organizations", organizationRoutes);
  app.use("/api/v1/brands", brandRoutes);
  app.use("/api/v1/channels", channelRoutes);
  app.use("/api/v1/posts", postRoutes);
  app.use("/api", apiLimiter);
  app.use('/api/v1/analytics', analyticsRoutes);
  app.use('/api/v1/media', mediaRoutes);
  app.use('/api/v1/notifications', notificationRoutes);

  // API Info Endpoint
  app.get("/api/v1", (req, res) => {
    res.json({
      message: "Social Media Marketing Platform API",
      version: "2.0.0",
      status: "active",
      endpoints: {
        auth: "/api/v1/auth",
        organizations: "/api/v1/organizations",
        brands: "/api/v1/brands",
        channels: "/api/v1/channels",
        posts: "/api/v1/posts",
        docs: "/api-docs",
      },
    });
  });

  // ============================================
  // 404 HANDLER (MUST BE AFTER ALL ROUTES)
  // ============================================
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      path: req.originalUrl,
    });
  });

  // ============================================
  // GLOBAL ERROR HANDLER
  // ============================================
  app.use((err, req, res, next) => {
    logger.error("Error:", err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
      success: false,
      message: message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  return app;
}

module.exports = createApp;