<script lang="ts">
	import {
		FileImage,
		roleLabel,
		type FileView,
		type GenerationDetail
	} from '#entities/generation/index.js';
	import StripView from './StripView.svelte';

	interface Props {
		generation: GenerationDetail;
	}

	let { generation: g }: Props = $props();

	const views = $derived(g.files.filter((file) => file.role !== 'cover' && file.width !== null));

	/** A filmstrip or a one-row sheet: far wider than tall, so it gets a whole row and scrolls. */
	const isStrip = (file: FileView) =>
		file.role === 'filmstrip' || (file.width ?? 0) > (file.height ?? 1) * 3;
</script>

{#if views.length > 0}
	<section aria-labelledby="views">
		<h2 id="views" class="text-lg sm:text-2xl">More views</h2>
		<ul class="mt-8 grid gap-10 px-1.5 sm:grid-cols-2">
			{#each views as file (file.name)}
				<li class={[isStrip(file) && 'sm:col-span-2']}>
					<div class="pixel-frame overflow-hidden">
						{#if isStrip(file)}
							<StripView {file} alt="{file.label ?? roleLabel[file.role]} of {g.title}" />
						{:else}
							<div class="canvas-checker overflow-hidden">
								<FileImage
									{file}
									alt="{file.label ?? roleLabel[file.role]} of {g.title}"
									minHeight={200}
									zoomable
								/>
							</div>
						{/if}
						<p class="border-t border-foreground/20 bg-card px-4 py-3 text-sm">
							<span class="font-medium">{file.label ?? roleLabel[file.role]}</span>
							{#if file.step}<span class="text-muted-foreground">, step {file.step}</span>{/if}
						</p>
					</div>
				</li>
			{/each}
		</ul>
	</section>
{/if}
