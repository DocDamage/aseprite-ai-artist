import type { Facets, GenerationSummary } from '#entities/generation/index.js';

export interface GalleryPageData {
	/** Every piece, newest first. */
	generations: GenerationSummary[];
	facets: Facets;
}
