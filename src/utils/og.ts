/**
 * Shared helpers for static OG image generation.
 * Used by src/pages/og/thoughts/[slug].png.ts and src/pages/og/work/[slug].png.ts
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import sharp from 'sharp';
import { PALETTE, computePaletteMap } from './palette';

export { PALETTE, computePaletteMap };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

// ── Font buffers — pre-converted OTF files (satori requires TTF/OTF) ──────
let fontBold: Buffer;
let fontRegular: Buffer;

try {
  fontBold    = readFileSync(join(ROOT, 'public/fonts/UncutSans-Bold.otf'));
  fontRegular = readFileSync(join(ROOT, 'public/fonts/UncutSans-Regular.otf'));
} catch {
  // Fonts missing — OG generation will fall back to system fonts
  fontBold    = Buffer.alloc(0);
  fontRegular = Buffer.alloc(0);
}

export const fontConfig = [
  { name: 'Uncut Sans', data: fontBold,    weight: 700 as const, style: 'normal' as const },
  { name: 'Uncut Sans', data: fontRegular, weight: 400 as const, style: 'normal' as const },
];

export async function getFontConfig() { return fontConfig; }

// ── Cover image → base64 data URL ─────────────────────────────────────────
// Satori does not support WEBP. Convert any WEBP (or unknown format) to JPEG first.
export async function coverToDataUrl(src: string): Promise<string> {
  const filePath = join(ROOT, 'public', src.startsWith('/') ? src.slice(1) : src);
  const ext = (filePath.split('.').pop() ?? '').toLowerCase();
  const data = readFileSync(filePath);
  if (ext === 'webp' || ext === 'avif') {
    const jpeg = await sharp(data).jpeg({ quality: 90 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  }
  const mime: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
  return `data:${mime[ext] ?? 'image/jpeg'};base64,${data.toString('base64')}`;
}

// ── Scallop row — cream circles cutting up from the bottom of each card ───
const CREAM = '#eee5dd';
const SCALLOP_SIZE = 28;
const SCALLOP_COUNT = Math.ceil(1200 / SCALLOP_SIZE) + 1;

export const scallopRow = {
  type: 'div',
  props: {
    style: {
      display: 'flex',
      flexDirection: 'row' as const,
      width: 1200,
      height: SCALLOP_SIZE,
      overflow: 'hidden',
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
    },
    children: Array.from({ length: SCALLOP_COUNT }, () => ({
      type: 'div',
      props: {
        style: {
          width: SCALLOP_SIZE,
          height: SCALLOP_SIZE,
          borderRadius: '50%',
          background: CREAM,
          flexShrink: 0,
          marginTop: SCALLOP_SIZE / 2, // lower half visible → cuts up into card
        },
      },
    })),
  },
};
