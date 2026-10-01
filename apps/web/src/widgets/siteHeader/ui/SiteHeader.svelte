<script lang="ts">
	import { SITE_NAME } from '$shared/lib/site';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import GithubIcon from '~icons/pixelarticons/github';
	import PlusIcon from '~icons/pixelarticons/plus';
	import { Button, RetroModeSwitcher } from '$shared/ui/8bit';
	import { REPO_URL } from '$shared/lib/site';
	import { PEBBLY_MARK } from '$shared/config';
	import { PixelSprite } from '$shared/ui/pixel';

	const links = [
		{ route: '/gallery', label: 'Gallery' },
		{ route: '/benchmarks', label: 'Benchmarks' },
		{ route: '/contribute', label: 'Contribute' }
	] as const;

	const current = (href: string) => page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
</script>

<a
	href="#main"
	class="retro bg-primary text-primary-foreground sr-only z-50 px-4 py-3 text-xs focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
>
	Skip to content
</a>
<header class="site-header bg-background/95 border-pixel sticky top-0 z-40 border-b-6 backdrop-blur">
	<div class="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2.5 sm:px-6 lg:px-10">
		<a href={resolve('/')} class="flex items-center gap-3 py-1.5" aria-label="{SITE_NAME}, home">
			<PixelSprite rows={PEBBLY_MARK} scale={2} inheritOutline label="Pebbly, the site's mascot" />
			<span class="retro text-xs whitespace-nowrap sm:text-sm">{SITE_NAME}</span>
		</a>
		<nav aria-label="Main" class="order-last -mx-2 flex w-full sm:order-none sm:mx-0 sm:w-auto">
			<ul class="flex gap-1">
				{#each links as link (link.route)}
					<li>
						<a
							href={resolve(link.route)}
							aria-current={current(resolve(link.route)) ? 'page' : undefined}
							class="retro text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground relative inline-flex h-11 items-center px-2 text-[0.625rem] transition-colors aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-2 aria-[current=page]:after:bottom-1 aria-[current=page]:after:h-1 aria-[current=page]:after:bg-primary sm:text-xs"
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<div class="ml-auto flex items-center gap-2">
			<!-- The one call to action on every page: the gallery only grows through submissions. -->
			<Button href={resolve('/contribute')} size="sm" class="text-[0.625rem]">
				<PlusIcon aria-hidden="true" />
				<span class="hidden sm:inline">Add your art</span>
				<span class="sr-only sm:hidden">Add your art</span>
			</Button>
			<Button href={REPO_URL} variant="ghost" size="sm" rel="noopener" class="text-[0.625rem]">
				<GithubIcon aria-hidden="true" />
				<span class="hidden sm:inline">GitHub</span>
				<span class="sr-only sm:hidden">GitHub repository</span>
			</Button>
			<RetroModeSwitcher />
		</div>
	</div>
</header>
