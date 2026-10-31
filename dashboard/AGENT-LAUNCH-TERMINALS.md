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
Text frames carry output. A joining socket's replay control names the held
screen's dimensions; the next text frame restores that screen's ANSI
rendition, cursor and terminal modes before the page fits it to the panel.
Live output follows that replay. Bounded input, resize and rendered readiness
messages share the existing transport.
Closing a Claude Code or Codex socket sends SIGHUP to that attachment client
only, retaining native work, history, and daemon. Cursor's attach result
declares keep: closing its socket, by Close, switching sessions, or a dropped
connection, leaves that client running. The follow-up prompt
(`→ Add a follow-up` or `→ Plan, search, build anything`) keeps that process
after the launch instruction has been entered. A working, waiting, or
unrecognized screen keeps it as well. The next socket joins that running
client, receives readiness at once, and sees its recorded current screen,
including when the native client emits no output for a redraw request. Input from
any joined socket reaches that same client, and a second open terminal shares
it. Closing the
server sends SIGHUP to Claude Code and Codex attachment clients. It does not
send SIGHUP to a Cursor client: one machine-local Cursor runner owns that
client, in its own process group, outside the dashboard server. The
development server starts the runner when it is not already accepting
connections. At startup and on any read it leaves an accepting runner
alone; two overlapping starts still leave one runner. New Cursor work
(a launch, a keep, Recover, or resuming a session the runner does not
hold) instead reuses an accepting runner only when it proves it runs
the current runner build and the helper it uses to open a terminal is
still on disk, and stops and replaces a runner whose proof is missing
or stale first; the sessions that runner held then stand as
their launch records, not running and resumable through Recover.
Listing sessions, reading their state, and joining a client the runner
still holds are observation: they never start or replace a runner.
The dashboard attaches through the runner and does
not spawn `cursor-agent` itself. The runner applies that keep, including
while the dashboard server is down. Stopping the runner
hangs up the processes it holds and leaves none behind. When the runner
cannot be reached, the dashboard starts no `cursor-agent`. After a new
runner is up and holds nothing for that chat, opening the terminal resumes
the chat as a new process. The Sessions sidebar offers **Running Cursor
sessions** without opening a terminal, as a collapsible section below its
session list that the runner is read for only while expanded, saying it is
reading until a read answers. That list says whether the Cursor
runner is running. Each row is one session the runner holds: the project,
what was started, and one label from that client's current screen. The
ordinary follow-up prompt (`→ Add a follow-up` or
`→ Plan, search, build anything`, with no live `ctrl+c to stop` in its
current status region and no clarifying-question screen) is "at the
follow-up prompt". A screen whose current status region shows the live
`ctrl+c to stop` hint is "working"; `Working` or `Running` prose in
viewport history does not prove work. Any other held screen, including a
question or a trust prompt, is "waiting for an answer". On a story card or
session entry, a held Cursor session instead reads by the shared
normalized activities: a proved clarifying-question screen (a
`Question N of M` line with the `Space select · Enter next/submit`
footer) reads _Needs input_ with its question text, the follow-up prompt
after a confirmed first instruction reads _Ready for review_, a working
screen reads _Working_, and a trust prompt or any unproved screen keeps
the label above as an unknown reading that never alerts. No held screen
proves failure or interruption — a failed command inside a turn and a
cancelled turn settle to ordinary screens — so for Cursor those states
come only from an explicit unfinished report the session submits, never
from its screen. Choosing a row opens that session's terminal on the
client the runner holds. When the runner is not running, or cannot be
reached, the list says so, shows no sessions, and offers nothing that starts
an agent; a later successful read lists the held sessions again, and a running
runner holding none shows no rows. The launch-record lists stay as they are. The list does not change
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
Resizing the Side panel by its Panel divider
([navigation](../docs/dashboard-navigation.md)) fits the attached terminal to
the new width without attaching again.
Reload has no terminal. Disconnection offers Reconnect; native attach exit offers
Open again, each for the same session. Close restores the originating control,
or the session's story card when that control is no longer shown.
Shown entries/cards are outlined and Sessions sidebar Session entry current; closing clears them.

The terminal header offers **Dictate into terminal** immediately before Mark as
done, or with the other actions when Done is unavailable. The microphone becomes
**Stop recording** during capture. From terminal input, **Alt+F10** focuses the
session actions; Tab reaches the microphone, and Enter or Space activates it.
Ordinary Tab, Shift+Tab and Escape still belong to the native terminal. Permission, recording and transcription state
are announced in the panel; Close and ordinary typing remain available. Recording
uses the same configured OpenAI access and safe recovery guidance as launch
instruction dictation. A completed transcript is offered once through the current
terminal's normal input path, then focus returns there. Existing input remains;
line breaks become spaces and terminal controls are removed. Dictation sends no
Enter and has no launch-field separator or 4,000-character limit. Edit and press
Enter deliberately to submit. A local offer is not a native delivery receipt and
is never replayed automatically.

Capture and pending results belong to the open session view. Close, switching
sessions and a successful Mark as done that closes it cancel capture and pending
requests, including late permission or transcript delivery. A result that cannot
be offered to its attachment stays visible in full. **Insert transcript** offers
it once to this session and focuses terminal input; an unavailable attachment
keeps the text for another deliberate attempt. **Discard transcript** sends
nothing. Settle it before recording again; closing or switching discards it.
Reconnect leaves unsent text pending and never resends text already offered.

On touch screens, tap the terminal to focus its ordinary input, edit with the
browser keyboard and submit with Enter. The terminal keeps its own scrollback;
scroll within it to read earlier output. With reduced visible height, a long
session title and identity scroll independently in the header, leaving the
input and Maximize/Restore/Close controls reachable. Maximize gives the terminal
the available window; restoring, changing orientation or reducing visible
height fits that same attachment without launching or reconnecting it. Close
and reopening follow the host lifecycles above. Local Chromium touch viewport
proof covers phone/tablet portrait, landscape and a 240-pixel visible height,
including Backspace, Enter and actual browser-to-WebSocket-to-PTY replies. It
does not establish physical iOS keyboard or remote connectivity behavior.

Mark as done uses one operation from card, final report or terminal. It saves local done intent,
requests native rename, closes dashboard attachments, then requests native stop
unless the session is confirmed unavailable. Codex renames with `thread/name/set`
and interrupts only the observed nonempty in-progress turn ID; completed/unloaded
history needs no invented interrupt. A race/refusal never retries against a
newer turn. Claude waits for its listing to show the session idle, never
typing into one that is busy or waiting, then types `/rename` into the open
attachment, or else into a private attachment of its own from the project
folder, typing only once Claude Code’s prompt shows. That private attachment
is hung up once the rename settles, and rename waits for listing
confirmation, all within one bounded wait of five seconds, or sixty after a
quiet report's receipt while its sender finishes.
Idle detection, prompt readiness, key entry and listing confirmation share that
deadline. A later Done or server close cancels the same attempt. An abandoned
manual Done retains its rename problem before shutdown; reporting leaves the
pending mark.
A session listed with no
running process is not renamed. Native history is retained. When Claude Code
lists the session without a running status (its process has exited), Mark as
done instead closes dashboard attachments and runs `claude rm <short id>` from
the project folder, with neither rename nor stop: a removed job has no name
left to show. The short id goes alone, so the removal never discards commits or
a worktree; the transcript stays with Claude Code.

Wherever it is offered, on a card or in the terminal or final report, Mark as
done marks a session at once only when its intended work is complete: its
latest report is `completed`, with or without an attention message, and its
reading is neither working nor waiting for input (Cursor's held-screen
“working” and “waiting for an answer” count as those).
An explicitly completed refinement with a confirmed missing preparation workspace
also marks done at once despite a native wait, while native Working still asks.
Mark as done acknowledges that session; it does not complete the story or change
its published membership or readiness. Every other incomplete session is
asked about first, in place, as Delete record… asks: on a card where Mark as
done was, and in a question below the Side panel header, with the terminal or report still
showing and the header's Mark as done disabled until answered. The question
gives one statement, the most pressing that applies (“This session is
still working. Marking it done asks it to stop.”, “This session is waiting for
your input.”, “This session reported unfinished work.”, or “This session has
not reported its work complete. It reads <reading>.”), then “Mark it done
anyway?”, as a group labelled by those words. The keyboard starts on **Keep
open**; Keep open or Escape leaves the session, its attachments, its report's
read state and its reading untouched and puts the keyboard back on Mark as
done; a panel stays open with its terminal attached. The question's **Mark as
done** runs the operation above unchanged, and a panel then closes.
The decision uses the reading and report the page shows when it is clicked; a
panel takes the session as the page reads it now, in any project, not as it
was when the panel opened. While the question is open, its statement follows
the session as the page reads it again; a session that becomes complete loses
the question and gets Mark as done back, as the Delete record question goes when
its state becomes known.

Recently done keeps the done record/name; cards/sidebar exclude it. A bounded diagnostic
persists when native rename/stop, or the removal of an exited Claude Code
session's job, is unconfirmed, while live Working remains
truthful. Local intent proves neither native stop nor published story completion.
Failed reopen preserves the mark; successful native attachment clears it and
returns the original session to its card. Deferred failures cannot undo a newer
successful reopen or recreate a deleted record.

Delete record is offered for unknown/unavailable observation on cards/Recently done,
with in-place question, Delete record/Keep and keyboard on Keep. Keep/Escape
restore the action. It rereads state; newly known state keeps the record with an
explanation. Deletion forgets only host-qualified dashboard evidence, never
stops/renames/marks native work. Failure reports the problem and any available
reason politely in the entry's persistent status, retains the record, question
and focus, and enables retry or Keep. Success removes every entry, prevents older
reads/lifecycle updates restoring it, closes any showing panel and restores
next-entry/card/Recently done focus without a deletion-success announcement. No local
action changes a published story fact.

## Retained Codex results without their workspace

A saved Codex conversation and its workspace are observed separately. When the
saved directory is missing or its lookup is inconclusive, story cards, Recently done
and Sessions sidebar selection lead to **Read final report** instead
of advertising a terminal in that directory. The panel reads the same recorded
host-qualified conversation through its saved endpoint, shows its final report
read-only and names the workspace limitation separately from review status.

The report's header, unfinished-work question, answers and content share one
scrolling surface within the panel's available height. With a wrapped title or
identity and reduced phone height, scroll by touch to read the question and
show each whole answer, or to return to the report and Close. Enlarging or
rotating keeps the same report and pending question. Keep open leaves its read
and done state untouched and returns focus to Mark as done; confirming still
uses the explicit Done operation above.

Close or Command+Shift+Escape returns focus to the invoking control. Selecting
another session cancels the previous report read. **Retry report** retries that
same identity after a read failure. Reading changes no native input or done mark;
**Mark as done** keeps its explicit completion behavior. Missing directories do
not establish story completion or why the directory was removed. Existing
workspace continuation and Claude Code behavior keep their terminal path.

Read the [explicit report controls](AGENT-LAUNCH-REPORT-CONTROLS.md) for Mark as read, Mark as done and delivery recovery.
