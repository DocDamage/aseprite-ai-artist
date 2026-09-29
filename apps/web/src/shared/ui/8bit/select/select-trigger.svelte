<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/8bit/select.tsx
	import type { ComponentProps } from 'svelte';
	import { SelectTrigger as ShadcnSelectTrigger } from '$shared/ui/select';
	import { cn } from '$shared/lib/utils';

	let {
		class: className,
		font,
		children,
		...restProps
	}: ComponentProps<typeof ShadcnSelectTrigger> & { font?: 'normal' | 'retro' } = $props();
</script>

<div class={cn('border-foreground dark:border-ring relative border-y-6', className, font !== 'normal' && 'retro')}>
	<ShadcnSelectTrigger {...restProps} class={cn('w-full rounded-none border-0 ring-0', className)}>
		{@render children?.()}
	</ShadcnSelectTrigger>
	<div
		class="border-foreground dark:border-ring pointer-events-none absolute inset-0 -mx-1.5 border-x-6"
		aria-hidden="true"
	></div>
</div>
