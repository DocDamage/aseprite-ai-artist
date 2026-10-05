<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/8bit/checkbox.tsx,
	// with shadcn's checkbox inlined: this site has no plain checkbox to wrap.
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import CheckIcon from '~icons/pixelarticons/check';
	import { cn, type WithoutChildrenOrChild } from '#shared/lib/utils.js';

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		class: className,
		...restProps
	}: WithoutChildrenOrChild<CheckboxPrimitive.RootProps> = $props();
</script>

<div
	class={cn(
		'relative flex shrink-0 items-center justify-center border-y-[6px] border-foreground dark:border-ring',
		className
	)}
>
	<CheckboxPrimitive.Root
		bind:ref
		bind:checked
		data-slot="checkbox"
		class="peer grid size-6 place-content-center outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
		{...restProps}
	>
		{#snippet children({ checked })}
			{#if checked}<CheckIcon aria-hidden="true" />{/if}
		{/snippet}
	</CheckboxPrimitive.Root>
	<div
		class="pointer-events-none absolute inset-0 -mx-1.5 border-x-[6px] border-foreground dark:border-ring"
		aria-hidden="true"
	></div>
</div>
