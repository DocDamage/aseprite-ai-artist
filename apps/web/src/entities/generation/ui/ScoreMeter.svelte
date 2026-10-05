<script lang="ts">
	import { Progress } from '$shared/ui/8bit';
	import { cn } from '$shared/lib/utils';

	interface Props {
		/** Composite score, integer 0–100. */
		points: number;
		size?: 'sm' | 'lg';
		class?: string;
	}

	let { points, size = 'sm', class: className }: Props = $props();
</script>

<span class={cn('inline-flex items-center gap-3', className)}>
	<span class={cn('retro text-right tabular-nums', size === 'lg' ? 'w-12 text-base' : 'w-8 text-xs')} aria-hidden="true">
		{points}
	</span>
	<Progress
		variant="retro"
		value={points}
		segments={10}
		progressBg="bg-accent"
		class={cn(size === 'lg' ? 'h-4 w-36' : 'h-2.5 w-20')}
		aria-label="Score {points} out of 100"
		aria-valuetext="{points} out of 100"
	/>
</span>
