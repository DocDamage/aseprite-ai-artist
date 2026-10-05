<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/8bit/select.tsx
	import type { ComponentProps } from 'svelte';
	import { SelectItem as ShadcnSelectItem } from '#shared/ui/select/index.js';
	import { cn } from '#shared/lib/utils.js';

	let {
		class: className,
		children,
		...restProps
	}: ComponentProps<typeof ShadcnSelectItem> = $props();
</script>

<ShadcnSelectItem
	{...restProps}
	{children}
	class={cn(
		className,
		'rounded-none border-y-3 border-dashed border-ring/0 hover:border-foreground dark:hover:border-ring'
	)}
/>
