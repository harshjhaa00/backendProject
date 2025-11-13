// src/routes/api.routes.js
// Public API routes for health messages and demo submissions.

import { Router } from 'express';
import { body } from 'express-validator';
import { getHealthMessage, submitMessage } from '../controllers/messageController.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.get('/message', getHealthMessage);

router.post(
  '/submit',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
    body('message').trim().isLength({ min: 5 }).withMessage('Message must be at least 5 characters.'),
  ]),
  submitMessage
);

export default router;

