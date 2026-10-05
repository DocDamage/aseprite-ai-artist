<script lang="ts">
	import CheckIcon from '~icons/pixelarticons/check';
	import { plural } from '#shared/lib/format.js';
	import type { PromptView } from '#entities/prompt/index.js';

	interface Props {
		prompt: PromptView;
	}

	let { prompt }: Props = $props();

	const byStep = $derived(
		prompt.steps.map((step, index) => ({
			step,
			number: index + 1,
			criteria: prompt.criteria.filter((criterion) => criterion.step === index + 1)
		}))
	);
</script>

<section aria-labelledby={`criteria-${prompt.id}`}>
	<h2 id={`criteria-${prompt.id}`} class="text-sm sm:text-base">
		{plural(prompt.criteria.length, 'criterion', 'criteria')}
	</h2>
	<ol class="mt-4 space-y-5">
		{#each byStep as group (group.number)}
			{#if group.criteria.length > 0}
				<li>
					<p class="text-sm font-medium text-muted-foreground">
						Step {group.number}: {group.step.title}
					</p>
					<ul class="mt-2 space-y-2 text-sm">
						{#each group.criteria as criterion (criterion.id)}
							<li class="flex gap-2">
								<CheckIcon class="shrink-0 text-secondary" aria-hidden="true" />
								<span>{criterion.text}</span>
							</li>
						{/each}
					</ul>
				</li>
			{/if}
		{/each}
	</ol>
</section>
