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

A dashboard-launched Cursor agent is a terminal child of the per-machine
Cursor runner. The dashboard starts that runner when it becomes ready, and
the set of agents the runner holds lives only in that process. A computer
restart ends the runner and those agents. After the dashboard is up again it
starts a new runner that holds none of the recorded sessions, so each card
says the activity is unknown. The launch record still has the Cursor chat id,
the resume command, the worktree, and the assignment. The developer has to
notice the stopped work and reopen it by hand. Opening the terminal starts
the recorded `cursor-agent --resume` command, with no recovery offer and no
check that the conversation came back.

## Story

<a id="cursor-session-restart-recovery"></a>

### Recover a Cursor session after the computer restarts

**Identity:** SEED-120#cursor-session-restart-recovery
**Slice plan:** [Recover a Cursor session after the computer restarts](../slice-plans/278-cursor-session-restart-recovery/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/278-cursor-session-restart-recovery/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8bd007e1b9d2d425292f934c174bcdc93bd658a0f0f587e473e3753b1fce1d3d","plan":"2eac467f39bcc550fea7f028d693a63b2ddf822326d0a006a26174504c4287a7"}}
```

**Beneficiary:** A developer whose dashboard-launched Cursor session stopped
before its recorded work finished, including when the computer restarted.

**Goal:** Once the dashboard is up, an unfinished Cursor session whose agent
the runner does not hold shows that the agent is not running, and the
developer can recover it. Recovery continues that same launch's recorded work
in the recorded worktree, on the branch already checked out there, until that
work is finished. An execution launch continues its plan. The same Cursor
chat is resumed when it can be loaded. The published assignment and the
launch's attention reporting stay on that launch.

**Direction:** Resume the recorded chat, then continue it, and replace the
chat only when that resume cannot load it. Compared with the same goal:

- The existing terminal open already runs the recorded `--resume` command and
  confirms nothing. A card that only relabels the session still leaves the
  developer to type, and it does not start a new agent when the chat cannot
  be loaded.
- Starting a new agent every time continues the worktree and drops the chat
  even though the chat store is still on disk.
- `agent persist` on the installed CLI (`2026.10.01-e373342`) manages a
  session that survives a terminal disconnect. It does not survive the
  computer restart that kills the local process. Moving the agent off the
  machine is a different product.

Editor crash-restore is the same shape as the recommended direction, and it
is not evidence that resume works: the process is gone, the chat store
remains, and the developer confirms restore. The analogy stops where a
restored document keeps no authorship of its own. Launch already waits for
the composer before it writes the first instruction, and that composer is
also what a new empty chat shows (`Add a follow-up` or
`Plan, search, build anything`). Recovery therefore sends one continuation
instruction only when the resumed screen is that idle composer, and it
starts a replacement agent only when the resume itself reports that the chat
cannot be loaded. Whether an existing chat waits there, and whether its old
turns are present, is the planning probe below.

**Scope:**

- **Who is offered recovery.** A recorded Cursor session is unfinished when
  it is not marked done and its latest completion report is missing or
  `unfinished`. The runner is running and does not hold it, or the runner is
  not running. The card says the agent is not running in the first case, and
  keeps "The Cursor runner is not running." in the second. Both offer
  recovery. Recovery starts only when the developer uses that offer.
- **Same launch.** Recovery keeps one launch record: the same request,
  reporting reference, assignment (`start` or `preparation`), and completion
  history. Resume keeps the recorded Cursor chat id. A replacement chat
  updates that record's session id and continuation to the new id before the
  new agent is instructed, so a later completion report naming the new id is
  accepted on this launch. No second launch record is added.
- **Resume.** Recovery starts the recorded
  `cursor-agent --workspace <path> --resume <chatId>` in the runner, the
  same command the launch stored. When the screen is the idle composer and
  the first input is confirmed, it sends one continuation instruction naming
  the recorded workflow, identity, worktree, and branch, and telling the
  agent to continue that work from the worktree's committed and uncommitted
  state without opening another assignment. When the screen is working or
  waiting, it sends nothing and the developer uses the held session. The
  original first prompt is not pasted again.
- **Unconfirmed first input.** Recovery resumes the recorded chat and does
  not submit the saved instruction. The card still says the first prompt was
  not confirmed. The saved instruction is submitted only with a replacement
  chat, because that chat never received it.
- **Replacement.** When resume reports that the chat cannot be loaded, one
  new agent starts in the recorded workspace, with the launch's original
  prompt plus the same continuation facts. The workspace is not recreated
  and the branch is not switched.
- **Blocked recovery.** Workspace trust, a missing workspace directory, or a
  runner that cannot be reached stops recovery with that reason visible. No
  agent is left running for this session, and no replacement agent starts.
  An unclassified resume failure is the same: the developer can see the
  terminal, and a second agent does not start.
- **Attention.** This stopped reading offers recovery on the card. It does
  not count toward the session attention summary and does not raise the
  session alert. Those stay for a live session that is waiting, failed, or
  ready for review.

**Rejection constraints:**

- Recovery never starts by itself. Continuing the work is the developer's
  decision; a restart is not a request to resume.
- A session the runner still holds is not recovered and does not gain a
  second agent. The runner already keeps one client for a session.
- A session marked done, or whose latest report outcome is `completed`, is
  not recovered. That report is the agent's statement that the work is
  complete, including when the message asks for attention.
- An unconfirmed first prompt is not written into the resumed chat. The
  launch already refuses to submit that prompt into a second conversation.
- Recovery does not create a worktree, switch branches, end the published
  assignment, or publish a replacement assignment.

**Deferred promises:** Claude and Codex recovery; a notification that a
restart left sessions stopped; persisting the runner's held set; surviving
restart by moving the agent off the machine. Cursor evidence does not
establish those hosts.

**Premise for planning:** Whether `cursor-agent --resume <chatId>` loads the
on-disk chat after that process is gone. Observed on
`cursor-agent 2026.10.01-e373342`: `--resume [chatId]` selects a session to
resume; `create-chat` returns an id; both recorded Cursor continuations pass
that id; chat stores remain for ids that no process command line contains;
`agent persist` claims survival of a terminal disconnect only. A missing id
in `--print` with no prompt exits before any chat-not-found result
(`No prompt provided for print mode`). An untrusted directory stops at
workspace trust and never reaches resume. Not observed: a new process
showing the prior conversation of a chat whose process is gone. Slice
planning probes that with a native resume of such a chat and no new
instruction. If the conversation is absent, resume is the failure path and
the replacement agent is what delivers the goal. Native probes on
`cursor-agent 2026.10.01-e373342` never emitted cannot-load exit text
(missing, deleted, and corrupted stores open an empty idle composer). On
2026-10-08 the developer authorized the provisional contract sentence
`Cursor could not load this chat.` until a native sentence is observed.

**Key examples:**

1. A Cursor session is executing a plan in its worktree. The computer
   restarts and the dashboard starts. The new runner is running and does not
   hold the session. The session is not marked done and has no completed
   report. The card says the agent is not running and offers recovery. No
   agent starts.
2. The developer recovers it, and the resumed client reaches the idle
   composer. The same chat id and launch record remain. One continuation
   instruction is sent. The agent carries on with the plan in that worktree.
   No second agent starts.
3. The developer recovers it, and resume reports that the chat cannot be
   loaded. One new agent starts in the same worktree. The launch record now
   names the new chat id, keeps the reporting reference and assignment, and
   accepts that agent's completion report. The agent continues the plan from
   the worktree's current state.
4. The runner still holds the session. The card offers no recovery. Opening
   the terminal joins the held client.
5. The session is marked done, or its latest report outcome is `completed`.
   The card offers no recovery.
6. The runner is not running. The card says the runner is not running and
   still offers recovery for an unfinished session. The developer recovers
   it, and that action starts the runner. Nothing starts before that.
7. The first input is still unconfirmed. Recovery resumes the recorded chat
   and does not type the saved instruction. The unconfirmed notice stays.
   The saved instruction is sent only when resume reports that the chat
   cannot be loaded and a new chat starts.
8. The recorded workspace directory is gone, or the resumed client stops on
   workspace trust or an unreachable runner. Recovery explains that and
   starts no agent, including no replacement.

**Architecture:** Recovery is a machine-local operation on the launch record
and the Cursor runner. It adds an explicit "this runner does not hold the
agent" reading, and a developer-requested continuation of that same launch.
It does not add a repository record, a second session registry, or a skill.

- Session liveness stays local operational evidence. Story, assignment, and
  plan facts stay in the repository. This follows
  [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  (a dashboard derives its view; it does not become a second authority) and
  [ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md) (the behavior stays
  with the feature). [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
  (Proposed) informs the same split and binds nothing. "Not held" is an
  observation of a running runner, not an inference from Taken or from
  silence. A runner that is not running stays that reading.
- The continuation is one launch instruction, built the way Cursor's first
  prompt already is (`prompt.ts`). It is not a new skill and not a second
  copy of execution guidance
  ([ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)).
- The published assignment is left as it is. Recovery does not end it or
  publish another one for the same work
  ([ADR 0007](../../docs/adrs/0007-software-development-lifecycles.md),
  Proposed, not binding).
- The workspace used is `continuation.workspace` on the Cursor session.
  `recordedWorkspace` currently returns nothing for Cursor. Recovery does
  not create a worktree or treat the local branch as publication
  ([ADR 0009](../../docs/adrs/0009-git-branching-and-integration.md),
  Proposed, not binding).
- Resume is a Cursor feasibility question. A passing dashboard test with a
  stand-in process does not settle it, and a Cursor result does not transfer
  to Claude or Codex
  ([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)).

No Accepted ADR conflicts with this direction.

**Depends on:** No blocking story prerequisite.

**Safe stopping point:** The card shows an unfinished Cursor session the
runner does not hold, and recovery through resume works, before the
replacement-agent path is added. A resume that cannot be classified still
starts no second agent.

## Breadcrumbs

- Terry's request on 2026-10-07 to capture this at the top of the backlog.
- Refinement observation on 2026-10-08: `cursor-agent 2026.10.01-e373342`
  help for `--resume`, `create-chat`, and `persist`; chat stores that remain
  after the process is gone; the dashboard starts the runner on ready
  (`agentLaunchPlugin.ts`) while session observation does not
  (`readCursorRunnerSessions`).
- Runner and agent lifecycle: `dashboard/server/hosts/cursor/runnerProcess.ts`,
  `dashboard/server/hosts/cursor/terminal.ts`,
  `dashboard/server/hosts/cursor/launch.ts`,
  `dashboard/server/hosts/cursor/sessions.ts`, and
  `dashboard/server/terminalAttachments.ts`. Completion refuses a report whose
  session id is not the launch record's
  (`dashboard/server/completionReservation.ts`).
