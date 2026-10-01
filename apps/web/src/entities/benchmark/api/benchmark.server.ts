import type { Benchmark, Gallery, Prompt } from '@pebbly/gallery';
import type { PromptView } from '$entities/prompt/@x/benchmark';
import type {
	BenchmarkCardView,
	BenchmarkView,
	CellView,
	LeaderboardEntryView
} from '../model/types';

const ratio = (score: { passed: number; total: number }) => score.passed / score.total;

/** The ranking of one benchmark. `prompt` is the same benchmark's prompt, already mapped. */
export function benchmarkView(benchmark: Benchmark, prompt: PromptView): BenchmarkView {
	const order = benchmark.prompt.criteria.map((criterion) => criterion.id);
	const cells: CellView[] = benchmark.cells.map((cell) => {
		const best = cell.runs[0]!;
		const results = new Map(
			(best.benchmark?.results ?? []).map((result) => [result.criterion, result])
		);
		return {
			modelLabel: cell.modelLabel,
			plugin: cell.plugin,
			best: cell.best,
			craft: cell.craft,
			runs: cell.runs.map((run) => ({
				id: run.id,
				title: run.title,
				date: run.date,
				score: run.score!
			})),
			bestResults: order.flatMap((id) => {
				const result = results.get(id);
				return result
					? [{ criterion: id, pass: result.pass, ...(result.note ? { note: result.note } : {}) }]
					: [];
			})
		};
	});
	return {
		prompt,
		versions: benchmark.versions,
		models: benchmark.models,
		cells,
		outdatedRuns: benchmark.outdatedRuns.map((run) => ({
			id: run.id,
			title: run.title,
			modelLabel: run.modelLabel,
			plugin: run.plugin,
			revision: run.benchmark!.revision
		}))
	};
}

/** Short labels for what a benchmark tests: criterion ids minus the step prefix (`slash-arc` → `arc`). */
export function criterionChips(prompt: Prompt): string[] {
	return [
		...new Set(
			prompt.criteria.map((criterion) => criterion.id.split('-').slice(1).join(' ') || criterion.id)
		)
	];
}

export function benchmarkCard(benchmark: Benchmark): BenchmarkCardView {
	const runs = benchmark.cells.flatMap((cell) => cell.runs);
	// The preview is the best-looking run, not the highest-scoring one: compliance says a run
	// followed the brief, craft says it is worth looking at. Unrated runs come last; score and
	// then recency break ties.
	const cover = [...runs].sort(
		(a, b) =>
			(b.craft?.score ?? -1) - (a.craft?.score ?? -1) ||
			ratio(b.score!) - ratio(a.score!) ||
			b.date.localeCompare(a.date)
	)[0];
	const top = benchmark.models.slice(0, 3).map((modelLabel) => {
		const cell = benchmark.cells
			.filter((candidate) => candidate.modelLabel === modelLabel)
			.sort((a, b) => ratio(b.best) - ratio(a.best))[0]!;
		return { modelLabel, plugin: cell.plugin, best: cell.best, run: cell.runs[0]!.id };
	});
	return {
		id: benchmark.prompt.id,
		title: benchmark.prompt.title,
		summary: benchmark.prompt.summary.split(/(?<=\.)\s/)[0]!,
		revision: benchmark.prompt.revision,
		criteria: benchmark.prompt.criteria.length,
		chips: criterionChips(benchmark.prompt),
		steps: benchmark.prompt.steps.length,
		runs: runs.length,
		coverRun: cover?.id ?? null,
		top
	};
}

/** The overall model ranking, without the per-benchmark cells the gallery attaches to it. */
export function leaderboardView(leaderboard: Gallery['leaderboard']): LeaderboardEntryView[] {
	return leaderboard.map((entry) => ({
		modelLabel: entry.modelLabel,
		score: entry.score,
		craft: entry.craft,
		benchmarks: entry.benchmarks,
		runs: entry.runs
	}));
}
