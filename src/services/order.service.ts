import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Order, type OrderDocument } from '../models/Order.js';
import { AppError } from '../utils/AppError.js';
import { nextOrderCode } from './counter.service.js';
import { paymentLabel } from '../constants/paymentMethods.js';
import type { CheckoutBody } from '../validators/order.schema.js';



/** Parse a price string like "8 900 DA" or "8900" to a number. */
function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^\d.,]/g, '').replace(',', '.');
  return Math.round(parseFloat(cleaned) || 0);
}

interface PricedItem {
  productId: number;
  name: string;
  qty: number;
  size: string;
  color: string;
  image: string;
  price: number;
}

export async function createOrderFromCheckout(body: CheckoutBody): Promise<OrderDocument> {
  const ids = [...new Set(body.items.map((i) => i.productId))];
  const products = await Product.find({ id: { $in: ids }, active: true }).lean();
  const byId = new Map(products.map((p) => [p.id, p]));

  const priced: PricedItem[] = body.items.map((item) => {
    const p = byId.get(item.productId);
    if (!p) throw AppError.badRequest(`Product ${item.productId} is unavailable`);
    if (!p.inStock || p.stock < item.qty) {
      throw AppError.conflict(`Insufficient stock for ${p.name} (only ${p.stock} left)`);
    }
    return {
      productId: p.id,
      name: p.name,
      qty: item.qty,
      size: item.size,
      color: item.color ?? '',
      image: p.images?.[0]?.url ?? '',
      price: parsePrice(p.price),
    };
  });

  const subtotal = priced.reduce((sum, i) => sum + i.price * i.qty, 0);

  const code = await nextOrderCode();
  const { shipping, payment } = body;
  const orderData = {
    code,
    customer: `${shipping.firstName} ${shipping.lastName}`,
    email: shipping.email,
    phone: shipping.phone,
    wilaya: shipping.wilaya,
    address: shipping.address,
    city: shipping.city,
    items: priced,
    shippingType: shipping.shippingType,
    shippingFee: shipping.shippingFee ?? 0,
    subtotal,
    total: subtotal + (shipping.shippingFee ?? 0),
    status: 'pending' as const,
    paymentStatus: 'unpaid' as const,
    paymentMethod: paymentLabel(payment.method),
    paymentMethodId: payment.method,
    note: shipping.notes ?? '',
  };

  if (supportsTransactions()) {
    return createWithTransaction(orderData, priced);
  }
  return createWithGuardedUpdates(orderData, priced);
}

function supportsTransactions(): boolean {
  const topology = (mongoose.connection.db as unknown as { topology?: { s?: { description?: { type?: string } } } })
    ?.topology;
  const type = topology?.s?.description?.type;
  return type === 'ReplicaSetWithPrimary' || type === 'Sharded';
}

async function createWithTransaction(orderData: object, items: PricedItem[]): Promise<OrderDocument> {
  const session = await mongoose.startSession();
  try {
    let created!: OrderDocument;
    await session.withTransaction(async () => {
      for (const it of items) {
        const upd = await Product.updateOne(
          { id: it.productId, stock: { $gte: it.qty } },
          { $inc: { stock: -it.qty }, $set: { inStock: true } },
          { session },
        );
        if (upd.modifiedCount !== 1) throw AppError.conflict(`Insufficient stock for ${it.name}`);
        // Mark out-of-stock if stock hit zero
        await Product.updateOne({ id: it.productId, stock: 0 }, { $set: { inStock: false } }, { session });
      }
      const docs = await Order.create([orderData], { session });
      created = docs[0]!;
    });
    return created;
  } finally {
    await session.endSession();
  }
}

async function createWithGuardedUpdates(orderData: object, items: PricedItem[]): Promise<OrderDocument> {
  const applied: PricedItem[] = [];
  try {
    for (const it of items) {
      const upd = await Product.updateOne(
        { id: it.productId, stock: { $gte: it.qty } },
        { $inc: { stock: -it.qty } },
      );
      if (upd.modifiedCount !== 1) throw AppError.conflict(`Insufficient stock for ${it.name}`);
      // Sync inStock flag
      await Product.updateOne({ id: it.productId, stock: 0 }, { $set: { inStock: false } });
      applied.push(it);
    }
    return await Order.create(orderData);
  } catch (err) {
    await Promise.all(
      applied.map((it) =>
        Product.updateOne(
          { id: it.productId },
          { $inc: { stock: it.qty }, $set: { inStock: true } },
        ),
      ),
    );
    throw err;
  }
}

/** Increment totalSold + revenue for each item in a delivered order. */
export async function creditDeliveryMetrics(items: Array<{ productId: number; qty: number; price: number }>): Promise<void> {
  await Promise.all(
    items.map((it) =>
      Product.updateOne(
        { id: it.productId },
        { $inc: { totalSold: it.qty, revenue: it.price * it.qty } },
      ),
    ),
  );
}

/** Reverse totalSold + revenue (e.g. order un-delivered or cancelled post-delivery). */
export async function reverseDeliveryMetrics(items: Array<{ productId: number; qty: number; price: number }>): Promise<void> {
  await Promise.all(
    items.map((it) =>
      Product.updateOne(
        { id: it.productId },
        { $inc: { totalSold: -it.qty, revenue: -(it.price * it.qty) } },
      ),
    ),
  );
}
