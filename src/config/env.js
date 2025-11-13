// src/config/env.js
// Centralized environment variable loading and validation.

import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key, fallback = undefined) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
};

const parseCorsOrigins = (value) => {
  if (!value) return [];
  return value.split(',').map((origin) => origin.trim()).filter(Boolean);
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  get isProduction() {
    return this.nodeEnv === 'production';
  },
  port: Number.parseInt(process.env.PORT ?? '4000', 10),
  mongoUri: getEnv('MONGO_URI', 'mongodb://localhost:27017/backend_project'),
  jwtAccessSecret: getEnv('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: getEnv('JWT_REFRESH_SECRET'),
  accessTokenExpires: getEnv('ACCESS_TOKEN_EXPIRES', '15m'),
  refreshTokenExpires: getEnv('REFRESH_TOKEN_EXPIRES', '7d'),
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN ?? ''),
};




export default env;

