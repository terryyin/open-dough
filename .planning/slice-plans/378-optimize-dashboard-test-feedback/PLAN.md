# Reduce dashboard test feedback time with measured optimization

**Source:** [Selected story](../../seeds/SEED-176-optimize-dashboard-test-feedback.md#optimize-dashboard-test-feedback)
**Identity:** SEED-176#optimize-dashboard-test-feedback

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
the selected local wait unchanged. Reopening SEED-174's closed preparation-codex
boundary move as if unfinished.

## Existing solutions and decisive premises

PFE: reuse [dough-test-optimization](../../../src/skills/dough-test-optimization/SKILL.md)
for baseline → family investigation → hypothesize/measure/retain-or-undo →
re-profile. Reuse `npm run test:dashboard` with
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` ([proof record](../../../dashboard/tests/proof-record.md)).
Reuse [dashboard test guidance](../../../dashboard/tests/README.md). Do not add a
second measurement framework. ADR 0010 requires evidenced worthwhile gain against
a stated baseline within coverage constraints.

Settled in this execution checkout (`story/SEED-176-optimize-dashboard-test-feedback`
at claim `b000f8a5` on base `1a24491f`):

- Ordinary local command is `npm run test:dashboard`.
- SEED-174 already closed one measured pass the same day (Codex retry matrix →
  boundary; full-suite wall ~630→589 s).
- Slice 1 probe ran; see Current decisions. No successful baseline exists yet.

## Ordered slices

### 1. Ordinary local dashboard baseline and dominant costs are recorded
Type: Behavior
Status: done
Proof: After `npm ci` and Chromium install readiness, ran
`env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/SEED-176-optimize-dashboard-test-feedback/proof.json npm run test:dashboard`
once under default local workers (8 of 16 logical CPUs). Recorded revision,
command, runner conditions, load, wall time, case count, and terminal status.
The run is diagnostics only: `terminal.strictStatus: "failed"` (exit 1). Raw
proof stays outside Git under `/tmp/SEED-176-optimize-dashboard-test-feedback/`.

Behavior: Pre-condition — owned workspace ready to run the dashboard suite.
Trigger — execute the ordinary local command with a proof record.
Postcondition — baseline facts recorded; when the run fails, dependent
optimization slices stop until a successful comparable baseline exists.

### 2. Dominant-family cost is reduced with measured retain-or-reject
Type: Structure
Status: planned
Proof: Deferred until a successful slice-1 baseline exists (see Current
decisions). Family hypotheses from the failed proof are retained under
Remaining candidates; no experiment may claim suite speedup until slice 3 can
re-profile green.

### 3. Selected local suite confirms the measured outcome
Type: Behavior
Status: planned
Proof: Deferred with slice 2. Needs a green ordinary local re-run under
conditions comparable to a successful baseline.

## Current decisions

### Slice 1 probe (failed — not a successful baseline)

- **Revision:** `b000f8a50247d00bd55d003194123c70a6136094` (admit on
  `1a24491ffb86d91280f6cf163947c4807e944b63`).
- **Command:**
  `env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/SEED-176-optimize-dashboard-test-feedback/proof.json npm run test:dashboard`
- **Host:** 16 logical CPUs, 48 GiB RAM; Playwright default local workers = 8.
- **Load at start:** averages ~14.75 / 12.65 / 10.60 (machine busy).
- **Wall:** `/usr/bin/time` real **706.34 s**; `terminal.durationMs` ≈ **705.4 s**.
- **Selection:** `selectedCount` **1753**; attempts **1753** (0 skipped).
- **Terminal:** `runnerStatus`/`strictStatus` **failed**, command exit **1**.
- **Failure:** `dashboard/tests/board-scroll.spec.ts` — "native Board scrollbar
  width owns the Column boundary and keeps a saved position":
  `expect(room.board).toBeLessThan(1152)` received **1152** (attachment
  `{"board":1152,"page":1152,"shown":"3"}`). Reproduced three consecutive
  focused runs with `--workers=1`. Same assertion passed in SEED-174's green
  baselines earlier the same day on this host; Chromium flex +
  `scrollbar-gutter: stable` currently leaves `clientWidth` equal to the
  viewport in probes, while `height:100vh` overflow reserving ~16px still works.
- **Raw proof:** `/tmp/SEED-176-optimize-dashboard-test-feedback/proof.json`.

### Diagnostic cost shape (from the failed proof; not a baseline)

- Summed attempt durations ≈ **4828 s**; avg concurrency ≈ **6.8** on 8 workers.
- Journeys ≈ **3701 s / 901** vs boundary ≈ **1127 s / 852**.
- Journey `agent-launch*` ≈ **793 s / 186** (largest named family after SEED-174's
  Codex-retry move). Heaviest journey files include
  `agent-launch-second-server` (~66 s), `agent-launch-ad-hoc-terminal`,
  `agent-launch-second-server-orphan`.
- Other poles: `story-review*` ≈ 619 s / 122; `production-watcher*` and
  `support/productionUpdatePolicies.ts` remain expensive serial chains.

### Authorized stop

A failed ordinary local run is not a successful baseline (skill rule). Slices 2–3
cannot proceed without a green comparable full-suite measurement. This is a
**stop for the developer**: restore a green `npm run test:dashboard` on this
host (board-scroll native scrollbar width / gutter observation), then resume
this plan from a fresh successful slice-1 baseline. Do not claim local-wait
speedup from diagnostics alone. Do not change product behavior solely to make
tests faster; board-scroll may need a separate product or environment decision.

### Remaining candidates (after a green baseline)

1. Further journey→boundary moves inside unique multi-step `agent-launch*` poles
   (especially second-server / ad-hoc-terminal), per dashboard tier guidance.
2. Shared-setup cost still paid by ordinary focused runs (installed-start
   preparation) — only if local-wait evidence shows removable cost beyond
   SEED-167's closed work.
3. Long single journeys (`agent-completion-attention`, production policy chains)
   — only with surviving proof and measured wall-time gain.

## Story obligations

## Plan concern review

Slice 1 completed as an authorized early probe and found no successful baseline.
Slices 2–3 are blocked on that premise. Readiness remains not-ready until the
ordinary local suite passes under comparable conditions or the developer
changes the outcome/scope.
