import { strict as assert } from "node:assert";
import { existsSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
// @ts-ignore — plain .mjs on purpose: loaded from a clone, no build step.
import plugin, { isPixelMutation, resolveSkillsDir } from "../opencode/index.mjs";
// @ts-ignore
import { LOOK_NUDGE } from "../hooks/shared.mjs";

// Nothing listens here, so the status probe answers fast and never touches a
// real Aseprite session.
process.env.ASEPRITE_AI_CONTROL_PORT = "19971";

type Any = Record<string, any>;

function load() {
  const commands: Any[] = [];
  const skills: Any[] = [];
  const toolHooks = new Map<string, Any>();
  const sessionHooks = new Map<string, Any>();
  const sent: Any[] = [];
  const ctx = {
    command: { transform: async (cb: Any) => cb({ add: (c: Any) => commands.push(c) }) },
    skill: { transform: async (cb: Any) => cb({ add: (s: Any) => skills.push(s) }) },
    tool: { hook: async (name: string, cb: Any) => void toolHooks.set(name, cb) },
    session: {
      hook: async (name: string, cb: Any) => void sessionHooks.set(name, cb),
      prompt: async (p: Any) => void sent.push(p),
    },
  };
  return { ready: plugin.setup(ctx), commands, skills, toolHooks, sessionHooks, sent };
}

const result = (sessionID: string, tool: string, content: Any[] | undefined = [{ type: "text", text: "412 pixels changed" }]) => ({
  status: "completed",
  sessionID,
  tool,
  result: content === undefined ? {} : { content },
});

test("every skill becomes a command and a skill entry", async () => {
  const { ready, commands, skills } = load();
  await ready;
  const onDisk = readdirSync(new URL("../skills/", import.meta.url)).filter((n) =>
    existsSync(new URL(`../skills/${n}/SKILL.md`, import.meta.url)),
  );
  assert.deepEqual(commands.map((c) => c.name).sort(), onDisk.map((n) => `aseprite:${n}`).sort());
  assert.deepEqual(skills.map((s) => s.id).sort(), [...onDisk].sort());
  const draw = commands.find((c) => c.name === "aseprite:draw");
  assert.ok(draw);
  assert.ok(!draw.description.startsWith("description"), "frontmatter parsed");
});

test("a command sends the skill body with the typed request", async () => {
  const { ready, commands, sent } = load();
  await ready;
  const draw = commands.find((c) => c.name === "aseprite:draw");
  await draw.execute({ sessionID: "s1", delivery: "steer", prompt: { text: " a knight " } });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].sessionID, "s1");
  assert.equal(sent[0].delivery, "steer");
  assert.ok(sent[0].text.includes("User request: a knight"));
  await draw.execute({ sessionID: "s1", delivery: "steer", prompt: { text: "" } });
  assert.ok(!sent[1].text.includes("User request"), "no empty request line");
});

test("the look nudge fires once per session on successful mutations", async () => {
  const { ready, toolHooks } = load();
  await ready;
  const after = toolHooks.get("execute.after");
  const first = result("s1", "aseprite-ai-artist_draw");
  await after(first);
  assert.deepEqual(first.result.content, [{ type: "text", text: "412 pixels changed" }, { type: "text", text: LOOK_NUDGE }]);
  const second = result("s1", "aseprite_recolor");
  await after(second);
  assert.equal(second.result.content.length, 1, "once per session");
  const other = result("s2", "aseprite_transform");
  await after(other);
  assert.equal(other.result.content.length, 2, "a new session is nudged again");
});

test("non-mutations, failures and odd results never nudge", async () => {
  const { ready, toolHooks } = load();
  await ready;
  const after = toolHooks.get("execute.after");
  const look = result("s3", "aseprite_look");
  await after(look);
  assert.equal(look.result.content.length, 1);
  const failed = { ...result("s3", "aseprite_draw"), status: "error" };
  await after(failed);
  assert.equal(failed.result.content.length, 1);
  const odd = { status: "completed", sessionID: "s3", tool: "aseprite_draw", result: {} };
  await after(odd); // must not throw
  await after(look);
  const proper = result("s3", "aseprite_draw");
  await after(proper);
  assert.equal(proper.result.content.length, 2, "a malformed result does not spend the session's one nudge");
});

test("status lands once per session on the first context call", async () => {
  const { ready, sessionHooks } = load();
  await ready;
  const context = sessionHooks.get("context");
  const a = { sessionID: "s1", system: [] };
  await context(a);
  assert.equal(a.system.length, 1);
  assert.match(a.system[0].text, /no bridge on :19971/);
  const again = { sessionID: "s1", system: [] };
  await context(again);
  assert.equal(again.system.length, 0);
  const fresh = { sessionID: "s2", system: [] };
  await context(fresh);
  assert.equal(fresh.system.length, 1);
});

test("isPixelMutation matches OpenCode tool ids, not Claude's", () => {
  for (const name of ["aseprite-ai-artist_draw", "aseprite_recolor", "aseprite_transform"]) {
    assert.equal(isPixelMutation(name), true, name);
  }
  for (const name of ["aseprite-ai-artist_look", "aseprite_draw_extra", "write", undefined]) {
    assert.equal(isPixelMutation(name), false, String(name));
  }
});

test("resolveSkillsDir finds the checkout skills and fails softly elsewhere", () => {
  const here = path.dirname(fileURLToPath(new URL("../opencode/index.mjs", import.meta.url)));
  assert.equal(resolveSkillsDir(here), path.resolve(here, "..", "skills"));
  assert.equal(resolveSkillsDir(mkdtempSync(path.join(tmpdir(), "aia-nowhere-"))), null);
});
