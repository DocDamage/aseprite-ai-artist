import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		prerender: {
			handleUnseenRoutes: 'ignore'
		},
		alias: {
			// `$app` belongs to SvelteKit, so the app layer is `$app-shell`.
			'$app-shell': 'src/app',
			$shared: 'src/shared',
			$entities: 'src/entities',
			$features: 'src/features',
			$widgets: 'src/widgets',
			$pages: 'src/pages'
		}
	},
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	}
};

export default config;
