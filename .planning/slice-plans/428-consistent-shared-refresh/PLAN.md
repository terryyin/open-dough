# Keep shared refresh answers consistent with what each viewer shows

**Identity:** SEED-202#consistent-shared-refresh
**Source:** [Correction story](../../seeds/SEED-202-bounded-dashboard-refresh.md#consistent-shared-refresh)

## Provenance and findings

This correction comes from the execution retrospective of
`SEED-202#bounded-dashboard-refresh`, plan
[426](../426-bounded-dashboard-refresh/PLAN.md). The reviewed commits are
`bd5a9094`, `218b8d92`, `2d8118db` and `e01504b0`, plus the CI repair
`d4190ce4`. A fresh reviewer read the net `7ad60a6f..e01504b0` dashboard diff
against that story. These findings stood at `e01504b0`:

1. **Stale view behind an unchanged answer.** `dashboard/src/agentLaunches.ts`
   updates `heldRevision` only from the polled full answer. Other paths change
   records or facts and keep it: `launchRecordActions.ts` `readSession`
   (`setFacts`, `replaceRecord`), and the done, read, stop, recover and delete
   actions. If the machine's body returns to the held revision (A → B → A),
   the poll answers `unchanged` and the page keeps state B. Before the shared
   observation, every 15 s full answer re-synchronized the page.
2. **The settings view still downloads the full answer.**
   `FeedbackMaintenanceSettings.tsx` `useMaintenanceState` calls
   `readMachineSessions()` with no revision every check interval, to read
   `feedbackMaintenance` only. That is about 9 MB per pace on this machine.
3. **Cursor joiners can miss a new record.**
   `hosts/cursor/heldSessions.ts` keys the shared read by `[home]` only. A
   joiner (recover admission, `observeCursorSessions`) whose Cursor record was
   written after the read began gets a match against the earlier records. Its
   record is then labeled not running until the next poll.
4. **File identity is represented twice.** `machineJsonStore.ts`
   (`sameIdentity`) and `machineSessionObservation.ts`
   (`machineDocumentsIdentity`, plus the `machineJsonReplacements()` counter)
   each define machine-document identity. The observation module knows the
   directory layout.
5. **Documentation is out of date.** `dashboard/AGENT-LAUNCH-HISTORY.md`
   (lines 8–9 and 163–165) still says servers read the file afresh, and does
   not describe the shared observation.

## Preserved promises and constraints

Every promise of `SEED-202#bounded-dashboard-refresh` stays as it is: the
1 s settled reuse for machine sessions, join-in-flight-only Cursor reads, a
revision equal to the hash of the shared body, the 30 s wait with a retryable
503, and parse reuse. ADR 0008 still applies: shared state is disposable and
in memory. An explicit re-read getting a settled result up to 1 s old is
within that story's decided window, so this correction does not change it.

## Outside-in proof

| Finding | Owner | Observable proof |
| --- | --- | --- |
| 1 | Slice 1 | UI spec: the page holds revision A. An action's answer (for example a session re-read after attaching to a done record) changes a session to B. The machine then returns to A. The next poll returns the full answer and the page shows A. Mutation: keeping the held revision makes the spec fail. |
| 2 | Slice 1 | UI spec: with the settings view open on a quiet machine, a second check's sessions response is the unchanged answer (under 1 KiB) and the feedback-maintenance row stays shown. |
| 4 | Slice 2 | Existing sharing, unchanged-answer and records-replaced specs stay green with one exported store revision. A unit check: the revision changes on this server's write and on another process's rename replacement. |
| 3 | Slice 3 | Boundary spec using `cursorRunnerHeldReads.ts`: a Cursor record written while a held read is outstanding is labeled from a read that includes it, and overlapping asks under unchanged documents still share one runner read. |
| 5 | Slice 3 | Documentation read against the code. |

## Decisive premises

Findings 1 and 3 rest on code reads at `e01504b0`, at the cited lines. Each
slice's first test shows the defect failing for the right reason before the
fix. If a premise does not reproduce, that slice stops and reports it.

## Slices

### 1. A viewer holds a revision only for the state it shows
Type: Behavior
Status: planned
Proof: the finding 1 and 2 UI specs; `agent-launch-session-state-pace.spec.ts`,
the `feedback-maintenance*` specs and `agent-terminal-done-reopen.spec.ts`
green.

Behavior: A change made outside the poll clears the page's held revision, so
its next poll is answered in full. The settings view's check sends its held
revision and keeps its state on an unchanged answer.

### 2. One machine-document revision owned by the store
Type: Structure
Status: planned
Proof: the slice 2 shared-observation specs, `agent-launch-sessions-unchanged`
and `agent-launch-records-replaced` green; the store revision unit check.

Structure: `machineJsonStore.ts` exports one machine-document revision, made of
this server's write count and the identity of each machine document.
`machineSessionObservation.ts` keys on it, and its own identity code goes.

### 3. Cursor joiners share only reads of the same documents, and docs match
Type: Behavior
Status: planned
Proof: the finding 3 boundary spec; `cursor-runner-sessions*.spec.ts` and
`cursor-session-classification.spec.ts` green.

Behavior: The shared Cursor held-session read is keyed by home and the store
revision. A reader arriving after a launch-record write gets a read that
includes that record. `AGENT-LAUNCH-HISTORY.md` describes the current read
and refresh behavior.

## Current decisions

- Finding 1's fix clears the held revision rather than adopting each action's
  answer as a new revision. That costs one full answer after an action, the
  same as before the shared observation.

## Plan review

Each slice has one outcome and its own proof loop. Slice 3 uses slice 2's
revision. No slice changes a promise of the source story.
