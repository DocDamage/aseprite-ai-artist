<script lang="ts">
	import { SITE_NAME } from '$shared/lib/site';
	import { resolve } from '$app/paths';
	import PaletteIcon from '~icons/pixelarticons/colors-swatch';
	import { GalleryGrid } from '$features/filterGenerations';
	import {
		Button,
		Empty,
		EmptyContent,
		EmptyDescription,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle,
		Kbd
	} from '$shared/ui/8bit';
	import type { GalleryPageData } from '../model/types';

	interface Props {
		data: GalleryPageData;
	}

	let { data }: Props = $props();

	const { generations, facets } = $derived(data);
</script>

<svelte:head>
	<title>Gallery: {SITE_NAME}</title>
	<meta
		name="description"
		content="Every piece of pixel art made with Aseprite AI Artist, filterable by model, plugin version and harness."
	/>
</svelte:head>

<!-- Full width, like a pin board: the wall of art is the page, and a wide screen gets more columns
rather than wider margins. -->
<div class="px-4 pt-14 sm:px-6 lg:px-10">
	<h1 class="text-2xl sm:text-4xl">Gallery</h1>
	<p class="text-muted-foreground mt-4 max-w-[62ch] text-lg">
		Every piece submitted so far, newest first. Open one to see the prompts that made it and download the source.
	</p>

	{#if generations.length === 0}
		<Empty class="canvas-checker border-pixel mt-10 pixel-notch [--notch:6px] border-6 border-dashed">
			<EmptyHeader>
				<EmptyMedia variant="icon"><PaletteIcon aria-hidden="true" /></EmptyMedia>
				<EmptyTitle class="text-sm leading-relaxed">Nothing hanging yet</EmptyTitle>
				<EmptyDescription class="font-sans text-base">
					The gallery fills up through pull requests. Draw something with the plugin and run
					<Kbd class="h-6 px-1.5">/aseprite:submit</Kbd>: it packages the files and prompts for you.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button href={resolve('/contribute')}>Add the first piece</Button>
			</EmptyContent>
		</Empty>
	{:else}
		<div class="mt-10">
			<GalleryGrid {generations} {facets} path={resolve('/gallery')} />
		</div>
	{/if}
</div>
