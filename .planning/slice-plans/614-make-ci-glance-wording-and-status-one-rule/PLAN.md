# Make CI glance wording and failed status one rule

**Identity:** SEED-331#make-ci-glance-wording-and-status-one-rule
**Source:** [Correction story](../../seeds/SEED-331-read-ci-history-at-a-glance.md#make-ci-glance-wording-and-status-one-rule)
**Source review:** [source-review.md](source-review.md)

## Source and provenance

Execution retrospective of SEED-331#read-ci-history-at-a-glance (spent plan
609 recoverable at before-cleanup
`33eb3f8cd99cb7e9131d072bf06576ef01cf3eaa:.planning/slice-plans/609-read-ci-history-at-a-glance/PLAN.md`),
reviewing `4f7214879..56dde3c7d`: 147fb83 (shared chart marks), 3157545
(Done glance), 92574cc (scope glance), 56dde3c (slim `history=glance`
response). That story promised "the same compact reading order and marks
across the views", brief status labels, and "no view keeps its own chart or
metric copy". Those promises stand; this correction adds none.

## Current findings (observed at 56dde3c)

1. **Divergent glance words in one Done story.** Wall-time marks say
   "Selected landing" (`dashboard/src/landedCiHistorySeries.ts:95`); scope
   marks say "Selected" (`intentScopeHistoryContext.ts:52-53`), and the
   selected-gap marker follows. The dashed-line label is
   `Prior-build average 8 min 24 s` from `averageLineOf`
   (`landedCiHistorySeries.ts:34-38`) but scope inlines
   `Prior-build average: 103 ms` (`IntentScopeTimingHistoryUnits.tsx:118`).
   Done pending reads "No timing · Pending · CI queued or running"
   (`ciHistoryGapWords.ts`); real scope pending reads "Pending CI build" or
   the raw enum "Pending CI later-build" (`server/ciScopeHistoryGap.ts:15`).
   `intent-scope-timing-history-gaps.spec.ts:89` hand-builds the Done
   wording, so real scope pending wording is unproven. Missing scope
   identity shows a whole sentence as the average
   (`server/ciScopeHistoryReference.ts:17`).
2. **Failed decided by string match.** `failedBuildWords = "Failed build"`
   (`ciHistoryChart.ts:42`, imported by `server/ciWallTimeReference.ts`) and
   `failedBuildReason = "Failed CI build"` (`ciScopeHistory.ts:17`) are both
   matched by `reasonStatus` (`ciHistoryChart.ts:61-67`) and the glance
   `gapOf` (`server/ciHistoryGlance.ts:115-121`), although
   `ciScopeHistoryTiming.ts` knows `build.state === "failed"`. Rewording a
   reason would read a failed build as "No timing".
3. **Stale doc sentences.** `docs/dashboard-development-intent-ci-reference.md:13`
   ("reports … their actual date span") and `:43` ("Four show their
   evidence"); `docs/dashboard-development-intent-scope-reference.md:110-111`
   ("explicit unavailable difference") and `:115` ("retain their specific
   exclusion reasons") describe what no glance view shows.
4. **Overlapping specs.** `intent-ci-done-prior-states.spec.ts` repeats three
   mounted states of `frontend-tests/intent-ci-compact-readout.spec.ts:83-125`;
   full mark Tab walkthroughs run in both chart-marks specs and
   `intent-scope-glance.spec.ts:129`; the default-answer membership check
   repeats in `ci-history-slim-response.spec.ts` (two tests) and
   `ci-history-glance-compatibility.spec.ts:30-45`; the zero-average branch
   is proved in three browser specs plus `tests/support/ci-prior-build-reference.test.mjs`.

## Preserved promises and constraints

Story SEED-331#read-ci-history-at-a-glance's Done and scope glance layout,
marks, readouts by pointer/keyboard/touch, light/dark, retry and retention;
`history=glance` contents and the unchanged default response for pages opened
before deployment (frozen readers stay frozen); Project Intent's top-level CI
status history lists and the follow-up reading's membership. Reference math,
eligibility and retention unchanged. ADR 0008: derived local read.

## Decisive premises

| Premise and consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| The divergent words and string matching exist as listed (slices 1–2). | Read at 56dde3c on 2026-11-13 by the retrospective reviewer and the coordinator (file:line above). | — |
| Scope timing knows the failed build state (slice 2). | `server/ciScopeHistoryTiming.ts` sets `failedBuildReason` where `build.state === "failed"`. The frozen previous readers under `dashboard/tests/support/previousCiHistoryReader/` use non-strict `z.object` (no `.strict()`), so an added typed field on the default reference still parses for pages opened before deployment; observed at 56dde3c. | — |

## Ordered slices

### 1. Read one vocabulary in Done and scope glances
Type: Behavior
Status: done
Proof: Extended `intent-ci-done-glance.spec.ts` and `intent-scope-glance.spec.ts`
assert the same selection word and average label; `intent-scope-timing-history-gaps.spec.ts`
fixture from the real projection (`scopeHistoryGlanceOf`) or server wording
asserts the brief pending wording; `intent-scope-prior-build-states.spec.ts`
asserts a brief missing-identity status.

Behavior: Given one Done story, its wall-time and scope history marks, dashed
line and pending and missing-identity statuses read with the same brief
words; the shared chart layout labels the dashed line from the series'
`averageMs` in its own timing words, "Selected landing" is defined once
(`selectedLandingWords`), and scope gap reasons use the shared gap
vocabulary. Correct the four doc sentences in the same slice.

### 2. Read a failed build as failed from its known state
Type: Structure
Status: done
Proof: `tests/support` server tests for scope timing and the glance
projection; `ci-history-slim-response.spec.ts`; chart-marks and compact
readout specs unchanged and passing; a focused test showing a reworded
failure reason still reads failed; one failed build added to the real-server
scope drill-down fixture of `intent-scope-glance.spec.ts` with its red ×
mark asserted (Intent Coverage at fa84adc caught a flipped failed status
only at `ci-history-slim-response.spec.ts:148`; no real-server journey drew
the mark).

Carry the typed failed status from scope timing and the reference's selected
sample, with one owner for the failed-build rule; move `failedBuildWords` out
of the chart module. Default response unchanged unless the frozen readers
still parse it.

### 3. Keep one proof per glance behavior
Type: Structure
Status: done
Proof: The consolidated specs keep each named behavior observed once in the
browser plus integration proof: Done states (one collector-backed state plus
"comparison stays readable, no CI calls"), one full mark Tab walkthrough, one
default-answer membership check, zero-average once in the browser plus the
unit test. The consolidated `intent-scope-glance.spec.ts` and
`intent-ci-done-glance.spec.ts` journeys stay well inside the default test
timeout under this machine's usual external load (see Learnings), with the
measured before/after times recorded.

## Gates and delivery

- Follow [the failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests) as written.
- Resolve test paths through the installed MakeMe and page-object skills
  (`dashboard/tests`, `dashboard/frontend-tests`: both; `dashboard/backend-tests`
  and `tests/support`: MakeMe).
- Never sleep in tests, use `test.slow()`, or raise suite, file, group or hook timeouts.
- Local gate per slice: its proof plus consumer-trace additions,
  `npm run typecheck:dashboard`, the full check-only `npm run lint` (slice 4
  of plan 609 failed hosted lint in an untouched consumer that selective
  lint skipped), and `npm run --silent format`. Homebrew Bash first on
  `PATH`, `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`,
  long runs under the [`caffeinate -s -i` guard](../../../tests/local-test-resources.md#machine-sleep-on-macos) on AC.
- Hosted CI (`ci.yml`, push) is the integrated completion check.

## Plan review

Refinement not needed: three slices, one observable wording outcome and two
structure changes each with its own proof. Remaining slice-specific concern:
none.

## Current decisions

- Choose the Done wall-time words ("Selected landing", `averageLineOf`
  label) for both views unless the wording review in slice 1 finds a
  clearer existing dashboard term; keep wording consistent across views.

## Learnings

- Slice 1 (accepted 2026-11-13): chosen words are "Selected landing", the
  chart layout's "Prior-build average <time>", the Done gap words (e.g.
  "Pending · CI queued or running", "Cancelled") for scope gaps too, and
  "Scope identity unavailable". The default (non-glance) scope answer carries
  the new brief reason strings with its shape unchanged; no reader matches the
  old strings and the frozen-reader compatibility specs pass.
- Stability defect owned by slice 3: `intent-scope-glance.spec.ts` (10–16 s
  alone) and `intent-ci-done-glance.spec.ts` hit the default 30 s test timeout
  under external load 24–57 at 2–3 workers (scope glance inside
  `openCollectedHistoryStory` / the Proof tab click; done glance in shared
  `tests/support/selectDoneStoryForCiComparison.ts:21`); base f258e463b
  behaves alike and both pass serially. Slice 3 makes these journeys cheaper
  as part of its consolidation and proves the margin under load.
- Slice 2 also covers a final `failed` scope gap (a landing whose retained
  observation is final with reason `failed`): it reads "No timing · Failed"
  with status unavailable today, the same string-decided status the slice
  removes.
- Slice 2 (accepted 2026-11-13): `dashboard/src/ciFailedBuild.ts` owns the
  failed-build rule (`isKnownFailed` from build state or final gap reason,
  `gapStatusOf`, `gapStatus`, `timingGapStatusSchema`). Responses only gained
  optional `failed: true` (scope gap entries, wall-time and scope
  `reference.selected`); default reason strings are unchanged, so a page opened
  before deployment still reads a final failed landing as "No timing · Failed".
  `intent-scope-glance.spec.ts` now draws a failed sixth prior instead of the
  116 ms outlier; outlier exclusion stays proved in the prior-build reference
  tests and specs.
- Slice 3 (accepted 2026-11-13): the journeys' time went to setup and the
  server's `ci-comparison` read, not to assertions, so dropping the Tab
  walkthrough alone could not fix the timeouts. The Done glance, Done prior
  states, scope glance and scope prior-build states journeys now start from
  the worker-kept summary-comparison story
  (`startingFromKeptSummaryComparisonStory`); the scope journeys read kept
  history through `projectScopeHistoryFixture.ts` without collecting.
  Measured at 2 workers, interleaved with HEAD 1f7d11a7 at load 22–27: scope
  glance mean 21.4 s (max 31.0, timed out) → 14.1 s (max 19.4); Done glance
  16.2 s (max 26.8) → 11.9 s (max 15.4). After refactor at load 9–18:
  scope glance 8.8–20.1 s, scope prior-build states 7.8–19.4 s. Real
  collection of a Done entry's selected artifact stays proved by
  `intent-scope-collected-file-timing-history.spec.ts`.
