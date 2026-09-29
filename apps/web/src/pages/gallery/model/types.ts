import type { Facets, GenerationSummary } from '$entities/generation';

export interface GalleryPageData {
	/** Every piece, newest first. */
	generations: GenerationSummary[];
	facets: Facets;
}
