import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { ORDER_STATUSES, PAYMENT_STATUSES, PAYMENT_METHOD_IDS } from '../constants/enums.js';

const orderItemSchema = new Schema(
  {
    productId: { type: Number, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    size: { type: String, required: true },
    color: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 }, // unit price (numeric)
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // ORD-0042, exposed as `id`
    customer: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    wilaya: { type: String, required: true },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    shippingType : { type: String, required: true, enum: ['home', 'desk'] },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'unpaid' },
    paymentMethod: { type: String, required: true }, // human label
    paymentMethodId: { type: String, enum: PAYMENT_METHOD_IDS },
    note: { type: String, default: '' }, // admin-internal
  },
  { timestamps: true },
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ email: 1 });
orderSchema.index({ paymentStatus: 1 });

export type OrderSchemaType = InferSchemaType<typeof orderSchema>;
export type OrderDocument = HydratedDocument<OrderSchemaType>;

export const Order = model('Order', orderSchema);
