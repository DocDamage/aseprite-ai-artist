<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/8bit/select.tsx
	import type { ComponentProps } from 'svelte';
	import { SelectContent as ShadcnSelectContent } from '$shared/ui/select';
	import { cn } from '$shared/lib/utils';

	let {
		class: className,
		font,
		children,
		...restProps
	}: ComponentProps<typeof ShadcnSelectContent> & { font?: 'normal' | 'retro' } = $props();
</script>

<ShadcnSelectContent
	{...restProps}
	class={cn(
		font !== 'normal' && 'retro',
		className,
		'border-foreground dark:border-ring relative mt-1 -ml-1 rounded-none border-4'
	)}
>
	{@render children?.()}
</ShadcnSelectContent>
