<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/8bit/card.tsx
	import type { HTMLAttributes } from 'svelte/elements';
	import { Card as ShadcnCard } from '$shared/ui/card';
	import { cn } from '$shared/lib/utils';

	let {
		class: className,
		font,
		children,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & { font?: 'normal' | 'retro' } = $props();
</script>

<div class={cn('bg-card text-card-foreground border-foreground dark:border-ring relative border-y-6 p-0!', className)}>
	<ShadcnCard
		{...restProps}
		class={cn(
			'bg-card text-card-foreground flex h-full w-full! flex-col rounded-none border-0 shadow-none ring-0',
			font !== 'normal' && 'retro',
			className
		)}
	>
		{@render children?.()}
	</ShadcnCard>
	<div class="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-inherit" aria-hidden="true"></div>
</div>
