import { sitemapXml } from '#pages/sitemap/index.server.js';

export const prerender = true;

export const GET = () =>
	new Response(sitemapXml(), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
