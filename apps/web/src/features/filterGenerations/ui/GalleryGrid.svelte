<script lang="ts" module>
	import type { Facets, GenerationSummary } from '$entities/generation';

	export type FilterKey = 'model' | 'plugin' | 'harness' | 'prompt' | 'tag';
</script>

<script lang="ts">
	import { replaceState } from '$app/navigation';
	import CloseIcon from '~icons/pixelarticons/close';
	import SearchIcon from '~icons/pixelarticons/search';
	import { onMount } from 'svelte';
	import { GenerationCard } from '$entities/generation';
	import { Masonry, WALL_COLUMNS } from '$shared/ui/masonry';
	import {
		Button,
		Empty,
		EmptyContent,
		EmptyDescription,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle,
		Input,
		Select
	} from '$shared/ui/8bit';
	import { plural } from '$shared/lib/format';

	interface Props {
		generations: GenerationSummary[];
		facets: Facets;
		/** Which filters this grid offers; a single-benchmark grid drops `prompt`. */
		keys?: FilterKey[];
		/** Resolved path of the page, so the query string can be written back to it. */
		path: string;
	}

	let { generations, facets, keys = ['model', 'plugin', 'harness', 'prompt', 'tag'], path }: Props = $props();

	const ALL = 'all';
	const FREE = 'free-form';
	const PAGE_SIZE = 24;

	let query = $state('');
	let filters = $state<Record<FilterKey, string>>({ model: ALL, plugin: ALL, harness: ALL, prompt: ALL, tag: ALL });
	let shownCount = $state(PAGE_SIZE);

	const allSelects = $derived<
		{ key: FilterKey; label: string; all: string; options: { value: string; label: string }[] }[]
	>([
		{ key: 'model', label: 'Model', all: 'Any model', options: facets.models.map((m) => ({ value: m, label: m })) },
		{
			key: 'plugin',
			label: 'Plugin version',
			all: 'Any version',
			options: facets.plugins.map((v) => ({ value: v, label: `v${v}` }))
		},
		{
			key: 'harness',
			label: 'Harness',
			all: 'Any harness',
			options: facets.harnesses.map((h) => ({ value: h, label: h }))
		},
		{
			key: 'prompt',
			label: 'Benchmark',
			all: 'Everything',
			options: [...facets.prompts.map((p) => ({ value: p.id, label: p.title })), { value: FREE, label: 'Free-form only' }]
		},
		{ key: 'tag', label: 'Tag', all: 'Any tag', options: facets.tags.map((t) => ({ value: t, label: t })) }
	]);
	const selects = $derived(allSelects.filter((select) => keys.includes(select.key)));

	const matches = (generation: GenerationSummary): boolean => {
		const words = query.toLowerCase().split(/\s+/).filter(Boolean);
		if (!words.every((word) => generation.search.includes(word))) return false;
		if (filters.model !== ALL && !generation.models.includes(filters.model)) return false;
		if (filters.plugin !== ALL && generation.plugin !== filters.plugin) return false;
		if (filters.harness !== ALL && generation.harness !== filters.harness) return false;
		if (filters.prompt === FREE && generation.benchmark) return false;
		if (filters.prompt !== ALL && filters.prompt !== FREE && generation.benchmark?.prompt !== filters.prompt) return false;
		if (filters.tag !== ALL && !generation.tags.includes(filters.tag)) return false;
		return true;
	};

	const matching = $derived(generations.filter(matches));
	const visible = $derived(matching.slice(0, shownCount));
	const active = $derived(query.trim() !== '' || keys.some((key) => filters[key] !== ALL));

	onMount(() => {
		const params = new URLSearchParams(location.search);
		query = params.get('q') ?? '';
		for (const select of selects) {
			const value = params.get(select.key);
			if (value && select.options.some((option) => option.value === value)) filters[select.key] = value;
		}
		const show = Number.parseInt(params.get('show') ?? '', 10);
		if (show > PAGE_SIZE) shownCount = Math.ceil(show / PAGE_SIZE) * PAGE_SIZE;
	});

	function syncUrl() {
		const params = new URLSearchParams();
		if (query.trim()) params.set('q', query.trim());
		for (const key of keys) if (filters[key] !== ALL) params.set(key, filters[key]);
		if (shownCount > PAGE_SIZE) params.set('show', String(shownCount));
		// svelte/no-navigation-without-resolve: the path is already resolve()d by the page.
		replaceState(params.size > 0 ? `${path}?${params}` : path, {});
	}

	function refilter() {
		shownCount = PAGE_SIZE;
		syncUrl();
	}

	function showMore() {
		shownCount += PAGE_SIZE;
		syncUrl();
	}

	function reset() {
		query = '';
		for (const key of keys) filters[key] = ALL;
		refilter();
	}
</script>

<form class="space-y-6 px-1.5" role="search" onsubmit={(event) => event.preventDefault()}>
	<div>
		<label for="gallery-search" class="retro mb-3 block text-[0.625rem]">Search</label>
		<Input
			id="gallery-search"
			type="search"
			font="normal"
			bind:value={query}
			oninput={refilter}
			placeholder="Title, prompt text, author, tag…"
			class="h-11 text-base md:text-base"
		/>
	</div>
	<div class={['grid grid-cols-2 gap-x-6 gap-y-5', selects.length >= 5 ? 'md:grid-cols-5' : 'md:grid-cols-3']}>
		{#each selects as select (select.key)}
			<div class="min-w-0">
				<span id="label-{select.key}" class="retro mb-3 block text-[0.625rem]">{select.label}</span>
				<Select.Root
					type="single"
					value={filters[select.key]}
					onValueChange={(value) => {
						filters[select.key] = value || ALL;
						refilter();
					}}
				>
					<Select.Trigger
						id="filter-{select.key}"
						aria-labelledby="label-{select.key} filter-{select.key}"
						font="normal"
						class="w-full text-sm"
					>
						{filters[select.key] === ALL
							? select.all
							: (select.options.find((option) => option.value === filters[select.key])?.label ?? select.all)}
					</Select.Trigger>
					<Select.Content font="normal">
						<Select.Item value={ALL} label={select.all} class="text-sm">{select.all}</Select.Item>
						{#each select.options as option (option.value)}
							<Select.Item value={option.value} label={option.label} class="text-sm">{option.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		{/each}
	</div>
</form>

<div class="mt-6 flex min-h-10 flex-wrap items-center justify-between gap-3">
	<p class="text-muted-foreground text-sm" aria-live="polite">
		{#if active}Showing {visible.length} of {plural(matching.length, 'match', 'matches')}, {generations.length} in all{:else}{plural(
				generations.length,
				'piece'
			)}{/if}
	</p>
	{#if active}
		<Button variant="ghost" size="sm" onclick={reset}>
			<CloseIcon aria-hidden="true" />
			Clear filters
		</Button>
	{/if}
</div>

{#if visible.length > 0}
	<Masonry
		items={visible}
		key={(generation) => generation.id}
		breakpoints={WALL_COLUMNS}
		class="mt-6 px-1.5"
	>
		{#snippet item(generation, index)}
			<GenerationCard {generation} eager={index < 4} />
		{/snippet}
	</Masonry>
	{#if visible.length < matching.length}
		<div class="mt-12 flex justify-center">
			<Button variant="outline" onclick={showMore}>Show more ({matching.length - visible.length} left)</Button>
		</div>
	{/if}
{:else}
	<Empty class="border-pixel mt-6 pixel-notch [--notch:6px] border-6 border-dashed">
		<EmptyHeader>
			<EmptyMedia variant="icon"><SearchIcon aria-hidden="true" /></EmptyMedia>
			<EmptyTitle class="text-sm leading-relaxed">No piece matches all of these filters</EmptyTitle>
			<EmptyDescription class="font-sans text-base">Loosen one of them, or clear them all.</EmptyDescription>
		</EmptyHeader>
		<EmptyContent>
			<Button variant="outline" onclick={reset}>Clear filters</Button>
		</EmptyContent>
	</Empty>
{/if}
