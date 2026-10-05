<script lang="ts">
	import { resolve } from '$app/paths';
	import ChecklistIcon from '~icons/pixelarticons/checklist';
	import NoteIcon from '~icons/pixelarticons/note';
	import PlayIcon from '~icons/pixelarticons/play';
	import TrophyIcon from '~icons/pixelarticons/trophy';
	import { Badge, Table } from '#shared/ui/8bit/index.js';
	import { ArtCard } from '#shared/ui/pixel/index.js';
	import { plural } from '#shared/lib/format.js';
	import { RUBRIC_URL } from '#shared/lib/site.js';
	import { Seo } from '#shared/ui/seo/index.js';
	import { ScoreMeter } from '#entities/generation/index.js';
	import type { BenchmarksPageData } from '../model/types';

	interface Props {
		data: BenchmarksPageData;
	}

	let { data }: Props = $props();

	const { total, leaderboard, cards } = $derived(data);

	const explainerSteps = [
		{
			icon: NoteIcon,
			title: 'Fixed prompts',
			body: 'Same words, canvas and palette for every model.'
		},
		{
			icon: PlayIcon,
			title: 'Run in Aseprite',
			body: 'The model draws through the plugin, one session per step.'
		},
		{
			icon: ChecklistIcon,
			title: 'Scored',
			body: 'Each criterion is a yes-or-no check on the finished files.'
		}
	];
</script>

<Seo
	title="AI pixel art benchmarks"
	description="Fixed pixel-art tasks run by different models on different plugin versions, scored criterion by criterion."
/>

<div class="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
	<h1 class="text-2xl sm:text-4xl">Benchmarks</h1>
	<p class="mt-4 max-w-[62ch] text-lg text-muted-foreground">
		How well each model draws pixel art through the plugin, on the same fixed tasks.
	</p>

	<section class="mt-10" aria-labelledby="leaderboard">
		<h2 id="leaderboard" class="flex items-center gap-3 text-lg sm:text-2xl">
			<TrophyIcon class="text-accent-ink" aria-hidden="true" />Leaderboard
		</h2>
		<p class="mt-2 text-sm text-muted-foreground">
			Score is 0–100: 50% criteria passed, 35% craft from human judges, 15% speed relative to the
			fastest run of each benchmark. A run with no recorded time is scored on criteria and craft
			alone. Each model's best run per benchmark counts, averaged over every benchmark; unrated
			craft and benchmarks it has not run count as 0.
			<a href={RUBRIC_URL} class="underline underline-offset-4" rel="noopener">Read the rubric</a>.
		</p>
		{#if leaderboard.length > 0}
			<div class="mt-6 overflow-x-auto px-2 pb-2">
				<Table.Root font="normal" containerClass="w-full min-w-max" class="text-sm">
					<caption class="sr-only">Models ranked by their mean score out of 100</caption>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-12 retro text-[0.625rem]">#</Table.Head>
							<Table.Head class="retro text-[0.625rem]">Model</Table.Head>
							<Table.Head class="retro text-[0.625rem]">Score</Table.Head>
							<Table.Head class="retro text-[0.625rem]">Compliance</Table.Head>
							<Table.Head class="retro text-[0.625rem]">Craft</Table.Head>
							<Table.Head class="retro text-[0.625rem]">Speed</Table.Head>
							<Table.Head class="retro text-[0.625rem]">Coverage</Table.Head>
							<Table.Head class="text-right retro text-[0.625rem]">Runs</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each leaderboard as entry, rank (entry.modelLabel)}
							<Table.Row class="last:border-b-0">
								<Table.Cell class={['retro text-xs tabular-nums', rank === 0 && 'text-accent-ink']}
									>{rank + 1}</Table.Cell
								>
								<Table.Head scope="row" class="font-medium text-foreground"
									>{entry.modelLabel}</Table.Head
								>
								<Table.Cell>
									<ScoreMeter points={Math.round(entry.score)} />
								</Table.Cell>
								<Table.Cell class="retro text-xs tabular-nums"
									>{Math.round(entry.compliance * 100)}%</Table.Cell
								>
								<Table.Cell class="retro text-xs tabular-nums"
									>{Math.round(entry.craft * 100)}%</Table.Cell
								>
								<Table.Cell class="retro text-xs tabular-nums"
									>{Math.round(entry.speed * 100)}%</Table.Cell
								>
								<Table.Cell class="tabular-nums">{entry.benchmarks}/{total} benchmarks</Table.Cell>
								<Table.Cell class="text-right tabular-nums">{entry.runs}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{:else}
			<p
				class="pixel-notch mt-6 border-6 border-dashed border-pixel p-4 text-sm text-muted-foreground [--notch:6px]"
			>
				No model has been ranked yet. The maintainers run the benchmarks; new models are added as
				they are tested.
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
						art={card.cover
							? {
									src: card.cover.url,
									width: card.cover.width,
									height: card.cover.height,
									pixel: card.cover.pixel
								}
							: null}
						alt={card.title}
						title={card.title}
						class="h-full"
					>
						{#snippet empty()}
							<span class="retro text-[0.625rem] text-muted-foreground">Not run yet</span>
						{/snippet}
						{#snippet caption()}
							<p class="text-sm text-muted-foreground">{card.summary}</p>
							<ul class="flex flex-wrap gap-x-3 gap-y-2 px-1.5 pt-1.5" aria-label="What it tests">
								{#each card.chips as chip (chip)}
									<li><Badge variant="secondary" class="text-[0.625rem]">{chip}</Badge></li>
								{/each}
							</ul>
							{#if card.top.length > 0}
								<ol class="space-y-2 pt-2 text-sm">
									{#each card.top as entry, rank (entry.modelLabel)}
										<li class="flex items-center gap-2">
											<span class="w-5 retro text-[0.625rem] text-muted-foreground">{rank + 1}</span
											>
											<span class="min-w-0 flex-1 truncate">{entry.modelLabel}</span>
											<ScoreMeter points={entry.points} />
										</li>
									{/each}
								</ol>
							{:else}
								<p class="pt-2 text-sm text-muted-foreground">
									Waiting for its first maintainer run.
								</p>
							{/if}
							<p class="text-xs text-muted-foreground">
								{plural(card.steps, 'step')}, {plural(card.runs, 'ranked run')}
							</p>
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
				<li class="flex items-start gap-3 border-l-4 border-pixel pl-3">
					<step.icon class="shrink-0 text-accent-ink" aria-hidden="true" />
					<div>
						<p class="retro text-[0.625rem] leading-relaxed">{index + 1}. {step.title}</p>
						<p class="mt-1 text-sm text-muted-foreground">{step.body}</p>
					</div>
				</li>
			{/each}
		</ol>
		<p class="mt-4 text-xs text-muted-foreground">
			Benchmarks are run by the maintainers; new models are added as they are tested. A prompt's
			revision changes when its wording or criteria do, and only runs on the current revision are
			ranked.
		</p>
	</section>
</div>
