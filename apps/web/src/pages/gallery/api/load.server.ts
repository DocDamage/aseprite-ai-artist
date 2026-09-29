import { facets, gallery, summary } from '$entities/generation/index.server';
import type { GalleryPageData } from '../model/types';

export function load(): GalleryPageData {
	const { generations, prompts } = gallery();
	return {
		generations: generations.map((generation) => summary(generation, prompts)),
		facets: facets(generations, prompts)
	};
}
