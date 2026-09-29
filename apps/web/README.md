# apps/web — `@pebbly/web`

A SvelteKit site for [`@pebbly/aseprite-ai-artist`](https://github.com/with-pebbly/aseprite-ai-artist): a gallery of pieces made with the plugin, a benchmark that scores models on the same fixed prompts, and the contribution flow.

The whole site is prerendered to static HTML against `gallery/` at build time, and ships with `@sveltejs/adapter-vercel`.

## Develop

```sh
pnpm web:dev                                      # gallery/generations from the repo
GALLERY_ROOT=$TMPDIR/gallery-fixture/gallery pnpm --filter @pebbly/web run dev
```

## Build

```sh
pnpm --filter @pebbly/web run check               # svelte-kit sync && svelte-check
pnpm --filter @pebbly/web run lint:fsd           # FSD slice + layer boundaries
pnpm --filter @pebbly/web run build               # prerenders every page + file asset
```

## Layer map (Feature-Sliced Design)

[ADR-0007](../../docs/adr/0007-web-feature-sliced-design.md) is the why. Imports go down only, never between slices of one layer, and always through a slice's `index.ts`.

```
app       layout shell (`layout/`), global CSS and theme tokens (`styles/`), ambient types
pages     home, gallery, benchmarks, benchmark, generation, contribute, notFound: one slice per route
widgets   siteHeader, siteFooter, promptTimeline (used by two pages)
features  copyPrompt, filterGenerations
entities  generation (cards, score meter, gallery data), prompt, benchmark (ranking data)
shared    ui (shadcn + 8bitcn ports, pixel art), lib, config (PICO-8, Pebbly sprites), brand (icons)
```

A component used by one page is not a widget: it lives in that page's `ui/`. A slice gets promoted when a second slice needs it.

`src/routes/` is SvelteKit's router and holds no logic: a `+page.svelte` mounts a page slice with its `data`, and a `+page.server.ts` re-exports the slice's `load`.

## Aliases

| Alias | Path |
| --- | --- |
| `$app-shell` | `src/app` |
| `$pages` | `src/pages` |
| `$widgets` | `src/widgets` |
| `$features` | `src/features` |
| `$entities` | `src/entities` |
| `$shared` | `src/shared` |

`$app` is SvelteKit's own (`$app/paths`, `$app/state`), so the app layer is `$app-shell`.

## Documented exceptions

`pnpm run lint:fsd` runs `steiger` with its recommended rules and nothing turned off. The places FSD bends to SvelteKit:

- **`src/routes`** is the router SvelteKit requires, not a layer; steiger does not treat it as one. It stays thin (above).
- **`index.server.ts`** next to a slice's `index.ts` is the server-only barrel: the mappers that read `gallery/` from disk (`node:fs`). Steiger accepts it as the slice's public API. Only `*.server.ts` files may import it, so SvelteKit refuses to bundle it into the client. Each mapper lives in the slice's `api/*.server.ts`.
- **`@x`**: `entities/generation/@x/{benchmark,prompt}.ts` and `entities/prompt/@x/benchmark.ts` are FSD's cross-import API. The chain is one-way: benchmark → prompt → generation.
- **`shared/ui/8bit/index.ts`** is the one entry to the 8bitcn ports. Primitives that export `Root`/`Content`/`Trigger` are namespaces there: `Select.Root`, `Table.Row`, `Collapsible.Content`.
- **`src/app.html`** stays at the `src` root, where SvelteKit reads it.

## `GALLERY_ROOT`

The repo's `gallery/` is the default. Override with `GALLERY_ROOT=<path>` to point at a fixture (its parent must hold a `CHANGELOG.md` for plugin versions to validate). The path is resolved in `vite.config.ts` and baked into the server bundle through `define.__GALLERY_ROOT__` — it cannot be changed after the build starts.

## Where gallery files come from

A production build does not copy generation files into the deployment. Every
cover, GIF and `.aseprite` links to the file in the repository on GitHub
(`raw.githubusercontent.com/with-pebbly/aseprite-ai-artist/<commit>/gallery/generations/…`),
pinned to `VERCEL_GIT_COMMIT_SHA` (fallback `GALLERY_FILES_REF`, then `main`), so
the deployment stays small however large the gallery grows. Downloads fetch the
file and save it under its own name, because browsers ignore `download` on
cross-origin links. `vite dev` serves the local files through `/files/…`; for a
fixture build, whose files are not on GitHub, set `GALLERY_FILES=local`. This
needs the repository to stay public.

## UI source

Components are ports of [8bitcn/ui](https://www.8bitcn.com) (MIT) into Svelte 5. See `src/shared/ui/8bit/LICENSE` for the notice and each file's header comment for the source it was ported from. Dark/light is mode-watcher. The theme is "Pebble & Moss" in `src/app/styles/index.css`: primary `#83769c`, secondary `#008751`, accent `#ffa300`, dark background `#111016`, `radius: 0`.

Icons are pixelarticons via `unplugin-icons` + `@iconify-json/pixelarticons`, compiled into each Svelte component at build time. No runtime icon API call. Every icon is locked to the 24px grid in `src/app/styles/index.css` under the `[data-pixel-icon]` selector.

`components.json` still records `iconLibrary: "lucide"` (shadcn-svelte only supports the five bundled libraries). A future `pnpm dlx shadcn-svelte add` will therefore reintroduce `@lucide/svelte` imports; swap each to `~icons/pixelarticons/<name>` by hand.

## Deploy

Vercel, from `main` only — not on pull requests.
