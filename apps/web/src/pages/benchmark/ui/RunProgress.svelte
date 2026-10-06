<script lang="ts">
	import { Card } from '#shared/ui/8bit/index.js';
	import { LineChart, type ChartSeries } from '#shared/ui/chart/index.js';
	import { formatDate } from '#shared/lib/format.js';
	import type { ModelProgressView } from '#entities/benchmark/index.js';

	interface Props {
		title: string;
		progress: ModelProgressView[];
		/** Overall leaderboard order; a model's place in it picks its colour. */
		modelOrder: string[];
	}

	let { title, progress, modelOrder }: Props = $props();

	const series = $derived(
		progress.map((model, index): ChartSeries => ({
			id: model.modelLabel,
			label: model.modelLabel,
			color: modelOrder.includes(model.modelLabel)
				? modelOrder.indexOf(model.modelLabel)
				: modelOrder.length + index,
			points: model.runs.map((run) => ({
				date: run.date,
				y: run.points,
				note: `plugin v${run.plugin}`
			}))
		}))
	);
</script>

<section class="pt-24" aria-labelledby="progress">
	<h2 id="progress" class="section-title text-lg sm:text-2xl">Run by run</h2>
	<p class="mt-4 max-w-[62ch] text-sm text-muted-foreground">
		Every run of this prompt from the first one to today (a year at most), each model on its own
		line. A marker is a run; the line is solid between runs and dashed where the model did not run,
		carrying its nearest score. Point at a run to compare the models that day; pick a model below to
		bring its line to the front.
	</p>
	<div class="mt-8 px-1.5">
		<Card font="normal" class="gap-0 py-0">
			<div class="px-3 pt-6 pb-5 sm:px-6">
				<LineChart
					{series}
					formatDay={formatDate}
					label="Score out of 100 on each run of {title}"
				/>
			</div>
		</Card>
	</div>
</section>
