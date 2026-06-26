export interface Pagination {
  page: number;
  limit: number;
  skip: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

/** Coerce raw query values into safe, capped pagination params. */
export function parsePagination(rawPage?: unknown, rawLimit?: unknown): Pagination {
  const page = Math.max(1, toInt(rawPage, 1));
  const limit = Math.min(MAX_LIMIT, Math.max(1, toInt(rawLimit, DEFAULT_LIMIT)));
  return { page, limit, skip: (page - 1) * limit };
}

export function paginate<T>(items: T[], total: number, page: number, limit: number): Paginated<T> {
  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

function toInt(value: unknown, fallback: number): number {
  const n = typeof value === 'string' ? Number.parseInt(value, 10) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(n) ? n : fallback;
}
