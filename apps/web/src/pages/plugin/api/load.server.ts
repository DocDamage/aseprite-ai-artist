import { renderedMarkdown, repoStats } from '#shared/api/index.server.js';
import type { PluginPageData } from '../model/types';
import { agents, skills } from './plugin.server';

export async function load(): Promise<PluginPageData> {
	const [readme, stats] = await Promise.all([
		renderedMarkdown('README.md', { 'docs/INSTALL.md': '/plugin/install' }),
		repoStats()
	]);
	return { readme, stats, skills: skills(), agents: agents(), fetchedAt: new Date().toISOString() };
}
