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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/418-keep-running-cursor-sessions/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"69f68eb457299a2094901e7fa82475490846980d6c3a11f3ebf3d50e5b3589a4","plan":"cc575432c7777c40fcc02706cc4d8189486e2ca6b179520ce7a51dfc693a5d86"}}
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
- Evidence (code, verified in this refinement):
  - `spawnHelperReady` in `dashboard/server/hosts/cursor/runnerCurrent.ts`
    treats an answering runner as not current when its recorded
    `spawnHelper` path is missing from disk, even when address and wire
    `buildId` both match the dashboard that would start now.
  - `ensureCurrentCursorRunner` then `stopCursorRunner`s that runner and
    spawns a replacement. Observation and `ensureCursorRunner`
    (start-if-absent) do not replace.
  - `stopCursorRunner` sends SIGTERM. The runner's SIGTERM handler calls
    `attachments.close()`, which hangs up every held client.
  - `scripts/watch-dashboard.mjs` retires the old deployment checkout and
    calls only `ensureCursorRunner`; the update alone does not hang up
    held agents. The next new Cursor work path goes through
    `currentCursorRunnerPort` / `ensureCurrentCursorRunner` and does.
  - `dashboard/tests/cursor-runner-replacement.spec.ts` and
    `dashboard/tests/boundary/cursor-runner-restart-shapes.spec.ts`
    specify that a third launch / first real launch replaces a stale-proof
    runner and that held sessions then read as not running. That specified
    result is the defect relative to this story.
- Evidence (incident timeline, from the 2026-10-30 report; not re-read from
  the retired checkouts in this refinement): the production update deleted
  the checkout that held the previous helper; the replacement hung up the
  earlier agents. The report said `dashboard/server` was identical between
  those two deployments. That sameness is not required for the mechanism:
  a missing helper alone fails `spawnHelperReady`.
- Live observation during this refinement (2026-10-30): the machine's
  `cursor-runner.json` named a live runner whose `spawnHelper` under
  deployment `2cb0dade4a53-KDjOnC` was still on disk. The helper-gone
  recurrence condition was not present at that moment; the next production
  retirement of that checkout would recreate it.
- Gaps: the previous runner's address was not captured at the moment of the
  14:13 stop. The mechanism does not depend on that capture.
- Acceptance examples: the three key examples above.

**Architecture:**

- Responsibilities implicated: `ensureCurrentCursorRunner` currently couples
  "this dashboard can open a new Cursor terminal on the current install" with
  "stop the answering runner and hang up every client it still holds" whenever
  recorded helper proof fails, including helper-gone after checkout
  retirement. The production watcher owns deleting retired deployment
  checkouts without signaling the runner. Holding and hanging up clients
  stays with the machine-local Cursor runner.
- Qualities: continuity of already-held Cursor agents across a production
  dashboard update and a later new-session start; ability for new Cursor
  work to use a current install's terminal helper.
- Relevant Accepted decision:
  [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  names the Sessions sidebar and its Running Cursor sessions section, and
  keeps machine-local session evidence separate from published workflow
  authority. It does not require a new session, or retirement of a
  dashboard checkout, to stop agents the runner already holds.
- [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md) and
  [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  were consulted for vocabulary and lifecycle framing; neither constrains
  this runner-replacement choice. Proposed ADR 0007 and ADR 0009 bind
  nothing here.
- No conflict with Accepted ADRs. How new work gets a usable helper without
  hanging up held agents remains an implementation choice inside the story
  (leave the answering runner, migrate clients, or another shape that meets
  the examples); this section records the concern, not an ADR proposal.

## Ordering and Scope Reduction

One story. It is the whole of this seed. Stopping here leaves the reported
loss fixed or, if the story is dropped, leaves today's behavior unchanged.

## Open Decisions

None that change the story. How the new session is started without stopping
the agents already held is an implementation choice inside the story.

## When to Surface

Terry reported this on 2026-10-30, after it had already happened more than
once. The code path remains: a production retirement that deletes the live
runner's helper, followed by a new Cursor session start, hangs up agents
that runner still holds. At refinement observation time the current helper
was still on disk; the next matching retirement recreates the condition.

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
