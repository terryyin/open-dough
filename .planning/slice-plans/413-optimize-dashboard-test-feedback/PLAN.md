# Reduce dashboard test feedback time with measured optimization

**Source:** [Selected story](../../seeds/SEED-177-optimize-dashboard-test-feedback.md#optimize-dashboard-test-feedback)
**Identity:** SEED-177#optimize-dashboard-test-feedback

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
the selected local wait unchanged. Reopening SEED-174/SEED-176 closed work as
if unfinished.

## Existing solutions and decisive premises

PFE: reuse [dough-test-optimization](../../../src/skills/dough-test-optimization/SKILL.md)
for baseline → family investigation → hypothesize/measure/retain-or-undo →
re-profile. Reuse `npm run test:dashboard` with
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` ([proof record](../../../dashboard/tests/proof-record.md)).
Reuse [dashboard test guidance](../../../dashboard/tests/README.md) and the
existing `configuredLimit` / `DOUGH_*_TIMEOUT_MS` testability pattern
(`dashboard/server/configuredLimit.ts`, `DOUGH_LAUNCH_TIMEOUT_MS`,
`DOUGH_START_TIMEOUT_MS`, `DOUGH_READ_TIMEOUT_MS`). Do not add a second
measurement framework. ADR 0010 requires evidenced worthwhile gain against a
stated baseline within coverage constraints.

Settled in this execution checkout (`cursor/dough-test-optimization-dashboard-test`
at claim `3060f8f5` on base `d87af036`):

- Ordinary local command is `npm run test:dashboard`.
- SEED-174 and SEED-176 already closed measured passes; remaining candidates
  from [dashboard test timings](../../../docs/maintainer/dashboard-test-timings.md)
  still apply.
- Slice 1 green baseline exists; see Current decisions.

## Ordered slices

### 1. Ordinary local dashboard baseline and dominant costs are recorded
Type: Behavior
Status: done
Proof: After `npm ci`, Chromium install, and `npm run typecheck:dashboard`, ran
`env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/SEED-177-optimize-dashboard-test-feedback/proof.json npm run test:dashboard`
once under default local workers (8 of 16 logical CPUs). Recorded revision,
command, runner conditions, load, wall time, case count, and terminal status.
`terminal.strictStatus: "passed"` (exit 0). Raw proof stays outside Git under
`/tmp/SEED-177-optimize-dashboard-test-feedback/`.

Behavior: Pre-condition — owned workspace ready to run the dashboard suite.
Trigger — execute the ordinary local command with a proof record.
Postcondition — successful baseline facts and dominant-cost family analysis
recorded for later experiments.

### 2. Non-owner change-wait bound is observed without a wall-clock 30s sleep
Type: Structure
Status: done
Proof: Focused before under `--workers=1`: wall **38.63 s**, non-owner attempt
**33.1 s**. Wired `changeWaitMs` through
`configuredLimit("DOUGH_CHANGE_WAIT_MS", 30_000)` and set that env to **500** only
on the two servers in
`dashboard/tests/boundary/agent-launch-change-wait.spec.ts`. Three consecutive
focused passes after: wall **10.57 / 7.70 / 7.41 s**, non-owner attempt
**~3.6 s**, all `strictStatus: passed`. Surviving proof: `changed: false` and
elapsed ≥ configured bound; production default unchanged when unset. Raw proofs
under `/tmp/SEED-177-optimize-dashboard-test-feedback/slice2/`. Suite wall claim
deferred to slice 4.

### 3. Further dominant-family cost is reduced only when still warranted
Type: Structure
Status: planned
Proof: After slice 2 reassessment, no second experiment has a comparable
removable wall-clock cost without deeper family redesign. Remaining candidates
(further `agent-launch*` poles, long production/attention journeys, touch
matrices) stay recorded for later passes. Skip further experiments before the
comparable full-suite re-profile; mark this slice done when recording that skip.

### 4. Selected local suite confirms the measured outcome
Type: Behavior
Status: planned
Proof: Re-run the same ordinary local command under conditions comparable to
slice 1's baseline (default workers, proof record, load noted). Compare wall
time and case count; include replacement tests' cost. Report measured
improvement, no demonstrated gain, or incomplete measurement.

## Current decisions

### Slice 1 baseline (successful)

- **Revision:** `3060f8f592f7ff17b944c1dfc034aa64b0442aae` (admit on
  `d87af03666930d359275041ecfef0b2989ebb4e9`).
- **Command:**
  `env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/SEED-177-optimize-dashboard-test-feedback/proof.json npm run test:dashboard`
- **Host:** 16 logical CPUs, 48 GiB RAM; Playwright default local workers = 8.
- **Load at start:** averages ~5.18 / 4.98 / 6.77.
- **Wall:** `/usr/bin/time` real **751.87 s**; `terminal.durationMs` ≈ **751.0 s**.
- **Selection:** `selectedCount` **1754**; attempts **1754** (0 skipped).
- **Terminal:** `runnerStatus`/`strictStatus` **passed**, command exit **0**.
- **Raw proof:** `/tmp/SEED-177-optimize-dashboard-test-feedback/proof.json`.

### Dominant-cost shape (from the green proof)

- Summed attempt durations ≈ **5128 s**; avg concurrency ≈ **6.8** on 8 workers.
- Heaviest single attempts: `support/productionUpdatePolicies.ts` (~54.9 s),
  `agent-launch-second-server` (~51.7 s), `agent-completion-attention` (~39.6 s),
  `boundary/agent-launch-change-wait` non-owner case (~34.6 s, literally waiting
  ≥29 s of the production 30 s bound), `agent-launch-second-server-orphan`
  (~30.9 s).
- Journey `agent-launch*` ≈ **851 s / 186**; boundary `agent-launch*` ≈ **515 s / 305**.
- First experiment targets the non-owner change-wait: reuse `configuredLimit`
  so the boundary proves “consumes the bound” against a short configured bound
  without changing the production default of 30 s.

### Slice 2 focused result and reassessment

- Focused change-wait family wall **38.63 s → ~7–10 s** (three consecutive
  passes). Non-owner case **33.1 s → ~3.6 s**.
- Retained: `DOUGH_CHANGE_WAIT_MS` via `configuredLimit`; boundary test observes
  a 500 ms bound. Product default remains 30 s.
- No second credible micro-experiment before suite re-profile; slice 3 skipped
  with Remaining candidates retained below.

### Remaining candidates (after slice 2)

1. Further journey→boundary moves inside unique multi-step `agent-launch*` poles
   (`ad-hoc-terminal`; remaining second-server cost), per dashboard tier guidance.
2. Long single journeys (`agent-completion-attention`, production policy chains)
   — only with surviving proof and measured wall-time gain.
3. Touch viewport matrices that only repeat layout branches already proved once.

## Story obligations

## Plan concern review

Slice 1 completed with a successful comparable baseline. Slices 2–4 are
authorized under that premise. No blocking plan concern remains.
