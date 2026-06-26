import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middlewares/validate.js';
import { createReviewBody, orderRatingBody } from '../validators/review.schema.js';
import { postStoreReview, postOrderRating, listReviews } from '../controllers/reviews.public.controller.js';

export const reviewPublicRoutes = Router();

reviewPublicRoutes.get('/', asyncHandler(listReviews));
// Global store rating (also rates the order's products when orderCode is present)
reviewPublicRoutes.post('/', validate(createReviewBody), asyncHandler(postStoreReview));
// Dedicated order-product rating
reviewPublicRoutes.post('/order-rating', validate(orderRatingBody), asyncHandler(postOrderRating));
