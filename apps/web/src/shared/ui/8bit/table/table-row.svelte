<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/8bit/table.tsx
	import type { HTMLAttributes } from 'svelte/elements';
	import { TableRow as ShadcnTableRow } from '$shared/ui/table';
	import { cn } from '$shared/lib/utils';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLTableRowElement> = $props();
</script>

<ShadcnTableRow {...restProps} class={cn(className, 'border-foreground dark:border-ring border-b-4 border-dashed')}>
	{@render children?.()}
</ShadcnTableRow>
