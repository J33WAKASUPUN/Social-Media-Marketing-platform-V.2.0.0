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
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("./config/googleOauth");

/**
 * Initialize Express Application
 */
function createApp() {
  const app = express();

  // ============================================
  // SECURITY MIDDLEWARE
  // ============================================
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
  app.use(mongoSanitize());

  // ============================================
  // CORS CONFIGURATION - ✅ FIXED
  // ============================================
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    process.env.CLIENT_URL
  ].filter(Boolean); // Remove undefined values

  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.warn('🚫 CORS blocked request from:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600, // 10 minutes
  };

  app.use(cors(corsOptions));

  // Handle preflight requests for all routes
  app.options('*', cors(corsOptions));

  // ============================================
  // BODY PARSING
  // ============================================
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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
  // SESSION (REQUIRED FOR PASSPORT)
  // ============================================
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: parseInt(process.env.SESSION_LIFETIME) || 7200,
        touchAfter: 24 * 3600,
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: (parseInt(process.env.SESSION_LIFETIME) || 7200) * 1000,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      },
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // ============================================
  // HEALTH CHECK ENDPOINT
  // ============================================
  app.get("/health", async (req, res) => {
    try {
      const mongoStatus = database.isConnected() ? "connected" : "disconnected";
      
      let redisStatus = "disconnected";
      try {
        redisStatus = (await redisClient.healthCheck()) ? "connected" : "disconnected";
      } catch (error) {
        logger.error('Redis health check failed:', error.message);
      }

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
    } catch (error) {
      logger.error('Health check error:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  });

  // ============================================
  // API DOCUMENTATION (SWAGGER)
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
        analytics: "/api/v1/analytics",
        media: "/api/v1/media",
        notifications: "/api/v1/notifications",
        docs: "/api-docs",
      },
    });
  });

  // ============================================
  // 404 HANDLER
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