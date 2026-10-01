<script lang="ts">
	import { resolve } from '$app/paths';
	import { PEBBLY_LOGO, PEBBLY_MARK, PICO8 } from '$shared/config';
	import { REPO_URL, RUBRIC_URL, SITE_NAME, STUDIO_URL, SUBMIT_SKILL_URL } from '$shared/lib/site';
	import { PixelSprite } from '$shared/ui/pixel';

	const swatches = Object.values(PICO8);
	// Evaluated again on hydration, so it shows the visitor's current year, not the build year.
	const year = new Date().getFullYear();

	const plugin = [
		{ label: 'Source on GitHub', href: REPO_URL },
		{ label: 'Changelog', href: `${REPO_URL}/blob/main/CHANGELOG.md` },
		{ label: 'Scoring rubric', href: RUBRIC_URL },
		{ label: 'The submit skill', href: SUBMIT_SKILL_URL }
	];
</script>

<footer class="site-footer border-pixel mt-24 border-t-6">
	<!-- PICO-8's sixteen colours: every benchmark and the mascot are drawn in it. -->
	<div class="flex h-2" aria-hidden="true">
		{#each swatches as color (color)}
			<span class="flex-1" style:background-color={color}></span>
		{/each}
	</div>

	<div class="grid gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:px-10">
		<div class="max-w-[46ch]">
			<a href={resolve('/')} class="inline-flex items-center gap-3">
				<PixelSprite rows={PEBBLY_MARK} scale={3} inheritOutline />
				<span class="retro text-base">{SITE_NAME}</span>
			</a>
			<p class="text-muted-foreground mt-5">
				Pixel art drawn by AI agents in a live Aseprite window, through
				<a href={REPO_URL} class="text-foreground underline underline-offset-4" rel="noopener">Aseprite AI Artist</a>.
				Every piece keeps its prompts, its model and its source file.
			</p>
		</div>

		<nav aria-labelledby="footer-explore">
			<h2 id="footer-explore" class="retro text-muted-foreground text-[0.625rem]">Explore</h2>
			<ul class="mt-5 space-y-3">
				<li><a href={resolve('/gallery')} class="hover:underline">Gallery</a></li>
				<li><a href={resolve('/benchmarks')} class="hover:underline">Benchmarks</a></li>
				<li><a href={resolve('/contribute')} class="hover:underline">Contribute</a></li>
			</ul>
		</nav>

		<nav aria-labelledby="footer-plugin">
			<h2 id="footer-plugin" class="retro text-muted-foreground text-[0.625rem]">The plugin</h2>
			<ul class="mt-5 space-y-3">
				{#each plugin as link (link.href)}
					<li><a href={link.href} class="hover:underline" rel="noopener">{link.label}</a></li>
				{/each}
			</ul>
		</nav>
	</div>

	<div
		class="border-pixel text-muted-foreground flex flex-col-reverse gap-6 border-t-4 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10"
	>
		<p>© {year} pebbly · plugin and site under the MIT license</p>
		<a href={STUDIO_URL} class="group text-foreground inline-flex items-center gap-4" rel="noopener">
			<PixelSprite rows={PEBBLY_LOGO} scale={1} inheritOutline class="shrink-0" />
			<span class="retro text-xs">by <span class="group-hover:underline underline-offset-4">pebbly</span></span>
		</a>
	</div>
</footer>
