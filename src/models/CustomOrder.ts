import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { CUSTOM_ORDER_STATUSES } from '../constants/enums.js';

const customOrderSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // CUS-0012, exposed as `id`
    customer: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    wilaya: { type: String, required: true },
    garmentType: { type: String, required: true },
    size: { type: String, required: true },
    colors: { type: [String], default: [] },
    notes: { type: String, default: '' }, // customer notes
    referenceImage: { type: Boolean, default: false }, // derived from referenceImageUrl
    referenceImageUrl: { type: String }, // Cloudinary secure_url
    budget: { type: String, default: '' },
    status: { type: String, enum: CUSTOM_ORDER_STATUSES, default: 'new' },
    quotedPrice: { type: Number, min: 0 }, // admin-set
    note: { type: String, default: '' }, // admin-internal
  },
  { timestamps: true },
);

customOrderSchema.index({ status: 1, createdAt: -1 });
customOrderSchema.index({ createdAt: -1 });
customOrderSchema.index({ email: 1 });

export type CustomOrderSchemaType = InferSchemaType<typeof customOrderSchema>;
export type CustomOrderDocument = HydratedDocument<CustomOrderSchemaType>;

export const CustomOrder = model('CustomOrder', customOrderSchema);
