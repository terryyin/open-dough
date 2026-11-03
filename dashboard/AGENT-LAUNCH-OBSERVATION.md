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
(`x-open-dough-sessions-revision`) is told only that it is unchanged. The
revision is the digest of the answer's fragments: each session entry, each
attempt, and the rest of the answer. The regular answer holds open sessions in
full and each retained done session only as its listing facts, everything its
entries show while nothing retained is opened; the launch's reporting handoff,
the first input's text and the landing evidence stay with the history. A read
with `?audience=history` is answered from the same observation with the
history instead: every retained done session's full entry and the attempts
that no longer need attention, under the history's own revision, which every
full regular answer names as `historyRevision`; the same revision header asks
whether it still stands, and any other audience is refused. A page reads the
history when a developer opens or acts on a retained session, opens its
Review changes, or expands Recently done sessions, and again only once the
regular answer names a newer `historyRevision`. An observation serializes again only the
entries whose kept record or observed reading changed, and runs Git for a
checkout's worktrees only when that checkout's Git files (worktree entries, heads, refs,
config) changed identity; each host's native listing still runs on every
observation past the reuse window. A read
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
document, each session entry's serialization, and the latest shared
observation until replacement. Terry accepted
this memory tradeoff on 2026-10-31 and kept `SEED-202#bounded-dashboard-refresh`
closed: its recorded probe settled at 51 MiB for one, three and eight viewers,
compared with 22 MiB before the change. The additional working set consists of
the parsed documents and latest observation; returning to the earlier heap
baseline or expiring the observation after one second is not required.

## Measuring the Sessions answer

The Sessions replay measures this observation at production's scale on
2026-11-03 without a page or a real host: a boundary server on about 1,000
done and five open sessions, 1,034 attempts, a 1,191-entry Claude listing,
Codex threads answered by the fake app server, and six projects whose
checkouts hold 44 linked worktrees
([seed](tests/support/sessionsReplaySeed.ts),
[projects](tests/support/sessionsReplayProjects.ts)). It prints one table:
startup, the first full answer cold and warm, the regular answer's size,
unchanged polls past the one-second reuse window by wall and event-loop time,
the history ask's first full answer and its unchanged asks the same way,
one native state change, and a trivial request's latency during polls and
without them ([measures](tests/support/sessionsReplayMeasures.ts)). The normal
suites skip it. Run it from the repository root, with the load average beside
each run, and compare runs relative to that load:

```sh
uptime; DOUGH_SESSIONS_REPLAY=1 env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/boundary/sessions-replay.spec.ts
```

Event-loop time is the server's own event-loop watch, read from the incident
record: the timer lateness its samples measured while a poll ran, a lower
bound on time the loop was held, also shown net of the quiet floor the same
run measures. `DOUGH_SESSIONS_REPLAY_PROFILE=<directory>` additionally writes
each server-started Node process's CPU profile there.
