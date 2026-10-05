<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowLeftIcon from '~icons/pixelarticons/arrow-left';
	import ExternalLinkIcon from '~icons/pixelarticons/external-link';
	import { CopyButton } from '#features/copyPrompt/index.js';
	import { Markdown } from '#shared/ui/markdown/index.js';
	import { Seo } from '#shared/ui/seo/index.js';
	import {
		INSTALL_DOC_URL,
		NPM_PACKAGE,
		PLUGIN_NAME,
		SITE_NAME,
		SITE_URL
	} from '#shared/lib/site.js';
	import type { PluginInstallPageData } from '../model/types';

	interface Props {
		data: PluginInstallPageData;
	}

	let { data }: Props = $props();

	const { guide } = $derived(data);

	// The quick start mirrors the README's Install section; the full guide below is
	// docs/INSTALL.md itself, fetched from GitHub when the site is built.
	const agents = [
		{
			name: 'Claude Code',
			commands: [
				'/plugin marketplace add with-pebbly/aseprite-ai-artist',
				'/plugin install aseprite@aseprite-ai-artist'
			],
			note: 'Type these in a Claude Code session.'
		},
		{
			name: 'omp',
			commands: [
				'omp plugin marketplace add with-pebbly/aseprite-ai-artist',
				'omp plugin install aseprite@aseprite-ai-artist'
			],
			note: 'Run these in your shell.'
		},
		{
			name: 'Codex, Gemini CLI, Cursor, VS Code, Windsurf',
			commands: [`npx ${NPM_PACKAGE} install codex`],
			note: 'Swap codex for gemini or cursor, or pass --all. Your config is backed up first; --dry-run shows the change.'
		}
	];

	const steps = [
		{
			id: 'extension',
			title: 'Install the Aseprite extension',
			body: 'This puts the bridge into Aseprite. Quit and reopen Aseprite afterwards. Run it again to update.',
			command: `npx ${NPM_PACKAGE} install-extension`
		},
		{
			id: 'agent',
			title: 'Connect your agent',
			body: 'Pick the agent you use.',
			command: null
		},
		{
			id: 'doctor',
			title: 'Check it',
			body: 'Restart your agent, then run the doctor. All ticks means you are ready.',
			command: `npx ${NPM_PACKAGE} doctor`
		}
	];

	const description = `How to install ${PLUGIN_NAME}, the MCP server that lets Claude Code, Codex, Gemini CLI and Cursor draw pixel art in Aseprite: one npx command for the Aseprite extension, one for your agent, and a doctor check.`;

	const jsonLd = [
		{
			'@context': 'https://schema.org',
			'@type': 'HowTo',
			name: `Install ${PLUGIN_NAME}`,
			description,
			tool: [
				{ '@type': 'HowToTool', name: 'Aseprite 1.3 or later' },
				{ '@type': 'HowToTool', name: 'Node.js 22.6 or later' }
			],
			step: steps.map((step, index) => ({
				'@type': 'HowToStep',
				position: index + 1,
				name: step.title,
				text: step.command ? `${step.body} Command: ${step.command}` : step.body,
				url: `${SITE_URL}/plugin/install#${step.id}`
			}))
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
				{ '@type': 'ListItem', position: 2, name: 'Plugin', item: `${SITE_URL}/plugin` },
				{ '@type': 'ListItem', position: 3, name: 'Install', item: `${SITE_URL}/plugin/install` }
			]
		}
	];
</script>

{#snippet command(text: string)}
	<div class="mt-4 flex flex-wrap items-center gap-4">
		<pre
			class="min-w-0 flex-1 overflow-x-auto border-4 border-pixel bg-card px-4 py-3 font-mono text-sm"><code
				>{text}</code
			></pre>
		<CopyButton {text} label="Copy" done="Copied: {text}" />
	</div>
{/snippet}

<Seo title="Install {PLUGIN_NAME}" {description} {jsonLd} />

<div class="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
	<nav aria-label="Breadcrumb">
		<a
			href={resolve('plugin')}
			class="inline-flex h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeftIcon aria-hidden="true" />
			{PLUGIN_NAME}
		</a>
	</nav>

	<h1 class="mt-4 text-2xl leading-snug sm:text-4xl">Install {PLUGIN_NAME}</h1>
	<p class="mt-5 max-w-[62ch] text-lg text-muted-foreground">
		You need <a
			href="https://www.aseprite.org/"
			rel="noopener"
			class="text-foreground underline underline-offset-4">Aseprite</a
		>
		1.3 or later and Node.js 22.6 or later, on macOS, Linux or Windows. Three commands, about a minute.
	</p>

	<ol class="mt-12 space-y-12">
		{#each steps as step, index (step.id)}
			<li id={step.id} class="grid scroll-mt-24 grid-cols-[auto_minmax(0,1fr)] gap-x-5">
				<span
					class="grid size-10 place-items-center bg-primary retro text-sm text-primary-foreground"
					aria-hidden="true"
				>
					{index + 1}
				</span>
				<div>
					<h2 class="text-sm leading-relaxed sm:text-base">{step.title}</h2>
					<p class="mt-3 text-muted-foreground">{step.body}</p>
					{#if step.command}
						{@render command(step.command)}
					{:else}
						<div class="mt-6 space-y-8">
							{#each agents as agent (agent.name)}
								<section aria-labelledby="agent-{agent.name}">
									<h3 id="agent-{agent.name}" class="text-base font-normal">{agent.name}</h3>
									<p class="mt-1 text-sm text-muted-foreground">{agent.note}</p>
									{#each agent.commands as line (line)}
										{@render command(line)}
									{/each}
								</section>
							{/each}
						</div>
					{/if}
				</div>
			</li>
		{/each}
	</ol>

	<section class="mt-14 border-l-6 border-pixel pl-4" aria-labelledby="first-prompt">
		<h2 id="first-prompt" class="text-sm leading-relaxed">Your first drawing</h2>
		<p class="mt-3 text-muted-foreground">
			Open a sprite in Aseprite and ask your agent for something, for example
			<em class="text-foreground"
				>"Draw me a 32×32 knight in the PICO-8 palette, then give him a 4-frame idle."</em
			>
			In Claude Code, <code class="text-foreground">/aseprite:studio</code> runs the whole job.
		</p>
	</section>
</div>

<section class="mx-auto max-w-4xl px-4 pt-16 sm:px-6" aria-labelledby="guide-heading">
	<div class="flex flex-wrap items-baseline justify-between gap-4">
		<h2 id="guide-heading" class="text-lg sm:text-xl">Full install guide</h2>
		<a
			href={INSTALL_DOC_URL}
			rel="noopener"
			class="inline-flex items-center gap-1.5 text-sm underline underline-offset-4"
		>
			View on GitHub
			<ExternalLinkIcon aria-hidden="true" />
		</a>
	</div>
	<p class="mt-4 max-w-[62ch] text-muted-foreground">
		Every agent, project scope, headless mode, troubleshooting and uninstalling.
	</p>
	{#if guide}
		<div class="mt-8 border-4 border-pixel bg-card px-5 py-2 sm:px-10 sm:py-6">
			<Markdown html={guide} />
		</div>
	{:else}
		<p class="mt-6">
			The guide could not be fetched when this page was built.
			<a href={INSTALL_DOC_URL} rel="noopener" class="underline underline-offset-4"
				>Read it on GitHub</a
			>.
		</p>
	{/if}
</section>
