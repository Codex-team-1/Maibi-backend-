import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { profileBody } from '../validators/auth.schema.js';
import { updateProfile } from '../controllers/profile.controller.js';

export const adminProfileRoutes = Router();

adminProfileRoutes.use(requireAuth);

adminProfileRoutes.patch('/', validate(profileBody), asyncHandler(updateProfile));
