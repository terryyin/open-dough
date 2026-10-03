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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/228-cursor-runner-survives-dashboard-restart/PLAN.md","assessment":"not-ready","reasons":["Slices 1–3 attach to the kept Cursor terminal from plan 227. On 9407c60 that launch is still the headless running prompt, and server close still hangs up kept clients. Reassess once plan 227 is on trunk."],"basis":{"document":"e4fc264a87db1aa5e99ac56eb057c05e2f5e36ba6f60cfb68f9cb4f51f9a064b","plan":"9e851df0432ca0ccfff23f79b8e3f402bcaa7a36a3ab5e2dee1f465adc44a963"}}
```

**Goal:** A developer who has a Cursor agent working can restart the
dashboard, including when production replaces the dashboard server, and then
see that same agent, instruct it, and see which Cursor sessions are still
running.

**Scope:**

- A machine-local Cursor runner owns every Cursor terminal process this
  product starts. The dashboard server is not the parent of `cursor-agent`.
  Restarting or replacing the dashboard server leaves the runner and the
  agents it holds running. Opening a terminal after that attaches to the
  process the runner already holds and does not start a second agent.
- Production starts with the existing command, `npm run watch:dashboard`.
  The first time, and any later time the runner is not already running, that
  command starts one runner and the watcher that serves the dashboard. When
  the runner is already running, the command leaves it alone and does not
  start a second one. The watcher's replacement of the dashboard server does
  not restart the runner.
- Stopping that production command stops the watcher and the dashboard server
  the watcher owns. It does not stop the runner. Starting the command again
  reuses the runner that is still up.
- The development server uses that same runner. If the runner is absent,
  starting the development server starts it once, detached from that server.
  Restarting the development server does not restart the runner. Development
  and production show the same held sessions.
- A launch instruction the first story has not yet entered stays with the
  runner across the dashboard restart. The restart does not enter it, does
  not confirm the session record, and does not start another agent. Cursor's
  own trust or login prompt stays on that same process for the developer to
  answer.
- The runner applies the existing keep and idle-end rules to the process it
  holds, including while the dashboard is down. Closing the dashboard server
  no longer sends SIGHUP to a Cursor client. Claude Code and Codex stay
  unchanged and do not go through this runner.
- Do not start a second Cursor agent on a chat that already has one. When the
  dashboard cannot confirm that the runner holds nothing for that chat, it
  does not start one. It says the runner is not running, or that it cannot
  be reached.
- Stopping the runner stops the Cursor processes it holds and leaves none
  behind. The dashboard then shows that the runner is not running and lists
  no live sessions. It does not start a replacement agent. After the runner
  is started again and holds nothing for that chat, opening the terminal
  resumes the chat as a new process.
- The runner is not an authority for story state, backlog membership,
  assignments, or progress. It only holds live Cursor processes. Session
  records stay the machine-local records they already are.
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
  is Proposed and still does not choose a service split.
  [ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md) keeps this design with
  the feature.
- A reboot of the machine still stops the runner and its agents. This story
  does not add a dashboard control to stop or restart the runner, and the
  runner does not adopt a Cursor process it did not start.

**UI:**

The dashboard has a **Running Cursor sessions** list, opened from the
Sessions sidebar without opening a terminal. It states whether the Cursor
runner is running. When the runner is running, each row is one session it
holds: the project, what the developer started (story execution, refinement,
or an ad-hoc session), and whether that session is working, waiting for an
answer, or at the follow-up prompt. Choosing a row opens that session's
terminal on the process the runner already holds. When the runner is not
running, or cannot be reached, the list says so, shows no live sessions, and
offers no action that starts an agent.

**Architecture:**

Today the Cursor process is a child of the dashboard server, and the server
remembers that it is alive only in memory. Production makes that fatal:
`npm run watch:dashboard` replaces the dashboard server when a qualifying
commit is published, and that replacement stops the server's process group.
The runner has to sit outside that group.

The runner is one process per machine, in its own process group. It is not a
child of the dashboard server and not a child of the watcher. Stopping or
replacing either of those does not signal the runner. The production command
and the development server start the runner only when nothing is already
accepting connections, including when two starts overlap, and never restart
a runner that is. Both find it at a stable machine-local address that
outlives the dashboard server process. A replaced dashboard asks the runner
which sessions it holds and attaches through the runner. It does not trust
its own previous memory, and it does not spawn `cursor-agent` itself.

The runner's stop ends the processes it holds, so a later runner cannot meet
a leftover `cursor-agent` and the dashboard cannot start a second one beside
it. Terry confirmed this lifetime on 2026-10-03: stopping the production
command leaves the runner up, development uses that same runner, the
dashboard has no control to stop or restart it, and a machine reboot still
stops it.

**Key examples:**

1. Production is up from `npm run watch:dashboard`, and a Cursor execution is
   working. The watcher replaces the dashboard server. The agent keeps
   working. Running Cursor sessions shows that session as working. Opening
   its terminal shows that same run and does not start a second agent.
2. After that replacement the developer types a follow-up. The same agent
   receives it.
3. The dashboard is restarted while the agent is waiting for an answer. The
   list still shows waiting. The question is still there, and the answer
   reaches that agent.
4. Nothing is running. The developer starts `npm run watch:dashboard` once.
   That starts the watcher and one runner. A Cursor session started
   afterwards is held by that runner.
5. The developer stops the production command and starts it again while the
   agent is working. The runner was still up, so the command does not start
   a second runner. The agent is still listed and still working.
6. The runner process is stopped. Its agents stop. The dashboard says the
   runner is not running and lists no live sessions. It does not start a
   replacement agent. Starting the production command again starts one
   runner. Opening the terminal then resumes the chat, because the runner
   holds nothing for it.
7. The runner is already up, and the developer is using the development
   dashboard. It shows the same held session. Restarting the development
   server leaves the agent running.
8. The dashboard restarts while Cursor is showing its own trust or login
   prompt. After the dashboard is back, that prompt is still there. The
   developer answers it in the terminal. The launch instruction is not
   entered as that answer, and the session record stays unconfirmed until
   the instruction is actually entered.

**Depends on:** the delivered session at `8d4f70b4356becb6289f6429bc593dfd52934855:.planning/seeds/SEED-089-cursor-session-visible-from-the-start.md` (See and instruct a Cursor agent from the start).
Without that terminal, keeping the process would preserve a run the developer
still cannot see or instruct.

**Safe stopping point:** A dashboard restart no longer stops the Cursor agent
or replaces it with a second one. The developer can see which sessions the
runner still holds. Stopping the runner still stops the agents it holds.

## Ordering and Scope Reduction

The visible, instructable session is delivered. Deliver the runner next, aimed
at that same terminal.
If the runner is dropped, the developer can still see and instruct a run for
as long as the dashboard stays up.

## Open Decisions

No unresolved choice changes this split or order. Terry selected both stories
and this order on 2026-10-03. The delivered story's decisions are in
`8d4f70b4356becb6289f6429bc593dfd52934855:.planning/seeds/SEED-089-cursor-session-visible-from-the-start.md`.
The remaining story's refinement decisions are in its section.

## Breadcrumbs

- Terry's 2026-10-03 review of a dashboard-launched Cursor execution that was
  recording finished slices while the terminal showed only the launch-wait
  notice.
- Terry's 2026-10-03 refinement direction: the Cursor runner stays up when
  the dashboard service restarts, the production command starts the watcher
  and the runner together the first time, and the dashboard shows the status
  of the sessions that runner is holding.
- [Embedded terminals](../../dashboard/AGENT-LAUNCH-TERMINALS.md), including
  the kept Cursor client.
- [SEED-052](SEED-052-start-agent-work-from-dashboard.md), the parent launch
  epic. The reconnect behavior this seed builds on was closed in
  `c78b9ba0fd30256d145dfe4eb672f3e8e9d7d927`.
- [Product backlog](../PRODUCT-BACKLOG.md).
