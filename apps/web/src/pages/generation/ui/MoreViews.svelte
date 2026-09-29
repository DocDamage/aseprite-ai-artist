<script lang="ts">
	import { Card } from '$shared/ui/8bit';
	import { FileImage, roleLabel, type GenerationDetail } from '$entities/generation';

	interface Props {
		generation: GenerationDetail;
	}

	let { generation: g }: Props = $props();

	const views = $derived(g.files.filter((file) => file.role !== 'cover' && file.width !== null));
</script>

{#if views.length > 0}
	<section aria-labelledby="views">
		<h2 id="views" class="text-lg sm:text-2xl">More views</h2>
		<ul class="mt-8 grid gap-10 px-1.5 sm:grid-cols-2">
			{#each views as file (file.name)}
				<li>
					<Card font="normal" class="gap-0 py-0">
						<div class="canvas-checker grid min-h-40 place-items-center overflow-hidden p-6">
							<FileImage {file} alt="{file.label ?? roleLabel[file.role]} of {g.title}" max={480} />
						</div>
						<p class="border-pixel border-t-4 px-4 py-3 text-sm">
							<span class="font-medium">{file.label ?? roleLabel[file.role]}</span>
							{#if file.step}<span class="text-muted-foreground">, step {file.step}</span>{/if}
						</p>
					</Card>
				</li>
			{/each}
		</ul>
	</section>
{/if}
