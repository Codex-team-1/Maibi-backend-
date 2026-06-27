import type {
  AdminProductDTO,
  CustomOrderDTO,
  OrderDTO,
  OrderItemDTO,
  ProductDTO,
  ProductImage,
  ReviewDTO,
} from '../types/dto.js';
import type { BadgeLabel, CustomOrderStatus, OrderStatus, PaymentStatus } from '../constants/enums.js';
import type { Category } from '../constants/categories.js';

const toISO = (v: unknown): string =>
  v instanceof Date ? v.toISOString() : typeof v === 'string' ? v : new Date().toISOString();

const NEW_BADGE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** The 'New' badge expires after 7 days; any other badge is permanent. */
function resolveBadge(label: string | null | undefined, createdAt: unknown): BadgeLabel | undefined {
  if (!label) return undefined;
  if (label === 'New') {
    const created = createdAt instanceof Date ? createdAt : new Date(createdAt as string);
    if (Date.now() - created.getTime() > NEW_BADGE_TTL_MS) return undefined;
  }
  return label as BadgeLabel;
}

interface ProductLean {
  id: number;
  name: string;
  price: string;
  category: string;
  description?: string | null;
  stock: number;
  inStock?: boolean | null;
  badgeLabel?: string | null;
  images?: { url: string; publicId: string }[];
  sizes?: string[];
  colors?: string[];
  active?: boolean | null;
  promoted?: boolean | null;
  totalSold?: number | null;
  revenue?: number | null;
  rating?: { ratingCount?: number; ratingSum?: number; ratingAvg?: number } | null;
  discount?: { percent?: number | null; activeUntil?: Date | string | null } | null;
  createdAt?: unknown;
  updatedAt?: unknown;
}

function formatPrice(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' DA';
}

function parseNumericPrice(price: string): number {
  return parseInt(price.replace(/\s/g, '').replace('DA', ''), 10) || 0;
}

function resolveDiscount(
  discount: ProductLean['discount'],
  price: string,
): ProductDTO['discount'] {
  if (!discount?.percent || !discount?.activeUntil) return undefined;
  const until = discount.activeUntil instanceof Date
    ? discount.activeUntil
    : new Date(discount.activeUntil as string);
  if (isNaN(until.getTime()) || Date.now() > until.getTime()) return undefined;
  const original = parseNumericPrice(price);
  const discounted = Math.round(original * (1 - discount.percent / 100));
  return {
    percent:         discount.percent,
    activeUntil:     until.toISOString(),
    discountedPrice: formatPrice(discounted),
  };
}

export function toProductDTO(p: ProductLean): ProductDTO {
  const dto: ProductDTO = {
    id:          p.id,
    name:        p.name,
    price:       p.price,
    category:    p.category as Category,
    description: p.description ?? '',
    stock:       p.stock,
    inStock:     p.inStock ?? p.stock > 0,
    images:      (p.images ?? []) as ProductImage[],
    sizes:       p.sizes ?? [],
    colors:      p.colors ?? [],
    rating: {
      ratingCount: p.rating?.ratingCount ?? 0,
      ratingAvg:   p.rating?.ratingAvg   ?? 0,
    },
    createdAt:   toISO(p.createdAt),
    updatedAt:   toISO(p.updatedAt),
  };
  const badge = resolveBadge(p.badgeLabel, p.createdAt);
  if (badge) dto.badgeLabel = badge;
  const disc = resolveDiscount(p.discount, p.price);
  if (disc) dto.discount = disc;
  return dto;
}

export function toAdminProductDTO(p: ProductLean): AdminProductDTO {
  const base = toProductDTO(p);
  const dto: AdminProductDTO = {
    ...base,
    active:    p.active ?? true,
    promoted:  p.promoted ?? false,
    totalSold: p.totalSold ?? 0,
    revenue:   p.revenue ?? 0,
  };
  // Always expose raw discount fields so the admin form can pre-populate them.
  if (p.discount?.percent && p.discount?.activeUntil) {
    const until = p.discount.activeUntil instanceof Date
      ? p.discount.activeUntil
      : new Date(p.discount.activeUntil as string);
    dto.discountRaw = {
      percent:     p.discount.percent,
      activeUntil: isNaN(until.getTime()) ? null : until.toISOString(),
    };
  }
  return dto;
}

interface OrderItemLean extends OrderItemDTO {
  productId?: number;
}

interface OrderLean {
  code: string;
  customer: string;
  email: string;
  phone: string;
  wilaya: string;
  address?: string | null;
  city?: string | null;
  items: OrderItemLean[];
  shippingType: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  note?: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export function toOrderDTO(
  o: OrderLean,
  opts: { admin?: boolean; productMap?: Map<number, { image?: string; colors?: string[] }> } = {},
): OrderDTO {
  const dto: OrderDTO = {
    id:            o.code,
    customer:      o.customer,
    email:         o.email,
    phone:         o.phone,
    wilaya:        o.wilaya,
    items:         o.items.map((i) => {
      const it: OrderItemDTO = { name: i.name, qty: i.qty, size: i.size, price: i.price };
      const image = i.image || opts.productMap?.get(i.productId ?? 0)?.image;
      const color = i.color || undefined;
      if (image) it.image = image;
      if (color) it.color = color;
      return it;
    }),
    shippingType:  o.shippingType as 'home' | 'desk',
    total:         o.total,
    status:        o.status as OrderStatus,
    paymentStatus: o.paymentStatus as PaymentStatus,
    paymentMethod: o.paymentMethod,
    createdAt:     toISO(o.createdAt),
    updatedAt:     toISO(o.updatedAt),
  };
  if (opts.admin) {
    dto.subtotal    = o.subtotal;
    dto.shippingFee = o.shippingFee;
    if (o.address) dto.address = o.address;
    if (o.city)    dto.city    = o.city;
    dto.note = o.note ?? '';
  }
  return dto;
}

interface ReviewLean {
  name: string;
  wilaya: string;
  rating: number;
  comment: string;
  createdAt: unknown;
}

export function toReviewDTO(r: ReviewLean): ReviewDTO {
  return {
    name:      r.name,
    wilaya:    r.wilaya,
    rating:    r.rating,
    text:      r.comment,
    createdAt: toISO(r.createdAt),
  };
}

interface CustomOrderLean {
  code: string;
  customer: string;
  email: string;
  phone: string;
  wilaya: string;
  garmentType: string;
  size: string;
  colors?: string[];
  notes?: string | null;
  referenceImage?: boolean;
  referenceImageUrl?: string | null;
  budget?: string | null;
  status: string;
  quotedPrice?: number | null;
  note?: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export function toCustomOrderDTO(c: CustomOrderLean, opts: { admin?: boolean } = {}): CustomOrderDTO {
  const dto: CustomOrderDTO = {
    id:             c.code,
    customer:       c.customer,
    email:          c.email,
    phone:          c.phone,
    wilaya:         c.wilaya,
    garmentType:    c.garmentType,
    size:           c.size,
    colors:         c.colors ?? [],
    notes:          c.notes ?? '',
    referenceImage: Boolean(c.referenceImageUrl) || c.referenceImage === true,
    budget:         c.budget ?? '',
    status:         c.status as CustomOrderStatus,
    createdAt:      toISO(c.createdAt),
    updatedAt:      toISO(c.updatedAt),
  };
  if (opts.admin) {
    if (c.referenceImageUrl) dto.referenceImageUrl = c.referenceImageUrl;
    if (typeof c.quotedPrice === 'number') dto.quotedPrice = c.quotedPrice;
    dto.note = c.note ?? '';
  }
  return dto;
}
