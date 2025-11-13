// src/middleware/rateLimiter.middleware.js
// Centralized rate limiter instances.

import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again later.',
  },
});

export default {
  authRateLimiter,
};

