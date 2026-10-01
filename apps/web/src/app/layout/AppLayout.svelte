<script lang="ts">
	import '../styles/index.css';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { SITE_NAME, SITE_URL } from '$shared/lib/site';
	import { ModeWatcher } from 'mode-watcher';
	import { appleTouchIcon, favicon16, favicon32 } from '$shared/brand';
	import { Toaster } from '$shared/ui/sonner';
	import { SiteHeader } from '$widgets/siteHeader';
	import { SiteFooter } from '$widgets/siteFooter';

	let { children } = $props();

	// Page changes cross-fade through the View Transitions API where the browser has it; the
	// header and footer carry their own transition names, so only the page between them moves.
	// Same-page query updates (filters, the compare page's picks) are not navigations here.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" type="image/png" sizes="32x32" href={favicon32} />
	<link rel="icon" type="image/png" sizes="16x16" href={favicon16} />
	<link rel="apple-touch-icon" sizes="192x192" href={appleTouchIcon} />
	<meta name="theme-color" content="#111016" />
	<!-- The deployed address, not whatever host served this copy: previews and search results
	should always point at the real site. -->
	{#if !page.error}
		<link rel="canonical" href="{SITE_URL}{page.url.pathname}" />
	{/if}
	<meta property="og:site_name" content={SITE_NAME} />
	{#if !page.error}
		<meta property="og:url" content="{SITE_URL}{page.url.pathname}" />
	{/if}
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
