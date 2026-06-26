import { z } from 'zod';
import { CUSTOM_ORDER_STATUSES } from '../constants/enums.js';
import { paginationQuery } from './common.schema.js';

/** Customer custom-order submission. Sent as multipart, so arrays may arrive as
   a JSON string or repeated fields — normalise `colors` accordingly. */
export const customOrderSubmit = z.object({
  customer: z.string().trim().min(1),
  email: z.string().email(),
  phone: z.string().trim().min(1),
  wilaya: z.string().trim().min(1),
  garmentType: z.string().trim().min(1),
  size: z.string().trim().min(1),
  colors: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      if (v === undefined) return [];
      if (Array.isArray(v)) return v;
      try {
        const parsed: unknown = JSON.parse(v);
        return Array.isArray(parsed) ? parsed.map(String) : [v];
      } catch {
        return v.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }),
  notes: z.string().trim().optional().default(''),
  budget: z.string().trim().optional().default(''),
});
export type CustomOrderSubmit = z.infer<typeof customOrderSubmit>;

export const adminCustomListQuery = paginationQuery.extend({
  status: z.enum(CUSTOM_ORDER_STATUSES).optional(),
  q: z.string().trim().min(1).optional(),
});
export type AdminCustomListQuery = z.infer<typeof adminCustomListQuery>;

export const adminCustomPatch = z
  .object({
    status: z.enum(CUSTOM_ORDER_STATUSES).optional(),
    note: z.string().optional(),
    quotedPrice: z.number().min(0).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });
export type AdminCustomPatch = z.infer<typeof adminCustomPatch>;
