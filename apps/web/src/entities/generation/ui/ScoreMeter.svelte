<script lang="ts">
	import { Progress } from '$shared/ui/8bit';
	import { cn } from '$shared/lib/utils';
	import type { Score } from '../model/types';

	interface Props {
		score: Score;
		size?: 'sm' | 'lg';
		class?: string;
	}

	let { score, size = 'sm', class: className }: Props = $props();

	const percent = $derived(score.total === 0 ? 0 : (score.passed / score.total) * 100);
</script>

<span class={cn('inline-flex items-center gap-3', className)}>
	<span class={cn('retro tabular-nums', size === 'lg' ? 'text-base' : 'text-xs')} aria-hidden="true">
		{score.passed}/{score.total}
	</span>
	<Progress
		variant="retro"
		value={percent}
		segments={score.total}
		progressBg="bg-accent"
		class={cn(size === 'lg' ? 'h-4 w-36' : 'h-2.5 w-20')}
		aria-label="{score.passed} of {score.total} criteria passed"
		aria-valuetext="{score.passed} of {score.total}"
	/>
</span>
