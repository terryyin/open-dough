# Dashboard machine-session observation

The [session history contract](AGENT-LAUNCH-HISTORY.md) links here for how page
and notification reads share one observation, fresh re-reads, unchanged
answers, waits, alerts and retention.

The page reads machine records on load, while visible every 15 seconds, and
when visible again. Every page's read and the server's notification watch join
one shared machine-session observation. A read that arrives while one runs, or
within a second after one settled under the same project catalog and machine
documents, is answered by it. An explicit fresh re-read
(`x-open-dough-sessions-fresh`) is answered only by an observation begun after
it arrived: it is never completed by a settled observation inside the reuse
window or by one already running when it arrived; concurrent fresh re-reads
share one suitable observation, and at most one observation runs at a time.
Each answer leads with its observation's
revision, and a page that sends the revision of its last full answer
(`x-open-dough-sessions-revision`) is told only that it is unchanged. A read
not answered within 30 seconds gets a retryable 503 and the page keeps what it
shows. A hidden or departing page ends only its own wait. Running Cursor
sessions reads join the one runner read in flight, with no reuse once it
settles. Attention counts share each entry's reading. The server
also watches independently every 15 seconds, notifying macOS with Glass when an
unmarked session enters an alerting native reading, and once, as “Unread report:
<completion label>”, when its report arrives, whatever the native reading; its
first read quietly baselines existing waits and reviews. Each host-qualified session's
input and ready-for-review alerts stay handled across unknown, unreadable, incomplete, unrecognized,
unavailable and omitted observations, including changed summaries. Only observed
available working allows its next input alert, even with identical wording.
Review alerts rearm when confirmed known activity changes the displayed review
meaning; unavailable or unknown activity cannot establish that change.
An answer/work/new-question cycle missed entirely between successful reads may
stay quiet. Alert history is local to the server run and never replaces the
current observation shown on the page. Unknown never alerts;
unavailable/unrecognized may. Each server has its own alert baseline.

The one-second reuse window limits how old an answer may be, not how long
the server retains it. Each server may keep one parsed copy per machine
document and the latest shared observation until replacement. Terry accepted
this memory tradeoff on 2026-10-31 and kept `SEED-202#bounded-dashboard-refresh`
closed: its recorded probe settled at 51 MiB for one, three and eight viewers,
compared with 22 MiB before the change. The additional working set consists of
the parsed documents and latest observation; returning to the earlier heap
baseline or expiring the observation after one second is not required.
