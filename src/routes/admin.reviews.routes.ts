import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/auth.js';
import {
  listAdminReviews,
  deleteAdminReview,
  toggleApproveReview,
} from '../controllers/admin.reviews.controller.js';

export const adminReviewRoutes = Router();

adminReviewRoutes.use(requireAuth);

adminReviewRoutes.get('/', asyncHandler(listAdminReviews));
adminReviewRoutes.delete('/:id', asyncHandler(deleteAdminReview));
adminReviewRoutes.patch('/:id/approve', asyncHandler(toggleApproveReview));
