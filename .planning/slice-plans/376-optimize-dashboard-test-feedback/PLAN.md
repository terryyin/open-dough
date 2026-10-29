# Reduce dashboard test feedback time with measured optimization

**Source:** [Selected story](../../seeds/SEED-174-optimize-dashboard-test-feedback.md#optimize-dashboard-test-feedback)
**Source review:** [source-review.md](./source-review.md)
**Identity:** SEED-174#optimize-dashboard-test-feedback

## Goal and scope

Shorten the wait for trustworthy local dashboard test results while preserving
behavioral coverage and confidence. Run measured optimization against the
ordinary local command `npm run test:dashboard`, covering browser journeys,
boundary tests, and shared setup. Profile before choosing experiments; retain
only changes supported by comparable wall-time measurements under like runner
conditions. Follow dashboard test guidance when simplifying tests or moving
proof between tiers. Establish replacement proof before removing or narrowing
cases. A demonstrated absence of worthwhile improvement, with that evidence
recorded, satisfies the story.

**Exclusions:** Product behavior changes for faster tests. Non-dashboard suites.
Claims of speedup from fewer cases or lines alone, from focused timings without
a comparable full local re-run, or from CI-only allocation changes that leave
the selected local wait unchanged. Reopening the rejected dashboard
shard-allocation experiment unless new evidence shows it shortens the ordinary
local command.

## Existing solutions and decisive premises

PFE: reuse [dough-test-optimization](../../../src/skills/dough-test-optimization/SKILL.md)
for baseline → family investigation → hypothesize/measure/retain-or-undo →
re-profile. Reuse `npm run test:dashboard` with
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` ([proof record](../../../dashboard/tests/proof-record.md))
for selection and attempt timings; wall time and inter-test gaps remain the
local-wait signal, because per-test `durationMs` omits shared setup. Reuse
[dashboard test guidance](../../../dashboard/tests/README.md) for journey vs
boundary placement and shared fixtures. Do not add a second measurement
framework, allocator, or test taxonomy. ADR 0002 supports coherent reuse;
ADR 0008 keeps real published/local process boundaries in tests; ADR 0010
requires evidenced worthwhile gain against a stated baseline within coverage
constraints. No temporary North Star topic is warranted.

Settled in this preparation checkout (`cursor/reduce-dashboard-test-feedback-time-with-measure`
at announcement revision `4897e037`):

- Ordinary local command is `playwright test --config dashboard/playwright.config.ts`
  via `npm run test:dashboard` (`package.json`).
- Proof-record support and guide exist under `dashboard/tests/support/proofRecord*.ts`
  and `dashboard/tests/proof-record.md`.
- The suite discovers `*.spec.ts` under `dashboard/tests/` (580 files observed
  via find); journeys and `boundary/` share one run.
- Prior measured work already closed without reopening here: rejected dashboard
  allocation (`91756ccd` / SEED-173) and production-policy optimization
  (`7e687acd` / SEED-171).

Settled by slice 1 probe (see Current decisions / Learnings): baseline facts and
dominant-cost hypothesis recorded; a credible first local-wait experiment remains
in the journey `agent-launch*` family. Install readiness was already satisfied
before the probe (`npm ci` in the owned workspace).

## Ordered slices

### 1. Ordinary local dashboard baseline and dominant costs are recorded
Type: Behavior
Status: done
Proof: In this owned workspace, after install readiness, run
`env -u NO_COLOR npm run test:dashboard` once under default local workers with
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` at an unused absolute path outside
`dashboard/test-results/`. Record revision, literal command, runner conditions,
load context, wall time, executed case count, strict terminal status, and
family/setup-cost hypotheses from wall time and gaps (not summed
`durationMs` alone). Incomplete or failing run is diagnostics, not a successful
baseline. Raw profiles stay outside Git. This early probe stops dependent
slices and forces plan revision when no credible local-wait experiment remains;
in that case continue at slice 3's no-gain reporting path only.

Behavior: Pre-condition — owned workspace ready to run the dashboard suite.
Trigger — execute the ordinary local command with a proof record.
Postcondition — comparable baseline facts and a named dominant-cost hypothesis
(or an explicit finding that no worthwhile experiment is credible) are recorded
in this plan.

### 2. Dominant-family cost is reduced with measured retain-or-reject
Type: Structure
Status: done
Proof: For the family named by slice 1, follow dough-test-optimization:
smallest meaningful change, focused comparable before/after measurement,
behavioral verification with replacement proof before any removal, three
consecutive focused passes for changed async/E2E synchronization, and
retain-or-undo from measured wall-time evidence. Apply dashboard tier guidance
when moving or dropping redundant journey variants. Reassess remaining
experiments from results; stop when no credible further saving remains within
scope. Do not deliver a change that only passes tests without measured local
gain. Preserve SEED-171 and SEED-173 closed outcomes unless new local-wait
evidence reopens a distinct remaining cost.

Enables: Slice 3's full-suite confirmation of the selected local wait.

### 3. Selected local suite confirms the measured outcome
Type: Behavior
Status: planned
Proof: Re-run `env -u NO_COLOR npm run test:dashboard` under conditions
comparable to slice 1's baseline, with a proof record. Report before/after wall
time and executed case count, retained behavioral proof, rejected experiments,
delivered commits, and remaining candidates. Include replacement-test cost when
proof moved. Distinguish measured improvement, no demonstrated gain, and
incomplete measurement. Emit `## TEST OPTIMIZATION COMPLETE` only when planned
work, verification, measurement, and delivery for this pass are complete.

Behavior: Pre-condition — slice 2 retained changes (or an explicit no-change
decision after slice 1). Trigger — comparable full local re-run.
Postcondition — the story's reported outcome matches the measurements; coverage
and confidence required by the story remain intact.

## Current decisions

Coordinator owns formatting, hooks, commits, publication, and closure during
execution. Use `env -u NO_COLOR` for dashboard commands. No numeric wall-time
target is selected; worthwhile gain is judged under ADR 0010 against the slice 1
baseline within coverage constraints. Replanning within this outcome is
permitted when probe or experiment evidence changes the family strategy.

### Slice 1 baseline (ordinary local run)

- **Revision:** `7d8d83ff2986ecc385e13be3d2dba44230521ecb`
- **Literal command:**
  `env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/od-dashboard-baseline.B3xSoT/proof.json npm run test:dashboard`
  (resolves to `playwright test --config dashboard/playwright.config.ts`)
- **Runner conditions:** default local workers (Playwright half of
  `availableParallelism()` → 8 on this 16-CPU host); `fullyParallel: true`; no
  test filter; Chromium browsers from `~/Library/Caches/ms-playwright`;
  `env -u NO_COLOR`; proof path outside `dashboard/test-results/`.
- **Load context:** decision-time load averages ~3.91 / 4.51 / 4.76; no other
  owned heavy dashboard suite in sibling worktrees; only lightweight Playwright
  MCP processes present. Post-run load rose (~7.6 / 13.2 / 10.9) as expected
  from the suite itself.
- **Wall time:** 630 s shell (`date +%s` before/after); proof
  `terminal.durationMs` ≈ 629.3 s (run span ~619 s attempt wall).
- **Executed cases:** `selectedCount` 1741; 1741 finished attempts, all
  `passed`.
- **Strict terminal:** `phase: "completed"`, `terminal.strictStatus: "passed"`,
  `terminal.runnerStatus: "passed"`, command exit 0. Successful baseline.
- **Raw proof:** `/tmp/od-dashboard-baseline.B3xSoT/proof.json` (outside Git).

### Dominant-cost hypothesis (for slice 2)

Local wait is wall-bound by a near-fully utilized 8-worker parallel run, not by
runner idle gaps (internal all-idle gaps ≈ 0) and not by a few outliers (top 10
cases ≈ 7% of summed `durationMs`). Summed attempt `durationMs` ≈ 4324 s versus
~630 s wall (avg concurrency ≈ 7). Browser **journeys** dominate worker-seconds
(~3368 s / 910 cases) over **boundary** (~957 s / 831 cases).

Largest coherent behavioral family for a first experiment: journey
**`agent-launch*`** — 73 specs / 195 cases / ~770 s concurrent-area
(~18% of worker-seconds); p50 ≈ 2.4 s, p90 ≈ 7.8 s, with multi-step poles
(`agent-launch-second-server` 65 s, orphan 31 s, preparation-codex-retry 10
cases / 74 s, ad-hoc-terminal 41 s). Second family: journey **`story-review*`**
(95 / ~500 s). Do not reopen SEED-171 production-policy or SEED-173 allocation as
the first move (`production*` ≈ 139 s area only).

Credible slice 2 experiment remains: reduce wasted journey cost inside
`agent-launch*` (redundant journey variants boundary can own, collapse multi-step
durability duplication, or share fixture/setup) under dashboard tier guidance,
with measured retain-or-undo against this baseline.

### Slice 2 experiment (preparation-codex-retry matrix → boundary)

- **Hypothesis:** `agent-launch-preparation-codex-retry.spec.ts` ran ten nearly
  identical browser journeys over retained-preparation damage variants; dashboard
  tier guidance puts those server/script variants at boundary and keeps one page
  path in a journey.
- **Change (retained pending slice 3):** move the ten damage cases to
  `dashboard/tests/boundary/agent-launch-preparation-codex-retry.spec.ts`; keep
  one representative journey proving the kept-start dialog surfaces the
  reconcile refusal (`workspace` damage).
- **Replacement proof:** boundary matrix established and passing before the
  journey was narrowed; three consecutive focused passes of journey+boundary
  after the narrow (all exit 0).
- **Focused BEFORE** (revision `692d9032…`, default local workers=8,
  `env -u NO_COLOR`):
  `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/od-dashboard-slice2-before.prepRetry/proof.json`
  `npx playwright test --config dashboard/playwright.config.ts`
  `dashboard/tests/agent-launch-preparation-codex-retry.spec.ts`
  `dashboard/tests/agent-launch-preparation-codex.spec.ts`
  `dashboard/tests/agent-launch-preparation-codex-recovery.spec.ts`
  `dashboard/tests/boundary/agent-launch-preparation-codex-continuation.spec.ts`
  — wall **19 s** shell / `terminal.durationMs` ≈ **18649**; `selectedCount`
  **14**; all passed; journey-retry area ≈ **72.5 s** (10 cases).
- **Focused AFTER** (same workers/env; selection adds replacement boundary
  file): proof `/tmp/od-dashboard-slice2-after.prepRetry/proof.json` (and
  repeats after2/after3) — wall **14–15 s** / `terminal.durationMs` ≈
  **13647–14164**; `selectedCount` **15**; journey-retry **1** case ≈ **6.5–7.0 s**
  + boundary-retry **10** cases ≈ **48–50 s**. Focused wall gain ≈ **4–5 s**
  (~25%); worker-seconds for the matrix ≈ **72.5 → ~55**.
- **Decision:** **retain** on focused wall-time gain. Full-suite confirmation
  of the selected local wait remains **slice 3**; do not claim suite speedup
  from focused timings alone.
- **Reassess / stop:** no further slice 2 experiments. Remaining
  `agent-launch*` cost poles are mostly unique multi-step journeys
  (`second-server` ~65 s, `second-server-orphan` ~31 s, `ad-hoc-terminal` ~41 s)
  without a redundant variant matrix boundary can own; smaller multi-case
  page files (`model` ~19 s, touch layout) offer weaker credible wall savings.
  Do not reopen SEED-171/173. Second family `story-review*` stays a later
  candidate only if slice 3 still needs more after confirmation.

## Learnings

- Proof JSON uses top-level `tests[]` (not `selections`); each entry has
  `attempts[]` with `startedAt` / `durationMs` / `status`.
- Default local worker count here is 8 (half of 16 CPUs); CI would use full
  parallelism — keep slice 3 comparisons on the same local default.
- Near-zero inter-test idle under load means savings must cut work per case or
  case count in heavy journey families; worker-count tweaks alone are out of
  story scope for local wait unless evidence changes.
- Moving a ten-case preparation damage matrix from journey to boundary cut
  focused wall ~19 s → ~14 s and matrix worker-seconds ~72.5 s → ~55 s while
  preserving one page-path journey; include replacement boundary cost in AFTER
  selection. Focused gain alone does not finish the story — slice 3 re-profiles
  `npm run test:dashboard`.

## Story obligations

## Plan concern review

Refinement was not needed: one outside-in outcome, existing measurement and
tier guidance reused, and the unknown dominant family is bounded by authorized
early probe slice 1. No remaining human-owned decision or architectural
conflict was identified. Slice 2's concrete experiment is intentionally
deferred to the probe result and is not a readiness block.
