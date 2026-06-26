import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { productPhotosUpload } from '../middlewares/upload.js';
import {
  adminProductListQuery,
  createProductBody,
  updateProductBody,
  photoIndexParam,
} from '../validators/product.schema.js';
import { productIdParam } from '../validators/common.schema.js';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  deleteImage,
} from '../controllers/admin.products.controller.js';

export const adminProductRoutes = Router();

adminProductRoutes.use(requireAuth);

adminProductRoutes.get('/',    validate(adminProductListQuery, 'query'), asyncHandler(listProducts));
adminProductRoutes.post('/',   validate(createProductBody),              asyncHandler(createProduct));
adminProductRoutes.get('/:id', validate(productIdParam, 'params'),       asyncHandler(getProduct));
adminProductRoutes.patch('/:id', validate(updateProductBody),            asyncHandler(updateProduct));
adminProductRoutes.delete('/:id', validate(productIdParam, 'params'),    asyncHandler(deleteProduct));

adminProductRoutes.post('/:id/images', productPhotosUpload, asyncHandler(uploadImages));
adminProductRoutes.delete(
  '/:id/images/:idx',
  validate(photoIndexParam, 'params'),
  asyncHandler(deleteImage),
);
