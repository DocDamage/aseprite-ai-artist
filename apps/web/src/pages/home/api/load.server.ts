import { benchmarkCard } from '#entities/benchmark/index.server.js';
import { gallery, summary } from '#entities/generation/index.server.js';
import type { HomePageData } from '../model/types';

export function load(): HomePageData {
	const { generations, benchmarks, prompts } = gallery();
	return {
		counts: {
			generations: generations.length,
			models: new Set(generations.flatMap((generation) => generation.models)).size,
			prompts: prompts.length
		},
		latest: generations.slice(0, 12).map((generation) => summary(generation, prompts)),
		teasers: benchmarks.map((benchmark) => benchmarkCard(benchmark))
	};
}
