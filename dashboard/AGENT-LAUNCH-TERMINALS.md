# Embedded terminals and local record actions

The [agent launch contract](AGENT-LAUNCH.md#embedded-terminals-and-local-record-actions)
uses saved native conversations for terminal attachment and local record actions.

Same-origin `/__agent-terminal?source=&host=&session=` admits recorded host-qualified
sessions in existing project folders. Claude uses `claude attach <native alias>`;
Codex uses the saved ID, endpoint and workspace with ordinary `codex resume`
and `--no-alt-screen`. Cursor runs the stored
`cursor-agent --workspace <recorded path> --resume <uuid>`. A visible cursor
and `Add a follow-up` admit that terminal. Cursor supplies no stop or rename,
so Mark as done stays absent and Delete record remains. Unknown project/session, missing project folder and
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
