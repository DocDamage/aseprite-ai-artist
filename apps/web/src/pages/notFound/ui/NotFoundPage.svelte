<script lang="ts">
	import { Seo } from '#shared/ui/seo/index.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { PixelSprite } from '#shared/ui/pixel/index.js';
	import {
		Button,
		Empty,
		EmptyContent,
		EmptyDescription,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle
	} from '#shared/ui/8bit/index.js';
	import { PEBBLY_FRAMES } from '#shared/config/index.js';

	const missing = $derived(page.status === 404);
</script>

<Seo title={missing ? 'Not found' : 'Error'} noindex />

<div class="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
	<Empty class="canvas-checker pixel-notch border-6 border-dashed border-pixel [--notch:6px]">
		<EmptyHeader class="max-w-lg">
			<EmptyMedia
				><PixelSprite
					rows={PEBBLY_FRAMES[3]!}
					scale={4}
					label="Pebbly watching a paint drop fall"
				/></EmptyMedia
			>
			<p class="retro text-sm text-muted-foreground tabular-nums">{page.status}</p>
			<EmptyTitle>
				<h1 class="text-lg leading-relaxed sm:text-2xl">
					{missing ? 'Nothing on this canvas' : 'Something went wrong'}
				</h1>
			</EmptyTitle>
			<EmptyDescription class="font-sans text-base">
				{#if missing}
					There is no page at <code class="text-foreground">{page.url.pathname}</code>. The piece
					may have been renamed, or the link mistyped.
				{:else}
					{page.error?.message ?? 'The page failed to render.'}
				{/if}
			</EmptyDescription>
		</EmptyHeader>
		<EmptyContent class="flex-row flex-wrap justify-center gap-6">
			<Button href={resolve('gallery')}>Go to the gallery</Button>
			<Button href={resolve('/')} variant="outline">Home</Button>
		</EmptyContent>
	</Empty>
</div>
