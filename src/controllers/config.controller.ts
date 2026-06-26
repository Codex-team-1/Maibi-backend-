import type { Request, Response } from 'express';
import { WILAYAS } from '../constants/wilayas.js';
import { PAYMENT_METHODS } from '../constants/paymentMethods.js';
import { COLOR_PALETTE } from '../constants/colors.js';
import { CATEGORIES } from '../constants/categories.js';

/** Static storefront configuration — long-cacheable. */
export function getConfig(_req: Request, res: Response): void {
  res.set('Cache-Control', 'no-store');
  res.json({
    wilayas: WILAYAS,
    paymentMethods: PAYMENT_METHODS,
    colors: COLOR_PALETTE,
    categories: CATEGORIES,
  });
}
