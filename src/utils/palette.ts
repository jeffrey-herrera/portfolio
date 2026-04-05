/**
 * Shared palette utilities for thoughts cards and OG image generation.
 * Single canonical source — imported by thoughts.astro, thoughts/[...slug].astro, og.ts
 */

// ── Wada Sanzo palette (deduplicated by bg color, sorted by hue) ──────────
export const PALETTE = [{"id":16,"bg":"#740909","title":"#abf5ed","excerpt":"#abf5ed"},{"id":93,"bg":"#000000","title":"#a6e6db","excerpt":"#a6e6db"},{"id":58,"bg":"#681916","title":"#33ff7d","excerpt":"#33ff7d"},{"id":84,"bg":"#ffcfc4","title":"#0f261f","excerpt":"#0f261f"},{"id":79,"bg":"#651300","title":"#2dbc94","excerpt":"#2dbc94"},{"id":198,"bg":"#a93400","title":"#ffe600","excerpt":"#40c945"},{"id":46,"bg":"#ff5200","title":"#000000","excerpt":"#000000"},{"id":19,"bg":"#522000","title":"#7aff00","excerpt":"#7aff00"},{"id":2,"bg":"#ff8c00","title":"#0d2b52","excerpt":"#0d2b52"},{"id":4,"bg":"#c3a55c","title":"#3400a3","excerpt":"#3400a3"},{"id":50,"bg":"#ebd999","title":"#2d0060","excerpt":"#2d0060"},{"id":42,"bg":"#e0b81f","title":"#2619d1","excerpt":"#2619d1"},{"id":60,"bg":"#fff59e","title":"#0d2b52","excerpt":"#0d2b52"},{"id":22,"bg":"#ffff00","title":"#0024cc","excerpt":"#0024cc"},{"id":52,"bg":"#f5f5b8","title":"#000000","excerpt":"#000000"},{"id":168,"bg":"#f2ff26","title":"#003e83","excerpt":"#7e3075"},{"id":61,"bg":"#bdf226","title":"#340059","excerpt":"#340059"},{"id":83,"bg":"#bcd382","title":"#202d85","excerpt":"#202d85"},{"id":69,"bg":"#9cb29e","title":"#000000","excerpt":"#000000"},{"id":119,"bg":"#a6e6db","title":"#0d2b52","excerpt":"#0d2b52"},{"id":75,"bg":"#abf5ed","title":"#202d85","excerpt":"#202d85"},{"id":106,"bg":"#008aa1","title":"#06004f","excerpt":"#06004f"},{"id":56,"bg":"#bfabcc","title":"#2619d1","excerpt":"#2619d1"},{"id":346,"bg":"#b319ab","title":"#b5ffc2","excerpt":"#bdf226"},{"id":273,"bg":"#ffb3f0","title":"#6f0043","excerpt":"#9b5348"},{"id":59,"bg":"#ff5ec4","title":"#000000","excerpt":"#000000"},{"id":157,"bg":"#6f0043","title":"#d1bd19","excerpt":"#4f8fe6"},{"id":101,"bg":"#e6adcf","title":"#0024cc","excerpt":"#0024cc"},{"id":27,"bg":"#ffa6d9","title":"#1b3644","excerpt":"#1b3644"},{"id":63,"bg":"#5c2c45","title":"#29bdad","excerpt":"#29bdad"},{"id":261,"bg":"#a10045","title":"#fff59e","excerpt":"#80ffcc"},{"id":104,"bg":"#a10b2b","title":"#f5f5b8","excerpt":"#f5f5b8"},{"id":124,"bg":"#730f1f","title":"#e0b81f","excerpt":"#99b333"},{"id":25,"bg":"#c9303e","title":"#bfffe6","excerpt":"#bfffe6"},{"id":18,"bg":"#d1b0b3","title":"#2d0060","excerpt":"#2d0060"},{"id":6,"bg":"#ff616b","title":"#000831","excerpt":"#000831"}];

// ── Deterministic slug → palette index ────────────────────────────────────
export function hashSlug(slug: string): number {
  let hash = 5381;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) + hash + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % PALETTE.length;
}

// ── Hex color → HSL hue (0–360) ───────────────────────────────────────────
export function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0)
        : max === g ? (b - r) / d + 2
        : (r - g) / d + 4;
  return h * 60;
}

// ── Circular hue distance (0–180) ─────────────────────────────────────────
export function hueDist(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// ── Date formatter ─────────────────────────────────────────────────────────
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
}

// ── Assign palettes to an array of entries, avoiding hue adjacency ─────────
// Entries must have { slug, data: { publishedAt: Date } }.
// Returns a Map<slug, palette> using the same algorithm as the inline versions.
export function computePaletteMap(entries: { slug: string; data: { publishedAt: Date } }[]): Map<string, typeof PALETTE[0]> {
  const sorted = [...entries].sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
  const map = new Map<string, typeof PALETTE[0]>();
  const built: Array<{ slug: string; palette: typeof PALETTE[0] }> = [];
  for (const entry of sorted) {
    const startIdx = hashSlug(entry.slug);
    let palette = PALETTE[startIdx];
    if (built.length > 0) {
      const prevHue = hexToHue(built[built.length - 1].palette.bg);
      for (let offset = 0; offset < PALETTE.length; offset++) {
        const candidate = PALETTE[(startIdx + offset) % PALETTE.length];
        if (hueDist(hexToHue(candidate.bg), prevHue) >= 45) {
          palette = candidate;
          break;
        }
      }
    }
    built.push({ slug: entry.slug, palette });
    map.set(entry.slug, palette);
  }
  return map;
}
