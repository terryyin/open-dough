---
id: SEED-130
status: active
planted: 2026-10-11
planted_during: Terry's review of dashboard startup timeout recovery
trigger_when: Slow startup leaves a running or successfully published start waiting for manual continuation
scope: medium
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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/299-slow-startup-safe-recovery/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"61342a396280854a14696c08fab5dfb2ba5722d2b1edf683853876d193600dd8","plan":"a94aa74d965a369526dd41b0c650e67d28f65e5ed08ed10b64303291670f30bc"}}
```

**Beneficiary:** A developer starting execution or refinement from the dashboard
and returning to an interrupted or slow startup.

**Goal:** A slow but safely running startup warns and completes its authorized
session launch automatically. An actual interruption or failure exposes what is
known, checks uncertain effects, and stops only the actions that cannot safely
proceed, preserving work and durable evidence. Elapsed time changes urgency;
verified facts decide whether startup proceeds.

**Scope:**

Required behavior:

- The two-minute start wait no longer settles the attempt. When the installed
  start script is still running at the threshold, the attempt stays unsettled
  and owned, the story's card stays protected, and its startup status adds a
  slow-start warning naming the elapsed time and the kept workspace and
  branch. No Recheck or Continue is offered for it, and another start of the
  story is still refused. The threshold stays `DOUGH_START_TIMEOUT_MS`
  (default two minutes), now the warning threshold.
- When the script finishes after the threshold, the attempt proceeds exactly
  as an in-time finish: a refusal stops with that answer; an established start
  records its publication receipt and launches one native session, keeps the
  launch record, and removes the kept start. Nothing about late completion
  creates a second announcement, workspace, or session.
- The attempt record names its current step and its worker, the process
  performing that step: the start script's process while the script runs,
  then the dashboard server launching the native session. A page served by
  any dashboard server, after a reload, project switch, or server restart,
  shows an attempt whose recorded worker is verifiably alive as running,
  with the same warning once past the threshold, and offers no Continue.
  Age alone never settles an attempt or ends its worker; only observed worker
  death does. An attempt whose worker is dead and whose outcome is unsettled
  is interrupted, the existing needs-reconciliation path with Recheck and
  Continue.
- Before each dependent external effect, the preceding checkpoint is retained
  in this machine's attempt store. When the publication receipt of an
  established start cannot be kept, no native session launches: the attempt
  stops as a retryable launch failure that says publication succeeded and
  names the recording problem and file, keeps its workspace, branch, and
  assignment, and is resumed by Continue, which runs the kept request again
  so the installed script answers `existing` or continues the preparation
  and the receipt is kept before the launch. Continuing an attempt whose own
  launched session this machine already records settles it as launched and
  starts nothing.
- Documentation of launch start and startup handoff describes the warning,
  the worker, and the recording boundary.

Preserved guarantees (not rebuilt, must still hold): the installed scripts'
bounded publication retries, suffix reconciliation, and lost-response
verification inside one attempt; refusal of a story's second start while an
attempt is unresolved; the existing Recheck verification against this
machine's launch records and the host's session listing; Continue through the
installed command's `continue` and `existing` answers; the thirty-second native
launch deadline with abort; and the shared native recovery for ad hoc and
pending-input sessions.

Deferred, not committed here: automatic continuation of an interrupted attempt
after a server restart (it stays a manual Continue once the earlier worker is
dead); a way to cancel a running start from the dashboard; changes to the
installed scripts' own retry limits; and a new vocabulary for the existing
recovery states. The seed's four states map onto what exists: Running is the
progressing startup with the optional warning, Verifying is Recheck in
progress, Stopped - retryable is a failed launch with a kept start or the new
recording stop, and Blocked - needs attention is an uncertain or unresolved
attempt with its explanation.

Boundary assumptions: one-shot starts share the start path and get the same
warning and late completion without separate commitments. A worker's liveness
is judged on this machine by its process; a worker on another machine is out
of scope because attempts are per machine. A start script that never ends
keeps its attempt running with the warning until the developer ends that
process, after which the existing interrupted path applies.

**Key examples:**

1. Slow publication completes. Origin advances twice during a refinement
   start, so publication retries take three minutes. At two minutes the card
   still says "Preparing refinement…" with the moving indicator and adds the
   warning naming two minutes and the workspace and branch; Recheck and
   Continue are absent, and a second Start of the story answers
   `already-starting`. When the script answers `prepared` or `published`, the
   assignment is recorded and one Claude Code session launches; the card shows
   that session with no further action.
2. Slow start refused late. The script runs past the threshold and then
   answers `story-left-queue`. The attempt settles with that refusal exactly
   as an in-time refusal, with no session and the existing kept-start handling.
3. Second server during a slow start. The development server runs the start;
   the built preview reads the same attempt. It shows the story as starting,
   with the same warning after two minutes, and offers no Continue, because
   the recorded worker is alive. When the start finishes and the session
   launches, both servers show the launched session.
4. Server lost mid-start. The server that runs the script exits; the script
   finishes on its own. While the script process is alive, a new server shows
   the attempt as running; once it has exited with its outcome unrecorded,
   the attempt is interrupted: "Startup needs reconciliation" with Recheck and
   Continue. Continue reruns the kept request, the installed command answers
   `existing` or continues the preparation, and one session launches.
5. Publication receipt cannot be kept. After the script publishes the Take,
   `launch-attempts.json` is unwritable. No session launches. The card shows a
   retryable failure: publication succeeded as `<Agent>` in `<workspace>`, the
   receipt could not be recorded in that file. After the file is repaired,
   Continue keeps the receipt and launches one session; no second claim,
   workspace, or session is created.
6. Continue after an unrecorded outcome. The session launched and its launch
   record was kept, but the attempt's outcome write failed before a restart.
   Continue finds that record and settles the attempt as launched without
   running the start or creating a session.
7. Refresh and display lag stay warnings. Publication is confirmed and the
   session launched, but the default checkout refresh failed or the shown
   snapshot lags. The card shows the session and the existing warning for the
   refresh; nothing is settled as uncertain.

**UI:** The warning is a sentence inside the card's existing startup status,
after the phase sentence: "Still starting after 2 minutes. The start goes on
in workspace `<path>` on branch `<branch>`; its session starts when it
finishes." The Startup announcements log announces the slow start once. The
recording stop is a failed launch answer beside the Start, in the existing
place: "Publication succeeded (Taken by <Agent>, workspace <path>), but the
receipt could not be recorded in ~/.open-dough/dashboard/launch-attempts.json:
<error>. Repair the file, then Continue; nothing more was started."

**Architecture:** This story turns attempt ownership from one server's memory
into a machine fact. Today `OwnedAttempts` knows an attempt as owned only
inside the server that accepted it, and `needsReconciliation` treats
"unsettled and not owned here" as interrupted, which is wrong whenever another
live server, or the detached script, is still working. The attempt record
gains a worker (process identity plus the step it performs), written when the
script is spawned and when the server takes over for the native launch, and
cleared with the outcome. Liveness is observed, never inferred from age.
`needsReconciliation` and the page's startup model then read "running" from
the worker's liveness rather than from `owned`; `owned` remains the answering
server's right to run and change the attempt. The warning is derived on the
page from the attempt's acceptance time and the threshold, so a second server
derives it identically. Checkpoint retention follows the existing
intent-before-effect order in `launchAttemptSettlement.ts`; the change is that
a failed receipt write before the native launch becomes a stop with an
explanation instead of an in-memory answer that the store contradicts. This
keeps [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
origin stays the authority for story facts, and the attempt store stays local
evidence.

**Depends on:** No blocking story prerequisite identified.

**Safe stopping point:** Slow starts complete without manual intervention, and
actual failures or uncertain effects retain explicit recovery boundaries with
no duplicate assignments, conversations, or first input.

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
