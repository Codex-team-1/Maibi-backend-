import type { Request, Response } from 'express';
import { createStoreReview, rateOrderProducts, listApprovedReviews } from '../services/review.service.js';
import { toReviewDTO } from '../utils/serialize.js';
import { validated } from '../middlewares/validate.js';
import type { CreateReviewBody, OrderRatingBody } from '../validators/review.schema.js';

/**
 * Global store rating from the popup. Creates the store review and, when the
 * review is tied to an order, also applies the rating to that order's products.
 */
export async function postStoreReview(req: Request, res: Response): Promise<void> {
  const body = validated<CreateReviewBody>(req);
  const review = await createStoreReview(body);
  if (body.orderCode) {
    await rateOrderProducts(body.orderCode, body.rating);
  }
  res.status(201).json(toReviewDTO(review.toObject()));
}

/** Dedicated order-product rating endpoint. */
export async function postOrderRating(req: Request, res: Response): Promise<void> {
  const body = validated<OrderRatingBody>(req);
  const rated = await rateOrderProducts(body.orderCode, body.rating);
  res.status(200).json({ ok: true, rated });
}

/** Approved reviews for the storefront carousel. */
export async function listReviews(_req: Request, res: Response): Promise<void> {
  const docs = await listApprovedReviews();
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ items: docs.map(toReviewDTO) });
}
