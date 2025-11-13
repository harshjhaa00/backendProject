// src/config/db.js
// MongoDB connection management with graceful shutdown.

import mongoose from 'mongoose';
import env from './env.js';

mongoose.set('strictQuery', true);

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return mongoose.connection;

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }

  return mongoose.connection;
};

const closeConnection = async () => {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.connection.close();
  console.log('🛑 MongoDB disconnected');
};

export const registerDbEvents = () => {
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB error:', error);
  });
};

export const setupGracefulShutdown = (server) => {
  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    await closeConnection();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
      shutdown(signal);
    });
  });
};

export default connectDB;

