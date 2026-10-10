# Recently done waits for an added project's sessions

**Identity:** SEED-123#recently-done-waits-for-added-project-sessions
**Source:** [correction story](../../seeds/SEED-123-dashboard-suite-stable-under-load.md#recently-done-waits-for-added-project-sessions),
from the execution retrospective of plan 282
(`324375f4..83d75f3e`; slice 4 at `f01ea795`).
**Prepared:** 2026-10-10 by the plan 282 retrospective in
`/Users/terryyin/git/open-dough/.worktrees/the-dashboard-playwright-suite-gives-the-same-re`
on `claude/the-dashboard-playwright-suite-gives-the-same-re`. Publication
target: `origin/main`.

## Findings (current at 83d75f3e)

- `dashboard/src/DashboardColumns.tsx:47` passes
  `sessionsSettled: launches.attemptEvidence !== "unread"`;
  `dashboard/src/agentLaunches.ts:122-127` derives that from `readsSettled`,
  which only grows, and `readAnswered`, which never resets. The effect at
  `agentLaunches.ts:167-174` asks a new sessions read when `projects`
  changes, and `dashboard/server/agentLaunches.ts:72-78` answers sessions
  only for configured projects. A project added in the page is readable
  before its sessions are known.
- `dashboard/tests/cursor-session-recovery.spec.ts:34-36`
  `test.use({ cursorSubmitPaintMs: 1_000 })` delays every paste submission
  in the file by 1 s; the fix it guards waits on an event, and
  `cursor-recover-submitted-chip.spec.ts` holds the deterministic proof.
- `dashboard/tests/support/dashboardServer.ts:158-175` registers the at-exit
  runner stop for every server but withdraws it on close only when it owns
  the machine.

Out of this correction: the unbounded Cursor keep wait after a submitted
chip (owned by SEED-129#bounded-cursor-launch-wait, plan 283 on trunk), and
the remaining acceptance work (SEED-123#dashboard-suite-passes-loaded-acceptance).

## Ordered slices

### 1. An added project's done records wait for its sessions
Type: Behavior
Status: planned
Proof: A Recently done journey (beside
`recently-done-progressive-after-sessions.spec.ts`) opens project A, adds
project B whose fake sessions place sessions at B's entries 2, 7 and 11, and
holds the sessions read asked after the change: no `done=bodies` request for
B leaves; on answer only B's ten shown stories are read. With that read
aborted, B's ten shown stories are read. Fails on the current code. The
existing after-sessions spec and the `recently-done-` group pass.

Behavior: Projects change → the gate closes until a sessions read asked
after that change ends (answered or not) → then the shown stories are read.
Record the ask that followed the latest projects change in
`agentLaunches.ts` and expose "sessions known for the current projects";
`DashboardColumns` passes it.

### 2. The suite's Cursor and runner cleanups are tightened
Type: Structure
Status: planned
Proof: With the delay shortened (about 100–200 ms), restoring the
pre-`97e0e442` `launchInstruction.ts` temporarily still fails
`cursor-session-recovery.spec.ts:62` for the chip label; with it restored,
the file passes `--repeat-each 5`. `dashboardServer.ts` withdraws the runner
stop on every close; `run-processes`, `agent-terminal-cursor-runner`, and
`cursor-` specs pass.
