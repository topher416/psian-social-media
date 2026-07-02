// roundtrip.test.ts — THE authoritative quality gate for the serializer contract.
// It runs the REAL ../generate_csvs.py (copied into a temp dir so BASE_DIR resolves
// there and the repo isn't polluted) over serialized fixtures, then asserts on the
// generated CSVs. A silent drop, phantom post, comment-gap, or cross-platform
// substitution all change the CSV row count / content and fail here.

import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, copyFileSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serializeAll } from './serialize';
import { asPostNumber, emptyContent, type Post } from './types';

const here = dirname(fileURLToPath(import.meta.url));
const GENERATOR = resolve(here, '../../generate_csvs.py');

function makePost(n: number, over: Partial<Post['content']>, title = `Post ${n}`): Post {
  return {
    status: 'approved',
    postNumber: asPostNumber(n),
    title,
    author: 'cassie',
    needsImage: true,
    createdAt: '',
    updatedAt: '',
    content: { ...emptyContent(), ...over },
  };
}

// Fixtures exercise: (81) full happy path with a link; (82) multi-line caption whose
// newlines the generator collapses; (83) an X thread with 10 comments; (84) LinkedIn-only
// (other sections omitted) — must NOT drop the post.
const fixtures: Post[] = [
  makePost(81, {
    igFbThreads: { body: 'SENTINELIG81 access to depth therapy.', link: 'https://psian.org/81' },
    linkedin: { body: 'SENTINELLI81 professional take.' },
    x: { main: 'SENTINELX81 main tweet.', comments: ['SENTINELC181 reply one.', 'reply two.'] },
    bluesky: { body: 'SENTINELBS81 short version.' },
  }),
  makePost(82, {
    igFbThreads: { body: 'SENTINELIG82 first paragraph.\n\nSecond paragraph.\n\n#DepthTherapy #PsiAN', link: null },
  }),
  makePost(83, {
    x: { main: 'SENTINELX83 opener.', comments: Array.from({ length: 10 }, (_, i) => `reply ${i + 1}`) },
  }),
  makePost(84, {
    linkedin: { body: 'SENTINELLI84 linkedin only.' },
  }),
];

const csvNames = ['instagram', 'facebook', 'linkedin', 'twitter_threads_bluesky', 'bluesky'];
let csvs: Record<string, string> = {};
let pythonAvailable = true;

beforeAll(() => {
  try {
    execFileSync('python3', ['--version'], { stdio: 'ignore' });
  } catch {
    pythonAvailable = false;
    return;
  }
  const dir = mkdtempSync(join(tmpdir(), 'psian-rt-'));
  copyFileSync(GENERATOR, join(dir, 'generate_csvs.py'));
  writeFileSync(join(dir, 'rt.md'), serializeAll(fixtures));
  execFileSync('python3', ['generate_csvs.py', '--input', 'rt.md', '--start', '2026-05-11', '--prefix', 'rt_'], {
    cwd: dir,
  });
  csvs = Object.fromEntries(csvNames.map((n) => [n, readFileSync(join(dir, `rt_${n}.csv`), 'utf8')]));
});

const rowCount = (csv: string) => csv.trim().split('\n').filter(Boolean).length - 1; // minus header

describe('round-trip through the real generate_csvs.py', () => {
  it('has python3 and the generator available', () => {
    expect(pythonAvailable, 'python3 must be installed to run the round-trip gate').toBe(true);
    expect(existsSync(GENERATOR)).toBe(true);
  });

  it('every CSV has exactly one row per post (no drops, no phantom posts)', () => {
    for (const name of csvNames) expect(rowCount(csvs[name]), name).toBe(fixtures.length);
  });

  it('preserves post↔image coupling in row order', () => {
    for (const name of csvNames) {
      const rows = csvs[name].trim().split('\n').slice(1);
      fixtures.forEach((p, i) => {
        expect(rows[i], `${name} row ${i}`).toContain(`images/${p.postNumber}.png`);
      });
    }
  });

  it('routes each platform its own content (no cross-platform substitution)', () => {
    expect(csvs.instagram).toContain('SENTINELIG81');
    expect(csvs.linkedin).toContain('SENTINELLI81');
    expect(csvs.twitter_threads_bluesky).toContain('SENTINELX81');
    expect(csvs.twitter_threads_bluesky).toContain('SENTINELC181'); // comment survived
    expect(csvs.bluesky).toContain('SENTINELBS81'); // native Bluesky (post-patch)
  });

  it('appends the link to the IG caption and strips the **Link** marker', () => {
    expect(csvs.instagram).toContain('https://psian.org/81');
    expect(csvs.instagram).not.toContain('**Link**');
  });

  it('leaves no emojis, markdown, mistyped handle, or literal newlines in any cell', () => {
    for (const name of csvNames) {
      expect(csvs[name], name).not.toContain('**');
      expect(/@Psiiki/i.test(csvs[name]), name).toBe(false);
    }
  });

  it('carries all 10 X replies for the max-comment post', () => {
    expect(csvs.twitter_threads_bluesky).toContain('reply 10');
  });

  it('keeps the LinkedIn-only post (empty sections omitted, not dropped)', () => {
    expect(csvs.linkedin).toContain('SENTINELLI84');
    expect(rowCount(csvs.instagram)).toBe(fixtures.length); // still present via fallthrough
  });
});
