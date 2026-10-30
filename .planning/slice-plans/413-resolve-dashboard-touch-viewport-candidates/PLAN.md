# Collapse redundant dashboard touch viewport matrices

**Source:** [Selected story](../../seeds/SEED-178-resolve-dashboard-test-optimization-candidates.md#resolve-dashboard-test-optimization-candidates)
**Identity:** SEED-178#resolve-dashboard-test-optimization-candidates

## Request and evidence

Resolve-only triage of remaining candidates recorded under
[Local `npm run test:dashboard` pass](../../../docs/maintainer/dashboard-test-timings.md#local-npm-run-testdashboard-pass-2026-10-29--2026-10-30)
after SEED-176. No new profile or baseline was run in this pass. Reused
evidence: SEED-176 baseline at `838e533a` (~597.8 s wall, 1753 cases);
post-wait-move focused family improvement for `agent-launch-second-server`;
full-suite wall speedup not demonstrated under comparable load. Candidate 3
named touch viewport matrices that only repeat layout branches already proved
once.

## Goal and scope

Preserve behavioral coverage while removing redundant phone/tablet (and nested
landscape) repeats of the same touch interaction when dashboard test guidance
already requires one proof per CSS branch / unique state change. Plan cheaper
replacement/removal and verification; do not implement in the resolve pass.

**Exclusions:** Product behavior changes. Profiling or optimizing in resolve.
Thinning unique multi-step `agent-launch*` poles already dispositioned as
necessary-cost. Thinning `agent-completion-attention` / production-watcher
chains while their confidence trade-off remains a human decision. Claiming
speedup from fewer cases alone without comparable wall-time proof at execution.

## Developer outcome

After authorized execution of this plan, redundant touch viewport matrix cases
are gone or narrowed with surviving proof named, and a comparable local
measurement shows whether the selected `npm run test:dashboard` wait improved.

## Preserved promises

- Layout rules remain proved once per genuine CSS / container branch.
- Touch journeys that own a unique state change (rotation preserving draft,
  session choice, settings recovery, terminal attachment) keep one
  representative integrated proof of that change.
- No focus/only markers; no retries/sleeps/skips to mask flakes.

## Baseline (resolve-only handling)

Comparable ordinary-local baseline for the touch family and, before delivery,
for `npm run test:dashboard` under ADR 0010 like conditions is a **prerequisite
slice for later execution**. Do not run it during resolve. Reuse SEED-176
suite evidence only as historical context; execution must establish its own
comparable before/after pair.

## Family analysis

**Responsibility:** touch interaction proof across launch/settings/session/
terminal surfaces that currently loop `launchTouchViewports` (phone + tablet
portrait, often with nested landscape rotation).

**Members (matrix consumers):**
`agent-launch-dialog-touch.spec.ts`,
`agent-launch-start-session-touch.spec.ts`,
`agent-terminal-touch.spec.ts`,
`session-management-touch.spec.ts`,
`sessions-sidebar-touch.spec.ts`,
`story-review-touch.spec.ts`,
`story-review-mark-touch.spec.ts`,
`system-settings-project-management-touch.spec.ts`,
`system-settings-terminal-touch.spec.ts`.

**Shared cost:** each extra viewport repeats full preview-server journey setup
for the same interaction. Guidance:
[Where a check goes](../../../dashboard/tests/README.md#where-a-check-goes) —
prove a layout rule once per CSS branch; do not write a matrix of widths over
one static layout.

**Hypothesis:** several phone/tablet pairs only re-hit the same branch; keeping
one representative per genuine branch (plus rotation where rotation is the
state change) removes redundant cases without losing fault detection or
user-value clarity.

## Ordered slices

### 1. Recorded candidates are dispositioned without profiling
Type: Structure
Status: done
Proof: `docs/maintainer/dashboard-test-timings.md` Remaining candidates lists
only the pending long-journey human decision; necessary-cost and this plan's
replacement obligation are recorded under Resolved (2026-10-30 resolve); this
plan's Current decisions name all three dispositions. No profile or baseline
command was run in resolve.

Enables: Later authorized execution of touch-matrix replacement slices.

### 2. Comparable touch-family and suite baselines are recorded
Type: Behavior
Status: planned
Proof: Under ADR 0010 like conditions, record wall time and case counts for
(a) the focused touch-matrix family command covering the members above and
(b) `env -u NO_COLOR npm run test:dashboard` (or the project's ordinary local
proof-record form). Name revision, workers, load, and raw proof path outside
Git.

Behavior: Pre-condition — authorized execution checkout ready.
Trigger — run the focused family and ordinary local suite for baseline.
Postcondition — comparable baseline facts are recorded in this plan before any
case removal.

### 3. Redundant touch viewport repeats are classified and collapsed
Type: Structure
Status: planned
Proof: For each matrix consumer, cite whether phone vs tablet (and nested
landscape) exercises a distinct CSS branch or unique state-changing
interaction; keep one representative per genuine branch; remove or narrow
redundant repeats; name surviving proof for each removed case (sibling journey
or boundary). Focused family tests pass.

Enables: Slice 4's measured confirmation.

Behavior: Pre-condition — Slice 2 baseline recorded; classification written in
Current decisions or Learnings.
Trigger — edit the matrix consumers to drop redundant viewports only.
Postcondition — every removed case has a named surviving proof; unique
interaction poles remain.

### 4. Focused family and ordinary local suite confirm the outcome
Type: Behavior
Status: planned
Proof: Re-run the Slice 2 focused family command and `npm run test:dashboard`
under comparable conditions. Retain only when wall time improves (or record
rejected experiment and undo). Update
`docs/maintainer/dashboard-test-timings.md` with before/after facts.

Behavior: Pre-condition — Slice 3 edits in place with surviving proof named.
Trigger — comparable focused and full local re-measurement.
Postcondition — retained change shows measured local improvement with coverage
preserved, or the experiment is undone and recorded as rejected.

## Current decisions

- Resolve dispositions for the three Remaining candidates (2026-10-30;
  human acceptance recorded the same day):
  1. `agent-launch*` poles (`ad-hoc-terminal`; remaining second-server cost) →
     **necessary-cost** (accepted). Unique dual-preview UI protection and
     immediate terminal-attachment journeys remain the protected behavior. No
     project profile-exclusion mechanism; none invented.
  2. Long journeys (`agent-completion-attention`, production-watcher chains) →
     **retain unique integrated protection**. SEED-177 may remove redundant
     variants or move detailed checks to boundary tests after establishing
     replacement proof. Where cross-step protection cannot be preserved more
     cheaply, record necessary cost. No blanket authorization to weaken
     integrated coverage.
  3. Touch viewport matrices → **this replacement plan** holds the obligation.
- Implementation of this plan is not authorized by resolve triage; a later
  instruction must authorize execution. Before implementation, coordinate
  scope with SEED-177#optimize-dashboard-test-feedback to avoid overlapping
  work.
- SEED-177 remains a separate Taken claim; do not treat this plan as that
  claim's work.

## Learnings

- SEED-176 already moved non-owner change-wait out of `agent-launch-second-server`;
  remaining second-server duration is dominated by starting a second preview
  and proving page protection across reload/project switch — not a repeated
  bound the boundary tier still owns.
- Nine journey specs loop `launchTouchViewports`; that is the concrete family
  for candidate 3.
