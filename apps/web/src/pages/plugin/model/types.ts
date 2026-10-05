import type { RepoStats } from '#shared/api/index.js';

/** A workflow from the plugin's `skills/` folder, invoked as `/aseprite:<name>`. */
export interface Skill {
	name: string;
	title: string;
	description: string;
	/** The SKILL.md on GitHub. */
	url: string;
}

/** A subagent from the plugin's `agents/` folder. */
export interface Agent {
	name: string;
	description: string;
	url: string;
}

export interface PluginPageData {
	/** The README as GitHub renders it; null when GitHub could not be reached at build time. */
	readme: string | null;
	stats: RepoStats | null;
	skills: Skill[];
	agents: Agent[];
	/** When the numbers were fetched: the site is a build-time snapshot. */
	fetchedAt: string;
}
