import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middlewares/validate.js';
import { productListQuery } from '../validators/product.schema.js';
import { productIdParam } from '../validators/common.schema.js';
import {
  listProducts,
  getProduct,
  featuredProducts,
  newProducts,
} from '../controllers/products.public.controller.js';

export const productPublicRoutes = Router();

productPublicRoutes.get('/featured', asyncHandler(featuredProducts));
productPublicRoutes.get('/new', asyncHandler(newProducts));
productPublicRoutes.get('/', validate(productListQuery, 'query'), asyncHandler(listProducts));
productPublicRoutes.get('/:id', validate(productIdParam, 'params'), asyncHandler(getProduct));
