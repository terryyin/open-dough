# Find expensive proof in the test hierarchy

**Identity:** SEED-192#inspect-hierarchical-proof-cost
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#inspect-hierarchical-proof-cost).
**Source review:** [source review](source-review.md)

## Goal and scope

A Gherkin location or folder summary in Intent with readable proof states
the summed duration of its last successful scenario proof with the number of
scenarios it covers, labelled as a sum of separate observations (retries
included) and not a run's elapsed time, and the observations' oldest-to-newest
finish times and commit count. Each immediate child row adds its own sum and
covered count, or says its duration is unknown when it has no successful
proof. The summary lists up to ten slowest proven scenarios and outline rows
anywhere in the selection, with file Proof's per-row details. Child names
select that folder or file in Intent's one selection, revealing it in the
tree; a slowest row opens its file with Purpose positioned on that row.
Partial labelling and the absent-proof explanations stay as today.

Exclusions, from the story: ranking or reordering children by sum, a
project-wide summary, cross-location or cross-runner comparison, run wall
time, shared-setup attribution, cost estimates for unproven scenarios,
folder-level earlier-file-version counts, other producer families, and
story-scoped figures.

Assumptions: plans [441](../441-review-story-intent-impact/PLAN.md) (story
lens; folders start collapsed, tree change marking) and
[449](../449-intent-purpose-proof-layout/PLAN.md) (Purpose/Proof layout) are
Taken and edit `IntentBrowser.tsx`, `IntentLocationGroup.tsx`, and the shared
`FileTree`. Whichever lands later rebases onto the other; this plan neither
depends on nor blocks them. Slice 3's reveal must hold under 441's
collapsed-by-default folders.

## Existing solutions and decisions

PFE:

- **Summary aggregation.** `dashboard/src/intentSummaryCoverage.ts` already
  matches each read file's published scenario rows to the latest successful
  observation (`observationsForFiles`) and labels lines Partial
  (`coverageLabelledLine`) for the selection and each immediate child
  (`immediateChildrenOf`). Durations, spread, and the slowest list derive
  from those same per-row observations; no second matching rule or read.
- **Per-row wording.** `IntentProof.tsx` owns duration (`durationWords`),
  outcome-with-attempts, time-since, short commit, and same/earlier file
  version wording. Extract it once (slice 2) so file Proof and the slowest
  list share it.
- **Selection and case target.** `intentWorkspaceSelection.ts` carries a
  location, folder, or file plus `caseTarget`; `resolveCaseTargetLine`
  positions a numeric line target exactly, and Optimization Candidates'
  `openFromRecord` (`IntentBrowser.tsx`) already opens a file positioned on a
  case. Drill-down reuses both; no second navigation path.
- **Tree state.** Folder collapse is local to `IntentLocationGroup.tsx`
  (`collapsed` set), and the open location is `expandedPath` in
  `IntentBrowser.tsx`. Revealing a drilled-to folder or file must open its
  location and un-collapse its ancestors through those owners.

Architecture follows the seed's Architecture: derived in the browser from
published text and committed proof at the observed revision, never stored,
no added reads ([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)).

## Domain rule

For a set of files, the counted rows are the scenario rows of its read files
that have a latest successful observation. Sum = Σ `durationMs` of counted
rows; covered = counted rows; of = all scenario rows of read files. Spread =
min/max `finishedAt` and distinct `commit` over counted rows. No counted rows
→ duration unknown, no spread, no slowest list. Slowest = counted rows by
`durationMs` descending, ties in tree then source order, first ten. Partial
labelling wraps the sum line exactly as it wraps the count line.

## Outside-in proof

| Example | Slice | Signal |
| --- | --- | --- |
| 1 sum, coverage, not-elapsed wording, spread | 1 | new `dashboard/tests/intent-summary-proof-cost.spec.ts`, fixture with mixed-time, mixed-commit observations and unobserved scenarios: location summary reads the summed line with "N of M scenarios", the not-elapsed note, and oldest/newest time with "from K commits" |
| 2 child sums in tree order, unknown not 0 s | 1 | same spec: child rows in tree order with their sums; an unproven child says duration unknown and contains no "0 s" |
| 5 later focused run changes only its scenarios | 1 | same spec: reroute proof with one feature's observations replaced, re-read (new revision): that file's figures and spread end change, other children's sums unchanged, uncovered count unchanged |
| 6 retry duration counted | 1, 2 | same spec: sum includes the retried row's total duration (1); its slowest row says "2 attempts" (2) |
| 7 Partial | 1 | same spec: with one feature read held, sum line Partial "across 8 of 9 files"; releases to complete |
| 8 single observation; non-Gherkin unchanged | 1 | same spec: single-observation location shows one time and commit; `intent-entry-folder-summary-explanations.spec.ts` still passes (typescript summary shows no duration) |
| 1 slowest list | 2 | same spec: "Slowest scenarios" list slowest first, at most ten, each with scenario, example cells, file, duration, time, commit, file version |
| 3 child drill-down | 3 | new `dashboard/tests/intent-summary-drill-down.spec.ts`: click a child folder name → that folder selected (pressed in tree), its summary shown, tree revealed; click a child file → Purpose and Proof of that file; keyboard operation; with an ancestor collapsed first, drill-down reveals it |
| 4 slowest row opens positioned | 3 | same spec: click a slowest outline row → its file's Purpose positioned on that example row's line; Proof row shows the same duration and commit |

Evaluation: story completion needs Terry's evaluation on Doughnut's or
Pygardon's published proof (slice 4).

## Ordered slices

### 1. Summed duration, coverage, and spread in summaries
Type: Behavior
Status: done
Proof: `dashboard/tests/intent-summary-proof-cost.spec.ts` (examples 1 sum
and spread, 2, 5, 6 sum, 7, 8); existing `intent-entry-folder*.spec.ts`
green.

Pre-condition: a Gherkin location or folder summary with readable proof.
Trigger: select it; read completes or stays partial; proof changes. Result:
under the count line, one summed-duration line with covered/total scenarios,
the separate-observations-not-elapsed note, and the spread line; each child
row gains its sum and covered count or "duration unknown". Aggregation lives
beside `observationsForFiles` in `intentSummaryCoverage.ts`, using the domain
rule above. Docs: `docs/dashboard-development-intent.md` summary paragraph.

Accepted (2026-11-02): `intent-summary-proof-cost.spec.ts` (ex1, ex2/ex6,
ex6, ex5, ex8 steps; ex7 test) and the explanations spec's absence
assertions, with all 31 `tests/*intent*.spec.ts` (65 passed) on the
refactored state. The cost aggregation lives in
`dashboard/src/intentSummaryProofCost.ts`, a sibling of
`intentSummaryCoverage.ts` (file-size split) that reuses
`observationsForFiles` and `coverageLabelledLine`; `durationWords` moved to
`dashboard/src/proofDurationWords.ts`, which slice 2's row-wording
extraction may absorb. The spread uses absolute UTC times, as key example 1
reads, unlike file Proof's relative times.

### 2. Slowest scenarios in a summary
Type: Behavior
Status: done
Proof: same spec (example 1 slowest list, 6 attempts);
`intent-cucumber-proof.spec.ts` and `intent-doughnut-cucumber-proof.spec.ts`
green after the wording extraction.

Pre-condition: a summary with counted rows. Trigger: select it. Result: a
labelled "Slowest scenarios" list of at most ten rows, slowest first, each
naming the scenario (example cells), its file, and file Proof's duration,
attempts, time, commit, and file-version cells from one shared extraction of
`IntentProof.tsx`'s row wording. No counted rows → no list, and the existing
no-successful-proof wording. Rows carry their source line from
`gherkinScenarios.ts` for slice 3 (adding `line` to `ScenarioRow`).

Accepted (2026-11-02): `intent-summary-proof-cost.spec.ts` ("ex1 and ex6",
cli folder, 9.8 steps) and `intent-summary-slowest.spec.ts` (ten-row cap,
tree-then-source ties), with all intent specs (66 passed) after the
refactor. One matching walk, `observedRowsForFiles` in
`intentSummaryCoverage.ts`, feeds the count, sum and slowest list. File
Proof and the list share `ProofObservationCells.tsx`; `durationWords` stays
in `proofDurationWords.ts`. `ScenarioRow.line` is the Scenario line, or the
Examples row line for outline rows. Specs asserting relative proof times
for November fixtures pause the clock with `pausePageClockAt`
(`pausePageClock` starts on 2026-09-23).

### 3. Drill down from a summary
Type: Behavior
Status: planned
Proof: `dashboard/tests/intent-summary-drill-down.spec.ts` (examples 3, 4);
`intent-entry-folder-summaries-folders.spec.ts`,
`intent-test-optimization-candidates-open.spec.ts`, and
`intent-test-optimization-candidates-case.spec.ts` green.

Pre-condition: a summary showing child rows and slowest rows. Trigger:
activate a child name or a slowest row (mouse or keyboard). Result: a child
sets the one selection to that folder or file exactly as a tree name click
does; a slowest row sets the file with a numeric line `caseTarget`. Either
reveals the target: its location opens and its ancestor folders are
un-collapsed, through `expandedPath` and `IntentLocationGroup`'s collapse
owner. Docs: summary paragraph gains drill-down; the North Star's
[Runtime proof and hierarchy](../../../docs/dashboard-ux-ui-north-star.md#runtime-proof-and-hierarchy)
keeps only what remains unbuilt (run wall time, revision matching beyond
file version) and drops what the code now explains.

### 4. Terry's evaluation on real published proof
Type: Behavior
Status: planned
Proof: developer-operated observation recorded in this plan.

Question: does the summary let Terry find where Doughnut's or Pygardon's
retained proof time goes and where proof is missing, faster than reading
proof JSON or file Proof one file at a time
([ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md))?
One round: with the dashboard running this branch, Terry opens Doughnut's
`e2e_test/features` summary, drills to the slowest scenario, and states keep,
adjust (what), or reject. Steps Terry performs: run the dashboard with his
registered projects and GitHub authentication; judge usefulness. An adjust
answer within scope returns to slices 1–3; outside scope is a follow-up.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The summary already reaches per-row latest successful observations for the selection and each child at base | Slices 1–2 aggregation | `env -u NO_COLOR -u FORCE_COLOR npx playwright test tests/intent-entry-folder-proof.spec.ts tests/intent-entry-folder-summaries-folders.spec.ts --reporter=list` in `dashboard/` (2026-11-02, at `904cf22a`, after `node scripts/setup-native.mjs npm` and `browser`) | 2 passed: summaries render proof count lines per child from observations |
| Adding sum, spread, slowest-list, and child-name controls to the summary breaks no existing consumer | Slices 1–3 consumers | Scratch edit of `IntentGherkinSummary.tsx` adding a summed line, a "Slowest scenarios" list of every observation's scenario and file, and child names as buttons with "Summed duration unknown"; ran all `tests/intent-entry-folder*.spec.ts`, `intent-doughnut-cucumber-proof.spec.ts`, `intent-selection-reads.spec.ts`; reverted (2026-11-02, at `904cf22a`) | 12 passed; no consumer asserts the absence of such content |
| A numeric line target positions Purpose exactly, while a duplicated scenario name falls back to the file start | Slice 3 slowest-row open (outline rows share their outline's name) | `npx playwright test tests/intent-test-optimization-candidates-case.spec.ts` (2026-11-02, at `904cf22a`) | 3 passed, including "path:line at that line and a duplicate case name at the file start" — so slowest rows use a line target, not a name |
| Real published proof is sparse and mixed (motivates coverage and spread) | Story Challenge; slice 4 | `git show origin/main:e2e_test/proof/latest.json` in `~/git/doughnut` at `8930764691`, and Pygardon's three proof files at `50f7803ea` | Doughnut 23 observations, 4 commits, 4 of 94 features, 51.5 s sum; Pygardon 6 observations in 3 of 38 features |

## Local gates

- Focused proof per slice as listed, run from `dashboard/` with
  `env -u NO_COLOR -u FORCE_COLOR npx playwright test <specs> --reporter=list`.
- Slices 1–3 change the summary every Intent location/folder journey renders,
  and slice 3 the tree reveal every Intent journey loads; before publishing
  each, run all `dashboard/tests/*intent*.spec.ts` and
  `development-intent*.spec.ts`, plus `npm run lint` and the dashboard
  typecheck. Before the final publication run the full `npm test` and the
  whole dashboard suite on the final state (project practice for shared
  runtime-path changes).
- Failing and flaky tests follow this project's policy as written in
  [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests);
  carry it, by link or verbatim, into every delegation and repair handoff.

## Current decisions

- Refinement (2026-11-02, seed): children keep tree order (no ranking by
  sum); every sum names its coverage; an unproven child's duration is
  unknown, never 0 s; the slowest list holds at most ten rows; a slowest row
  opens Purpose positioned, matching Optimization Candidates.

## Story obligations

### G1. Deferred scope limits stay unbuilt
Reported: slice 1 — "Source review ids 22.1–22.10 name the story's deferred scope limits."
Story clause: "Ranking or reordering folders and files by their sums"
Disposition: excluded "Scope limits (deferred promises, not rejections)"
Commitment: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 22.10

## Concern evidence

Slice-plan refinement was not needed: each Behavior slice has one proof loop
over one summary addition, the wording extraction sits inside the slice that
first needs it, and the domain rule is one aggregation over the existing
per-row matching. This review found no remaining slice-specific concern.
Coordination with plans 441 and 449 is an ordinary rebase on shared files,
not a dependency; slice 3's proof includes a collapsed ancestor so it holds
under 441's folder defaults.
