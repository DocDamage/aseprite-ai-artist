<script lang="ts">
	import '../styles/index.css';
	import { ModeWatcher } from 'mode-watcher';
	import { appleTouchIcon, favicon16, favicon32 } from '$shared/brand';
	import { Toaster } from '$shared/ui/sonner';
	import { SiteHeader } from '$widgets/siteHeader';
	import { SiteFooter } from '$widgets/siteFooter';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" sizes="32x32" href={favicon32} />
	<link rel="icon" type="image/png" sizes="16x16" href={favicon16} />
	<link rel="apple-touch-icon" sizes="192x192" href={appleTouchIcon} />
	<meta name="theme-color" content="#111016" />
</svelte:head>

<ModeWatcher defaultMode="dark" />
<Toaster position="bottom-center" />

<div class="flex min-h-dvh flex-col">
	<SiteHeader />
	<main id="main" tabindex="-1" class="flex-1 outline-none">
		{@render children()}
	</main>
	<SiteFooter />
</div>
