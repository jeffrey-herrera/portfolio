import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const thoughts = await getCollection('thoughts');
  const sorted = thoughts.sort(
    (a, b) => (b.data.publishedAt?.valueOf() ?? 0) - (a.data.publishedAt?.valueOf() ?? 0)
  );
  return rss({
    title: 'Jeff Herrera — Thoughts',
    description: 'Design thinking, process, and perspective.',
    site: context.site?.href ?? 'https://jeffherrera.com',
    items: sorted.map(t => ({
      title: t.data.title,
      description: t.data.description,
      pubDate: t.data.publishedAt,
      link: `/thoughts/${t.slug}`,
    })),
  });
}
