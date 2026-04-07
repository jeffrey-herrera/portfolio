import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getFontConfig, coverToDataUrl, computePaletteMap } from '../../../utils/og';

export async function getStaticPaths() {
  const entries = await getCollection('thoughts');
  const paletteMap = computePaletteMap(entries);
  return entries.map(entry => ({
    params: { slug: entry.slug },
    props: { entry, palette: paletteMap.get(entry.slug)! },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { entry, palette } = props;

  const coverUrl = entry.data.cover ? await coverToDataUrl(entry.data.cover) : null;
  const date = entry.data.publishedAt.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const readMins = Math.ceil((entry.body?.split(/\s+/).length ?? 100) / 200);

  // Scallop: cream circles sit at the bottom, top half hidden → bottom half cuts into card
  const SCALLOP_D = 28;
  const scallopCount = Math.ceil(1200 / SCALLOP_D) + 1;
  const scallops = Array.from({ length: scallopCount }, (_, i) => ({
    type: 'div',
    key: String(i),
    props: {
      style: {
        width: SCALLOP_D,
        height: SCALLOP_D,
        borderRadius: '50%',
        background: '#eee5dd',
        flexShrink: 0,
      },
    },
  }));

  const element = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: 1200,
        height: 630,
        fontFamily: 'PP Radio Grotesk',
        position: 'relative',
        overflow: 'hidden',
        background: palette.bg,
      },
      children: [
        // ── Left: ticket info ────────────────────────────────────────────
        {
          type: 'div',
          props: {
            style: {
              width: 600,
              height: 630,
              background: palette.bg,
              color: palette.title,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '56px 56px 60px',
            },
            children: [
              // Top: name | section label
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    fontWeight: 400,
                    letterSpacing: 2,
                    opacity: 0.5,
                  },
                  children: [
                    { type: 'span', props: { children: 'JEFF HERRERA' } },
                    { type: 'span', props: { children: 'THOUGHTS' } },
                  ],
                },
              },
              // Middle: title + desc
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: 16 },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 68,
                          fontWeight: 700,
                          lineHeight: 1.0,
                          letterSpacing: -2,
                          color: palette.title,
                        },
                        children: entry.data.title,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 20,
                          fontWeight: 400,
                          lineHeight: 1.4,
                          color: palette.title,
                          opacity: 0.65,
                        },
                        children: entry.data.description,
                      },
                    },
                  ],
                },
              },
              // Bottom: meta (date left / read right)
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '100%',
                          height: 1,
                          background: palette.title,
                          opacity: 0.2,
                          marginBottom: 20,
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 2,
                          color: palette.title,
                          opacity: 0.5,
                        },
                        children: [
                          { type: 'span', props: { children: `DATE  ${date}` } },
                          { type: 'span', props: { children: `READ  ${readMins} MIN` } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // ── Right: cover image ───────────────────────────────────────────
        {
          type: 'div',
          props: {
            style: {
              width: 600,
              height: 630,
              overflow: 'hidden',
              display: 'flex',
              background: palette.bg,
            },
            children: coverUrl
              ? {
                  type: 'img',
                  props: {
                    src: coverUrl,
                    width: 600,
                    height: 630,
                    style: { objectFit: 'cover', opacity: 0.9, width: 600, height: 630 },
                  },
                }
              : {
                  type: 'div',
                  props: { style: { width: 600, height: 630, background: palette.bg } },
                },
          },
        },

        // ── Scallop edge ─────────────────────────────────────────────────
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              position: 'absolute',
              bottom: -SCALLOP_D / 2,
              left: 0,
              width: 1200,
              flexWrap: 'nowrap',
            },
            children: scallops,
          },
        },
      ],
    },
  };

  try {
    const svg = await satori(element as any, { width: 1200, height: 630, fonts: await getFontConfig() });
    const png = new Resvg(svg).render().asPng();
    return new Response(png, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch (e: any) {
    return new Response(`Error: ${e?.message}\nStack: ${e?.stack}`, { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
};
