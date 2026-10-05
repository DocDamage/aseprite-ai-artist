<script lang="ts">
	// Shows HTML that GitHub rendered from a markdown file (see shared/api/github). That output
	// is already sanitised by GitHub, which is why it is trusted here; never pass it anything else.
	interface Props {
		html: string;
		class?: string;
	}

	let { html, class: className = '' }: Props = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- GitHub-sanitised markdown, see above -->
<div class="markdown {className}">{@html html}</div>

<style>
	.markdown {
		line-height: 1.7;
		overflow-wrap: anywhere;
	}
	.markdown :global(:where(p, ul, ol, pre, table, blockquote, details, .markdown-heading)) {
		margin-block: 1rem;
	}
	.markdown :global(:where(h2, h3, h4, h5, h6)) {
		font-family: var(--font-retro);
		line-height: 1.6;
		margin: 0;
	}
	.markdown :global(h2) {
		font-size: 1.25rem;
	}
	.markdown :global(h3) {
		font-size: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 4px solid var(--pixel);
	}
	.markdown :global(:where(h4, h5, h6)) {
		font-size: 0.75rem;
	}
	.markdown :global(.markdown-heading) {
		margin-top: 2.5rem;
		position: relative;
		scroll-margin-top: 6rem;
	}
	.markdown :global(:where(h2, h3, h4, h5, h6)[id]),
	.markdown :global(.anchor[id]) {
		scroll-margin-top: 6rem;
	}
	/* GitHub's permalink icon: kept for keyboard and pointer users, shown on hover/focus. */
	.markdown :global(.anchor) {
		position: absolute;
		left: -1.5rem;
		top: 0.25rem;
		opacity: 0;
		color: var(--muted-foreground);
	}
	.markdown :global(.markdown-heading:hover .anchor),
	.markdown :global(.anchor:focus-visible) {
		opacity: 1;
	}
	.markdown :global(.anchor svg) {
		fill: currentColor;
	}
	.markdown :global(a:not(.anchor)) {
		color: var(--foreground);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.markdown :global(:where(ul, ol)) {
		padding-left: 1.5rem;
	}
	.markdown :global(ul) {
		list-style: square;
	}
	.markdown :global(ol) {
		list-style: decimal;
	}
	.markdown :global(li + li) {
		margin-top: 0.35rem;
	}
	.markdown :global(blockquote) {
		border-left: 6px solid var(--pixel);
		padding-left: 1rem;
		color: var(--muted-foreground);
	}
	.markdown :global(:not(pre) > code) {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.875em;
		background: var(--muted);
		padding: 0.1rem 0.35rem;
	}
	.markdown :global(pre) {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		background: var(--card);
		border: 4px solid var(--pixel);
		padding: 1rem;
		overflow-x: auto;
		overflow-wrap: normal;
	}
	/* GitHub wraps code blocks in a div that carries a copy button driven by its own script. */
	.markdown :global(clipboard-copy),
	.markdown :global(.zeroclipboard-container) {
		display: none;
	}
	.markdown :global(table) {
		display: block;
		overflow-x: auto;
		border-collapse: collapse;
	}
	.markdown :global(:where(th, td)) {
		border: 2px solid var(--border);
		padding: 0.4rem 0.75rem;
		text-align: left;
		vertical-align: top;
	}
	.markdown :global(th) {
		background: var(--muted);
	}
	.markdown :global(img) {
		display: inline-block;
		max-width: 100%;
		height: auto;
		image-rendering: pixelated;
	}
	/* Badges are vector text, not pixel art; GitHub proxies external ones (shields.io) via camo. */
	.markdown :global(img[src*='camo.githubusercontent.com']),
	.markdown :global(img[src*='badge.svg']) {
		image-rendering: auto;
	}
	.markdown :global(details) {
		border: 2px dashed var(--border);
		padding: 0.5rem 1rem;
	}
	.markdown :global(summary) {
		cursor: pointer;
	}
	.markdown :global(hr) {
		border: 0;
		border-top: 4px solid var(--pixel);
		margin-block: 2rem;
	}
	.markdown :global([align='center']) {
		text-align: center;
	}
	.markdown :global(sub) {
		color: var(--muted-foreground);
	}
</style>
