<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { PixelSprite } from '$shared/ui/pixel';
	import {
		Button,
		Empty,
		EmptyContent,
		EmptyDescription,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle
	} from '$shared/ui/8bit';
	import { PEBBLY_FRAMES } from '$shared/config';

	const missing = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{missing ? 'Not found' : 'Error'}: Aseprite AI Artist</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
	<Empty class="canvas-checker border-pixel border-4 border-dashed">
		<EmptyHeader class="max-w-lg">
			<EmptyMedia><PixelSprite rows={PEBBLY_FRAMES[3]!} scale={4} label="Pebbly watching a paint drop fall" /></EmptyMedia>
			<p class="retro text-muted-foreground text-sm tabular-nums">{page.status}</p>
			<EmptyTitle>
				<h1 class="text-lg leading-relaxed sm:text-2xl">{missing ? 'Nothing on this canvas' : 'Something went wrong'}</h1>
			</EmptyTitle>
			<EmptyDescription class="font-sans text-base">
				{#if missing}
					There is no page at <code class="text-foreground">{page.url.pathname}</code>. The piece may have been renamed,
					or the link mistyped.
				{:else}
					{page.error?.message ?? 'The page failed to render.'}
				{/if}
			</EmptyDescription>
		</EmptyHeader>
		<EmptyContent class="flex-row flex-wrap justify-center gap-6">
			<Button href={resolve('/gallery')}>Go to the gallery</Button>
			<Button href={resolve('/')} variant="outline">Home</Button>
		</EmptyContent>
	</Empty>
</div>
