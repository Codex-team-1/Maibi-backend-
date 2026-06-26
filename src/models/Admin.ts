import { Schema, model, type HydratedDocument } from 'mongoose';

export interface AdminSchemaType {
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
}

const adminSchema = new Schema<AdminSchemaType>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: 'Admin' },
    phone: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).passwordHash;
        return ret;
      },
    },
  },
);

export type AdminDocument = HydratedDocument<AdminSchemaType>;

export const Admin = model<AdminSchemaType>('Admin', adminSchema);
