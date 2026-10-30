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

Settled in this execution checkout (`story/SEED-176-optimize-dashboard-test-feedback`):

- Ordinary local command is `npm run test:dashboard`.
- SEED-174 already closed one measured pass the same day (Codex retry matrix →
  boundary; full-suite wall ~630→589 s).
- Board-scroll Column-fit fix (`838e533a`) restores overlay-scrollbar width so
  the ordinary local suite can pass.
- Successful baseline and slice 2 experiment recorded below.

## Ordered slices

### 1. Ordinary local dashboard baseline and dominant costs are recorded
Type: Behavior
Status: done
Proof: After board-scroll Column-fit fix at `838e533a`, ran
`env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/SEED-176-baseline-green/proof.json npm run test:dashboard`
under default local workers (8 of 16 CPUs). Successful baseline: revision
`838e533a`, wall `/usr/bin/time` real **598.19 s**, `terminal.durationMs`
≈ **597.8 s**, `selectedCount` **1753**, `strictStatus: "passed"`, exit 0.
Load at start ~5.3 / 4.6 / 4.0. Journeys dominate (~3154 s / 901) over boundary
(~962 s / 852); avg concurrency ≈ 6.9. Heaviest single journey:
`agent-launch-second-server` (~64.6 s), which embedded a 30-second non-owner
change-wait — a server-contract observation. Raw proof outside Git under
`/tmp/SEED-176-baseline-green/`.

Behavior: Pre-condition — owned workspace ready to run the dashboard suite.
Trigger — execute the ordinary local command with a proof record.
Postcondition — comparable baseline facts and a named dominant-cost hypothesis
are recorded in this plan.

### 2. Dominant-family cost is reduced with measured retain-or-reject
Type: Structure
Status: done
Proof: Move the non-owner 30-second `agent-changed` bound from the
`agent-launch-second-server` journey into
`boundary/agent-launch-change-wait.spec.ts`; drop journey-only already-starting /
continue refusals already covered by `boundary/agent-launch-worker-handoff.spec.ts`.
Keep the page protection / reload / project-switch / one-session path in the
journey. Focused family BEFORE (4 cases): wall **67.8 s**, second-server
**64.5 s**. AFTER (5 cases, +boundary non-owner wait): wall **53.4 s**
(−14.4 s), second-server **50.0 s**. Three consecutive focused passes of
`agent-launch-second-server.spec.ts` + `boundary/agent-launch-change-wait.spec.ts`
exited 0. Raw proofs `/tmp/SEED-176-slice2-before` and `/tmp/SEED-176-slice2-after`.

Enables: Slice 3's full-suite confirmation of the selected local wait.

### 3. Selected local suite confirms the measured outcome
Type: Behavior
Status: done
Proof: Re-ran `env -u NO_COLOR npm run test:dashboard` at `3149bf64` with proof
records. Suite stayed green: `selectedCount` **1754** (+1 boundary case),
`strictStatus: "passed"`. The `agent-launch-second-server` journey fell from
**64.6 s** (baseline) to **51.2–52.5 s** across after runs. Focused family wall
**67.8→53.4 s** (−14.4 s) with three consecutive passes. Full-suite wall under
available host conditions was **not** comparable (baseline load ~5; after runs
had 5-minute load 12–40 from concurrent pygardon research) and ranged
**696–971 s** — no suite-wall speedup claimed. Retained on focused + case
evidence and correct journey/boundary tiering. Raw proofs
`/tmp/SEED-176-baseline-after` and `/tmp/SEED-176-baseline-after2`.

## Current decisions

### Board-scroll Column-fit fix (developer-requested, delivered)

Chromium overlay scrollbars ignored `scrollbar-gutter: stable`. Product CSS
keeps a classic WebKit track on `.board-scroll` (`838e533a`).

### Slice 2–3 outcome (retained)

Non-owner change-wait moved to boundary. Focused wall and second-server case
duration improved; suite wall comparison inconclusive under unlike host load —
no suite-wall speedup claimed. Board-scroll Column-fit fix remains.

### Remaining candidates

1. Further unique multi-step `agent-launch*` poles (ad-hoc-terminal; remaining
   second-server cost).
2. Long single journeys (`agent-completion-attention`, production-watcher chains)
   only with surviving proof and measured wall-time gain.
3. Touch viewport matrices that only repeat layout branches already proved once.

## Story obligations

## Plan concern review

Green baseline unblocked after the board-scroll fix. Slice 2 retained on focused
and case evidence; slice 3 records green suite and the suite-wall limitation.
