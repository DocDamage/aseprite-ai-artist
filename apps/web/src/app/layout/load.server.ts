import { repoStats } from '#shared/api/index.server.js';

/** Data every page shares; the star count shows in the header. Null when GitHub was unreachable. */
export async function load(): Promise<{ stars: number | null }> {
	return { stars: (await repoStats())?.stars ?? null };
}
