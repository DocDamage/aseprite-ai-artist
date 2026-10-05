<script lang="ts">
	import { SITE_NAME } from '$shared/lib/site';
	import { resolve } from '$app/paths';
	import ArrowDownIcon from '~icons/pixelarticons/arrow-down';
	import ArrowLeftIcon from '~icons/pixelarticons/arrow-left';
	import SlidersIcon from '~icons/pixelarticons/sliders';
	import { Button } from '$shared/ui/8bit';
	import { PromptTimeline } from '$widgets/promptTimeline';
	import { GalleryGrid, type FilterKey } from '$features/filterGenerations';
	import { plural } from '$shared/lib/format';
	import type { BenchmarkPageData } from '../model/types';
	import BenchmarkMatrix from './BenchmarkMatrix.svelte';
	import ContenderCard from './ContenderCard.svelte';
	import PromptCriteria from './PromptCriteria.svelte';
	import PromptMethod from './PromptMethod.svelte';

	interface Props {
		data: BenchmarkPageData;
	}

	let { data }: Props = $props();

	const { benchmark, chips, contenders, runs, facets } = $derived(data);
	const prompt = $derived(benchmark.prompt);
	const winner = $derived(contenders[0]);
	/** The stage holds the winner and up to three runners-up; the rest are in the ranking. */
	const runnersUp = $derived(contenders.slice(1, 4));
	const offStage = $derived(contenders.length - 1 - runnersUp.length);
	/** The summary's first sentence: what is being drawn. The rest explains the test, further down. */
	const lede = $derived(prompt.summary.split(/(?<=\.)\s/)[0]!);
	/** The ranking also lists unranked runs on older revisions, so it shows whenever there are any. */
	const showRanking = $derived(contenders.length > 0 || benchmark.outdatedRuns.length > 0);

	const gridKeys: FilterKey[] = ['model', 'plugin', 'harness'];
</script>

<svelte:head>
	<title>{prompt.title}: {SITE_NAME} benchmark</title>
	<meta name="description" content={prompt.summary} />
</svelte:head>

<!-- Results first: the hero is what the models actually drew, side by side, best first. How the
test works comes last, for whoever wants to check it. -->
<section class="border-pixel relative isolate overflow-hidden border-b-6" aria-labelledby="benchmark-title">
	{#if winner}
		<!-- The winning piece, blurred, tints the whole stage in its own colours. Decorative. -->
		<img
			src={winner.run.cover.url}
			alt=""
			aria-hidden="true"
			decoding="async"
			class="absolute inset-0 -z-20 size-full scale-125 object-cover opacity-35 blur-3xl saturate-150"
		/>
	{/if}
	<div class="grid-dots bg-background/60 absolute inset-0 -z-10"></div>

	<div class="mx-auto max-w-6xl px-4 pt-6 pb-14 sm:px-6 sm:pb-20">
		<a href={resolve('/benchmarks')} class="text-muted-foreground hover:text-foreground inline-flex h-10 items-center gap-1.5 text-sm">
			<ArrowLeftIcon aria-hidden="true" />
			All benchmarks
		</a>

		<h1 id="benchmark-title" class="mt-6 max-w-[28ch] text-2xl leading-snug sm:text-4xl sm:leading-snug">{prompt.title}</h1>
		<p class="text-muted-foreground mt-5 max-w-[60ch] text-lg">
			{lede}
			{#if contenders.length > 1}
				{plural(contenders.length, 'model')} got the same prompt. This is what each one drew.
			{:else if contenders.length === 1}
				This is the best run so far.
			{/if}
		</p>

		{#if winner}
			<div
				class={[
					'mt-10 grid gap-6 px-1.5 sm:gap-8',
					runnersUp.length > 0 ? 'lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]' : 'max-w-2xl'
				]}
			>
				<ContenderCard contender={winner} place={1} lead />
				{#if runnersUp.length > 0}
					<ol class="grid content-start gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-1" aria-label="Runners-up">
						{#each runnersUp as contender, index (contender.modelLabel)}
							<li><ContenderCard {contender} place={index + 2} /></li>
						{/each}
					</ol>
				{/if}
			</div>
			{#if offStage > 0}
				<p class="text-muted-foreground mt-6 text-sm">
					{plural(offStage, 'more model')} in the full ranking below.
				</p>
			{/if}
		{:else}
			<p class="text-muted-foreground canvas-checker border-pixel pixel-notch mt-10 border-6 border-dashed p-8 text-center [--notch:6px]">
				Nobody has drawn this one yet. The maintainers run the benchmarks; new models are added as they are tested.
			</p>
		{/if}

		<div class="mt-10 flex flex-wrap gap-6 px-1.5">
			{#if winner}
				<Button href="#ranking" variant="outline">
					<ArrowDownIcon aria-hidden="true" />
					Full ranking
				</Button>
			{/if}
			<Button href="#method" variant="outline">
				<ArrowDownIcon aria-hidden="true" />
				How it was tested
			</Button>
		</div>
	</div>
</section>

<div class="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
	{#if showRanking}
		<BenchmarkMatrix {benchmark} />
	{/if}

	{#if runs.length > 0}
		<section class={[showRanking && 'mt-20']} aria-labelledby="runs">
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
				{plural(runs.length, 'run')} of this prompt, newest first. Runs on an older revision are marked unranked.
			</p>
			<div class="mt-8">
				<GalleryGrid
					generations={runs}
					{facets}
					keys={gridKeys}
					path={resolve('/benchmarks/[prompt]', { prompt: prompt.id })}
				/>
			</div>
		</section>
	{/if}

	<section id="method" class={['scroll-mt-24', runs.length > 0 && 'mt-20']} aria-labelledby="method-title">
		<h2 id="method-title" class="text-lg sm:text-2xl">How it was tested</h2>
		<p class="text-muted-foreground mt-2 max-w-[62ch] text-sm">
			Every model gets this prompt word for word, on the same canvas and palette, and draws it in a live Aseprite
			window. Each criterion is a yes-or-no check on the files it hands back.
		</p>
		<div class="mt-8 px-1.5">
			<PromptMethod {prompt} {chips}>
				{#snippet timeline()}
					<PromptTimeline {prompt} />
				{/snippet}
				{#snippet criteria()}
					<PromptCriteria {prompt} />
				{/snippet}
			</PromptMethod>
		</div>
	</section>
</div>
