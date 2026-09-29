# Interact with a launched Claude Code session inside the dashboard

## Source and authority

- **Identity:** SEED-052#interact-with-claude-terminal.
- **Source:** [story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#interact-with-claude-terminal),
  refined on 2026-09-29. Terry chose one terminal at a time in a right-hand
  panel with a toolbar, opening directly in place of the copyable command
  (from a card and from Recent sessions), Mark as done (detach, `done-`
  rename, stop), keeping the terminal across project switches, and native
  keys. He left open whether renaming a Claude Code session works; slice 1
  observes it.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.
- **Preparation workspace:** `.worktrees/interact-with-claude-terminal`
  (branch `claude/refine-interact-with-claude-terminal`), created at
  `a99c67f7` and announced as agent Yuma-chan at `f90c2974`.
- **Builds on:** story 2, SEED-052#revisit-dashboard-sessions (plan 150),
  now on `main` (closed at `f7e7e272`). Every file reference below is to
  `main`. The queued correction SEED-052#recent-sessions-residue (plan 151)
  touches the same Recent sessions code. Whichever runs second rebases onto
  the other.

## Outcome and boundaries

A developer who launched work from the dashboard opens that session's
ordinary Claude Code terminal beside the stories, answers its questions, and
intervenes without leaving the dashboard. When the work is finished for them,
they mark it done from the same place.

Key examples (from the story):

1. Select a card's running session → the window splits, the right panel shows
   the conversation, and an answer typed there continues it.
2. With a terminal open, select another session in Recent sessions → the first
   is detached and keeps running; the panel shows the second.
3. A story in no list → its Recent sessions entry still opens the terminal.
4. Close → the panel closes, the session keeps working, and the card can open
   it again.
5. Mark as done → the panel closes; `claude agents` shows the session stopped
   and named `done-<name>`; the card offers its Start action again while the
   story is in the Backlog; Recent sessions shows the entry as done. The
   story's place still comes from origin.
6. The server restarts with a terminal open → the panel says it is
   disconnected; Reconnect attaches to the same session again.
7. A session Claude Code no longer lists → the unavailable explanation and no
   open action.
8. No copyable `claude attach <id>` anywhere on the page.

Preserved promises: launch records and done marks are local evidence and
never change a story fact read from origin. The launch boundary's same-origin
and loopback refusals apply to the terminal too. Detaching never stops a
session. Only dashboard-launched sessions are listed or opened.

Rejection constraint (from the story): the terminal boundary runs only
`claude attach <short id>` for a session this dashboard recorded for the
requested project, in that project's folder. It never opens a shell or runs
other commands, because a local server that executes arbitrary input for any
page would hand control of the machine to that page.

Excluded (the story's deferrals): several terminals or tabs, restoring after
a reload, sharing one session between browser tabs or with an outside
terminal, a chat interface, attention or completion detection, undoing Mark
as done, and other hosts.

## Existing solutions (PFE)

- **The session's open condition already exists.** `attachOpens` in
  `src/agentLaunch.ts` (listed or state unknown, never unlisted) decides where
  the copyable command shows. The open action uses the same rule. Terry's
  open question from plan 150 on State unknown carries over unchanged.
- **One component shows a session for both places.** `LaunchSession.tsx`
  renders the session id and the copy button for a card's Started
  (`LaunchStarted.tsx`) and a Recent sessions entry (`RecentSessions.tsx`).
  Slice 3 replaces its copy button with the open action. Both places change
  in one component, and the copy code and its CSS go away.
- **The local boundary and its refusals already exist.**
  `server/localBoundaryPlugin.ts` mounts middleware in dev and preview and ends
  owned processes on close. `server/localOrigin.ts`'s `verifyLocalOrigin`
  inspects only an `IncomingMessage`, so it applies unchanged to a WebSocket
  upgrade request. Slice 2 extends `localBoundaryPlugin`'s install callback
  with the HTTP server so a boundary can take upgrades. It adds no second
  plugin mechanism.
- **Claude Code runs and listings already have one home.** `claudeCode.ts`
  holds `execClaude` (fixed argument arrays in the project folder) and
  `claudeSessions` (the one listing reader). Slice 5's `claude stop` goes
  through `execClaude`, and its rename confirmation uses `claudeSessions`.
  The attach command also lives in `claudeCode.ts`. It spawns through a PTY,
  since `execFile` cannot host a TUI.
- **Recorded sessions already have one store.** `launchRecordStore.ts` keeps
  records per project, re-read on every read. The terminal boundary checks the
  requested session against `keptRecords`. Slice 5 adds an optional done mark
  to `launchRecordSchema` and a store update beside `keepRecord`, reusing the
  same atomic replace.
- **Test fakes already model Claude Code.** `tests/fixtures/fake-claude` and
  `tests/support/fakeClaude.ts` record calls and edit `agents.json`. Slices 2
  and 5 extend the same fake with `attach` (an interactive echo that reports
  its size, handles `/rename`, and exits on Ctrl+Z) and `stop`. Its controls
  gain a way to observe the attach process ending.
- **Gap: no terminal emulator, PTY, or WebSocket exists in the product.**
  Nothing in the repository hosts an interactive process. New dependencies:
  `@xterm/xterm` 6.0.0 and `@xterm/addon-fit` 0.11.0 for the browser,
  `@lydell/node-pty` for the PTY, and `ws` 8.22.0 for the upgrade (see Current
  decisions).

ADR 0008 (Proposed) keeps local evidence separate from published facts. A
done mark is local evidence. No Accepted ADR governs local processes. The
terminal boundary is feature-local, and its rules go in `AGENT-LAUNCH.md`, so
no North Star topic is warranted. The dashboard UX North Star gets rows for
the new wording, as plan 150 added for Recent sessions.

## Current decisions

- **Transport:** one WebSocket per open terminal at
  `/__agent-terminal?source=<project id>&session=<session id>`, taken from the
  dev or preview HTTP server's `upgrade` event. The socket is the attachment:
  opening it spawns `claude attach <short id>` in a PTY in the project folder,
  and closing it from either side ends that attach process. A server close
  ends every attach process it owns. Messages: the server sends terminal
  output as text frames. The client sends JSON `{ "input": string }` or
  `{ "resize": { cols, rows } }`, and anything else closes the socket. Mark as
  done is an HTTP request to the launch boundary (slice 5), not a socket
  message.
- **Refusal before any process:** the upgrade gets an HTTP error and no socket
  when `verifyLocalOrigin` refuses, the project is unknown, the session id is
  not in that project's kept records, or Claude Code does not list the
  session. Refused cases start no `claude`.
- **PTY package:** `@lydell/node-pty` (1.2.0-beta.15), a fork of `node-pty`
  that ships prebuilt binaries for darwin, linux, and win32 (x64 and arm64)
  as optional packages. The official `node-pty` 1.1.0 has no Linux prebuild,
  so CI (`ubuntu-24.04`) would compile it. On macOS its `spawn-helper` also
  installs without execute permission, and spawning fails until it is fixed.
  Terry accepted the fork on 2026-09-29. Either package can be swapped behind
  the one spawn call in `claudeCode.ts`.
- **Browser terminal:** `@xterm/xterm` with `@xterm/addon-fit`, bundled by
  Vite, with its default DOM renderer, so Playwright reads the rows as text.
  The fit addon sets the size, and each change is sent as `resize`.
- **Layout:** with a terminal open, the page becomes two columns: the existing
  page on the left and the terminal panel on the right. The panel's toolbar
  names the session (story title, workflow, session id) and holds Close and,
  from slice 5, Mark as done. Opening another session replaces the panel's
  session. The open terminal is page state above the project selection, so
  switching projects keeps it. A reload starts without one.
- **Done mark:** an optional `doneAt` on the launch record. Recent sessions
  labels a marked record "Done" when its session is not running, shows the
  session name with the `done-` prefix, and otherwise shows the running label
  as today. Started needs no new rule, because a stopped session already ends
  it (story 2).
- **Rename:** follows slice 1's observation. If typing `/rename done-<name>`
  and Enter into the attached terminal renames the session in
  `claude agents`, Mark as done sends that through the open PTY and waits
  briefly (a few seconds) for the listing to show the new name. A busy
  session queues the command until its turn ends, so the wait can expire.
  Then the `done-` name exists only in the dashboard record, which the entry
  shows either way. The record's mark and `claude stop` always happen.
- **Wording** (for the North Star and specs; adjust only for consistency with
  existing rows): "Open terminal", "Close", "Mark as done", "Disconnected from
  the session", "Reconnect", "The terminal ended", "Open again", and "Done".

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| A Node PTY spawns an interactive process with a set size and passes input. | Installed `node-pty` 1.1.0 and `@lydell/node-pty` 1.2.0-beta.15 in a temporary directory (Node 24.5.0, darwin-arm64), spawned `sh -c 'stty size; read x; echo got:$x'` at 100×30, and wrote `hello\r`. | Both print `30 100` and `got:hello`. `node-pty` first failed with `posix_spawnp failed` until `chmod +x` on its `spawn-helper`. The fork works as installed. |
| CI can install the PTY without compiling. | `npm view @lydell/node-pty optionalDependencies`; read `.github/workflows/ci.yml`. | `@lydell/node-pty-linux-x64` exists. CI runs `ubuntu-24.04`, Node 24, `npm ci`. |
| A WebSocket upgrade works beside Vite's HMR socket, in dev and preview. | A temporary Vite 8.3.0 config whose plugin handles `upgrade` for `/__probe` on `server.httpServer` in `configureServer` and `configurePreviewServer`; a `ws` client connected to both, and a `vite-hmr` client to dev. | Dev and preview both answered on `/__probe`. HMR still answered `{"type":"connected"}`. The upgrade carried `Origin`. |
| xterm 6 renders rows as DOM text Playwright can read. | Installed `@xterm/xterm` 6.0.0 and searched its bundle. | `DomRenderer` is present and is the default (the canvas renderer is an addon). Slice 3's spec confirms the reading. |
| Detaching leaves a session running, and a stopped session can be reopened. | `claude attach --help` and `claude --help` (Claude Code 2.1.284). | Attach: "The session keeps running either way" for ← and Ctrl+Z. `stop`: "Its conversation is kept: `claude attach <id>` opens it again." Whether killing the attach process also leaves the session running is not documented. Slice 1 observes it. |
| Claude Code has no CLI rename for a background session. | `claude --help` and `claude agents --help`; Claude Code docs (`commands.md`, `cli-reference.md`, `agent-view.md`) read through a docs lookup. | Only `--name` at launch. `/rename [name]` renames the current session, and Ctrl+R renames a row in the interactive agent view. The docs do not say whether `/rename` changes `claude agents --json`'s `name`. A command sent while Claude is responding is queued until the turn ends, so a rename sent to a busy session would be lost to an immediate `stop`. Slice 1 observes the listed name. |
| Story 2's code is what this plan extends. | `git merge-base --is-ancestor c25e538d origin/main` at `616a8aa2` (2026-09-29); read `LaunchSession.tsx`, `RecentSessions.tsx`, `agentLaunchPlugin.ts`, `claudeCode.ts`, `agentLaunches.ts`, `launchRecordStore.ts`, `fake-claude`, `fakeClaude.ts` (`machine` option). | Plan 150's commits are on `main`. `attachOpens`, `verifyLocalOrigin`, `keptRecords`, `keepRecord`, `execClaude`, and `claudeSessions` exist as the PFE notes describe. |

## Slices

### 1. Probe: attaching through a PTY, detaching, and renaming a real session
Type: Structure
Status: planned
Proof: a manual observation Terry runs, recorded here.

Internal change: none to the product. A throwaway script in the job's
temporary directory spawns `claude attach <id>` through `@lydell/node-pty` on
a real background session Terry chooses, or on one he starts for the probe.
Starting a session costs model usage, so only Terry triggers it. Observe:

1. The attached TUI's output arrives, and typed input reaches the session.
2. Killing the attach process (SIGHUP, then SIGTERM) leaves the session
   listed with a status in `claude agents --json`.
3. Typing `/rename done-<name>` and Enter while the session is idle changes
   its `name` in `claude agents --json`. Repeat while it is busy to confirm
   the documented queueing.
4. `claude stop <id>` afterwards leaves it listed with no status and its new
   name.

Enables slice 2. If 2 fails, stop and bring the story back to Terry, because
Close would stop sessions. If 3 fails, the rename goes only on the dashboard
record (Current decisions) and slice 5 drops the PTY rename. Record the
literal commands and results here, and adjust the fake's `attach` to match
what was seen.

### 2. The terminal boundary attaches a WebSocket to a recorded session and refuses everything else
Type: Behavior
Status: planned
Proof: new `agent-terminal-boundary.spec.ts` against dev and preview servers with the fake `claude`.

Behavior: a project has a kept launch whose session Claude Code lists → a
same-origin client opens `/__agent-terminal?source=&session=` → the server
runs `claude attach <short id>` in the project folder through a PTY, output
arrives on the socket, input and resize reach the process, and closing the
socket ends that attach process while the fake session stays listed. A
cross-origin or non-loopback upgrade, an unknown project, an unrecorded
session, or an unlisted one is refused with no socket and no `claude attach`
call. Closing the server ends open attach processes.

Extend `localBoundaryPlugin` so `install` also receives the HTTP server.
Add the upgrade handler beside the launch middleware, and the PTY spawn in
`claudeCode.ts`. Add the dependencies. Give the fake `claude` an `attach`
mode (print `attached <id> <cols>x<rows>`, echo lines, report its new size on
SIGWINCH, write its pid and exit signal for the controls) and add the
matching controls in `fakeClaude.ts`. Document the boundary in
`AGENT-LAUNCH.md`.

Proof: the spec uses a `ws` client with and without a same-origin `Origin`.
It asserts the attach call's argv and cwd, echoed input, the reported size
after a resize, the attach process ending on socket close and on server
close, and each refusal's status with no attach call. Run the new spec with
`agent-launch-boundary.spec.ts` and `agent-launch-refusal.spec.ts`, since the
plugin change reaches their servers, plus `npm run typecheck:dashboard`.

### 3. A card or Recent sessions entry opens its session in the right-hand terminal, one at a time
Type: Behavior
Status: planned
Proof: new `agent-terminal.spec.ts` page journey; the existing Started and Recent sessions specs updated.

Behavior: a Backlog card shows a running session's Started, or Recent
sessions lists an openable entry → the developer presses Open terminal →
the page splits, and the right panel's toolbar names the session and shows
its conversation. Typed text reaches the session and its answer appears
(example 1). Opening another session detaches the first and shows the second
(example 2). An entry whose story is in no list opens too (example 3). Close
ends the panel and leaves the session running and openable (example 4). An
unavailable entry offers no open action (example 7). No copyable attach
command remains (example 8). The terminal's size follows the panel.

Replace `LaunchSession`'s copy button with Open terminal, under
`attachOpens`. Add the panel component (xterm, fit, socket, toolbar with
Close) and the two-column layout in `App.tsx`. Remove the copy code and its
CSS. Update `AGENT-LAUNCH.md`, `dashboard/README.md`, and the North Star rows
for Launch actions / Started and Recent sessions.

Proof: the new spec drives `tests/launchJourney.ts`: launch two stories, open
one from its card, type, and read the echo in the terminal rows. Then open the
other from Recent sessions and assert the first attach process ended and its
session still lists. Move the first story out of every list and open its
entry. Close, and assert the panel is gone and the card still offers Open
terminal. Forget a session and assert it has no open action. Assert no page
text contains `claude attach`. Update the attach-command assertions in
`agent-launch-recent-sessions.spec.ts`,
`agent-launch-recent-session-states.spec.ts`, and `agent-launch-card.spec.ts`
to the open action. Run those with `agent-launch-session-settlement.spec.ts`.

### 4. The open terminal survives a project switch and says when it is disconnected or ended
Type: Behavior
Status: planned
Proof: `agent-terminal.spec.ts` extended with switch, restart, and exit cases.

Behavior: a terminal is open → the developer switches projects → it stays
open on the same session. The dashboard server restarts → the panel says
"Disconnected from the session", and Reconnect attaches again, showing the
session (example 6). The attached CLI exits (Ctrl+Z in the fake) → the panel
says "The terminal ended", and Open again reattaches. A reload shows no
panel.

Handle socket close in the panel: tell a server-side close after the process
exited apart from a lost connection, using a close code the boundary sends
when its attach process exits. Add the panel states and their actions. Update
`AGENT-LAUNCH.md` and the North Star row.

Proof: extend the spec. Switch projects and back with the terminal still
attached (no new attach call). Restart the server on the same machine
directory (the `machine` option from plan 150) and press Reconnect. Send
Ctrl+Z and press Open again. Reload.

### 5. Mark as done renames and stops the session and shows it done
Type: Behavior
Status: planned
Proof: `agent-terminal.spec.ts` for the page; `agent-terminal-boundary.spec.ts` for the done request's refusals.

Behavior: a terminal is open → the developer presses Mark as done → the panel
closes. The session is renamed `done-<name>` in Claude Code (or only in the
record, per slice 1) and stopped. The card offers its Start action again
while the story is in the Backlog. Recent sessions shows the entry as
"Done" under the `done-` name. The story's placement is unchanged
(example 5).

Add a POST on the launch boundary that marks one recorded session done. It
refuses the same way launches do, and an unrecorded session. It sends the
rename through the session's open PTY when slice 1 showed it works, waits for
`claudeSessions` to show the name, and records `doneAt` in the store
atomically. Then it ends the attach process and runs `claude stop <short id>`
through `execClaude`. The fake gains `stop` and `/rename`. Add the toolbar
button and the Done label. Update `AGENT-LAUNCH.md` and the North Star row.

Proof: the page spec presses Mark as done and asserts the fake's calls
(rename input, then `stop`) and the fake listing (stopped, new name). It also
asserts the card's Start action is back, the entry reads Done with the new
name, and the story is still in the Backlog. The boundary spec asserts
refusals and that `doneAt` survives a server restart. If the rename stays in
the dashboard only, assert no rename input and the record-only name. Run
`agent-launch-session-settlement.spec.ts` and the Recent sessions specs too,
since the record schema changes.

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Detaching never stops a session | 1: killed attach, session still listed; 2–3: fake session still listed after close |
| Only `claude attach` for a recorded, listed session in its folder; other sites refused | 2: boundary refusals with no attach call; argv and cwd asserted |
| Input reaches the session and output shows (example 1) | 2: echo over the socket; 3: echo in the terminal rows |
| One terminal at a time; opening another detaches (example 2) | 3: first attach ended, second shown |
| A session with no story card opens (example 3) | 3: entry opened after the story left every list |
| Close detaches only (example 4) | 3: panel gone, session listed, open offered |
| Unavailable session offers no open action (example 7) | 3: forgotten session |
| No copyable attach command (example 8) | 3: page text assertion |
| Terminal kept across project switch; reload closes it | 4: switch without a new attach; reload with no panel |
| Disconnected with Reconnect after a server restart (example 6) | 4: restart on the same machine directory |
| Ended CLI shows and reopens | 4: Ctrl+Z case |
| Mark as done renames, stops, shows Done, frees the card (example 5) | 5: fake calls and listing, card action, entry label; rename mechanism per slice 1 |
| Done marks and sessions never change story facts | 3–5: story placement asserted from origin alone |

## Delivery checks

Run each slice's focused Playwright specs through
`npm run test:dashboard -- <spec files>` and `npm run typecheck:dashboard`.
The whole dashboard suite is not a local gate. Slice 2's plugin change reaches
every server, so its proof also runs one unrelated read-boundary spec
(`authenticated-read-boundary.spec.ts`) to confirm reads still mount. Hosted
CI runs the rest and also covers the Linux PTY install. No payload or skill
file changes, so payload checks are not needed. Use independent post-change
refactoring and ordinary managed delivery. Keep dashboard wording consistent
with the UX North Star. Slice 1 is manual and paid, so it is never automated.

## Concern review

Cumulative design: one socket is one attachment, from one boundary that
reuses the launch boundary's refusals and records. One component offers the
open action in both places. One panel owns the terminal and its states. The
done mark is one optional record field that Recent sessions reads. The PTY
spawn and `claude stop` join the existing Claude Code host module. Each
Behavior slice has its own proof loop: the boundary, the page journey,
lifetime, and done. Slice 3 is the largest: the panel, layout, and
replacement of the copy command make one observable outcome, and a panel
without an entry point would be unobservable. Slice 1 is a probe whose failure
changes slices 3 and 5 before they start. No other blocking slice-specific
concern was identified in this review.
