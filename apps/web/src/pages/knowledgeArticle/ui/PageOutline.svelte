<script lang="ts">
	import type { ArticleHeading } from '#entities/knowledge/index.js';

	let { headings }: { headings: ArticleHeading[] } = $props();
</script>

<ul class="space-y-1 text-sm">
	{#each headings as heading (heading.id)}
		<li class={heading.depth === 3 ? 'pl-4' : undefined}>
			<a
				href="#{heading.id}"
				class="block py-1.5 leading-snug text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
				>{heading.text}</a
			>
		</li>
	{/each}
</ul>
