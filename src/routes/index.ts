import { Router } from 'express';
import { productPublicRoutes } from './public.products.routes.js';
import { orderPublicRoutes } from './public.orders.routes.js';
import { customOrderPublicRoutes } from './public.customOrders.routes.js';
import { reviewPublicRoutes } from './public.reviews.routes.js';
import { configRoutes } from './config.routes.js';
import { authRoutes } from './auth.routes.js';
import { adminProductRoutes } from './admin.products.routes.js';
import { adminOrderRoutes } from './admin.js';
import { adminAnalyticsRoutes } from './admin.analytics.routes.js';
import { adminProfileRoutes } from './admin.profile.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Public storefront
apiRouter.use('/products', productPublicRoutes);
apiRouter.use('/orders', orderPublicRoutes);
apiRouter.use('/custom-orders', customOrderPublicRoutes);
apiRouter.use('/reviews', reviewPublicRoutes);
apiRouter.use('/config', configRoutes);

// Auth
apiRouter.use('/auth', authRoutes);

// Admin (each router applies requireAuth)
apiRouter.use('/admin/products', adminProductRoutes);
apiRouter.use('/admin/analytics', adminAnalyticsRoutes);
apiRouter.use('/admin/profile', adminProfileRoutes);
// adminOrderRoutes declares /orders/* and /custom-orders/* internally.
apiRouter.use('/admin', adminOrderRoutes);
