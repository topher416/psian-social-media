# Cassie's PsiAN Social Studio

A small, friendly web app for drafting PsiAN social posts that feed the existing Python
publishing pipeline (`../generate_csvs.py` → CSVs → Vista Social). Cassie composes; Topher
reviews and publishes.

Plan: `../../topher416/docs/plans/2026-07-01-feat-cassie-psian-social-app-plan.md`

## Stack
Vite + React + TypeScript. No backend — drafts live in the browser's localStorage, with a
JSON backup/restore button. (See the plan's Persistence Decision for the deferred Supabase path.)

## Develop
```bash
npm install
npm run dev            # http://localhost:5173  (passphrase: "psian" unless VITE_APP_PASSPHRASE set)
npm test               # unit + round-trip tests (needs python3 for the round-trip)
npm run build          # regenerates the Voice bank, type-checks, and builds
```

## The important part: the serializer contract
`src/serialize.ts` emits the EXACT markdown block `../generate_csvs.py` parses. If it drifts,
posts get silently dropped or corrupted. Two tests guard it:

- **`src/serialize.test.ts`** — fast golden/unit tests (pure TS).
- **`src/roundtrip.test.ts`** — copies the real `../generate_csvs.py` into a temp dir, runs the
  serialized fixtures through it, and asserts on the generated CSVs (counts, image coupling,
  per-platform content, contiguous X replies, no emoji/markdown residue).

`src/contract.ts` holds the values that must match the Python (section headings, char limits,
`NUMBERING_BASE = 81`). Do **not** reimplement the parser in TS — that would defeat the round-trip.

## Handoff to the pipeline
"Send to Topher" / "Export all ready posts" produces a `converted_posts.md`-format block. Save it
as e.g. `../converted_posts_batch3.md`, then:
```bash
cd .. && python3 generate_csvs.py --input converted_posts_batch3.md --start <a-Monday> --prefix batch3_
```

## Content sources
- `src/data/examples.json` — generated at build from `../converted_posts*.md` (the Voice bank).
- `src/data/learn.ts` — onboarding copy. ⚠️ DRAFT — replace with PsiAN-approved language.

## Deploy (Vercel)
Root directory = `app/`. Build `npm run build`, output `dist/`. Set `VITE_APP_PASSPHRASE`.
Note: `build:examples` needs the `../converted_posts*.md` files at build time; if deploying
`app/` alone, commit `src/data/examples.json` (the build keeps a committed copy when sources
are absent).
