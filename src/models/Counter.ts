import { Schema, model } from 'mongoose';

export interface CounterDoc {
  _id: string; // 'productId' | 'orderCode' | 'customCode'
  seq: number;
}

const counterSchema = new Schema<CounterDoc>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false },
);

export const Counter = model<CounterDoc>('Counter', counterSchema);
