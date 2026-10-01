# Dashboard agent launch

The [story dashboard](README.md) starts work on this machine through the same
launch dialog and local boundary for Claude Code and Codex. Origin alone decides
story membership, preparation and completion; a launch record is local evidence.

| Workflow   | Action           | Installed skill          |
| ---------- | ---------------- | ------------------------ |
| Execution  | Start execution  | `dough-execute-plan`     |
| Refinement | Start refinement | `dough-story-refinement` |
| Ad hoc     | Start session    | No story or skill        |

Backlog cards offer execution then refinement. Execution remains available when
not marked Ready for execution, with that note; refinement remains available
while Preparing, with “Being prepared”. Taken cards offer only a kept execution
start with no session. The project row offers Start session independently of the
published read, including when it failed. Projects use `~/git/<project id>`.

The modal names story/host/instruction, focuses the optional instruction, and
sends nothing on Cancel/Escape. Start shows “Starting…”. Closing restores the
launching action’s keyboard unless its session took focus; dismissal cannot
cancel a submitted launch.

Host selects Claude Code or Codex. Model opens on Default. Claude also offers
Fable, Opus and Sonnet; a selection sends its `--model` alias before the prompt.
Codex offers only its configured default and refuses a forged Claude model
selection. Switching hosts clears the model; no authentication, trust, approval,
sandbox, permission or reasoning setting is overridden by the dashboard.
Requested model/options lines describe requests, never the effective model.

## Installed options

See [installed launch options](AGENT-LAUNCH-OPTIONS.md) for host-qualified
refinement definitions, selection, validation and recovery. Execution and ad hoc
have no options.

## Start and session choices

How a story's start is established before its native session and recovered,
and what the dialog's Session choices select, are in
[launch start](LAUNCH-START.md).

## Native hosts and durable evidence

`server/launchHosts.ts` dispatches to one public host boundary. Common workflow,
records, actions and presentation do not call another host's private helpers.
Identity is host plus the opaque native conversation ID throughout stores,
merging, page keys, focus and action lookup. Equal IDs in different hosts stay
separate. Claude additionally retains its native attach/stop alias; Codex needs
no fabricated alias. Predecessor actions without host address Claude only.

Claude runs `claude --bg --name '<project> · <kind> · <title>'` in the project or
established workspace. Its prompt is `/<skill> <identity> <flags>`, the installed
handoff when present, then optional instruction, separated by blank lines.
It confirms through `claude agents --json --all`; an unreadable/unconfirmed
answer is uncertain. Missing CLI, refusal and untrusted folder are explained
without exposing raw stderr; timeout never establishes absence.

Codex discovers/starts the vendor's shared daemon with `codex app-server daemon start`
from the machine's home directory and connects to its Unix socket. It outlives retired worktrees.
`thread/start` receives only the workspace; its returned `thread.id` is the
conversation ID, never the initialization/session ID. The common store awaits
durable identity before `turn/start`. First input contains `$<skill> <identity> <flags>`,
the installed handoff, optional instruction and native skill input identifying
the workspace's `.agents/skills/<skill>/SKILL.md`; ad hoc sends only optional text.

Creation refusal submits no input, keeps preparation and reports a validated, bounded
native error message without dumping error data. A daemon whose working directory was
removed needs a restart; the dashboard never restarts it automatically. Before creation,
the launch document keeps workspace/endpoint. Without a trusted ID, cards/Recent show
a native history picker; Start requires reconciliation.
Known input is awaiting before submission, uncertain before acknowledgment,
confirmed by acceptance or matching saved intent in native history. Start reads/
resumes the saved ID, verifies CWD and preserves original preparation/text.
Empty, unrelated, unreadable or mismatched history never proves input rejected.
Only durable no-submission/explicit-refusal evidence permits the saved input in
that conversation. Store failure prevents submission and explains continuation.
Confirmation clears pending acceptance explanations, including legacy stale uncertainty.
Connection loss retains the command with a separate continuation notice. Neither fact
claims live/story state; predecessor Claude records remain confirmed.
Codex records retain the exact native continuation arguments, endpoint and
workspace. Cards/Recent show a shell-quoted command:
`codex resume --remote <native Unix endpoint> --cd <recorded workspace> <thread ID>`.
Use it in an ordinary terminal to read, answer questions and handle configured
approval in the same native conversation, including while a turn is active.
The browser never executes a shell command. Native configuration/authentication
remain those of the installed Codex CLI and shared daemon.
Launch outlives HTTP callers/page closure; Codex retains its connection until native completion or connection failure.
It accounts for terminal/error events racing durable acknowledgment, retains
recovery on background failure, and disposes the failed connection. It never
answers native approval/input requests or interrupts the native turn. Server
shutdown detaches dashboard connections, leaving the vendor daemon and saved
conversation alive. Later lifecycle updates cannot recreate a deleted record.

Codex supports recorded-conversation observation, embedded CLI interaction and
Mark as done through the shared session controls. Missing saved endpoints remain
unknown; they never fall back to Claude. Blank ad hoc startup persists the native
conversation before releasing its creator, with no artificial empty model turn.
Its record says no instruction was submitted; the CLI accepts the first instruction
in that same conversation after page/server restart. Uncertain persistence keeps
the original blank intent for conservative recovery without another thread.

For refinement, Codex desktop can also open the original conversation to follow its
active first turn, then answer its completed question in that same conversation.
There is no separate handoff action: the existing launch client releases its
connection when the native turn completes. Starting input during an active turn
remains subject to Codex's native rules.

## History, observation and navigation

Machine records live outside repositories in
`~/.open-dough/dashboard/agent-launches.json`. Dev/preview servers read the file
afresh and serialize the complete read-and-replace operation across dashboard
processes, so concurrent launches and done marks preserve both updates.
Replacement is atomic. Unclosed records remain indefinitely; done
records expire after 30 days. Unreadable files are preserved on reads and moved
to `.unreadable` (with timestamp suffix for an existing copy) on the next write.
Page/server restarts preserve native identity, workspace, options and evidence.

Cards list all unclosed sessions for their project/story newest first. Recent
sessions list every selected-project record newest first, including done or
stories absent from published lists; it appears only with readable published
work. Ad hoc labels collapse whitespace, truncate at 40 characters with ellipsis,
or use local launch time for blank/control-character text; no card lists them.
Reading sessions is distinguished from none kept. A session still navigates
when its story changes stage or disappears. Only dashboard-recorded sessions
appear; another project's records never count on a card.

Host adapters normalize native state for the shared cards, Recent sessions,
sidebar/counts and alerts; observations are never persisted. Claude reads one
machine listing. Codex groups recorded targets by saved endpoint, reads metadata
and only the latest needed turn, without resume, subscription or interactive
ownership. Endpoint failures leave independent healthy records readable.

Working means active work. Typed native waits mean Needs input with a reason;
a completed reply means Ready for review, including ordinary prose questions.
Failure/interruption need attention. A blank has Awaiting first instruction.
An unloaded Codex conversation with retained history remains resumable. Confirmed
absence means Session unavailable; unreadable/unsupported data stays unknown.
Unrecognized Codex state keeps native provenance and raises no guessed alert.
A done mark suppresses attention, showing Working while working, Done otherwise.
Native structured waiting must be supplied by the configured tool/policy; a
never-policy run does not establish approval parity.

The page reads machine records on load, while visible every 15 seconds, and
when visible again. Attention counts share each entry's reading. The server
also watches independently every 15 seconds, notifying macOS with Glass when an
unmarked session enters an alerting reading; its first read establishes baseline,
changed reason alone never repeats, and returning through working allows a new
alert. Unknown never alerts; unavailable/unrecognized may. `osascript` receives
argument text, never interpolated script; absence/refusal is reported in the
open sidebar, and the watcher continues. Each server has its own alert baseline.

Sessions sidebar lists unclosed records across projects: attention first oldest
first, others newest first. Sessions button badge counts attention only. Rows
show ellipsized title and largest elapsed unit, updated every 30 seconds, with
state border plus accessible label and tooltip. Command+B toggles it except in
an open dialog; Ctrl+B still reaches the terminal. Sidebar state survives reload
in browser storage. Closing while focused there restores the Sessions button.
Wide layout is sidebar/page/terminal; narrow sidebar overlays below the banner,
terminal stacks above page. Opening a row changes project/history and reveals
its card or Recent entry until user navigation; reduced motion skips animation.

## Embedded terminals and local record actions

Same-origin `/__agent-terminal?source=&host=&session=` admits recorded host-qualified
sessions in existing project folders. Claude uses `claude attach <native alias>`;
Codex uses the saved ID, endpoint and workspace with ordinary `codex resume`
and `--no-alt-screen`. Unknown project/session, missing folder and unavailable
sessions are refused before attachment. Text frames carry output; bounded input,
resize and rendered readiness messages share the existing transport.
Closing socket/server sends SIGHUP to the attachment client only, retaining
native work/history and daemon. CLI exit uses code 4000 so the page distinguishes
ended from disconnected. Codex spawn alone does not establish readiness: native
hook/trust UI remains interactive, and a completed composer frame with visible
cursor confirms attachment. Refusal preserves done intent; successful original-ID
attachment clears it. Claude retains its immediate admitted-attachment behavior.

One page terminal shows story/workflow/session with Close and Mark as done.
Switching sessions detaches the prior one; switching projects keeps it attached.
Reload has no terminal. Disconnection offers Reconnect; native attach exit offers
Open again, each for the same session. Close restores the originating control.
Shown entries/cards are outlined and sidebar entry current; closing clears them.

Mark as done uses one operation from card or terminal. It saves local done intent,
closes dashboard attachments and requests native rename/stop. Codex renames with
`thread/name/set` and interrupts only the observed nonempty in-progress turn ID;
completed/unloaded history needs no invented interrupt. A race/refusal never
retries against a newer turn. Claude retains its attachment `/rename` and listing
confirmation, then its listed-or-unknown stop behavior. Native history is retained.

Recent keeps the done record/name; cards/sidebar exclude it. A bounded diagnostic
persists when native rename/stop is unconfirmed, while live Working remains
truthful. Local intent proves neither native stop nor published story completion.
Failed reopen preserves the mark; successful native attachment clears it and
returns the original session to its card. Deferred failures cannot undo a newer
successful reopen or recreate a deleted record.

Delete record is offered for unknown/unavailable observation on cards/Recent,
with in-place question, Delete record/Keep and keyboard on Keep. Keep/Escape
restore the action. It rereads state; newly known state keeps the record with an
explanation. Deletion forgets only host-qualified dashboard evidence, never
stops/renames/marks native work. Failure retains the question and focus; success
removes every entry, prevents older reads/lifecycle updates restoring it, closes
any showing terminal and restores next-entry/card/Recent focus with a polite
“Session record deleted”. No local action changes a published story fact.
