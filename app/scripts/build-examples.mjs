// build-examples.mjs — parses the existing converted_posts*.md batches into a bundled
// JSON the Voice bank reads. Run at build (npm run build:examples). Resilient: if the
// source .md files aren't present (e.g. on a deploy host), it keeps any committed
// examples.json rather than clobbering it.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const outPath = resolve(here, '../src/data/examples.json');

const SOURCES = ['converted_posts.md', 'converted_posts_batch2.md'].map((f) => join(repo, f));

function extractSection(block, title) {
  const esc = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^###\\s+${esc}\\s*\\n([\\s\\S]*?)(?=^###\\s|^##\\s+Post\\s|^---\\s*$|$(?![\\s\\S]))`, 'm');
  const m = block.match(re);
  return m ? m[1].trim() : null;
}

function parse(md) {
  const headerRe = /^##\s+Post\s+(\d+):\s*(.*)$/gm;
  const heads = [...md.matchAll(headerRe)];
  const posts = [];
  heads.forEach((h, i) => {
    const start = h.index + h[0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index : md.length;
    const block = md.slice(start, end);
    const x = extractSection(block, 'X/Twitter Thread Version');
    let xMain = null;
    const xComments = [];
    if (x) {
      const main = x.match(/\*\*Main post[^*]*\*\*:\s*([\s\S]*?)(?=\n\*\*comment1|\n###\s|$(?![\s\S]))/);
      if (main) xMain = main[1].trim();
      for (let ci = 1; ci <= 10; ci++) {
        const cm = x.match(new RegExp(`\\*\\*comment${ci}\\*\\*:\\s*([\\s\\S]*?)(?=\\n\\*\\*comment${ci + 1}\\*\\*|\\n###\\s|$(?![\\s\\S]))`));
        if (!cm) break;
        xComments.push(cm[1].trim());
      }
    }
    posts.push({
      postNumber: Number(h[1]),
      title: h[2].trim(),
      igFbThreads: extractSection(block, 'Instagram/Facebook/Threads Version'),
      linkedin: extractSection(block, 'LinkedIn Version'),
      xMain,
      xComments,
      bluesky: extractSection(block, 'Bluesky Version'),
    });
  });
  return posts;
}

const found = SOURCES.filter(existsSync);
if (found.length === 0) {
  if (existsSync(outPath)) {
    console.log('[build-examples] no source .md found; keeping committed examples.json');
    process.exit(0);
  }
  console.warn('[build-examples] no source .md found and no examples.json; writing empty set');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, '[]\n');
  process.exit(0);
}

const all = found.flatMap((f) => parse(readFileSync(f, 'utf8')));
all.sort((a, b) => a.postNumber - b.postNumber);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(all, null, 2) + '\n');
console.log(`[build-examples] wrote ${all.length} examples from ${found.length} batch file(s)`);
