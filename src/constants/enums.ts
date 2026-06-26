export const BADGE_LABELS = ['Featured', 'Trending', 'New'] as const;
export type BadgeLabel = (typeof BADGE_LABELS)[number];

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const CUSTOM_ORDER_STATUSES = [
  'new',
  'in_review',
  'quoted',
  'accepted',
  'in_production',
  'shipped',
  'delivered',
  'cancelled',
] as const;
export type CustomOrderStatus = (typeof CUSTOM_ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHOD_IDS = ['cod', 'cib', 'dahabia', 'baridimob'] as const;
export type PaymentMethodId = (typeof PAYMENT_METHOD_IDS)[number];
