<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatDate } from '$shared/lib/format';
	import { ArtCard } from '$shared/ui/pixel';
	import type { GenerationSummary } from '../model/types';

	interface Props {
		generation: GenerationSummary;
		eager?: boolean;
	}

	let { generation, eager = false }: Props = $props();
</script>

{#snippet scoreGem()}
	{#if generation.score}
		<span aria-label="{generation.score.passed} of {generation.score.total} criteria passed">{generation.score.passed}/{generation.score.total}</span>
	{/if}
{/snippet}

<ArtCard
	href={resolve('/g/[id]', { id: generation.id })}
	art={{ src: generation.cover.url, width: generation.cover.width, height: generation.cover.height, pixel: generation.cover.pixel }}
	alt={generation.title}
	title={generation.title}
	badge={generation.score ? scoreGem : undefined}
	transitionName="art-{generation.id}"
	{eager}
>
	{#snippet caption()}
		<p class="text-sm">
			<span class="text-foreground font-medium">{generation.modelLabel}</span>
			<span class="text-muted-foreground">· v{generation.plugin} in {generation.harness}</span>
		</p>
		<p class="text-muted-foreground text-xs">{formatDate(generation.date)}</p>
		{#if generation.benchmark}
			<p class="text-muted-foreground text-xs">
				{generation.benchmark.promptTitle}{#if generation.outdated}, unranked{/if}
			</p>
		{/if}
	{/snippet}
</ArtCard>
