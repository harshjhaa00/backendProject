// src/routes/auth.routes.js
// Auth endpoints with validation and rate limiting.

import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, logout } from '../controllers/authController.js';
import { validate } from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.use(authRateLimiter);

const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must be between 2 and 120 characters.'),
  body('email').isEmail().withMessage('Email must be valid.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter.')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter.')
    .matches(/\d/)
    .withMessage('Password must contain a number.'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Email must be valid.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;

