import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getFontConfig, coverToDataUrl } from '../../../utils/og';

export async function getStaticPaths() {
  const entries = await getCollection('work');
  return entries.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props;

  const coverUrl = entry.data.cover ? await coverToDataUrl(entry.data.cover) : null;
  const role = entry.data.role ?? 'Creative Director';

  const element = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: 1200,
        height: 630,
        fontFamily: 'PP Radio Grotesk',
        background: '#ada09c',
        overflow: 'hidden',
      },
      children: [
        // ── Cover image — full bleed top ─────────────────────────────────
        {
          type: 'div',
          props: {
            style: {
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
            },
            children: coverUrl
              ? {
                  type: 'img',
                  props: {
                    src: coverUrl,
                    width: 1200,
                    height: 542,
                    style: { objectFit: 'cover', width: 1200, height: 542 },
                  },
                }
              : {
                  type: 'div',
                  props: { style: { width: 1200, height: 542, background: '#ada09c' } },
                },
          },
        },

        // ── Cream strip ──────────────────────────────────────────────────
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: 1200,
              height: 88,
              background: '#eee5dd',
              padding: '0 52px',
              flexShrink: 0,
            },
            children: [
              // Left: logo mark + name
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 18,
                    fontWeight: 500,
                    color: '#441306',
                    letterSpacing: -0.2,
                  },
                  children: [
                    // Simplified logo — orange ring + JH letters
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          border: '2px solid #FF6900',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        },
                        children: [{
                          type: 'span',
                          props: {
                            style: {
                              fontSize: 9,
                              fontWeight: 700,
                              color: '#FF6900',
                              letterSpacing: 0.5,
                            },
                            children: 'JH',
                          },
                        }],
                      },
                    },
                    { type: 'span', props: { children: 'Jeff Herrera' } },
                  ],
                },
              },
              // Right: role
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: 18,
                    fontWeight: 400,
                    color: '#ada09c',
                    letterSpacing: -0.2,
                  },
                  children: role,
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(element as any, { width: 1200, height: 630, fonts: await getFontConfig() });
  const png = new Resvg(svg).render().asPng();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
