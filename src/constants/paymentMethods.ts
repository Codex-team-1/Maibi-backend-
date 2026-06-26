import type { PaymentMethodId } from './enums.js';

export interface PaymentMethod {
  id: PaymentMethodId;
  icon: string;
  label: string;
  sub: string;
  badge: string | null;
}

/** Payment methods — verbatim from the frontend checkout. */
export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  { id: 'cod', icon: '🏠', label: 'Cash on delivery', sub: 'Pay when your order arrives', badge: 'Most popular' },
  { id: 'cib', icon: '💳', label: 'CIB card', sub: 'Carte Interbancaire — all Algerian banks', badge: null },
  { id: 'dahabia', icon: '🟡', label: 'Dahabia / CCP', sub: 'Algérie Poste payment card', badge: null },
  { id: 'baridimob', icon: '📱', label: 'BaridiMob', sub: 'Mobile payment via Algérie Poste', badge: null },
];

const BY_ID = new Map(PAYMENT_METHODS.map((m) => [m.id, m]));
const BY_LABEL = new Map(PAYMENT_METHODS.map((m) => [m.label, m]));

export const paymentLabel = (id: PaymentMethodId): string => BY_ID.get(id)?.label ?? id;
export const paymentIdFromLabel = (label: string): PaymentMethodId | undefined => BY_LABEL.get(label)?.id;
