// src/middleware/error.middleware.js
// Centralized error responses with consistent JSON structure.

import { env } from '../config/env.js';
import { logger } from './logger.middleware.js';

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
  next();
};

export const errorHandler = (error, req, res, _next) => {
  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Internal server error.';

  if (status >= 500) {
    logger.error({ err: error, path: req.originalUrl }, 'Unhandled server error');
  }

  res.status(status).json({
    message,
    ...(env.isProduction ? null : { stack: error.stack }),
  });
};

export default {
  notFoundHandler,
  errorHandler,
};

