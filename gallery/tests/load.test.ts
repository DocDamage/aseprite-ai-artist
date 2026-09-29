import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { stringify } from 'yaml';
import { compareVersions, inspectGallery, type LoadResult } from '../src/load.ts';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
// u32 size, then the 0xA5E0 magic little-endian.
const ASEPRITE = Buffer.from([0x80, 0, 0, 0, 0xe0, 0xa5, 0, 0]);

const PROMPT = {
  title: 'Knight',
  summary: 'test',
  revision: 2,
  setup: { canvas: { width: 32, height: 32, colorMode: 'rgb' } },
  steps: [
    { title: 'Still', text: 'Draw a knight.' },
    { title: 'Slash', text: 'Animate a slash.\n4 frames.' },
  ],
  criteria: [
    { id: 'a', step: 1, text: 'a' },
    { id: 'b', step: 2, text: 'b' },
  ],
};

function generation(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Run',
    date: '2026-09-29',
    author: { name: 'Test', github: 'tester' },
    plugin: '0.3.2',
    harness: 'omp',
    models: ['model-x'],
    steps: [{ text: 'Draw a knight.' }, { text: 'Animate a slash.\n4 frames.\n' }],
    files: [
      { path: 'cover.png', role: 'cover' },
      { path: 'knight.aseprite', role: 'source' },
    ],
    benchmark: {
      prompt: 'knight',
      revision: 2,
      results: [
        { criterion: 'a', pass: true },
        { criterion: 'b', pass: false },
      ],
    },
    ...overrides,
  };
}

function makeRepo(generations: Record<string, Record<string, unknown>>, extraFiles: Record<string, Record<string, Buffer>> = {}) {
  const repo = mkdtempSync(join(tmpdir(), 'gallery-'));
  writeFileSync(join(repo, 'CHANGELOG.md'), '## [Unreleased]\n\n## [0.3.2] — 2026-09-29\n\n## [0.3.1] — 2026-09-28\n');
  mkdirSync(join(repo, 'gallery'), { recursive: true });
  writeFileSync(join(repo, 'gallery', 'MAINTAINERS'), '# maintainers\nTester\n');
  const root = join(repo, 'gallery');
  mkdirSync(join(root, 'prompts', 'knight'), { recursive: true });
  writeFileSync(join(root, 'prompts', 'knight', 'prompt.yaml'), stringify(PROMPT));
  for (const [id, data] of Object.entries(generations)) {
    const dir = join(root, 'generations', id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'generation.yaml'), stringify(data));
    writeFileSync(join(dir, 'cover.png'), PNG);
    writeFileSync(join(dir, 'knight.aseprite'), ASEPRITE);
    for (const [name, bytes] of Object.entries(extraFiles[id] ?? {})) writeFileSync(join(dir, name), bytes);
  }
  return { root, cleanup: () => rmSync(repo, { recursive: true, force: true }) };
}

function errorsOf(result: LoadResult) {
  return result.problems.filter((problem) => problem.level === 'error').map((problem) => problem.message);
}

test('a valid run is scored and lands in its model × version cell', () => {
  const { root, cleanup } = makeRepo({
    '2026-09-29-a': generation(),
    '2026-09-29-b': generation({ benchmark: { prompt: 'knight', revision: 2, results: [{ criterion: 'a', pass: true }, { criterion: 'b', pass: true }] } }),
    '2026-09-29-c': generation({ plugin: '0.3.1', models: ['model-y'] }),
  });
  try {
    const result = inspectGallery(root);
    assert.deepEqual(errorsOf(result), []);
    const [benchmark] = result.gallery.benchmarks;
    assert.deepEqual(benchmark!.versions, ['0.3.2', '0.3.1']);
    const cell = benchmark!.cells.find((c) => c.modelLabel === 'model-x' && c.plugin === '0.3.2')!;
    assert.equal(cell.runs.length, 2);
    assert.deepEqual(cell.best, { passed: 2, total: 2 }, 'the best run leads the cell');
    assert.equal(cell.runs[0]!.id, '2026-09-29-b');
    assert.deepEqual(benchmark!.models, ['model-x', 'model-y'], 'models rank by best score');
  } finally {
    cleanup();
  }
});

test('a benchmark run must send the prompt verbatim', () => {
  const { root, cleanup } = makeRepo({
    '2026-09-29-a': generation({ steps: [{ text: 'Draw a cool knight.' }, { text: 'Animate a slash.\n4 frames.' }] }),
  });
  try {
    const errors = errorsOf(inspectGallery(root));
    assert.equal(errors.length, 1);
    assert.match(errors[0]!, /steps\.0\.text differs/);
  } finally {
    cleanup();
  }
});

test('every criterion needs an answer, and only known ones', () => {
  const { root, cleanup } = makeRepo({
    '2026-09-29-a': generation({ benchmark: { prompt: 'knight', revision: 2, results: [{ criterion: 'a', pass: true }, { criterion: 'zzz', pass: true }] } }),
  });
  try {
    const errors = errorsOf(inspectGallery(root));
    assert.ok(errors.some((e) => /unknown criterion "zzz"/.test(e)));
    assert.ok(errors.some((e) => /unanswered criteria: b/.test(e)));
  } finally {
    cleanup();
  }
});

test('an older prompt revision is kept but not ranked', () => {
  const { root, cleanup } = makeRepo({
    '2026-09-29-a': generation({ steps: [{ text: 'old text' }], benchmark: { prompt: 'knight', revision: 1, results: [{ criterion: 'old', pass: true }] } }),
  });
  try {
    const result = inspectGallery(root);
    assert.deepEqual(errorsOf(result), []);
    assert.equal(result.gallery.generations.length, 1);
    assert.equal(result.gallery.benchmarks[0]!.cells.length, 0);
    assert.equal(result.gallery.benchmarks[0]!.outdatedRuns.length, 1);
  } finally {
    cleanup();
  }
});

test('unreleased plugin versions, date/folder drift and a future revision are rejected', () => {
  const { root, cleanup } = makeRepo({
    '2026-09-28-a': generation({ plugin: '9.9.9' }),
    '2026-09-29-b': generation({ benchmark: { prompt: 'knight', revision: 3, results: [{ criterion: 'a', pass: true }] } }),
  });
  try {
    const errors = errorsOf(inspectGallery(root));
    assert.ok(errors.some((e) => /9\.9\.9 is not a released version/.test(e)));
    assert.ok(errors.some((e) => /does not match the folder prefix/.test(e)));
    assert.ok(errors.some((e) => /revision 3 does not exist/.test(e)));
  } finally {
    cleanup();
  }
});

test('stray files, renamed files and a missing .aseprite source are rejected', () => {
  const { root, cleanup } = makeRepo(
    {
      '2026-09-29-a': generation(),
      '2026-09-29-b': generation({ files: [{ path: 'cover.png', role: 'cover' }, { path: 'fake.gif', role: 'animation' }], benchmark: undefined }),
    },
    { '2026-09-29-a': { 'notes.txt': Buffer.from('x') }, '2026-09-29-b': { 'fake.gif': PNG } },
  );
  try {
    const errors = errorsOf(inspectGallery(root));
    assert.ok(errors.some((e) => /not listed in generation\.yaml/.test(e)));
    assert.ok(errors.some((e) => /at least one \.aseprite file/.test(e)));
  } finally {
    cleanup();
  }
});

test('a GIF that is really a PNG is caught by its magic bytes', () => {
  const { root, cleanup } = makeRepo(
    { '2026-09-29-a': generation({ files: [{ path: 'cover.png', role: 'cover' }, { path: 'knight.aseprite', role: 'source' }, { path: 'anim.gif', role: 'animation' }] }) },
    { '2026-09-29-a': { 'anim.gif': PNG } },
  );
  try {
    assert.deepEqual(errorsOf(inspectGallery(root)), ['not a GIF file']);
  } finally {
    cleanup();
  }
});

test('several models require each step to name its model', () => {
  const { root, cleanup } = makeRepo({
    '2026-09-29-a': generation({ models: ['model-x', 'model-y'] }),
    '2026-09-29-b': generation({ models: ['model-x', 'model-y'], steps: [{ text: 'Draw a knight.', model: 'model-x' }, { text: 'Animate a slash.\n4 frames.', model: 'model-y' }] }),
  });
  try {
    const result = inspectGallery(root);
    const errors = errorsOf(result);
    assert.equal(errors.length, 2, errors.join('\n'));
    assert.ok(errors.every((e) => /must name the one that ran it/.test(e)));
    assert.equal(result.gallery.generations[0]!.modelLabel, 'model-x + model-y');
  } finally {
    cleanup();
  }
});

test('the same models in any order share one benchmark row', () => {
  const { root, cleanup } = makeRepo({
    '2026-09-29-a': generation({ models: ['model-y', 'model-x'], steps: [{ text: 'Draw a knight.', model: 'model-y' }, { text: 'Animate a slash.\n4 frames.', model: 'model-x' }] }),
    '2026-09-29-b': generation({ models: ['model-x', ' model-y '], steps: [{ text: 'Draw a knight.', model: 'model-x' }, { text: 'Animate a slash.\n4 frames.', model: 'model-y' }] }),
  });
  try {
    const result = inspectGallery(root);
    assert.deepEqual(errorsOf(result), []);
    const cells = result.gallery.benchmarks[0]!.cells;
    assert.equal(cells.length, 1);
    assert.equal(cells[0]!.modelLabel, 'model-x + model-y');
    assert.equal(cells[0]!.runs.length, 2);
  } finally {
    cleanup();
  }
});

test('a run dated before its plugin version was released is rejected', () => {
  const { root, cleanup } = makeRepo({ '2026-09-27-a': generation({ date: '2026-09-27', plugin: '0.3.2' }) });
  try {
    assert.deepEqual(errorsOf(inspectGallery(root)), ['dated 2026-09-27, before plugin 0.3.2 was released on 2026-09-29']);
  } finally {
    cleanup();
  }
});

test('a symlinked file is rejected instead of published', () => {
  const { root, cleanup } = makeRepo({
    '2026-09-29-a': generation({ files: [{ path: 'cover.png', role: 'cover' }, { path: 'knight.aseprite', role: 'source' }, { path: 'leak.json', role: 'other' }] }),
  });
  try {
    symlinkSync(join(root, '..', 'CHANGELOG.md'), join(root, 'generations', '2026-09-29-a', 'leak.json'));
    assert.deepEqual(errorsOf(inspectGallery(root)), ['is a symlink — commit the file itself']);
  } finally {
    cleanup();
  }
});

test('plugin versions order by semver precedence, prereleases included', () => {
  const versions = ['1.0.0-beta.2', '1.0.0', '1.0.0-beta.10', '0.9.0', '1.0.0-alpha', '1.0.0-beta'];
  assert.deepEqual([...versions].sort(compareVersions), ['0.9.0', '1.0.0-alpha', '1.0.0-beta', '1.0.0-beta.2', '1.0.0-beta.10', '1.0.0']);
});

test('the leaderboard takes each model at its best cell and ranks by it', () => {
  const { root, cleanup } = makeRepo({
    '2026-09-29-a': generation(),
    '2026-09-29-b': generation({ plugin: '0.3.1', benchmark: { prompt: 'knight', revision: 2, results: [{ criterion: 'a', pass: true }, { criterion: 'b', pass: true }] } }),
    '2026-09-29-c': generation({ models: ['model-y'], benchmark: { prompt: 'knight', revision: 2, results: [{ criterion: 'a', pass: false }, { criterion: 'b', pass: false }] } }),
  });
  try {
    const { leaderboard } = inspectGallery(root).gallery;
    assert.deepEqual(
      leaderboard.map((entry) => [entry.modelLabel, entry.score, entry.benchmarks, entry.runs]),
      [['model-x', 1, 1, 2], ['model-y', 0, 1, 1]],
    );
    assert.equal(leaderboard[0]!.best.knight!.plugin, '0.3.1', 'the older version held the better run');
  } finally {
    cleanup();
  }
});

test('a benchmark a model never ran counts against it in the leaderboard', () => {
  const { root, cleanup } = makeRepo({
    '2026-09-29-a': generation({ models: ['one-trick'], benchmark: { prompt: 'knight', revision: 2, results: [{ criterion: 'a', pass: true }, { criterion: 'b', pass: true }] } }),
    '2026-09-29-b': generation({ models: ['all-rounder'], benchmark: { prompt: 'knight', revision: 2, results: [{ criterion: 'a', pass: true }, { criterion: 'b', pass: false }] } }),
    '2026-09-29-c': generation({ models: ['all-rounder'], steps: [{ text: 'Draw a slime.' }], benchmark: { prompt: 'slime', revision: 1, results: [{ criterion: 's1', pass: true }, { criterion: 's2', pass: true }] } }),
  });
  try {
    mkdirSync(join(root, 'prompts', 'slime'), { recursive: true });
    writeFileSync(
      join(root, 'prompts', 'slime', 'prompt.yaml'),
      stringify({ ...PROMPT, title: 'Slime', revision: 1, steps: [{ title: 'Slime', text: 'Draw a slime.' }], criteria: [{ id: 's1', step: 1, text: 's1' }, { id: 's2', step: 1, text: 's2' }] }),
    );
    const result = inspectGallery(root);
    assert.deepEqual(result.problems.filter((p) => p.level === 'error'), []);
    assert.deepEqual(
      result.gallery.leaderboard.map((e) => [e.modelLabel, e.score, e.benchmarks]),
      [['all-rounder', 0.75, 2], ['one-trick', 0.5, 1]],
    );
  } finally {
    cleanup();
  }
});

test('a benchmark run from someone outside MAINTAINERS is refused; a free generation from them is fine', () => {
  const { root, cleanup } = makeRepo({
    '2026-09-29-a': generation({ author: { name: 'Stranger', github: 'stranger' } }),
    '2026-09-29-b': generation({ author: { name: 'Stranger', github: 'stranger' }, benchmark: undefined }),
    '2026-09-29-c': generation({ author: { name: 'No handle' } }),
  });
  try {
    const result = inspectGallery(root);
    const errors = errorsOf(result);
    assert.equal(errors.length, 2);
    assert.ok(errors.every((e) => /maintainers only/.test(e)));
    assert.deepEqual(result.gallery.generations.map((g) => g.id), ['2026-09-29-b']);
  } finally {
    cleanup();
  }
});
