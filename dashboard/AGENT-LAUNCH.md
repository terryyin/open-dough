# Dashboard agent launch

How the [story dashboard](README.md) starts execution of a queued story in a
Claude Code background session on this machine.

Every **Backlog** card offers **Start execution**; **Taken** cards offer none.
A card not marked **Ready for execution** offers the same action with the note
"Not marked Ready for execution", so the developer can still start it, for
example with an instruction to refine and plan it first. The action opens a
dialog naming the story and Claude Code, with an optional instruction; **Start**
sends it, and **Cancel** or Escape sends nothing.

The page posts the request to a second local boundary beside the read one,
`/__agent-launch` (`server/agentLaunchPlugin.ts`, reached from the browser
through `src/agentLaunchClient.ts`), mounted by the same Vite configuration in
dev and preview and refusing other sites the same way. It runs
`claude --bg --name "<project> · <title>"` in the project's folder on this
machine, `~/git/<project id>` (for example `~/git/open-dough`), with the
instruction `/dough-execute-plan <identity>`, followed by a blank line and the
developer's instruction when there is one. It passes no model, permission, or
effort choice, so the developer's own Claude Code settings apply. It confirms
the session in `claude agents --json`.

A confirmed launch replaces the action with **Started**: when it was launched,
the session id, and a copyable `claude attach <id>` to reach the session from a
terminal. Started is local evidence from this machine, not a story fact; the
story stays in the Backlog until origin publishes what the session does. A
failed launch (the project folder or `claude` not found, a folder Claude Code
does not trust yet, or a refusal) says why, and nothing was launched. An
uncertain one (no answer within the launch wait, or no session to confirm)
advises checking `claude agents` before starting again. Both keep the action
on the card.
