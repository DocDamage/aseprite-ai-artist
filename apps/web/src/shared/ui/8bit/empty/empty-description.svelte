<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/8bit/empty.tsx
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$shared/lib/utils';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLElement> = $props();
</script>

<p data-slot="empty-description" class={cn('text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4', className)} {...restProps}>
	{@render children?.()}
</p>
