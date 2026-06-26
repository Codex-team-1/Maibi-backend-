import type { Request, Response } from 'express';
import { validated } from '../middlewares/validate.js';
import { numParam } from '../utils/params.js';
import * as productService from '../services/product.service.js';
import type {
  AdminProductListQuery,
  CreateProductBody,
  UpdateProductBody,
} from '../validators/product.schema.js';

export async function listProducts(req: Request, res: Response): Promise<void> {
  const result = await productService.listAdminProducts(validated<AdminProductListQuery>(req));
  res.set('Cache-Control', 'no-store');
  res.json(result);
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  res.json(await productService.getAdminProduct(numParam(req, 'id')));
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const product = await productService.createProduct(validated<CreateProductBody>(req));
  res.status(201).json(product);
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const product = await productService.updateProduct(
    numParam(req, 'id'),
    validated<UpdateProductBody>(req),
  );
  res.json(product);
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  const id = numParam(req, 'id');
  await productService.deleteProduct(id);
  res.json({ ok: true, id });
}

export async function uploadImages(req: Request, res: Response): Promise<void> {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const product = await productService.addImages(numParam(req, 'id'), files);
  res.status(201).json(product);
}

export async function deleteImage(req: Request, res: Response): Promise<void> {
  const product = await productService.removeImage(numParam(req, 'id'), numParam(req, 'idx'));
  res.json(product);
}
