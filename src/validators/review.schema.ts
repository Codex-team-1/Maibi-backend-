import { z } from 'zod';

/** Public store review submitted from the rating popup. */
export const createReviewBody = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  wilaya: z.string().trim().min(1, 'Wilaya is required'),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10, 'Comment must be at least 10 characters'),
  orderCode: z.string().trim().min(1).optional(),
});
export type CreateReviewBody = z.infer<typeof createReviewBody>;

/** Dedicated order-product rating payload. */
export const orderRatingBody = z.object({
  orderCode: z.string().trim().min(1, 'Order code is required'),
  rating: z.coerce.number().int().min(1).max(5),
});
export type OrderRatingBody = z.infer<typeof orderRatingBody>;
