<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/8bit/toast.tsx
	let { title }: { title: string } = $props();
</script>

<div class="retro relative">
	<div class="bg-background flex w-full items-center rounded-lg p-4 shadow-lg ring-1 ring-black/5 md:max-w-[364px]">
		<div class="flex flex-1 items-center gap-3">
			<!-- Not in 8bitcn: a moss square marks the confirmation in the site's success colour. -->
			<span class="bg-secondary size-3 shrink-0" aria-hidden="true"></span>
			<div class="w-full">
				<p class="text-sm font-medium">{title}</p>
			</div>
		</div>
	</div>
	<div class="bg-foreground dark:bg-ring absolute -top-1.5 left-1.5 h-1.5 w-1/2"></div>
	<div class="bg-foreground dark:bg-ring absolute -top-1.5 right-1.5 h-1.5 w-1/2"></div>
	<div class="bg-foreground dark:bg-ring absolute -bottom-1.5 left-1.5 h-1.5 w-1/2"></div>
	<div class="bg-foreground dark:bg-ring absolute right-1.5 -bottom-1.5 h-1.5 w-1/2"></div>
	<div class="bg-foreground dark:bg-ring absolute top-0 left-0 size-1.5"></div>
	<div class="bg-foreground dark:bg-ring absolute top-0 right-0 size-1.5"></div>
	<div class="bg-foreground dark:bg-ring absolute bottom-0 left-0 size-1.5"></div>
	<div class="bg-foreground dark:bg-ring absolute right-0 bottom-0 size-1.5"></div>
	<div class="bg-foreground dark:bg-ring absolute top-1 -left-1.5 h-1/2 w-1.5"></div>
	<div class="bg-foreground dark:bg-ring absolute bottom-1 -left-1.5 h-1/2 w-1.5"></div>
	<div class="bg-foreground dark:bg-ring absolute top-1 -right-1.5 h-1/2 w-1.5"></div>
	<div class="bg-foreground dark:bg-ring absolute -right-1.5 bottom-1 h-1/2 w-1.5"></div>
</div>
