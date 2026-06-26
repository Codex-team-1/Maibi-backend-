import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { nextProductId } from './counter.service.js';
import { uploadMany, destroyByPublicId } from './cloudinary.service.js';
import { parsePagination, paginate, type Paginated } from '../utils/pagination.js';
import { toProductDTO, toAdminProductDTO } from '../utils/serialize.js';
import type { ProductDTO, AdminProductDTO } from '../types/dto.js';
import type {
  ProductListQuery,
  AdminProductListQuery,
  CreateProductBody,
  UpdateProductBody,
} from '../validators/product.schema.js';

const MAX_IMAGES = 10;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ─────────────────────────────  Public storefront  ───────────────────────── */

export type PublicProductDetail = ProductDTO;

export async function listPublicProducts(q: ProductListQuery): Promise<Paginated<ProductDTO>> {
  const filter: Record<string, unknown> = { active: true };
  if (q.category?.length)   filter.category   = { $in: q.category };
  if (q.badgeLabel?.length) filter.badgeLabel  = { $in: q.badgeLabel };
  if (q.inStock === 'true') filter.inStock     = true;
  if (q.q) filter.name = { $regex: escapeRegex(q.q), $options: 'i' };

  const { page, limit, skip } = parsePagination(q.page, q.limit);

  const [docs, total] = await Promise.all([
    Product.find(filter).sort(publicSort(q.sort)).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return paginate(docs.map(toProductDTO), total, page, limit);
}

export async function getPublicProduct(id: number): Promise<PublicProductDetail> {
  const product = await Product.findOne({ id, active: true }).lean();
  if (!product) throw AppError.notFound('Product not found');
  return toProductDTO(product);
}

export async function getFeaturedProducts(limit = 8): Promise<ProductDTO[]> {
  const docs = await Product.find({ active: true, promoted: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(toProductDTO);
}

export async function getNewProducts(limit = 8): Promise<ProductDTO[]> {
  const docs = await Product.find({ active: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(toProductDTO);
}

function publicSort(sort?: ProductListQuery['sort']): Record<string, 1 | -1> {
  switch (sort) {
    case 'price-asc':  return { price: 1 };
    case 'price-desc': return { price: -1 };
    case 'new':        return { createdAt: -1 };
    case 'limited':    return { stock: 1 };
    case 'featured':
    default:           return { promoted: -1, createdAt: -1 };
  }
}

/* ───────────────────────────────  Admin CRUD  ─────────────────────────────── */

export async function listAdminProducts(q: AdminProductListQuery): Promise<Paginated<AdminProductDTO>> {
  const filter: Record<string, unknown> = {};
  if (q.category) filter.category = q.category;
  if (q.active)   filter.active   = q.active === 'true';
  if (q.q)        filter.name     = { $regex: escapeRegex(q.q), $options: 'i' };

  const { page, limit, skip } = parsePagination(q.page, q.limit);
  const dir: 1 | -1    = q.order === 'asc' ? 1 : -1;
  const sortField = q.sort === 'new' || !q.sort ? 'createdAt' : q.sort;

  const [docs, total] = await Promise.all([
    Product.find(filter).sort({ [sortField]: dir }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return paginate(docs.map(toAdminProductDTO), total, page, limit);
}

export async function getAdminProduct(id: number): Promise<AdminProductDTO> {
  const product = await Product.findOne({ id }).lean();
  if (!product) throw AppError.notFound('Product not found');
  return toAdminProductDTO(product);
}

export async function createProduct(body: CreateProductBody): Promise<AdminProductDTO> {
  const id = await nextProductId();
  const inStock = body.inStock ?? (body.stock ?? 0) > 0;
  // Default to 'New' when the admin doesn't pick a badge; expiry is handled in the serializer.
  const badgeLabel = body.badgeLabel !== undefined ? body.badgeLabel : 'New';
  const doc = new Product({ ...body, id, inStock, badgeLabel });
  await doc.save();
  return toAdminProductDTO(doc.toObject());
}

export async function updateProduct(id: number, body: UpdateProductBody): Promise<AdminProductDTO> {
  const update: Record<string, unknown> = { ...body };
  // Auto-sync inStock when stock is explicitly set
  if (typeof body.stock === 'number' && body.inStock === undefined) {
    update.inStock = body.stock > 0;
  }

  const product = await Product.findOneAndUpdate({ id }, update, {
    new: true,
    runValidators: true,
  }).lean();
  if (!product) throw AppError.notFound('Product not found');
  return toAdminProductDTO(product);
}

export async function deleteProduct(id: number): Promise<void> {
  const product = await Product.findOneAndDelete({ id }).lean();
  if (!product) throw AppError.notFound('Product not found');
  await Promise.all(
    (product.images ?? []).map((img) => destroyByPublicId(img.publicId)),
  );
}

export async function addImages(id: number, files: Express.Multer.File[]): Promise<AdminProductDTO> {
  if (!files.length) throw AppError.badRequest('No images uploaded');
  const product = await Product.findOne({ id });
  if (!product) throw AppError.notFound('Product not found');

  const available = MAX_IMAGES - product.images.length;
  if (available <= 0) throw AppError.conflict(`A product can have at most ${MAX_IMAGES} images`);

  const results = await uploadMany(files.slice(0, available).map((f) => f.buffer));
  product.images.push(...results);
  await product.save();
  return toAdminProductDTO(product.toObject());
}

export async function removeImage(id: number, idx: number): Promise<AdminProductDTO> {
  const product = await Product.findOne({ id });
  if (!product) throw AppError.notFound('Product not found');
  const [removed] = product.images.splice(idx, 1);
  if (!removed) throw AppError.notFound('Image not found');
  await product.save();
  await destroyByPublicId(removed.publicId);
  return toAdminProductDTO(product.toObject());
}
