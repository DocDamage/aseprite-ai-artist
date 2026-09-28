<div align="center">

<img src="docs/media/rainy-bookshop.gif" alt="A rainy night in Japan: a raccoon pulls a can from a vending machine, lightning flashes over the rooftops, maple leaves blow past an old bookshop where someone in a hoodie reads and sips coffee in warm lamplight" width="768">

# Aseprite AI Artist

### Your coding agent, painting in the Aseprite window you already have open.

Not a generated PNG. Not a file changed behind your back.
The document on your screen, one pixel at a time — and every step is one Ctrl+Z.

[![npm](https://img.shields.io/npm/v/@pebbly/aseprite-ai-artist?color=%23e07a3f&label=npm)](https://www.npmjs.com/package/@pebbly/aseprite-ai-artist)
[![CI](https://github.com/with-pebbly/aseprite-ai-artist/actions/workflows/ci.yml/badge.svg)](https://github.com/with-pebbly/aseprite-ai-artist/actions/workflows/ci.yml)
[![licence](https://img.shields.io/badge/licence-MIT-blue)](LICENSE)

<sub>☔ 500×400 · 72 frames · 20 layers · one 50-colour palette — drawn by <b>Claude Opus 5.5</b> through this server.<br>
Rain, wind, lightning, a raccoon stealing a cola, and a reader who sips her coffee and turns the page.<br>
Every moving part runs on a cycle that divides the loop, so it never seams.</sub>

**[Install](#-get-started-in-three-steps)** · **[Skills](#-the-skills-and-how-to-use-them)** · **[Models](#-which-model-should-hold-the-brush)** · **[How it works](#-under-the-hood)**

</div>

---

## ✨ What it feels like

You type a sentence:

> *"Draw me a 32×32 knight in the PICO-8 palette, then give him a 4-frame idle."*

…and you watch it happen in Aseprite. The agent picks a palette, blocks in a
silhouette, **stops to look at what it drew**, shades it with hue-shifted ramps,
splits the knight onto layers, animates him breathing, tags the cycle — and then
tells you honestly what it had to compromise on.

You stay in charge the whole time. Don't like the helmet? Ctrl+Z, or just say so.

It works with **Claude Code, omp, Codex CLI, Gemini CLI, Cursor, VS Code and
Windsurf** — one config line each.

> [!TIP]
> **Recommended model: Claude Opus 5.5.** Right now it's the best brush we've
> handed this server — the scene above is its work.

## 🚀 Get started in three steps

You need [Aseprite](https://www.aseprite.org/) 1.3+ and Node 22.6+ on macOS,
Linux or Windows. Open Aseprite once before you start, so its config folder
exists.

### 1. Install the extension

```bash
npx @pebbly/aseprite-ai-artist install-extension
```

Then **quit and reopen Aseprite**. It only connects at startup, so an editor that
was already running will never find the server.

### 2. Connect your agent

<details open>
<summary><b>Claude Code</b> — install the plugin, not the bare server</summary>

<br>

```
/plugin marketplace add with-pebbly/aseprite-ai-artist
/plugin install aseprite@aseprite-ai-artist
```

You get the server, the `/aseprite:*` commands, four specialist subagents and the
preview hooks. Don't also add the server by hand — you'd load every tool twice,
on every request.

</details>

<details>
<summary><b>omp</b> — the same plugin, through omp's marketplace</summary>

<br>

```bash
omp plugin marketplace add with-pebbly/aseprite-ai-artist
omp plugin install aseprite@aseprite-ai-artist
```

Same server, skills, subagents and `/aseprite:*` commands as Claude Code; the
preview hooks come as an omp extension.

</details>

<details>
<summary><b>Codex, Gemini, Cursor, VS Code, Windsurf</b></summary>

<br>

```bash
npx @pebbly/aseprite-ai-artist install codex      # ~/.codex/config.toml
npx @pebbly/aseprite-ai-artist install gemini     # ~/.gemini/settings.json
npx @pebbly/aseprite-ai-artist install cursor     # ~/.cursor/mcp.json
npx @pebbly/aseprite-ai-artist install --all      # all of the above
```

Your existing config is backed up first. `--dry-run` shows the change without
making it; `--project` writes into the repo instead of your home directory.

</details>

Restart your agent afterwards so it picks up the new server.

### 3. Check it

```bash
npx @pebbly/aseprite-ai-artist doctor
```

Ticks all the way down? You're ready. If something's missing, it tells you
which half — no guessing. More in [docs/INSTALL.md](docs/INSTALL.md).

## 💻 macOS, Linux and Windows

It runs the same on all three. CI builds and tests every commit on
`macos-latest`, `ubuntu-latest` and `windows-latest`.

| | macOS | Linux | Windows |
|---|:---:|:---:|:---:|
| MCP server, bridge, installer, `doctor` | ✅ | ✅ | ✅ |
| Aseprite extension | ✅ | ✅ | ✅ |
| Where `install-extension` looks for Aseprite | `~/Library/Application Support/Aseprite` | `$XDG_CONFIG_HOME/aseprite` (default `~/.config/aseprite`), then `~/.aseprite` | `%APPDATA%\Aseprite` |

Steam, itch.io and self-built Aseprite all use the same config folder as their
platform's standard build. If yours lives somewhere else, point the installer
at it: set `ASEPRITE_USER_FOLDER`, or pass `--dir <path>`.

On Windows the bridge starts as a hidden background process, so no console
window pops up while you draw. Both sockets bind `127.0.0.1` only, so Windows
Firewall has nothing to ask about.

## 🎨 The skills, and how to use them

Skills are the workflows the agent follows — the order an experienced pixel
artist would work in, written down. They're served to every client under the
same names:

| Client | How you call a skill |
|---|---|
| Claude Code, omp | slash command: `/aseprite:draw` |
| Codex, Gemini, Cursor, VS Code, Windsurf | MCP prompt `aseprite:draw`, or just ask — the server's instructions point the agent at the right one |
| Anything else | read `skill://draw` as a resource |

### 🎬 Start here: `aseprite:studio`, the director

**If you remember one skill, make it this one.** `studio` is the orchestrator for
everything else. Hand it any request — big or small — and it:

1. checks Aseprite is attached and reads what's already open;
2. works out what you actually want and writes down the chain of skills it needs;
3. asks you **once**, and only if the request is genuinely open-ended;
4. runs each stage, handing parts to the specialists where your client has them;
5. **looks** at the result after every stage that changed pixels;
6. finishes with a review, fixes what it finds, and reports what exists now.

```
/aseprite:studio an animated knight for my Godot game, 32×32, idle and walk
```

Behind the scenes that becomes `brief → new → palette → draw → shade → rig →
animate → review → export` — and you didn't have to know any of those names.

### The rest of the toolbox

Reach for these directly when you know exactly which step you want.

| Skill | Use it when… | Try |
|---|---|---|
| 📝 **`brief`** | the idea is still vague. Settles size, palette, view, light and outline in one message before a pixel is drawn. | `/aseprite:brief a cosy tavern keeper` |
| 📄 **`new`** | you're starting fresh. Sets up canvas, colour mode, palette and layers so nothing fights you later. | `/aseprite:new 64×64 sprite, PICO-8` |
| 🎨 **`palette`** | colour is the question — a retro look, hue-shifted ramps, or cleaning up ninety near-identical browns. | `/aseprite:palette give this a Game Boy look` |
| ✏️ **`draw`** | it's time to make the thing. Silhouette first, then materials, shading, outline, verify. | `/aseprite:draw a fox curled up asleep` |
| 🌗 **`shade`** | the art looks flat. Adds light and shadow one step at a time, with hue shifting. | `/aseprite:shade light from the upper left` |
| 🦴 **`rig`** | a character is about to move. Splits it onto head, torso, arm and leg layers. | `/aseprite:rig split the knight for animation` |
| 🏃 **`animate`** | something needs to move. Key poses first, timing that breathes, tagged cycles. | `/aseprite:animate 8-frame walk cycle` |
| 🧱 **`tileset`** | you need terrain or level art — seamless tiles, autotiles, Tiled/Godot export. | `/aseprite:tileset grass-to-dirt autotile, 16px` |
| 🔍 **`review`** | you want the truth. Mechanical checks plus eyes-on checks, reported with evidence. | `/aseprite:review why does this look off?` |
| 🩹 **`fix`** | something exists and needs changing without wrecking what's already right. | `/aseprite:fix make him look more menacing` |
| 📦 **`export`** | it's done and has to leave Aseprite — spritesheets with JSON atlases, GIFs, scaled PNGs. | `/aseprite:export spritesheet for Godot` |

### 🧑‍🎨 The specialists

In Claude Code and omp, `studio` can hand a stage to one of four subagents.
Each reads the same rulebook, so the result is the same whether it or the main
agent does the work — they just keep the main conversation lighter.

| Agent | What it owns |
|---|---|
| **palette-smith** | proposes a palette and explains why it fits |
| **rig-builder** | plans and builds the layer rig |
| **animation-director** | key poses, timing and tags before a frame is drawn |
| **pixel-critic** | a scored, located critique — read-only, never touches your sprite |

## 🏆 Which model should hold the brush?

Not a benchmark — an honest log of what drew the art on this page. Models we
haven't tried are marked untested rather than guessed at.

| Model | What it drew | How it went |
|---|---|---|
| **Claude Opus 5.5** | the rainy bookshop up top | Best so far. 500×400, 72 frames, 20 layers in one session — plus a few rounds of user notes (café table, hoodie, an arm rig redone with fixed-length IK, lightning, raccoon). |
| **Claude Fable 5.1** | the robot at the easel, below | Very strong. One session, no review passes needed. |
| **Codex CLI** `gpt-5.6-terra`, high reasoning | the harbour below, and the mascot | Strong, but it took five rounds of critique. |
| **Claude Opus 5** | the server, the rulebook, every review pass | The planner and the critic. Its own drawing attempt got scrapped. |
| Gemini 3 Pro, Sonnet 5, Cursor, others | — | Untested. Run one and send us the sprite! |

<div align="center">
<img src="docs/media/mascot.png" alt="The mascot" width="96"><br>
<sub><i>our mascot — Codex, from the brief and the rulebook alone</i></sub>
</div>

**Method mattered more than the model.** Every good result came the same way:

- **Generate, don't hand-place.** Write a small program that emits every frame,
  then push it. Placing pixels one call at a time by eye is where weak attempts
  died.
- **Look at frames full-size, one at a time.** A filmstrip is a trap — at that
  size you see what you already expect to be there.
- **Turn reasoning up** before you blame the model. A 32×32 grid is a spatial
  problem.

## 💡 Why this one

🌍 **It works everywhere, not just in Claude Code.** Most Aseprite MCP projects
keep their craft knowledge inside a Claude Code plugin, so Codex and Cursor get
raw tools and none of the discipline. Here the rules and skills are served over
MCP, so every client reads the same source of truth.

🪶 **Eighteen tools, not ninety.** Every tool schema sits in the model's context
on every turn, drawing or not. Grouping by noun with an `op` enum covers the same
ground at a sixth of the cost — and makes batching the default, so one `draw`
call is one undo step for you.

👀 **It has to look at its own work.** `look` gives the agent an upscaled
preview, a one-glyph-per-pixel text grid, a filmstrip and a frame-to-frame diff.
`validate` then checks the sprite mechanically before anything is called done.

🛡️ **It can't quietly wreck your file.** With Aseprite detached, every tool
refuses immediately instead of timing out — because an agent that "recovers" by
editing the `.aseprite` on disk makes changes you never see, and your next save
overwrites them.

There's [a whole page](docs/RESEARCH.md) on the other projects in this space, and
where they're still better.

## 🔧 Under the hood

**Eighteen tools**, grouped by noun — `preflight` · `sprite_info` ·
`sprite_manage` · `look` · `read_pixels` · `draw` · `select` · `transform` ·
`recolor` · `layer` · `frame` · `tag` · `cel` · `palette` · `validate` ·
`reference` · `export` · `tileset`, plus `run_lua` as an escape hatch, off by
default. Full reference: [docs/TOOLS.md](docs/TOOLS.md).

**A rulebook** in [`rules/`](rules/) — palette discipline, hue-shifted shading,
silhouette, outlines, animation timing, layer rigging, the review checklist.
Skills point at rules instead of restating them, so each rule has exactly one
place to be wrong.

```
your agent  ──stdio/MCP──▶  server  ──ws:9932──▶  bridge  ──ws:9931──▶  Aseprite
```

Aseprite's Lua WebSocket can only be a client, so a small bridge holds the
listening socket. It runs as its own process: restarting the MCP server — which
agent hosts do freely — doesn't drop your Aseprite connection, and a second
agent window can attach without stealing the first one's replies. Details in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Both ports bind `127.0.0.1` only. `run_lua` is arbitrary code execution inside
the app holding your unsaved work, so it stays off unless you turn it on — full
threat model in [SECURITY.md](SECURITY.md).

## 🖼️ More, drawn the same way

<div align="center">

<img src="docs/media/hero2.gif" alt="A pixel robot at an easel paints a landscape stroke by stroke under a pendant lamp" width="768">

<sub>🤖 192×96, 54 frames, one palette. The paint appears under the brush, every
frame. Then the robot wipes the canvas clean and starts again — which is why the
loop has no seam.</sub>

<br><br>

<img src="docs/media/harbour.gif" alt="A pixel-art harbour at night: a lighthouse beam sweeps over the water, windows flicker, smoke drifts from a chimney" width="768">

<sub>⚓ 256×144, 28 frames, ten layers. Only six of them move — beam, windows,
water, smoke, boat, stars — each on its own cycle length, which keeps an ambient
loop from feeling mechanical.</sub>

</div>

### Who drew what

| Art | Model |
|---|---|
| ☔ Rainy bookshop (hero, `docs/media/rainy-bookshop.gif`) | Claude Opus 5.5 |
| 🤖 Robot at the easel (`docs/media/hero2.gif`) | Claude Fable 5.1 |
| ⚓ Night harbour (`docs/media/harbour.gif`) | Codex CLI, `gpt-5.6-terra`, high reasoning |
| 🐾 Mascot (`docs/media/mascot.png`) | Codex CLI, `gpt-5.6-terra`, high reasoning |

## 🛠️ Development

```bash
npm install && npm run build
npm test                 # TypeScript
npm run test:pure        # Lua that needs no editor — what CI runs
npm run test:extension   # the real handlers, headless, against a real sprite
```

`test:extension` needs Aseprite installed, so CI can't run it. Before changing
anything, read [AGENTS.md](AGENTS.md) — it lists the rules that aren't
negotiable and the Lua gotchas that have already cost someone a day.

## 📜 Licence

MIT — see [LICENSE](LICENSE). Aseprite is a trademark of Igara Studio S.A.; this
project isn't affiliated with them.

<div align="center"><sub>Made with ☕ and a lot of Ctrl+Z.</sub></div>
