/// <reference types="unplugin-icons/types/svelte5" />

declare global {
	/** Absolute path of the gallery folder, fixed at build time by vite.config.ts. */
	const __GALLERY_ROOT__: string;
	/** Absolute path of the plugin package (the repository root), fixed by vite.config.ts. */
	const __PLUGIN_ROOT__: string;

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
