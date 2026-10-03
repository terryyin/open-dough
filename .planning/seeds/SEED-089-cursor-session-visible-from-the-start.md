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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/227-cursor-agent-visible-from-the-start/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"52f4b9a9facd19334cc452516ab4027361b55b6cb1826ea231270b89be895f45","plan":"cfbbfa2f0136fa0a429bad7cdac603b8090fee019b3e76b49ec49bec46b16397"}}
```

**Goal:** A developer who starts instructed Cursor work from the dashboard can
see that agent's output and give it further instructions from the beginning of
the run, while the run is still going. The run is the terminal session, so
opening it shows the work instead of a launch-wait notice.

**Scope:**

- Every Cursor start that carries an instruction — story execution, refinement,
  and a prompted ad-hoc session — creates the session without starting work,
  starts its terminal process, and delivers the launch instruction into that
  process once the session is ready for an instruction. The terminal panel does
  not have to be open first. Opening it shows that same run, including output
  already produced, and accepts typing: a later instruction, and an answer the
  agent asks for.
- A chosen model is applied on that first process. A later open uses the stored
  resume command, which still omits the model, because Cursor saves the chosen
  model as its setting. Default omits a model. A blank start that also chooses
  a model stays refused, because no run would apply it.
- A blank ad-hoc start still creates the session, submits no instruction, and
  can attach immediately. A story execution or refinement with no instruction
  still starts nothing.
- Cursor's own trust or login prompt stays on screen for the developer to
  answer. The dashboard does not bypass authentication, trust, or approval, and
  does not type the launch instruction into that prompt
  ([agent launch](../../dashboard/AGENT-LAUNCH.md)). Until the session is ready
  for an instruction, the developer can still type, and the first instruction
  stays unconfirmed.
- The session record confirms the first instruction when that instruction has
  been entered into a terminal that was ready for it. The record stays
  uncertain when the instruction has not been entered. The process exiting does
  not confirm it. An uncertain record keeps the session and still refuses
  another conversation for that launch.
- Closing the terminal does not stop a run that is still working, and opening
  it again shows that same run. A run that has already finished and is showing
  the ordinary follow-up prompt still ends after the terminal closes; the next
  open starts a new resume of the same chat.
- Do not start a second Cursor agent on a chat that already has one. That
  remains forbidden, as this seed already decided.
- Claude Code and Codex stay unchanged.
- Surviving a dashboard restart is the next story. This story may still stop
  the agent when the dashboard process stops.
- The terminal panel does not open by itself. Waiting to deliver the
  instruction until the developer opens the panel was considered and excluded:
  Start already begins the work without the panel, and opening the panel is how
  the developer sees a run that is already going.

**Key examples:**

1. The developer starts a Cursor execution, refinement, or prompted ad-hoc
   session whose work outlasts the old launch wait. Opening the terminal while
   the agent is working shows its output and accepts typing. There is no
   launch-wait notice and no second agent.
2. The agent asks for a decision in the middle of the run. The developer types
   the answer in the dashboard terminal and the same agent continues.
3. The developer closes the terminal while the agent is working, then opens it
   again and sees the same run.
4. After the run has finished and is showing the ordinary follow-up prompt, the
   developer types a follow-up on the same chat. Closing the terminal while
   that prompt is idle still ends the client; the next open resumes the same
   chat.
5. The developer chooses a model with the instruction. The run uses that model.
   Opening the terminal again does not send the model again. A blank start with
   a chosen model still starts nothing.
6. Cursor shows its own trust or login prompt. The developer answers it in the
   terminal; the launch instruction is not entered as that answer. Once the
   session is ready, the same session receives the instruction. Until then, the
   record does not say the instruction was confirmed.

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
and this order on 2026-10-03. The first story's refinement decisions are in
its section. The second story's decisions remain for its own refinement.

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
