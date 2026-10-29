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
Status: done
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

## Execution complete

Product advice: No backlog change. Measured local wait improved 630s→589s (−41s) with coverage retained (ADR 0010). Remaining candidates (unique multi-step agent-launch* poles; story-review*) stay recorded learning for a later measured pass when local wait is again the priority; leave SEED-171/173 closed without new local-wait evidence.

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
  (→ `playwright test --config dashboard/playwright.config.ts`)
- **Runner conditions:** default workers=8 (`availableParallelism()`/2 on 16
  CPUs); `fullyParallel: true`; no filter; Chromium from
  `~/Library/Caches/ms-playwright`; `env -u NO_COLOR`; proof outside
  `dashboard/test-results/`.
- **Load context:** decision ~3.91 / 4.51 / 4.76; no competing owned dashboard
  suite; post-run ~7.6 / 13.2 / 10.9 from the suite.
- **Wall / cases / terminal:** 630 s shell (`terminal.durationMs` ≈ 629.3);
  `selectedCount` 1741 all `passed`; `phase: "completed"`, strict/runner
  `passed`, exit 0. Successful baseline.
- **Raw proof:** `/tmp/od-dashboard-baseline.B3xSoT/proof.json` (outside Git).

### Dominant-cost hypothesis (for slice 2)

Local wait is wall-bound by a near-fully utilized 8-worker run (idle gaps ≈ 0;
top 10 cases ≈ 7% of summed `durationMs`). Summed attempt `durationMs` ≈ 4324 s
vs ~630 s wall (avg concurrency ≈ 7). Journeys dominate (~3368 s / 910) over
boundary (~957 s / 831). First family: journey **`agent-launch*`** — 73 specs /
195 cases / ~770 s (~18%); poles include preparation-codex-retry 10 cases / 74 s.
Second: **`story-review*`** (95 / ~500 s). Leave SEED-171/173 closed
(`production*` ≈ 139 s only). Slice 2 targeted wasted journey cost inside
`agent-launch*` under dashboard tier guidance with measured retain-or-undo.

### Slice 2 experiment (preparation-codex-retry matrix → boundary)

- **Hypothesis:** ten nearly identical journeys over retained-preparation damage
  variants; tier guidance keeps one page path and moves variants to boundary.
- **Change (retained; slice 3 confirmed):** move ten damage cases to
  `dashboard/tests/boundary/agent-launch-preparation-codex-retry.spec.ts`; keep
  one journey for kept-start dialog / reconcile refusal (`workspace` damage).
- **Replacement proof:** boundary matrix green before journey narrow; three
  consecutive focused journey+boundary passes after (exit 0).
- **Focused BEFORE** (`692d9032…`, workers=8, `env -u NO_COLOR`): proof
  `/tmp/od-dashboard-slice2-before.prepRetry/proof.json` selecting the three
  preparation-codex journey specs plus
  `boundary/agent-launch-preparation-codex-continuation.spec.ts` — wall **19 s**
  / `durationMs` ≈ **18649**; `selectedCount` **14**; journey-retry ≈ **72.5 s**.
- **Focused AFTER** (adds replacement boundary file; after/after2/after3): wall
  **14–15 s** / `durationMs` ≈ **13647–14164**; `selectedCount` **15**;
  journey-retry **1** ≈ **6.5–7.0 s** + boundary **10** ≈ **48–50 s**
  (~25% wall; matrix worker-seconds ≈ **72.5 → ~55**).
- **Decision:** **retain** on focused gain; slice 3 confirmed the selected local
  wait. Do not claim suite speedup from focused timings alone.
- **Reassess / stop:** no further slice 2 experiments. Remaining unique
  multi-step `agent-launch*` poles (`second-server` ~65 s, orphan ~31 s,
  `ad-hoc-terminal` ~41 s) and weaker page files; `story-review*` follow-up
  only. Leave SEED-171/173 closed.

### Slice 3 confirmation (ordinary local re-run)

- **Verdict:** **measured improvement**; slice 2 retain holds; no undo.
- **Revision:** `a1703fdd59ed9c9b39d40e9e6a5e96e0464db197` (commits `692d9032`
  baseline, `a1703fdd` preparation-codex-retry boundary move).
- **Literal command / conditions:**
  `env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/od-dashboard-slice3.vQYmal/proof.json npm run test:dashboard`;
  default workers=8; `fullyParallel: true`; no filter; proof outside
  `dashboard/test-results/`.
- **Load context:** decision ~5.10 / 6.24 / 7.10 (warmer than slice 1
  ~3.91 / 4.51 / 4.76); post-run ~17.6 / 14.1 / 11.1; no competing owned suite.
- **Wall AFTER / BEFORE:** **589 s** (`terminal.durationMs` ≈ **588.7**) vs
  slice 1 **630 s** (≈ **629.3**); Δ **−41 s** (~6.5%).
- **Cases:** AFTER `selectedCount` **1742** (net +1: journey 10→1, boundary
  +10); BEFORE **1741**; 1742 finished attempts, all `passed`.
- **Strict terminal:** `phase: "completed"`, `strictStatus` / `runnerStatus`
  `passed`, exit 0. Complete measurement.
- **Family delta:** summed attempt `durationMs` ≈ 4324→4092; `agent-launch*`
  journeys 195→186 / ~770→~673 s; boundary 831→841 / ~957→~967 s.
- **Replacement-test cost (full suite):** preparation-codex-retry ≈ **74.5 s**
  (10 journeys) → ≈ **42.5 s** (1 journey ~8.0 s + 10 boundary ~34.5 s).
- **Retained behavioral proof:** one journey page-path (`workspace` /
  kept-start dialog) plus ten boundary damage variants; full suite green.
- **Rejected experiments:** **none** this pass.
- **Remaining candidates:** unique multi-step `agent-launch*` poles
  (`second-server`, orphan, `ad-hoc-terminal`); `story-review*`. Leave
  SEED-171/173 closed without new local-wait evidence.
- **Raw proof:** `/tmp/od-dashboard-slice3.vQYmal/proof.json` (outside Git).
- **Unused story alternatives:** no-gain paths (source-review 12, 27, 28.1,
  28.2, 31.2) unused; 21 / 31.1 observed.

## Learnings

- Proof JSON uses top-level `tests[]` (not `selections`); each entry has
  `attempts[]` with `startedAt` / `durationMs` / `status`.
- Default local worker count here is 8 (half of 16 CPUs); CI would use full
  parallelism — keep full-suite comparisons on the same local default.
- Near-zero inter-test idle under load means savings must cut work per case or
  case count in heavy journey families; worker-count tweaks alone are out of
  story scope for local wait unless evidence changes.
- Journey→boundary move of the preparation damage matrix cut focused wall
  ~19→~14 s and full-suite wall **630→589 s** (−41 s) at selectedCount
  1741→1742 while preserving one page-path journey; include replacement
  boundary cost in AFTER selection, and claim suite speedup only after a
  comparable full re-run (tests-only / dashboard-only; no CI-allocation
  reopen).

## Story obligations

## Plan concern review

Refinement was not needed: one outside-in outcome, existing measurement and
tier guidance reused, and the unknown dominant family is bounded by authorized
early probe slice 1. No remaining human-owned decision or architectural
conflict was identified. Slice 2's concrete experiment is intentionally
deferred to the probe result and is not a readiness block.
