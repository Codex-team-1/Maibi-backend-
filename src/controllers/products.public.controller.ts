import type { Request, Response } from 'express';
import { validated } from '../middlewares/validate.js';
import { numParam } from '../utils/params.js';
import {
  listPublicProducts,
  getPublicProduct,
  getFeaturedProducts,
  getNewProducts,
} from '../services/product.service.js';
import type { ProductListQuery } from '../validators/product.schema.js';

export async function listProducts(req: Request, res: Response): Promise<void> {
  const result = await listPublicProducts(validated<ProductListQuery>(req));
  res.set('Cache-Control', 'public, max-age=60');
  res.json(result);
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const product = await getPublicProduct(numParam(req, 'id'));
  res.set('Cache-Control', 'public, max-age=60');
  res.json(product);
}

export async function featuredProducts(req: Request, res: Response): Promise<void> {
  const limit = Math.min(Number(req.query.limit) || 8, 20);
  const items = await getFeaturedProducts(limit);
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ items });
}

export async function newProducts(req: Request, res: Response): Promise<void> {
  const limit = Math.min(Number(req.query.limit) || 8, 20);
  const items = await getNewProducts(limit);
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ items });
}
