import { z } from 'zod';
import { PAYMENT_METHOD_IDS, ORDER_STATUSES, PAYMENT_STATUSES } from '../constants/enums.js';
import { paginationQuery } from './common.schema.js';

const checkoutItem = z.object({
  productId: z.number().int().positive(),
  qty: z.number().int().min(1),
  size: z.string().min(1),
  color: z.string().optional(),
  price: z.number().min(0), // client-stated; server re-derives from DB
});

const card = z
  .object({
    number: z.string().optional(),
    name: z.string().optional(),
    expiry: z.string().optional(),
    cvv: z.string().optional(),
  })
  .optional();

/** Checkout payload from the storefront. Totals are validated for shape but
   recomputed server-side from DB prices. */
export const checkoutBody = z.object({
  items: z.array(checkoutItem).min(1),
  shipping: z.object({
    email: z.string().email(),
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    phone: z.string().trim().min(1),
    address: z.string().trim().min(1),
    city: z.string().trim().min(1),
    wilaya: z.string().trim().min(1),
    shippingType: z.enum(['home', 'desk']),
    shippingFee: z.number().min(0).optional(),
    notes: z.string().trim().optional(),
  }),
  payment: z.object({
    method: z.enum(PAYMENT_METHOD_IDS),
    card,
  }),
  subtotal: z.number().min(0).optional(),
  shippingFee: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
});
export type CheckoutBody = z.infer<typeof checkoutBody>;

/** Admin order list filters. */
export const adminOrderListQuery = paginationQuery.extend({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  q: z.string().trim().min(1).optional(),
});
export type AdminOrderListQuery = z.infer<typeof adminOrderListQuery>;

/** Admin order patch. */
export const adminOrderPatch = z
  .object({
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
    note: z.string().optional(),
    shippingFee: z.number().min(0).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });
export type AdminOrderPatch = z.infer<typeof adminOrderPatch>;
