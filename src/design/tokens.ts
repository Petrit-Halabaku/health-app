// Single source of truth for colors used in JS (Chart.js + Three.js).
// Mirror any change here in tailwind.config.js and src/index.css.

export const PAPER = '#F7F7F2';
export const PAPER_RAISED = '#FCFCF9';
export const INK = '#0B0F14';
export const INK_SOFT = '#262B31';
export const INK_MUTE = '#586068';
export const INK_FAINT = '#8B939B';
export const LINE = '#E4E3DA';
export const BRAND = '#0D9488';

/**
 * Editorial categorical palette — muted, paper-friendly, mutually distinguishable.
 * Used to color causes of death, demographic groups, etc.
 */
export const DATA_PALETTE = [
  '#0D9488', // teal (brand)
  '#1D4E73', // steel blue
  '#B45309', // ochre
  '#9F1239', // crimson
  '#5B3FA8', // violet
  '#3F6212', // moss
  '#0E7490', // deep cyan
  '#A1410B', // burnt sienna
  '#7A1546', // plum
  '#3730A3', // indigo
  '#86591A', // bronze
  '#157347', // pine
];

export function colorForIndex(i: number): string {
  return DATA_PALETTE[((i % DATA_PALETTE.length) + DATA_PALETTE.length) % DATA_PALETTE.length];
}

/** Deterministic color for a named category, so a cause keeps its hue across charts. */
export function colorForKey(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return DATA_PALETTE[h % DATA_PALETTE.length];
}

/** Convert a #rrggbb hex to an rgba() string at the given alpha. */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
