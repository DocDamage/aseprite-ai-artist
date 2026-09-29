<script lang="ts">
	import { resolve } from '$app/paths';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$shared/ui/8bit';
	import { formatDate } from '$shared/lib/format';
	import type { GenerationSummary } from '../model/types';
	import FileImage from './FileImage.svelte';
	import ScoreMeter from './ScoreMeter.svelte';

	interface Props {
		generation: GenerationSummary;
		eager?: boolean;
	}

	let { generation, eager = false }: Props = $props();
</script>

<a
	href={resolve('/g/[id]', { id: generation.id })}
	class="group block h-full outline-offset-8 transition-transform hover:-translate-y-1 motion-reduce:hover:translate-y-0"
>
	<Card font="normal" class="h-full gap-4 pt-0">
		<div class="canvas-checker grid aspect-square place-items-center overflow-hidden p-4">
			<FileImage file={generation.cover} alt="" max={224} {eager} />
		</div>
		<CardHeader class="px-4">
			<CardTitle class="text-xs leading-relaxed group-hover:underline">{generation.title}</CardTitle>
		</CardHeader>
		<CardContent font="normal" class="text-muted-foreground px-4 text-sm">
			<span class="text-foreground font-medium">{generation.modelLabel}</span>
			<br />v{generation.plugin} in {generation.harness}, {formatDate(generation.date)}
		</CardContent>
		{#if generation.benchmark}
			<CardFooter font="normal" class="flex flex-wrap items-center justify-between gap-2 px-4 text-sm">
				<span class="text-muted-foreground">
					{generation.benchmark.promptTitle}{#if generation.outdated}, unranked{/if}
				</span>
				{#if generation.score}
					<ScoreMeter score={generation.score} />
				{/if}
			</CardFooter>
		{/if}
	</Card>
</a>
