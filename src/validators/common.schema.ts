import { z } from 'zod';

/** Positive-integer product id from a path param. */
export const productIdParam = z.object({
  id: z.coerce.number().int().positive(),
});

/** Order code path param (ORD-0042). */
export const orderCodeParam = z.object({
  id: z.string().regex(/^ORD-\d{4,}$/, 'Invalid order code'),
});

/** Custom-order code path param (CUS-0012). */
export const customCodeParam = z.object({
  id: z.string().regex(/^CUS-\d{4,}$/, 'Invalid custom-order code'),
});

export const paginationQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/** Accepts `?cat=A&cat=B` or `?cat=A` and normalises to a string[]. */
export const csvOrArray = z
  .union([z.string(), z.array(z.string())])
  .transform((v) => (Array.isArray(v) ? v : [v]))
  .optional();
