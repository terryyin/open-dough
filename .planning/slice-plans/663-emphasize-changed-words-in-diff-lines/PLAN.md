# Emphasize the changed words within a changed line

**Identity:** SEED-387#emphasize-changed-words-in-diff-lines
**Source:** [Emphasize the changed words within a changed line](../../seeds/SEED-387-deferred-syntax-styling-follow-ups.md#emphasize-changed-words-in-diff-lines)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

A developer reviewing a story sees which words changed inside each changed
block of a story-review file diff. The story section owns the scope, deferred
promises and key examples; this plan adds none.

Assumptions: the comparison runs in the browser over the hunk lines
`dashboard/src/unifiedDiff.ts` already parses; no server, contract or request
change; no new runtime dependency; Intent's source reading is unaffected.

## Existing solution and direction

PFE result: no word or token comparison exists in the product or its
installed dependencies (`git grep` for word-diff terms finds none; the root
`package.json` carries no diff library). The nearest owners to change are:

- `dashboard/src/unifiedDiff.ts` — parsed hunks and their lines; a changed
  block is a run of `removed` lines followed by `added` lines in one hunk.
- `dashboard/src/diffLineTokens.ts` — per-line syntax tokens for a diff,
  consumed by `StoryReviewDiffLines.tsx` and `StoryReviewContextGap.tsx`
  (`diffLineItems`).
- `dashboard/src/SourceTokens.tsx` — the shared token renderer Intent also
  uses; Intent's output must not change.

Direction: one pure module derives each changed line's emphasized ranges
(character offsets in the line's text) from its block, and the line renderer
composes those ranges with whatever it renders — plain text or token spans —
by splitting at range boundaries. The same ranges serve plain and styled
lines, so emphasis does not move when tokens arrive. Implement the simplest
word-stream comparison that meets the examples, bounded by block size; no
generic diff framework.
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
reserves “Highlight”: code and words say “emphasis”.

## Current decisions

- Emphasized runs render as `<del>` on removed lines and `<ins>` on added
  lines, never as `span`: `codeTokens` (`.story-review-line-code span`) is
  how existing specs observe “plain, no tokens yet”, and Playwright exposes
  `ins`/`del` as `insertion`/`deletion` roles.
- Appearance: underline in the line's `--ready` / `--problem` over a tint of
  the same colour no stronger than the premise below allows; no
  strikethrough; user-agent `ins`/`del` decoration replaced.
- Rewrite and size bounds are numeric constants chosen in slice 2 against its
  examples; they are not product settings.

## Proof ownership

| Promise (story scope / example) | Owning slice and observable proof |
| --- | --- |
| Changed block compared as one word stream; words; whitespace incl. re-indent; rewrap not emphasized; pure add/remove, unchanged and revealed context unemphasized | 1: new `dashboard/frontend-tests/review/story-review-diff-word-emphasis.spec.ts` on a plain (`.txt`) path — `const limit` example, three-line rewrap gaining a word, `run(a, b);` split, re-indent, a pure addition and a revealed context line, each read through `getByRole("insertion")` / `getByRole("deletion")` within the line |
| Text carries it; copy stays plain | 1: same spec — insertion/deletion roles on the emphasized words; `selectedText` across an emphasized block equals the plain markers and code |
| Rewrites stay line-level | 2: same spec — `return cached;` → `throw new Error("stale");` has no insertion or deletion |
| Responsive; large block line-level only | 2: same spec — a block of several hundred changed lines opens with no insertion or deletion in it and its first line visible within the default timeout, while a small block in the same file is emphasized |
| Emphasis composes with syntax tokens; stays on the same words when tokens arrive | 3: `story-review-diff-word-emphasis-composition.spec.ts` — the `const limit` example on a `.ts` path — the emphasized `25` is a token with the number's colour inside `insertion`; arrival case: insertion present while `codeTokens` is 0, same text after tokens arrive |
| Underline ≥3:1 vs line background; tokens ≥4.5:1 on the tinted background; light and dark; appearance change restyles both | 3: same composition spec — appearance case using `expectReadableContrast` on an emphasized token in light and dark, and the underline colour's contrast against the line background computed the same way |
| Line Follow up, context expansion, numbers, notes, reading position unchanged | 1–3: the consumers below stay green |
| Maintained words | 3: `dashboard/STORY-REVIEW-FILES.md` describes emphasis; module headers name it |

Consumers to keep green at every rendering slice (scratch-observed below):
`dashboard/frontend-tests/review/` (13 tests) and `e2e/review/` (98 tests,
including `e2e/review/story-review.spec.ts`'s aria snapshot of diff lines).

## Decisive premises

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| Existing review specs observe diff-line markup, and `ins`/`del` surface as `insertion`/`deletion` roles | Slices 1–3 proof and consumer runs | 2026-11-16, this workspace at `223d84476` with integration `node_modules` linked: scratch edit wrapped every added/removed line's code in `<ins>`/`<del>` (`StoryReviewContextGap.tsx`), then `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list review/` → 13 passed; `… --config e2e/playwright.config.ts --reporter=list review/` → 97 passed, 1 failed: `e2e/review/story-review.spec.ts:49` aria snapshot received `- insertion: renamed` for a pure-addition line. Under the story's rule a pure addition gets no emphasis, so that snapshot stays as is; the run shows the role mapping and that aria snapshots are consumers. Scratch edit reverted. |
| No unit runner covers `dashboard/src`; the frontend Playwright specs with page-object helpers are the boundary | Slices 1–3 proof location | Read `dashboard/frontend-tests/review/story-review-diff-syntax*.spec.ts` and `dashboard/tests/support/reviewDiffSyntax.ts`: diff behaviour is proved through the mounted review with fixture diffs (`diffSyntaxFixtures.ts`). |
| A tint plus an underline in the line's colour can meet 4.5:1 for every token and ≥3:1 for the mark | Slice 3 appearance | 2026-11-16 standalone Node probe (no product edit): Shiki `codeToTokensBase` with both github-*-high-contrast themes over samples in all eleven grammars; light foregrounds mixed 25% toward `--text` as `source-tokens.css` does; `--ready`/`--problem` mixed over `--surface` and `--raised-surface` from `appearance.css`. Minimum token contrast: 14% tint ≥4.97, 20% ≥4.45 (light/surface/problem), 25% ≥3.99. Underline colour vs 14% line tint ≥4.75, vs 20% tint ≥4.35. So the emphasis tint stays near 18% or below; mounted proof in slice 3 decides. |
| Changed blocks are often unequal in line count, so positional pairing would not serve | Seed direction; slice 1 rule | 2026-11-16, `git log -300 --no-merges -p` over this repository: mixed blocks unequal 2,156 of 3,893 in `dashboard/src/*.ts*`, 495 of 1,506 in Markdown. |

## Concerns

Slice-plan refinement was not needed: three Behavior slices exercise one
model (block → word stream → emphasized ranges → rendered marks); slice 2
adds the story's two independently justified restrictions to that model, and
slice 3 composes it with tokens and appearance. This review found no
remaining slice-specific concern.

## Ordered slices

Each slice targets 15 active minutes.

### 1. Changed words in a changed block are emphasized on plain lines
Type: Behavior
Status: done
Proof: new `dashboard/frontend-tests/review/story-review-diff-word-emphasis.spec.ts`
(cases in the proof table for slice 1) with fixture diffs and texts beside
`dashboard/tests/support/diffSyntaxFixtures.ts`; then the consumer runs
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list review/`
and
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config e2e/playwright.config.ts --reporter=list review/`;
`npm run typecheck:dashboard`; `npm run lint`.

Behavior: a story-review diff of a path with no grammar, whose hunk holds a
run of removed lines followed by added lines → each line shows its removed or
added words marked as deletions or insertions, compared as one word stream
across the block with line breaks read as whitespace; pure additions and
removals, unchanged lines and revealed context show none; copied text is the
plain diff.

- A pure module beside `unifiedDiff.ts` derives emphasized ranges per changed
  line; `diffLineItems` renders them as `<del>`/`<ins>` around plain text.
- Minimal styling: underline in the line's change colour, no strikethrough.
- Before changing tests, apply MakeMe and page-object selection for the
  dashboard frontend entries (AGENTS.md).

### 2. Rewrites and very large blocks stay line-level
Type: Behavior
Status: done
Proof: extend `story-review-diff-word-emphasis.spec.ts` with the rewrite and
large-block cases in the proof table; rerun that spec, typecheck and lint.

Behavior: a block whose words share too little with their counterpart, or a
block too large to compare promptly → no word in it is marked, and the diff
opens as quickly as before while a small block in the same file is still
emphasized.

- Choose the similarity and size bounds as named constants against the
  examples (similar `const limit` and `run(a, b)` blocks still emphasized).

### 3. Emphasis composes with syntax styling and stays readable
Type: Behavior
Status: done
Proof: extend word-emphasis coverage in
`story-review-diff-word-emphasis-composition.spec.ts` with the `.ts`
composition and arrival cases and the light/dark appearance case
(`expectReadableContrast` from `dashboard/tests/accessibleReading.ts`); rerun
the slice-1 consumer commands (frontend `review/`, e2e `review/`),
including `story-review-diff-syntax-appearance*.spec.ts` for unchanged token
colours; `npm run typecheck:dashboard`; `npm run lint`.

Behavior: a styled diff's changed line → its emphasized words keep their
token colours inside the insertion or deletion, split at word boundaries;
emphasis is present before tokens arrive and on the same words after; every
emphasized token meets 4.5:1 on the tint and the underline 3:1 against the
line background in light and dark.

- Split token spans at range boundaries in the diff's rendering, leaving
  `SourceTokens` output for Intent unchanged.
- Settle the tint percentage from the mounted contrast proof.
- Update `dashboard/STORY-REVIEW-FILES.md` and the touched module headers.

## Local gates and execution discipline

Apply the linked
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Run Playwright with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES` and
`--reporter=list`. Per [AGENTS.md](../../../AGENTS.md), keep default
timeouts, never use `test.slow()`, and apply MakeMe and page-object selection
before test edits. The focused spec and the two `review/` consumer runs are
the local gate; they cover every spec that reads diff-line markup. The full
suites run in hosted CI. The local-gate sleep guard is
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC wrap long or full runs in `caffeinate -s -i`.

## Learnings

- Slice 1: plain `.txt` lines expose `insertion`/`deletion` in aria once
  emphasized; token-styled lines stay unmarked until slice 3 composition.
  Keep emphasis assertions in `story-review-diff-word-emphasis.spec.ts`, not
  in the syntax-styling subject. Drop single-space glue beside an emphasized
  word so a rewrap insert does not also mark neighbouring spaces.
- Slice 2: Dice similarity ≥0.5 and max 200 lines per block (skip before LCS)
  keep the seed rewrite and several-hundred-line blocks line-level while
  slice-1 similar blocks stay emphasized.
- Slice 3: compose emphasis in `diffLineCode.tsx` (not Intent `SourceTokens`);
  settle line tint at the existing 14%; styled proof lives in
  `story-review-diff-word-emphasis-composition.spec.ts`.
