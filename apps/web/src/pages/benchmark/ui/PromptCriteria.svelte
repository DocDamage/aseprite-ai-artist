<script lang="ts">
	import CheckIcon from '~icons/pixelarticons/check';
	import { plural } from '$shared/lib/format';
	import type { PromptView } from '$entities/prompt';

	interface Props {
		prompt: PromptView;
	}

	let { prompt }: Props = $props();

	const byStep = $derived(prompt.steps.map((step, index) => ({
		step,
		number: index + 1,
		criteria: prompt.criteria.filter((criterion) => criterion.step === index + 1)
	})));
</script>

<section aria-labelledby={`criteria-${prompt.id}`}>
	<h2 id={`criteria-${prompt.id}`} class="text-sm sm:text-base">
		{plural(prompt.criteria.length, 'criterion', 'criteria')}
	</h2>
	<ol class="mt-4 space-y-5">
		{#each byStep as group (group.number)}
			{#if group.criteria.length > 0}
				<li>
					<p class="text-muted-foreground text-sm font-medium">Step {group.number}: {group.step.title}</p>
					<ul class="mt-2 space-y-2 text-sm">
						{#each group.criteria as criterion (criterion.id)}
							<li class="flex gap-2">
								<CheckIcon class="text-secondary shrink-0" aria-hidden="true" />
								<span>{criterion.text}</span>
							</li>
						{/each}
					</ul>
				</li>
			{/if}
		{/each}
	</ol>
</section>
