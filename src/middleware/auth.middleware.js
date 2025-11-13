// src/middleware/auth.middleware.js
// Protects routes by validating JWT access tokens.

import User from '../models/User.js';
import { verifyAccessToken } from '../utils/token.util.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.sub);
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ message: 'Token invalid or expired.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed.' });
  }
};

export default authenticate;

