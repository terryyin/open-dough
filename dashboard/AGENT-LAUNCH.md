# Dashboard agent launch

How the [story dashboard](README.md) starts a workflow on a queued story in a
Claude Code background session on this machine. Two workflows can be started:

| Workflow | Action | Skill it runs |
| --- | --- | --- |
| Execution | **Start execution** | `dough-execute-plan` |
| Refinement | **Start refinement** | `dough-story-refinement` |

Every **Backlog** card offers **Start execution** and then **Start
refinement**; **Taken** cards offer neither. A card not marked **Ready for
execution** offers Start execution with the note "Not marked Ready for
execution", so the developer can still start it, for example with an
instruction to refine and plan it first. A card already showing **Preparing**
offers Start refinement with the note "Being prepared". Each action opens a
dialog, such as "Start refinement in Claude Code", naming the story and the
command the session starts with, with an optional instruction; **Start** sends
it, and **Cancel** or Escape sends nothing.

The page posts the request to a second local boundary beside the read one,
`/__agent-launch` (`server/agentLaunchPlugin.ts`, reached from the browser
through `src/agentLaunchClient.ts`), mounted by the same Vite configuration in
dev and preview and refusing other sites the same way. It admits only the
workflows above, and only Claude Code as the host. It runs
`claude --bg --name "<project> · <workflow> · <title>"` (for example
`Open Dough · Refinement · <title>`) in the project's folder on this machine,
`~/git/<project id>` (for example `~/git/open-dough`), with the instruction
`/<skill> <identity>`, followed by a blank line and the developer's
instruction when there is one. It passes no model, permission, or effort
choice, so the developer's own Claude Code settings apply. It confirms the
session in Claude Code's own listing, `claude agents --json --all`.

A confirmed launch lists its session on the story's card, beside the Start
actions, which stay with their notes whatever sessions are listed, and the
keyboard lands on the new entry. Each entry shows its session the way Recent
sessions does (below), without the story title and identity the card already
names: its state, its workflow, such as "Refinement started in Claude Code",
when it was launched, the session id, and **Open terminal**, which shows the
session in the page's terminal (below). Two launches, even of one workflow,
are two entries, newest first. A failed launch (the project folder or
`claude` not found, a folder Claude Code does not trust yet, or a refusal)
says why, and nothing was launched. An uncertain one (no answer within the
launch wait, or no session to confirm) advises checking `claude agents`
before starting again. Either answer stays beside its own action.

A card lists every launch record of its story that has not been marked done,
in whatever stage origin shows the story: **Backlog**, whether or not it shows
**Preparing**, or **Taken**. A Taken card lists its sessions and offers no
Start action. A refinement launched on a card already Preparing is listed
there at once. Its story's stage, its session finishing, stopping, or no
longer being listed, Claude Code's listing becoming unreadable, and the
passing of time never remove a session from its card; only marking it done
does (below). Reloading
the page, selecting another project and back, or restarting the dashboard
keeps the listing: the page reads the machine's sessions from the local
server in one request (`GET /__agent-launch`), which answers every catalog
project's kept launch records, each naming its project, and holds one session
state for the machine apart from the selected project; a card and Recent
sessions show the selected project's records from it, by project and
identity, since an identity is unique only within a project. A
listed session is local evidence from this machine, not a story fact: origin
alone places the story, and a story that leaves every list keeps its sessions
only under Recent sessions.

**Recent sessions**, below the stages, lists every launch record the page
reads for the selected project, newest first, whatever origin now shows of its
story. Each entry names the story's title and identity, its workflow, when it
was launched, the session id, and the same **Open terminal** as a card's
entry, marked "Local: launched from this dashboard on this machine." An
entry stays when the story is prepared, taken, or leaves every list, and when
its session is marked done, and two launches of one story are two entries.
Another project's launches are listed only under that project, and sessions
this dashboard did not launch are not listed. With no records it says that no
sessions launched from this dashboard are kept.

Each entry, in Recent sessions and on a card, also shows its session's state,
read from one `claude agents --json --all` run in the machine's home folder
(Claude Code lists every session on the machine wherever it runs) whenever the
records are read, and never kept, and whether the developer is needed there. One
reading (`src/sessionShown.ts`) decides both from Claude Code's `state` alone;
whether the process runs or is idle does not. A session not marked done needs
attention while Claude Code lists it `blocked`, shown **Needs input** with what
it waits for when Claude Code reports `waitingFor` (for a question, Claude Code
2.1.284 reports only "input needed"); `done`, shown **Ready for review**
whether its process still runs or has exited; `failed`, shown **Session
failed**; or `stopped`, shown **Session stopped**. Such an entry has a solid,
heavier edge beside those words. A `working` session shows **Working**, busy or
idle between steps, and needs no attention; a state this reading does not know
shows **State not recognized** with the state Claude Code lists, and no
attention. Opening or closing a session's terminal leaves its attention as it
is; the next listing that no longer asks for the developer, or a successful
Mark as done, clears it. A session marked done (below) needs no attention while
it stays marked: it shows **Working** while Claude Code lists it working and
**Done** otherwise; opening its terminal here reopens it (below). A session
Claude Code no longer lists shows **Session unavailable** (**Done** once marked
done) without Open terminal; if the listing cannot be read, every entry shows
**State unknown** with "Claude Code's session list could not be read", no
attention, and keeps Open terminal. While the page
is visible it reads the records again every 15 seconds, the pace of its
revision checks, so a state change shows without a reload. With no records
kept for any project, `claude` is not run.

A card whose listed sessions include any that need attention says so above
them, by the same reading: "1 session needs attention", or "<N> sessions need
attention" for more; with none, it says nothing. Each entry still names its
own reason, so one working session never hides another that needs the
developer, and an unavailable or unknown session is not counted. The count is
worked out from the card's listed sessions whenever the records are read,
never kept, so a later listing, a Mark as done, a reload, or a return from
another project shows it afresh, and another project's sessions never count.
It never changes the card's stage, position, or published facts. A story that
leaves every list keeps each affected session, with its reason and Open
terminal, under Recent sessions.

The launch boundary also attaches a terminal to a session it launched. A
same-origin WebSocket to
`/__agent-terminal?source=<project id>&session=<session id>`
(`server/agentTerminals.ts`, contract in `src/agentTerminal.ts`) runs
`claude attach <short id>` in the project's folder through a pseudo-terminal,
and nothing else: never a shell or another command. The server sends the
session's terminal output as text frames. The page sends only
`{ "input": "<text>" }`, typed into the session, or
`{ "resize": { "cols": <n>, "rows": <n> } }`; anything else closes the
socket. Closing the socket from either side, or stopping the server, ends
that attach process, which detaches only: the session keeps running. An
attach process that exits on its own, as Claude Code does on Ctrl+Z, closes
the socket with code 4000 (`terminalEndedCode`), so the page can tell an ended
terminal from a lost connection. The
upgrade is refused with an HTTP error and no socket, before any `claude
attach`, when it comes from another site or host (403), names an unknown
project (404), names a session this dashboard did not record for that project
(404, without running `claude` at all), finds the project folder missing
(404), or names a session Claude Code no longer lists (410). As for Open
terminal, a stopped session and one whose state is unknown still attach. An
admitted attach to a session marked done clears the record's done time once
`claude attach` has started, before any of its output reaches the socket; a
refused upgrade, or an attach that could not start, leaves the mark.

**Open terminal** on a card's entry or a Recent sessions entry opens that
session in the page's one terminal (`src/TerminalPanel.tsx`, an xterm.js
terminal on that socket). The page splits into two columns: the page stays on
the left, and the terminal panel takes the right, above the page on a narrow window. Its
toolbar names the story title, the workflow, and the session id, and holds
**Close**. The terminal shows the session's conversation, what the developer
types there goes to the session, and its size follows the panel. Opening
another session closes the first one's socket, which detaches it while it
keeps running, and shows the other in the same panel. An entry whose story is
in no list opens the same way. **Close** removes the panel and detaches only:
the session keeps running, and its Open terminal is offered again. The
keyboard returns to the Open terminal that opened the panel while it is still
on the page, and otherwise to the session's Recent sessions entry. The open
terminal is page state, so switching projects keeps it attached to the same
session, and a reload starts without one. When the connection drops, as when
the dashboard server restarts, the panel says "Disconnected from the session"
and offers **Reconnect**; when the attached CLI exits on its own, it says "The
terminal ended" and offers **Open again**. Either attaches to the same session
anew, and Close stays available.

**Mark as done**, beside Close and on every session a card lists, ends the
session for the dashboard. Both go through the same page operation. The page
posts `{ "source": "<project id>", "session": "<session id>" }` to
`/__agent-launch/done` (`server/doneMarks.ts`). The boundary
(`server/agentLaunchAdmission.ts`) refuses another site (403), an unknown
project (404), a session this dashboard did not record for that project
(404), or a missing project folder (404) before running `claude`. While the
page's terminal is attached to the session, the boundary types Claude Code's
own rename into it: Ctrl+U to clear any draft, then `/rename done-<name>`
built only from the recorded launch name (for example
`done-Open Dough · Execution · <title>`), then Enter. It waits up to five
seconds for `claude agents --json --all` to list the new name. A launch name
with a control character is never typed. A busy session queues the command
until its turn ends, so the wait can expire; then, as with no terminal
attached or an untyped name, the `done-` name is only the dashboard's. Either
way the boundary keeps the done time on the launch record and ends the
terminal's attach process. It runs `claude stop <short id>` in the project's
folder only while `claude agents --json --all` still lists the session, or
cannot be read; a session Claude Code no longer lists is only marked. A panel
showing the session closes. The panel or card entry says "The session could
not be marked done." if the boundary refused the mark or no answer came.
The session leaves its card, and the keyboard returns to the control that
opened the panel, or asked for the mark, while it is on the page; otherwise
to the session's Recent sessions entry: its Open terminal, the entry itself
when it offers none, or Recent sessions when the entry is not shown. That
entry shows **Done** and "Named done-<name>", even for a session Claude Code
no longer lists, and still offers Open terminal while Claude Code keeps the
conversation. Opening it there reopens the session: once the terminal shows
its output, the page reads the session's record again, so the session returns
to its card with its current state and its entry no longer shows Done, through
reloads and restarts. It is kept like any unclosed session until Mark as done
marks it again. A done mark is local evidence, like the launch record, and
never changes where origin places the story.

Launch records are kept on this machine, outside every repository, in
`~/.open-dough/dashboard/agent-launches.json`. Restarting `npm run
dev:dashboard` or `npm run preview:dashboard` keeps them, and a dev and a
preview server on the same machine answer the same records. A record whose
session is not marked done is kept however long ago it was launched; one marked
done more than 30 days ago is no longer answered. If that file cannot be read,
the dashboard answers no records and leaves the file alone; the next launch
moves it aside as `agent-launches.json.unreadable` and starts a new one. If an
earlier copy already has that name, the later one is moved aside as
`agent-launches.json.unreadable-<move time>` instead, so every copy is kept.
Origin still shows the story truthfully, because nothing about the story
itself was ever kept here.
