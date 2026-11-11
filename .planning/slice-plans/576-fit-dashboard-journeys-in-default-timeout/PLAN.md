# Fit dashboard journeys in the default timeout

**Identity:** SEED-287#fit-dashboard-journeys-in-default-timeout
**Source:** [Refined story](../../seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout)
**Source review:** [Independent commitments](source-review.md)
**Preparation:** owned workspace
`/Users/terryyin/git/open-dough/.worktrees/make-dashboard-journeys-fit-the-default-timeout`,
branch `cursor/make-dashboard-journeys-fit-the-default-timeout`, starting
revision `673002452f18b7fc7a9427f7a6db662b63c8b0b7`. This plan authorizes no
execution.

## Goal and scope

Maintainers and agents get the same dashboard suite result under usual parallel
load and in hosted CI without case-local timeout allowances. Named overdue
journeys finish with margin inside the default 30 s and their 5 s observations;
temporary allowances for touch review, production-deployment,
agent-completion-recovery, watcher policy-repair, and retired closure are
removed only after each case fits. The watcher family is at least 10 s faster
in median elapsed time including moved work; the comparable local dashboard
suite and the slowest hosted shard stay within previous elapsed times. Every
distinct behavioral promise stays at an observable boundary; surviving proof is
established before deleting a test, step, or assertion.

Out of scope: SEED-286#fast-intent-ci-comparison-tests; infrastructure
acquisition; unrelated branch defects; the separate collector lock repair;
unnamed case-local allowances (including recently-done ad-hoc session and
Intent timing-history journeys) unless a harness change this story makes must
keep them green; raising default case or shard deadlines; sleeps, retries,
skips, or permanent CI jobs as the margin strategy.

## Design and proof basis

[Design, reuse decisions, premises, and proof ownership](design-and-proof.md)
retain the source promises and their current observations.

## Ordered slices

### 1. Recheck which overdue journeys and harness costs still dominate
Type: Behavior
Status: done
Proof: [Accepted observations](completed-slice-details.md#slice-1).
Behavior: [Original accepted flow](completed-slice-details.md#slice-1).

### 2. Remaining assertion races wait at their causal boundary
Type: Behavior
Status: done
Proof: [Accepted observations](completed-slice-details.md#slice-2).
Behavior: [Original accepted flow](completed-slice-details.md#slice-2).

### 3. Watcher failure keeps one live deployment; restart owns SIGHUP
Type: Behavior
Status: done
Proof: [Accepted observations](completed-slice-details.md#slice-3).
Behavior: [Original accepted flow](completed-slice-details.md#slice-3).

### 4. Repeated full-source ingestion no longer consumes the family saving
Type: Behavior
Status: done
Proof: [Accepted observations](completed-slice-details.md#slice-4).
Behavior: [Original accepted flow](completed-slice-details.md#slice-4).

### 5. One full retired closure; recovery variants at the reporting boundary
Type: Behavior
Status: done
Proof: [Accepted observations](completed-slice-details.md#slice-5).
Behavior: [Original accepted flow](completed-slice-details.md#slice-5).

### 6. Touch reading and its required cold inputs fit the default
Type: Behavior
Status: done
Proof: [Accepted observations](completed-slice-details.md#slice-6).
Behavior: [Original accepted flow](completed-slice-details.md#slice-6).

### 7. A non-owner server overlaps independent preparation
Type: Behavior
Status: done
Proof: [Accepted observations](completed-slice-details.md#slice-7).
Behavior: [Original accepted flow](completed-slice-details.md#slice-7).

### 8. Receipt and orphan recovery avoid redundant initial page setup
Type: Behavior
Status: done
Proof: [Accepted observations](completed-slice-details.md#slice-8).
Behavior: [Original accepted flow](completed-slice-details.md#slice-8).

### 9. Codex retry keeps its retained-host progress proof within the budget
Type: Behavior
Status: done
Proof: [Accepted observations](completed-slice-details.md#slice-9).
Behavior: [Original accepted flow](completed-slice-details.md#slice-9).

### 10. Cursor lifetime journeys reach their actual behavior within the budget
Type: Behavior
Status: done
Proof: [Accepted observations](completed-slice-details.md#slice-10).
Behavior: [Original accepted flow](completed-slice-details.md#slice-10).

### 11. Synthetic gh keeps its CLI contract at lower startup cost
Type: Behavior
Status: done
Proof: [Accepted observations](completed-slice-details.md#slice-11).
Behavior: [Original accepted flow](completed-slice-details.md#slice-11).

### 12. Settle comparison budgets with the preserved canonical setup
Type: Behavior
Status: done
Proof: Preserved canonical setup passes three fresh default comparison
commands, touch4/4, shared consumers23/23 and independent actual Git1/1.
Hosted comparison cases pass retry0 in runs42952620767/1 and42957320139/1;
exact full CI5e721503 passes run42963489603/1. Combined local/hosted proof
settles G7 without a new numeric threshold. Worst local body headroom remains
about .980 s; variability and all cold work stay explicit. All sort actions,
assertions/two loops and both full-CLI sources remain. No timeout, skip/retry,
cache/lifetime or waiver. See [local proof](comparison-default-evidence.md),
[hosted cases](comparison-hosted-evidence.md) and [CI repairs](ci-repair-evidence.md).

Behavior: Discard two ineffective small-data cuts → retain the canonical
three-pass implementation → repair each exposed CI defect → accept combined
local/hosted comparison proof. Named pressure/default/full/trunk gates remain
with13; this acceptance does not claim those later observations.

### 13. Named allowances removed; suite and shard margins hold
Type: Behavior
Status: planned
Proof: Remove remaining named case-local allowances, including trunk’s watcher restart allowance, only after their cases fit with margin. Comparable local dashboard suite elapsed and the slowest hosted shard stay within previous elapsed times (keep summed durations separate). Refresh shard weights from all 12 artifacts of a complete passing trunk run after removing work; measure redistribution separately. Default case and shard deadlines unchanged.

Behavior: All prior slices' retained proof is green with margin → delete the named temporary `test.setTimeout` allowances → local comparable suite and hosted slowest shard remain within previous elapsed times with refreshed weights.

## Current decisions

[Retained execution decisions and reuse basis](design-and-proof.md#execution-decisions).

## Story obligations

### G1. Required pressure proof remains due
Reported: slice 1 — "Focused measurements were below the requested load 20–30; that pressure margin is not established."
Story clause: "under local load 20–30 on 2 workers"
Disposition: receiving slice 13

### G2. Comparable local suite comparison remains due
Reported: slice 1 — "No completed comparable local baseline was found; the unchanged full-suite baseline is still running."
Story clause: "the comparable local dashboard suite and the slowest hosted shard stay within their previous elapsed times"
Disposition: receiving slice 13

### G3. Hosted margin and shard comparison remain due
Reported: slice 1 — "Only retained baseline CI is available; no implementation speedup or hosted margin has been proved."
Story clause: "on a hosted shard about 1.5× slower overall"
Disposition: receiving slice 13

### G4. Full-baseline budget defects remain owned
Reported: slice 1 — "The unchanged full baseline exposed two Intent comparison and five launch case-budget failures; no repair is claimed."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: proved by slice 12: launch-evidence.md and comparison-default-evidence.md retain targeted repairs; exact full CI5e721503 passes run42963489603/1; final named pressure and local whole-suite proof remain in13

### G5. Cursor recovery records are not observed before the case deadline
Reported: slice 1 — "Cursor runner helper-survival and replacement-controls both timed out in launchSecondHeldSession while polling absent launch records; diagnosis is pending."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: proved by slice 10: cursor-evidence.md; real scoped/Default execution preconditions, surviving UI11/11 and three complete default4/4 lifetime passes after path-alias repair; pressure/hosted/full-suite remain in13

### G6. Comparison experiment must retain the private local checkout (first reported in original slice 3)
Reported: slice 11 — "switching to dashboardTest alone made completion recovery return “spawn git ENOENT” because server HOME lacked home/git/open-dough."
Story clause: "Preserve every distinct behavioral promise at an observable boundary."
Disposition: proved by slice 11: rejected cache paths removed; original preparationPage/StartOrigin private checkout restored, with exact source/Proof observations in the paired-before three-case pass at /tmp/seed287-slice3-20261110-2107/pair-before-proof.json

### G7. Controlled-pressure comparison budgets remain unproved
Reported: slice 11 — "The controlled CPU-pressure run timed out in sort and clean-source; conflict-source passed at 29.667 s, while sampled load rose from 20.38 to 32.04."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: proved by slice 12: comparison-default-evidence.md three valid pressure/default3/3 passes, preserved canonical setup and .980s worst local headroom; comparison-hosted-evidence.md retry0 hosted cases and exact full CI5e721503 run42963489603/1 settle the combined proof

### G8. Trunk restart allowance still needs hosted default margin
Reported: slice 3 — "Trunk commit 2a2038247 added a 90 s restart/SIGINT allowance after hosted install/build took 27.3 s before shutdown; the execution branch still uses the default."
Story clause: "the watcher family's first-in-worker `beforeAll` and restart/policy-repair paths"
Disposition: receiving slice 13

### G9. Watcher consolidation alone did not earn the required saving
Reported: slice 3 — "Three alternating pairs passed 32/31 cases, but median shell elapsed 141.456 to 136.089 s saved only 5.367 s nominally, below 10 s and affected by host variance."
Story clause: "the watcher family gets at least 10 s faster in median elapsed time"
Disposition: proved by slice 4: three strict-passing original32/changed31 pairs measured median complete shell156.893714 to136.400577s (20.493137s saving), including cold first-demand preparation3.532/3.352/3.461s; all moved work and load qualifiers retained in source-ingestion-evidence.md

### G10. Touch width alone misses the pressure budget
Reported: slice 6 — "At measured load21.042–26.039, phone reading took37.715s under its60s allowance and default-budget phone rotation timed out at31.504s; width reduction alone does not fit."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: proved by slice 6: touch-evidence.md accepted worker-input implementation; three actual default30s four-case passes at load20.629–25.571 and desktop5/5, all moved setup included; hosted/full-suite proof remains in13


### G11. Current trunk has thirteen complete timing parts
Reported: slice 11 — "Incoming c73b4d00d applies Terry-approved thirteen dashboard shards while this source still names twelve timing artifacts."
Story clause: "Refresh existing shard weights from all 12 artifacts"
Disposition: receiving slice 13
Commitment: Q09

### G12. Published transport loses streams under dash
Reported: slice 12 — "Run 42949046330/1 failed all twelve dashboard jobs; installed-client contract tests received empty stdout and stderr with the expected exit codes."
Story clause: "Preserve every distinct behavioral promise at an observable boundary."
Disposition: proved by slice 12: ci-repair-evidence.md retains portable FD3 transport with installed byte-contract and whole consumer proof; exact full CI5e721503 passes run42963489603/1

### G13. Waiting read escapes during server shutdown
Reported: slice 12 — "Run 42952620767/1 exposed one shutdown failure: a waiting seed-9 read reached GitHub while the server was closing."
Story clause: "Keep exact counts where avoiding duplicate work is the promise."
Disposition: proved by slice 12: ci-repair-evidence.md retains atomic shutdown closes read admission before aborting the real connection; peer/reconnect and installed shutdown proof; exact full CI5e721503 passes run42963489603/1

### G14. Runner interruption fixture never reaches its next child
Reported: slice 12 — "Run 42957320139/1 passed all twelve dashboard shards but test-runner-interrupt.sh timed out waiting for its never-ending child."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: proved by slice 12: ci-repair-evidence.md retains builtin readiness marker removes interrupt startup race; controlled signal and whole runner proof; exact full CI5e721503 passes run42963489603/1

### G15. Controlled attention cadence observes an early read
Reported: slice 12 — "Run 42960450409/1 expected six record reads before the paced deadline but observed seven in the installed attention-report journey."
Story clause: "Keep exact counts where avoiding duplicate work is the promise."
Disposition: proved by slice 12: ci-repair-evidence.md retains accepted launch and pending page answers settle before pacing; original and held-final-answer whole journeys pass default2/2; exact full CI5e721503 passes run42963489603/1

## Plan concern assessment

[Current assessment](design-and-proof.md#current-plan-assessment) and
[owned CI repair](ci-repair-evidence.md); G4/G7/G12/G13/G14/G15 are settled; G1/G2/G3/G8/G11 remain with13.

## Trunk measurement checkpoint

The required retained-landing and trunk-only timing checkpoint is in
[execution context](execution-context.md#trunk-measurement-checkpoint).

## Execution notes

[Execution identity, accepted revision, setup, and CI observer](execution-context.md)

- No numeric slice target or hard limit is supplied; judge boundedness by one
  proof loop and the Behavior/Structure gate above.
- Local gates: focused selections named in each slice's proof, then the
  existing local and hosted dashboard gates for slice 13; ordinary commit hooks.
  For long runs start fully awake: on AC use `caffeinate -s -i`; on battery
  plug in or keep the lid open under `caffeinate -i` and inspect sleep logs
  per [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written to every delegation and repair handoff. Shared `makeMe`
  arranges automated domain data; no sleeps, `test.slow()`, or suite/hook
  timeout overrides. Case-local timeout overrides stay forbidden except as the
  temporary allowances this story removes. Execution owns applicable local and
  published CI repairs.
- [Retained hosted baseline](hosted-evidence.md#historical-baseline); keep wall and summed case time separate.
