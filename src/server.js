// src/server.js
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import env from './config/env.js';
import connectDB, { registerDbEvents, setupGracefulShutdown } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import apiRoutes from './routes/api.routes.js';
import { registerLoggerMiddleware } from './middleware/logger.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

// Fix this for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Logger
registerLoggerMiddleware(app);

// CORS config
const corsOrigins = env.corsOrigins;
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!corsOrigins.length || corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Correct static folder: "public"
const publicDir = path.resolve(__dirname, '..', 'public');
app.use(express.static(publicDir));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', apiRoutes);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Errors
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
export const startServer = async () => {
  await connectDB();
  registerDbEvents();

  const server = app.listen(env.port, () => {
    console.log(`🚀 Server listening on port ${env.port}`);
  });

  setupGracefulShutdown(server);
  return server;
};

if (env.nodeEnv !== 'test') {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default app;
