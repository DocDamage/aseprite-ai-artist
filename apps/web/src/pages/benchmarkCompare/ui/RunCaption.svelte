<script lang="ts">
	import { resolve } from '$app/paths';
	import { ScoreMeter } from '#entities/generation/index.js';
	import { formatDate } from '#shared/lib/format.js';
	import type { CompareRun } from '../model/types';

	interface Props {
		run: CompareRun;
		/** An extra line, e.g. the animation's own length and the speed it plays at here. */
		note?: string;
	}

	let { run, note }: Props = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-2 text-sm">
	<div>
		<a href={resolve('/g/[id]', { id: run.id })} class="font-medium text-foreground hover:underline"
			>{run.modelLabel}</a
		>
		<span class="block text-muted-foreground">
			v{run.plugin} in {run.harness}, {formatDate(run.date)}{#if run.outdated}, unranked{/if}
		</span>
		{#if note}<span class="block text-muted-foreground">{note}</span>{/if}
	</div>
	{#if run.points !== null}
		<ScoreMeter points={run.points} />
	{/if}
</div>
