// lint.ts — pure, table-driven house-style + safety checks. No DOM, no React, so the
// live editor and the pre-export gate share one implementation and it's trivially tested.
//
// These rules mirror what generate_csvs.py silently enforces (emoji stripping,
// @PsiikiAN normalization) PLUS the serializer invariants that prevent silent
// corruption of the parser (a caption line starting with `#` or `## Post` truncates
// or spawns phantom posts). We surface all of it at compose time so nothing is a surprise.

import { CHAR_LIMITS, CANONICAL_HANDLE, MAX_X_COMMENTS } from './contract';
import type { Post } from './types';

export type LintCode =
  | 'emoji'
  | 'markdown_emphasis'
  | 'wrong_handle'
  | 'boundary_token'
  | 'invalid_link'
  | 'too_many_comments'
  | 'over_char_limit';

export type Severity = 'error' | 'warn';

export type LintField =
  | 'title'
  | 'igFbThreads'
  | 'link'
  | 'linkedin'
  | 'x_main'
  | `x_comment_${number}`
  | 'bluesky';

export interface LintViolation {
  code: LintCode;
  severity: Severity;
  field: LintField;
  message: string;
}

// Grapheme-accurate length. X/Bluesky count codepoints, not UTF-16 units
// ("👍".length === 2). Emojis are banned anyway, but accented chars matter.
const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

export function graphemeLength(s: string): number {
  if (!s) return 0;
  if (segmenter) return [...segmenter.segment(s)].length;
  return [...s].length;
}

const EMOJI = /\p{Extended_Pictographic}/u;
const DOUBLE_STAR = /\*\*/;
const STAR_EMPHASIS = /\*[^*\s][^*]*\*/;
const UNDERSCORE_EMPHASIS = /(^|\s)_[^_\s][^_]*_(?=\s|[.,!?]|$)/;
const HANDLE = /@(\w+)/g;
const LEADING_HASH = /^#{1,6}\s/m; // a markdown heading line -> truncates the parser section
const POST_HEADER_LINE = /^##\s*Post\s+\d+/im; // spawns a PHANTOM post -> shifts all downstream

/** Content-quality + safety checks for a single text field. */
export function checkText(text: string, field: LintField): LintViolation[] {
  const v: LintViolation[] = [];
  if (EMOJI.test(text)) {
    v.push({ code: 'emoji', severity: 'error', field, message: 'Remove emojis — they get stripped and can break formatting.' });
  }
  if (DOUBLE_STAR.test(text) || STAR_EMPHASIS.test(text) || UNDERSCORE_EMPHASIS.test(text)) {
    v.push({ code: 'markdown_emphasis', severity: 'error', field, message: 'Remove markdown emphasis (**bold**, *italic*, _italic_) — it renders literally.' });
  }
  for (const m of text.matchAll(HANDLE)) {
    const handle = m[1];
    if (/^psi/i.test(handle) && handle !== 'PsiAN') {
      v.push({ code: 'wrong_handle', severity: 'error', field, message: `"@${handle}" looks like a typo — use ${CANONICAL_HANDLE}.` });
    }
  }
  if (POST_HEADER_LINE.test(text)) {
    v.push({ code: 'boundary_token', severity: 'error', field, message: 'A line starting with "## Post" would create a phantom post. Reword it.' });
  } else if (LEADING_HASH.test(text)) {
    v.push({ code: 'boundary_token', severity: 'error', field, message: 'A line starting with "#" acts as a heading and truncates the post. Remove the leading #.' });
  }
  return v;
}

function checkLimit(text: string, field: LintField, limit: number, severity: Severity, label: string): LintViolation[] {
  const n = graphemeLength(text);
  if (n > limit) {
    return [{ code: 'over_char_limit', severity, field, message: `${label}: ${n}/${limit} characters — trim ${n - limit}.` }];
  }
  return [];
}

/** All violations across a post, in field order. */
export function lintPost(post: Post): LintViolation[] {
  const c = post.content;
  const out: LintViolation[] = [];

  // Instagram / Facebook / Threads — one caption feeds three platforms.
  out.push(...checkText(c.igFbThreads.body, 'igFbThreads'));
  out.push(...checkLimit(c.igFbThreads.body, 'igFbThreads', CHAR_LIMITS.ig, 'error', 'Instagram'));
  out.push(...checkLimit(c.igFbThreads.body, 'igFbThreads', CHAR_LIMITS.threads, 'warn', 'Threads (shares this caption)'));
  if (c.igFbThreads.link && /\s/.test(c.igFbThreads.link)) {
    out.push({ code: 'invalid_link', severity: 'error', field: 'link', message: 'Link must be a single URL with no spaces.' });
  }

  out.push(...checkText(c.linkedin.body, 'linkedin'));
  out.push(...checkLimit(c.linkedin.body, 'linkedin', CHAR_LIMITS.linkedin, 'error', 'LinkedIn'));

  out.push(...checkText(c.x.main, 'x_main'));
  out.push(...checkLimit(c.x.main, 'x_main', CHAR_LIMITS.x, 'error', 'X main post'));
  c.x.comments.forEach((cm, i) => {
    const field = `x_comment_${i + 1}` as LintField;
    out.push(...checkText(cm, field));
    out.push(...checkLimit(cm, field, CHAR_LIMITS.x, 'error', `X reply ${i + 1}`));
  });
  if (c.x.comments.length > MAX_X_COMMENTS) {
    out.push({ code: 'too_many_comments', severity: 'error', field: 'x_main', message: `Only the first ${MAX_X_COMMENTS} replies are used — remove ${c.x.comments.length - MAX_X_COMMENTS}.` });
  }

  out.push(...checkText(c.bluesky.body, 'bluesky'));
  out.push(...checkLimit(c.bluesky.body, 'bluesky', CHAR_LIMITS.bluesky, 'error', 'Bluesky'));

  return out;
}

export const errorsOnly = (v: LintViolation[]) => v.filter((x) => x.severity === 'error');
