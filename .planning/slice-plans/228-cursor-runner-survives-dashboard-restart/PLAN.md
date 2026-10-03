# Keep a Cursor agent running across a dashboard restart

**Identity:** SEED-089#cursor-runner-survives-dashboard-restart
**Source:** [refined story](../../seeds/SEED-089-cursor-session-visible-from-the-start.md#cursor-runner-survives-dashboard-restart).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace. This instruction authorizes neither implementation nor publication.

## Goal and boundaries

A developer who has a Cursor agent working can restart the dashboard,
including when production replaces the dashboard server, and then see that
same agent, instruct it, and see which Cursor sessions are still running.

Included scope is the source story's scope. Material exclusions:

- Surviving a reboot of the machine.
- A dashboard control that stops or restarts the runner.
- Adopting a `cursor-agent` the runner did not start.
- Claude Code and Codex. They do not go through this runner.
- A second `cursor-agent` on a chat that already has one.
- The runner as an authority for story state, backlog membership, assignments,
  or progress.
- Passing `--trust`, `--force`, `--yolo`, or any other bypass of Cursor's
  authentication, trust, or approval.

## Direction and PFE

The Architectural North Star topic
[The Cursor runner outlives the dashboard server](../../NORTH-STAR.md#the-cursor-runner-outlives-the-dashboard-server)
is the direction for this plan. It revises the launch topic's refusal of a
daemon only for Cursor's terminal process. The list the developer sees is in
the [dashboard UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md)
Sessions row. Proposed ADR 0008 binds nothing. Accepted
[ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps the design with
this feature.

Accepted ADRs:

- [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  one owner for a live Cursor terminal. Launch records stay the session
  identity. The runner does not become a second story model.
- [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): prove this
  with the existing `cursor-agent` stand-in. Do not add a native Cursor
  acceptance run, and do not treat Claude Code or Codex success as evidence
  for this host.

PFE: add a Cursor runner. Nothing in the product owns a Cursor terminal that
outlives the dashboard server.

- The Codex app-server daemon is the wrong owner. Codex work lives outside
  the attached terminal, and the dashboard starts or reuses that daemon for
  Codex only. This story leaves it unchanged.
- `ownedProcess` in `dashboard/server/productionProcess.mjs` is the preview's
  process group. The watcher stops that group when it replaces the server and
  when the command exits. The runner must not be in it.
- `TerminalAttachments` keep/join, `cursorDetachedIdle`, the ready predicate
  (`Add a follow-up` and a visible cursor), launch records, and
  `tests/fixtures/fake-cursor` stay the session. The runner holds that same
  client. Do not add a session registry or a second terminal implementation.
- Plan 227 moves the launch instruction into that kept client and leaves
  server-close hangup for this story. These slices start from that client.
  They do not wrap today's headless `submitPrompt` child.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| On `9407c60` an instructed Cursor launch is still `create-chat`, then a headless `cursor-agent` child of the dashboard. While that child runs, attach waits and drops input. `TerminalAttachments.close` hangs up every client, including a kept Cursor PTY, with SIGHUP. | All slices | Read `dashboard/server/hosts/cursor/launch.ts` callers through `runningPrompt.ts` `submitPrompt`, `terminal.ts` `attachCursor`, `terminalAttachments.ts` `close`, and `liveTerminalClient.ts` `hangup`. | Confirmed. Plan 227, which is Taken, replaces the headless child with a kept terminal and explicitly leaves this hangup. These slices do not start until that terminal is the launch. |
| The test server is its own process group. `close()` SIGTERMs the leader and then SIGKILLs the group. A child of that server dies with it. A test can restart a server on a machine directory that outlives the server. | Slice 1 | Read `dashboard/tests/support/dashboardServer.ts` (the `machine` comment and `close` → `endGroup`) and `processGroup.ts` `endGroup`. `sessionAlerts.ts` passes `machine` into `startDashboardServer`. | Confirmed. The runner has to be outside that group, and the restart journey can keep the machine directory. |
| Production `npm run watch:dashboard` runs from the development checkout. It serves a preview of published `main` via `ownedProcess`, stops that preview on a qualifying replacement and in the command's `finally`, and does not own any other long-lived process. | Slice 2 | Read `scripts/watch-dashboard.mjs` (`preview.stop()` before replacement and in `finally`) and `productionDeployment.mjs` `startDeploymentPreview`. `COMMANDS.md` says local edits do not change the served app. | Confirmed. The watcher script can start the runner beside the preview. The served dashboard speaks to the runner only once that dashboard build contains this story. |
| Session identity is the launch record. The Sessions sidebar lists those records. It does not ask a process whether a Cursor terminal is alive. | Slice 3 | Read `dashboard/src/SessionSidebar.tsx` and `pageSessions.ts`. The sidebar heading is "Sessions" and entries come from `openSessionsOf`. | Confirmed. Running Cursor sessions is a separate read of the runner, opened from that sidebar. |
| The kept client's idle rule is already one screen test: `→ Add a follow-up` with none of `ctrl+c to stop`, `Working`, `Running`, or `Clarifying Questions`, after 203ms with no socket. | Slices 1 and 3 | Read `dashboard/server/hosts/cursor/idleScreen.ts`. | Confirmed. The runner uses that test. The list's three labels are the same screen, not a new catalog of Cursor wording. |

## Proof ownership

| Promise (story example) | Slice | Proof |
| --- | --- | --- |
| The watcher replaces the dashboard server; the agent keeps working; opening the terminal shows that run and does not start a second agent (1, the process) | 2 | Production command journey, after slice 1's runner |
| After that replacement a typed follow-up reaches the same agent (2) | 1 | Server-restart journey. Slice 2 repeats it on the production command |
| A restart while the agent is waiting still shows the question, and the answer reaches that agent (3) | 1 | Same journey |
| The first `npm run watch:dashboard` starts the watcher and one runner (4) | 2 | Production command journey |
| Stopping the production command and starting it again leaves the same runner and the working agent (5) | 2 | Same journey |
| Stopping the runner stops its agents; the dashboard starts none; a new runner that holds nothing resumes on the next open (6) | 1 | Same journey |
| The development dashboard shows the held session, and restarting the development server leaves it (7) | 1 | Same journey, on the dev server |
| A trust or login screen survives the restart; the instruction is not entered as that answer; the record stays unconfirmed until it is entered (8) | 1 | Same journey |
| Running Cursor sessions shows working, waiting, or the follow-up prompt, and choosing a row opens that terminal (1 and 3, the list) | 3 | Page journey |
| The runner down or unreachable shows an empty list and starts no agent | 3 | Same page journey, with the refusal proved in slice 1 |
| Closing the dashboard server no longer sends SIGHUP to a Cursor client. Claude Code and Codex still hang up their attachment clients | 1 | Boundary journey |
| An unentered launch instruction stays with the runner and is not confirmed by the restart | 1 | Server-restart journey |

## Slices

### 1. A Cursor session survives the dashboard server
Type: Behavior
Status: done
Proof: `npm run test:dashboard -- agent-terminal-cursor-runner.spec.ts agent-terminal-cursor.spec.ts agent-terminal-cursor-idle.spec.ts agent-terminal-boundary.spec.ts`

Behavior: the developer starts Cursor work whose terminal is the kept client
from plan 227. That client runs in the machine-local Cursor runner, not in
the dashboard server. Stopping the dashboard server, and starting it again
on the same machine, leaves the client running. Opening the terminal shows
that same client and accepts typing. A second `cursor-agent` is not started.

The same client covers the boundaries:

- A follow-up typed after the restart reaches that client. A client that is
  waiting for an answer is still waiting, and the answer reaches it.
- A screen that is not ready, such as trust or login, is still that screen.
  The launch instruction is not entered as the answer. The session record
  stays unconfirmed until the same client is ready and the instruction is
  entered. The restart does not enter it and does not confirm it.
- The runner applies today's keep and idle-end rules, including while the
  dashboard is down. A detached finished follow-up prompt still ends after
  203ms. A working or waiting screen does not.
- Starting the development server starts the runner when it is absent, in
  its own process group, and does not restart a runner that is already
  accepting connections. Two overlapping starts still leave one runner.
- When the runner cannot be reached, the dashboard starts no `cursor-agent`.
  Stopping the runner ends the processes it holds and leaves none behind.
  After a new runner is up and holds nothing for that chat, opening the
  terminal resumes the chat as a new process.
- Claude Code and Codex attachments are unchanged. Server close still hangs
  those clients up. It does not hang up a Cursor client the runner holds.

Update `dashboard/AGENT-LAUNCH-TERMINALS.md` so server close no longer
SIGHUPs a Cursor client, and so the runner owns that client. If the launch
is still the headless running prompt, stop this slice. Do not wrap that
prompt.

Accepted proof for later slices:

- Promise: stopping the dashboard server leaves the same Cursor client
  running, and a later server on that machine types into it.
- Boundary: `server.close()` ends the server's process group. The runner's
  group is its own pid. The second server reuses that runner and the same
  `cursor-agent` pid.
- Setup and observation: `restartedDashboardTypesSameClient` in
  `dashboard/tests/support/cursorRunnerRestart.ts`, called from
  `dashboard/tests/agent-terminal-cursor-runner.spec.ts`.
- Command: `npm run test:dashboard -- agent-terminal-cursor-runner.spec.ts agent-terminal-cursor.spec.ts agent-terminal-cursor-idle.spec.ts agent-terminal-boundary.spec.ts`
- Result: exit 0. The refactor rerun is the one that counts; the journey
  had moved into `cursorRunnerRestart.ts`. `launch.ts` still calls
  `keepCursorClient`.

### 2. The production command starts the runner and leaves it up
Type: Behavior
Status: done
Proof: `npm run test:dashboard -- production-cursor-runner.spec.ts production-watcher.spec.ts`

Behavior: nothing is running. `npm run watch:dashboard` starts one Cursor
runner and the watcher. The runner is not in the preview's process group.
The watcher replaces the dashboard server for a qualifying commit. The
Cursor client from slice 1 keeps working, and opening the new server's
terminal shows that same client. Stopping the command stops the watcher and
the preview and leaves the runner and that client running. Starting the
command again does not start a second runner. A typed follow-up still
reaches that client.

The served preview speaks to the runner because the published commit under
test contains this story. The watcher script in the development checkout is
what starts the runner. Do not signal the runner from `preview.stop()` or
from the command's shutdown. Keep the watcher's existing cartoon copy and
preview replacement.

Update `dashboard/COMMANDS.md`: the command starts the runner when it is
absent, and stopping the command does not stop the runner.

Accepted proof for later slices:

- Promise: `npm run watch:dashboard` starts one Cursor runner outside the
  preview's process group. Replacement, stopping the command, and starting
  it again leave that runner and the same `cursor-agent`, and a typed
  follow-up reaches that client.
- Boundary: `preview.stop()` and the command's `finally` stop only the
  preview. The runner's process group is its own pid.
- Setup and observation: `dashboard/tests/production-cursor-runner.spec.ts`,
  the test "the production command starts one Cursor runner and leaves that
  client up across replacement and a restart". Setup is
  `publishedMainFixture(true)` and `watch:dashboard` on port 0. The runner
  group, the surviving pid, and `after-restart` are asserted there.
- Command: `npm run test:dashboard -- production-cursor-runner.spec.ts production-watcher.spec.ts`
- Result: exit 0. Refactor changed no paths, so this proof was not rerun.
  `scripts/watch-dashboard.mjs` starts the runner once through
  `ensureCursorRunner` and does not stop it.

### 3. Show the sessions the runner is holding
Type: Behavior
Status: done
Proof: `npm run test:dashboard -- cursor-runner-sessions.spec.ts`

Behavior: the developer opens **Running Cursor sessions** from the Sessions
sidebar without opening a terminal. The list says whether the runner is
running. Each row is one session the runner holds: the project, what was
started, and one label from that client's current screen. The ordinary
follow-up prompt is "at the follow-up prompt". A screen with `Working`,
`Running`, or `ctrl+c to stop` is "working". Any other held screen, including
a question or a trust prompt, is "waiting for an answer". Choosing a row
opens that session's terminal on the client the runner holds.

When the runner is not running, or cannot be reached, the list says so,
shows no sessions, and offers nothing that starts an agent. The launch-record
lists stay as they are. The list does not change story state.

Update `dashboard/AGENT-LAUNCH-TERMINALS.md` with this list.

Accepted proof:

- Promise: opening **Running Cursor sessions** from the Sessions sidebar
  lists each client the runner holds, with the project, what was started,
  and one screen label. Choosing a row opens that client. A runner that is
  down or unreachable says so, lists nothing, and starts no agent.
- Boundary: `readCursorRunnerSessions` uses `acceptingCursorRunnerPort` and
  does not start a runner. `cursorSessionLabel` in `idleScreen.ts` is the
  three labels. `GET /__agent-launch/cursor-sessions` returns that join
  with launch records.
- Setup and observation: `dashboard/tests/cursor-runner-sessions.spec.ts`.
  `holdSession` launches an ad hoc client before the page has a terminal.
  `openRunningList` opens the sidebar and then the list. The working,
  waiting, and trust tests click the row. The follow-up test reads
  `at the follow-up prompt` on the same pid. The down and unreachable
  tests add no `cursor-agent` call.
- Command: `npm run test:dashboard -- cursor-runner-sessions.spec.ts`
- Result: exit 0. Refactor left this boundary in place, so the proof was
  not rerun.

## Considered and excluded

- **Wrapping today's headless `submitPrompt` child.** Plan 227 removes it.
  These slices start from the kept terminal that plan leaves.
- **Reusing the Codex daemon, or putting the runner in `ownedProcess`.** The
  daemon is Codex's work outside the terminal. `ownedProcess` is the group
  the watcher kills.
- **A second session registry, or a catalog of Cursor trust wording.** Launch
  records stay the identity. Any screen that is not the follow-up prompt and
  not working is "waiting for an answer".
- **A dashboard stop or restart control, surviving a reboot, and adopting a
  foreign `cursor-agent`.** The story defers all three.
- **An old production build talking to a new runner.** The preview uses the
  runner only when the served commit contains this story.

## Current decisions

- One runner per machine, outside the dashboard server's process group and
  outside the production preview's process group. Start it only when it is
  not already accepting connections. Never restart one that is.
- The dashboard attaches through the runner and does not spawn
  `cursor-agent` itself. Server close does not SIGHUP a Cursor client the
  runner holds.
- The runner's stop ends its processes. A later open resumes only when a
  running runner holds nothing for that chat.
- No numeric slice target or hard limit was supplied. Each slice is one
  proof loop: the server restart, the production command, and the list.
- Do not start slice 1 until plan 227's kept terminal is the Cursor launch.
  That terminal is on trunk: `launch.ts` starts it with `spawnCursorPty` and
  `cursorKeptTerminal`, and `TerminalAttachments.close` still hangs it up.
- Story Branch Mode. Take `b07ce1625813e14fe0177df8653f1a9b387aca52` is on
  `origin/main`. Execution branch `cursor/cursor-runner-survives-dashboard-restart`
  starts at `9a4bb9d71f4fbc2cf5681371d8ad7556ffa74778`. Publisher
  `20a3ce04-8f3f-47d0-abe4-6809419ba85c`. The trunk Take is unobserved.
