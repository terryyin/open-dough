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
Status: planned

Export the per-line side rule from `diffLineTokens.ts`. Add logic cases over
`greetText` tokenized by `highlightSourceLines`: a removed line reads the old
side, other lines the new side, a comment opened above the hunk styles its
lines, and a line whose text differs from its side reads plain. Reduce
`story-review-diff-syntax-mounted.spec.ts` to the rendering it owns: plain
facts and copy unchanged once styled, and revealed lines styled.

**Proof.** Logic cases fail when the removed line reads the new side; the
mounted case keeps its rendering assertions and has a median under 500 ms.

### 5. Frontend test names say what they test

Type: Structure
Status: planned

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
touched files has a median of three attempts under 500 ms, recorded per case
in this plan.

## Concern evidence

Refinement was not needed: each slice has one proof loop, slices 2–4 share
the one rule that domain logic is proved over the exported rule while
rendering stays mounted, and five slices fit the limit. Slice 1's cause is
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
Story clause: "every case in the touched files has a median of three attempts under 500 ms"
Disposition: receiving slice 5
