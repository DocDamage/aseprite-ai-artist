---
name: animate
title: Animate a cycle
description: Build an idle, walk, run or attack cycle from key poses, set timing that reads as motion rather than a metronome, tag it, and review it as a filmstrip. Use when a rigged sprite needs to move.
---

# Animate a cycle

## Before you start

The sprite must be rigged onto named layers — see `aseprite:rig`. Animating a
flattened sprite means redrawing every frame by hand.

## Procedure

### 1. Plan the key poses

Write them out before touching a frame. For a walk:

1. **Contact** — front foot lands, back foot pushing. Widest stance.
2. **Down** — weight on the front leg, body **lowest**.
3. **Pass** — legs together, body **highest**. The frame everyone forgets, and
   its absence is why a walk looks like sliding.
4. **Up** — pushing off, rising.

Then mirror for the other leg: 8 frames. A 4-frame walk uses contact and pass
per leg.

Idle: 2–4 frames, a breath — chest rises a pixel, shoulders follow one frame
later. Attack: anticipation, strike, hold, recover.

### 2. Create the frames

```
frame op="add" count=7
```

### 3. Block the key poses

Move limbs by moving cels, not by redrawing:

```
cel op="copy" layer="arm-near" frame=1 toFrame=3
cel op="move" layer="arm-near" frame=3 dx=2 dy=-1
```

Redraw only where a part genuinely changes shape — a foreshortened arm, a
bending knee.

### 4. Look at the keys before adding in-betweens

```
look op="filmstrip"
```

A vision model reads only the first frame of a GIF, so the filmstrip is the
only way to actually see the motion. Check volume and height consistency here,
while there are four frames to fix rather than eight.

### 5. Add in-betweens

Only once the keys read. Spacing is your easing: poses close together read slow,
far apart read fast.

```
look op="onion" frame=3
```

Use onion skinning to judge an in-between against its neighbours without
stepping through frames one at a time — it composites the target at full
opacity over ghosted neighbours, oldest-first.

For secondary motion — a bob, a breath, a float — `cel op="tween"` or
`cel op="oscillate"` fill in the in-between cels for you instead of hand-key
by hand-key:

```
cel op="oscillate" layer="hair-back" fromFrame=1 toFrame=8 amplitudeY=1 period=8
```

**Caveat:** easing rounds each frame's offset to the nearest pixel, and on
small amplitudes (1–2px) that rounding can make two adjacent frames land on
the same value and then jump — a stutter, not a stumble. Prefer hand keys for
primary motion (the walk, the strike); reach for `tween`/`oscillate` for
motion nobody is meant to consciously notice.

### 6. Set timing

```
frame op="set_duration" durations=[150,100,100,150,150,100,100,150]
```

Hold contact poses longer than pass poses. Uniform timing reads mechanical no
matter how good the drawings are. Typical ranges are in `rules://05-animation`.

### 7. Tag it

```
tag op="create" name="walk" from=1 to=8 direction="forward"
```

Untagged frames are unusable by a game engine. `validate` treats a multi-frame
untagged sprite as an error.

### 8. Review

`look op="filmstrip"` again, then run through the animation checks in
`rules://07-review-checklist`: consistent volume, consistent height, clean loop,
anticipation before strong actions, light that does not move. Run `validate`
with an `expect` describing the cycle — which layers live on which frames, which
parts must never overlap — so the mechanical check knows what "right" means here.

## Related

`rules://05-animation`, `rules://06-layers-and-rigging`.
