import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middlewares/validate.js';
import { checkoutBody } from '../validators/order.schema.js';
import { createOrder } from '../controllers/orders.public.controller.js';

export const orderPublicRoutes = Router();

orderPublicRoutes.post('/', validate(checkoutBody), asyncHandler(createOrder));
