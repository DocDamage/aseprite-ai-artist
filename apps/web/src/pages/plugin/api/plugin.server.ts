import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { REPO_URL } from '#shared/lib/site.js';
import type { Agent, Skill } from '../model/types';

// Read from the checkout the site is built from, not from GitHub: skills and agents are part
// of the same commit, so the page can never list a skill the deployed plugin does not have.

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

function frontmatter(file: string): Record<string, unknown> {
	const match = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
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
	const root = join(__PLUGIN_ROOT__, 'skills');
	const rank = (name: string) => {
		const index = SKILL_ORDER.indexOf(name);
		return index === -1 ? SKILL_ORDER.length : index;
	};
	return readdirSync(root, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => {
			const file = join(root, entry.name, 'SKILL.md');
			const data = frontmatter(file);
			const name = text(data, 'name', file);
			return {
				name,
				title: typeof data.title === 'string' ? data.title : name,
				description: text(data, 'description', file),
				url: `${REPO_URL}/blob/main/skills/${entry.name}/SKILL.md`
			};
		})
		.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
}

export function agents(): Agent[] {
	const root = join(__PLUGIN_ROOT__, 'agents');
	return readdirSync(root)
		.filter((name) => name.endsWith('.md'))
		.map((fileName) => {
			const file = join(root, fileName);
			const data = frontmatter(file);
			return {
				name: text(data, 'name', file),
				description: text(data, 'description', file),
				url: `${REPO_URL}/blob/main/agents/${fileName}`
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));
}
