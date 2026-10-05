<script lang="ts">
	import { Seo } from '#shared/ui/seo/index.js';
	import { resolve } from '$app/paths';
	import PaletteIcon from '~icons/pixelarticons/colors-swatch';
	import { GalleryGrid } from '#features/filterGenerations/index.js';
	import {
		Button,
		Empty,
		EmptyContent,
		EmptyDescription,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle,
		Kbd
	} from '#shared/ui/8bit/index.js';
	import type { GalleryPageData } from '../model/types';

	interface Props {
		data: GalleryPageData;
	}

	let { data }: Props = $props();

	const { generations, facets } = $derived(data);
</script>

<Seo
	title="Gallery of AI-drawn pixel art"
	description="Every piece of pixel art made with Aseprite AI Artist, filterable by model, plugin version and harness."
/>

<!-- Full width, like a pin board: the wall of art is the page, and a wide screen gets more columns
rather than wider margins. -->
<div class="px-4 pt-14 sm:px-6 lg:px-10">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="text-2xl sm:text-4xl">Gallery</h1>
		<Button href={resolve('contribute')}>Add your art</Button>
	</div>
	<p class="mt-4 max-w-[62ch] text-lg text-muted-foreground">
		Every piece submitted so far, newest first. Open one to see the prompts that made it and
		download the source.
	</p>

	{#if generations.length === 0}
		<Empty
			class="canvas-checker pixel-notch mt-10 border-6 border-dashed border-pixel [--notch:6px]"
		>
			<EmptyHeader>
				<EmptyMedia variant="icon"><PaletteIcon aria-hidden="true" /></EmptyMedia>
				<EmptyTitle class="text-sm leading-relaxed">Nothing hanging yet</EmptyTitle>
				<EmptyDescription class="font-sans text-base">
					The gallery fills up through pull requests. Draw something with the plugin and run
					<Kbd class="h-6 px-1.5">/aseprite:submit</Kbd>: it packages the files and prompts for you.
				</EmptyDescription>
			</EmptyHeader>

			<EmptyContent><Button href={resolve('contribute')}>Add the first piece</Button></EmptyContent>
		</Empty>
	{:else}
		<div class="mt-10">
			<GalleryGrid {generations} {facets} path={resolve('gallery')} />
		</div>
	{/if}
</div>
