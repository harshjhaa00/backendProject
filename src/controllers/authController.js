// src/controllers/authController.js
// Handles registration, login, refresh token rotation, and logout.

import User from '../models/User.js';
import { env } from '../config/env.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../utils/token.util.js';

const buildAuthPayload = (user) => {
  const payload = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    tokens: {},
  };

  const tokenPayload = { sub: user.id, tokenVersion: user.tokenVersion };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  payload.tokens = {
    accessToken,
    expiresIn: env.accessTokenExpires,
  };

  payload.refreshToken = refreshToken;
  return payload;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const user = await User.create({ name, email, password });
    const authPayload = buildAuthPayload(user);

    setRefreshTokenCookie(res, authPayload.refreshToken);

    return res.status(201).json({
      user: authPayload.user,
      tokens: authPayload.tokens,
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordValid = await user.comparePassword(password);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const authPayload = buildAuthPayload(user);
    setRefreshTokenCookie(res, authPayload.refreshToken);

    return res.status(200).json({
      user: authPayload.user,
      tokens: authPayload.tokens,
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token missing.' });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.sub);

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: 'Refresh token invalid.' });
    }

    const authPayload = buildAuthPayload(user);
    setRefreshTokenCookie(res, authPayload.refreshToken);

    return res.status(200).json({
      user: authPayload.user,
      tokens: authPayload.tokens,
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        const user = await User.findById(decoded.sub);
        if (user) {
          user.tokenVersion += 1;
          await user.save();
        }
      } catch (err) {
        // Ignore token verification errors during logout.
      }
    }

    clearRefreshTokenCookie(res);
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    return next(error);
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
};

