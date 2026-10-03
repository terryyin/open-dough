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

A developer who starts Cursor work from the dashboard cannot see that agent or
give it further instructions while its opening run is still going. The terminal
shows that Cursor is still working on the launch prompt and opens when that
process finishes. Typed input is discarded. On 2026-10-03 this stayed true
while the agent was already recording finished slices.

Restarting the dashboard stops that same agent. Claude Code and Codex do not
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

<a id="cursor-session-interactable-from-the-start"></a>

### See and instruct a Cursor agent from the start

**Identity:** SEED-089#cursor-session-interactable-from-the-start
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer who starts Cursor work from the dashboard can see that
agent's output and give it instructions from the beginning of the run, while
the run is still going.

**Current behavior, for refinement:**

- `create-chat` prints a session id and does no work. An ad-hoc start with no
  instruction keeps that id and submits no prompt, so the terminal can attach
  immediately. A story execution or refinement refuses to start with no
  instruction.
- A prompted start then runs `cursor-agent --workspace <path> --resume <id>`
  with the instruction as arguments. That process is not a terminal: its
  output is discarded and its input is closed. The dashboard waits about 30
  seconds for it to exit. Exit 0 before then confirms the first instruction.
- If the process is still running when the wait ends, the terminal writes
  "Cursor is still working on this session's launch prompt. The terminal opens
  when it finishes." Input is dropped. Attaching would start a second
  `cursor-agent` on that chat, so it does not attach. The notice stays until
  that process exits, including after slices are recorded and if the agent
  pauses for an answer. A later exit does not confirm the first instruction.
- When that process has exited, opening the terminal starts
  `cursor-agent --resume` for the same chat. The developer can see it and
  type. Closing the terminal leaves a still-working run going; opening it
  again joins that same run. A run that has already finished and is showing
  the ordinary follow-up prompt is ended after the terminal closes, and the
  next open starts a new resume of the same chat.
- A blank start that also chooses a model is refused. The chosen model is
  applied only on the prompted run.

**Scope:**

- Create the Cursor session without starting work, attach its terminal, and
  deliver the launch instruction in that terminal.
- From that point the developer sees the run and can type, including a later
  instruction and an answer the agent asks for.
- Closing the terminal does not stop a run that is still working, and opening
  it again shows that same run.
- Do not start a second Cursor agent on that chat.
- Claude Code and Codex stay unchanged.
- Surviving a dashboard restart is the next story. This story may still stop
  the agent when the dashboard process stops.

**Key examples:**

1. The developer starts a Cursor execution whose work will outlast the launch
   wait. The terminal shows the agent working, and the developer can read its
   output before the run finishes.
2. The agent asks for a decision in the middle of the run. The developer types
   the answer in the dashboard terminal and the same agent continues.
3. The developer closes the terminal while the agent is working, then opens it
   again and sees the same run rather than a second agent.
4. After the run is finished, the developer opens the terminal and types a
   follow-up on the same chat.

**Open decisions for refinement:**

- Which launches use this path: story execution, refinement, ad-hoc, or all
  Cursor starts that carry an instruction.
- How a chosen model is applied when the instruction is typed into the
  terminal instead of passed as a headless argument.
- Whether the dashboard sends the instruction into the terminal as soon as the
  session is ready, or waits until the developer has the terminal open.
- What the session record should say about the first instruction, since this
  path does not confirm it by the headless process exiting 0.
- How the terminal gets past Cursor's own trust or login prompt before the
  instruction is delivered.

**Depends on:** none. The kept-terminal behavior after a Cursor terminal has
already opened is already on trunk.

**Safe stopping point:** The developer can see and instruct the run from the
start. A dashboard restart may still stop the agent.

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

**Depends on:** [See and instruct a Cursor agent from the start](#cursor-session-interactable-from-the-start).
Without that terminal, keeping the process would preserve a run the developer
still cannot see or instruct.

**Safe stopping point:** A dashboard restart no longer stops the Cursor agent
or replaces it with a second one. Restarting the runner may still stop it.

## Ordering and Scope Reduction

Deliver the visible, instructable session first. It removes the current
blocker on its own. Deliver the runner second, aimed at that same terminal.
If the runner is dropped, the developer can still see and instruct a run for
as long as the dashboard stays up.

## Open Decisions

No unresolved choice changes this split or order. Terry selected both stories
and this order on 2026-10-03. The per-story decisions above are for
refinement.

## Breadcrumbs

- Terry's 2026-10-03 review of a dashboard-launched Cursor execution that was
  recording finished slices while the terminal showed only the launch-wait
  notice.
- [Embedded terminals](../../dashboard/AGENT-LAUNCH-TERMINALS.md), including
  the kept Cursor client and the launch-wait notice.
- [SEED-052](SEED-052-start-agent-work-from-dashboard.md), the parent launch
  epic. The reconnect behavior this seed builds on was closed in
  `c78b9ba0fd30256d145dfe4eb672f3e8e9d7d927`.
- [Product backlog](../PRODUCT-BACKLOG.md).
