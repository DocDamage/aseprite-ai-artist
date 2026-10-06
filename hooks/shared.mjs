/**
 * What the hooks tell the model, kept in one place because two harnesses
 * deliver it: Claude Code runs the scripts next to this file from
 * `hooks.json`, and omp loads `omp/aseprite-ai-artist.mjs` as an extension.
 * The wording and the probe must not drift between them.
 */

import { readFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RULES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "rules");

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

/**
 * Subject words → rule files. The rulebook only helps if the agent reads the
 * right file before it draws, and a table it is merely told about gets skipped
 * (measured: 0–2 of 62 files opened per benchmark step). So the hooks match the
 * request against these words and put each matched file's `## Essentials`
 * digest into context up front.
 *
 * Under the cap, the subjects the request mentions most come first, ties in
 * table order: a brief that says "attack" eight times is about the attack,
 * even though it also names the character. Ambiguous words are left out on
 * purpose — "run validate", a house's "faces", "a later step will animate".
 * A word ending in `*` is a stem; any other word must match whole; `_` joins
 * the words of a multi-word term.
 */
const SUBJECTS = [
  { codes: ["44-attacks-and-impacts", "81-impacts-and-game-feel"], words: "attack* slash* punch* kick* hit hits impact* blast* strike* удар* атак*" },
  { codes: ["42-walk-and-run"], words: "walk walks walking walk_cycle run_cycle running_cycle sprint* stride* gait* ходьб* бег бега бегущ*" },
  { codes: ["43-jump-fall-land"], words: "jumps jumping jump_cycle leap* прыж*" },
  { codes: ["41-idle-and-breathing"], words: "idle breath* дыхан*" },
  { codes: ["47-top-down-animation"], words: "top_down 8_direction* eight_direction*" },
  { codes: ["51-animal-gaits"], words: "gallop* trot* canter* галоп*" },
  { codes: ["75-rotation-and-turnarounds"], words: "turnaround* turntable* rotat* spin spins spinning поворот* враща*" },
  { codes: ["40-timing-and-spacing"], words: "animat* cycle* анимац*" },
  { codes: ["30-proportions-by-size", "32-heads-and-faces", "34-hands-and-feet"], words: "character* hero heroes heroine* mage* wizard* knight* warrior* archer* person* people human* girl* boy* man men woman women npc* villager* персонаж* герой* маг мага магом рыцар* человек*" },
  { codes: ["32-heads-and-faces", "33-eyes-and-expressions"], words: "facial eye eyes expression* smirk* smile* emotion* лицо лица глаз* эмоци*" },
  { codes: ["38-portraits"], words: "portrait* bust avatar* портрет*" },
  { codes: ["35-hair-and-clothing"], words: "hair* coat* cloak* cape capes scarf* robe* armor* armour* clothes clothing outfit* волос* плащ* одежд*" },
  { codes: ["50-quadrupeds"], words: "horse* dog dogs cat cats wolf wolves fox foxes deer cow cows pony ponies quadruped* animal* лошад* собак* кошк* животн*" },
  { codes: ["52-birds-and-flight"], words: "bird* wing wings flight flying птиц*" },
  { codes: ["53-small-creatures"], words: "fish insect* bug bugs frog* snake* slime* рыб* насеком*" },
  { codes: ["54-monster-design"], words: "monster* creature* dragon* demon* undead монстр* дракон*" },
  { codes: ["71-isometric", "72-3d-forms"], words: "isometric* 3d turntable* изометр*" },
  { codes: ["67-architecture-and-interiors"], words: "house* cottage* building* castle* tower* room rooms interior* roof* дом дома домик* здани* замок*" },
  { codes: ["63-trees-and-foliage"], words: "tree trees foliage leaves blossom* bush* forest* дерев* листв*" },
  { codes: ["61-landscapes-and-terrain", "60-skies-and-atmosphere", "91-composition-and-scenes"], words: "landscape* valley* mountain* hill hills scenery vista* sky skies cloud* пейзаж* ландшафт* небо долин*" },
  { codes: ["64-water"], words: "water* river* lake* sea ocean* waterfall* вода воды рек*" },
  { codes: ["62-parallax-backgrounds"], words: "parallax* параллакс*" },
  { codes: ["66-tiles-and-autotiling", "65-ground-rocks-grass"], words: "tile tiles tileset* autotile* тайл*" },
  { codes: ["73-props-and-items"], words: "item items prop props sword* potion* chest chests weapon* shield* предмет* меч*" },
  { codes: ["74-vehicles-and-machines"], words: "car cars vehicle* tank tanks ship ships plane planes robot* mech mechs машин* корабл*" },
  { codes: ["80-vfx-fire-smoke-magic"], words: "fire flame* smoke* magic* spell* glow* explosion* огон* дым* маги*" },
  { codes: ["82-particles-and-weather"], words: "particle* rain snow wind weather дожд* снег* ветер*" },
  { codes: ["83-ui-and-icons"], words: "ui icon icons hud button* иконк*" },
  { codes: ["21-limited-and-platform-palettes"], words: "pico_8 pico8 nes game_boy gameboy gba snes retro 8_bit 16_bit" },
].map(({ codes, words }) => ({
  codes,
  pattern: new RegExp(
    words
      .split(" ")
      .map((w) => {
        const stem = w.endsWith("*");
        // `_` joins a multi-word term: "top_down" matches "top-down", "top down" and "topdown".
        const body = (stem ? w.slice(0, -1) : w).replace(/[.*+?^${}()|[\]\\-]/g, "\\$&").replaceAll("_", "[ -]?");
        return `(?<![\\p{L}\\p{N}])${body}${stem ? "" : "(?![\\p{L}\\p{N}])"}`;
      })
      .join("|"),
    "gu",
  ),
}));

/** At most this many digests per briefing — six ~20-line sections is ~120 lines. */
const BRIEFING_CAP = 6;

/** The user's words, without a leading `/skill:x` or `/aseprite:x` command. */
export function requestText(raw) {
  const text = String(raw ?? "");
  // omp folds an expanded skill into the prompt as "…skill body…\nUser: <request>".
  const user = text.lastIndexOf("\nUser: ");
  const tail = user >= 0 ? text.slice(user + 7) : text;
  return tail.replace(/^\s*\/[\w:-]+\s*/, "");
}

/** Rule names whose subject the request mentions, most-mentioned subject first. */
export function matchSubjects(request) {
  const text = requestText(request).toLowerCase();
  const hits = SUBJECTS.map(({ codes, pattern }, order) => ({ codes, order, count: text.match(pattern)?.length ?? 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count || a.order - b.order);
  const codes = [];
  for (const { codes: group } of hits) for (const code of group) if (!codes.includes(code)) codes.push(code);
  return codes;
}

/** A rule file's `## Essentials` body, without its heading; null when it has none. */
export function essentialsOf(body) {
  const match = /^## Essentials[ \t]*\r?\n([\s\S]*?)(?=^## )/m.exec(body);
  return match ? match[1].trim() : null;
}

/**
 * The briefing for one request: `{ text, codes }`, or null when the request
 * names no subject not already in `skip`. Reads the rule files from `rulesDir`
 * so the digest is always the shipped text.
 */
export function craftBriefing(request, rulesDir = RULES_DIR, skip = new Set()) {
  const sections = [];
  const codes = [];
  for (const code of matchSubjects(request)) {
    if (skip.has(code) || codes.length >= BRIEFING_CAP) continue;
    let body;
    try {
      body = readFileSync(path.join(rulesDir, `${code}.md`), "utf8");
    } catch {
      continue;
    }
    const essentials = essentialsOf(body);
    if (!essentials) continue;
    const title = /^#\s+(.+)$/m.exec(body)?.[1] ?? code;
    sections.push(`### rules://${code} — ${title}\n\n${essentials}`);
    codes.push(code);
  }
  if (sections.length === 0) return null;
  const text = [
    "aseprite-ai-artist craft briefing. The request touches these subjects of the pixel-art rulebook; their essentials are below.",
    "Apply them while planning and drawing — they are decisions, not background. Open the full file (rules://<name>) when you need one of the named grid templates; transcribe it with `draw` op `grid`, mapping its legend roles onto the sprite's palette.",
    "In your final report, add a line `Rules used:` naming the rules and templates you actually applied.",
    "",
    ...sections.flatMap((s) => [s, ""]),
  ]
    .join("\n")
    .trimEnd();
  return { text, codes };
}
