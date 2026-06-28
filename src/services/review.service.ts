import { Review, type ReviewDocument } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import type { CreateReviewBody } from '../validators/review.schema.js';

/** Look up a delivered order by its code, or throw a clear error. */
async function loadDeliveredOrder(orderCode: string) {
  const order = await Order.findOne({ code: orderCode }).lean();
  if (!order) throw AppError.notFound('Order not found');
  if (order.status !== 'delivered') {
    throw AppError.conflict('Only delivered orders can be rated');
  }
  return order;
}

/**
 * Apply a rating to every distinct product in a delivered order, updating each
 * product's aggregate (count, sum, recomputed average). Returns how many
 * distinct products were rated.
 */
export async function rateOrderProducts(orderCode: string, rating: number): Promise<number> {
  const order = await loadDeliveredOrder(orderCode);
  const productIds = [...new Set(order.items.map((i) => i.productId).filter((id): id is number => id != null))];

  await Promise.all(
    productIds.map((id) =>
      // Single atomic pipeline update: increment count+sum then recompute avg.
      Product.updateOne({ id }, [
        {
          $set: {
            'rating.ratingCount': { $add: ['$rating.ratingCount', 1] },
            'rating.ratingSum': { $add: ['$rating.ratingSum', rating] },
          },
        },
        {
          $set: {
            'rating.ratingAvg': {
              $cond: [
                { $gt: ['$rating.ratingCount', 0] },
                { $divide: ['$rating.ratingSum', '$rating.ratingCount'] },
                0,
              ],
            },
          },
        },
      ]),
    ),
  );

  return productIds.length;
}

/**
 * Create a global store review. When an `orderCode` is supplied the order must
 * be delivered, and the same `orderCode` cannot be reviewed twice (guards
 * against double rating from re-opening the email link).
 */
export async function createStoreReview(
  input: CreateReviewBody,
): Promise<{ review: ReviewDocument; alreadyExisted: boolean }> {
  if (input.orderCode) {
    await loadDeliveredOrder(input.orderCode);
    const existing = await Review.findOne({ orderCode: input.orderCode });
    if (existing) return { review: existing, alreadyExisted: true };
  }

  const review = await Review.create({
    name: input.name,
    wilaya: input.wilaya,
    comment: input.comment,
    rating: input.rating,
    orderCode: input.orderCode ?? null,
  });
  return { review, alreadyExisted: false };
}

/** Approved reviews for the storefront carousel, newest first. */
export async function listApprovedReviews(limit = 30) {
  return Review.find({ approved: true }).sort({ createdAt: -1 }).limit(limit).lean();
}
