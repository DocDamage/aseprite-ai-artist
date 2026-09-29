<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/8bit/card.tsx
	import type { HTMLAttributes } from 'svelte/elements';
	import { CardFooter as ShadcnCardFooter } from '$shared/ui/card';
	import { cn } from '$shared/lib/utils';

	let {
		class: className,
		font,
		children,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & { font?: 'normal' | 'retro' } = $props();
</script>

<ShadcnCardFooter {...restProps} class={cn(font !== 'normal' && 'retro', className)}>
	{@render children?.()}
</ShadcnCardFooter>
