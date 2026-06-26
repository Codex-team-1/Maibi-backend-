import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { CATEGORIES } from '../constants/categories.js';
import { BADGE_LABELS } from '../constants/enums.js';

const imageSchema = new Schema(
  { url: { type: String, required: true }, publicId: { type: String, required: true } },
  { _id: false },
);

const productSchema = new Schema(
  {
    id:          { type: Number, required: true, unique: true, index: true },
    name:        { type: String, required: true, trim: true },
    price:       { type: String, required: true },
    category:    { type: String, enum: CATEGORIES, required: true },
    description: { type: String, default: '' },
    stock:       { type: Number, required: true, min: 0, default: 0 },
    inStock:     { type: Boolean, default: true },
    badgeLabel:  { type: String, enum: [...BADGE_LABELS, null], default: null },
    images:      { type: [imageSchema], default: [] },
    sizes:       { type: [String], default: [] },
    colors:      { type: [String], default: [] },
    // admin flags
    active:      { type: Boolean, default: true },
    promoted:    { type: Boolean, default: false },
    // denormalised metrics
    totalSold:   { type: Number, default: 0, min: 0 },
    revenue:     { type: Number, default: 0, min: 0 },
    rating: {
      ratingCount: { type: Number, default: 0, min: 0 },
      ratingSum:   { type: Number, default: 0, min: 0 },
      ratingAvg:   { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true },
);

productSchema.index({ active: 1, category: 1 });
productSchema.index({ active: 1, stock: 1 });
productSchema.index({ totalSold: -1 });
productSchema.index({ createdAt: -1 });

export type ProductSchemaType = InferSchemaType<typeof productSchema>;
export type ProductDocument = HydratedDocument<ProductSchemaType>;

export const Product = model('Product', productSchema);
