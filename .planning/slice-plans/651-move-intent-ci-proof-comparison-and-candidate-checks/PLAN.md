# Move Intent CI proof, comparison and candidate checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#move-intent-ci-proof-comparison-and-candidate-checks
**Source:** [CI proof, comparison and candidate checks](../../seeds/SEED-334-product-wide-end-to-end-tests.md#move-intent-ci-proof-comparison-and-candidate-checks)
**Source review:** [source-only review](source-review.md)

## Goal and scope

Move the 20 selected interim specs to their Frontend/Backend/E2E owners with
every assertion and product behavior preserved. The source owns scope/exclusions:
no navigation/reading conversion, group retirement, `integratedStateCompletion`,
E2E naming, tagged installation or speed/shard claim. No blocking dependency.

At `74ad74110dda28417fd2dfb853c7dc8990d031d6`, the interim command lists
140 tests in 61 files; `intent/` alone selects these 33 tests in 20 files.
The other 41 files are navigation; reading/review conversion is delivered.
Reconcile later conversions by identity rather than preserving this total.

## Existing solutions and current decisions

- [Test placement](../../../dashboard/tests/README.md#where-a-check-goes) and
  [Frontend conventions](../../../dashboard/frontend-tests/README.md) govern:
  real production DOM, bindings, CSS and interactions against controlled
  service responses; real Backend HTTP/readers and E2E retain acquisition.
  A route log proves browser requests, never GitHub acquisition or refusal.
- Reuse `frontendApp.ts`, `frontendIntentDoneStory.ts`,
  `frontendIntentComparison.ts`, `frontendIntentSources.ts`,
  `frontendIntentReuseAnswers.ts` and `frontendIntentRevisionAnswers.ts`
  under `dashboard/tests/support/`. Their domain owners already supply Done
  selection, comparison/proof answers and pinned sources. Extend these owners
  narrowly; do not introduce another fake GitHub, app harness or parser.
- Keep `makeMe.aComparedStory`, `.aCiProof`, `.aCiProofEntry`,
  `.aCiHistoryAnswer`, `.aScopeHistoryGlance`, `.anIntentLocation` and
  `.aTestOptimizationCandidatesRecord` as the canonical facts. Supplied proof
  or selected locations establish UI preconditions, not parsing/selection proof.
- Before extending `frontendCiStatusAnswers.ts` (224 lines at the baseline),
  move its published story-board/unconfigured-project arrangements to their
  published-project owner and its run-proof answers to the proof service owner.
  Preserve existing callers through imports/re-exports as needed. Reuse the
  existing status controls and `frontendSubstituteAnswers.ts` holds/cleanup.
  This work belongs to slice 2's Proof reading, not a speculative framework.
- Candidate revision answers belong in the existing source/revision snapshot
  owner: add optional immutable candidate answers to its publications, retaining
  the current behavior for callers that omit them. Generic held/failed reads
  already exist in `holdAuthenticatedReads.ts` and
  `frontendAuthenticatedReadControl.ts`.
- Existing presentation/mounted comparison tests retain their detailed rule
  ownership. Convert the remaining whole-app connections without duplicating
  those variants. Existing Backend/E2E connections stay; add only missing proof.
- PFE found the above maintained solutions across all four roots and the
  [CI comparison proof map](../../../dashboard/tests/intent-ci-comparison-proof.md).
  Follow Accepted
  [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
  [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Follow `.planning/NORTH-STAR.md`'s separate observation/presentation
  direction; no ADR conflict or exception.
- Expected edited support and selected specs are currently below 250 lines
  (largest spec: candidates, 243). Keep cohesive modules within 250 lines.

## Outside-in proof ownership and gates

Slices map the 20 specs and four source examples.
Before removal, inspect setup/assertions and record every distinct destination
here: retain, move or equivalent existing proof, with exact spec/test and
observation. Include negatives, accessibility, geometry, focus, keyboard/touch,
reading position and counts.
Split mixed cases across their real boundaries without supplying the behavior under proof.

For each changed boundary, apply one scratch product break before conversion;
prove its replacement catches that same break and passes restored. Record the
fault, setup/observation and literal commands/results here.
Keep interim cases until mapped replacements and required real connections pass.

Local gate: affected Frontend/Backend/E2E selections below, plus affected consumers
from the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
Use `caffeinate -s -i` on awake macOS on AC power; on battery use the maintained
open-lid `caffeinate -i` procedure and inspect sleep logs under
[local resource use](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Check load/memory before expensive runs; sequence owned heavy commands, default
2 workers unless measured headroom calls for a lower count. Unfiltered groups
share the repository's admission. No full-suite or timing benchmark is required
solely by this conversion. Defaults/retries stay unchanged; never `test.slow()`.

Before test edits, rerun the installed test-entry selector for actual paths:
Frontend/E2E select MakeMe and page objects; Backend selects MakeMe. Reuse focused
page/component owners and keep expected values in the scenario. Each slice gets
independent post-change refactoring, focused proof, commit and delivery under
[dough-execute-plan](../../../.agents/skills/dough-execute-plan/SKILL.md), including
CI repair/observation and eventual wrap-up. The staged hook requires lint and script typechecking. Follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
verbatim; carry that link in every delegation and repair handoff.

## Ordered slices

Paths use `dashboard/{tests,frontend-tests,backend-tests}/intent/` unless named
otherwise; E2E uses `e2e/intent/`. Conversions retain feature ownership.
Each slice has 15 active minutes excluding command time; retain every observation
if a slice overruns. Existing families bound the conversion work.

### 1. Read Done scope history through file Proof
Type: Behavior
Status: done
Proof: `intent-scope-glance.spec.ts` → Frontend. Keep selected/folder/file values,
seven marks and failed ×, average placement, unit-specific scales, keyboard/touch,
removed-word absences, Baseline/Purpose/return controls and dark contrast.
Behavior: given a selected Done landing, drill entry → folder → file and change
unit → the correct scope's history precedes its evidence table. Extend the
existing Done arrangement with explicit history answers; no real Git or server.
Backend `landed-ci-scope-proof-completion.spec.ts` already reads entry/folder/file
and repeats with unchanged GitHub calls; retain it plus E2E
`intent-scope-collected-file-timing-history.spec.ts` for real collection.
Check: Frontend `intent-scope-glance.spec.ts`, that Backend file and E2E file.
Accepted: interim spec moved to Frontend `intent-scope-glance.spec.ts` with every
UI assertion kept; explicit glance answers come from `scopeTimingHistory` /
`serveDoneScopeHistories` (`tests/support/scopeTimingHistory.ts`, also now behind
`projectScopeHistoryFacts.scopeUnitsHistory`). The interim `ciCalls()` check rests
on Backend `landed-ci-scope-proof-completion.spec.ts` `github.calls` unchanged.
Scratch break: `IntentFileProof` history → `null` failed at the file
`expectStackedInOrder`; restored passed. Frontend glance pair, Backend and E2E
files passed. Learning: each scope and unit needs its own difference text.

### 2. Read run Proof and preserve its acquisition/refusal boundary
Type: Behavior
Status: done
Proof: `intent-ci-proof.spec.ts`, `intent-ci-proof-accessibility.spec.ts`,
`intent-ci-proof-grouped-location.spec.ts` → Frontend UI assertions. Keep the
held Proof/visible verdict, attempt/link/revision, grouped units, counts/gaps,
historical-only no-link, entry destination/focus, zoom/whole words/tab order/Space.
Behavior: a judged run's answer arrives independently → Proof shows its exact
run and evidence without altering the judgment. Modularize status/project/proof
support above, then use controlled proof answers including hold/unavailable.
Move omitted-attempt refusal to new Backend `intent-ci-proof-read.spec.ts`:
real HTTP 400 and unchanged upstream call count. New Backend
`ci-proof-extraction.spec.ts` owns carried plan-633 G1: real collector CLI bytes
through a real ZIP and `ciProofArtifactReader`, preserving missing-part and
untimed evidence. Retain listing/download counts and attempt memory in
`ci-proof-memory-github*.spec.ts`; E2E `intent-ci-proof-reasons.spec.ts` and
`intent-ci-proof-units.spec.ts` retain actual acquisition/display connections.
Check: Frontend `intent-ci-proof`, Backend `ci-proof-` and
`intent-ci-proof-read.spec.ts`, the two named E2E files.
Accepted: published story-board/unconfigured arrangements moved to
`frontendServiceState.ts`; `openFrontendRunProof` moved to
`frontendCiRunProofAnswers.ts` with `{hold, proof}`. The three Proof specs moved
to Frontend with assertions verbatim; listing/download counts rest on Backend
`ci-proof-memory-github.spec.ts`. New Backend `intent-ci-proof-read.spec.ts`
(400, no GitHub call, attempt=1 control) and `ci-proof-extraction.spec.ts`
(real CLI `--by-file` → ZIP → reader). Scratch breaks on `CiProofTable` rows,
the attempt refusal and the missing part each failed; restored passed. 63
Frontend consumer specs (148), Backend `ci-proof-` (21), the two E2E files and
typecheck passed. Learning: the collector records `untimed` only `--by-file`.

### 3. Read single-run Summary evidence and keep its sorting
Type: Behavior
Status: done
Proof: `intent-summary-ci-proof-{gaps,kept,sort,table}.spec.ts` → Frontend.
Behavior: open/drill a run's Summary, refresh unsuccessfully or sort → own figures
stay above children, unseen files count once in the correct outside row, partial/
absent/no-breakdown wording remains accessible, kept-at/failure match the home,
and sorting survives Development without URL/storage persistence. Keep zoom,
whole words, unavailable children and their source/drill destinations.
Reuse slice 2 proof/status family and published source answers; raw collector
bytes stay owned by Backend extraction and E2E `intent-summary-ci-proof.spec.ts`.
Check: Frontend `intent-summary-ci-proof-`, that E2E file and affected slice-2 callers.
Accepted: the four Summary proof specs moved to Frontend over
`frontendSummaryCiProof.ts` (tree from `summaryTreeSources`, empty scope history
via `answerEmptyScopeHistory`); `aCiProofEvidence.withMissingNextPart()` states a
missing part after an unbroken one. The kept spec closes G1. The interim
"Completed ancestor" label rests on E2E `intent-ci-proof-ancestor.spec.ts`; the
raw no-`files` check on Backend extraction and E2E `intent-summary-ci-proof`.
Scratch break in `ciScopeProof` `outsideOf` failed 4 tests; restored passed. Full
Frontend `intent/` (198), the E2E file, node consumers (113) and typecheck passed.

### 4. Read comparison counts and signed relative changes
Type: Behavior
Status: done
Proof: `intent-ci-comparison-count-gaps.spec.ts` and
`intent-ci-comparison-relative.spec.ts` → Frontend built app.
Behavior: compare partial/ambiguous counts and timed units → overall, entry,
Summary, file and tree evidence retain gaps and suppress unsupported differences;
complete units keep independent cues. Signed marks share their proper centred
scale; zero/added entries have no invented mark. Show % works by keyboard,
preserves mark geometry/order and survives Project Intent and back.
Reuse `answerFrontendIntentComparison` with canonical endpoint proofs; retain
existing mounted/unit rule variants rather than adding another renderer.
Check: Frontend both converted files and existing mounted relative/gap owners.
Accepted: both specs moved to Frontend with assertions verbatim through
`prepareFrontendDoneIntent(..., { comparison })`, which applies MakeMe steps to
the canonical Summary-scope compared story; `relativelyTimed` is shared with the
mounted relative spec. `shown` gains one "0%": canonical `wallTimed()` endpoints
measure time without runner waits (interim setup only, never asserted). Scratch
break `leastRelativeScale` 0.5 → 1 failed the relative mark; restored passed.
Comparison/Done consumers (119 + 9) and typecheck passed. Learning for 5–6:
reuse the `comparison` option; interim drilldown/file/sort specs time out at 30 s
under load ≥25 with 4 workers, so their Frontend replacements remove that risk.
Repair met here: `story-review-note-context` failed once in `showColumn`'s
poll; see [diagnosis](diagnosis-show-column-flake.md) for cause, repair and proof.

### 5. Navigate compared scopes while retaining reading preferences
Type: Behavior
Status: done
Proof: `intent-ci-comparison-drilldown-relative.spec.ts`,
`intent-summary-story-comparison-{file,sort}.spec.ts` → Frontend built app.
Behavior: drill story → entry → nested folder → file, change view/story and return
→ signed figures use each display's scale; Show %/sort persist or fall back for
missing columns, focus/scroll reset occurs at the same destination, and Summary
requests no source text or extra comparison/proof reads. Purpose remains the
pinned diff; Proof retains modified/added/renamed-across-units/merge-edited rows,
labels, absent cues and keyboard return to the same selected file/Proof tab.
Reuse Done/source/review owners with explicit clean/merge-edited answers and
Story B's one-run answer; Git/diff judgment remains Backend/E2E's. Retain E2E
`intent-summary-story-comparison-{source,renamed}.spec.ts` for acquired sources.
Check: Frontend the three files, their mounted bindings and those E2E files.
Accepted: the drilldown, file and sort specs moved to Frontend with assertions
verbatim over `prepareFrontendDoneIntent`; Story B's one run comes from
`frontendQueuedStoryOneRun.ts` through `serveFrontendRunProof` (run-41 only).
File Proof cue variants rest on `intent-summary-story-comparison-mounted-file`.
Scratch breaks (sort kept-reading → state, modified label, Summary comparison
reread) each failed; restored passed. New tests take 9–19 s. Consumers (26 + 24),
E2E consumers and typecheck passed; the E2E source/renamed pair timed out at
load 52–55 and passed 3/3 at load 34 with one worker (15–18 s each).

### 6. Read a comparison independently of locations availability
Type: Behavior
Status: done
Proof: `intent-ci-comparison-locations.spec.ts` → Frontend built app.
Behavior: hold/fail historical locations → the one story header and comparison
remain usable; Changed tests shows loading/failure/Retry, recovery uses the
completion revision, and revisiting comparison does not reread it.
Reuse slice 5's Done setup and existing holds/control. Keep browser request counts
at Frontend. Real comparison acquisition/counts remain in Backend
`ci-comparison-memory-*.spec.ts` and E2E `intent-ci-comparison{,-retry}.spec.ts`;
add a direct Backend case if assertion inventory finds an unmatched upstream effect.
Check: converted Frontend file, affected bindings and the named real owners.
Accepted: moved to Frontend with `holdAuthenticatedReadsWhere` scoped to the
completion revision's locations read; Retry now must read exactly `[completion]`.
Concrete acquired wall times rest on E2E `intent-ci-comparison.spec.ts`; the
interim spec had no upstream count, so no Backend case was added. Scratch break
(Retry at a wrong revision) failed T2; restored passed. Backend
`ci-comparison-memory-` (7) and typecheck passed. Refactor follow-up for wrap-up:
the authenticated-read request log is hand-written in 14 Frontend files.
CI repair on `9f54296e` (run 44079796018): `native-guidance-check-inflight.sh`
hung because `native_run_wait_first` relied on `wait -n`; see
[diagnosis](diagnosis-native-guidance-inflight-hang.md). Native supervision input
hashes change with it.

### 7. Open recorded candidates at their Purpose targets
Type: Behavior
Status: done
Proof: `intent-test-optimization-candidates{,-case,-open}.spec.ts` → Frontend.
Behavior: read/select a candidate → groups, recorded fields/order, section notes,
pinned Markdown links and hidden leading pass summary stay accurate; tabs/layout,
keyboard and return focus stay usable without a reread. Full/unique bare paths,
Python/Gherkin cases and path:line reach the same Purpose/selected tree position;
ambiguous paths offer choices, moved/outside paths explain refusal, prose stays
prose and duplicate cases open at file start with no invented target line.
Reuse `prepareFrontendReuseCandidates`, `putFrontendIntentSources` and existing
case-position data. Extend their project arrangements, not a second parser.
Backend `authenticated-read-intent-candidates.spec.ts` and E2E
`intent-candidates-read-recovery.spec.ts` keep real pinned acquisition/recovery.
Check: the three Frontend files, those Backend/E2E files and existing reuse callers.
Accepted: the three candidate specs moved to Frontend with titles, steps and
assertions one-for-one over `frontendIntentCandidates.ts` (per-project
`prepare*Candidates`); `locationsSelectingUnder` now serves it and
`frontendIntentStory.ts`. Frontend selects files by folder only; include
patterns stay Backend's. Scratch break of return focus failed; restored passed.
Full Frontend `intent/` (215), Backend candidates (6), the E2E recovery file and
typecheck passed.

### 8. Keep candidate records current without accepting stale answers
Type: Behavior
Status: done
Proof: `intent-test-optimization-candidates-{live,revision,states}.spec.ts` → Frontend.
Behavior: switch project/revision or recover a candidate read → live facts and None,
absent/unreadable/mismatched/empty explanations, no partial guess, retry/no unwanted
polling and ordinary location browsing remain. Keep the old record until Show
latest; then show the new pinned record, keep its tab and reject late old answers.
Extend revision snapshots as above; preserve source-keyed immutable answers and
use `passTimeUntilCheckedWhileReadsOutstanding` when deliberately holding a read.
Check: converted files, existing Frontend candidate recovery and all six current
`intent-revision-` / `intent-home-activation` consumers; retained Backend/E2E owners.
Finish all 20-spec assertion dispositions; list the interim command again: none of
these CI specs remains, and independently surviving navigation stays runnable.
`groupRunnerExamples.ts` already uses `navigation/board-paging.spec.ts`; change it
only if independent work removed its actual title, with runner-ownership proof.
Accepted: the three specs moved to Frontend; revision publications carry
optional immutable candidates answers and `prepareCandidateProjects` publishes
multi-project candidates. A held old-revision answer cannot replace Show latest
(scratch break letting the late answer win failed it). Interim `--list`: 107
tests/41 files, exactly the 74ad74110 navigation files; `intent/` lists 0.
Emptying the intent share broke the shard check, so `ci.yml` drops that share
(`[1, 2, 3]`, navigation split unchanged) and the shard test injects an empty
pattern instead. Full Frontend `intent/` (221), Backend/E2E candidates, shard
node tests and typecheck passed.
CI repair on `87551c3b` (run 44090579516): the `ci-proof` summary `expect`
still declared `dashboard/tests=4:case`; now 3, matching the matrix
(`ci-proof-actions`/`-declaration` failed before, 1346 node tests passed after).
Repair disposition: within slice 8's refactored `ci.yml` change.

## Execution complete

Product advice: no change to priorities. The 20 Intent CI specs now live in
Frontend with named Backend/E2E owners; the interim group holds only navigation
(107 tests/41 files), so the navigation/retirement stories start from that and
from `ci.yml`'s renumbered integrated shares. Give SEED-340 the
[comparison retry diagnosis](diagnosis-comparison-retry-e2e-timeout.md): its
first E2E case spends ~20 s on fixtures and Done-story publication under load
≥27, the class SEED-340 owns. Its seed and SEED-319 still place moved
`intent-done-source-selection` / `intent-ci-done-reference-lifecycle` under
`dashboard/tests/intent/`. Process review is deferred into wrap-up with the
Intent Coverage check.

## Decisive premises and observations

[Preparation observations](PREPARATION-EVIDENCE.md) retain the literal commands,
setup, profile, faults, results and limits at the baseline revision. Routes
were exercised in this workspace through real UI/Backend boundaries; no cheap
premise remains open.

| Premise consumed by slices | Observed result |
| --- | --- |
| Done full-app scope/file arrangement (1, 5) | Original scope UI assertions pass, including seven marks, units, geometry and contrast; removing file history fails the focused probe. |
| Run Proof and candidate Purpose answers (2, 7) | Correct rows/source/return focus/one read pass; empty rows or disabled candidate open each fail. |
| HTTP proof refusal and collector ZIP route (2) | 400/no GitHub request; real CLI → ZIP → reader keeps missing/untimed parts, one list/download and reuse. |
| Immutable revision snapshots and held candidate answers (8) | Show latest displays the new record; releasing the old answer does not replace it. |
| Existing snapshot consumers (8) | Scratch extension passes all 12 cases in the six affected revision/home files. |
| Interim runner selection (8) | 140 tests/61 files; Intent is exactly 33/20. |

## Sizing and concern review

Plan 633 overran twice: history combined a new family, four specs and home
inspection; glance discovered a missing Done arrangement. That now exists;
seven proof specs are split into run Proof and Summary proof, and comparisons
have separate reading/navigation/availability loops. Candidate navigation precedes
revision/state controls; existing owners keep one model across slices.

Slice-plan refinement was not needed: construction replaced the five provisional
batches with eight bounded outcomes and mapped proof. No remaining slice concern
or person-owned pre-Take decision was identified.


## Story obligations

### G1. Judgment beside a previously retrieved Proof has no Frontend observation yet
Reported: slice 2 — "Slice 2 returns held, partial, multi-unit and unavailable observations in frontend-tests/intent/intent-ci-proof*.spec.ts; previously retrieved Proof has only Backend reuse in ci-proof-memory-github*.spec.ts"
Story clause: "A run's proof is held, partial, multi-unit, unavailable or previously retrieved. Its judgment stays readable independently"
Disposition: proved by slice 3: dashboard/frontend-tests/intent/intent-summary-ci-proof-kept.spec.ts after failed refresh 'Previously retrieved at' then expectCiAnswer(panel, verdict) and expectProofRows(proof, homeRows); held/partial/multi-unit/unavailable in frontend-tests/intent/intent-ci-proof*.spec.ts
Commitment: 12a
