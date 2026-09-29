<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/8bit/table.tsx
	import type { HTMLAttributes } from 'svelte/elements';
	import { TableHeader as ShadcnTableHeader } from '$shared/ui/table';
	import { cn } from '$shared/lib/utils';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLTableSectionElement> = $props();
</script>

<ShadcnTableHeader {...restProps} class={cn(className, 'border-foreground dark:border-ring border-b-4')}>
	{@render children?.()}
</ShadcnTableHeader>
