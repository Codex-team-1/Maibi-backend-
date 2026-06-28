import type { Request, Response } from 'express';
import {
  getSummary,
  getRevenueSeries,
  getCategorySplit,
  getTopProducts,
  getRecentActivity,
  getLowStockProducts,
} from '../services/analytics.service.js';

const noStore = (res: Response) => res.set('Cache-Control', 'no-store');

export async function summary(_req: Request, res: Response): Promise<void> {
  noStore(res);
  res.json(await getSummary());
}

export async function revenue(_req: Request, res: Response): Promise<void> {
  noStore(res);
  res.json(await getRevenueSeries(14));
}

export async function categories(_req: Request, res: Response): Promise<void> {
  noStore(res);
  res.json(await getCategorySplit());
}

export async function topProducts(_req: Request, res: Response): Promise<void> {
  noStore(res);
  res.json(await getTopProducts(5));
}

export async function activity(_req: Request, res: Response): Promise<void> {
  noStore(res);
  res.json(await getRecentActivity(8));
}

export async function lowStock(_req: Request, res: Response): Promise<void> {
  noStore(res);
  res.json(await getLowStockProducts());
}

/** Combined dashboard payload — one round-trip for the admin home. */
export async function overview(_req: Request, res: Response): Promise<void> {
  noStore(res);
  const [summaryStats, revenuePoints, categorySplit, top, recent] = await Promise.all([
    getSummary(),
    getRevenueSeries(14),
    getCategorySplit(),
    getTopProducts(5),
    getRecentActivity(8),
  ]);
  res.json({ summary: summaryStats, revenue: revenuePoints, categories: categorySplit, topProducts: top, activity: recent });
}
