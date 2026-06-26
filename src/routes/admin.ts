import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { adminOrderListQuery, adminOrderPatch } from '../validators/order.schema.js';
import { adminCustomListQuery, adminCustomPatch } from '../validators/customOrder.schema.js';
import {
  listOrders,
  getOneOrder,
  patchOrder,
  cancelOrder,
  refundOrder,
  listCustomOrders,
  getOneCustomOrder,
  patchCustomOrder,
  cancelCustomOrder,
  refundCustomOrder,
} from '../controllers/admin.controller.js';

/* Admin orders + custom orders. Mounted at /api/admin, so the paths below
   resolve to /api/admin/orders/* and /api/admin/custom-orders/*. */
export const adminOrderRoutes = Router();

adminOrderRoutes.use(requireAuth);

// ── Orders ──────────────────────────────────────────────────────────────────
adminOrderRoutes.get('/orders', validate(adminOrderListQuery, 'query'), asyncHandler(listOrders));
adminOrderRoutes.get('/orders/:id', asyncHandler(getOneOrder));
adminOrderRoutes.patch('/orders/:id', validate(adminOrderPatch), asyncHandler(patchOrder));
adminOrderRoutes.post('/orders/:id/cancel', asyncHandler(cancelOrder));
adminOrderRoutes.post('/orders/:id/refund', asyncHandler(refundOrder));

// ── Custom orders ─────────────────────────────────────────────────────────────
adminOrderRoutes.get(
  '/custom-orders',
  validate(adminCustomListQuery, 'query'),
  asyncHandler(listCustomOrders),
);
adminOrderRoutes.get('/custom-orders/:id', asyncHandler(getOneCustomOrder));
adminOrderRoutes.patch(
  '/custom-orders/:id',
  validate(adminCustomPatch),
  asyncHandler(patchCustomOrder),
);
adminOrderRoutes.post('/custom-orders/:id/cancel', asyncHandler(cancelCustomOrder));
adminOrderRoutes.post('/custom-orders/:id/refund', asyncHandler(refundCustomOrder));

export default adminOrderRoutes;
