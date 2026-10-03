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

Messages are rendered as text on every shared session entry. A report is unread
until **Mark as read**, offered on its card entry and report panel in the place
of Mark as done, or until the session is marked done. Mark as read keeps the
report's receipt as read and does nothing else: the session stays open with its
native reading, and the entry then offers Mark as done. A newer report, with a
new receipt, is unread again. While unread, an entry keeps its session's
native reading — its words, its edge, its place in the Sessions sidebar, and
whether the badge and the card's attention line count it — and shows the report
apart, as “Unread report: <completion label>” in its state words and sidebar
tooltip and as a message mark on its sidebar entry; a card says how many of its
sessions hold one (“1 unread report”) in a line of its own. A new instruction to
the session does not mark its report read. Messages survive a story's published
stage change, dashboard restart, and workspace disappearance, and stay readable
in Recent sessions after Done.
**Read attention message** opens the retained text without changing native activity.
Quiet completion offers no attention message or empty explicit report. Passive native
final-report access remains independent, where the host supplies it.
Native terminal access remains independently available where the host supports it.
The reporting command is prepared from the installed files outside the workspace
so that workspace retirement cannot remove its executable or dependency. Session
Done remains local disposition; it does not complete the product story.

Reporting never renames, detaches, or stops its sender. Terminal attachment lifecycle
retains attachment ownership; completion reporting schedules no delayed disposal.
A session marked done with a report reads Done, with native Working as its note.
A receipt claims no native shutdown or cosmetic rename. Direct Land/Wrap Up
without supplied context makes no dashboard contact. Other workflows receive the channel without gaining automatic completion.
