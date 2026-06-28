import type { Request, Response } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { CustomOrder } from "../models/CustomOrder.js";
import { AppError } from "../utils/AppError.js";
import { toCustomOrderDTO, toOrderDTO } from "../utils/serialize.js";
import { parsePagination, paginate } from "../utils/pagination.js";
import { validated } from "../middlewares/validate.js";
import { param } from "../utils/params.js";
import type {
  AdminOrderListQuery,
  AdminOrderPatch,
} from "../validators/order.schema.js";
import type {
  AdminCustomListQuery,
  AdminCustomPatch,
} from "../validators/customOrder.schema.js";
import {
  sendOrderConfirmedCustomer,
  sendOrderShippedCustomer,
  sendOrderDeliveredCustomer,
  sendOrderCancelledCustomer,
  sendOrderRefundedCustomer,
  sendCustomOrderQuotedCustomer,
  sendCustomOrderConfirmedCustomer,
  sendCustomOrderShippedCustomer,
  sendCustomOrderDeliveredCustomer,
  sendCustomOrderCancelledCustomer,
} from "../services/mail.service.js";
import { creditDeliveryMetrics, reverseDeliveryMetrics } from "../services/order.service.js";

//---------------- Orders ----------------

// List all orders with optional filters and pagination
export async function listOrders(req: Request, res: Response): Promise<void> {
  const q = validated<AdminOrderListQuery>(req);
  const filter: Record<string, unknown> = {};
  if (q.status) filter.status = q.status;
  if (q.paymentStatus) filter.paymentStatus = q.paymentStatus;
  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), "i");
    filter.$or = [
      { code: rx },
      { customer: rx },
      { email: rx },
      { wilaya: rx },
    ];
  }

  const { page, limit, skip } = parsePagination(q.page, q.limit);

  const [docs, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  const productMap = await buildProductMap(docs);

  res.set("Cache-Control", "no-store");
  res.json(
    paginate(
      docs.map((o) => toOrderDTO(o, { admin: true, productMap })),
      total,
      page,
      limit,
    ),
  );
}

// Get a single order by its code
export async function getOneOrder(req: Request, res: Response): Promise<void> {
  const order = await Order.findOne({ code: param(req, "id") }).lean();
  if (!order) throw AppError.notFound("Order not found");
  const productMap = await buildProductMap([order]);
  res.json(toOrderDTO(order, { admin: true, productMap }));
}

// Update an order's details
export async function patchOrder(req: Request, res: Response): Promise<void> {
  const body = validated<AdminOrderPatch>(req);
  const order = await Order.findOne({ code: param(req, "id") });
  if (!order) throw AppError.notFound("Order not found");

  const prevStatus = order.status;

  if (body.status !== undefined) order.status = body.status;
  if (body.paymentStatus !== undefined)
    order.paymentStatus = body.paymentStatus;
  if (body.note !== undefined) order.note = body.note;
  if (body.shippingFee !== undefined) {
    order.shippingFee = body.shippingFee;
    order.total = order.subtotal + body.shippingFee;
  }

  await order.save();
  const dto = order.toObject();
  const productMap = await buildProductMap([dto]);
  res.json(toOrderDTO(dto, { admin: true, productMap }));

  // Metrics: credit on delivery, reverse if un-delivered
  if (body.status && body.status !== prevStatus) {
    const metricItems = dto.items.map((it) => ({
      productId: it.productId,
      qty: it.qty,
      price: it.price,
    }));
    if (body.status === 'delivered') {
      creditDeliveryMetrics(metricItems);
    } else if (prevStatus === 'delivered') {
      reverseDeliveryMetrics(metricItems);
    }
  }

  // Email on status transitions (include admin's internal note in every email)
  if (body.status && body.status !== prevStatus) {
    const mailData = {
      code: dto.code,
      customer: dto.customer,
      email: dto.email,
      phone: dto.phone,
      wilaya: dto.wilaya,
      city: dto.city,
      address: dto.address,
      shippingType: dto.shippingType,
      paymentMethod: dto.paymentMethod,
      items: dto.items,
      subtotal: dto.subtotal,
      shippingFee: dto.shippingFee,
      total: dto.total,
      note: dto.note || undefined,
    };
    if (body.status === "confirmed") {
      sendOrderConfirmedCustomer(mailData);
    } else if (body.status === "shipped") {
      sendOrderShippedCustomer(mailData);
    } else if (body.status === "delivered") {
      sendOrderDeliveredCustomer(mailData);
    } else if (body.status === "cancelled") {
      sendOrderCancelledCustomer(mailData);
    }
  }
}

// Cancel an order
export async function cancelOrder(req: Request, res: Response): Promise<void> {
  const order = await Order.findOne({ code: param(req, "id") });
  if (!order) throw AppError.notFound("Order not found");
  if (order.status === "cancelled")
    throw AppError.conflict("Order is already cancelled");
  if (order.status === "delivered")
    throw AppError.conflict("Delivered orders cannot be cancelled");
  order.status = "cancelled";
  await order.save();
  const dto = order.toObject();
  const productMap = await buildProductMap([dto]);
  res.json(toOrderDTO(dto, { admin: true, productMap }));

  sendOrderCancelledCustomer({
    code: dto.code,
    customer: dto.customer,
    email: dto.email,
    phone: dto.phone,
    wilaya: dto.wilaya,
    city: dto.city,
    address: dto.address,
    shippingType: dto.shippingType,
    paymentMethod: dto.paymentMethod,
    items: dto.items,
    subtotal: dto.subtotal,
    shippingFee: dto.shippingFee,
    total: dto.total,
    note: dto.note || undefined,
  });
}

// Refund an order
export async function refundOrder(req: Request, res: Response): Promise<void> {
  const order = await Order.findOne({ code: param(req, "id") });
  if (!order) throw AppError.notFound("Order not found");
  if (order.paymentStatus !== "paid")
    throw AppError.conflict("Only paid orders can be refunded");
  order.paymentStatus = "refunded";
  await order.save();
  const dto = order.toObject();
  const productMap = await buildProductMap([dto]);
  res.json(toOrderDTO(dto, { admin: true, productMap }));

  sendOrderRefundedCustomer({
    code: dto.code,
    customer: dto.customer,
    email: dto.email,
    phone: dto.phone,
    wilaya: dto.wilaya,
    city: dto.city,
    address: dto.address,
    shippingType: dto.shippingType,
    paymentMethod: dto.paymentMethod,
    items: dto.items,
    subtotal: dto.subtotal,
    shippingFee: dto.shippingFee,
    total: dto.total,
  });
}

//___________ Custom Orders ___________

// List all custom orders with optional filters and pagination
export async function listCustomOrders(
  req: Request,
  res: Response,
): Promise<void> {
  const q = validated<AdminCustomListQuery>(req);
  const filter: Record<string, unknown> = {};
  if (q.status) filter.status = q.status;
  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), "i");
    filter.$or = [
      { code: rx },
      { customer: rx },
      { email: rx },
      { garmentType: rx },
      { wilaya: rx },
    ];
  }

  const { page, limit, skip } = parsePagination(q.page, q.limit);

  const [docs, total] = await Promise.all([
    CustomOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CustomOrder.countDocuments(filter),
  ]);

  res.set("Cache-Control", "no-store");
  res.json(
    paginate(
      docs.map((c) => toCustomOrderDTO(c, { admin: true })),
      total,
      page,
      limit,
    ),
  );
}

// Get a single custom order by its code
export async function getOneCustomOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const order = await CustomOrder.findOne({ code: param(req, "id") }).lean();
  if (!order) throw AppError.notFound("Custom order not found");
  res.json(toCustomOrderDTO(order, { admin: true }));
}

// Update a custom order's details
export async function patchCustomOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const body = validated<AdminCustomPatch>(req);
  const order = await CustomOrder.findOne({ code: param(req, "id") });
  if (!order) throw AppError.notFound("Custom order not found");

  const prevStatus = order.status;

  if (body.status !== undefined) order.status = body.status;
  if (body.note !== undefined) order.note = body.note;
  if (body.quotedPrice !== undefined) order.quotedPrice = body.quotedPrice;

  await order.save();
  const dto = order.toObject();
  res.json(toCustomOrderDTO(dto, { admin: true }));

  // Email on status transitions
  if (body.status && body.status !== prevStatus) {
    const mailData = {
      code: dto.code,
      customer: dto.customer,
      email: dto.email,
      phone: dto.phone,
      wilaya: dto.wilaya,
      garmentType: dto.garmentType,
      size: dto.size,
      colors: dto.colors ?? [],
      budget: dto.budget ?? '',
      notes: dto.notes || undefined,
      status: dto.status,
      quotedPrice: typeof dto.quotedPrice === 'number' ? dto.quotedPrice : undefined,
      note: dto.note || undefined,
    };
    if (body.status === 'quoted') {
      sendCustomOrderQuotedCustomer(mailData);
    } else if (body.status === 'accepted' || body.status === 'in_production' || body.status === 'in_review') {
      sendCustomOrderConfirmedCustomer(mailData);
    } else if (body.status === 'shipped') {
      sendCustomOrderShippedCustomer(mailData);
    } else if (body.status === 'delivered') {
      sendCustomOrderDeliveredCustomer(mailData);
    } else if (body.status === 'cancelled') {
      sendCustomOrderCancelledCustomer(mailData);
    }
  }
}

//Cancel an order
export async function cancelCustomOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const order = await CustomOrder.findOne({ code: param(req, "id") });
  if (!order) throw AppError.notFound("Custom order not found");
  if (order.status === "cancelled")
    throw AppError.conflict("Order is already cancelled");
  if (order.status === "delivered")
    throw AppError.conflict("Delivered orders cannot be cancelled");
  order.status = "cancelled";
  await order.save();
  const dto = order.toObject();
  res.json(toCustomOrderDTO(dto, { admin: true }));

  sendCustomOrderCancelledCustomer({
    code: dto.code,
    customer: dto.customer,
    email: dto.email,
    phone: dto.phone,
    wilaya: dto.wilaya,
    garmentType: dto.garmentType,
    size: dto.size,
    colors: dto.colors ?? [],
    budget: dto.budget ?? '',
    notes: dto.notes || undefined,
    status: 'cancelled',
    quotedPrice: typeof dto.quotedPrice === 'number' ? dto.quotedPrice : undefined,
    note: dto.note || undefined,
  });
}

// Refund a custom order. CustomOrderStatus has no dedicated "refunded" state,
// so a refund moves the order to the terminal "cancelled" state. We guard that
// there is actually a quote to refund and that it is not already cancelled.
export async function refundCustomOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const order = await CustomOrder.findOne({ code: param(req, "id") });
  if (!order) throw AppError.notFound("Custom order not found");
  if (order.status === "cancelled")
    throw AppError.conflict("Order is already cancelled");
  if (typeof order.quotedPrice !== "number")
    throw AppError.conflict("Only quoted custom orders can be refunded");
  order.status = "cancelled";
  await order.save();
  const dto = order.toObject();
  res.json(toCustomOrderDTO(dto, { admin: true }));

  sendCustomOrderCancelledCustomer({
    code: dto.code,
    customer: dto.customer,
    email: dto.email,
    phone: dto.phone,
    wilaya: dto.wilaya,
    garmentType: dto.garmentType,
    size: dto.size,
    colors: dto.colors ?? [],
    budget: dto.budget ?? '',
    notes: dto.notes || undefined,
    status: 'cancelled',
    quotedPrice: typeof dto.quotedPrice === 'number' ? dto.quotedPrice : undefined,
    note: dto.note || undefined,
  });
}

/**
 * GET /admin/orders/new-since?since=<ISO timestamp>
 * Returns orders created after the given timestamp (for dashboard notifications).
 * The client stores the last-seen timestamp in localStorage and polls this endpoint.
 */
export async function newOrdersSince(req: Request, res: Response): Promise<void> {
  const since = req.query.since ? new Date(String(req.query.since)) : new Date(0);
  const orders = await Order.find({ createdAt: { $gt: since } })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('code customer wilaya total createdAt')
    .lean();

  res.set('Cache-Control', 'no-store');
  res.json({
    count: orders.length,
    orders: orders.map((o) => ({
      id: o.code,
      customer: o.customer,
      wilaya: o.wilaya,
      total: o.total,
      createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    })),
  });
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function buildProductMap(
  docs: { items: { productId?: number }[] }[],
): Promise<Map<number, { image?: string }>> {
  const ids = [...new Set(docs.flatMap((o) => o.items.map((i) => i.productId).filter((id): id is number => id != null)))];
  if (ids.length === 0) return new Map();
  const products = await Product.find({ id: { $in: ids } }, { id: 1, images: 1 }).lean();
  return new Map(products.map((p) => {
    const entry: { image?: string } = {};
    const url = p.images?.[0]?.url;
    if (url) entry.image = url;
    return [p.id, entry];
  }));
}
