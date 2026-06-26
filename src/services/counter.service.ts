import { Counter } from '../models/Counter.js';

/** Atomically increment and return the next value of a named counter. */
export async function nextSeq(name: string): Promise<number> {
  const doc = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true },
  ).lean();
  return doc!.seq;
}

export const nextProductId = (): Promise<number> => nextSeq('productId');

export async function nextOrderCode(): Promise<string> {
  const seq = await nextSeq('orderCode');
  return `ORD-${String(seq).padStart(4, '0')}`;
}

export async function nextCustomCode(): Promise<string> {
  const seq = await nextSeq('customCode');
  return `CUS-${String(seq).padStart(4, '0')}`;
}
