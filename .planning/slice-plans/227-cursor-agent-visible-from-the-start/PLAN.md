# See and instruct a Cursor agent from the start

**Identity:** SEED-089#cursor-session-interactable-from-the-start
**Source:** [refined story](../../seeds/SEED-089-cursor-session-visible-from-the-start.md#cursor-session-interactable-from-the-start).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace. This instruction authorizes neither implementation nor publication.

## Goal and boundaries

A developer who starts instructed Cursor work from the dashboard can see that
agent's output and give it further instructions from the beginning of the run.
Opening the terminal shows that run instead of a launch-wait notice.

Included scope is the source story's scope. Material exclusions:

- Surviving a dashboard restart. The Cursor client stays a child of this
  server. Shutting the server still hangs up kept clients, including this one.
  The next story owns a process that outlives the server.
- Opening the terminal panel by itself.
- Waiting until the panel is open before entering the launch instruction.
- Passing `--trust`, `--force`, `--yolo`, or any other bypass of Cursor's
  authentication, trust, or approval.
- A second `cursor-agent` on a chat that already has one.
- Claude Code and Codex.

## Direction and PFE

No new North Star topic. The existing topic
[A start establishes claim and workspace before the session](../../NORTH-STAR.md)
already puts Cursor on the same launch as Claude Code and Codex, and says the
dashboard adds no database or daemon. This plan stays inside that launch.
Cursor keeps its own terminal boundary. Proposed ADR 0008 binds nothing.

Accepted ADRs:

- [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  one representation of the Cursor session, and no structure for the next
  story's runner.
- [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): prove this
  dashboard behavior with the existing `cursor-agent` stand-in. Do not add a
  native Cursor acceptance run, and do not treat Claude Code or Codex success
  as evidence for this host.

PFE: change the Cursor launch so the first instruction is entered into the
kept terminal the dashboard already uses. Reuse `create-chat`, the stored
resume command, `attachCursor`'s ready predicate (`Add a follow-up` and a
visible cursor), keep/join, the detached-idle rule, the first-input record,
and `tests/fixtures/fake-cursor`. The headless `submitPrompt` process and the
launch-wait notice are the behavior this story removes. Do not add a runner,
a second terminal implementation, or a catalog of Cursor's trust wording.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| An instructed Cursor launch today is `create-chat`, then a headless `cursor-agent --workspace --resume <id> [ --model <id> ] <prompt>` whose stdin is closed. Exit 0 before the launch wait confirms the first input. A client still running makes attach wait and drop input. | Slice 1 | Read `dashboard/server/hosts/cursor/launch.ts`, `runningPrompt.ts`, and `terminal.ts`. | Confirmed. `attachCursor` returns `{ wait, notice }` while `runningPromptExit` is set. |
| The kept terminal already joins one client, writes socket input into that PTY, and leaves it running when the socket closes. Idle hangup matches `→ Add a follow-up` with no `ctrl+c to stop`, `Working`, `Running`, or `Clarifying Questions`, after 203ms with no socket. | Slice 1 | Read `terminalAttachments.ts` `connect` / `keptClient`, `liveTerminalClient.ts` `onData`, and `idleScreen.ts`. | Confirmed. `type()` writes only when a socket is open, so it cannot deliver the launch instruction before the panel opens. |
| With no socket, the first PTY output arms that idle watch. The ready screen is the idle screen, so a client started at launch would be hung up 203ms later if nothing holds idle or changes the screen. | Slice 1 | Same reads: `liveTerminalClient.ts` calls `idle.watch()` when `sockets.length === 0`. | Confirmed. Slice 1 holds idle until the launch instruction has been entered. |
| Headless xterm, with the page's CSI `?25` cursor handling and the same visible-row text, matches the ready predicate for the stand-in's paint and rejects a hidden cursor and a non-prompt screen. | Slice 1 | `@xterm/headless` 6.0.0 from `dashboard/server/keptClientScreen.ts`'s require. Wrote the stand-in's paint `\x1b[?2026h\x1b[?25h\x1b[2J\x1b[H→ Add a follow-up\r\n\x1b[?2026l`, the same paint with `?25l`, and a visible-cursor screen `Do you trust this workspace?`. Ready means visible cursor and text including `Add a follow-up`. | Ready paint: ready. Hidden cursor: not ready. Trust text: not ready. |
| The stand-in treats a resume as a terminal client only when no argument follows `--resume`. A `--model` flag, or the prompt as an argument, is a headless launch that exits 0 unless `FAKE_CURSOR_RELEASE` is set. The terminal paint includes the ready sequence above. | Slice 1 | Read `dashboard/tests/fixtures/fake-cursor` (`attaching` at the `--resume` length check, `paint`, and `holdUntilRelease`). | Confirmed. Slice 1 teaches the stand-in that `--model <id>` with no prompt argument is still the terminal client. |
| Cursor has no `recover`. An unconfirmed first input on a matching launch starts no second conversation. `record.session` writes the launch record directly, including a later call. The public host does not declare `recover`. Server `close()` hangs up every kept client. | Slice 1 | Read `cursorHost.ts`, `launchRun.ts` (the `host.recover === undefined` answer), `launchRecording.ts` `session`, and `terminalAttachments.ts` `close`. | Confirmed. |

## Proof ownership

| Promise (story example) | Slice | Proof |
| --- | --- | --- |
| An instructed execution, refinement, or ad-hoc start shows the run in the terminal and accepts typing; no launch-wait notice and no second agent (1) | 1 | Terminal journey and page journey |
| An answer typed in the open terminal reaches the same agent (2) | 1 | Same journey, on a screen that is asking a question |
| Closing the terminal while the run is working, then opening it, shows the same run (3) | 1 | Same journey |
| A finished follow-up prompt accepts a follow-up; closing it while idle ends the client, and the next open resumes the same chat (4) | 1 | Existing idle journey, on the new launch shape |
| A chosen model is on the first process only; a later open omits it; a blank start with a model still starts nothing (5) | 1 | Model launch journey, plus the existing blank-model refusal |
| A non-ready screen, such as trust or login, does not receive the instruction; the record stays uncertain until the screen is ready and the same client receives it (6) | 1 | Terminal journey |
| A blank ad-hoc start still attaches with no instruction; execution or refinement with no instruction still starts nothing | 1 | Existing blank and missing-prompt specs, updated only for the new launch shape |
| Claude Code still passes terminal output, input, and close through the shared client. Codex uses that same client | 1 | `agent-terminal-boundary.spec.ts` |

## Slices

### 1. Enter the launch instruction into the Cursor terminal
Type: Behavior
Status: done
Proof: `npm run test:dashboard -- agent-terminal-cursor-launch.spec.ts agent-terminal-cursor-launch-page.spec.ts agent-launch-cursor-model.spec.ts agent-launch-start-cursor.spec.ts agent-launch-preparation-cursor.spec.ts agent-launch-ad-hoc-cursor.spec.ts agent-terminal-cursor.spec.ts agent-terminal-cursor-idle.spec.ts agent-terminal-boundary.spec.ts`

Behavior: the developer starts Cursor work that carries an instruction
(execution, refinement, or ad hoc). The dashboard creates the session and
starts one kept terminal client for it, without waiting for the panel. When
that client's screen is ready for an instruction, the launch instruction is
entered there and the record says the first input was accepted. Opening the
terminal shows that same client and its output, and typing reaches it. There
is no launch-wait notice and no second `cursor-agent`.

The same client covers the boundaries:

- A chosen model is an argument of that first client only. The stored resume
  command omits it. Opening again does not send it. Default omits it. A blank
  start with a chosen model is still refused before `create-chat`. A blank
  ad-hoc start still creates the session, submits nothing, and attaches when
  opened. Execution or refinement with no instruction still starts nothing.
- A screen that is not ready does not receive the instruction, and the record
  stays uncertain. The developer can type into that screen. When the same
  client later becomes ready, it receives the instruction and the record
  becomes accepted. The client exiting does not accept the instruction.
- While the screen is working or asking a question, closing the terminal
  leaves that client running, and opening it joins the same client. A
  detached finished follow-up prompt still ends after the existing 203ms
  settle, and the next open starts a new resume of the same chat that takes
  a follow-up.
- A matching launch whose first input is still uncertain starts no other
  conversation.

The launch attempt settles once that client is running and the uncertain
record is saved. Acceptance can be recorded after the attempt has returned.
The launch wait's abort does not kill the client. Idle hangup is held off
until the instruction has been entered, and then the existing idle rule
applies. Update the stand-in so a resume with `--model` and no prompt
argument is that terminal client. Remove the headless prompted process, the
launch-wait notice, and the attach wait that existed only for it. Update
`dashboard/AGENT-LAUNCH.md`, `dashboard/AGENT-LAUNCH-HOSTS.md`, and
`dashboard/AGENT-LAUNCH-TERMINALS.md` to describe this launch.

## Considered and excluded

- **A local Cursor runner, or detaching the client from the server.** That is
  the next story. This slice leaves `TerminalAttachments.close` hanging up
  kept clients.
- **Opening the panel automatically, or delaying the instruction until the
  panel is open.** The story excludes both. The instruction is entered from
  the server-side screen.
- **Confirming the first input by process exit.** Exit no longer means the
  instruction was entered.
- **A list of Cursor trust or login strings.** Any screen that fails the
  existing ready predicate is not ready. The stand-in proves a non-matching
  screen.
- **Changing Claude Code or Codex launch or attach.**

## Current decisions

- One kept Cursor client, started at launch, is the session. The instruction
  is written into it only when the server-side screen matches today's ready
  predicate.
- Idle hangup waits until that write, then uses today's rule.
- `--model` is only on that first client. The stored resume command stays
  without it.
- The record is accepted when the instruction is entered, and stays uncertain
  until then. A later exit does not accept it.
- No numeric slice target or hard limit was supplied. This slice is one proof
  loop: the launch instruction and the terminal the developer sees are the
  same client.
- The launch client's screen size is `cursorTerminalSize` on the process it
  was spawned with. The registry does not keep a second size.

## Accepted proof

Promise: an instructed Cursor start shows that kept client, accepts typing,
and does not show a launch-wait notice or start a second agent. The same
client covers a typed answer, close-and-reopen while working, a model only on
the first process, a non-ready screen that later receives the instruction,
and an idle finished prompt that ends so the next open can take a follow-up.
Claude still passes output, input, and close through the shared client.

Boundary: Cursor launch and the kept terminal (`dashboard/server/hosts/cursor/launch.ts`,
`dashboard/server/launchInstruction.ts`, `dashboard/server/terminalAttachments.ts`).

Setup: `dashboard/tests/fixtures/fake-cursor` and `dashboard/tests/support/keptCursorTurn.ts`.

Observations: `dashboard/tests/agent-terminal-cursor-launch.spec.ts` (instructed
launch, typed answer, trust-then-ready, exit does not confirm, abort leaves
the client), `dashboard/tests/agent-terminal-cursor-launch-page.spec.ts`,
`dashboard/tests/agent-launch-cursor-model.spec.ts`,
`dashboard/tests/agent-terminal-cursor-idle.spec.ts`, and
`dashboard/tests/agent-terminal-boundary.spec.ts`.

Command: `npm run test:dashboard -- agent-terminal-cursor-launch.spec.ts agent-terminal-cursor-launch-page.spec.ts agent-launch-cursor-model.spec.ts agent-launch-start-cursor.spec.ts agent-launch-preparation-cursor.spec.ts agent-launch-ad-hoc-cursor.spec.ts agent-terminal-cursor.spec.ts agent-terminal-cursor-idle.spec.ts agent-terminal-boundary.spec.ts`

Result: pass, after the refactor as well. Session, completion, and the Cursor
terminal page specs passed on the same launch: `agent-session-cursor.spec.ts`,
`agent-completion-cursor.spec.ts`, `agent-terminal-cursor-page.spec.ts`.

## Execution

Story Branch Mode. Workspace
`.worktrees/see-and-instruct-a-cursor-agent-from-the-start`, branch
`cursor/see-and-instruct-a-cursor-agent-from-the-start`. Claim
`4981f17b7494882974712c33cd83142a288ca4c8` is on `origin/main`. The increment
publishes to that execution branch, not to trunk.
