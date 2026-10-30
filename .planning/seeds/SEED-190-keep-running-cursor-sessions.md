---
id: SEED-190
status: active
planted: 2026-10-30
planted_during: Terry's report that running Cursor sessions stop when a new session starts, then dough-bug-fixing
trigger_when: A production dashboard update is followed by a new Cursor session and other running sessions stop
scope: one story
---

# SEED-190: Running Cursor agents survive the next session start

## Why This Matters

Terry runs several Cursor sessions from the dashboard at once. On 2026-10-30,
starting one new session stopped the other Cursor agents. They disappeared
from Running Cursor sessions. They were not paused. Their `cursor-agent`
processes were gone, and five of the six transcripts ended on an assistant
message with no finished turn.

The conversations remain as launch records and can be Recovered. Recover
starts them again. It does not mean they kept working.

## Alternatives and Decision

Keep the agents that are already running when another Cursor session starts,
including after a production dashboard update has removed the checkout that
held the live runner's terminal helper.

The smallest change that might cover the reported case is to stop treating a
deleted helper file as a reason to stop a runner that is still holding
agents, when the runner code the new dashboard would start is unchanged.
Another sufficient shape is to start the new session without hanging up the
runner that already holds agents. This story does not choose the shape.

Assumption: Recover is not a substitute for an agent that was still running.

## Story Decomposition

<a id="keep-running-cursor-sessions"></a>

### Starting another Cursor session leaves already-running agents running

**Identity:** SEED-190#keep-running-cursor-sessions
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Terry can start another Cursor session from the dashboard, including
after a production dashboard update, and the Cursor agents that are already
running keep running.

**Scope:**

- Required behavior: Agents a live Cursor runner is already holding stay
  running when another Cursor session starts. That includes the case where a
  production dashboard update has deleted the checkout that contained that
  runner's terminal helper and left the runner process answering. The new
  session starts. Running Cursor sessions lists the agents that are still
  held, including the earlier ones and the new one. An explicit stop of one
  session stops that session and leaves the others running. A runner that has
  already exited is not brought back; its agents are already stopped.
- Scope limits: Do not resume the six sessions already stopped on 2026-10-30.
  Do not require retired deployment checkouts to remain on disk. Do not
  prescribe whether the new session joins the existing runner or a separate
  one.
- Boundary assumptions: "Already running" means the runner still holds that
  session's client. A saved launch record whose client is already gone is
  not still running.

**Key examples:**

- Several Cursor agents are held and working. A production dashboard update
  then deletes the checkout that contains that runner's terminal helper. The
  runner is still answering and still holds those agents. Starting another
  Cursor session leaves the earlier agents running and listed under Running
  Cursor sessions, and the new session is running too. None of the earlier
  agents is hung up.
- The same held agents are running, and the developer stops one of them.
  That session stops. The others keep running.
- The runner process has already exited. Starting a Cursor session does not
  recreate the clients that died with it. The new session can still start.

**Report:**

- Expected: updating the dashboard and then starting one new Cursor session
  leaves the agents that are already running alone.
- Actual: on 2026-10-30 at 14:13 local time, starting "Open Dough ·
  Refinement · Load more diff context from the line-number gutter" replaced
  the Cursor runner. The replacement hung up every client the previous
  runner held. Only the new `cursor-agent` (pid 49368, child of runner pid
  44422, started 14:13:54 from deployment `84d56f780c87`) was alive afterward.
  The other six open Cursor launch records had no `cursor-agent` process.
  Their transcripts stopped by 14:12:43. Five ended on an assistant message.
  The pytest session had already finished a turn at 13:19 and was then hung
  up with the rest.
- Evidence: `ensureCurrentCursorRunner` stops an answering runner whose
  published terminal helper is no longer on disk, then starts another.
  `stopCursorRunner` sends SIGTERM. The runner's SIGTERM handler hangs up
  every held client with SIGHUP. The production watcher deletes the retired
  checkout and does not signal the runner. `dashboard/server` is identical
  between the retired checkout `4715c76a` and `84d56f780c87`, so this was
  not a new runner build. The `4715c76a` checkout is gone. The runner started
  for the refinement session published a helper under `84d56f780c87`, and
  that file was already gone after the next production update. The current
  replacement proof expects the hung-up sessions to read "The agent is not
  running." That specified result is the defect.
- Gaps: the previous runner's address file was not read before it was
  replaced, so its recorded build id and helper path were not captured at
  the moment of the stop. The cause is the code path together with the
  process timeline, the deleted checkout, and the identical runner code.
- Acceptance examples: the three key examples above.

**Architecture:**

- Relevant Accepted decision:
  [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  names the Sessions sidebar and its Running Cursor sessions section. It
  does not require a new session, or retirement of a dashboard checkout, to
  stop agents the runner already holds.
- No conflict with Accepted ADRs.

## Ordering and Scope Reduction

One story. It is the whole of this seed. Stopping here leaves the reported
loss fixed or, if the story is dropped, leaves today's behavior unchanged.

## Open Decisions

None that change the story. How the new session is started without stopping
the agents already held is an implementation choice inside the story.

## When to Surface

Terry reported this on 2026-10-30, after it had already happened more than
once. The same condition is in place again: the live runner's helper file
is gone, so the next new Cursor session would stop the agent it still holds.

## Breadcrumbs

- Report and process evidence from 2026-10-30, gathered before this story.
- `dashboard/server/hosts/cursor/runnerCurrent.ts`
- `dashboard/server/hosts/cursor/runnerProcess.ts`
- `dashboard/server/hosts/cursor/runnerMain.ts`
- `scripts/watch-dashboard.mjs`
- `dashboard/tests/cursor-runner-replacement.spec.ts`
- Completed
  [SEED-161](../done/SEED-161_cursor-runner-keeps-its-terminal-helper.json),
  which published the helper path so new work can see that a later install
  removed the file.
