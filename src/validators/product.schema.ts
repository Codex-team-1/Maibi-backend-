import { z } from 'zod';
import { CATEGORIES } from '../constants/categories.js';
import { BADGE_LABELS } from '../constants/enums.js';
import { csvOrArray, paginationQuery } from './common.schema.js';

export const SORT_VALUES = ['new', 'price-asc', 'price-desc', 'featured', 'limited'] as const;

/** Public storefront list query. */
export const productListQuery = paginationQuery.extend({
  category: csvOrArray,
  badgeLabel: csvOrArray,
  q: z.string().trim().min(1).optional(),
  sort: z.enum(SORT_VALUES).optional(),
  inStock: z.enum(['true', 'false']).optional(),
});
export type ProductListQuery = z.infer<typeof productListQuery>;

/** Admin list query. */
export const adminProductListQuery = paginationQuery.extend({
  category: z.enum(CATEGORIES).optional(),
  q: z.string().trim().min(1).optional(),
  active: z.enum(['true', 'false']).optional(),
  sort: z.enum(['stock', 'totalSold', 'revenue', 'new']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
export type AdminProductListQuery = z.infer<typeof adminProductListQuery>;

const imageBody = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
});

const discountBody = z.object({
  percent:     z.number().int().min(1).max(99),
  activeUntil: z.string().datetime(),
}).nullable().optional();

export const createProductBody = z.object({
  name:        z.string().trim().min(1),
  price:       z.string().trim().min(1),
  category:    z.enum(CATEGORIES),
  description: z.string().trim().optional(),
  stock:       z.number().int().min(0).default(0),
  inStock:     z.boolean().optional(),
  badgeLabel:  z.enum(BADGE_LABELS).nullable().optional(),
  images:      z.array(imageBody).max(10).optional(),
  sizes:       z.array(z.string().trim().min(1)).optional(),
  colors:      z.array(z.string().trim().min(1)).optional(),
  active:      z.boolean().optional(),
  promoted:    z.boolean().optional(),
  discount:    discountBody,
});
export type CreateProductBody = z.infer<typeof createProductBody>;

export const updateProductBody = z.object({
  name:        z.string().trim().min(1).optional(),
  price:       z.string().trim().min(1).optional(),
  category:    z.enum(CATEGORIES).optional(),
  description: z.string().trim().optional(),
  stock:       z.number().int().min(0).optional(),
  inStock:     z.boolean().optional(),
  badgeLabel:  z.enum(BADGE_LABELS).nullable().optional(),
  images:      z.array(imageBody).max(10).optional(),
  sizes:       z.array(z.string().trim().min(1)).optional(),
  colors:      z.array(z.string().trim().min(1)).optional(),
  active:      z.boolean().optional(),
  promoted:    z.boolean().optional(),
  discount:    discountBody,
});
export type UpdateProductBody = z.infer<typeof updateProductBody>;

export const photoIndexParam = z.object({
  id:  z.coerce.number().int().positive(),
  idx: z.coerce.number().int().min(0).max(9),
});
