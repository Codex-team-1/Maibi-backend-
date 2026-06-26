export const CATEGORIES = ['Robe', 'Dress', 'Abaya', 'ensambles', 'accessoires'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  Robe:        '#F45DAB',
  Dress:       '#D9A45B',
  Abaya:       '#B07AC9',
  ensambles:   '#8FA98C',
  accessoires: '#C74B50',
};
