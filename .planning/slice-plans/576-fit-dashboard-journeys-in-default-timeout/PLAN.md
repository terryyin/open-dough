# Fit dashboard journeys in the default timeout

**Identity:** SEED-287#fit-dashboard-journeys-in-default-timeout
**Source:** [Refined story](../../seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout)
**Source review:** [Independent commitments](source-review.md)
**Preparation:** [Historical preparation](execution-context.md#preparation-history).

## Goal and scope

[Selected story](../../seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout) owns the goal, scope and restrictions;
[retained plan summary](design-and-proof.md#source-goal-and-scope) preserves this plan's complete summary.

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
Proof: [Accepted observations](completed-slice-details.md#slice-12).
Behavior: [Original accepted flow](completed-slice-details.md#slice-12).

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

### G7. Sort times out31.110s during C03 continuation (first reported in slice11)
Reported: slice 13 — "The controlled CPU-pressure run timed out in sort and clean-source; conflict-source passed at 29.667 s, while sampled load rose from 20.38 to 32.04."
Story clause: "A flaky or environment-dependent timeout remains a defect"
Disposition: return

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
Commitment: C67, C68, Q09

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

### G16. Final launch pressure exposes four budget defects
Reported: slice 13 — "The whole launch/closure28 failed with quiet reporting, retained retry, Codex refusal/restart and execution receipt timeouts; three failed before a later hard load34.052 profile gap."
Story clause: "Dashboard journeys finish with margin inside the default 30 s case budget"
Disposition: proved by slice 13: final-validation-evidence.md retains all four repaired default/retry0 case observations at10.961/12.382/23.715/19.416s during a valid full load21.776–24.719 window; later whole28 passes, while G18 owns remaining observation budgets

### G17. Continued recovery leaves its second page without a session
Reported: slice 13 — "Repaired whole launch28 failed at responsive-session-recovery-restart.spec.ts:97: the second page still showed zero sessions after its default five-second observation."
Story clause: "Dashboard journeys finish with margin inside the default 30 s case budget and their 5 s observations"
Disposition: proved by slice 13: final-validation-evidence.md actual settlement plus controlled second-page pace; three strict normal2/2 passes and whole pressure28/28, target22.244s and unchanged default5 count5.511ms; every real restart/claim/native assertion retained


### G18. Scoped browser observations still use longer budgets
Reported: slice 13 — "The passing pressure46 retains 12 browser observations configured30s and five configured60s; cursorSessionRecovery.ts:118 actually took8.021655s, exceeding the promised five-second observation."
Story clause: "their 5 s observations"
Disposition: return
Commitment: C03

## Plan concern assessment

[Current assessment](design-and-proof.md#current-plan-assessment) and
[owned CI repair](ci-repair-evidence.md); G4/G12/G13/G14/G15/G16/G17 are settled; G1/G2/G3/G7/G8/G11/G18 remain with13; [final proof](final-validation-evidence.md).

## Trunk measurement checkpoint

The required retained-landing and trunk-only timing checkpoint is in
[execution context](execution-context.md#trunk-measurement-checkpoint).

## Execution notes

Full local gate: awake/on AC with `caffeinate -s -i` per the
[maintained sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos).
[Execution context and focused gates](execution-context.md#execution-notes) retain the complete notes.
