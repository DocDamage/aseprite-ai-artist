import { parse } from 'yaml';
import { REPO_URL } from '#shared/lib/site.js';
import type { Agent, Skill } from '../model/types';

// Bundled from the checkout the site is built from, not fetched from GitHub: skills and
// agents are part of the same commit, so the page can never list a skill the deployed plugin
// does not have. A glob rather than node:fs because /plugin is rendered by an ISR function,
// where the repository is not on disk.
const skillFiles = import.meta.glob<string>('../../../../../../skills/*/SKILL.md', {
	query: '?raw',
	import: 'default',
	eager: true
});
const agentFiles = import.meta.glob<string>('../../../../../../agents/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

/** `studio` is the front door; the rest follow in the order a drawing goes through them. */
const SKILL_ORDER = [
	'studio',
	'brief',
	'concept',
	'new',
	'palette',
	'draw',
	'shade',
	'rig',
	'animate',
	'tileset',
	'review',
	'fix',
	'export',
	'submit'
];

function frontmatter(source: string, file: string): Record<string, unknown> {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) throw new Error(`${file}: no frontmatter`);
	return parse(match[1]!) as Record<string, unknown>;
}

function text(data: Record<string, unknown>, key: string, file: string): string {
	const value = data[key];
	if (typeof value !== 'string' || !value.trim())
		throw new Error(`${file}: missing "${key}" in frontmatter`);
	return value.trim();
}

export function skills(): Skill[] {
	const rank = (name: string) => {
		const index = SKILL_ORDER.indexOf(name);
		return index === -1 ? SKILL_ORDER.length : index;
	};
	return Object.entries(skillFiles)
		.map(([file, source]) => {
			const folder = file.split('/').at(-2)!;
			const data = frontmatter(source, file);
			const name = text(data, 'name', file);
			return {
				name,
				title: typeof data.title === 'string' ? data.title : name,
				description: text(data, 'description', file),
				url: `${REPO_URL}/blob/main/skills/${folder}/SKILL.md`
			};
		})
		.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
}

export function agents(): Agent[] {
	return Object.entries(agentFiles)
		.map(([file, source]) => {
			const data = frontmatter(source, file);
			return {
				name: text(data, 'name', file),
				description: text(data, 'description', file),
				url: `${REPO_URL}/blob/main/agents/${file.split('/').at(-1)}`
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));
}
