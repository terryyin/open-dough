# Embedded terminals and local record actions

The [agent launch contract](AGENT-LAUNCH.md#embedded-terminals-and-local-record-actions)
uses saved native conversations for terminal attachment and local record actions.

Same-origin `/__agent-terminal?source=&host=&session=` admits recorded host-qualified
sessions in existing project folders. Claude uses `claude attach <native alias>`;
Codex uses the saved ID, endpoint and workspace with ordinary `codex resume`
and `--no-alt-screen`. An instructed Cursor launch starts one kept client,
`cursor-agent --workspace <recorded path> --resume <uuid>`, before the panel
opens. `--model` is an argument of that first client only. The stored resume
command omits it, and a later open does not send it. The launch instruction
is written into that client when its server-side screen shows
`Add a follow-up` or `Plan, search, build anything`, even when the terminal
cursor is hidden and no synchronized-update frame has arrived, and the record
then says the first input was accepted. A long or multiline instruction that
Cursor shows as a paste chip is submitted with a later Enter, and the record
says the first input was accepted only then.
Until that screen, the instruction is not written, the record stays uncertain,
and the developer can still type. The client exiting does not accept it.
Opening the terminal joins that same client and shows its output. There is
no launch-wait notice and no second client. `Add a follow-up` or
`Plan, search, build anything` admits that terminal even when the terminal
cursor is hidden. Cursor supplies no stop or rename,
so Mark as done is offered only for a reported session, as local Done, and Delete record remains. Unknown project/session, missing project folder and
unavailable sessions are refused before attachment. Codex checks the saved
directory at attachment: missing or inconclusive availability opens the same
session's read-only final report and explains the limitation. Failure before
native readiness rechecks the directory; only that observation supplies a
workspace limitation. Other startup failures keep their attachment error, as
[session troubleshooting](../docs/dashboard-session-troubleshooting.md) explains.
Text frames carry output; bounded input, resize and rendered readiness
messages share the existing transport.
Closing a Claude Code or Codex socket sends SIGHUP to that attachment client
only, retaining native work, history, and daemon. Cursor's attach result
declares keep: closing its socket, by Close, switching sessions, or a dropped
connection, leaves that client running. The follow-up prompt
(`→ Add a follow-up` or `→ Plan, search, build anything`) keeps that process
after the launch instruction has been entered. A working, waiting, or
unrecognized screen keeps it as well. The next socket joins that running
client, receives readiness at once, and sees a redrawn screen. Input from
any joined socket reaches that same client, and a second open terminal shares
it. Closing the
server sends SIGHUP to Claude Code and Codex attachment clients. It does not
send SIGHUP to a Cursor client: one machine-local Cursor runner owns that
client, in its own process group, outside the dashboard server. The
development server starts the runner when it is not already accepting
connections and does not restart a runner that is; two overlapping starts
still leave one runner. The dashboard attaches through the runner and does
not spawn `cursor-agent` itself. The runner applies that keep, including
while the dashboard server is down. Stopping the runner
hangs up the processes it holds and leaves none behind. When the runner
cannot be reached, the dashboard starts no `cursor-agent`. After a new
runner is up and holds nothing for that chat, opening the terminal resumes
the chat as a new process. The Sessions sidebar offers **Running Cursor
sessions** without opening a terminal. That list says whether the Cursor
runner is running. Each row is one session the runner holds: the project,
what was started, and one label from that client's current screen. The
ordinary follow-up prompt (`→ Add a follow-up` or
`→ Plan, search, build anything`, with none of `ctrl+c to stop`,
`Working`, `Running`, or `Clarifying Questions`) is "at the follow-up
prompt". A screen with `Working`, `Running`, or `ctrl+c to stop` is
"working". Any other held screen, including a question or a trust prompt, is
"waiting for an answer". Choosing a row opens that session's terminal on the
client the runner holds. When the runner is not running, or cannot be
reached, the list says so, shows no sessions, and offers nothing that starts
an agent. The launch-record lists stay as they are. The list does not change
story state. There is no dashboard control to stop or restart the runner.
CLI exit uses code 4000 so the page distinguishes
ended from disconnected. Codex spawn alone does not establish readiness: native
hook/trust UI remains interactive, and a completed composer frame with visible
cursor confirms attachment. Refusal preserves done intent; successful original-ID
attachment clears it. Claude retains its immediate admitted-attachment behavior.

One page terminal shows story/workflow/session with Mark as done where
supported, Maximize/Restore and Close; the panel's frame and these controls are
shared with the [story review](AGENT-LAUNCH-REVIEW.md), which occupies
the same panel exclusively, as does a final report.
It uses the terminal theme chosen in System settings and follows a new choice
without re-attaching; its panel edge takes the theme's background.
Switching sessions, or opening a story review, detaches the prior one without
ending or marking it done; switching projects keeps it attached. Opening
different panel content returns a maximized panel to the normal split.
Resizing the panel by its edge
([navigation](../docs/dashboard-navigation.md)) fits the attached terminal to
the new width without attaching again.
Reload has no terminal. Disconnection offers Reconnect; native attach exit offers
Open again, each for the same session. Close restores the originating control,
or the session's story card when that control is no longer shown.
Shown entries/cards are outlined and sidebar entry current; closing clears them.

Mark as done uses one operation from card, final report panel or terminal. It saves local done intent,
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
stops/renames/marks native work. Failure reports the problem and any available
reason politely in the entry's persistent status, retains the record, question
and focus, and enables retry or Keep. Success removes every entry, prevents older
reads/lifecycle updates restoring it, closes any showing panel and restores
next-entry/card/Recent focus without a deletion-success announcement. No local
action changes a published story fact.

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

## Explicit reports, Mark as read and Mark as done

A session with an unread completion/attention report offers **Mark as read** in
its entry's message part, on its card or in Recent sessions
([explicit completion](AGENT-LAUNCH-COMPLETION.md)); it keeps the report read
and leaves the session open.
**Mark as done** then closes a reported session as above. Cursor, which has no
native stop operation, records local Done only, also after its workspace disappears.
An observed native Working signal remains visible separately beside the attention
or local Done label.
An explicit attention message is read on the session's entry from machine-local
evidence; the side panel's **Read final report** shows only Codex's passive
native final report. No native last reply, inactivity, minimal marker or process
exit counts as a submitted report.

Completion delivery retains its exact submission beside the surviving reporting
executable before contacting the receiver. If delivery fails, the operation prints
an unacknowledged notice and a reporting-only `--retry` command. That command needs
neither the removed workspace nor the original message file. Each new report has
its own delivery identity; retry returns the original receipt and preserves newer
reports and deliberate local Done or reopen. A newer attention or unfinished
report clears an earlier automatic quiet Done while preserving explicit manual Done.
Recovery is explicit and bounded;
there is no background retry. Launch attempts retain receipts for their existing
machine-local lifetime. Reporting never performs Git or native-session controls.
