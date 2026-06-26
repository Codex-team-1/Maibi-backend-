import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.js';
import { loginBody } from '../validators/auth.schema.js';
import { login, me } from '../controllers/auth.controller.js';

export const authRoutes = Router();

authRoutes.post('/login', validate(loginBody), asyncHandler(login));
authRoutes.get('/me', requireAuth, asyncHandler(me));
