---
id: SEED-130
status: active
planted: 2026-10-11
planted_during: Terry's review of dashboard startup timeout recovery
trigger_when: Slow startup leaves a running or successfully published start waiting for manual continuation
scope: unknown
---

# SEED-130: Startup warnings and safe recovery

## Why This Matters

A developer starting work from the dashboard should receive a warning when
startup takes longer than expected and see the session start automatically when
its prerequisites finish. Recovery should explain an actual failure or an
uncertain outcome that prevents a safe next action.

On 2026-10-11, Pygardon's execution start for
`SEED-104#story-wrapped-interrupt-test-trustworthy` and refinement start for
`SEED-069#story-candidate-exclusion-cohesion` exceeded the two-minute startup
wait. Concurrent updates to origin/main required publication retries. The
dashboard settled both attempts as uncertain while their scripts continued;
late successful publication retained the assignments but did not proceed to
native session launch. Both sessions were subsequently recorded as launched.

Terry selected the rule that elapsed time changes urgency while verified facts
determine whether startup can proceed, and asked to queue this work first.

## Alternatives and Decision

- **Increase the overall waiting limit:** postpones the same detached-start
  failure whenever a valid startup exceeds the new limit.
- **Require Continue after every slow start:** preserves the current manual
  recovery burden even when the existing worker finishes successfully.
- **Warn while the owned attempt continues, and recover from evidence when an
  operation actually stops:** selected. Keep operation deadlines and bounded
  retries, with explicit failure and integrity boundaries.

## Selected Story

<a id="slow-startup-safe-recovery"></a>

### Slow startup continues automatically and unsafe outcomes stop safely

**Identity:** SEED-130#slow-startup-safe-recovery
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer starting execution or refinement from the dashboard
and returning to an interrupted or slow startup.

**Goal:** A slow but safely running startup warns and completes its authorized
session launch automatically. An actual interruption or failure exposes what is
known, checks uncertain effects, and stops only the actions that cannot safely
proceed, preserving work and durable evidence.

**Scope:** Execution and refinement startup across the supported hosts,
including the native launch and recovery boundaries they consume. Preserve the
selected request, host, model, policy, workspace, branch, and assignment identity.
Shared native recovery must retain its existing guarantees for ad hoc sessions.
This story selects observable behavior and safety rules; refinement and slice
planning determine its implementation and proof.

**Required rules:**

- The two-minute threshold raises a warning while the authoritative worker
  remains active. It never settles the attempt or detaches the session-launch
  continuation. Late success follows the ordinary success path exactly once.
- Distinguish Running (with an optional slow-start warning), Verifying outcome,
  Stopped -- retryable, and Blocked -- needs attention. Each state names the
  current step, known outcome, and applicable next action. A running attempt
  requires no manual Continue.
- Keep actual operation deadlines and bounded automatic retries. A transport
  timeout establishes neither success nor failure. Automatically reconcile
  possible effects through read-only evidence before any dependent mutation;
  unresolved evidence keeps that mutation blocked and explains what is needed.
- Reuse confirmed publication and native session identities. Check uncertain
  first-input acceptance before any resend. Missing or delayed host history
  alone does not prove that no session or input exists.
- Keep one active attempt and worker for a story across reloads and dashboard
  servers. Recovery reuses that attempt and establishes that its earlier worker
  cannot still perform effects before another worker takes over. Age alone
  does not establish that a worker has stopped.
- Persist intent before an external effect and persist its confirmed checkpoint
  before advancing to the next dependent action. A required recording failure
  preserves the known external result, stops at that boundary, and exposes the
  recording problem instead of silently advancing or repeating the effect.
- A definite failure with a known safe retry point is retryable after its cause
  is corrected. Conflicting ownership, inconsistent workspace or evidence, and
  unmet integrity requirements block further unsafe effects with a specific
  explanation. Neither case discards recoverable work or an accepted assignment.
- Optional default-checkout maintenance failure and stale dashboard observations
  remain separate from confirmed publication and do not invalidate that success
  or stop an otherwise safe session launch.

**Key examples / evaluation:**

1. Hold execution or refinement publication beyond two minutes: startup remains
   active, displays a warning, and refuses duplicate starts. Release publication:
   the assignment is recorded and one native session launches automatically,
   with no Recheck or Continue required.
2. Main advances during publication: bounded reconciliation and retry preserve
   the same attempt. A later confirmed success proceeds normally; exhausted
   retries expose the stopped operation and its actual recovery conditions.
3. A push loses its response: verify remote ownership and candidate containment.
   Confirmed publication proceeds without another claim; inconclusive evidence
   prevents dependent session launch and explains the unresolved fact.
4. A native creation or first-input request loses its response: recover the
   existing identity and input evidence. Neither a duplicate conversation nor a
   blind input resend occurs; an unresolved outcome remains explicitly blocked.
5. A native host definitively refuses launch after assignment publication:
   retain the assignment and show a retryable launch failure. After correction,
   retry resumes that assignment without another workspace or publication.
6. Required checkpoint recording fails after publication: show that publication
   succeeded and recording failed, retain recovery evidence, and perform no
   next dependent action until the checkpoint is safely retained.
7. Reload, a second dashboard server, or a server restart observes the same
   attempt. No competing worker, duplicate claim, session, or input is created.
   Recovery continues from the last confirmed checkpoint once exclusive
   ownership and the safe next action are established.
8. Another publisher owns the story, the retained workspace contradicts its
   claim, or required evidence is unreadable: preserve the affected state and
   name the correction needed before proceeding. Optional checkout-refresh
   failure or display lag after verified publication only adds its own warning.

**Depends on:** No blocking story prerequisite identified. Shared startup and
recording code does not require unrelated queued or Taken work to finish first.

**Safe stopping point:** Slow starts complete without manual intervention, and
actual failures or uncertain effects retain explicit recovery boundaries with
no duplicate assignments, conversations, or first input.

**Open questions for refinement:** The smallest changes that keep attempt
ownership and late completion attached, evidence sufficient for safe recovery
on each host, and proof of required recording and restart boundaries. This
story does not authorize implementation or select a planless approach.

## Breadcrumbs

- Terry's startup-recovery screenshot, cause investigation, rule discussion,
  and instruction to queue this story first on main and sync with origin,
  2026-10-11.
- [Agent-work launch context](SEED-052-start-agent-work-from-dashboard.md).
- [Launch start and recovery](../../dashboard/LAUNCH-START.md).
- [Dashboard agent launch](../../dashboard/AGENT-LAUNCH.md).
- [Current startup wait](../../dashboard/server/launchStart.ts).
- [Attempt ownership](../../dashboard/server/launchAttemptOwner.ts).
- [Checkpoint recording](../../dashboard/server/startRecording.ts).
- [ADR 0002: distinct authoritative facts and derived dashboard views](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
