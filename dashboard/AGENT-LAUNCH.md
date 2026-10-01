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

Host initially selects Claude Code and offers Claude Code or Codex. Model opens
on Default. Claude also offers
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

`src/hostDescription.ts` describes each known host's display name, skill sigil,
model offerings and labels, untrusted-answer hint and branch namespace once.
Shared server and browser consumers read those facts; native commands and
transport remain private. `server/launchHosts.ts` selects the matching registered
public boundary; an unavailable host never uses another host's implementation.
Attach and Mark as done availability is projected from that boundary's actual
optional `attach` and `stop` operations in the machine-sessions answer. Browser
controls also honor session state and workspace access; server admission retains
its own missing-operation checks. Cursor has a known branch namespace but no
delivered runtime or launch choice.

Common workflow, records, actions and presentation do not call another host's
private helpers. Some shared session wording and alert policy still branch on
host name, as described below. Identity is host plus the opaque native conversation ID
throughout stores, merging, page keys, focus and action lookup. Equal IDs in different hosts stay separate. Claude
additionally retains its native attach/stop alias; Codex needs no fabricated
alias. Predecessor actions without host address Claude only.

Each dashboard server refuses an overlapping matching launch for every host,
including ad hoc and workflows without an installed start. Matching uses project,
host, workflow and story identity, or the exact instruction for ad hoc sessions,
including blank text. Changing a story's title, instruction, model, options or
policy does not bypass the gate; distinct subjects remain independent. The gate
lasts until the launch attempt settles, including reconciliation and recording.
HTTP caller detachment does not release it. Native work continuing after startup
does not hold it; installed-start and retained-evidence protections still apply
when another launch is requested. Separate servers or machines do not share this
in-flight gate.

A host's optional `LaunchHost.creationEvidence` operation declares that native
creation needs durable evidence and supplies its native inspection arguments
and unreadable-evidence advice. Common admission refuses unreadable or matching
unresolved creation evidence before workflow or native startup for such a host.
Codex declares this requirement; Claude does not, so unreadable evidence still
admits Claude to native launch. This does not guarantee that its result can be
saved. Unreadable evidence invents no endpoint, workspace or inspection command.

The stored creation record remains workspace/endpoint and launch request without
a session ID. GET projects that evidence through its own host boundary into a
recovery view naming the host and its inspection arguments; the launch refusal
and common page format those arguments with shared shell quoting. The Codex
module derives the history picker from saved endpoint/workspace, including for
predecessor records with no stored recovery. Absent inspection support is shown
as unavailable. Shared recovery never supplies another host's command, and
reading a recovery view does not rewrite the stored record.

Session records are a discriminated union on `host`. Each variant keeps
`sessionId` and `name`; Claude requires its native `shortId`, while Codex may
carry a continuation with workspace, endpoint, resume arguments, and an optional
notice. A parsed session carries only its host's fields. Host modules narrow
to their own variant; shared presentation reads continuation by field presence.
Predecessor Codex records without continuation still load, observe as unknown,
refuse terminal attachment, and retain the missing-endpoint diagnostic when
marked done. Stored records need no migration.

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

Machine records, native-state observation, alerts and the Sessions sidebar are
described in [session history, observation and navigation](AGENT-LAUNCH-HISTORY.md).
These remain local evidence, independent of published story facts.

Each native adapter distinguishes an explicit unfamiliar status from an
incomplete observation. Unrecognized Claude Code states and Codex thread,
active-flag or latest-turn statuses remain unsettled and add no attention;
entering that reading can raise an alert. Unreadable metadata, missing Codex
active flags and failed latest-turn reads stay quiet. Shared readings use the
recorded host's unknown-observation wording and native explanation; the alert
loop consumes the adapter's meaning rather than checking the host name.
Startup baseline, deduplication, re-entry and done suppression remain shared.

## Embedded terminals and local record actions

Same-origin `/__agent-terminal?source=&host=&session=` admits recorded host-qualified
sessions in existing project folders. Claude uses `claude attach <native alias>`;
Codex uses the saved ID, endpoint and workspace with ordinary `codex resume`
and `--no-alt-screen`. Unknown project/session, missing project folder and
unavailable sessions are refused before attachment. Codex checks the saved
directory at attachment: missing or inconclusive availability opens the same
session's read-only final report and explains the limitation. Failure before
native readiness rechecks the directory; only that observation supplies a
workspace limitation. Other startup failures keep their attachment error, as
[session troubleshooting](../docs/dashboard-session-troubleshooting.md) explains.
Text frames carry output; bounded input, resize and rendered readiness
messages share the existing transport.
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
requests native rename, closes dashboard attachments, then requests native stop
unless the session is confirmed unavailable. Codex renames with `thread/name/set`
and interrupts only the observed nonempty in-progress turn ID; completed/unloaded
history needs no invented interrupt. A race/refusal never retries against a
newer turn. Claude types `/rename` into an open attachment, if any, and waits
for listing confirmation. Native history is retained.

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

## Retained Codex results without their workspace

A saved Codex conversation and its workspace are observed separately. When the
saved directory is missing or its lookup is inconclusive, story cards, Recent
sessions and Sessions sidebar selection lead to **Read final report** instead
of advertising a terminal in that directory. The panel reads the same recorded
host-qualified conversation through its saved endpoint, shows its final report
read-only and names the workspace limitation separately from review status.

Close or Command+Shift+Escape returns focus to the invoking control. Selecting
another session cancels the previous report read. **Retry report** retries that
same identity after a read failure. Reading changes no native input or done mark;
**Mark as done** keeps its explicit completion behavior. Missing directories do
not establish story completion or why the directory was removed. Existing
workspace continuation and Claude Code behavior keep their terminal path.
