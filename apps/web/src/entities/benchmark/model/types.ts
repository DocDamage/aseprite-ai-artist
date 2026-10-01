import type { CraftView, FileView, Score } from '$entities/generation/@x/benchmark';
import type { PromptView } from '$entities/prompt/@x/benchmark';

export interface RunView {
	id: string;
	title: string;
	date: string;
	score: Score;
}

export interface CellView {
	modelLabel: string;
	plugin: string;
	best: Score;
	/** Craft of the best run; null when no judge has rated it. */
	craft: CraftView | null;
	runs: RunView[];
	/** Per-criterion outcome of the best run, in the prompt's criterion order. */
	bestResults: { criterion: string; pass: boolean; note?: string }[];
}

/** A run on an older revision of the prompt: listed, never ranked. */
export interface OutdatedRunView {
	id: string;
	title: string;
	modelLabel: string;
	plugin: string;
	revision: number;
}

export interface BenchmarkView {
	prompt: PromptView;
	versions: string[];
	models: string[];
	cells: CellView[];
	outdatedRuns: OutdatedRunView[];
}

export interface LeaderboardEntryView {
	modelLabel: string;
	score: number;
	/** Mean craft, 0–1, over rated benchmarks; null when none is rated. */
	craft: number | null;
	benchmarks: number;
	runs: number;
}

export interface BenchmarkCardView {
	id: string;
	title: string;
	summary: string;
	revision: number;
	criteria: number;
	chips: string[];
	steps: number;
	runs: number;
	/** Id of the best ranked run, whose cover represents the benchmark. */
	coverRun: string | null;
	/** The three strongest models, each with its best run. */
	top: { modelLabel: string; plugin: string; best: Score; run: string }[];
}

/** A benchmark card together with the cover image of its best run. */
export interface BenchmarkCardWithCover extends BenchmarkCardView {
	cover: FileView | null;
}
