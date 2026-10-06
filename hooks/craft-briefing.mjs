#!/usr/bin/env node
/**
 * On every prompt, put the `## Essentials` of the rule files the request's
 * subject calls for into context, so the agent draws with the rulebook in hand
 * instead of being told it exists. The omp extension does the same from its
 * `before_agent_start` handler; the text comes from shared.mjs in both.
 *
 * Claude Code passes the prompt as typed — `/aseprite:studio …` included and
 * not yet expanded — so the skill body's subject table cannot match itself.
 */

import { readFileSync } from "node:fs";
import { craftBriefing } from "./shared.mjs";

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const briefing = craftBriefing(payload.prompt ?? "");
if (!briefing) process.exit(0);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: briefing.text,
    },
  }),
);
