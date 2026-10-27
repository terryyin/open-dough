# Explicit reports, Mark as read and Mark as done

A session with an unread completion/attention report offers **Mark as read** in
its entry's message part, on its card or in Recently done
([explicit completion](AGENT-LAUNCH-COMPLETION.md)); it keeps the report read
and leaves the session open.
**Mark as done**, its own control beside it, closes a reported session as the
[terminal controls](AGENT-LAUNCH-TERMINALS.md) describe, read or not; an unread
report alone is not asked about. Cursor, which has no native stop operation,
records local Done only, also after its workspace disappears.
On coarse input, **Session details** in the sidebar exposes the full session
title, story identity and the same project/state/model/time facts as its tooltip,
including the unread-report label. Opening the session is a separate touch.
Attention messages remain on the selected session's entry. Their disclosure,
Mark as read, Mark as done, Delete record and confirmation answers have touch
targets of at least 44 pixels; desktop retains its compact controls. Keep open
on an incomplete session's Done question retains the session and attachment,
under the [terminal controls](AGENT-LAUNCH-TERMINALS.md). Portrait/landscape browser viewport proof covers these interactions
locally; it does not establish physical iOS keyboard or remote access behavior.
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
Tracked execution stays open until published closure is locally confirmed under
the [completion rule](AGENT-LAUNCH-COMPLETION.md); explicit Done remains authoritative.
Eligible automatic quiet Done uses the same native naming operation as manual Done; its
local mark reads `Native done mark is pending.` until one bounded rename wait
that starts after the receipt is sent. Native failures retain a visible problem.
Reporting preserves the sender's attachments and running turn for acknowledgment.
Recovery beyond that wait is explicit and bounded, through Mark as done or a
delivery retry;
there is no background retry. Launch attempts retain receipts for their existing
machine-local lifetime. Reporting reads local Git evidence for tracked execution closure, performs no Git mutations and preserves the sender's running turn and attachments.
