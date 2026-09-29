<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/8bit/kbd.tsx
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$shared/lib/utils';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLElement> = $props();
</script>

<kbd
	data-slot="kbd"
	class={cn(
		'retro bg-muted text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium select-none',
		"[&_svg:not([class*='size-'])]:size-3",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</kbd>
