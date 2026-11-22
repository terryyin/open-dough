# Get fast proof of Intent scope timing history

**Identity:** SEED-413#speed-intent-scope-timing-history
**Source:** [Get fast proof of Intent scope timing history](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-history)
**Split from:** SEED-413#speed-intent-timing-history-on-vitest (plan 772, recoverable at `dc8d21846:.planning/slice-plans/772-speed-intent-timing-history-on-vitest/PLAN.md`, former Slices 4–6) before readiness on 2026-11-22, when its 19 legacy files exceeded one plan. Resplit before readiness on 2026-11-22: collected timing reading and chart marks (former groups C–D) moved to [plan 777](../777-speed-intent-scope-timing-reading/PLAN.md) for SEED-413#speed-intent-scope-timing-reading.

## Goal and scope

A dashboard maintainer can quickly check that Project and Done scope timing
glances and kept histories stay isolated by project, source and scope key, and
that a failed or empty read recovers beside live Scope Proof without borrowing
another answer. The seed story holds the full goal, scope and key examples.

- **Included.** The delivered CI wall-time history entry correction below; the
  8 legacy specs (11 cases): `intent-project-scope-glance`,
  `intent-scope-glance`, `intent-project-scope-history-source-identity`,
  `-project-isolation`, `-key-isolation`, `-recovery`, `-refresh`,
  `-remount`.
- **Excluded.** Collected timing units/gaps/provenance/segments/reading and
  the shared history chart-marks specs (plan 777); CI wall-time history
  (completed plan 772); attempt proof and Summary (plan 760). Sibling-owned
  page objects (`intent-ci-evidence-page.tsx`, `intent-ci-scope-page.tsx`,
  `intent-done-story-page.tsx`, `intent-browser-page.ts`,
  `intent-candidates-page.ts`, `intent-file-reading-page.ts`) are not modified
  except as the gap() scoping and wall-time journey consolidation require.
- **Assumption.** One or two legacy files fit a 15-minute slice (plan 764's
  three-file port stopped at 8.1 active minutes with work outstanding).

## Carried decisions and learnings

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [frontend guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Render the production owner of each history view at its typed entry; no
  test copies of compositions, restated provider stacks, ancestor class
  wrappers, private pipeline calls, hand-written domain records or production
  transforms to make inputs.
- Reuse the page entry plan 772 delivered: required `readScopeHistory` on
  `IntentCiReadSource` (`dashboard/src/intentCiReadSource.ts`);
  `mountIntentCiPage` (`dashboard/frontend-tests/intent/intent-ci-page-mount.ts`)
  with production `PageFrame`, `StoryReferenceNavigation`, `BoardOrIntent` and
  `PerspectiveScroll`; `makeMe.aScopeHistoryGlance` on
  `publishedReadingMakeMe.mjs`. Production owners stay
  `IntentScopeTimingHistory` / `useIntentCiScopeHistory` beside live Scope
  Proof.
- Plan 772 product advice: correct page-mount preference reset and options-
  object test entries before moving more cases through `mountIntentCiPage`;
  the attempt-proof story (plan 760) mounts through the same entry and
  benefits from the same reset.
- Done wall-time history builder still averages measured priors in
  `through()` without `priorBuildReferenceOf`'s window and outlier rule;
  decide the same domain-named reference steps for any scope-history builder
  before writing it (`ciScopeHistoryReference.ts` also uses
  `priorBuildReferenceOf`).

## Correction of the delivered CI wall-time history entry

Execution retrospective of SEED-413#speed-intent-timing-history-on-vitest
(plan 772; commits `4e4e753a2`, `7650362be`, `a08b5556f`, `bdca8b1f4`,
`14c5c3bc4`, `3f8611de3`, `846d118fa` on its story branch), 22 November
2026, a read-only outcome review of `git diff 20719a2ae 846d118fa`. No
product bug was found. Every scope history case mounts through the same
entries, so these come first:

- **Board position leaks between Vitest files.** With production layout the
  Board pages its columns; `showColumnOf`
  (`intent/intent-ci-development-card-page.ts`) chooses a column through
  `keptPosition.choose` (`dashboard/src/columnPaging.ts`), which keeps
  `open-dough.board.position` in localStorage and module state.
  `mountIntentCiPage` resets only the Sessions sidebar
  (`withClosedSessionsSidebar`), so a later file in the same worker can
  start on a paged Board, the class of leak CI run 45015905953 showed for
  the sidebar. Give every page mount (Board, frame, Intent) one shared reset
  and restore of the page preferences it can change; prove a paging case
  leaves the stored position restored and run an Intent compare spec with
  `board-paging.spec.ts` in one `--workers 1` invocation.
- **The Done history builder restates the production prior-build rule.**
  `Distribution/tests/support/doneWallTimeHistoryTestData.mjs` `through()`
  averages measured priors itself, without `priorBuildReferenceOf`'s
  20-build window and slow-outlier exclusion
  (`dashboard/src/ciPriorBuildReference.ts`), against the carried decision
  "no production transforms to make inputs". Give the reference figures
  domain-named steps (e.g. `.averaging(ms, used)`) instead of deriving them,
  and decide the same for the scope history builder before writing it.
- **Test entries accrete positional optional parameters.**
  `openDoneStoryComparison(review, readDoneWallTimeHistory = unanswered,
  readComparison?)` hard-codes `readScopeHistory: unanswered`;
  `mountJudgedRunProof(entries, extra = {}, page = {})`;
  `machineSessionsAnswering(answer, refusal?)` switches behaviour on an
  optional string. Take one options object with a `ci:
  Partial<IntentCiReadSource>` bag before adding `readScopeHistory`, and a
  named `machineSessionsRefusing` beside `machineSessionsAnswering`.
- **`HeldKind` is an opaque registry.** `dashboard/src/pageReads.tsx`
  `HeldKind<T>` carries an unread `name` and a phantom `held?: T`, stores in
  an untyped `Map`, and `storyNoteAnnouncement.ts` keys a page singleton
  `"page"`. Replace it with a typed per-kind factory and a keyless per-page
  variant, same semantics.
- **The Project history page object left a duplicated journey.** The
  `Check again` → Shift+Tab → `Builds and evidence` → Enter walk and the
  phone sideways-overflow scan are written out in both
  `intent-ci-wall-time-history.spec.ts` and `-gaps.spec.ts`; move them into
  `openTrunkHistory` (`intent-ci-wall-time-history-page.ts`).
- **The Done history `gap()` reads the page's first gap.**
  `intent/intent-ci-done-history-page.ts` uses
  `document.querySelector(".intent-ci-gap")` unscoped, while CI status and
  judgment render the same class; scope it to the CI comparison region.

## Decisive premises

| # | Premise | Consuming operation | Observation | Result |
|---|---|---|---|---|
| P1 | `mountIntentCiPage` resets only the Sessions sidebar, not Board position | Slice 1 | Read `intent-ci-page-mount.ts` (calls `withClosedSessionsSidebar` only) and `columnPaging.ts` `keptPosition` key `open-dough.board.position` at `a1f0e6e51`, 2026-11-22 | True; preference reset is structural |
| P2 | `openDoneStoryComparison` hard-codes `readScopeHistory: unanswered` with positional optional parameters | Slice 1 | Read `intent-story-compare-stories.ts:121–170` at `a1f0e6e51` | True; options-object reshape is structural |
| P3 | The 8 owned legacy files pass on the legacy engine and give the before measure | Slices 3–7 timing comparison | `caffeinate -s -i npm run --silent test:dashboard:frontend -- --workers 2` with the 8 owned files at `a1f0e6e51`, 2026-11-22 20:28, load 33.33/27.84/22.90 | 11 passed; 44.9 s including preparation |

No premise remains open. P3 was measured under high load; pair the after run under comparable load or note the load difference.

## Proof map

| Promise | Owner | Observable proof |
|---|---|---|
| Page mounts restore preferences they change | Slice 1 | Paging case leaves `open-dough.board.position` restored; Intent compare + `board-paging` green in one `--workers 1` run |
| Test entries take one options object with a `ci` bag | Slice 1 | `openDoneStoryComparison` / `mountJudgedRunProof` / `machineSessionsRefusing` signatures; existing wall-time and status consumers green |
| History builders take reference figures; HeldKind typed; journeys and gap scoped | Slice 2 | Builder has no `priorBuildReferenceOf` restatement; typed HeldKind; wall-time specs call page-object journeys; Done `gap()` scoped; consumers green |
| Project and Done scope glances | Slice 3 | Accurate summary cues on Vitest through the page mount |
| Source and project isolation | Slice 4 | Right request; abort/ignore other sources and projects |
| Scope-key isolation across remounts | Slice 5 | Distinct kept histories per entry/folder/file/revision key |
| Failure keeps live proof and recovers on Retry | Slice 6 | Last history + live Scope Proof; Retry without borrowing |
| Faster cohort with fewer maintained cases; spent support removed | Slice 7 | Paired two-worker before/after of the 8 files; case disposition table; 0 legacy cases remain |

Local gate per slice: typecheck and the focused frontend selection through
`npm run --silent test:dashboard:frontend -- --workers 2 <paths>`; Slice 1
also runs the preference-leak proof under `--workers 1`, and Slice 7 also
runs the full dashboard frontend group and the representative
`e2e/intent/intent-ci-status.spec.ts` journey when the shared mount or page
reads change. Run long local suites under the maintained macOS sleep guard
(`caffeinate -s -i`, on AC power) per
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Failures follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Slices

### 1. Page mounts reset the preferences they change and test entries take one options object

Type: Structure
Status: planned

Give every page mount (Board, frame, Intent) one shared reset and restore of
the page preferences it can change, including Board column position beside
the Sessions sidebar. Reshape `openDoneStoryComparison`,
`mountJudgedRunProof` and `machineSessionsAnswering` to one options object
with a `ci: Partial<IntentCiReadSource>` bag and a named
`machineSessionsRefusing`, without yet wiring answered `readScopeHistory` into
moved cases. Enables Slices 3–7 and plan 777.

Proof: a paging case leaves the stored Board position restored; Intent
compare + `board-paging.spec.ts` pass in one `--workers 1` invocation;
existing wall-time and CI status consumers of the reshaped entries stay
green; typecheck.

### 2. History builders take reference figures, HeldKind is typed, and wall-time page objects own their journeys

Type: Structure
Status: planned

Give the Done history builder domain-named reference-figure steps instead of
deriving averages; replace opaque `HeldKind` with a typed per-kind factory and
keyless per-page variant; move the duplicated Project wall-time keyboard and
overflow walks into `openTrunkHistory`; scope Done history `gap()` to the CI
comparison region. Directly owned retrospective correction.

Proof: builder callers supply figures; HeldKind consumers typecheck; wall-time
specs call the page-object journeys; Done gap assertions stay green with the
scoped query; typecheck.

### 3. Project and Done scope glances show accurate summary cues

Type: Behavior
Status: planned

Move `intent-project-scope-glance` (1) and `intent-scope-glance` (1) over
`IntentScopeTimingHistory` / `useIntentCiScopeHistory` within its production
owner and typed `readScopeHistory` replies.

Behavior: Project and Done scope glances show accurate summary cues before
each scope's table through the production Intent page entry.

Proof: both moved Vitest specs; 0 legacy cases remain on the 2 files.

### 4. Scope history stays isolated to the requested source and project

Type: Behavior
Status: planned

Move `intent-project-scope-history-source-identity` (2) and
`-project-isolation` (2). Typed `readScopeHistory` replies record requested
source, endpoint, scope and `AbortSignal`.

Behavior: switching repository or ref with the same project ID, or switching
projects, issues the right request and aborts or ignores other sources' and
projects' answers.

Proof: the moved Vitest specs; 0 legacy cases remain on the 2 files.

### 5. Scope keys keep distinct histories across remounts

Type: Behavior
Status: planned

Move `intent-project-scope-history-key-isolation` (1) and `-remount` (1)
beside live Scope Proof.

Behavior: entry, folder, file and revision keys keep distinct kept histories
across remounts and same-head snapshot refreshes.

Proof: the moved Vitest specs; 0 legacy cases remain on the 2 files.

### 6. Failed and empty reads keep live Scope Proof and recover on Retry

Type: Behavior
Status: planned

Move `intent-project-scope-history-recovery` (2) and `-refresh` (1).

Behavior: a failed or empty read keeps the last history and live Scope Proof,
offers `Retry`, and recovers without borrowing another endpoint's or scope's
history; Check again refreshes the same observed head with its own freshness.

Proof: the moved Vitest specs; 0 legacy cases remain on the 2 files.

### 7. The story's isolation and recovery proof runs faster with fewer maintained cases and no spent support

Type: Structure
Status: planned

Remove any history `test-support` module or export whose last consumer across
`e2e/`, `dashboard/frontend-tests/`, `dashboard/backend-tests/` and
`Distribution/tests/` moved with this cohort (candidates:
`projectScopeHistoryFacts.ts`, exports of `scopeTimingHistory.ts` used only
here). Record the case-disposition table for the 11 legacy cases from
Slices 3–6, and the paired two-worker before/after timing including
preparation of the 8 owned files: before at P3 (`a1f0e6e51`, 44.9 s under
load 33/28/23), after at the delivered head, alternating under comparable
load.

Proof: 0 legacy cases remain across the 8 owned files; consumers of removed
support pass; full frontend group when the shared mount or page reads
changed; representative `e2e/intent/intent-ci-status.spec.ts`.

## Concern evidence

Slice-plan refinement was not needed: each slice holds one outcome sized to
one or two legacy files or one correction concern, below the eight-slice
limit. This review found no remaining slice-specific concern.

## Current decisions

- Resplit collected timing reading and chart marks to plan 777 rather than
  force three-file slices against the plan-764 overrun learning.
- Capture after-timing under load comparable to P3, or record the load
  difference beside the pair.
