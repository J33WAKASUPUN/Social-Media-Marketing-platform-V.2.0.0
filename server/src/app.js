/* eslint-disable linebreak-style */
/* eslint-disable padded-blocks */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('./utils/logger');

/**
 * Initialize Express Application
 */
function createApp() {
  const app = express();

  // ============================================
  // SECURITY MIDDLEWARE
  // ============================================
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  // Sanitize MongoDB queries
  app.use(mongoSanitize());

  // ============================================
  // CORS CONFIGURATION
  // ============================================
  const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  app.use(cors(corsOptions));

  // ============================================
  // BODY PARSING
  // ============================================
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ============================================
  // COMPRESSION
  // ============================================
  app.use(compression());

  // ============================================
  // HTTP REQUEST LOGGING
  // ============================================
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', { stream: logger.stream }));
  }

  // ============================================
  // HEALTH CHECK ENDPOINT
  // ============================================
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  });

  // ============================================
  // API ROUTES (TO BE ADDED)
  // ============================================
  app.get('/api/v1', (req, res) => {
    res.json({
      message: 'Social Media Marketing Platform API',
      version: '2.0.0',
      status: 'active',
    });
  });

  // TODO: Import and use route modules
  // app.use('/api/v1/auth', authRoutes);
  // app.use('/api/v1/brands', brandRoutes);
  // app.use('/api/v1/channels', channelRoutes);
  // app.use('/api/v1/posts', postRoutes);
  // app.use('/api/v1/analytics', analyticsRoutes);

  // ============================================
  // 404 HANDLER
  // ============================================
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.originalUrl,
    });
  });

  // ============================================
  // GLOBAL ERROR HANDLER
  // ============================================
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    logger.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  });

  return app;
}

module.exports = createApp;
