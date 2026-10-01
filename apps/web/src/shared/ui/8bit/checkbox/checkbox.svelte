<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/8bit/checkbox.tsx,
	// with shadcn's checkbox inlined: this site has no plain checkbox to wrap.
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import CheckIcon from '~icons/pixelarticons/check';
	import { cn, type WithoutChildrenOrChild } from '$shared/lib/utils';

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		class: className,
		...restProps
	}: WithoutChildrenOrChild<CheckboxPrimitive.RootProps> = $props();
</script>

<div class={cn('border-foreground dark:border-ring relative flex shrink-0 items-center justify-center border-y-[6px]', className)}>
	<CheckboxPrimitive.Root
		bind:ref
		bind:checked
		data-slot="checkbox"
		class="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-ring peer grid size-6 place-content-center outline-offset-4 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50"
		{...restProps}
	>
		{#snippet children({ checked })}
			{#if checked}<CheckIcon aria-hidden="true" />{/if}
		{/snippet}
	</CheckboxPrimitive.Root>
	<div class="border-foreground dark:border-ring pointer-events-none absolute inset-0 -mx-1.5 border-x-[6px]" aria-hidden="true"></div>
</div>
