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

A confirmed launch replaces its own action with a Started record naming its
workflow, such as **Refinement started**; the card's other action stays, and a
story launched in both workflows shows both records. Started gives when it was
launched, the session id, and **Open terminal**, which shows the session in
the page's terminal (below). Started is local evidence from this machine, not a
story fact; the story stays in the Backlog until origin publishes what the
session does. A failed launch (the project folder or `claude` not found, a
folder Claude Code does not trust yet, or a refusal) says why, and nothing was
launched. An uncertain one (no answer within the launch wait, or no session to
confirm) advises checking `claude agents` before starting again. Either answer
stays beside its own action, which stays on the card.

Started lasts while origin still shows the story in the Backlog without the
assignment its workflow asks for and its session may still run. Reloading the
page or selecting another project and back keeps it, because the page reads the
project's launch records again from the local server
(`GET /__agent-launch?source=<project id>`). A
published **Preparing** assignment is the one refinement asks for: it ends a
refinement Started, and Start refinement then carries the note "Being
prepared". It does not end an execution Started, since the session may ready
the story before taking it; the card then shows both. A refinement launched on
a card already Preparing therefore settles at once and shows no Started; its
session is listed under Recent sessions. Once origin shows the story under
**Taken**, or no longer lists it at all, every Started is gone and the
published card speaks for the story. Started also ends once its session no
longer runs before origin shows the assignment: Claude Code lists it as
finished or stopped, or no longer lists it. Its action is offered again, with
its note, and its Recent sessions entry stays with that state. While Claude
Code's listing cannot be read, Started stays.

**Recent sessions**, below the stages, lists every launch record the page
reads for the selected project, newest first, whatever origin now shows of its
story. Each entry names the story's title and identity, its workflow, when it
was launched, the session id, and the same **Open terminal** as Started,
marked "Local: launched from this dashboard on this machine." An
entry does not settle: it stays when the story is prepared, taken, or leaves
every list, and two launches of one story are two entries. Another project's
launches are listed only under that project, and sessions this dashboard did
not launch are not listed. With no records it says that no sessions launched
from this dashboard are kept.

Each entry also shows its session's state, read from `claude agents --json
--all` in the project's folder whenever the records are read and never kept:
**Working** or **Idle** while its process runs busy or idle, **Finished** once
it is done, and **Stopped** otherwise. A session Claude Code no longer lists
shows **Session unavailable** without Open terminal; if the listing cannot be
read, every entry shows **State unknown** with "Claude Code's session list
could not be read" and keeps Open terminal. While the page
is visible it reads the records again every 15 seconds, the pace of its
revision checks, so a state change shows without a reload. With no records,
`claude` is not run.

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
that attach process, which detaches only: the session keeps running. The
upgrade is refused with an HTTP error and no socket, before any `claude
attach`, when it comes from another site or host (403), names an unknown
project (404), names a session this dashboard did not record for that project
(404, without running `claude` at all), finds the project folder missing
(404), or names a session Claude Code no longer lists (410). As for Open
terminal, a stopped session and one whose state is unknown still attach.

**Open terminal** on a Started or a Recent sessions entry opens that session
in the page's one terminal (`src/TerminalPanel.tsx`, an xterm.js terminal on
that socket). The page splits into two columns: the page stays on the left,
and the terminal panel takes the right, above the page on a narrow window. Its
toolbar names the story title, the workflow, and the session id, and holds
**Close**. The terminal shows the session's conversation, what the developer
types there goes to the session, and its size follows the panel. Opening
another session closes the first one's socket, which detaches it while it
keeps running, and shows the other in the same panel. An entry whose story is
in no list opens the same way. **Close** removes the panel and detaches only:
the session keeps running, and its Open terminal is offered again.

Launch records are kept on this machine, outside every repository, in
`~/.open-dough/dashboard/agent-launches.json`. Restarting `npm run
dev:dashboard` or `npm run preview:dashboard` keeps them, and a dev and a
preview server on the same machine answer the same records. A record launched
more than 30 days ago is no longer answered. If that file cannot be read, the
dashboard answers no records and leaves the file alone; the next launch moves
it aside as `agent-launches.json.unreadable` and starts a new one. Origin still
shows the story truthfully, because nothing about the story itself was ever
kept here.
