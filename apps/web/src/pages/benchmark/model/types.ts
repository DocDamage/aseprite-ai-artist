import type { BenchmarkView } from '$entities/benchmark';
import type { Facets, GenerationSummary } from '$entities/generation';

export interface BenchmarkPageData {
	benchmark: BenchmarkView;
	/** Short labels for what the benchmark tests. */
	chips: string[];
	/** Every run of this prompt, newest first, including runs on older revisions. */
	runs: GenerationSummary[];
	facets: Facets;
}
