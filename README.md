<div align="center">

<img src="docs/media/rainy-bookshop.gif" alt="A rainy night in Japan: a raccoon pulls a can from a vending machine, lightning flashes over the rooftops, maple leaves blow past an old bookshop where someone in a hoodie reads and sips coffee in warm lamplight" width="768">

# Aseprite AI Artist

### Your coding agent, painting in the Aseprite window you already have open.

Not a generated PNG. Not a file changed behind your back.
The document on your screen, one pixel at a time — and every step is one Ctrl+Z.

[![npm](https://img.shields.io/npm/v/@pebbly/aseprite-ai-artist?color=%23e07a3f&label=npm)](https://www.npmjs.com/package/@pebbly/aseprite-ai-artist)
[![CI](https://github.com/with-pebbly/aseprite-ai-artist/actions/workflows/ci.yml/badge.svg)](https://github.com/with-pebbly/aseprite-ai-artist/actions/workflows/ci.yml)
[![licence](https://img.shields.io/badge/licence-MIT-blue)](LICENSE)

<sub>☔ 500×400 · 72 frames · 20 layers — drawn by <b>Claude Opus 5.5</b> through this server.</sub>

**[Install](#-install)** · **[How it draws](#-how-it-draws)** · **[Skills](#-skills)** · **[Gallery](https://pixeli.pebbly.space/)**

</div>

---

## ✨ What it feels like

> *"Draw me a 32×32 knight in the PICO-8 palette, then give him a 4-frame idle."*

You type that, and watch it happen in Aseprite: a palette, a silhouette, shading,
layers, a breathing idle, a tagged cycle. The agent **looks at its own work**
after every step, and at the end tells you what it compromised on.

You stay in charge. Don't like the helmet? Ctrl+Z, or just say so.

Works with **Claude Code, omp, Codex CLI, Gemini CLI, Cursor, VS Code and
Windsurf**. Best results so far: **Claude Opus 5.5**.

## 🚀 Install

You need [Aseprite](https://www.aseprite.org/) 1.3+ and Node 22.6+ (macOS, Linux
or Windows).

**1. The Aseprite extension** — then quit and reopen Aseprite:

```bash
npx @pebbly/aseprite-ai-artist install-extension
```

**2. Your agent:**

<details open>
<summary><b>Claude Code</b></summary>

```
/plugin marketplace add with-pebbly/aseprite-ai-artist
/plugin install aseprite@aseprite-ai-artist
```

</details>

<details>
<summary><b>omp</b></summary>

```bash
omp plugin marketplace add with-pebbly/aseprite-ai-artist
omp plugin install aseprite@aseprite-ai-artist
```

</details>

<details>
<summary><b>Codex, Gemini, Cursor, VS Code, Windsurf</b></summary>

```bash
npx @pebbly/aseprite-ai-artist install codex      # or gemini, cursor, --all
```

Your config is backed up first; `--dry-run` shows the change.

</details>

**3. Check it** — restart your agent, then:

```bash
npx @pebbly/aseprite-ai-artist doctor
```

All ticks means you're ready. Updating? Run step 1 again. Odd setups (Steam,
custom folders, Windows paths) are in [docs/INSTALL.md](docs/INSTALL.md).

<details>
<summary><b>No window? Headless mode</b></summary>

For CI or a batch of assets, the server can run Aseprite itself with no window:

```bash
npx @pebbly/aseprite-ai-artist serve --headless --aseprite /path/to/aseprite
```

Nothing is on disk until the agent saves, and it never touches a file your
editor has open. It is never a fallback: if your window isn't attached, the
agent asks instead of quietly switching.

</details>

## 🎨 How it draws

Ask `/aseprite:studio` for anything and it runs the whole job:

| | Stage | What happens |
|---|---|---|
| 1 | **Connect** | Checks Aseprite is attached and reads what's open. If it isn't, it stops — it never edits files behind your back. |
| 2 | **Brief** | Only for open-ended requests: size, palette, view, light — **one** message, one answer. |
| 3 | **Concept** | For anything new: writes the design down and gives you a prompt for an image model. Send back a concept sheet, or say "continue without". |
| 4 | **Draw** | Silhouette first, written as a text grid (below), then shading. |
| 5 | **Animate** | Splits limbs onto layers, plans key poses and timing, draws each frame, tags the cycles. |
| 6 | **Review** | Looks, validates, fixes — two rounds, and it tells you if a third wouldn't help. |
| 7 | **Export** | Spritesheet + atlas, GIF or PNGs for your engine. |

After every step that changed pixels, it **looks** at the result before moving on.

### 🔤 The grid loop

New in 0.5.0. The agent doesn't draw with circles and rectangles — it **types
the frame out**, one character per pixel, and draws that text in one call. To
fix something, it reads the canvas back in the same format and changes only
the characters that are wrong.

<img src="docs/media/grid-loop.svg" alt="Four steps: the agent writes a pebble as rows of characters; Aseprite draws it; the agent reads it back as text and changes two characters; Aseprite draws the pebble winking" width="100%">

It sees the whole shape while writing it, so silhouettes stay even, limbs keep
their length between frames, and an edit never spills into its neighbours.
Animation is the same trick: copy the last frame's rows, move the arm, draw.

Since 0.6.0 every character stands for one palette entry, the same on every
read, so a big canvas can be read and edited in pieces without the letters
changing meaning between them. A grid can be as large as the canvas.

Early signal, not a measurement: with the same model and prompts, the mage
benchmark went 3 → 4/10 and the road 1 → 3/10; the tree stayed at 2
([compare them](https://pixeli.pebbly.space/benchmarks)).

### 📚 The pixel-art knowledge base

New in 0.7.0. The agent doesn't improvise how a hand looks at 16 px or how a
horse's legs move in a walk — it reads it. [`rules/`](rules/) holds 62 files
of pixel-art craft, by subject:

| Band | Covers |
|---|---|
| `0x` | core discipline: the loop, palette, shading, silhouette, outlines, review |
| `1x` | technique: lines and curves, clusters, anti-aliasing, dithering, readability |
| `2x` | colour: hue-shifted ramps, platform palettes, materials, lighting |
| `3x` | characters: proportions, anatomy, heads, eyes and expressions, hands and feet, hair and clothing, views, portraits |
| `4x` | animation: timing, idle, walk and run, jumps, attacks and hitstop, secondary motion, subpixel, top-down |
| `5x` | creatures: quadrupeds and their gaits, birds, small creatures, monsters |
| `6x` | environments: skies, landscapes, parallax, trees, water, ground, tiles, buildings |
| `7x` | objects and 3D: perspective, isometric, solid forms, props, vehicles, turnarounds |
| `8x` | effects and UI: fire, smoke, magic, impacts and game feel, particles, icons, fonts |
| `9x` | style: console eras, composition, and the tells of generated art |

Each file has size budgets (what fits at 8, 16, 32, 64 px), a procedure,
the usual mistakes, a review checklist — and around 400 pixel templates in
all, written as grids the agent can paste straight onto the canvas: hand
ladders, eye sets, walk and run key poses, quadrupeds, circles and isometric
cubes, seamless tiles, flame frames. `studio` sends each stage to the files
for its subject, and every client reads them as `rules://` resources.

**About 2000 palettes** come bundled: the console classics (`pico8`,
`gameboy`, `cga`, `1bit`…) and the most-downloaded palettes on
[Lospec](https://lospec.com/palette-list), each credited to its author. Ask
for one by key — `palette` op `preset`, `"endesga-32"` — or by a word of its
name, and the agent gets the matching keys back. Nothing to download.

**Read it on the web:** [pixeli.pebbly.space/knowledge](https://pixeli.pebbly.space/knowledge)
shows the same files from the same commit — every rule with its templates
drawn as pixel pictures, every skill and agent, and a searchable
[palette catalogue](https://pixeli.pebbly.space/knowledge/palettes).

## 🧰 Skills

`studio` picks these for you. Call one directly when you know the step you want
— as `/aseprite:<name>` in Claude Code and omp, or just ask elsewhere.

| Skill | For | Try |
|---|---|---|
| 🎬 **`studio`** | anything — it plans and runs the rest | `/aseprite:studio a fox, 32×32, sleeping loop` |
| 📝 **`brief`** | a vague idea | `/aseprite:brief a cosy tavern keeper` |
| 🖼️ **`concept`** | a design or storyboard before drawing | `/aseprite:concept a fire mage, 4-frame walk` |
| 📄 **`new`** | a fresh document set up right | `/aseprite:new 64×64, PICO-8` |
| 🎨 **`palette`** | colour: a retro look, ramps, cleanup | `/aseprite:palette give this a Game Boy look` |
| ✏️ **`draw`** | making the thing, text included | `/aseprite:draw a fox curled up asleep` |
| 🌗 **`shade`** | flat art that needs light | `/aseprite:shade light from the upper left` |
| 🦴 **`rig`** | splitting a character for animation | `/aseprite:rig split the knight` |
| 🏃 **`animate`** | walk, idle, attack cycles | `/aseprite:animate 8-frame walk cycle` |
| 🧱 **`tileset`** | terrain and autotiles | `/aseprite:tileset grass-to-dirt, 16px` |
| 🔍 **`review`** | an honest critique | `/aseprite:review why does this look off?` |
| 🩹 **`fix`** | changing art without wrecking it | `/aseprite:fix make him more menacing` |
| 📦 **`export`** | files for your engine | `/aseprite:export spritesheet for Godot` |
| 🗂️ **`submit`** | sharing it in the gallery | `/aseprite:submit` |

In Claude Code and omp, four specialists take stages off the main agent:
**palette-smith**, **rig-builder**, **animation-director** and the read-only
**pixel-critic**.

## 🏆 Which model?

| Model | Drew | How it went |
|---|---|---|
| **Claude Opus 5.5** | the rainy bookshop up top | Best so far — 72 frames, 20 layers, one session plus a few notes. |
| **Codex CLI** `gpt-5.6-terra` | the mascot | Strong, after five rounds of critique. |
| Others | — | Untested. [Send us a sprite!](gallery/README.md) |

Scored, repeatable runs live on the [benchmark](https://pixeli.pebbly.space/benchmarks).

## 🗂️ Gallery and benchmark

Everything drawn with the plugin — with its prompts, models and `.aseprite`
source — is at **[pixeli.pebbly.space](https://pixeli.pebbly.space/)**. The
benchmark puts every model and plugin version through the same three fixed
prompts and scores them against written criteria, and the
[knowledge base](https://pixeli.pebbly.space/knowledge) shows the rulebook
the agents draw by.

Made something? Ask your agent for `/aseprite:submit` — it packages the files
and opens the pull request.

## 🔧 Under the hood

```
your agent  ──MCP──▶  server  ──▶  bridge  ──▶  Aseprite extension
```

- **18 tools, grouped by noun** (`draw`, `look`, `layer`, `frame`, `export`…)
  instead of ninety — every tool costs context on every turn.
  [Reference](docs/TOOLS.md).
- **A knowledge base** in [`rules/`](rules/) — 62 files from line craft to
  walk cycles, with pixel templates — served over MCP, so every client gets the
  same craft knowledge.
- **Safe by default.** Every action is one undo step. With Aseprite detached,
  tools refuse instead of editing files on disk. Everything binds to
  `127.0.0.1`. [Details](docs/ARCHITECTURE.md) · [security](SECURITY.md).

## 🛠️ Development

```bash
pnpm install && pnpm run build
pnpm test                 # TypeScript
pnpm run test:extension   # the Lua handlers, inside a real Aseprite
pnpm gallery:check        # gallery and benchmark data
pnpm web:dev              # the site, locally
```

Read [AGENTS.md](AGENTS.md) before changing anything — it lists the rules that
aren't negotiable and the Lua gotchas that already cost someone a day.

## 📜 Licence

MIT — see [LICENSE](LICENSE). Aseprite is a trademark of Igara Studio S.A.; this
project isn't affiliated with them.

<div align="center"><sub>Made with ☕ and a lot of Ctrl+Z.</sub></div>
