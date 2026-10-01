<script lang="ts">
	import { SITE_NAME } from '$shared/lib/site';
	import { resolve } from '$app/paths';
	import ArrowLeftIcon from '~icons/pixelarticons/arrow-left';
	import SlidersIcon from '~icons/pixelarticons/sliders';
	import { Button } from '$shared/ui/8bit';
	import { PromptTimeline } from '$widgets/promptTimeline';
	import { GalleryGrid, type FilterKey } from '$features/filterGenerations';
	import { plural } from '$shared/lib/format';
	import type { BenchmarkPageData } from '../model/types';
	import BenchmarkMatrix from './BenchmarkMatrix.svelte';
	import PromptCriteria from './PromptCriteria.svelte';
	import PromptHeader from './PromptHeader.svelte';

	interface Props {
		data: BenchmarkPageData;
	}

	let { data }: Props = $props();

	const { benchmark, chips, runs, facets } = $derived(data);
	const prompt = $derived(benchmark.prompt);

	const gridKeys: FilterKey[] = ['model', 'plugin', 'harness'];
</script>

<svelte:head>
	<title>{prompt.title}: {SITE_NAME} benchmark</title>
	<meta name="description" content={prompt.summary} />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
	<a href={resolve('/benchmarks')} class="text-muted-foreground hover:text-foreground inline-flex h-10 items-center gap-1.5 text-sm">
		<ArrowLeftIcon aria-hidden="true" />
		All benchmarks
	</a>

	<div class="mt-4 px-1.5">
		<PromptHeader {prompt} {chips} standalone>
			{#snippet timeline()}
				<PromptTimeline {prompt} />
			{/snippet}
			{#snippet criteria()}
				<PromptCriteria {prompt} />
			{/snippet}
		</PromptHeader>
	</div>

	<div class="mt-14">
		<BenchmarkMatrix {benchmark} />
	</div>

	<section class="mt-16" aria-labelledby="runs">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<h2 id="runs" class="text-lg sm:text-2xl">Every run</h2>
			{#if runs.length > 1}
				<Button variant="outline" href={resolve('/benchmarks/[prompt]/compare', { prompt: prompt.id })}>
					<SlidersIcon aria-hidden="true" />
					Compare runs
				</Button>
			{/if}
		</div>
		<p class="text-muted-foreground mt-2 text-sm">
			{#if runs.length > 0}
				{plural(runs.length, 'run')} of this prompt, newest first. Runs on an older revision are marked unranked.
			{:else}
				No runs yet. The maintainers run the benchmarks; new models are added as they are tested.
			{/if}
		</p>
		{#if runs.length > 0}
			<div class="mt-8">
				<GalleryGrid
					generations={runs}
					{facets}
					keys={gridKeys}
					path={resolve('/benchmarks/[prompt]', { prompt: prompt.id })}
				/>
			</div>
		{/if}
	</section>
</div>
