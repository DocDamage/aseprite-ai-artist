import type { BenchmarkCardView } from '#entities/benchmark/index.js';
import type { GenerationSummary } from '#entities/generation/index.js';

export interface HomePageData {
	counts: { generations: number; models: number; prompts: number };
	/** The newest pieces, newest first. */
	latest: GenerationSummary[];
	/** One entry per benchmark, for the "The benchmark" section. */
	teasers: BenchmarkCardView[];
}
