import { strict as assert } from "node:assert";
import { existsSync, readdirSync } from "node:fs";
import { test } from "node:test";
// @ts-ignore — plain .mjs on purpose: omp loads it from a git clone with no build step.
import extension, { isPixelMutation, loadSkillCommands, skillPrompt } from "../omp/aseprite-ai-artist.mjs";
// @ts-ignore
import { LOOK_NUDGE, matchSubjects } from "../hooks/shared.mjs";

// Nothing listens here, so the status probe answers fast and never touches a
// real Aseprite session.
process.env.ASEPRITE_AI_CONTROL_PORT = "19961";

type Handler = (event?: unknown) => unknown;

function load() {
  const handlers = new Map<string, Handler>();
  extension({
    on: (name: string, fn: Handler) => handlers.set(name, fn),
    registerCommand: () => {},
    sendUserMessage: () => {},
  });
  const emit = (name: string, event?: unknown) => {
    const fn = handlers.get(name);
    assert.ok(fn, `extension registers ${name}`);
    return fn(event);
  };
  return { emit };
}

const text = (t: string) => ({ type: "text", text: t });
const result = (toolName: string, isError = false) => ({
  type: "tool_result",
  toolName,
  toolCallId: "1",
  input: {},
  content: [text("412 pixels changed")],
  isError,
});

test("every skill becomes an /aseprite:<workflow> command carrying its body", () => {
  const commands = loadSkillCommands();
  // Every skill directory on disk, not a hardcoded count: a new skill that the
  // omp extension silently skipped is the bug this test exists to catch.
  const onDisk = readdirSync(new URL("../skills/", import.meta.url)).filter((name) =>
    existsSync(new URL(`../skills/${name}/SKILL.md`, import.meta.url)),
  );
  assert.deepEqual(commands.map((c: { name: string }) => c.name).sort(), onDisk.map((n) => `aseprite:${n}`).sort());
  assert.ok(commands.some((c: { name: string }) => c.name === "aseprite:studio"));
  const draw = commands.find((c: { name: string }) => c.name === "aseprite:draw");
  assert.ok(draw, "draw maps to aseprite:draw");
  assert.ok(!draw.body.startsWith("---"), "frontmatter is stripped");
  assert.ok(!draw.description.startsWith("description"), "description is parsed");
  const prompt = skillPrompt(draw, " a knight ");
  assert.ok(prompt.includes(draw.body));
  assert.ok(prompt.endsWith("User request: a knight"));
  assert.ok(!skillPrompt(draw, "").includes("User request"));
});

test("mutating tools match under both harnesses' MCP naming", () => {
  for (const name of [
    "mcp__aseprite_aseprite_draw",
    "mcp__aseprite_aseprite_recolor",
    "mcp__aseprite_aseprite_transform",
    "mcp__plugin_aseprite_aseprite__draw",
    "mcp__aseprite_draw",
  ]) {
    assert.equal(isPixelMutation(name), true, name);
  }
  for (const name of [
    "mcp__aseprite_aseprite_look",
    "mcp__aseprite_aseprite_draw_extra",
    "mcp__other_draw",
    "write",
    undefined,
  ]) {
    assert.equal(isPixelMutation(name), false, String(name));
  }
});

test("look nudge is appended once per session, only after a successful mutation", async () => {
  const { emit } = load();
  emit("session_start", { type: "session_start" });

  assert.equal(await emit("tool_result", result("mcp__aseprite_aseprite_look")), undefined);
  assert.equal(await emit("tool_result", result("mcp__aseprite_aseprite_draw", true)), undefined);

  const first = (await emit("tool_result", result("mcp__aseprite_aseprite_draw"))) as {
    content: unknown[];
  };
  assert.deepEqual(first.content, [text("412 pixels changed"), text(LOOK_NUDGE)]);
  assert.equal(await emit("tool_result", result("mcp__aseprite_aseprite_recolor")), undefined);

  emit("session_start", { type: "session_start" });
  assert.ok(await emit("tool_result", result("mcp__aseprite_aseprite_transform")));
});

test("bridge status reaches the model once per session, hidden from the transcript", async () => {
  const { emit } = load();
  emit("session_start", { type: "session_start" });

  const first = (await emit("before_agent_start", { prompt: "draw a knight" })) as {
    message: { content: string; display: boolean };
  };
  assert.match(first.message.content, /no bridge on :19961/);
  assert.equal(first.message.display, false);
  assert.equal(await emit("before_agent_start", { prompt: "now shade it" }), undefined);

  emit("session_switch", { type: "session_switch" });
  assert.ok(await emit("before_agent_start", { prompt: "resumed" }));
});

test("the craft briefing carries the essentials the request's subject calls for, from the raw submission", async () => {
  const { emit } = load();
  emit("session_start", { type: "session_start" });
  // omp expands /skill:studio into its body before this event, and that body
  // names every subject; the briefing must come from what the user typed.
  emit("input", { text: "/skill:studio a knight swinging his sword in a slash attack" });
  const expanded = `${loadSkillCommands().find((c: { name: string }) => c.name === "aseprite:studio").body}\nUser: a knight swinging his sword in a slash attack`;
  const first = (await emit("before_agent_start", { prompt: expanded })) as { message: { content: string } };
  assert.match(first.message.content, /### rules:\/\/44-attacks-and-impacts/);
  assert.match(first.message.content, /### rules:\/\/30-proportions-by-size/);
  assert.doesNotMatch(first.message.content, /### rules:\/\/64-water/, "subjects named only by the skill body leak in");
  assert.match(first.message.content, /Rules used:/);

  // Already briefed this session: the same subjects are not sent again.
  emit("input", { text: "now make the slash faster" });
  assert.equal(await emit("before_agent_start", { prompt: "now make the slash faster" }), undefined);
  // A new subject is.
  emit("input", { text: "add a river behind him" });
  const later = (await emit("before_agent_start", { prompt: "add a river behind him" })) as { message: { content: string } };
  assert.match(later.message.content, /### rules:\/\/64-water/);
});

test("subject matching ranks the most-mentioned subject first and ignores incidental words", () => {
  const attack = matchSubjects("The mage blasts the enemy: attack anticipation, attack impact, blast arcs. Keep the mage on model.");
  assert.equal(attack[0], "44-attacks-and-impacts");
  assert.ok(attack.includes("30-proportions-by-size"));
  // "run validate" and a house's "faces" are not a run cycle or a face.
  assert.deepEqual(matchSubjects("Before you finish, run validate. Both faces of the house are lit."), ["67-architecture-and-interiors"]);
  assert.ok(matchSubjects("нарисуй рыцаря с мечом").includes("30-proportions-by-size"));
  assert.deepEqual(matchSubjects("rename the layer"), []);
});
