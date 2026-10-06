import { strict as assert } from "node:assert";
import { test } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
// @ts-ignore — plain .mjs on purpose: the hooks run from a git clone with no build step.
import { essentialsOf } from "../hooks/shared.mjs";
import { compileGrid } from "../dist/lib/grid.js";
import { loadRuleTemplates, templateProblems } from "../scripts/rule-templates.ts";

const rulesDir = path.resolve(import.meta.dirname, "..", "rules");

test("every pixel template in the rulebook is a grid `draw` would accept as written", () => {
  // Agents transcribe these straight into `draw` op `grid`; a ragged row or an
  // undeclared glyph there is an error mid-drawing, or a silently shifted limb.
  const templates = loadRuleTemplates(rulesDir);
  const problems = templates.flatMap(templateProblems);
  assert.deepEqual(problems, []);

  for (const t of templates) {
    const legend = Object.fromEntries(Object.entries(t.legend).map(([g, v]) => [g, v.hex]));
    const width = Array.from(t.rows[0]!).length;
    assert.doesNotThrow(
      () => compileGrid({ x: 0, y: 0, legend, rows: t.rows, transparent: "skip" }, { width, height: t.rows.length }),
      `${t.file}:${t.line} '${t.name}'`,
    );
  }
});

test("template names are unique, so a rule can point at one unambiguously", () => {
  const seen = new Map<string, string>();
  const clashes: string[] = [];
  for (const t of loadRuleTemplates(rulesDir)) {
    const prior = seen.get(t.name);
    if (prior) clashes.push(`${t.name}: ${prior} and ${t.file}:${t.line}`);
    seen.set(t.name, `${t.file}:${t.line}`);
  }
  assert.deepEqual(clashes, []);
});

test("every subject rule has a short Essentials digest whose template names exist", () => {
  // The craft briefing hook injects these verbatim; an over-long digest costs
  // context on every matching request, and a template it names but the file
  // lacks sends the agent hunting for nothing.
  const names = new Set(loadRuleTemplates(rulesDir).map((t) => t.name));
  const problems: string[] = [];
  for (const file of readdirSync(rulesDir).filter((f) => /^[1-9]\d-.*\.md$/.test(f))) {
    const essentials = essentialsOf(readFileSync(path.join(rulesDir, file), "utf8"));
    if (essentials === null) {
      problems.push(`${file}: no ## Essentials section`);
      continue;
    }
    const lines = essentials.split("\n").length;
    if (lines > 40) problems.push(`${file}: Essentials is ${lines} lines (max 40)`);
    const templatesLine = essentials.split("\n").find((l) => /^\W*Templates:/.test(l)) ?? "";
    for (const [, name] of templatesLine.matchAll(/`([a-z0-9][a-z0-9-]+)`/g)) {
      if (!names.has(name!)) problems.push(`${file}: Essentials names template '${name}', which no grid block defines`);
    }
  }
  assert.deepEqual(problems, []);
});