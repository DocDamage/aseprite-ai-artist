import { gallery } from '#entities/generation/index.server.js';
import { SITE_URL } from '#shared/lib/site.js';

interface Entry {
	path: string;
	lastmod?: string;
}

/**
 * Every public page. Kept as an explicit list rather than crawled: a page that should not be
 * indexed (the raw file routes, the 404) simply is not here. A new top-level page is added
 * here by hand.
 */
export function sitemapXml(): string {
	const { generations, prompts } = gallery();
	const newest = generations
		.map((generation) => generation.date)
		.sort()
		.at(-1);
	const entries: Entry[] = [
		{ path: '/', lastmod: newest },
		{ path: '/plugin' },
		{ path: '/plugin/install' },
		{ path: '/gallery', lastmod: newest },
		{ path: '/benchmarks' },
		{ path: '/contribute' },
		...prompts.flatMap((prompt) => [
			{ path: `/benchmarks/${prompt.id}` },
			{ path: `/benchmarks/${prompt.id}/compare` }
		]),
		...generations.map((generation) => ({ path: `/g/${generation.id}`, lastmod: generation.date }))
	];
	// Paths are route slugs, so `&` is the only character XML needs escaped in them.
	const urls = entries
		.map(
			({ path, lastmod }) =>
				`<url><loc>${`${SITE_URL}${path}`.replace(/&/g, '&amp;')}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}</url>`
		)
		.join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
