import type { BadgeLabel, CustomOrderStatus, OrderStatus, PaymentStatus } from '../constants/enums.js';
import type { Category } from '../constants/categories.js';

export interface ProductImage {
  url: string;
  publicId: string;
}

/** Public product shape. */
export interface ProductDTO {
  id: number;
  name: string;
  price: string;
  category: Category;
  description: string;
  stock: number;
  inStock: boolean;
  badgeLabel?: BadgeLabel;
  images: ProductImage[];
  sizes: string[];
  colors: string[];
  createdAt: string;
  updatedAt: string;
}

/** Admin product shape — adds admin flags and metrics. */
export interface AdminProductDTO extends ProductDTO {
  active: boolean;
  promoted: boolean;
  totalSold: number;
  revenue: number;
}

export interface OrderItemDTO {
  name: string;
  qty: number;
  size: string;
  color?: string;
  image?: string;
  price: number;
}

export interface OrderDTO {
  id: string;
  customer: string;
  email: string;
  phone: string;
  wilaya: string;
  items: OrderItemDTO[];
  shippingType: 'home' | 'desk';
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  // Admin-only:
  subtotal?: number;
  shippingFee?: number;
  address?: string;
  city?: string;
  note?: string;
}

/** Public review shape — `comment` is exposed as `text` for the storefront. */
export interface ReviewDTO {
  name: string;
  wilaya: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface CustomOrderDTO {
  id: string;
  customer: string;
  email: string;
  phone: string;
  wilaya: string;
  garmentType: string;
  size: string;
  colors: string[];
  notes: string;
  referenceImage: boolean;
  budget: string;
  status: CustomOrderStatus;
  createdAt: string;
  updatedAt: string;
  // Admin-only:
  referenceImageUrl?: string;
  quotedPrice?: number;
  note?: string;
}
