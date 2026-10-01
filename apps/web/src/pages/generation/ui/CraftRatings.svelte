<script lang="ts">
	import type { CraftAxis } from '@pebbly/gallery';
	import { Table } from '$shared/ui/8bit';
	import { plural } from '$shared/lib/format';
	import { RUBRIC_URL } from '$shared/lib/site';
	import type { CraftView, RatingView } from '$entities/generation';

	interface Props {
		ratings: RatingView[];
		craft: CraftView | null;
	}

	let { ratings, craft }: Props = $props();

	// Mirrors `craftAxes` in @pebbly/gallery; importing the value would pull its node-only loader into the client.
	const axes: { id: CraftAxis; label: string }[] = [
		{ id: 'read', label: 'Read' },
		{ id: 'form', label: 'Form' },
		{ id: 'motion', label: 'Motion' },
		{ id: 'cohesion', label: 'Cohesion' },
		{ id: 'appeal', label: 'Appeal' }
	];
	const judgeLabel = (judge: string) => judge.replace(/^(human|model):/, '');
	const judgeKind = (judge: string) => (judge.startsWith('model:') ? 'model' : 'human');
</script>

<section aria-labelledby="craft">
	<h2 id="craft" class="text-sm sm:text-base">Craft</h2>
	{#if craft && ratings.length > 0}
		<p class="text-muted-foreground mt-2 text-sm">
			<span class="retro text-foreground text-xs tabular-nums">{Math.round(craft.score * 100)}%</span>
			from {plural(craft.judges, 'judge')}, each axis scored 0–4 against
			<a href={RUBRIC_URL} class="underline underline-offset-4" rel="noopener">the rubric</a>.
		</p>
		<div class="mt-5 overflow-x-auto px-2 pb-2">
			<Table.Root font="normal" containerClass="w-full min-w-max" class="text-sm">
				<caption class="sr-only">Craft scores per judge, 0 to 4 on each axis</caption>
				<Table.Header>
					<Table.Row>
						<Table.Head class="retro text-[0.625rem]">Judge</Table.Head>
						{#each axes as axis (axis.id)}
							<Table.Head class="retro text-right text-[0.625rem]">{axis.label}</Table.Head>
						{/each}
						<Table.Head class="retro text-[0.625rem]">Note</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each ratings as rating (rating.judge)}
						<Table.Row>
							<Table.Head scope="row" class="text-foreground font-medium">
								{judgeLabel(rating.judge)}
								<span class="text-muted-foreground block text-xs font-normal">{judgeKind(rating.judge)}</span>
							</Table.Head>
							{#each axes as axis (axis.id)}
								<Table.Cell class="text-right tabular-nums">{rating.scores[axis.id] ?? '—'}</Table.Cell>
							{/each}
							<Table.Cell class="text-muted-foreground max-w-[40ch] whitespace-normal">{rating.note ?? ''}</Table.Cell>
						</Table.Row>
					{/each}
					<Table.Row class="last:border-b-0">
						<Table.Head scope="row" class="retro text-foreground text-[0.625rem]">Mean</Table.Head>
						{#each axes as axis (axis.id)}
							{@const mean = craft.axes[axis.id]}
							<Table.Cell class="text-right font-medium tabular-nums">{mean === undefined ? '—' : mean.toFixed(1)}</Table.Cell>
						{/each}
						<Table.Cell class="retro text-xs tabular-nums">{Math.round(craft.score * 100)}%</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</div>
	{:else}
		<p class="text-muted-foreground mt-2 text-sm">
			Not rated yet. Judges score craft 0–4 on five axes;
			<a href={RUBRIC_URL} class="underline underline-offset-4" rel="noopener">read the rubric</a>.
		</p>
	{/if}
</section>
