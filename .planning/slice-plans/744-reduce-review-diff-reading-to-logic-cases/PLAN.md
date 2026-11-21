# Test Review diff reading's data logic directly and drop "mounted" from frontend test names

**Identity:** SEED-413#reduce-review-diff-reading-to-logic-cases
**Source:** [Test Review diff reading's data logic directly and drop "mounted" from frontend test names](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#reduce-review-diff-reading-to-logic-cases)
**Source review:** [source review](source-review.md)

## Goal and scope

Review diff reading's domain rules, which grammar a path or hint selects,
which words a changed block emphasizes, and which side's token line a diff
line reads, are proved as logic cases with nothing mounted. Rendering,
appearance and arrival cases stay mounted. No frontend unit test file name
says `mounted` except the harness's own spec
(`test-harness/mounted-dashboard.spec.ts`). Every case in the touched files
has a median of three attempts under 500 ms.

**Exclusions.** The shared harness in `dashboard/test-support/mounted-dashboard/`
and its names; built-app spec retirement beyond the two name collisions;
historical records such as `ProjectFindings.md`. Product behavior stays
unchanged.

## Outside-in proof

| Promise | Owner | Observation |
| --- | --- | --- |
| Intent comparison's two slow cases under 500 ms with their assertions | Slice 1 | Three attempts per case |
| Path and hint grammar selection, renames, path-wins-over-hint | Slice 2 | Logic cases fail on the scratch edits named there |
| Every selected grammar actually loads and tokenizes | Slice 2 | One logic case per grammar over `highlightSourceLines` |
| Word emphasis by block, rewrap, split, re-indent, low similarity, large block | Slice 3 | Logic cases over `emphasizedRangesByLine` |
| Underline decoration, plain copy and unemphasized revealed context | Slice 3 | One mounted case |
| Each line reads its own side's whole-text tokens | Slice 4 | Logic case over the extracted line-token rule |
| Styled diff keeps plain facts, copy and revealed-line styling | Slice 4 | Mounted case under 500 ms |
| No `mounted` frontend unit test names; same case counts | Slice 5 | `git ls-files` listing and selection counts |
| Every touched case under 500 ms median | Slice 5 | Per-case table from three attempts |

## Premises

| Premise | Observation | Result |
| --- | --- | --- |
| Logic cases over `pathLanguage`, `sourceLanguage`, `highlightSourceLines`, `parsedUnifiedDiff` and `emphasizedRangesByLine` run in the frontend Vitest browser project with no mount | Scratch spec in `dashboard/frontend-tests/review/` at `6641ad0a7`, `npx vitest run --config dashboard/frontend.vitest.config.mts` (env unset as in Local gates), reverted | 4 passed: `a.mts` → TypeScript `const` token 93 ms (first grammar load), `A.java` `class` 14 ms, hint selection 0 ms, `limit` block emphasized `20`/`25` 1 ms |
| Review mounted per-case times | [Review diff reading baseline](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#review-diff-reading-after-migration) at `a3563cf18`; no commit touches `dashboard/frontend-tests/review/`, `diffLineTokens.ts`, `sourceHighlight.ts`, `diffWordEmphasis.ts` or `StoryReviewDiffLines.tsx` since `2d1e73020` | `syntax-mounted` 672 ms is the only median over 500 ms |
| Intent `-mounted` Playwright per-case times | `npx playwright test --config dashboard/frontend.playwright.config.ts --workers=2 --reporter=json 'intent/intent-.*-comparison-mounted'`, three runs, 21 November 2026, AC power, load 9–10, at `6641ad0a7` | 93 cases, median 125 ms; only `intent-ci-comparison-mounted-scope-running` "Landed running preserves one Branch fallback through entry, folders and file Proof" over 500 ms (521/604/717 ms); `-gaps` "each failed Baseline Check again…" 433/748/462 ms |
| Renamed files stay selected | Frontend Vitest include comes from `dashboardSpecFiles` filtered by `isVitestFile` (content), Playwright from the frontend config by folder | Names do not select; slice 5 checks counts |
| Where the two slow Intent cases spend their time | `--workers=1 --trace=on --reporter=list` on both specs alone, 21 November 2026, load about 3.5, trace steps paired by `callId`, results removed | Alone they took 525 and 574 ms (three plain runs: medians 540 and 708 ms). Two or three `Click` steps of 140–190 ms each make up about 70% of each case; navigation and expectations take under 100 ms. Why a click takes that long is not yet observed, so slice 1 is an early probe |
| Mixed Vitest and Playwright paths in one run report only Vitest cases | `ProjectFindings.md` entry on the earlier slice 1 selection | Run the two runners separately for proof |

## Current decisions

- Logic cases stay in `dashboard/frontend-tests/review/`, beside the mounted
  cases of the same feature, in the frontend Vitest project.
- The grammar choice `pathLanguage(path) ?? sourceLanguage(hint, path)` moves
  out of `useDiffLineTokens` into one exported function the hook and the cases
  call. The per-line side rule (`tokenLineAt` and the removed/other choice)
  moves out the same way. No other production change.
- New and renamed files are named for what they check, not for their runner.
  Collisions with built-app specs (`syntax-appearance`, `syntax-arrival`) are
  resolved by naming each by its subject.
- Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md), the
  [page-object](../../../.agents/skills/dough-page-objects/SKILL.md)
  selection for the mounted cases, and the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Ordered slices

### 1. Intent comparison's slow cases run under 500 ms

Type: Structure
Status: done

Early probe. Find why the `Click` steps in
`intent-ci-comparison-mounted-scope-running` ("Landed running preserves one
Branch fallback through entry, folders and file Proof") and
`intent-ci-comparison-mounted-gaps` ("each failed Baseline Check again holds
the button disabled and retains the query and failure reason") take 140–190
ms, for example actionability waits or the work a click starts. Remove that
cost without dropping an assertion. If neither case can reach a 500 ms
median without losing a promise, stop and report the finding and the options
before the later slices.

**Proof.** Both cases pass with their assertions; three attempts each give
medians under 500 ms.

**Result.** Playwright waited for pointer stability once per browser frame,
and that wait cost 130–180 ms per click on this host. Keyboard `press("Enter")`
removed it with every assertion kept. Scope-running now has a median of 383 ms
(425/268/383 at load about 10), so commitment 11.1 is observed. Gaps
still has a median of 571 ms (621/455/571). Its remaining time is the app's
own reloads (proof reads, then Check again re-enabled), navigation and
first render, not a test-side wait. G1 carries it to slice 5. Profiling needs
`--reporter=json --output=<tmp>`, because the strict reporter deletes a passing
run's traces.

### 2. Grammar selection reads as logic

Type: Structure
Status: done

Export the diff's grammar choice from `dashboard/src/diffLineTokens.ts` and
use it in `useDiffLineTokens`. Replace
`story-review-diff-syntax-paths-mounted.spec.ts` with a grammar-selection spec
whose cases give the selected language for each supported extension, the
renames, the plain paths, the known and unfamiliar hints and the path that
wins over a hint. Add one case per grammar (11) that tokenizes its keyword
through `highlightSourceLines`, so a grammar that stops loading fails.

**Proof.** The spec passes; each scratch edit fails it: removing `mts` from
the extension map, preferring the hint over the path, removing the `java`
loader.

**Result.** `diffLanguage(path, hint)` is exported and used by
`useDiffLineTokens`. `story-review-diff-grammar-selection.spec.ts` has 36
logic cases, each with a median of at most 102 ms. The three scratch edits
each fail one case. `story-review-diff-syntax-languages-mounted` still owns
token colours, contrast and appearance switching, so it stays. That a rename
reads under its new path rests on `StoryReviewFileDiff.tsx` passing
`file.path`. The deleted mounted spec also only ever gave `StyledFileDiff`
that one path.

### 3. Word emphasis reads as logic

Type: Structure
Status: done

Replace the word-emphasis mounted cases with logic cases over
`emphasizedRangesByLine` on `parsedUnifiedDiff` hunks from
`wordEmphasisCases.ts`: the `limit` block, rewrap, split call, re-indent,
pure addition, low-similarity rewrite and several-hundred-line block. Keep
one mounted case for underline (not strike-through) decoration, plain copy
and no emphasis on revealed context, unless
`syntax-appearance-mounted` already observes the decoration.

**Proof.** The logic spec passes and fails on scratch edits to
`MIN_BLOCK_WORD_SIMILARITY` and `MAX_BLOCK_LINES_TO_COMPARE`; the mounted
case passes.

**Result.** `story-review-diff-word-emphasis.spec.ts` holds seven logic cases
over `emphasizedRangesByLine` per parsed hunk, as `StoryReviewDiffLines`
reads it, each in 0–2 ms. `story-review-diff-word-emphasis-decoration.spec.ts`
keeps one mounted case (409 ms median) for underline, plain copy and
unemphasized revealed context; `syntax-appearance-mounted` checks only
underline contrast. `wordEmphasisCases.ts` keeps file texts only for `limit`
and `limitAtPath`.

### 4. Each line's side tokens read as logic

Type: Structure
Status: done

Export the per-line side rule from `diffLineTokens.ts`. Add logic cases over
`greetText` tokenized by `highlightSourceLines`: a removed line reads the old
side, other lines the new side, a comment opened above the hunk styles its
lines, and a line whose text differs from its side reads plain. Reduce
`story-review-diff-syntax-mounted.spec.ts` to the rendering it owns: plain
facts and copy unchanged once styled, and revealed lines styled.

**Proof.** Logic cases fail when the removed line reads the new side; the
mounted case keeps its rendering assertions and has a median under 500 ms.

**Result.** `diffLineTokenLine(line, sides)` is exported and used by
`useDiffLineTokens`. `story-review-diff-line-sides.spec.ts` holds 14 logic
cases over `greetText`, each in 0–2 ms. Five of them fail when a removed line
reads the new side. `story-review-diff-syntax-mounted.spec.ts` keeps one case:
plain facts and copy, and revealed lines styled. Under load 22–26 it took 0.59×
the old case's time; G2 carries its absolute median to slice 5. The commitment
4 audit found no further data-logic case: `syntax-languages-mounted` compares
rendered colours with backgrounds and contrast.

### 5. Frontend test names say what they test

Type: Structure
Status: done

Rename the remaining review specs and helpers (`syntax-appearance-mounted`,
`syntax-arrival-mounted`, `syntax-languages-mounted`, `mountedFileDiff.ts`,
`mountedReviewDiffPage.ts`), resolving the two built-app collisions by
subject. Rename the 21 Intent specs and the five `mountedComparison*Cases.ts`
modules. Update imports and the comment references in
`Distribution/tests/support/intent-ci-comparison-signed-sort.test.mjs`,
`Distribution/tests/support/intent-scope-comparison-units.test.mjs`,
`e2e/intent/intent-ci-comparison.spec.ts`, `wordEmphasisCases.ts` and the
spec headers.

**Proof.** `git ls-files 'dashboard/frontend-tests/**' | grep -i mounted`
lists only `test-harness/mounted-dashboard.spec.ts`; the frontend Vitest and
Playwright runs select the same case counts as before the rename; no stale
path remains in `git grep`; typecheck and lint pass. Every case in the
touched files has its median of three attempts recorded per case in this plan.

**Result.** Every review `-mounted` spec, both review helpers, the 21 Intent
`-mounted` specs and the five `mountedComparison*Cases.ts` modules are renamed
by what they check; only `test-harness/mounted-dashboard.spec.ts` keeps
`mounted`. The mounted review specs took names apart from the built-app specs:
`token-readability` (in-diff token colour and contrast) beside
`syntax-appearance` (agreement with Intent's source reading), `late-styling`
(styling that arrives after the diff) beside `syntax-arrival` (unreadable text
or failed grammar), `language-colours` and `styled-rendering`. Intent
collisions: `-relative-scale` beside `intent-ci-comparison-relative`,
`-check-again` beside e2e `intent-ci-comparison-retry`, `-file-proof-counts`
beside `intent-summary-story-comparison-file`, `-column-sort` beside
`intent-summary-story-comparison-sort`, and `-rows` for the bare summary spec.
Case titles listed by both runners are identical before and after; the full
frontend run selects 643 Playwright and 169 Vitest cases, all passing.

Per-case medians of three attempts, 21 November 2026, AC power. Playwright
(`--workers=2 --reporter=json`) at load 22.2, 20.5, 17.2; Vitest
(`--reporter=json`) at load 19.7, 17.9, 18.3 (one-minute average at each
attempt's start).

| File | Cases | Medians |
| --- | --- | --- |
| `comparisonAdapterCases.ts` | 3 | ≤ 108 ms |
| `comparisonCancelledCases.ts` | 4 | ≤ 118 ms |
| `comparisonEndpointCases.ts` | 6 | ≤ 123 ms |
| `comparisonGapCases.ts` | 9 | ≤ 119 ms |
| `comparisonTakenCases.ts` | 4 | ≤ 128 ms |
| `intent-ci-comparison-check-again.spec.ts` | 3 | ≤ 349 ms |
| `intent-ci-comparison-entries.spec.ts` | 3 | ≤ 131 ms |
| `intent-ci-comparison-gaps.spec.ts` | 1 | ≤ 459 ms |
| `intent-ci-comparison-head.spec.ts` | 1 | ≤ 217 ms |
| `intent-ci-comparison-legacy.spec.ts` | 3 | ≤ 186 ms |
| `intent-ci-comparison-relative-scale.spec.ts` | 4 | ≤ 188 ms |
| `intent-ci-comparison-scope-running.spec.ts` | 1 | ≤ 292 ms |
| `intent-ci-comparison-scope-selection.spec.ts` | 2 | ≤ 343 ms |
| `intent-ci-comparison-selection.spec.ts` | 2 | ≤ 284 ms |
| `intent-ci-comparison-sort.spec.ts` | 5 | ≤ 126 ms |
| `intent-ci-comparison-units.spec.ts` | 4 | ≤ 120 ms |
| `intent-ci-comparison-wording.spec.ts` | 5 | ≤ 149 ms |
| `intent-source-target-recovery.spec.ts` | 2 | ≤ 1017 ms |
| `intent-summary-story-comparison-column-sort.spec.ts` | 3 | ≤ 252 ms |
| `intent-summary-story-comparison-fallback.spec.ts` | 3 | ≤ 172 ms |
| `intent-summary-story-comparison-file-proof-counts.spec.ts` | 5 | ≤ 113 ms |
| `intent-summary-story-comparison-gaps.spec.ts` | 5 | ≤ 125 ms |
| `intent-summary-story-comparison-outside.spec.ts` | 1 | ≤ 167 ms |
| `intent-summary-story-comparison-relative.spec.ts` | 6 | ≤ 166 ms |
| `intent-summary-story-comparison-rows.spec.ts` | 6 | ≤ 129 ms |
| `intent-summary-story-comparison-signed-sort.spec.ts` | 4 | ≤ 208 ms |
| `story-review-diff-grammar-selection.spec.ts` | 36 | ≤ 164 ms |
| `story-review-diff-language-colours.spec.ts` | 3 | ≤ 300 ms |
| `story-review-diff-late-styling.spec.ts` | 3 | ≤ 536 ms |
| `story-review-diff-line-sides.spec.ts` | 14 | ≤ 1 ms |
| `story-review-diff-styled-rendering.spec.ts` | 1 | ≤ 528 ms |
| `story-review-diff-token-readability.spec.ts` | 3 | ≤ 250 ms |
| `story-review-diff-word-emphasis-decoration.spec.ts` | 1 | ≤ 367 ms |
| `story-review-diff-word-emphasis.spec.ts` | 7 | ≤ 2 ms |

| Case | Attempts (ms) | Median |
| --- | --- | --- |
| `intent-ci-comparison-gaps.spec.ts` · each failed Baseline Check again holds the button disabled and retains the query and failure reason | 459/464/278 | 459 ms |
| `story-review-diff-late-styling.spec.ts` · styling that arrives after the diff keeps the reading position, revealed context and an open line menu | 536/372/610 | 536 ms |
| `story-review-diff-styled-rendering.spec.ts` · a styled TypeScript diff keeps the plain diff's change facts and copy, and styles revealed lines | 528/256/532 | 528 ms |
| `intent-source-target-recovery.spec.ts` · a selected source case keeps line 44 and reading while the new revision's file read is held then released | 673/475/583 | 583 ms |
| `intent-source-target-recovery.spec.ts` · a selected source case keeps line 44 and reading while the new revision's file read failed then retried | 1017/683/1175 | 1017 ms |

G1 is observed: the gaps case's median is 459 ms. G2 is not: the styled
rendering case's median is 528 ms at load about 18–20. `late-styling`'s
arrival case (536 ms) and both `intent-source-target-recovery` cases (583
and 1017 ms) are also over 500 ms; they became touched files through the
rename. No test-side wait was found in them without a shared page-object
change, which is outside this slice. Commitment 11 is open.

A follow-up at load 7.7–8.1 timed the four cases in one Vitest run of their
three files. The medians were worse, not better:
- recovery "held then released": 723/660/981 ms
- recovery "failed then retried": 735/788/938 ms
- `late-styling` arrival: 621/558/823 ms
- `styled-rendering`: 624/616/1035 ms, now the first case in its run

Step timing of the recovery cases puts most of their time in the app's own
work, not in test-side waits:
- mounting and opening the source: 290–575 ms
- each activation and the re-render that follows: 93–250 ms

Pressing Show latest and Retry by keyboard in the spec-local page objects did
not reliably shorten those steps (219/93 and 188 ms), so the edit was
withdrawn. Commitment 11 stays open for these four cases.

## Execution complete

Product advice: no new product priority follows from this structure story. Its
learning sits in the already queued follow-up
SEED-413#speed-intent-source-recovery-and-late-styling-cases: those three
cases spend their time in mounting and re-rendering through the shared
harness, not in test-side waits. Later timing promises on this shared machine
should name a relative judgement under load, as the amended acceptance now
does. The retrospective found no correction; process review is deferred into
wrap-up with the Intent Coverage check.

## Concern evidence

Refinement was not needed: each slice has one proof loop, slices 2–4 share
the one rule that domain logic is proved over the exported rule while
rendering stays mounted, and five slices fit the limit. Terry amended the timing
acceptance after slice 5. The cases still over 500 ms that this story only
renamed moved to a follow-up story. Slice 1's cause is
not yet observed; it is an early probe whose stop condition keeps the later
slices from depending on an unknown. No other slice-specific concern was
found.

## Local gates

- On AC power, run tests under `caffeinate -s -i` with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`, as
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  describes. Run Vitest specs with
  `npx vitest run --config dashboard/frontend.vitest.config.mts <specs>` and
  Playwright specs with
  `npx playwright test --config dashboard/frontend.playwright.config.ts <specs>`
  separately, then `npm run typecheck:dashboard` and `npm run lint`, never
  concurrently. Slice 5 also runs `npm run --silent test:dashboard:frontend`
  for the selection counts, since the rename changes every Intent spec path.
  Keep default timeouts; never `test.slow()`.

## Story obligations

### G1. Intent gaps case stays over 500 ms under load (first reported in slice 1; acceptance runs at load about 10: 621, 455, 571 ms; remaining time is the app's reloads, navigation and first render)
Reported: slice 1 — "The gaps case's median is still 571 ms"
Story clause: "every new or changed case has that median under 500 ms"
Disposition: proved by slice 5: PLAN.md slice 5 Result, `intent-ci-comparison-gaps.spec.ts` 459/464/278 ms, median 459 ms (evidence s5-time-pw-1..3)

### G2. Reduced styled-diff mounted case not yet measured under 500 ms (first reported in slice 4; load 22–26, paired runs: old 1449/1108/1123 ms, new 686/657/523 ms, ratio 0.59 of the quiet 672 ms baseline ≈ 393 ms)
Reported: slice 4 — "the mounted case's median is over 500 ms in absolute terms on this loaded machine"
Story clause: "every new or changed case has that median under 500 ms"
Disposition: proved by slice 4: PLAN.md slice 4 Result. In paired runs under the same load the reduced case took 0.59× the old one (evidence s4-q1..3), which is the relative judgement the amended Acceptance prescribes for a loaded machine.

### G3. Renamed touched cases over 500 ms (first reported in slice 5; `late-styling` arrival 536 ms and 621 ms medians; `intent-source-target-recovery` held then released 583 and 723 ms, failed then retried 1017 and 788 ms; mostly mount and re-render)
Reported: slice 5 — "three cases in files that only became touched through the rename are over 500 ms"
Story clause: "Cases in files this story only renamed, or whose references it updated, are recorded but owe no speed change here"
Disposition: owner changed "They move to"
