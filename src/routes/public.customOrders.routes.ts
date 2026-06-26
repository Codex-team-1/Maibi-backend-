import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middlewares/validate.js';
import { referenceImageUpload } from '../middlewares/upload.js';
import { customOrderSubmit } from '../validators/customOrder.schema.js';
import { submitCustomOrder } from '../controllers/customOrders.public.controller.js';

export const customOrderPublicRoutes = Router();

// multer first (parses multipart text fields + file), then validate the text.
customOrderPublicRoutes.post(
  '/',
  referenceImageUpload,
  validate(customOrderSubmit),
  asyncHandler(submitCustomOrder),
);
