<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/8bit/input.tsx
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Input as ShadcnInput } from '$shared/ui/input';
	import { cn } from '$shared/lib/utils';

	let {
		class: className,
		font,
		value = $bindable(),
		ref = $bindable(null),
		...restProps
	}: Omit<HTMLInputAttributes, 'type' | 'files'> & {
		type?: 'text' | 'search' | 'email' | 'url' | 'number' | 'password' | 'tel';
		font?: 'normal' | 'retro';
		ref?: HTMLInputElement | null;
	} = $props();
</script>

<div class={cn('border-foreground dark:border-ring relative flex items-center border-y-6 p-0!', className)}>
	<ShadcnInput
		bind:ref
		bind:value
		{...restProps}
		class={cn('w-full! rounded-none ring-0', font !== 'normal' && 'retro', className)}
	/>
	<div
		class="border-foreground dark:border-ring pointer-events-none absolute inset-0 -mx-1.5 border-x-6"
		aria-hidden="true"
	></div>
</div>
