import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bridgeStatusMessage, LOOK_NUDGE, loadSkillCommands, skillPrompt } from "../hooks/shared.mjs";

const OWN_DIR = path.dirname(fileURLToPath(import.meta.url));

export function isPixelMutation(toolName) {
  return typeof toolName === "string" && /^aseprite(-ai-artist)?_(draw|recolor|transform)$/.test(toolName);
}

// Sibling tree first (checkout, and git layouts that keep it); then the npm
// package if the host happens to have it; otherwise null and setup stays alive.
export function resolveSkillsDir(pluginDir = OWN_DIR) {
  const sibling = path.join(pluginDir, "..", "skills");
  if (existsSync(path.join(sibling, "studio", "SKILL.md"))) return path.resolve(sibling);
  try {
    const pkg = createRequire(import.meta.url).resolve("@pebbly/aseprite-ai-artist/package.json");
    const bundled = path.join(path.dirname(pkg), "skills");
    if (existsSync(path.join(bundled, "studio", "SKILL.md"))) return bundled;
  } catch { /* not installed — the caller reports */ }
  return null;
}

export default {
  id: "aseprite",
  async setup(ctx) {
    const skillsDir = resolveSkillsDir();
    if (!skillsDir) {
      // A plugin load must not take the session down; the MCP tools and
      // resources work without us.
      process.stderr.write("[aseprite-ai-artist] skills not found next to the plugin; /aseprite:* commands and skills are skipped. See docs/INSTALL.md.\n");
      return;
    }
    const commands = loadSkillCommands(skillsDir);
    const statusSent = new Set();
    const nudged = new Set();

    await ctx.skill.transform((editor) => {
      for (const command of commands) {
        editor.add({
          id: command.skill,
          name: command.skill,
          description: command.description,
          path: path.join(skillsDir, command.skill, "SKILL.md"),
          content: command.body,
        });
      }
    });

    await ctx.command.transform((editor) => {
      for (const command of commands) {
        editor.add({
          name: command.name,
          description: command.description,
          execute: async ({ sessionID, prompt, delivery }) => {
            await ctx.session.prompt({ ...prompt, sessionID, text: skillPrompt(command, prompt.text ?? ""), delivery });
          },
        });
      }
    });

    await ctx.session.hook("context", async (event) => {
      if (statusSent.has(event.sessionID)) return;
      statusSent.add(event.sessionID);
      event.system.push({ type: "text", text: await bridgeStatusMessage() });
    });

    await ctx.tool.hook("execute.after", (event) => {
      if (event.status !== "completed" || nudged.has(event.sessionID) || !isPixelMutation(event.tool)) return;
      const content = event.result?.content;
      // A malformed result must not spend the session's one nudge.
      if (!Array.isArray(content)) return;
      nudged.add(event.sessionID);
      event.result = { ...event.result, content: [...content, { type: "text", text: LOOK_NUDGE }] };
    });
  },
};
