---
id: SEED-089
status: active
planted: 2026-10-03
planted_during: Terry's review of a running dashboard-launched Cursor execution
trigger_when: A developer starts Cursor work from the dashboard and needs to see it, instruct it, or restart the dashboard without stopping it
scope: unestimated
---

# SEED-089: A dashboard-launched Cursor agent is visible and survives the dashboard

## Why This Matters

A developer who starts instructed Cursor work from the dashboard can see that
agent and give it further instructions from the beginning of the run. The run
is the terminal session.

Restarting the dashboard still stops that same agent. Claude Code and Codex do not
behave this way: closing their terminal, or restarting the dashboard, leaves
their work running, and the developer can open the terminal again to see it
and type.

## Alternatives and Decision

Terry confirmed this split and order on 2026-10-03.

- **Leave the current launch as it is.** The opening `cursor-agent` keeps
  running and a second one is not started. The developer still cannot see or
  instruct that run, and a dashboard restart stops it.
- **One story that both shows the agent from the start and survives a
  dashboard restart.** Rejected. Each outcome is useful to judge on its own.
  Combining them would hold the visible terminal until the process owner also
  exists.
- **A process owner alone, keeping today's headless opening process.** Rejected
  as the first story. A restarted dashboard could keep a process the developer
  still cannot see or type to.
- **Selected order.** First make the session a terminal the developer can see
  and type to from the start. Then keep that process alive across a dashboard
  restart. The first story remains useful if the second is cancelled.

Cursor's agent is the terminal process. Claude Code and Codex keep their work
outside the attached terminal, so this seed does not change those hosts.
Starting a second `cursor-agent` on a chat that already has one running remains
forbidden. [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
is Proposed and does not choose a service split; a local process owner would
not become a second authority for story state.

## Story Decomposition

<a id="cursor-runner-survives-dashboard-restart"></a>

### Keep a Cursor agent running across a dashboard restart

**Identity:** SEED-089#cursor-runner-survives-dashboard-restart
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer can restart the dashboard while a Cursor agent is
working and then attach again to that same agent, still see it, and still
instruct it.

**Current behavior, for refinement:**

- The opening Cursor process is a child of the dashboard process. It is not
  detached. Restarting the dashboard stops it.
- The dashboard remembers that this process is still running only in memory.
  After a restart that memory is gone. If the process had survived, the new
  dashboard would not know, and opening the terminal could start a second
  agent.
- Closing the dashboard's terminal is a different action. After the first
  story, that close leaves a working Cursor run going. This story is about
  the dashboard process itself stopping.
- Claude Code and Codex already keep their work across that restart. They do
  not need a new owner.

**Agreed direction:** A local Cursor runner owns the Cursor processes and
stays up when the dashboard restarts. The dashboard attaches to a session the
runner is already holding, instead of being the parent of `cursor-agent`.
The runner is the stable process; restarting the runner would still stop the
agents it holds. Codex and Claude Code do not go through this runner.

**Scope:**

- Restarting the dashboard leaves a working Cursor agent running.
- Opening the terminal after that restart shows that same agent and accepts
  instructions. It does not start a second agent.
- The runner remains up across ordinary dashboard restarts.
- Claude Code and Codex stay unchanged.

**Key examples:**

1. A Cursor execution is visible and working in the dashboard. The developer
   restarts the dashboard. The agent is still working, and opening its
   terminal shows that same run.
2. After the restart the developer types a follow-up. The same agent receives
   it.
3. The developer restarts the dashboard while the agent is waiting for an
   answer. The question is still there, and the answer still reaches that
   agent.

**Open decisions for refinement:**

- The runner's process shape: a small local process the dashboard starts when
  it is absent, or another owner with the same lifetime.
- How a restarted dashboard finds the runner's live sessions and attaches to
  the existing terminal without starting another `cursor-agent`.
- What a restart of the runner itself does, and how the dashboard says so.
- Whether a Cursor process that the first story has not yet made into a
  terminal is in scope. The selected order assumes this story keeps the
  terminal from the first story.

**Depends on:** the delivered session at `8d4f70b4356becb6289f6429bc593dfd52934855:.planning/seeds/SEED-089-cursor-session-visible-from-the-start.md` (See and instruct a Cursor agent from the start).
Without that terminal, keeping the process would preserve a run the developer
still cannot see or instruct.

**Safe stopping point:** A dashboard restart no longer stops the Cursor agent
or replaces it with a second one. Restarting the runner may still stop it.

## Ordering and Scope Reduction

The visible, instructable session is delivered. Deliver the runner next, aimed
at that same terminal.
If the runner is dropped, the developer can still see and instruct a run for
as long as the dashboard stays up.

## Open Decisions

No unresolved choice changes this split or order. Terry selected both stories
and this order on 2026-10-03. The delivered story's decisions are in that same revision. The remaining story's decisions stay for its own refinement.

## Breadcrumbs

- Terry's 2026-10-03 review of a dashboard-launched Cursor execution that was
  recording finished slices while the terminal showed only the launch-wait
  notice.
- [Embedded terminals](../../dashboard/AGENT-LAUNCH-TERMINALS.md), including
  the kept Cursor client.
- [SEED-052](SEED-052-start-agent-work-from-dashboard.md), the parent launch
  epic. The reconnect behavior this seed builds on was closed in
  `c78b9ba0fd30256d145dfe4eb672f3e8e9d7d927`.
- [Product backlog](../PRODUCT-BACKLOG.md).
