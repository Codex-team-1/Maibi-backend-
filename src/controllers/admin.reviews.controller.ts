import type { Request, Response } from 'express';
import { Review } from '../models/Review.js';
import { AppError } from '../utils/AppError.js';
import { parsePagination, paginate } from '../utils/pagination.js';
import { param } from '../utils/params.js';

const toAdminReviewDTO = (r: {
  _id: unknown;
  name: string;
  wilaya: string;
  comment: string;
  rating: number;
  orderCode?: string | null;
  approved: boolean;
  createdAt: unknown;
}) => ({
  id: String(r._id),
  name: r.name,
  wilaya: r.wilaya,
  comment: r.comment,
  rating: r.rating,
  orderCode: r.orderCode ?? null,
  approved: r.approved,
  createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
});

/** GET /admin/reviews — list all reviews (newest first) with optional filters */
export async function listAdminReviews(req: Request, res: Response): Promise<void> {
  const q = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};

  if (q.approved === 'true') filter.approved = true;
  else if (q.approved === 'false') filter.approved = false;

  if (q.q) {
    const rx = new RegExp(q.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { wilaya: rx }, { comment: rx }, { orderCode: rx }];
  }

  const { page, limit, skip } = parsePagination(
    q.page ? Number(q.page) : undefined,
    q.limit ? Number(q.limit) : undefined,
  );

  const [docs, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);

  res.set('Cache-Control', 'no-store');
  res.json(paginate(docs.map(toAdminReviewDTO), total, page, limit));
}

/** DELETE /admin/reviews/:id — hard-delete a review */
export async function deleteAdminReview(req: Request, res: Response): Promise<void> {
  const id = param(req, 'id');
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw AppError.notFound('Review not found');
  res.json({ ok: true, id });
}

/** PATCH /admin/reviews/:id/approve — toggle approved flag */
export async function toggleApproveReview(req: Request, res: Response): Promise<void> {
  const id = param(req, 'id');
  const review = await Review.findById(id);
  if (!review) throw AppError.notFound('Review not found');
  review.approved = !review.approved;
  await review.save();
  res.json(toAdminReviewDTO(review.toObject()));
}
