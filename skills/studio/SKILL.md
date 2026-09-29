---
name: studio
title: Take any Aseprite request end to end
description: The front door for any Aseprite or pixel-art request. Works out what the user actually wants, picks which workflows to run and in what order, hands parts to the specialist agents where the harness has them, and does not stop until the result has been looked at and reviewed. Use when a request spans several steps ("make me an animated knight for Godot") or when you are unsure which workflow applies.
---

# Take any Aseprite request end to end

The other workflows each do one thing well. This one decides which of them the
request needs, runs them in the order that keeps mistakes cheap, and owns the
result until it is finished. It does not replace them: at every step, read the
workflow it names and follow that — do not do the step from memory.

## Procedure

1. **`preflight`.** If not ready, stop and tell the user what to fix. Nothing
   below works without a live Aseprite, and editing files on disk instead is
   never an acceptable recovery.

2. **Read the room.** `sprite_info` on whatever is open. An open sprite changes
   the plan: "make it bigger" means a sprite that exists, and its canvas and
   palette answer questions you would otherwise have to ask.

3. **Classify the request** against the table below. Most requests are one row;
   a big one ("animated knight, export for Godot") chains several. Write the
   chain down before starting — it is the plan you report progress against.

4. **Decide once whether to ask.** Open-ended requests start with `aseprite:brief`,
   which puts every decision to the user in one message. Specific requests ("add
   a 1px outline", "export this as a GIF") do not — just do them. Never ask more
   than once per stage: a user who asked for a whole animation does not want to
   approve every frame.

5. **Run the chain.** For each stage, read its skill (`skill://<name>`) and
   follow it. Hand a stage to a specialist agent when your harness has one (see
   below) — the agent reads the same rules, so the result is the same whether it
   runs or you do.

6. **Look after every stage that changed pixels.** `look` op `preview` for the
   read, op `ascii` when position matters. A stage is done when you have seen its
   result, not when its tool reported success.

7. **Finish with `aseprite:review`** (or the `pixel-critic` agent) for anything you
   drew or changed. Fix what it finds with `aseprite:fix`, then review again. Two
   rounds is normal; if a third still finds the same problem, stop and tell the
   user what you could not solve instead of looping.

8. **Report** in a few lines: what exists now (document, layers, tags, files
   written), what you decided on the user's behalf, what you compromised on and
   why. Show it — a `look` preview or the exported file's path, not an adjective.

## Routing

| The user wants | Chain |
|----------------|-------|
| Something new, loosely described ("a knight") | `aseprite:brief` → `aseprite:new` → `aseprite:palette` if the palette is not settled → `aseprite:draw` → `aseprite:shade` → `aseprite:review` |
| Something new, fully specified | `aseprite:new` → `aseprite:draw` → `aseprite:shade` → `aseprite:review` |
| An animation of a character | the drawing chain above if nothing exists yet → `aseprite:rig` → `aseprite:animate` → `aseprite:review` |
| An animation of a sprite that is already rigged | `aseprite:animate` → `aseprite:review` |
| Tiles, terrain, level art | `aseprite:brief` if open-ended → `aseprite:tileset` → `aseprite:review` |
| Colours changed, a retro look, a cleanup | `aseprite:palette` → `aseprite:review` |
| Volume, light, "it looks flat" | `aseprite:shade` → `aseprite:review` |
| A change to existing art ("make it more menacing", "fix the hands") | `aseprite:fix` → `aseprite:review` |
| An opinion ("is this good?", "why does it look off?") | `aseprite:review` only — report, do not edit unless asked |
| Files for an engine or for sharing | `aseprite:review` if not already done → `aseprite:export` |
| Words on the art — a label, score, title card | `aseprite:draw` (its Text section) → `aseprite:review` |
| Nine-slice UI panels, pivots or hotspots for an engine | `aseprite:export` (slices) |
| Share the finished work in the community gallery | `aseprite:review` if not already done → `aseprite:submit` |

If a request fits no row, it is usually a direct tool call ("rename the layer",
"add a frame"): make it, `look` if pixels changed, and say what you did.

## Specialists

Claude Code and omp ship four agents. Use them when the harness offers them;
elsewhere, run the matching skill yourself.

| Agent | Takes over | Instead of |
|-------|------------|------------|
| `palette-smith` | proposing and justifying a palette | `aseprite:palette` |
| `rig-builder` | planning and building the layer rig | `aseprite:rig` |
| `animation-director` | key poses, timing and tags before frames are drawn | the planning half of `aseprite:animate` |
| `pixel-critic` | a scored, located critique; read-only | `aseprite:review` |

Give an agent the brief, the document name and the stage it owns — it starts
with no memory of this conversation. Run agents one at a time: they all edit the
same open document, and two at once will fight over the active layer and frame.

## What this workflow must not do

- **Skip the brief on an open-ended request** to seem fast. Guessed size and
  palette cost a full redraw when they are wrong.
- **Ask about things a default covers.** Light from the upper-left is not worth
  a round trip.
- **Declare done without `look` and a review.** A tool result saying pixels
  changed is not evidence the sprite is right.
- **Leave the user's document in a state they did not ask for** — stray scratch
  layers, a changed active frame, colours added to the palette without saying so.

## Related

`rules://index` for the craft every stage relies on, `rules://07-review-checklist`
for what "finished" means.
