import { Order } from '../models/Order.js';
import { CustomOrder } from '../models/CustomOrder.js';
import { Product } from '../models/Product.js';
import { CATEGORY_COLORS, type Category } from '../constants/categories.js';

const LOW_STOCK_THRESHOLD = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const REVENUE_MATCH = { status: 'delivered' };

function pctGrowth(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  category: string;
  image?: string;
}

export interface SummaryStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  customOrders: number;
  customOrdersGrowth: number;
  avgOrderValue: number;
  aovGrowth: number;
  pendingOrders: number;
  activeProducts: number;
  lowStockProducts: number;
  lowStockList: LowStockProduct[];
  conversionRate: number;
}

export async function getSummary(): Promise<SummaryStats> {
  const now = Date.now();
  const start30 = new Date(now - 30 * DAY_MS);
  const start60 = new Date(now - 60 * DAY_MS);

  const [agg] = await Order.aggregate<{
    current:  { revenue: number; orders: number }[];
    previous: { revenue: number; orders: number }[];
    pending:  { count: number }[];
  }>([
    {
      $facet: {
        current: [
          { $match: { ...REVENUE_MATCH, createdAt: { $gte: start30 } } },
          { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        ],
        previous: [
          { $match: { ...REVENUE_MATCH, createdAt: { $gte: start60, $lt: start30 } } },
          { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        ],
        pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
      },
    },
  ]);

  const cur  = agg?.current[0]  ?? { revenue: 0, orders: 0 };
  const prev = agg?.previous[0] ?? { revenue: 0, orders: 0 };
  const pendingOrders = agg?.pending[0]?.count ?? 0;

  const [totalRevenueAll] = await Order.aggregate<{ revenue: number; orders: number }>([
    { $match: REVENUE_MATCH },
    { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
  ]);

  const [customCur, customPrev, totalCustom, activeProducts, lowStockDocs] = await Promise.all([
    CustomOrder.countDocuments({ createdAt: { $gte: start30 } }),
    CustomOrder.countDocuments({ createdAt: { $gte: start60, $lt: start30 } }),
    CustomOrder.countDocuments({}),
    Product.countDocuments({ active: true }),
    Product.find({ active: true, stock: { $lte: LOW_STOCK_THRESHOLD } })
      .sort({ stock: 1 })
      .limit(20)
      .select('id name stock category images')
      .lean(),
  ]);

  const lowStockList: LowStockProduct[] = lowStockDocs.map((p) => ({
    id:       p.id,
    name:     p.name,
    stock:    p.stock,
    category: p.category,
    ...(p.images?.[0] ? { image: p.images[0].url } : {}),
  }));

  const totalRevenue   = totalRevenueAll?.revenue ?? 0;
  const totalOrders    = totalRevenueAll?.orders  ?? 0;
  const avgOrderValue  = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
  const prevAov        = prev.orders ? prev.revenue / prev.orders : 0;
  const curAov         = cur.orders  ? cur.revenue  / cur.orders  : 0;

  return {
    totalRevenue,
    revenueGrowth:       pctGrowth(cur.revenue, prev.revenue),
    totalOrders,
    ordersGrowth:        pctGrowth(cur.orders, prev.orders),
    customOrders:        totalCustom,
    customOrdersGrowth:  pctGrowth(customCur, customPrev),
    avgOrderValue,
    aovGrowth:           pctGrowth(curAov, prevAov),
    pendingOrders,
    activeProducts,
    lowStockProducts:    lowStockDocs.length,
    lowStockList,
    conversionRate: 3.4,
  };
}

/** Standalone low-stock list used by the dedicated endpoint. */
export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  const docs = await Product.find({ active: true, stock: { $lte: LOW_STOCK_THRESHOLD } })
    .sort({ stock: 1 })
    .limit(50)
    .select('id name stock category images')
    .lean();
  return docs.map((p) => ({
    id:       p.id,
    name:     p.name,
    stock:    p.stock,
    category: p.category,
    ...(p.images?.[0] ? { image: p.images[0].url } : {}),
  }));
}

export interface RevenuePoint {
  day: string;
  revenue: number;
  orders: number;
}

export async function getRevenueSeries(days = 14): Promise<RevenuePoint[]> {
  const start = new Date(Date.now() - (days - 1) * DAY_MS);
  start.setHours(0, 0, 0, 0);

  const rows = await Order.aggregate<{ _id: string; revenue: number; orders: number }>([
    { $match: { ...REVENUE_MATCH, createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders:  { $sum: 1 },
      },
    },
  ]);
  const byDay = new Map(rows.map((r) => [r._id, r]));

  const out: RevenuePoint[] = [];
  for (let i = 0; i < days; i++) {
    const d   = new Date(start.getTime() + i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    const row = byDay.get(key);
    out.push({
      day:     d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: row?.revenue ?? 0,
      orders:  row?.orders  ?? 0,
    });
  }
  return out;
}

export interface CategorySplit {
  cat: string;
  count: number;
  revenue: number;
  color: string;
}

export async function getCategorySplit(): Promise<CategorySplit[]> {
  const rows = await Product.aggregate<{ _id: string; count: number; revenue: number }>([
    { $group: { _id: '$category', count: { $sum: '$totalSold' }, revenue: { $sum: '$revenue' } } },
    { $sort: { revenue: -1 } },
  ]);
  return rows.map((r) => ({
    cat:     r._id,
    count:   r.count,
    revenue: r.revenue,
    color:   CATEGORY_COLORS[r._id as Category] ?? '#CCCCCC',
  }));
}

export interface TopProduct {
  id: number;
  name: string;
  sold: number;
  revenue: number;
  image?: string;
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const docs = await Product
    .find()
    .sort({ totalSold: -1 })
    .limit(limit)
    .select('id name totalSold revenue images')
    .lean();
  return docs.map((p) => ({
    id:      p.id,
    name:    p.name,
    sold:    p.totalSold ?? 0,
    revenue: p.revenue   ?? 0,
    ...(p.images?.[0] ? { image: p.images[0].url } : {}),
  }));
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'custom_order' | 'product_low' | 'review';
  message: string;
  time: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

export async function getRecentActivity(limit = 8): Promise<RecentActivity[]> {
  const [orders, customs, lowStock] = await Promise.all([
    Order.find().sort({ updatedAt: -1 }).limit(6).select('code customer total status updatedAt').lean(),
    CustomOrder.find().sort({ updatedAt: -1 }).limit(4).select('code customer status updatedAt').lean(),
    Product.find({ active: true, stock: { $lte: LOW_STOCK_THRESHOLD } })
      .limit(3)
      .select('name stock updatedAt')
      .lean(),
  ]);

  const items: (RecentActivity & { ts: number })[] = [];

  for (const o of orders) {
    const ts = toTs(o.updatedAt);
    items.push({
      id:       `o-${o.code}`,
      type:     'order',
      message:  `Order ${o.code} — ${o.customer} (${o.status})`,
      time:     relTime(ts),
      severity: o.status === 'cancelled' ? 'error' : o.status === 'delivered' ? 'success' : 'info',
      ts,
    });
  }
  for (const c of customs) {
    const ts = toTs(c.updatedAt);
    items.push({
      id:       `c-${c.code}`,
      type:     'custom_order',
      message:  `Custom order ${c.code} — ${c.customer} (${c.status})`,
      time:     relTime(ts),
      severity: c.status === 'new' || c.status === 'in_review' ? 'warning' : 'info',
      ts,
    });
  }
  for (const p of lowStock) {
    const ts = toTs(p.updatedAt);
    items.push({
      id:       `p-${p.name}`,
      type:     'product_low',
      message:  `${p.name} is low on stock — only ${p.stock} left`,
      time:     relTime(ts),
      severity: 'warning',
      ts,
    });
  }

  return items
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit)
    .map(({ ts: _ts, ...rest }) => rest);
}

function toTs(v: unknown): number {
  return v instanceof Date ? v.getTime() : typeof v === 'string' ? Date.parse(v) : Date.now();
}

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
