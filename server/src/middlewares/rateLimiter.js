const rateLimit = require('express-rate-limit');

// API rate limiter (in-memory)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
});

// Publishing rate limiter
const publishLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Publishing rate limit exceeded.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  publishLimiter,
};