import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/auth.js';
import {
  summary,
  revenue,
  categories,
  topProducts,
  activity,
  overview,
  lowStock,
} from '../controllers/analytics.controller.js';

export const adminAnalyticsRoutes = Router();

adminAnalyticsRoutes.use(requireAuth);

adminAnalyticsRoutes.get('/', asyncHandler(overview));
adminAnalyticsRoutes.get('/summary', asyncHandler(summary));
adminAnalyticsRoutes.get('/revenue', asyncHandler(revenue));
adminAnalyticsRoutes.get('/categories', asyncHandler(categories));
adminAnalyticsRoutes.get('/top-products', asyncHandler(topProducts));
adminAnalyticsRoutes.get('/activity', asyncHandler(activity));
adminAnalyticsRoutes.get('/low-stock', asyncHandler(lowStock));
