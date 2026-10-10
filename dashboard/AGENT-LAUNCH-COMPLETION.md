# Explicit completion and retained attention messages

The [agent launch contract](AGENT-LAUNCH.md#explicit-completion-and-retained-attention-messages)
keeps this reporting channel with the launch.

A prompted dashboard launch carries an explicit reporting channel for its project,
host and accepted launch reference when the installed execution skill supplies
`scripts/dashboard-completion.mjs`. All three native input builders carry the same
context; a blank session remains without an instruction. Native permission settings
still apply to the reporting command.

The installed command accepts `--outcome completed` with a reminder or
`--outcome unfinished` with the exact issue and next action, plus
`--message-file <path>` containing the agent's exact attention response. Land and
Wrap Up append `--outcome completed` without a message file only after their
operations and final wording settle. This final operation stores completion evidence
and local Done together before acknowledging the recorded session. Neither a marker,
silence, native turn completion nor process exit can set Done. Unfinished work requires
a useful nonempty message and stays open. Claude can report before its native ID is known:
that receipt says `pending-native-session`, names only the accepted launch, and
binds to its native session, with local Done for a quiet completion, when that launch
is confirmed. It never selects the
newest session for a story. Optional `--session` must match the confirmed native ID.

Every shared session entry, on a story card and in Recently done, shows its
message as text in a message part headed by the report's completion label; the
heading is a disclosure button that says whether the part is expanded. The
message text has a limited height and scrolls on its own, reachable by
keyboard, so a long message leaves Mark as read and the rest of the entry in
view. A
report is unread until **Mark as read**, or until the session is marked done.
While unread the part is expanded, does not collapse, and offers Mark as read,
on card and Recently done entries alike, so a session without a story card
can be marked read. Mark as read keeps the report's receipt as read and does
nothing else: the part collapses with the keyboard on its heading, and the
session stays open with its native reading. A refused mark leaves the part
expanded and says so in the entry's status line. Read, or on a session marked
done, the part is collapsed until the developer expands it from its heading,
without Mark as read; that choice lasts for the report only until a reload. A
newer report, with a new receipt, is unread again and expanded. The entry's
**Mark as done** is its own control, offered whenever the session can be marked
done, an unread report included; marking read never puts Mark as done in its
place. While unread, an entry keeps its session's
native reading — its words, its edge, its place in the Sessions sidebar, and
whether the badge and the card's attention line count it — and shows the report
apart, as “Unread report: <completion label>” in its state words and sidebar
tooltip and as a message mark on its sidebar entry; a card says how many of its
sessions hold one (“1 unread report”) in a line of its own. A new instruction to
the session does not mark its report read. Messages survive a story's published
stage change, dashboard restart, and workspace disappearance, and stay readable
in Recently done after Done.
Reading a message, or marking it read, changes no native activity.
Quiet completion offers no attention message or empty explicit report. The side
panel holds a session's passive native final report (**Read final report**),
independently of its message, where the host supplies it.
Native terminal access remains independently available where the host supports it.
The reporting command is prepared from the installed files outside the workspace
so that workspace retirement cannot remove its executable or dependency.
**Mark as done** closes a reported session as it closes any session; a host
without native stop records local Done only. Wherever Mark as done is offered,
a session whose latest report is `completed` and that reads neither working nor
waiting is marked done at once; a working or waiting session, an `unfinished` report, or no report at
all is asked about first ([Mark as done](AGENT-LAUNCH-TERMINALS.md)); an unread
report alone is not asked about. Done does not complete the product story.

Quiet reporting uses the same Done operation as Mark as done, including native
naming. The receipt acknowledges durable completion and Done intent at once,
with the local mark reading `Native done mark is pending.` as ordinary text, not
a problem; the native rename starts once the receipt is sent, since the sender's
turn goes on until then. Codex uses its native out-of-band name operation.
Claude renames as Mark as done does, within one bounded wait of sixty seconds
for the session to go idle, so the sender can print its final response. A turn
that outlasts the wait, a session no longer running, an attachment that cannot
open, or an unconfirmed rename retains its problem. Recovery beyond that wait is
explicit: Mark as done, which takes over a rename still waiting, or the same
delivery's retry; a successful delivery retry does not repeat a confirmed
rename. A server that closes during the wait leaves the pending mark. Early
quiet reporting applies the same operation when its native session is bound.
Launch binding releases persistence locks before its required Done owner
continues an early report.
Reporting keeps its sender's attachments and work running so the sender can receive
its acknowledgment. Terminal attachment lifecycle retains attachment ownership;
completion reporting schedules no delayed disposal. A session marked done with a
report reads Done, with native Working as its note. A receipt claims no native shutdown. Direct Land/Wrap Up
without supplied context makes no dashboard contact. Other workflows receive the channel without gaining automatic completion.

Landing capture is a separate launch-bound fact of every established start or
preparation naming a trunk target: a one-shot launch, and a claimed Story Branch
Mode launch, whose wrap-up integration is the publication that lands. Publication
to the remote story branch captures nothing. Before each push to the trunk target
the installed publication handoff retains the final candidate and delivery base,
including a reconciled pair, outside the workspace. The dashboard prepares a
candidate that is the launch workspace's `HEAD` and contains its branch tip: a
one-shot tip, a fast-forwarded story tip, or a detached integration merge of that
tip onto fetched trunk; the base is the fetched trunk tip the candidate is
published onto. The [story review](STORY-REVIEW-ONE-SHOT.md) lists a launch with
a captured landing as a landed run. Accepted publication survives
recording failure; resume verifies the retained pair without another push, and
the copied reporting command retries only that original input after retirement.
Preparation and acceptance retain one immutable comparison receipt. Capture
before native binding follows that launch into its bound record; late native
writers and newer completion, read and Done intent preserve it.
The original capture authority follows a kept bound record after its startup
attempt normally expires, without extending either lifetime. Premature attempt
loss, unreadable attempt evidence and deleted or expired records refuse capture.
If explicit deletion fails to remove its pins after attempt expiry, its retained
deletion intent keeps capture refused and the same deletion can retry cleanup.
