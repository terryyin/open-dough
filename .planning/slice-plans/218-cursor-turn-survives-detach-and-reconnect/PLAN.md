# Keep a running Cursor turn through terminal detach and reconnect

**Identity:** SEED-052#cursor-reconnect-leaves-the-task-running
**Source:** [story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-reconnect-leaves-the-task-running).

## Execution

Story Branch Mode. Workspace `/Users/terryyin/git/open-dough/.worktrees/reconnect-to-a-cursor-session-without-interrupti` on `cursor/reconnect-to-a-cursor-session-without-interrupti`, created for this execution. Integration checkout `/Users/terryyin/git/open-dough`. Increments publish to `origin/cursor/reconnect-to-a-cursor-session-without-interrupti`. Claim `770050b45a17a7cf46069b9f11fd7746bfe6c9bb` is on `origin/main` (`pendingCi: unobserved`). Starting revision `9e2d205d47b848bc16c6177411eac61667009be2`. Agent `joseph-chan`. Publisher `cursor-596b94d2-770f-490b-914a-09a6c8c93bad`. Replanning permission preserved. CI is GitHub Actions workflow `ci.yml` (display name CI); observer `/tmp/dough-ci-501/watch-kx1qXK` covers the story branch.

## Goal and scope

A developer can close, switch away from, lose, and reconnect the terminal of a
dashboard-launched Cursor session without stopping its running turn. While
that turn runs, a reopened terminal either shows its live progress or states
that it is still working and holds input, and no second agent runs on the
chat. After the turn ends, the terminal shows its result and accepts
follow-ups as today.

Excluded: dashboard server stop or restart (`close()` still hangs up every
client); Cursor activity, model, rename, and stop; Claude Code and Codex
attach behavior; confirming the launch record's first input when a launch
process that outlived the launch wait later exits 0; live progress of the
launch process.

## Architecture

PFE:

- Cursor's own `cursor-agent persist` survives disconnects but needs tmux,
  which is not installed here. The sibling story deferred it. Excluded.
- `--print --output-format stream-json` could stream the launch turn, but it
  changes the launch command and its confirmation. The developer accepted
  the "still working" fallback for the launch turn. Excluded.
- Reuse the terminal boundary: `TerminalAttachments`
  (`server/terminalAttachments.ts`), the host `attach` contract
  (`server/launchHosts.ts`), and the page's protocol (`src/agentTerminal.ts`,
  `src/useAttachedTerminal.ts`). No protocol change is planned.

Common rule: a Cursor session has at most one live native client the
dashboard owns. That client is either the launch process or a kept terminal
client. Detaching a terminal never ends a working client. A terminal joins
the kept client, waits for the launch process, or starts a new client only
when neither exists.

The keep and wait behavior is declared by Cursor's host module
(`server/hosts/cursor/`), and shared code only honors the declaration. Claude
Code and Codex declare nothing, so their SIGHUP-on-detach stays. Accepted
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
Cursor behavior is proved with Cursor, never inferred from another host. No
North Star topic is needed.

## Observed premises

Observed on 2026-10-02 at `8e83ed74`, `cursor-agent` 2026.10.01-e373342.

- **Every detach is a socket close.** The consumer is slice 2. In
  `src/useAttachedTerminal.ts`, cleanup closes the socket (line 172) on
  Close, session switch, and unmount. A lost connection closes it too.
  `server/terminalAttachments.ts` lines 154–170 answer every close with
  `pty.kill("SIGHUP")`.
- **A real idle client exits on SIGHUP.** The consumer is slice 2's fixture
  change. A PTY `cursor-agent --workspace <this worktree> --resume <empty
  chat>` exited 0.3 s after SIGHUP, and its `worker-server` child ended with
  it.
- **The fixture differs from Cursor.** The consumer is slices 2 and 3.
  `tests/fixtures/fake-cursor` ignores SIGHUP. `agent-terminal-cursor.spec.ts`
  lines 157–173 assert SIGHUP on close, the old pid still running, and a new
  pid on reopen. That spec encodes today's behavior and will change.
- **An idle client is silent, and resize redraws it.** The consumer is slice
  2's join and slice 3's end rule. An idle PTY client wrote 0 bytes over
  15 s. After a resize from 120 to 100 columns plus SIGWINCH, it wrote
  1071 bytes containing the full prompt and status line.
- **A real client costs memory.** The consumer is slice 3's reason to exist.
  A terminal client had 372,544 KB RSS, plus a `worker-server` and MCP
  children.
- **The launch child is dropped and keeps working.** The consumer is slice 4.
  `server/hosts/cursor/launch.ts` `submitPrompt` resolves `running` when the
  launch wait aborts and keeps no reference to the child. The live session
  showed the launch process still working after a reconnect at 15:02:37: it
  wrote the seed at 15:03:27 and had exited by 16:23.
- **The page shows text before readiness and has no readiness timeout.** The
  consumer is slice 4's notice. `useAttachedTerminal.ts` lines 107–125 write
  every text frame. Readiness only gates `onAttached`.
- **Mark as done is the only caller of `endAttachments`.** The consumer is
  slice 2's scope. `server/doneMarks.ts:47` calls it, and Cursor has no Mark
  as done. `close()` is called from `agentLaunchPlugin.ts:230` on server
  close.
- **`@xterm/headless` exists at the page's xterm version.** The consumer is
  slice 3. `npm view @xterm/headless@6.0.0 version` answered `6.0.0`, and the
  page uses `@xterm/xterm` 6.0.0.

Settled by slice 1. The record is in Learnings.

## Current decisions

- A kept client fans out to every attached socket and takes input from any
  of them, so two tabs never start two agents.
- Joining a kept client sends `readiness: attached` at once, since the
  client was already admitted. It then nudges the size by one column and
  back, so Cursor redraws.
- The idle end rule fails safe. It hangs up only when the idle marker is
  present and no working or waiting marker is. An unrecognized screen keeps
  the client, so a changed Cursor screen costs memory, never a turn.
- The launch wait notice reads: "Cursor is still working on this session's
  launch prompt. The terminal opens when it finishes." Input during the wait
  is dropped.
- Slice 1: SIGHUP ends a working `cursor-agent` turn, and the screen
  separates working, idle, and waiting. Slices 2–4 stay. The idle settle
  period is the longest working output gap, 0.203 s.

## Proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| Detach ends a working Cursor turn today (symptom) | 1 | Paid probe record |
| Example 2: close or switch away from a working turn; it keeps running; reopen shows it | 2 | `agent-terminal-cursor.spec.ts` boundary case; page case in `agent-terminal-cursor-page.spec.ts` |
| Example 3: lost connection, then Reconnect, joins the same running client | 2 | Boundary case: socket drop, then a new socket on the same pid |
| No second agent from two open terminals | 2 | Boundary case: two sockets, one attach record |
| Example 4: ended turn gives the ordinary prompt and follow-up | 3 | Boundary case: idle detached client ends; the next open starts a new client that takes input |
| A turn waiting for the developer's answer is not ended | 3 | Boundary case with the fixture's waiting screen |
| Example 1: launched and still working; notice; input held; then opens | 4 | Boundary case plus a page case showing the notice |
| Example 5: Claude Code and Codex unchanged | 2–4 | `agent-terminal.spec.ts`, `agent-terminal-close.spec.ts`, `agent-terminal-codex-close.spec.ts`, `agent-terminal-lifetime.spec.ts`, `agent-terminal-reopen.spec.ts` unchanged and green |
| Launch unchanged | 4 | `agent-launch-start-cursor.spec.ts`, `agent-launch-preparation-cursor.spec.ts`, `agent-launch-ad-hoc-cursor.spec.ts` green |
| Real Cursor keeps the turn through detach and launch wait | 2, 4 | Paid real-host checks below |
| Terminal contract and host guide state Cursor's keep and wait | 2–4 | `dashboard/AGENT-LAUNCH-TERMINALS.md` and `AGENT-LAUNCH-HOSTS.md` review |

Focused proof command shape, as in plan 217:
`env -u NO_COLOR npm run test:dashboard -- <specs> --workers=2` and
`npm run typecheck:dashboard`.

## Ordered slices

### 1. Probe a real Cursor turn under detach
Type: Probe (premise observation, no product change)
Status: done
Proof: A short record in this plan's Learnings with the literal commands and
results. Accepted: that record. `cursor-agent` 2026.10.01-e373342 ended a
working turn 40 ms after SIGHUP, and the later resume never showed `done`.
Working is `ctrl+c to stop`; idle is `done` plus `Add a follow-up` without
that marker; waiting is `Clarifying Questions` with Red and Blue.

In this trusted worktree, run `cursor-agent create-chat`, then a PTY
`cursor-agent --workspace <worktree> --resume <id>` at 120×30. Read its
screen through `@xterm/headless` or an equivalent screen model.

- Ask it to run `sleep 40` and then reply `done`. Sample the screen every
  2 s and log output byte times until it is idle. Record the working and
  idle markers and the longest output gap while working.
- Repeat, and send SIGHUP 15 s in. Resume in a new client and check
  whether `done` ever appears.
- Ask it to use its question tool to offer red or blue. Record the waiting
  screen.

If the turn survives SIGHUP, stop: detach needs no keep, and the plan is
replanned around slice 4 alone. If no screen marker separates idle from
working and from waiting, stop slice 3 and bring the memory trade-off to the
developer.

### 2. Detaching a working Cursor terminal keeps the client; reopening joins it
Type: Behavior
Status: planned
Proof: `agent-terminal-cursor.spec.ts` (rewritten) and a new
`agent-terminal-cursor-page.spec.ts`, plus the Claude Code and Codex terminal
specs listed above, unchanged. Real-host check: start a dashboard Cursor
terminal turn that runs `sleep 40` and then replies `done`. Close the
terminal at 15 s, reopen at 30 s, and see the same turn finish with `done`.

Behavior: A recorded Cursor session's terminal is open and its client is
working; the fixture writes the probe's working marker. The developer closes
the socket by Close, switching sessions, or a dropped connection. The client
gets no SIGHUP and keeps running. A new socket for that session joins the
same pid with no new attach record, receives `readiness: attached`, and sees a
redrawn screen. Its input reaches that pid. A second socket opened alongside
it gets the same output, and still only one attach record exists.

Includes: an optional keep declaration in the host `attach` result, supplied
only by `server/hosts/cursor/terminal.ts`. `TerminalAttachments` keeps one
live client per Cursor session key, fans out to its sockets, and detaches
sockets without hanging up. `close()` still hangs up every client. The fixture
exits on SIGHUP as real Cursor does and gains a working mode. The terminal
contract and host guide are updated.

Interim: until slice 3, a detached kept client lives until it exits on its
own or the server closes.

Safe stopping point: no detach interrupts a terminal-started Cursor turn.

### 3. An idle detached Cursor client ends; a waiting one stays
Type: Behavior
Status: planned
Proof: New cases in `agent-terminal-cursor.spec.ts`. Slice 2's specs stay
green.

Behavior: A kept Cursor client has no socket. When its screen shows the
probe's idle marker for a settle period, the dashboard hangs it up. The next
open starts a new client, which shows the ordinary prompt and takes a
follow-up. A detached client whose screen shows a working or question-waiting
marker is not hung up.

Includes: a server-side screen for kept clients through `@xterm/headless`
6.0.0, a new dependency in the same xterm family as the page. The settle
period is the probe's longest working output gap, 0.203 s. Fixture idle and
waiting screens use the probe's observed text.

Safe stopping point: kept clients no longer accumulate memory once idle.

### 4. Opening during a running launch turn shows a notice, holds input, then opens
Type: Behavior
Status: planned
Proof: New boundary and page cases in `agent-terminal-cursor.spec.ts` and
`agent-terminal-cursor-page.spec.ts`, plus the three Cursor launch specs
unchanged. Real-host check: launch a real Cursor session with an instruction
to run `sleep 40` and then reply `done`. Open its terminal at 10 s, see the
notice, and after it finishes see `done` and the ordinary prompt.

Behavior: A Cursor launch's prompted process is still running after the
launch wait; the fixture holds until released. The developer opens the
terminal. The page shows the notice text. No attach process starts, and typed
input starts nothing. Closing and reopening during the wait shows the notice
again. When the launch process exits, the server starts the terminal client
through today's readiness path, and the page shows the ordinary prompt.

Includes: Cursor's launch module keeps the running child in a Cursor-owned
registry keyed by session until exit. Cursor's `attach` answers with a wait
when that child runs. `TerminalAttachments` honors the wait by writing the
notice, dropping input, and attaching after the child exits if the socket is
still open. The fixture holds its prompted run until a release file appears.
The terminal contract and host guide are updated.

Safe stopping point: the whole story.

## Learnings

Slice 1 probe on 2026-10-02 in this worktree. No product change. Screen read with `@xterm/headless` 6.0.0 from a temporary install in `/tmp/cursor-probe` (`package.json` and `package-lock.json` unchanged) and this worktree's `@lydell/node-pty`, at 120×30, `TERM=xterm-256color`. `cursor-agent --version` printed `2026.10.01-e373342`.
`cursor-agent create-chat` returned `00f04627-b3bc-47d0-82a2-ff31674e7f35` (observe), `4cf3b42a-19fd-4db9-ba20-d75ff14f1e3b` (SIGHUP), and `a044a83d-79bd-482d-9647-fe4428a4acdb` (question). Each client was `cursor-agent --workspace /Users/terryyin/git/open-dough/.worktrees/reconnect-to-a-cursor-session-without-interrupti --resume <id>`.
Observe and SIGHUP prompt, then Enter: `Run the shell command sleep 40 and then reply with the exact word done. Do not edit or create any files.` Question prompt, then Enter: `Use your question tool to offer the choices red or blue. Do not choose an answer. Do not edit or create any files.`

- Working, on every working sample: `→ Add a follow-up` together with `ctrl+c to stop`. Status was a braille spinner plus `Working`, then `$ sleep 40` and `Running`.
- Idle, after the reply, output stopped, with no `ctrl+c to stop`, `Working`, or `Running`:

```
  done

  → Add a follow-up
```
- Waiting, stable, with no `Add a follow-up`, `ctrl+c to stop`, `Working`, or `Running`:

```
│ Clarifying Questions
│ 1. Which do you choose?
│   › [ ] Red
│     [ ] Blue
│ ↑/↓ option · ←/→ question · Space select · Enter next/submit · Esc to skip
```
`→ Add a follow-up` marks idle only when `ctrl+c to stop` and `Clarifying Questions` are absent. The terminal cursor stayed hidden in all three states. Longest working output gap was 0.203 s, from `2026-10-02T09:18:24.328Z` to `2026-10-02T09:18:24.531Z`. SIGHUP on chat `4cf3b42a-19fd-4db9-ba20-d75ff14f1e3b`: `pty.kill("SIGHUP")` on pid 90865 at `2026-10-02T09:21:28.903Z`, screen still `$ sleep 40` and `Running`; client exited at `2026-10-02T09:21:28.943Z` (40 ms), exit code 0, signal 1. `sleep 40` (pid 91802, another process group) and `worker-server` (pid 90997) were gone. A later `--resume` client with no further prompt had no line exactly `done` (that word appeared only in the typed instruction). The working turn ended on SIGHUP. Cursor changed no repository files.
