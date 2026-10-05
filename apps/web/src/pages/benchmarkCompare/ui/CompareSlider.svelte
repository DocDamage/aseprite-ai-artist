<script lang="ts">
	import { FullscreenIcon } from '#shared/ui/pixel/index.js';
	import type { FileView } from '#entities/generation/index.js';
	import { containPixels } from '#shared/lib/pixel-fit.js';
	import { Slider } from '#shared/ui/8bit/index.js';
	import type { Playback } from '../model/playback.svelte';
	import ArtLayer from './ArtLayer.svelte';

	interface Side {
		file: FileView;
		label: string;
	}

	interface Props {
		before: Side;
		after: Side;
		playback: Playback;
		/** Share of the width, 0–100, showing `before`; bound so the full-screen view keeps it. */
		position?: number;
		/** Fit inside this box (the full-screen view) instead of the column's width. */
		box?: { width: number; height: number };
		/** Shows a full-screen button that calls this. */
		onexpand?: () => void;
	}

	let { before, after, playback, position = $bindable(50), box, onexpand }: Props = $props();

	let available = $state<number | null>(null);
	let dragging = $state(false);

	/** The frame border on both sides, and the divider slider under the art in a box. */
	const FRAME = 12;
	const CONTROLS = 64;

	const native = (file: FileView) =>
		file.width && file.height
			? { width: file.width / file.pixel, height: file.height / file.pixel }
			: null;

	// Both sides share one scale, so the same art pixel lands on the same screen pixel on either
	// side of the divider: that alignment is the point of a slider. The scale fills the width
	// (it may be fractional), as everywhere else on the site.
	const layout = $derived.by(() => {
		const a = native(before.file);
		const b = native(after.file);
		if (!a || !b) return null;
		const art = { width: Math.max(a.width, b.width), height: Math.max(a.height, b.height) };
		const room = box
			? { width: box.width - FRAME, height: box.height - FRAME - CONTROLS }
			: { width: (available ?? 1024) - FRAME, height: Infinity };
		// Fills the width (and, full screen, the screen): one shared scale for both sides.
		const fitted = containPixels(art, room);
		const k = fitted.width / art.width;
		return {
			width: fitted.width,
			height: fitted.height,
			a: { width: a.width * k, height: a.height * k },
			b: { width: b.width * k, height: b.height * k }
		};
	});

	function moveTo(event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		const rect = event.currentTarget.getBoundingClientRect();
		position = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
	}
</script>

<div class="w-full" bind:clientWidth={available}>
	{#if layout}
		<div class="overflow-x-auto">
			<div
				class="pixel-frame group/zoom canvas-checker relative mx-auto box-content cursor-ew-resize touch-pan-y overflow-hidden select-none"
				style:width="{layout.width}px"
				style:height="{layout.height}px"
				role="presentation"
				onpointerdown={(event) => {
					dragging = true;
					event.currentTarget.setPointerCapture(event.pointerId);
					moveTo(event);
				}}
				onpointermove={(event) => dragging && moveTo(event)}
				onpointerup={() => (dragging = false)}
				onpointercancel={() => (dragging = false)}
			>
				<!-- Each side is clipped to its own half: art has transparent pixels, and without the
				clip the other run would show through them and the two would overlap. -->
				<!-- clip-path is relative to the element's own box, so each layer sits in a wrapper
				the size of the frame: the clip then lands on the divider even when the two runs
				differ in canvas size. -->
				<div
					class="absolute top-0 left-0"
					style:width="{layout.width}px"
					style:height="{layout.height}px"
					style:clip-path="inset(0 0 0 {position}%)"
				>
					<ArtLayer
						file={after.file}
						alt={after.label}
						width={layout.b.width}
						height={layout.b.height}
						{playback}
						class="absolute top-0 left-0"
					/>
				</div>
				<div
					class="absolute top-0 left-0"
					style:width="{layout.width}px"
					style:height="{layout.height}px"
					style:clip-path="inset(0 {100 - position}% 0 0)"
				>
					<ArtLayer
						file={before.file}
						alt={before.label}
						width={layout.a.width}
						height={layout.a.height}
						{playback}
						class="absolute top-0 left-0"
					/>
				</div>
				<div
					class="pointer-events-none absolute top-0 h-full -translate-x-1/2"
					style:left="{position}%"
				>
					<div
						class="mx-auto h-full w-1 bg-foreground shadow-[0_0_0_2px_rgb(0_0_0/0.35)] dark:bg-ring"
					></div>
					<div
						class="absolute top-1/2 left-1/2 grid h-10 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center border-4 border-foreground bg-background/70 backdrop-blur-md dark:border-ring"
					>
						<span class="block h-4 w-1 bg-foreground dark:bg-ring"></span>
					</div>
				</div>
				<span
					class="pixel-notch pointer-events-none absolute top-3 left-3 border-4 border-white/15 bg-background/55 px-2.5 py-1 text-xs backdrop-blur-md [--notch:4px]"
				>
					{before.label}
				</span>
				<span
					class="pixel-notch pointer-events-none absolute top-3 right-3 border-4 border-white/15 bg-background/55 px-2.5 py-1 text-xs backdrop-blur-md [--notch:4px]"
				>
					{after.label}
				</span>
				{#if onexpand}
					<button
						type="button"
						class="pixel-notch absolute right-3 bottom-3 grid size-10 place-items-center border-4 border-foreground/50 bg-background/55 opacity-0 backdrop-blur-md transition-opacity [--notch:4px] group-hover/zoom:opacity-100 focus-visible:opacity-100 focus-visible:outline-offset-[-4px] dark:border-ring/70 [@media(hover:none)]:opacity-100"
						aria-label="Open the comparison full screen"
						onpointerdown={(event) => event.stopPropagation()}
						onclick={onexpand}
					>
						<FullscreenIcon />
					</button>
				{/if}
			</div>
		</div>
		<Slider
			bind:value={position}
			min={0}
			max={100}
			step={0.5}
			label="Divider: left {before.label}, right {after.label}"
			valueText="{Math.round(position)}% {before.label}"
			class="mx-auto mt-8 max-w-md"
		/>
	{:else}
		<p class="text-sm text-muted-foreground">
			One of these images has no readable size, so they cannot be aligned.
		</p>
	{/if}
</div>
