/**
 * omp (oh-my-pi) extension: the omp half of `hooks/hooks.json`.
 *
 * omp installs this repository as a marketplace plugin and picks up the
 * skills, agents and MCP server from the same tree Claude Code uses — but it
 * does not run Claude's `hooks.json`. This module restores the two hooks there
 * with omp's event API, so neither harness gets less discipline than the other:
 *
 * - SessionStart → a hidden note on the first prompt saying whether the bridge
 *   is reachable.
 * - PostToolUse on draw/recolor/transform → the "look at it" nudge, appended to
 *   the first successful mutating result of the session.
 *
 * Plain `.mjs` with no imports from omp: a plugin cloned from git has no build
 * step and no dev dependencies, and the handlers only use the event payloads.
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bridgeStatusMessage, LOOK_NUDGE } from "../hooks/shared.mjs";

const SKILLS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "skills");

/**
 * Every harness shows these workflows as `aseprite:<name>`: Claude Code from the
 * plugin name, MCP clients from the prompt names. omp is the exception — it
 * lists plugin skills as `/skill:<name>` — so the same names are registered here
 * as commands, from the same SKILL.md files.
 */
export function loadSkillCommands(dir = SKILLS_DIR) {
  const commands = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    let raw;
    try {
      raw = readFileSync(path.join(dir, entry.name, "SKILL.md"), "utf8");
    } catch {
      continue;
    }
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
    const description = match?.[1].match(/^description:\s*(.+)$/m)?.[1].trim() ?? entry.name;
    commands.push({
      name: `aseprite:${entry.name}`,
      skill: entry.name,
      description,
      body: match ? raw.slice(match[0].length).trim() : raw.trim(),
    });
  }
  return commands.sort((a, b) => a.name.localeCompare(b.name));
}

export function skillPrompt(command, args) {
  const request = args.trim();
  return [
    `Follow the \`${command.name}\` workflow below (also at skill://${command.skill}).`,
    "",
    command.body,
    ...(request ? ["", `User request: ${request}`] : []),
  ].join("\n");
}

// Claude names plugin MCP tools `mcp__plugin_aseprite_aseprite__draw`; omp
// names the same tool `mcp__aseprite_aseprite_draw`, and a server wired by hand
// as `aseprite-ai-artist` gives `mcp__aseprite-ai-artist__draw`.
const PIXEL_MUTATION = /^mcp__.*aseprite.*_(?:draw|recolor|transform)$/;

export function isPixelMutation(toolName) {
  return typeof toolName === "string" && PIXEL_MUTATION.test(toolName);
}

export default function asepriteAiArtist(pi) {
  let status = null;
  let statusSent = false;
  let nudged = false;

  const reset = () => {
    // Probe at session start so the first prompt never waits on it.
    status = bridgeStatusMessage();
    statusSent = false;
    nudged = false;
  };
  pi.on("session_start", reset);
  pi.on("session_switch", reset);

  for (const command of loadSkillCommands()) {
    pi.registerCommand(command.name, {
      description: command.description,
      handler: async (args, ctx) => {
        await pi.sendUserMessage(skillPrompt(command, args ?? ""));
        // Print/RPC runs exit when the command returns; wait for the turn it started.
        await ctx?.waitForIdle?.();
      },
    });
  }

  pi.on("before_agent_start", async () => {
    if (statusSent) return;
    statusSent = true;
    return {
      message: {
        customType: "aseprite-ai-artist/status",
        content: await (status ?? bridgeStatusMessage()),
        display: false,
        attribution: "agent",
      },
    };
  });

  // Once per session: a reminder the model sees on every draw becomes noise it
  // learns to skip.
  pi.on("tool_result", async (event) => {
    if (nudged || event.isError || !isPixelMutation(event.toolName)) return;
    nudged = true;
    return { content: [...event.content, { type: "text", text: LOOK_NUDGE }] };
  });
}
