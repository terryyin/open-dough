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
session in `claude agents --json`.

A confirmed launch replaces its own action with a Started record naming its
workflow, such as **Refinement started**; the card's other action stays, and a
story launched in both workflows shows both records. Started gives when it was
launched, the session id, and a copyable `claude attach <id>` to reach the
session from a terminal. Started is local evidence from this machine, not a
story fact; the story stays in the Backlog until origin publishes what the
session does. A failed launch (the project folder or `claude` not found, a
folder Claude Code does not trust yet, or a refusal) says why, and nothing was
launched. An uncertain one (no answer within the launch wait, or no session to
confirm) advises checking `claude agents` before starting again. Either answer
stays beside its own action, which stays on the card.

Started lasts while origin still shows the story in the Backlog without the
assignment its workflow asks for. Reloading the page or selecting another
project and back keeps it, because the page reads the project's launch records
again from the local server (`GET /__agent-launch?source=<project id>`). A
published **Preparing** assignment is the one refinement asks for: it ends a
refinement Started, and Start refinement then carries the note "Being
prepared". It does not end an execution Started, since the session may ready
the story before taking it; the card then shows both. A refinement launched on
a card already Preparing therefore settles at once and shows no Started; its
session is listed under Recent sessions. Once origin shows the story under
**Taken**, or no longer lists it at all, every Started is gone and the
published card speaks for the story.

**Recent sessions**, below the stages, lists every launch record the page
reads for the selected project, newest first, whatever origin now shows of its
story. Each entry names the story's title and identity, its workflow, when it
was launched, the session id, and the same copyable `claude attach <id>` as
Started, marked "Local: launched from this dashboard on this machine." An
entry does not settle: it stays when the story is prepared, taken, or leaves
every list, and two launches of one story are two entries. Another project's
launches are listed only under that project, and sessions this dashboard did
not launch are not listed. With no records it says that no sessions launched
from this dashboard are kept.

Launch records are kept on this machine, outside every repository, in
`~/.open-dough/dashboard/agent-launches.json`. Restarting `npm run
dev:dashboard` or `npm run preview:dashboard` keeps them, and a dev and a
preview server on the same machine answer the same records. A record launched
more than 30 days ago is no longer answered. If that file cannot be read, the
dashboard answers no records and leaves the file alone; the next launch moves
it aside as `agent-launches.json.unreadable` and starts a new one. Origin still
shows the story truthfully, because nothing about the story itself was ever
kept here.
