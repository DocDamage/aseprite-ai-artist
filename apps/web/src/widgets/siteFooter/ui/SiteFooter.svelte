<script lang="ts">
	import { resolve } from '$app/paths';
	import { PICO8 } from '$shared/config';

	const swatches = Object.values(PICO8);
</script>

<footer class="border-pixel mt-24 border-t-4">
	<!-- PICO-8's sixteen colours: every benchmark and the mascot are drawn in it. -->
	<div class="flex h-2" aria-hidden="true">
		{#each swatches as color (color)}
			<span class="flex-1" style:background-color={color}></span>
		{/each}
	</div>
	<div
		class="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"
	>
		<p>
			Every piece was drawn by an agent through
			<a
				href="https://github.com/with-pebbly/aseprite-ai-artist"
				class="text-foreground underline underline-offset-4"
				rel="noopener">Aseprite AI Artist</a
			>, in a live Aseprite window.
		</p>
		<ul class="retro flex gap-4 text-[0.625rem]">
			<li><a href={resolve('/gallery')} class="hover:text-foreground">Gallery</a></li>
			<li><a href={resolve('/benchmarks')} class="hover:text-foreground">Benchmarks</a></li>
			<li><a href={resolve('/contribute')} class="hover:text-foreground">Contribute</a></li>
		</ul>
	</div>
</footer>
