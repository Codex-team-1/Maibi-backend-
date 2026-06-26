/**
 * Single source of truth for price formatting — mirrors the frontend `fmt()`:
 *   fmt = (n) => `${n.toLocaleString('fr-FR')} DA`
 * Note: `fr-FR` grouping in modern Node uses a narrow no-break space (U+202F).
 * `parsePriceString` strips all non-digits, so it round-trips regardless.
 */
export const toPriceString = (n: number): string => `${n.toLocaleString('fr-FR')} DA`;

export const parsePriceString = (s: string): number => {
  const digits = s.replace(/\D/g, '');
  return digits ? Number.parseInt(digits, 10) : 0;
};
