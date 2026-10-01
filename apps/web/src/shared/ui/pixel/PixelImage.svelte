<script lang="ts">
	import { cn } from '$shared/lib/utils';

	interface Props {
		src: string;
		/** Intrinsic size of the image file; null when it could not be read. */
		width: number | null;
		height: number | null;
		/**
		 * Screen pixels per art pixel already baked into the file (an 8× export is 8). It is divided
		 * out, and the art re-scaled by whole numbers, so every art pixel stays square.
		 */
		pixel?: number;
		alt: string;
		/** Largest edge the art may grow to, in CSS pixels. */
		max: number;
		eager?: boolean;
		class?: string;
	}

	let { src, width, height, pixel = 1, alt, max, eager = false, class: className }: Props = $props();

	let available = $state<number | null>(null);

	// Art is shown only at whole multiples of its NATIVE size: any other ratio makes some art
	// pixels one screen pixel wider than their neighbours. A native image wider than its box
	// scrolls inside it instead of shrinking below 1×.
	const size = $derived.by(() => {
		if (!width || !height) return null;
		const nativeWidth = width / pixel;
		const nativeHeight = height / pixel;
		const room = Math.min(max, available ?? max);
		const k = Math.max(1, Math.floor(room / Math.max(nativeWidth, nativeHeight)));
		return { width: nativeWidth * k, height: nativeHeight * k };
	});
</script>

<div
	class={cn('flex w-full min-w-0 items-center justify-self-stretch overflow-x-auto', className)}
	bind:clientWidth={available}
>
	{#if size}
		<img
			{src}
			{alt}
			width={size.width}
			height={size.height}
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
			class="pixelated mx-auto block max-w-none shrink-0"
		/>
	{:else}
		<img {src} {alt} loading={eager ? 'eager' : 'lazy'} decoding="async" class="pixelated block w-full" />
	{/if}
</div>
