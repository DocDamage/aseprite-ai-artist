# The knight benchmark

Our own two-step benchmark for judging whether a model can hold this brush.
Not a leaderboard — a fixed, repeatable task with a written pass bar, so a
claim like "Model X drew a good knight" can be checked rather than taken on
faith.

The prompt, its fixed setup and its pass criteria live in one place:
[`gallery/prompts/knight/prompt.yaml`](../../gallery/prompts/knight/prompt.yaml).
Results are generations in [`gallery/`](../../gallery/), each carrying its
files and a pass/fail per criterion; the site renders them as a
model × plugin-version matrix. How the store works:
[ADR-0006](../adr/0006-gallery-and-benchmark.md). How to submit a run:
[gallery/README.md](../../gallery/README.md), or `/aseprite:submit`.

## Procedure

1. Run each step with no further instructions from you. Let the model's own
   skills (`brief`, `draw`, `shade`, `rig`, `animate`, `review`) decide the
   path — that choice is part of what's being measured.
2. Do not intervene mid-run unless the model asks a genuine clarifying
   question. Record it as an intervention on that step.
3. When the model reports done, capture the evidence below before judging
   anything yourself.

## What to capture

- `look op="preview"` — the overall read, step 1's single frame and step 2's
  final frame.
- `look op="filmstrip"` — every frame of the slash in one image. The only
  reliable way to see the whole cycle at once.
- `look op="onion"` on at least one in-between frame of the slash, to check
  spacing rather than just endpoints.
- The model's own `validate` output (findings, `passed`, `score`) and its
  final review report, verbatim.

Run through `rules://07-review-checklist` too, and put anything ticked "no" in
the criterion's note rather than silently passing it.

## Related

`skill://brief`, `skill://draw`, `skill://animate`, `skill://review`,
`skill://submit`, `rules://05-animation`, `rules://07-review-checklist`.
