// contract.ts — the single source of truth for values that MUST match the Python
// pipeline in ../generate_csvs.py (parser parse_posts, lines 78-216).
//
// If you change a section heading or a rule here, you are changing the wire format
// the parser depends on. The round-trip test (serialize.roundtrip.test.ts) shells
// out to the real generate_csvs.py and will fail loudly if these drift.

/** Platforms PsiAN publishes to. */
export type Platform = 'ig' | 'fb' | 'threads' | 'linkedin' | 'x' | 'bluesky';

/**
 * Per-platform character limits. `satisfies` keeps this map honest — every Platform
 * must have a limit and no extra keys are allowed.
 */
export const CHAR_LIMITS = {
  ig: 2200,
  fb: 63206,
  threads: 500,
  linkedin: 3000,
  x: 280,
  bluesky: 300,
} satisfies Record<Platform, number>;

/**
 * Section headings emitted into the markdown block. These are BYTE-IDENTICAL to the
 * string literals passed to _extract_section() in generate_csvs.py (lines 87-90).
 * The parser uses re.escape on these, so the slashes are literal — do not add spaces.
 */
export const SECTION_HEADINGS = {
  igFbThreads: 'Instagram/Facebook/Threads Version',
  linkedin: 'LinkedIn Version',
  x: 'X/Twitter Thread Version',
  bluesky: 'Bluesky Version',
} as const;

/** New posts continue after the last batch (Batch 2 ends at Post 80). */
export const NUMBERING_BASE = 81;

/** Max X/Twitter thread replies the parser reads (range(1, 11), line 107). */
export const MAX_X_COMMENTS = 10;

/** The one canonical handle. The generator normalizes @PsiikiAN -> @PsiAN (line 47). */
export const CANONICAL_HANDLE = '@PsiAN';

/** Which platforms each editable variant feeds (drives per-target char counters). */
export const VARIANT_TARGETS: Record<'igFbThreads' | 'linkedin' | 'x' | 'bluesky', Platform[]> = {
  igFbThreads: ['ig', 'fb', 'threads'],
  linkedin: ['linkedin'],
  x: ['x'],
  bluesky: ['bluesky'],
};
