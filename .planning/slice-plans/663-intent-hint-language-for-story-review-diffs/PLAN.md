# Style story-review diffs by Intent syntax hint when the path has no grammar

**Identity:** SEED-387#intent-hint-language-for-story-review-diffs
**Source:** [Style story-review diffs by Intent syntax hint when the path has no grammar](../../seeds/SEED-387-deferred-syntax-styling-follow-ups.md#intent-hint-language-for-story-review-diffs)
**Source review:** [source commitments](source-review.md)

## Goal and scope

A developer reviewing a story gets syntax styling on a story-review file diff
whose path extension names no grammar, when Intent locations at the review's
pinned settings revision supply a known `syntax` hint. The story section owns
goal, scope, key examples, UI, architecture, deferred siblings and the selected
path-first fallback; this plan adds none.

Assumptions: path selection stays primary; Intent hint is fallback only;
settings revision aligns with Intent's existing historical and reading-revision
rules (and comparison `tree` for Review-changes snapshots without Intent reading
state); shared highlighter, markers, arrival, copy, assistive text and 4.5:1
contrast stay as SEED-351 / SEED-377 left them; no new control, label, message,
server contract or grammar module.

## Existing solution and direction

PFE result: **change** the existing diff language selection and reuse Intent's
hint mapping — do not add a second highlighter or a parallel membership rule.

- `dashboard/src/diffLineTokens.ts` / `useDiffLineTokens` today call
  `pathLanguage(path)` only. Extend that consumer to accept an optional Intent
  `syntax` hint and resolve
  `pathLanguage(path) ?? sourceLanguage(hint, path)` (same order as Scope).
- Intent already maps membership and hints through
  `sourceEntryOfRepositoryPath` / `sourceLanguage`
  (`dashboard/src/intentLocationSelection.ts`,
  `dashboard/src/sourceHighlight.ts`). Diffs reuse those; they do not fork
  pattern matching.
- Intent Purpose already computes `selectedSyntaxHint` for the selected path
  (`IntentBrowser.tsx` → `IntentFileReading.tsx`) but mounts story changes
  through `FileDiff` without passing it. Pass the hint into `FileDiff` /
  `useDiffLineTokens`.
- **Review changes** does not load Intent locations today. Resolve the reviewed
  project's `PublishedSource` from the page's configured projects
  (`PageFrame.tsx` already holds `projects` beside `StoryReview`), read locations
  at the pinned revision (published → completion; landed → landing revision;
  snapshot → comparison `tree`), derive the selected file's hint, and pass it
  the same way. Failures or missing locations leave language as path-only /
  plain — no new message.
- Product words stay “syntax styling”
  ([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md));
  one language-selection rule preserves
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
  No new North Star topic: established shared-highlighter direction and the
  seed's Architecture section suffice.

Expected edits stay under the 250-line file-size check
(`diffLineTokens.ts` 40, `StoryReviewFileDiff.tsx` 159,
`StoryReviewSnapshotView.tsx` 222, `StoryReviewBody.tsx` 92,
`IntentFileReading.tsx` 244, `StoryReview.tsx` / `PageFrame.tsx` plumbing). No
pre-edit reorganization.

## Current decisions

- Path first; Intent `syntax` hint only when `pathLanguage` is undefined.
- Pin locations as the seed Scope states; Intent Purpose reuses already-shown
  locations / its selected hint rather than a second pin.
- Open Dough's live Distribution `sources` need no config change; proof uses
  fixture patterns such as `scripts/**/*.test` → `shell`.

## Proof ownership

| Promise (story scope / example) | Owning slice and observable proof |
| --- | --- |
| Path with no grammar + Intent `syntax: "shell"` (e.g. `scripts/setup.test`) styles as shell in Review changes | 1: extend `story-review-diff-syntax-paths.spec.ts` (or focused sibling under `frontend-tests/review/`) with Intent locations arranged on `frontendServices.locations` and a shell keyword token assertion |
| Same file as Intent Purpose story change styles the same way | 1: pass-through of existing selected hint into `FileDiff`; covered by shared `useDiffLineTokens` behavior plus the Review-changes case, or one Intent story-diff assertion if a cheap Intent comparison fixture already mounts `FileDiff` |
| Path outside Intent / unfamiliar hint / `notes.txt` stays plain | 1: keep or add plain cases beside the hint case |
| Path grammar wins over a conflicting hint (e.g. `.ts` + shell hint) | 1: one path-styled file that also matches a shell-hinted pattern stays TypeScript/JS tokens, not shell |
| Rename to a hinted path styles by new path + hint | 1: rename into `scripts/setup.test` (or equivalent) asserts shell tokens |
| Done published review uses completion settings, not a later tip change | 1: historical/published review fixture answers locations at completion revision with shell hint; optional tip locations differ — diff still shell |
| Markers, backgrounds, copy, arrival, 4.5:1 unchanged | 1: existing `story-review-diff-syntax*.spec.ts` stay green |
| Maintained words | 1: `STORY-REVIEW-FILES.md` (and `diffLineTokens.ts` header) name path-first then Intent-hint fallback |

## Decisive premises

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| `sourceEntryOfRepositoryPath` + `sourceLanguage` resolve `scripts/setup.test` under `{ path: "scripts", sources: [{ include: ["**/*.test"], syntax: "shell" }] }` to shell, leave unmatched `.txt` / outside-folder paths unresolved, and leave `.test.mjs` on path grammar | Slice 1 language fallback | 2026-11-16 in this preparation workspace: Node import of `intentLocationSelection` + `sourceHighlight`; `scripts/setup.test` → hint shell, resolved shell; `scripts/notes.txt` and `other/setup.test` → resolved null; `scripts/x.test.mjs` → path javascript (path wins). |
| Frontend authenticated-read substitute answers `intent=locations` from `frontendServices.locations`, so Review-changes proof can arrange a custom `sources` hint without a real Git settings read | Slice 1 Review-changes proof | Read `dashboard/tests/support/frontendAuthenticatedReadSubstitute.ts` (returns `state.locations` for `intent=locations`) and `frontendServiceState.ts` default locations; arrange override in the path-syntax journey. |
| Intent Purpose already computes `selectedSyntaxHint` for the selected path and mounts story changes through `FileDiff` without passing it | Slice 1 Intent Purpose pass-through | Read `IntentBrowser.tsx` / `IntentFileReading.tsx`: hint is computed and passed only to `IntentSourceLines`; `FileDiff` call site has no `syntaxHint`. |
| `pathLanguage("scripts/setup.test")` is undefined while `sourceLanguage("shell", …)` is shell | Slice 1 fallback discrimination | 2026-11-16 Node import of `sourceHighlight.ts`: confirmed. |

## Concerns

Slice-plan refinement was not needed: one Behavior slice, one cumulative rule
(path-first language selection with Intent-hint fallback through the shared
diff token path), below the eight-slice limit. This review found no remaining
slice-specific concern.

## Ordered slices

Each slice targets 15 active minutes.

### 1. Diffs fall back to Intent syntax hints when the path has no grammar
Type: Behavior
Status: done
Proof: update
`dashboard/frontend-tests/review/story-review-diff-syntax-paths.spec.ts`
(and/or a focused sibling under `frontend-tests/review/`) for the hint,
plain, path-wins, rename and published-completion cases in the proof table;
keep `story-review-diff-syntax.spec.ts`,
`story-review-diff-syntax-appearance.spec.ts` and
`story-review-diff-syntax-arrival.spec.ts` green;
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list review/story-review-diff-syntax`;
`npm run typecheck:dashboard`; `npm run lint`.

Behavior: a story-review diff whose path names no grammar, when Intent
locations at the review's pinned revision select it with a known `syntax`
hint → line code is token-coloured through the shared highlighter; a rename
follows the new path and hint; a path grammar still wins over a hint; outside
Intent or unfamiliar hints stay plain; Intent Purpose story changes use the
same fallback from the already-selected hint; markers, numbers, backgrounds,
copy, arrival and contrast stay as today.

- `useDiffLineTokens` / `FileDiff`: optional `syntaxHint`; resolve
  path-first then `sourceLanguage`.
- Review changes: resolve `PublishedSource`, load locations at the pinned
  revision, derive the selected file's hint, pass into `FileDiff`. Missing or
  failed locations → path-only / plain, no new UI.
- Intent Purpose: pass existing `selectedSyntaxHint` into `FileDiff`.
- Reword `STORY-REVIEW-FILES.md` and the `diffLineTokens.ts` header for
  path-first + Intent-hint fallback.
- Before changing tests, apply MakeMe and page-object selection for the
  dashboard frontend entry.

## Local gates and execution discipline

Apply the linked
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Run Playwright with the guarded form from
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
(`caffeinate -s -i` when on AC power). Focused frontend review syntax specs as
in slice 1; `npm run typecheck:dashboard`; `npm run lint`.

## Accepted proof (slice 1)

- Playwright: `caffeinate -s -i -- env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list review/story-review-diff-syntax` → 12 passed (`/tmp/slice1-pw.log`).
- Observations: `dashboard/frontend-tests/review/story-review-diff-syntax-intent-hints.spec.ts` (shell `if` on path-silent and rename; TypeScript `const` when path wins; plain `codeTokens` 0 outside Intent / unfamiliar; published Done styles from completion); existing `story-review-diff-syntax{,-appearance,-arrival,-paths}.spec.ts` green.
- `npm run typecheck:dashboard`; `npm run lint` — pass (rerun after post-change cohesion refactor).
- Post-change refactor: Intent `syntaxHintOfRepositoryPath` consolidated beside `owningLocation` (`intentSelectionCoverage.ts`); Purpose and Review-changes share it. `## REFACTOR COMPLETE`.

## Learnings

- Frontend `intent=locations` substitute answers must match the **requested** revision body; snapshot proof pins `locations.revision` to comparison `tree`, published to `completion`.
