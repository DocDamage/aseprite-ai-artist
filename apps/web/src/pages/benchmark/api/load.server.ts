import { error } from '@sveltejs/kit';
import { benchmarkView, criterionChips } from '$entities/benchmark/index.server';
import { facets, gallery, summary } from '$entities/generation/index.server';
import { promptView } from '$entities/prompt/index.server';
import type { BenchmarkPageData } from '../model/types';

export const entries = () => gallery().prompts.map((prompt) => ({ prompt: prompt.id }));

export function load({ params }: { params: { prompt: string } }): BenchmarkPageData {
	const { benchmarks, generations, prompts } = gallery();
	const benchmark = benchmarks.find((candidate) => candidate.prompt.id === params.prompt);
	if (!benchmark) error(404, `No benchmark prompt called "${params.prompt}"`);
	const runs = generations.filter((generation) => generation.benchmark?.prompt === benchmark.prompt.id);
	return {
		benchmark: benchmarkView(benchmark, promptView(benchmark.prompt)),
		chips: criterionChips(benchmark.prompt),
		runs: runs.map((run) => summary(run, prompts)),
		facets: facets(runs, prompts)
	};
}
