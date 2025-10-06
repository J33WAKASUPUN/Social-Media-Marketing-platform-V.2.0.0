const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Environment Variables Schema
 */
const envSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  APP_NAME: Joi.string().required(),
  APP_PORT: Joi.number().default(5000),
  APP_URL: Joi.string().uri().required(),
  CLIENT_URL: Joi.string().uri().required(),

  // MongoDB
  MONGODB_URI: Joi.string().required(),
  MONGODB_DB_NAME: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().default('127.0.0.1'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB_CACHE: Joi.number().default(0),
  REDIS_DB_SESSION: Joi.number().default(1),
  REDIS_DB_QUEUE: Joi.number().default(2),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('2h'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Google OAuth
  GOOGLE_AUTH_CLIENT_ID: Joi.string().optional(),
  GOOGLE_AUTH_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_AUTH_CALLBACK_URL: Joi.string().uri().optional(),

  // Session
  SESSION_SECRET: Joi.string().min(32).required(),
  SESSION_LIFETIME: Joi.number().default(7200000),
  SESSION_SECURE: Joi.boolean().default(false),

  // File Upload
  UPLOAD_DIR: Joi.string().default('uploads'),
  MAX_FILE_SIZE: Joi.number().default(10485760),

  // Email
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().required(),
  MAIL_USER: Joi.string().email().required(),
  MAIL_PASSWORD: Joi.string().required(),

  // Social Media
  LINKEDIN_CLIENT_ID: Joi.string().optional(),
  LINKEDIN_CLIENT_SECRET: Joi.string().optional(),
  FACEBOOK_APP_ID: Joi.string().optional(),
  FACEBOOK_APP_SECRET: Joi.string().optional(),

  // Features
  ENABLE_EMAIL_NOTIFICATIONS: Joi.boolean().default(true),
  ENABLE_QUEUE_PROCESSING: Joi.boolean().default(true),
  RATE_LIMIT_ENABLED: Joi.boolean().default(true),

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
}).unknown(true); // Allow other env variables

/**
 * Validate environment variables
 */
function validateEnv() {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: false,
  });

  if (error) {
    logger.error('❌ Environment validation failed:');
    error.details.forEach((detail) => {
      logger.error(`   - ${detail.message}`);
    });
    process.exit(1);
  }

  logger.info('✅ Environment variables validated');
  return value;
}

module.exports = { validateEnv };
