// src/utils/token.util.js
// JWT token generation, verification, and cookie helpers.

import jwt from 'jsonwebtoken';
import ms from 'ms';
import { env } from '../config/env.js';

export const signAccessToken = (payload, options = {}) =>
  jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.accessTokenExpires,
    ...options,
  });

export const signRefreshToken = (payload, options = {}) =>
  jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenExpires,
    ...options,
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);

const refreshCookieName = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'strict',
  path: '/',
};

export const setRefreshTokenCookie = (res, token) => {
  res.cookie(refreshCookieName, token, {
    ...cookieOptions,
    maxAge: ms(env.refreshTokenExpires),
  });
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(refreshCookieName, cookieOptions);
};

export default {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};

