import type {
	CraftView,
	FileView,
	Score,
	ScoreComponentsView
} from '#entities/generation/@x/benchmark.js';
import type { PromptView } from '#entities/prompt/@x/benchmark.js';

export interface RunView {
	id: string;
	title: string;
	date: string;
	score: Score;
	points: number;
}

export interface CellView {
	modelLabel: string;
	plugin: string;
	best: Score;
	/** Points (0–100) and parts of the best run. */
	points: number;
	components: ScoreComponentsView;
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
	/** Mean points, 0–100, over every benchmark of the suite. */
	score: number;
	/** Mean compliance, craft and speed, 0–1, over the same set. */
	compliance: number;
	craft: number;
	speed: number;
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
	/** Id of the highest-scoring run (compliance, craft, then date break ties), whose cover represents the benchmark. */
	coverRun: string | null;
	/** The three strongest models, each with its best run. */
	top: { modelLabel: string; plugin: string; points: number; run: string }[];
}

/** A benchmark card together with the cover image of its best run. */
export interface BenchmarkCardWithCover extends BenchmarkCardView {
	cover: FileView | null;
}
