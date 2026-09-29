<script lang="ts">
	import { CopyButton } from '$features/copyPrompt';
	import {
		Button,
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle,
		Kbd
	} from '$shared/ui/8bit';
	import { GALLERY_README_URL, SUBMIT_SKILL_URL } from '$shared/lib/site';

	const steps = [
		{
			title: 'Make something',
			body: 'Draw with the plugin in any harness it supports: a sprite, a tileset, an animation, anything that came out of a live Aseprite window.'
		},
		{
			title: 'Run the submit skill',
			body: 'In Claude Code, type the command below. It exports a cover, saves the .aseprite source, writes generation.yaml with your prompts, models and plugin version, and checks it all against the gallery rules.'
		},
		{
			title: 'Open the pull request',
			body: 'The skill opens a pull request against the repository. CI runs the same checks; once it is merged, the piece appears in the gallery.'
		}
	];
</script>

<svelte:head>
	<title>Contribute: Aseprite AI Artist</title>
	<meta name="description" content="How to add your own AI-drawn pixel art to the gallery." />
</svelte:head>

<div class="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
	<h1 class="text-2xl sm:text-4xl">Add your work</h1>
	<p class="text-muted-foreground mt-5 max-w-[62ch] text-lg">
		The gallery is a folder in the repository, and every piece arrives as a pull request. You keep the credit; the
		files, prompts and model names stay with the art so anyone can reproduce or compare it.
	</p>

	<ol class="mt-12 space-y-8">
		{#each steps as step, index (step.title)}
			<li class="grid grid-cols-[auto_1fr] gap-x-5">
				<span class="retro bg-primary text-primary-foreground grid size-10 place-items-center text-sm" aria-hidden="true">
					{index + 1}
				</span>
				<div>
					<h2 class="text-sm leading-relaxed sm:text-base">{step.title}</h2>
					<p class="text-muted-foreground mt-3">{step.body}</p>
					{#if index === 1}
						<div class="mt-5 flex flex-wrap items-center gap-6 px-1.5">
							<Kbd class="h-9 px-3 text-sm">/aseprite:submit</Kbd>
							<CopyButton text="/aseprite:submit" label="Copy" done="Copied /aseprite:submit" />
						</div>
					{/if}
				</div>
			</li>
		{/each}
	</ol>

	<section class="border-pixel mt-14 border-l-4 pl-4" aria-labelledby="benchmarks-note">
		<h2 id="benchmarks-note" class="text-sm leading-relaxed">What about benchmarks?</h2>
		<p class="text-muted-foreground mt-3">
			Contributions go to the gallery. The benchmarks are run by the maintainers, under the same fixed setup every
			time, so the scores stay comparable; new models are added as they are tested.
		</p>
	</section>

	<div class="mt-14 px-1.5">
		<Card font="normal">
			<CardHeader>
				<CardTitle class="text-sm leading-relaxed sm:text-base">Prefer to do it by hand?</CardTitle>
				<CardDescription font="normal" class="font-sans text-base">
					The gallery README describes the folder layout, every field of <code>generation.yaml</code>, and the file size
					limits.
				</CardDescription>
			</CardHeader>
			<CardContent font="normal" class="text-muted-foreground">
				Run <code class="text-foreground">pnpm gallery:check</code> before you push; CI runs it too.
			</CardContent>
			<CardFooter class="flex flex-wrap gap-6 pt-2">
				<Button href={GALLERY_README_URL} rel="noopener">Gallery README</Button>
				<Button href={SUBMIT_SKILL_URL} variant="outline" rel="noopener">Submit skill</Button>
			</CardFooter>
		</Card>
	</div>
</div>
