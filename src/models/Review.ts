import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const reviewSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    wilaya: { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    orderCode: { type: String, default: null }, // links the review to the order it came from
    approved: { type: Boolean, default: true }, // moderation flag; carousel shows approved only
  },
  { timestamps: true },
);

reviewSchema.index({ approved: 1, createdAt: -1 });
reviewSchema.index({ orderCode: 1 });

export type ReviewSchemaType = InferSchemaType<typeof reviewSchema>;
export type ReviewDocument = HydratedDocument<ReviewSchemaType>;

export const Review = model('Review', reviewSchema);
