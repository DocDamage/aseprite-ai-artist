import { strict as assert } from "node:assert";
import { chmodSync, existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { HeadlessClient } from "../dist/bridge/headless.js";
import { findAsepriteBinary } from "../dist/extension.js";
import { createServer } from "../dist/server.js";

const scratch = mkdtempSync(path.join(tmpdir(), "aia-headless-"));

/**
 * A stand-in for `aseprite -b` that speaks the runner's framing: it proves the
 * server side — framing, crash reporting, the editor guard — without Aseprite.
 * `crash` exits mid-session; every other command echoes what it received, and
 * the process remembers how many commands it has seen so a restart is visible.
 */
function fakeAseprite(): string {
  const file = path.join(scratch, "fake-aseprite.mjs");
  writeFileSync(
    file,
    `#!/usr/bin/env node
import readline from "node:readline";
const MARK = "\\u001eaia ";
const emit = (o) => process.stdout.write(MARK + JSON.stringify(o) + "\\n");
process.stdout.write("Aseprite warning: this line is not a frame\\n");
emit({ type: "hello", protocol: 1, extensionVersion: "t", asepriteVersion: "fake", features: ["draw_batch"] });
let seen = 0;
readline.createInterface({ input: process.stdin }).on("line", (line) => {
  const { id, cmd, args } = JSON.parse(line);
  seen++;
  if (cmd === "crash") process.exit(3);
  // Answers, then dies with nothing in flight: the idle-crash case. The exit
  // waits for the write — stdout to a pipe is asynchronous on macOS.
  if (cmd === "reply_then_die") {
    return process.stdout.write(MARK + JSON.stringify({ id, ok: true, data: { cmd, seen } }) + "\\n", () => process.exit(4));
  }
  process.stdout.write("stray print from a handler\\n");
  if (cmd === "sprite.info") return emit({ id, ok: true, data: { filename: "${path.join(scratch, "open.aseprite")}" } });
  if (cmd === "session.site") return emit({ id, ok: true, data: { openSprites: 0, seen } });
  emit({ id, ok: true, data: { cmd, args, seen } });
});
`,
  );
  chmodSync(file, 0o755);
  return file;
}

function client(guardFiles: string[] | null = null) {
  return new HeadlessClient({
    asepritePath: fakeAseprite(),
    cwd: scratch,
    userFolder: path.join(scratch, "home"),
    guard: { openFiles: async () => guardFiles, close: () => {} },
    startupTimeoutMs: 5_000,
  });
}

test("headless replies are matched by id and unmarked output is ignored", async () => {
  const link = client();
  try {
    const [a, b] = await Promise.all([
      link.call<{ cmd: string }>("frame.apply", { op: "list" }),
      link.call<{ cmd: string }>("layer.apply", { op: "list" }),
    ]);
    assert.equal(a.cmd, "frame.apply");
    assert.equal(b.cmd, "layer.apply");
    assert.equal(link.hello?.asepriteVersion, "fake");
  } finally {
    link.close();
  }
});

test("a crash between calls is reported once, then the session restarts empty", async () => {
  const link = client();
  try {
    await link.call("session.site");
    await assert.rejects(link.call("crash"), (err: { code?: string }) => err.code === "headless_exited");
    // In flight when it died: the rejection above is the report. The next call
    // gets a fresh process, and its counter proves it is not the old one.
    const fresh = await link.call<{ seen: number }>("session.site");
    assert.equal(fresh.seen, 1);
  } finally {
    link.close();
  }
});

test("a crash while idle surfaces on the next call instead of a silent fresh session", async () => {
  const link = client();
  try {
    await link.call("reply_then_die");
    await assert.rejects(link.call("session.site"), (err: { code?: string; message: string }) =>
      err.code === "headless_exited" && /unsaved/.test(err.message),
    );
    const fresh = await link.call<{ seen: number }>("session.site");
    assert.equal(fresh.seen, 1);
  } finally {
    link.close();
  }
});

test("headless refuses to write a file the user's Aseprite window has open", async () => {
  const open = path.join(scratch, "open.aseprite");
  const link = client([open]);
  try {
    for (const [cmd, args] of [
      ["sprite.manage", { op: "save_as", path: open }],
      ["sprite.manage", { op: "open", path: "open.aseprite" }], // relative to cwd
      ["sprite.manage", { op: "save" }], // the sprite's own filename is the open file
      ["export.run", { op: "aseprite", path: open }],
    ] as const) {
      await assert.rejects(
        link.call(cmd, args),
        (err: { code?: string }) => err.code === "file_open_in_editor",
        `${cmd} ${args.op} should be refused`,
      );
    }
    const other = await link.call<{ cmd: string }>("sprite.manage", {
      op: "save_as",
      path: path.join(scratch, "elsewhere.aseprite"),
    });
    assert.equal(other.cmd, "sprite.manage");
  } finally {
    link.close();
  }
});

test("headless preflight without an executable says so instead of pretending", async () => {
  const { server, live } = createServer({ headless: true, asepritePath: path.join(scratch, "missing-aseprite") });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const mcp = new Client({ name: "test", version: "0" });
  await Promise.all([mcp.connect(ct), server.connect(st)]);
  try {
    const result = await mcp.callTool({ name: "preflight", arguments: {} });
    const structured = result.structuredContent as { ready: boolean; mode: string; directive: string };
    assert.equal(structured.ready, false);
    assert.equal(structured.mode, "headless");
    assert.match(structured.directive, /Could not run|ASEPRITE_PATH/);
  } finally {
    live.close();
    await server.close();
  }
});

test("preflight switches mode only when asked, and the choice sticks", async () => {
  // A live server with nothing to attach to: ports nobody listens on, no bridge spawn.
  const { server, live } = createServer({
    pluginPort: 19971,
    controlPort: 19972,
    autoSpawnBridge: false,
    asepritePath: fakeAseprite(),
  });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const mcp = new Client({ name: "test", version: "0" });
  await Promise.all([mcp.connect(ct), server.connect(st)]);
  const preflight = async (args: Record<string, unknown>) =>
    (await mcp.callTool({ name: "preflight", arguments: args })).structuredContent as {
      ready: boolean;
      mode: string;
      switched: boolean;
    };
  try {
    // Not ready in live mode is a refusal, not a cue to go headless.
    const first = await preflight({});
    assert.deepEqual([first.mode, first.ready, first.switched], ["live", false, false]);

    const forced = await preflight({ mode: "headless" });
    assert.deepEqual([forced.mode, forced.ready, forced.switched], ["headless", true, true]);

    // Every later call — including a preflight without `mode` — stays headless.
    const again = await preflight({});
    assert.deepEqual([again.mode, again.switched], ["headless", false]);
    const site = await mcp.callTool({ name: "sprite_manage", arguments: { op: "list" } });
    assert.notEqual(site.isError, true, "tools follow the switch");

    const back = await preflight({ mode: "live" });
    assert.deepEqual([back.mode, back.switched], ["live", true]);
  } finally {
    live.close();
    await server.close();
  }
});

// The real chain: MCP → HeadlessClient → aseprite -b → headless/runner.lua →
// the shipped extension. Skipped where Aseprite is not installed (CI).
const aseprite = findAsepriteBinary();
test("headless drives a real batch Aseprite end to end", { skip: aseprite ? false : "no Aseprite executable" }, async () => {
  const { server, live } = createServer({ headless: true });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const mcp = new Client({ name: "test", version: "0" });
  await Promise.all([mcp.connect(ct), server.connect(st)]);
  const call = async (name: string, args: Record<string, unknown>) => {
    const result = await mcp.callTool({ name, arguments: args });
    assert.notEqual(result.isError, true, `${name}: ${JSON.stringify(result.content)}`);
    return result.structuredContent as Record<string, unknown>;
  };
  try {
    const pf = await call("preflight", {});
    assert.equal(pf.ready, true);
    assert.equal(pf.mode, "headless");

    await call("sprite_manage", { op: "new", width: 8, height: 8 });
    await call("draw", {
      ops: [{ kind: "rect", rect: { x: 2, y: 2, width: 3, height: 3 }, color: "#ff004d", fill: "#ff004d" }],
      paletteLock: false,
    });
    // State survives between calls: the sprite made two calls ago is still the
    // active one, with the pixels drawn in the previous call.
    const ascii = await call("look", { op: "ascii" });
    assert.ok(Object.values(ascii.legend as Record<string, string>).some((hex) => hex.startsWith("#ff004d")));

    const out = path.join(scratch, "real.aseprite");
    await call("sprite_manage", { op: "save_as", path: out });
    assert.equal(existsSync(out), true);

    // look op 'diff' with `layer` compares that layer alone: a change on
    // another layer must not show up, and the composite must.
    await call("layer", { op: "create", name: "still" });
    await call("frame", { op: "add" });
    await call("draw", {
      layer: "Layer 1",
      frame: 2,
      ops: [{ kind: "rect", rect: { x: 0, y: 0, width: 2, height: 2 }, color: "#29adff", fill: "#29adff" }],
      paletteLock: false,
    });
    const composite = await call("look", { op: "diff", fromFrame: 1, toFrame: 2 });
    const scoped = await call("look", { op: "diff", fromFrame: 1, toFrame: 2, layer: "still" });
    assert.ok((composite.changedPixels as number) > 0, "the composite sees the edit");
    assert.equal(scoped.changedPixels, 0, "a layer the edit never touched reports no change");
  } finally {
    live.close();
    await server.close();
  }
});
