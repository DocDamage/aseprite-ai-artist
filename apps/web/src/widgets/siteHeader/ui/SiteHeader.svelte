<script lang="ts">
	import { SITE_NAME } from '#shared/lib/site.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import GithubIcon from '~icons/pixelarticons/github';
	import PlusIcon from '~icons/pixelarticons/plus';
	import { Button, RetroModeSwitcher } from '#shared/ui/8bit/index.js';
	import { REPO_URL } from '#shared/lib/site.js';
	import { PEBBLY_MARK } from '#shared/config/index.js';
	import { PixelSprite } from '#shared/ui/pixel/index.js';

	// `accent` marks the one link drawn in the holographic style: the plugin is what the site is for.
	const links = [
		{ route: '/gallery', label: 'Gallery', accent: false },
		{ route: '/benchmarks', label: 'Benchmarks', accent: false },
		{ route: '/plugin', label: 'Plugin', accent: true },
		{ route: '/contribute', label: 'Contribute', accent: false }
	] as const;

	const current = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);

	// The page's own count (from its build or ISR render) until /api/stars answers with the
	// current one: that endpoint shares /plugin's two-hour cache, so both always agree. A failed
	// request keeps what the page had.
	let live = $state<number | null>(null);
	const stars = $derived(live ?? (typeof page.data.stars === 'number' ? page.data.stars : null));
	const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

	onMount(() => {
		fetch('/api/stars')
			.then((response) => (response.ok ? response.json() : null))
			.then((body: { stars?: unknown } | null) => {
				if (typeof body?.stars === 'number') live = body.stars;
			})
			.catch(() => {});
	});
</script>

<a
	href="#main"
	class="sr-only z-50 bg-primary px-4 py-3 retro text-xs text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
	>Skip to content</a
>

<header
	class="site-header sticky top-0 z-40 border-b-6 border-pixel bg-background/95 backdrop-blur"
>
	<div class="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2.5 sm:px-6 lg:px-10">
		<!-- Hover/focus: Pebbly hops with a squash on landing, and the name ripples letter by
		letter into the holographic accent (styles in app/styles/index.css, `.brand-*`). -->
		<a
			href={resolve('/')}
			class="brand-link flex items-center gap-3 py-1.5"
			aria-label="{SITE_NAME}, home"
		>
			<span class="brand-mascot inline-flex">
				<PixelSprite
					rows={PEBBLY_MARK}
					scale={2}
					inheritOutline
					label="Pebbly, the site's mascot"
				/>
			</span>
			<span class="retro text-xs whitespace-nowrap sm:text-sm" aria-hidden="true">
				{#each SITE_NAME as letter, index (index)}
					<span class="brand-letter inline-block" style:--i={index}>{letter}</span>
				{/each}
			</span>
		</a>
		<nav aria-label="Main" class="order-last -mx-2 flex w-full sm:order-none sm:mx-0 sm:w-auto">
			<ul class="flex gap-1">
				{#each links as link (link.route)}
					<li>
						<a
							href={resolve(link.route)}
							aria-current={current(resolve(link.route)) ? 'page' : undefined}
							class="relative inline-flex h-11 items-center px-2 retro text-[0.625rem] text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-2 aria-[current=page]:after:bottom-1 aria-[current=page]:after:h-1 aria-[current=page]:after:bg-primary sm:text-xs"
						>
							<span class={link.accent ? 'text-holo' : undefined}>{link.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<div class="ml-auto flex items-center gap-2">
			<!-- The one call to action on every page: the gallery only grows through submissions. -->

			<Button href={resolve('contribute')} size="sm" class="text-[0.625rem]">
				<PlusIcon aria-hidden="true" />
				<span class="hidden sm:inline">Add your art</span>
				<span class="sr-only sm:hidden">Add your art</span>
			</Button>
			<!-- With a count, the icon and the number say "GitHub" on their own; the word comes
			back only when the count is missing. -->
			<Button
				href={REPO_URL}
				variant="ghost"
				size="sm"
				rel="noopener"
				class="text-[0.625rem]"
				aria-label={stars === null ? undefined : `GitHub repository, ${stars} stars`}
			>
				<span class="inline-flex text-holo items-center gap-2">
					<GithubIcon aria-hidden="true" />
					{#if stars === null}
						<span class="hidden sm:inline">GitHub</span>
						<span class="sr-only sm:hidden">GitHub repository</span>
					{:else}
						<span aria-hidden="true">{compact.format(stars)}</span>
					{/if}
				</span>
			</Button>
			<RetroModeSwitcher />
		</div>
	</div>
</header>
