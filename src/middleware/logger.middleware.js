// src/middleware/logger.middleware.js
// Logging strategy for development and production environments.

import morgan from 'morgan';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.isProduction ? 'info' : 'debug',
  redact: ['req.headers.authorization', 'res.headers["set-cookie"]'],
});

const morganStream = {
  write: (message) => logger.info(message.trim()),
};

export const registerLoggerMiddleware = (app) => {
  if (env.isProduction) {
    app.use(
      pinoHttp({
        logger,
        autoLogging: true,
        customSuccessMessage: () => 'request completed',
        customErrorMessage: () => 'request errored',
      })
    );
  } else {
    app.use(morgan('dev', { stream: morganStream }));
  }
};

export default {
  logger,
  registerLoggerMiddleware,
};

