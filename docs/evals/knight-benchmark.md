# The knight benchmark

Our own two-prompt benchmark for judging whether a model can hold this brush.
Not a leaderboard — a fixed, repeatable task with a written pass bar, so a
claim like "Model X drew a good knight" can be checked rather than taken on
faith. Results go in the log at the bottom; add a row, don't replace one.

## Fixed setup

Same starting conditions every run, so a difference in the result is the
model's, not the setup's:

- **Canvas:** 32×32, RGB. `sprite_manage op="new" width=32 height=32 colorMode="rgb"`.
- **Palette:** PICO-8. `palette op="preset" preset="pico8"`.
- **Model gets no other context.** Hand it exactly the prompt text below, plus
  the server's own instructions and skills — no reference image, no extra
  steering.
- **One session per prompt.** Prompt 2 runs in a fresh session against a fresh
  copy of the prompt-1 result, not appended to the same conversation.

## The two prompts

### Prompt 1 — the still knight

> Draw me a 32×32 knight with a sword, standing still. One frame.

### Prompt 2 — the slash

> Starting from this knight, animate a sword slash: windup, then
> follow-through. 4 to 6 frames.

## Procedure

1. Run the prompt with no further instructions from you. Let the model's own
   skills (`brief`, `draw`, `shade`, `rig`, `animate`, `review`) decide the
   path — that choice is part of what's being measured.
2. Do not intervene mid-run unless the model asks a genuine clarifying
   question. Note if it did.
3. When the model reports done, capture the evidence below before judging
   anything yourself.

## What to capture

- `look op="preview"` — the overall read, prompt 1's single frame and prompt
  2's final frame.
- `look op="filmstrip"` — every frame of prompt 2's slash in one image. The
  only reliable way to see the whole cycle at once.
- `look op="onion"` on at least one in-between frame of the slash, to check
  spacing rather than just endpoints.
- The model's own `validate` output (findings, `passed`, `score`) and its
  final review report, verbatim.

## Pass criteria

**Prompt 1 (still knight):**

- `validate` passes with no unaddressed errors (warnings may stand if the
  report names and justifies them).
- Silhouette reads as a knight with a sword at a glance on the preview —
  head, torso, sword all distinguishable without the ascii grid.
- Every colour is on the PICO-8 palette (`validate` check `palette`, or a
  clean `palette op="analyze"`).

**Prompt 2 (slash):**

- `validate` with
  `expect={"layerFrames": {…}, "mustNotOverlap": [["sword","body"]]}` set to
  the model's own rig passes — the contract it built should hold itself.
- The cycle is tagged (`tag op="list"` shows a named tag covering all frames);
  `validate` treats an untagged multi-frame sprite as an error.
- Windup reads as a distinct pose from follow-through on the filmstrip — not
  two frames either side of a single held pose.
- The onion-skinned in-between shows the sword's arc moving, not just the arm
  translating in a straight line (`rules://05-animation`'s "arcs" principle).
- Frame timing is not uniform (`frame op="list"` durations vary — fast on the
  strike, longer on the hold, per `rules://05-animation`).

**Both:** run through `rules://07-review-checklist` and note anything ticked
"no" in the results row rather than silently passing it.

## Results log

| Date | Model | Prompt 1 pass? | Prompt 2 pass? | Notes |
|------|-------|:---:|:---:|-------|
| — | — | — | — | Log entries go here as runs happen. |

## Related

`skill://brief`, `skill://draw`, `skill://animate`, `skill://review`,
`rules://05-animation`, `rules://07-review-checklist`.
