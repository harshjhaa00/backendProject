// src/routes/user.routes.js
// Protected user routes.

import { Router } from 'express';
import { getProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/profile', authenticate, getProfile);

export default router;

