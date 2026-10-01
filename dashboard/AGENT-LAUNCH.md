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
sends nothing on Cancel/Escape. Start commits the request at once and closes the
modal when the local service has accepted it, before the start or session ends;
[startup handoff](#startup-handoff-and-reconciliation) follows it from there.

Host initially selects Claude Code and offers Claude Code or Codex. Model opens
on Default. Claude also offers
Fable, Opus and Sonnet; a selection sends its `--model` alias before the prompt.
Codex offers only its configured default and refuses a forged Claude model
selection. Switching hosts clears the model; no authentication, trust, approval,
sandbox, permission or reasoning setting is overridden by the dashboard.
Requested model/options lines describe requests, never the effective model.

## Startup handoff and reconciliation

Start sends the exact request to `POST /__agent-launch/accept`. The service
(`server/launchAttemptOwner.ts`) saves it as an attempt in
`~/.open-dough/dashboard/launch-attempts.json` before any start or native call
and answers with the attempt; a request it cannot save starts nothing. The
attempt runs without its caller and keeps its publication receipt and outcome
for `GET /__agent-launch`; `GET /__agent-launch/changed` waits for an owned
attempt to change so pages reread without polling hosts. While a story's attempt
is unresolved, another request for that story, from any workflow, is refused;
an unreadable attempt file refuses every launch.

From submission, the dialog says “Starting…” with Cancel, Start and every choice
unavailable, ignores Escape, and says “Startup is underway and can no longer be
cancelled here.” Acceptance closes it; a refusal stays beside the action, and a
lost answer is uncertain, never accepted. Until the start reconciles, the
story's whole card frame is protected wherever origin lists it: no action
button runs, including alternate launches, Inspect story and card session
actions, while facts and source links stay readable and other cards, Refresh,
navigation, the Sessions sidebar and the terminal work. Its dashed edge joins
the selection and “Shown in terminal” marks. Its status says the start phase
(“Preparing execution…” / “Preparing refinement…”, then “Starting execution
in <host>…” / “Starting refinement in <host>…”, using the actual running
start’s host) and “Local startup in progress; this story's actions are
unavailable until it settles.”,
then “Waiting for published story state” once the outcome settled. Only that
progress shows an indicator, which moves unless reduced motion is requested.
Local startup never moves the story or shows Taken, Preparing or an owner.
Story Starts stay unavailable until the page first reads this machine's
attempts.

A publishing start reconciles when the shown revision is its accepted
publication or, by the authenticated comparison in
[GitHub requests](GITHUB-REQUESTS.md), contains it, and its native outcome has
settled. A refusal that published nothing, or a start that publishes nothing,
waits for a published read asked after its outcome. An older or unrelated
snapshot never clears protection. A published start whose session was refused
reconciles to its Taken card with the kept start's continuation.

A lost answer, an attempt no running server owns, or an outcome that may or may
not have published says “Startup needs reconciliation” statically on the card,
which stays protected, and in the Startup recovery region beside the project's
actions, which also says when this machine's attempts could not be read. Recheck
reads this machine's evidence and the published state again. Continue posts to
`POST /__agent-launch/continue`, which runs the same kept request under the same
attempt and the existing [start recovery](LAUNCH-START.md#mechanical-start-and-recovery)
and native rules, or answers why not; it never creates a replacement attempt.
Restart, reload, project switch and a second page recover from that file; a
removed story keeps its recovery there. An ad hoc start shows its progress
beside Start session and its recovery in the same region, never a card.

At handoff the keyboard goes to what says the startup: the story's card, which
its status describes, or Start session's progress, never the unavailable action.
Every unavailable card action is described by the card's status; a Start
waiting for this machine's first read is described by why. A settled launch
presents its session on the card, or in the terminal for Start session, and
moves the keyboard there only while it still rests where handoff left it. A
polite “Startup announcements” log says each story's move to in progress,
waiting, needs reconciliation and reconciled once, however many reads find it
unchanged.

## Installed options

See [installed launch options](AGENT-LAUNCH-OPTIONS.md) for host-qualified
refinement definitions, selection, validation and recovery. Execution and ad hoc
have no options.

## Start and session choices

How a story's start is established before its native session and recovered,
and what the dialog's Session choices select, are in
[launch start](LAUNCH-START.md).

## Native hosts and durable evidence

See [native hosts and durable evidence](AGENT-LAUNCH-HOSTS.md) for the registered
host boundary, host-qualified identity, native startup and saved creation/input
evidence, and Codex continuation.

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
