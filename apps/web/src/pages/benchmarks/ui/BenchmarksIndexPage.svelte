<script lang="ts">
	import { resolve } from '$app/paths';
	import ChecklistIcon from '~icons/pixelarticons/checklist';
	import NoteIcon from '~icons/pixelarticons/note';
	import PlayIcon from '~icons/pixelarticons/play';
	import TrophyIcon from '~icons/pixelarticons/trophy';
	import { Badge, Progress, Table } from '$shared/ui/8bit';
	import { ArtCard } from '$shared/ui/pixel';
	import { plural } from '$shared/lib/format';
	import { RUBRIC_URL, SITE_NAME } from '$shared/lib/site';
	import { ScoreMeter } from '$entities/generation';
	import type { BenchmarksPageData } from '../model/types';

	interface Props {
		data: BenchmarksPageData;
	}

	let { data }: Props = $props();

	const { total, leaderboard, cards } = $derived(data);

	const explainerSteps = [
		{ icon: NoteIcon, title: 'Fixed prompts', body: 'Same words, canvas and palette for every model.' },
		{ icon: PlayIcon, title: 'Run in Aseprite', body: 'The model draws through the plugin, one session per step.' },
		{ icon: ChecklistIcon, title: 'Scored', body: 'Each criterion is a yes-or-no check on the finished files.' }
	];
</script>

<svelte:head>
	<title>Benchmarks: {SITE_NAME}</title>
	<meta
		name="description"
		content="Fixed pixel-art tasks run by different models on different plugin versions, scored criterion by criterion."
	/>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
	<h1 class="text-2xl sm:text-4xl">Benchmarks</h1>
	<p class="text-muted-foreground mt-4 max-w-[62ch] text-lg">
		How well each model draws pixel art through the plugin, on the same fixed tasks.
	</p>

	<section class="mt-10" aria-labelledby="leaderboard">
		<h2 id="leaderboard" class="flex items-center gap-3 text-lg sm:text-2xl">
			<TrophyIcon class="text-accent-ink" aria-hidden="true" />Leaderboard
		</h2>
		<p class="text-muted-foreground mt-2 text-sm">
			Each model's best score per benchmark, averaged over the benchmarks it has been run on.
		</p>
		<p class="text-muted-foreground mt-1 text-sm">
			Compliance ranks first; craft, judged 0–4 on five axes, breaks ties.
			<a href={RUBRIC_URL} class="underline underline-offset-4" rel="noopener">Read the rubric</a>.
		</p>
		{#if leaderboard.length > 0}
			<div class="mt-6 overflow-x-auto px-2 pb-2">
				<Table.Root font="normal" containerClass="w-full min-w-max" class="text-sm">
					<caption class="sr-only">Models ranked by their mean best score</caption>
					<Table.Header>
						<Table.Row>
							<Table.Head class="retro w-12 text-[0.625rem]">#</Table.Head>
							<Table.Head class="retro text-[0.625rem]">Model</Table.Head>
							<Table.Head class="retro text-[0.625rem]">Score</Table.Head>
							<Table.Head class="retro text-[0.625rem]">Craft</Table.Head>
							<Table.Head class="retro text-[0.625rem]">Coverage</Table.Head>
							<Table.Head class="retro text-right text-[0.625rem]">Runs</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each leaderboard as entry, rank (entry.modelLabel)}
							<Table.Row class="last:border-b-0">
								<Table.Cell class={['retro text-xs tabular-nums', rank === 0 && 'text-accent-ink']}>{rank + 1}</Table.Cell>
								<Table.Head scope="row" class="text-foreground font-medium">{entry.modelLabel}</Table.Head>
								<Table.Cell>
									<span class="flex items-center gap-3">
										<span class="retro w-10 text-xs tabular-nums">{Math.round(entry.score * 100)}%</span>
										<Progress
											variant="retro"
											value={entry.score * 100}
											segments={10}
											progressBg="bg-accent"
											class="h-2.5 w-28"
											aria-label="Mean best score {Math.round(entry.score * 100)} percent"
										/>
									</span>
								</Table.Cell>
								<Table.Cell class="retro text-xs tabular-nums">
									{#if entry.craft === null}<span class="text-muted-foreground" aria-label="Unrated">—</span>{:else}{Math.round(entry.craft * 100)}%{/if}
								</Table.Cell>
								<Table.Cell class="tabular-nums">{entry.benchmarks}/{total} benchmarks</Table.Cell>
								<Table.Cell class="text-right tabular-nums">{entry.runs}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{:else}
			<p class="text-muted-foreground border-pixel mt-6 pixel-notch [--notch:6px] border-6 border-dashed p-4 text-sm">
				No model has been ranked yet. The maintainers run the benchmarks; new models are added as they are tested.
			</p>
		{/if}
	</section>

	<section class="mt-16" aria-labelledby="all-benchmarks">
		<h2 id="all-benchmarks" class="text-lg sm:text-2xl">All benchmarks</h2>
		<ul class="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 px-1.5 sm:grid-cols-2 lg:grid-cols-3">
			{#each cards as card (card.id)}
				<li>
					<ArtCard
						href={resolve('/benchmarks/[prompt]', { prompt: card.id })}
						art={card.cover ? { src: card.cover.url, width: card.cover.width, height: card.cover.height, pixel: card.cover.pixel } : null}
						alt={card.title}
						title={card.title}
						class="h-full"
					>
						{#snippet empty()}
							<span class="retro text-muted-foreground text-[0.625rem]">Not run yet</span>
						{/snippet}
						{#snippet caption()}
							<p class="text-muted-foreground text-sm">{card.summary}</p>
							<ul class="flex flex-wrap gap-x-3 gap-y-2 px-1.5 pt-1.5" aria-label="What it tests">
								{#each card.chips as chip (chip)}
									<li><Badge variant="secondary" class="text-[0.625rem]">{chip}</Badge></li>
								{/each}
							</ul>
							{#if card.top.length > 0}
								<ol class="space-y-2 pt-2 text-sm">
									{#each card.top as entry, rank (entry.modelLabel)}
										<li class="flex items-center gap-2">
											<span class="retro text-muted-foreground w-5 text-[0.625rem]">{rank + 1}</span>
											<span class="min-w-0 flex-1 truncate">{entry.modelLabel}</span>
											<ScoreMeter score={entry.best} />
										</li>
									{/each}
								</ol>
							{:else}
								<p class="text-muted-foreground pt-2 text-sm">Waiting for its first maintainer run.</p>
							{/if}
							<p class="text-muted-foreground text-xs">{plural(card.steps, 'step')}, {plural(card.runs, 'ranked run')}</p>
						{/snippet}
					</ArtCard>
				</li>
			{:else}
				<li class="text-muted-foreground">No benchmark prompts are defined yet.</li>
			{/each}
		</ul>
	</section>
	<section aria-label="How a benchmark works" class="mt-16">
		<ol class="grid gap-4 sm:grid-cols-3 sm:gap-6">
			{#each explainerSteps as step, index (step.title)}
				<li class="border-pixel flex items-start gap-3 border-l-4 pl-3">
					<step.icon class="text-accent-ink shrink-0" aria-hidden="true" />
					<div>
						<p class="retro text-[0.625rem] leading-relaxed">{index + 1}. {step.title}</p>
						<p class="text-muted-foreground mt-1 text-sm">{step.body}</p>
					</div>
				</li>
			{/each}
		</ol>
		<p class="text-muted-foreground mt-4 text-xs">
			Benchmarks are run by the maintainers; new models are added as they are tested. A prompt's revision changes when
			its wording or criteria do, and only runs on the current revision are ranked.
		</p>
	</section>

</div>
