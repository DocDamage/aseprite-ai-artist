import type { FileRole } from '@pebbly/gallery';

export interface Score {
	passed: number;
	total: number;
}

export interface FileView {
	name: string;
	role: FileRole;
	label?: string;
	step?: number;
	bytes: number;
	extension: string;
	url: string;
	/** Intrinsic pixel size of an image file; null for non-images or an unreadable header. */
	width: number | null;
	height: number | null;
	/**
	 * Screen pixels per art pixel already baked into the file (an 8× export is 8). Pages
	 * divide it out and re-scale by whole numbers, so every art pixel stays square.
	 */
	pixel: number;
}

export interface StepView {
	title?: string;
	text: string;
	model?: string;
	interventions: string[];
}

export interface CriterionView {
	id: string;
	step: number;
	text: string;
}

export interface CriterionResultView {
	criterion: string;
	pass: boolean;
	note?: string;
	/** Missing when the run used an older revision whose criterion no longer exists. */
	text?: string;
	step?: number;
}

export interface GenerationSummary {
	id: string;
	title: string;
	date: string;
	author: { name: string; github?: string };
	plugin: string;
	harness: string;
	models: string[];
	modelLabel: string;
	tags: string[];
	cover: FileView;
	benchmark: { prompt: string; promptTitle: string; revision: number } | null;
	score: Score | null;
	outdated: boolean;
	/** Lower-cased text the gallery's search box matches against. */
	search: string;
}

export interface GenerationDetail extends GenerationSummary {
	description?: string;
	steps: StepView[];
	files: FileView[];
	validate: { step: number; passed: boolean; score?: number; errors: number; warnings: number }[];
	results: CriterionResultView[];
	/** The run's own generation.yaml, verbatim. */
	yaml: string;
	githubUrl: string;
}

/** What each facet filter offers. */
export interface Facets {
	models: string[];
	plugins: string[];
	harnesses: string[];
	prompts: { id: string; title: string }[];
	tags: string[];
}
