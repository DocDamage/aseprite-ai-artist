<script lang="ts">
	import ArrowDownIcon from '~icons/pixelarticons/arrow-down';
	import MessageCircleIcon from '~icons/pixelarticons/message';
	import { Badge } from '#shared/ui/8bit/index.js';
	import { CopyButton } from '#features/copyPrompt/index.js';
	import type { StepView } from '#entities/generation/index.js';

	interface Props {
		prompt: { id: string; steps: StepView[]; setup: { rules: string[] } };
		heading?: string;
	}

	let { prompt, heading = 'The steps, verbatim' }: Props = $props();

	const freshSessions = $derived(
		prompt.setup.rules.some((rule) => /one session per step|fresh session/i.test(rule))
	);
</script>

<section aria-labelledby={`steps-${prompt.id}`}>
	<h2 id={`steps-${prompt.id}`} class="text-sm sm:text-base">{heading}</h2>

	<ol class="mt-5">
		{#each prompt.steps as step, index (index)}
			<li class="contents">
				<div class="border-l-6 border-pixel pl-4">
					<div class="flex flex-wrap items-center gap-3">
						<span
							class="grid size-7 place-items-center bg-primary retro text-[0.625rem] text-primary-foreground"
							aria-hidden="true"
						>
							{index + 1}
						</span>
						<h3 class="text-xs leading-relaxed">
							<span class="sr-only">Step {index + 1}: </span>{step.title ?? `Step ${index + 1}`}
						</h3>
						<CopyButton
							text={step.text}
							label="Copy step {index + 1}"
							variant="ghost"
							class="ml-auto"
						/>
					</div>
					{#if step.model}
						<p class="mt-2 text-sm text-muted-foreground">
							Run by <span class="font-medium text-foreground">{step.model}</span>
						</p>
					{/if}
					<p class="mt-3 bg-muted/60 px-3 py-2 leading-relaxed whitespace-pre-wrap">{step.text}</p>
					{#if step.original}
						<details class="mt-2 text-sm">
							<summary class="cursor-pointer text-muted-foreground"
								>Translated — as originally sent</summary
							>
							<p class="mt-2 bg-muted/40 px-3 py-2 leading-relaxed whitespace-pre-wrap">
								{step.original}
							</p>
						</details>
					{/if}
					{#if step.interventions.length > 0}
						<div
							class="pixel-notch mt-3 border-6 border-dashed border-pixel px-4 py-3 [--notch:6px]"
						>
							<p class="mb-2 flex items-center gap-2 text-sm font-medium">
								<MessageCircleIcon aria-hidden="true" />
								The author stepped in {step.interventions.length === 1
									? 'once'
									: `${step.interventions.length} times`}
							</p>
							<ul class="space-y-1 text-sm text-muted-foreground">
								{#each step.interventions as note, i (i)}
									<li class="border-l-2 border-pixel pl-2.5">{note}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
				{#if index < prompt.steps.length - 1}
					<div class="flex items-center gap-3 py-3 pl-1 text-muted-foreground">
						<ArrowDownIcon aria-hidden="true" />
						{#if freshSessions}
							<Badge variant="outline" class="text-[0.625rem]">new session</Badge>
						{/if}
					</div>
				{/if}
			</li>
		{/each}
	</ol>

	{#if prompt.setup.rules.length > 0}
		<details class="mt-6 text-sm">
			<summary class="cursor-pointer retro text-[0.625rem]">Setup rules</summary>
			<ul class="mt-3 space-y-2 text-muted-foreground">
				{#each prompt.setup.rules as rule, i (i)}
					<li class="flex gap-2.5">
						<span class="mt-2 size-1.5 shrink-0 bg-accent" aria-hidden="true"></span>{rule}
					</li>
				{/each}
			</ul>
		</details>
	{/if}
</section>
