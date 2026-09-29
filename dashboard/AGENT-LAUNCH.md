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
instruction to refine and plan it first. Each action opens a dialog, such as
"Start refinement in Claude Code", naming the story and the command the
session starts with, with an optional instruction; **Start** sends it, and
**Cancel** or Escape sends nothing.

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

Started lasts while origin still shows the story in the Backlog. Reloading the
page or selecting another project and back keeps it, because the page reads
the project's launch records again from the local server
(`GET /__agent-launch?source=<project id>`). A published **Preparing**
assignment does not end an execution Started, since the session may ready the
story before taking it; the card then shows both. Once origin shows the story
under **Taken**, or no longer lists it at all, Started is gone and the
published card speaks for the story.

Launch records are kept only by the running dashboard server, in memory.
Restarting `npm run dev:dashboard` or `npm run preview:dashboard` forgets them,
so a card offers each action again even though its session may still be
running; check `claude agents` before starting it again. Origin still shows the
story truthfully, because nothing about the story itself was ever kept here.
