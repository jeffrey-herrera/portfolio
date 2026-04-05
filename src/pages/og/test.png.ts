import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getFontConfig } from '../../utils/og';

export const GET: APIRoute = async () => {
  const fonts = await getFontConfig();

  const element = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: 1200,
        height: 630,
        background: '#c9303e',
        color: '#bfffe6',
        fontSize: 80,
        fontFamily: 'Uncut Sans',
        fontWeight: 700,
        alignItems: 'center',
        justifyContent: 'center',
      },
      children: 'Hello Jeff',
    },
  };

  const svg = await satori(element as any, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg).render().asPng();

  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
