# Reduce dashboard test feedback time with measured optimization (top 40%)

**Source:** [Selected story](../../seeds/SEED-196-optimize-dashboard-test-feedback.md#optimize-dashboard-test-feedback)
**Source review:** [source-review.md](source-review.md)
**Identity:** SEED-196#optimize-dashboard-test-feedback

## Goal and scope

Shorten the wait for trustworthy local dashboard test results while preserving
behavioral coverage and confidence. Run measured optimization against the
ordinary local command `npm run test:dashboard`, covering browser journeys,
boundary tests, and shared setup. Profile before choosing experiments. Seed
investigation from the tests and files that make up the top 40% of suite cost
by recorded duration contribution; follow related families across files and
tiers when they share responsibility or setup with those contributors. Retain
only changes supported by comparable wall-time measurements under like runner
conditions. Follow dashboard test guidance when simplifying tests or moving
proof between tiers. Establish replacement proof before removing or narrowing
cases. Update `.planning/TEST-OPTIMIZATION-CANDIDATES.md` with the latest-pass
summary and current candidate state. Preserve accepted necessary costs
(`agent-launch-poles`, `long-integrated-journeys`) unless new evidence supports
reopening them. Leave pending
`story-review-http-admission-boundary-placement`,
`codex-discovered-model-story-workflow-collapse`, and
`agent-launch-start-phases-host-collapse` unless a wall-improving approach
appears. A demonstrated absence of worthwhile improvement, with that
evidence recorded, satisfies the story.

**Exclusions:** Product behavior changes for faster tests. Non-dashboard suites.
Claims of speedup from fewer cases or lines alone, from focused timings without
a comparable full local re-run, or from CI-only allocation changes that leave
the selected local wait unchanged. Thinning accepted necessary-cost journeys
without new evidence. Re-trying the three pending collapses already rejected
for lack of focused wall gain without a new approach.

## Existing solutions and decisive premises

PFE: reuse [dough-test-optimization](../../../src/skills/dough-test-optimization/SKILL.md)
for baseline → family investigation → hypothesize/measure/retain-or-undo →
re-profile. Reuse `npm run test:dashboard` with
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES`
([proof record](../../../dashboard/tests/proof-record.md)). Reuse
[dashboard test guidance](../../../dashboard/tests/README.md) (journeys vs
boundary; one representative journey for page shape; boundary owns variants;
siblings share read-only preconditions and assert deltas). Do not add a
second measurement framework. [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires evidenced worthwhile gain against a stated baseline within coverage
constraints.

Settled in this execution checkout
(`cursor/optimize-dashboard-test-feedback-seed-196` at claim
`2c84e5210fb41c1a2143944901cca1bdc32a7956` on base
`5a3a3b2aa0d970194f62e6b15f5e28baf2a77273`):

- Ordinary local command is `npm run test:dashboard` (Playwright default local
  workers = half of 16 logical CPUs → 8).
- SEED-174 through SEED-195 already closed earlier passes; accepted necessary
  costs and pending candidates in `.planning/TEST-OPTIMIZATION-CANDIDATES.md`
  remain preserved.
- Slice 1 green baseline exists; see Current decisions.

## Outside-in proof

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| Baseline wall time, executed case count, runner conditions, and top-40% cost family analysis are recorded before experiments | Slice 1 | `/tmp/SEED-196-optimize-dashboard-test-feedback/baseline-proof.json` and `baseline-times.tsv` with `strictStatus: "passed"` and ranked top-40% contributors |
| Completed-review journey keeps one page path without repeating the unusable-capture/Landed-runs gap the gaps boundary already answers | Slice 2 | Focused before/after on `story-review-completed.spec.ts` (and gaps boundary still green) with three consecutive passes |
| Gaps boundary drops a server refusal already owned by the driver/conflicts siblings without losing unique gap coverage | Slice 3 | Focused before/after on `boundary/story-review-completed-gaps.spec.ts` with three consecutive passes; driver and conflicts still pass |
| Scoped Cursor noninterference asserts the default-launch delta without replaying the Recover+scope preamble continuation already owns | Slice 4 | Focused before/after on `cursor-session-scope-noninterference.spec.ts` (and continuation still green) with three consecutive passes |
| Recent-delete asserts Recently done placement/focus deltas without replaying story-card Keep/Escape dialog mechanics | Slice 5 | Focused before/after on `agent-launch-recent-delete.spec.ts` (and story-card-delete still green) with three consecutive passes |
| Full local suite re-run under comparable conditions measures before/after wall time and updates candidate record and timings doc | Slice 6 | Full `npm run test:dashboard` with proof/times records, plus updated `.planning/TEST-OPTIMIZATION-CANDIDATES.md` and `docs/maintainer/dashboard-test-timings.md` |

## Ordered slices

### 1. Ordinary local dashboard baseline and top-40% costs are recorded
Type: Behavior
Status: done
Proof: After `npm ci` in the owned workspace, ran
`env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/SEED-196-optimize-dashboard-test-feedback/baseline-proof.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/SEED-196-optimize-dashboard-test-feedback/baseline-times.tsv npm run test:dashboard`
once under default local workers (8 of 16 logical CPUs). Start load
`5.37 / 4.35 / 6.26`; end load `34.99 / 36.03 / 26.95` (highly contended).
Recorded revision `2c84e5210fb41c1a2143944901cca1bdc32a7956`, wall time
(`844.94s` real / `844.1s` `durationMs`), executed case count (`1,746`
passed, `0` skipped), and `terminal.strictStatus: "passed"`. Summed attempt
durations ≈ `6,138.2s`; summed `.tsv` (including hooks) `6,469.4s`. Top 40%
by file cost: 69 files / 40.0% of summed `.tsv`. Top 40% by case attempt
cost: 169 cases / 40.1%. Dominant removable-looking costs outside accepted
necessary costs and already-rejected pending collapses: (1) completed-review
journey tail repeating unusable-capture/Landed-runs gap already covered by
`boundary/story-review-completed-gaps.spec.ts`; (2) gaps loop
`ambiguous-merge` overlapping driver/conflicts unavailable proof; (3)
`cursor-session-scope-noninterference` replaying Recover+scope preamble
owned by continuation; (4) `agent-launch-recent-delete` replaying
Keep/Escape dialog mechanics owned by `agent-launch-story-card-delete`.
Accepted poles and long integrated journeys remain at the top of the `.tsv`
and are not experiment targets. Pending codex-model, start-phases, and
story-review HTTP admission placement stay untouched. Raw proof and per-spec
times stay outside Git under
`/tmp/SEED-196-optimize-dashboard-test-feedback/`.

Behavior: Pre-condition — owned workspace ready to run the dashboard suite.
Trigger — execute the ordinary local command with a proof record and spec times.
Postcondition — successful baseline facts and top-40% family analysis recorded
for later experiments.

### 2. Completed-review journey drops the unusable-capture Landed-runs tail
Type: Structure
Status: done
Proof: Focused before 9.69–10.00s / after 11.07–11.51s over three passes —
no focused wall gain; change undone. Gaps boundary still owns the unusable
capture / Landed-runs gap. Raw under
`/tmp/SEED-196-optimize-dashboard-test-feedback/slice2/`.

Internal change: Tried ending the journey after published-completion refresh
and file diffs; removed trailing `keepUnusableCompletedCapture` + Landed runs
assertions; restored after measurement.

Hypothesis rejected: journey-once / boundary-variants placement is still
plausible, but dropping the tail did not shorten focused wall while remaining
published-path work dominates.

### 3. Gaps boundary drops ambiguous-merge already owned by driver
Type: Structure
Status: done
Proof: Focused before 10.34–11.18s / after 9.48–11.51s over three passes —
inconclusive / no clear focused wall gain; change undone. Driver and
conflicts siblings stayed green while the trial edit was present. Raw under
`/tmp/SEED-196-optimize-dashboard-test-feedback/slice3/`.

Internal change: Tried keeping gaps loop `missing-agent` only; restored the
`ambiguous-merge` iteration after measurement.

Hypothesis rejected for wall: overlapping ranges; no supported focused
saving to retain.

### 4. Scoped Cursor noninterference stops replaying Recover+scope preamble
Type: Structure
Status: done
Proof: Focused before 15.14–16.18s / after 14.04–15.47s over three passes
(cleanup recheck 13.37s); continuation still green. Retained. Raw under
`/tmp/SEED-196-optimize-dashboard-test-feedback/slice4/`.

Internal change: Default-launch case no longer clicks Recover or asserts
scoped resume; continuation keeps Recover-through-default-change proof;
noninterference asserts stopped scoped session keeps its scope and Default
launch follows the new shared default.

Hypothesis supported at focused family wall (about 0.7s average).

### 5. Recent-delete asserts placement deltas without replaying dialog mechanics
Type: Structure
Status: done
Proof: Not attempted. After slices 2–3 rejects and slice 4's modest retain,
inspection of `agent-launch-recent-delete.spec.ts` shows only a single Keep
focus check amid launch-heavy placement steps; dialog overlap cannot
plausibly move suite wall. Recorded under Current decisions.

Internal change: none.

Hypothesis withdrawn at decisive checkpoint before dispatch.

### 6. Full local suite re-profile and candidate record update
Type: Behavior
Status: planned
Proof: Re-run `npm run test:dashboard` under comparable conditions with fresh
proof/times paths; update `.planning/TEST-OPTIMIZATION-CANDIDATES.md` Latest
pass and any moved pending/accepted/transferred entries; append a SEED-196
section to `docs/maintainer/dashboard-test-timings.md`.

Behavior: Pre-condition — retained experiments delivered (or none retained).
Trigger — full local re-profile and candidate-record write.
Postcondition — before/after wall and case counts reported with limits;
remaining candidates preserved for wrap-up.

## Current decisions

- Baseline recorded at `2c84e521` under high end load (`~35` 1-minute
  average). Treat suite-wall comparisons cautiously; prefer quieter
  conditions for Slice 6, and lean on three-pass focused evidence for
  experiment retain/undo decisions when suite load differs.
- Do not reopen accepted necessary costs or the three pending collapses
  without a new wall-improving approach.
- Prefer README-aligned sibling-delta and journey-once / boundary-variants
  cuts over host collapses or tier moves already rejected.
- Slice 2 checkpoint (2026-10-30): completed-review journey tail trim failed
  focused wall (9.69–10.00s → 11.07–11.51s); undone. Remaining strategy still
  targets duplicated Recover and dialog/setup overlap in the top-40% band.
- Slice 3 checkpoint (2026-10-30): gaps `ambiguous-merge` drop inconclusive
  (10.34–11.18s → 9.48–11.51s); undone. Record pending
  `story-review-completed-gaps-ambiguous-merge-collapse` only if a later
  wall-improving approach appears.
- Slice 4 retained (2026-10-30): noninterference Recover preamble removal
  improved focused wall ~15.5s → ~14.8s; continuation coverage preserved.
- Slice 5 decisive checkpoint (2026-10-30): remaining recent-delete dialog
  delta cannot plausibly close suite-wall gap (launch setup dominates; only
  one Keep-focus overlap). Skip the experiment; proceed to full re-profile
  with the retained slice 4 change. Pending
  `agent-launch-recent-delete-dialog-delta` only if a wall-improving approach
  appears.

## Learnings

- In this top-40% pass, removing a boundary-answerable journey tail or one
  overlapping gaps variant did not move focused wall while remaining setup
  dominated. Sibling-delta removal of a Recover click path did.
