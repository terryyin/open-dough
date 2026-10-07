---
id: SEED-120
status: active
planted: 2026-10-07
planted_during: Terry's request to recover dashboard-launched Cursor sessions after the computer restarts
trigger_when: A computer restart or crash ends the Cursor runner while a dashboard-launched Cursor session still has unfinished work
scope: story
---

# SEED-120: Cursor session restart recovery

## Why This Matters

A dashboard-launched Cursor agent runs as a terminal child of the per-machine
Cursor runner. A computer restart ends the runner, and the agent ends with it.
Nothing starts either again, so the session's card only says the runner is not
running. The developer then has to notice the stopped work, find its worktree,
and restart it by hand, even though the session's Cursor chat ID, worktree, and
plan are all recorded.

## Story

<a id="cursor-session-restart-recovery"></a>

### Recover a Cursor session after the computer restarts

**Identity:** SEED-120#cursor-session-restart-recovery
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer whose dashboard-launched Cursor session stopped
because the computer restarted before its work finished.

**Goal:** After the restart, the dashboard shows that the session's agent is
gone rather than of unknown state, and the developer can recover it so the work
continues in the same worktree and branch until its plan finishes.

**Scope:** Distinguish a session whose agent ended with the runner from one the
runner still holds. Offer recovery for an unfinished session. Prefer resuming
the recorded Cursor chat itself, so the agent keeps its conversation. When the
chat cannot be resumed, start a new Cursor agent in the same worktree and
branch, instructed to continue the recorded work (for example, resume the plan
execution) from the worktree's current state. Preserve the session's identity,
assignment, and attention reporting across recovery. Do not resume work
automatically without the developer asking, and do not start a second agent
for a session that is still running.

**Key examples / evaluation:**

1. A Cursor session is executing a plan in its worktree. The computer restarts
   and the dashboard starts again → the card says the agent stopped with the
   runner and offers recovery, instead of an unknown state.
2. The developer recovers it and the recorded chat can be resumed → the same
   Cursor conversation continues in the same worktree and carries on with the
   plan.
3. The recorded chat cannot be resumed → a new agent starts in the same
   worktree and branch, picks up the plan from the committed and uncommitted
   state there, and finishes it.
4. A session whose agent the runner still holds offers no recovery.

**Open questions for refinement:** Whether `cursor-agent --resume <chatId>`
restores a chat after a restart in practice (today, opening the terminal of a
session the runner does not hold already starts the recorded `--resume`
continuation implicitly, but nothing confirms the result or offers it as
recovery); how to tell finished from unfinished work; whether a lost first
prompt (first input still uncertain) needs its own handling; and whether the
same recovery should later extend to Claude and Codex sessions.

**Depends on:** No blocking story prerequisite.

**Safe stopping point:** The dashboard shows a stopped session and recovers it
through one path, either chat resume or a fresh continuation agent, before the
other path is added.

## Breadcrumbs

- Terry's request on 2026-10-07 to capture this at the top of the backlog.
- Runner and agent lifecycle: `dashboard/server/hosts/cursor/runnerProcess.ts`
  (detached runner), `dashboard/server/hosts/cursor/terminal.ts` (agent as the
  runner's PTY child), `dashboard/server/hosts/cursor/launch.ts` (recorded chat
  ID and `--resume` continuation), and
  `dashboard/server/hosts/cursor/terminalAttachments.ts` (continuation spawn on
  attach).
