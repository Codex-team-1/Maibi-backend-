export interface PaletteColor {
  name: string;
  hex: string;
}

export const COLOR_PALETTE: readonly PaletteColor[] = [
  // Basics
  { name: 'White',      hex: '#FFFFFF' },
  { name: 'Black',      hex: '#1A1A1A' },
  { name: 'Grey',       hex: '#9CA3AF' },
  { name: 'Red',        hex: '#EF4444' },
  { name: 'Orange',     hex: '#F97316' },
  { name: 'Yellow',     hex: '#EAB308' },
  { name: 'Green',      hex: '#22C55E' },
  { name: 'Blue',       hex: '#3B82F6' },
  { name: 'Purple',     hex: '#A855F7' },
  { name: 'Pink',       hex: '#EC4899' },
  { name: 'Brown',      hex: '#92400E' },
  // Fashion tones
  { name: 'Ivory',      hex: '#FAF3E0' },
  { name: 'Beige',      hex: '#E8D5B7' },
  { name: 'Cream',      hex: '#FAFAF5' },
  { name: 'Caramel',    hex: '#C8814A' },
  { name: 'Terracotta', hex: '#C4785A' },
  { name: 'Bordeaux',   hex: '#7B1C2C' },
  { name: 'Navy',       hex: '#1B2A4A' },
  { name: 'Blush',      hex: '#F8C8DE' },
  { name: 'Rose',       hex: '#F45DAB' },
  { name: 'Gold',       hex: '#D9A45B' },
  { name: 'Lavender',   hex: '#C9B8E8' },
  { name: 'Sage',       hex: '#8FA98C' },
  { name: 'Coral',      hex: '#E87B6C' },
];
