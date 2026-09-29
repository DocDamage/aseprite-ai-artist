<script lang="ts">
	// Ported to Svelte 5 from 8bitcn/ui (MIT, see ../LICENSE): components/ui/retro-mode-switcher.tsx
	// next-themes is swapped for mode-watcher, which shadcn-svelte recommends, and 8bitcn's inline
	// pixel sun/moon for pixelarticons, the icon set used across the site.
	import { toggleMode } from 'mode-watcher';
	import MoonIcon from '~icons/pixelarticons/moon';
	import SunIcon from '~icons/pixelarticons/sun';
	import { Button } from '../button';
	import { cn } from '$shared/lib/utils';

	let { class: className }: { class?: string } = $props();
</script>

<Button variant="ghost" class="group/toggle size-10 px-0" onclick={toggleMode}>
	<SunIcon class={cn('hidden dark:block', className)} aria-hidden="true" />
	<MoonIcon class={cn('block dark:hidden', className)} aria-hidden="true" />
	<span class="sr-only">Switch between dark and light mode</span>
</Button>
