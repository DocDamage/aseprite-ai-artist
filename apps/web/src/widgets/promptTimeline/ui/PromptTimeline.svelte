<script lang="ts">
	import ArrowDownIcon from '~icons/pixelarticons/arrow-down';
	import MessageCircleIcon from '~icons/pixelarticons/message';
	import { Badge } from '$shared/ui/8bit';
	import { CopyButton } from '$features/copyPrompt';
	import type { StepView } from '$entities/generation';

	interface Props {
		prompt: { id: string; steps: StepView[]; setup: { rules: string[] } };
		heading?: string;
	}

	let { prompt, heading = 'The steps, verbatim' }: Props = $props();

	const freshSessions = $derived(prompt.setup.rules.some((rule) => /one session per step|fresh session/i.test(rule)));
</script>

<section aria-labelledby={`steps-${prompt.id}`}>
	<h2 id={`steps-${prompt.id}`} class="text-sm sm:text-base">{heading}</h2>

	<ol class="mt-5">
		{#each prompt.steps as step, index (index)}
			<li class="contents">
				<div class="border-pixel border-l-4 pl-4">
					<div class="flex flex-wrap items-center gap-3">
						<span class="retro bg-primary text-primary-foreground grid size-7 place-items-center text-[0.625rem]" aria-hidden="true">
							{index + 1}
						</span>
						<h3 class="text-xs leading-relaxed">
							<span class="sr-only">Step {index + 1}: </span>{step.title ?? `Step ${index + 1}`}
						</h3>
						<CopyButton text={step.text} label="Copy step {index + 1}" variant="ghost" class="ml-auto" />
					</div>
					{#if step.model}
						<p class="text-muted-foreground mt-2 text-sm">Run by <span class="text-foreground font-medium">{step.model}</span></p>
					{/if}
					<p class="bg-muted/60 mt-3 px-3 py-2 leading-relaxed whitespace-pre-wrap">{step.text}</p>
					{#if step.original}
						<details class="mt-2 text-sm">
							<summary class="text-muted-foreground cursor-pointer">Translated — as originally sent</summary>
							<p class="bg-muted/40 mt-2 px-3 py-2 leading-relaxed whitespace-pre-wrap">{step.original}</p>
						</details>
					{/if}
					{#if step.interventions.length > 0}
						<div class="border-pixel mt-3 border-2 border-dashed px-4 py-3">
							<p class="mb-2 flex items-center gap-2 text-sm font-medium">
								<MessageCircleIcon aria-hidden="true" />
								The author stepped in {step.interventions.length === 1 ? 'once' : `${step.interventions.length} times`}
							</p>
							<ul class="text-muted-foreground space-y-1 text-sm">
								{#each step.interventions as note, i (i)}
									<li class="border-pixel border-l-2 pl-2.5">{note}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
				{#if index < prompt.steps.length - 1}
					<div class="text-muted-foreground flex items-center gap-3 py-3 pl-1">
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
			<summary class="retro cursor-pointer text-[0.625rem]">Setup rules</summary>
			<ul class="text-muted-foreground mt-3 space-y-2">
				{#each prompt.setup.rules as rule, i (i)}
					<li class="flex gap-2.5"><span class="bg-accent mt-2 size-1.5 shrink-0" aria-hidden="true"></span>{rule}</li>
				{/each}
			</ul>
		</details>
	{/if}
</section>
