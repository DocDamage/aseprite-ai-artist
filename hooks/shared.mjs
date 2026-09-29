/**
 * What the hooks tell the model, kept in one place because two harnesses
 * deliver it: Claude Code runs the scripts next to this file from
 * `hooks.json`, and omp loads `omp/aseprite-ai-artist.mjs` as an extension.
 * The wording and the probe must not drift between them.
 */

import net from "node:net";

const PROBE_BUDGET_MS = 400;

function probe(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port });
    const done = (open) => {
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(PROBE_BUDGET_MS);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

/**
 * Deliberately cheap: a raw TCP connect to the bridge's control port, no
 * dependencies, hard 400ms budget. A hook that slows session start is a hook
 * people disable. Never rejects.
 */
export async function bridgeStatusMessage() {
  // Headless sessions have no bridge by design; probing for one would tell
  // the model to go fix a setup that is not broken.
  if (/^(1|true|yes)$/.test(process.env.ASEPRITE_AI_HEADLESS ?? "")) {
    return "aseprite-ai-artist: headless mode — a batch Aseprite starts on the first tool call and there is no window. Call preflight first, and save with sprite_manage before finishing.";
  }
  const controlPort = Number(process.env.ASEPRITE_AI_CONTROL_PORT || 9932);
  const bridge = await probe(controlPort);
  // The control port being open means the bridge is up, not that Aseprite has
  // connected — only `preflight` can answer that, so say so rather than
  // implying a readiness this probe cannot see.
  return bridge
    ? `aseprite-ai-artist: bridge is up on :${controlPort}. Call preflight before any drawing to confirm Aseprite itself is attached.`
    : `aseprite-ai-artist: no bridge on :${controlPort} yet — it starts on the first tool call. If drawing fails, run \`npx @pebbly/aseprite-ai-artist doctor\`.`;
}

export const LOOK_NUDGE =
  "You just changed pixels. Call `look` before deciding whether it worked — op 'preview' for the overall read, op 'ascii' for exact pixel positions. A tool result saying pixels changed is not evidence that the sprite is right.";
