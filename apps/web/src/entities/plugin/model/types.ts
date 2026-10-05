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
