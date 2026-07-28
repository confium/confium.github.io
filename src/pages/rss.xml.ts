import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog')).sort((a, b) => {
    const aDate = a.data.date?.getTime() ?? 0;
    const bDate = b.data.date?.getTime() ?? 0;
    return bDate - aDate;
  });

  return rss({
    title: 'Confium Blog',
    description: 'Threshold-native trust infrastructure for a post-quantum world.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: '<language>en-us</language>',
  });
}
