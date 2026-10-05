<script lang="ts">
	import { resolve } from '$app/paths';
	import { ScoreMeter } from '$entities/generation';
	import { formatDate } from '$shared/lib/format';
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
		<a href={resolve('/g/[id]', { id: run.id })} class="text-foreground font-medium hover:underline">{run.modelLabel}</a>
		<span class="text-muted-foreground block">
			v{run.plugin} in {run.harness}, {formatDate(run.date)}{#if run.outdated}, unranked{/if}
		</span>
		{#if note}<span class="text-muted-foreground block">{note}</span>{/if}
	</div>
	{#if run.points !== null}
		<ScoreMeter points={run.points} />
	{/if}
</div>
