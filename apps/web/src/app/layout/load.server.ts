import { json } from '@sveltejs/kit';
import { repoStats } from '#shared/api/index.server.js';

/**
 * Data every page shares; the star count shows in the header. Null when GitHub was
 * unreachable. Prerendered pages carry the count from their build; the header then refreshes
 * it from /api/stars, which is cached on the same two-hour window as /plugin.
 */
export async function load(): Promise<{ stars: number | null }> {
	return { stars: (await repoStats())?.stars ?? null };
}

/** GET /api/stars → `{ stars: number | null }`. */
export async function starsResponse(): Promise<Response> {
	return json(await load());
}
