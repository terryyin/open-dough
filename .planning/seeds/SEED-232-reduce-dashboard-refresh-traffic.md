---
id: SEED-232
status: active
planted: 2026-11-04
planted_during: Terry Yin's request to reduce dashboard and GitHub traffic through shared backend refreshes and server-sent updates
trigger_when: A developer watches published work across dashboard views or keeps Running Cursor sessions open
scope: epic
---

# SEED-232 — Keep the dashboard current with fewer requests

## Why This Matters

Developers watching work in Open Dough, especially across several views or
over a limited connection, should see published progress and local session
changes promptly while the browser and dashboard make fewer requests.

Each visible dashboard view schedules its own Git revision checks. The
GitHub request owner already shares identical outstanding reads and
rate-limit waits, but staggered views can repeat a check after it settles.
The expanded Running Cursor sessions section can ask again 50 ms after a
response, even while the displayed list stays the same. These are separate
request costs. The completed remote Sessions traffic story reduced the bytes
of full overview and history responses.

Git origin is authoritative for published progress. Running Cursor sessions
are machine-local evidence. Evaluate gains against the current behavior,
counting actual requests and measuring how soon a change appears.
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md) ·
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md)

## Alternatives and Decision

Leaving the current checks in place preserves the refresh pace and saves
calls that already overlap. Longer per-view intervals are the simplest way
to cut idle checks, but can delay visible changes and still repeat work
across staggered views. Manual refresh is useful for an immediate check
when someone expects a change, and would require developers to keep asking
for updates during routine use. Share the observation across dashboard
views first, then use server-sent events (SSE) to deliver published updates.
The first story tests whether shared observations cut GitHub calls while
preserving freshness.

## Story Decomposition

<a id="see-published-changes-over-sse"></a>

### See published changes without recurring browser checks

**Identity:** SEED-232#see-published-changes-over-sse
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Who benefits.** A developer watching the Board, including over a limited
connection, sees published changes as soon as the dashboard observes them.

**Evaluation.** A visible dashboard shows one revision, then origin publishes
a change. An SSE update leads the view to the affected facts at the exact
revision, including a watched story-branch change. During a quiet interval a
healthy stream yields zero recurring browser revision-check requests. Count
browser requests and transferred bytes, including stream overhead, and
compare publication-to-display latency with the current route. If the
connection drops across a change, the view keeps its last good snapshot,
shows the loss of freshness, and catches up on reconnect. A failed branch
observation remains distinct from a confirmed branch removal.

**Effort hypothesis.** The largest of the three with moderate confidence.
The main uncertainty is reliable reconnect and catch-up across the existing
dashboard access paths.

**Prerequisite and stopping point.** No blocking story prerequisite. It
follows the shared refresh story to use its observation if available. A
developer sees published updates with fewer browser requests even if local
session updates follow a separate schedule.

<a id="reduce-running-cursor-session-requests"></a>

### Keep Running Cursor sessions current with fewer local requests

**Identity:** SEED-232#reduce-running-cursor-session-requests
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Who benefits.** A developer watching the expanded Running Cursor sessions
section can see which sessions are present and what their labels say
without paying for repeated unchanged reads.

**Evaluation.** With the section visible, compare a quiet period and a
session-list or label change against today's request counts from browser to
dashboard and dashboard to runner. Both paths make fewer requests during
the quiet period, and the list still reflects a change promptly. Closing
the section ends its observation demand. An unavailable runner is shown
distinctly from a reachable runner with no sessions. The section continues
to show useful local evidence independently of the published Git feed.

**Effort hypothesis.** Smaller than the published SSE story with low
confidence. The main uncertainty is whether existing runner observations
can supply label changes promptly under load.

**Prerequisite and stopping point.** No blocking story prerequisite. Lower
local request volume is useful on its own.

## Ordering and Scope Reduction

Queue shared GitHub refreshes first for the immediate upstream saving and
to measure freshness independently of transport. Follow with published SSE
for the browser request saving and reconnect behavior. Running Cursor
sessions comes third and can be deferred first if time is limited.
Open Dough has no calibrated S/M/L bands, so the estimates are comparative.

## Open Decisions

Use the first story's one-view baseline to decide whether further single-view
GitHub reduction is worth pursuing. Known publication events may justify an
immediate shared check. GitHub webhooks are a later option if the request
savings justify a reachable receiver. Decide whether to share settled
observations across separately launched dashboard servers using measurements
from those servers.

## When to Surface

Prioritize now on Terry's request. The stories can be evaluated independently
of the ongoing work on reviewing Purpose and Proof.

## Breadcrumbs

- [Published dashboard observation](../../dashboard/PUBLISHED-OBSERVATION.md)
- [Dashboard GitHub request accounting](../../dashboard/GITHUB-REQUESTS.md)
- [Machine-session observation](../../dashboard/AGENT-LAUNCH-OBSERVATION.md)
- [Running Cursor sessions polling](../../dashboard/src/RunningCursorSessions.tsx)
- [Completed remote Sessions traffic story](../done/SEED-229_reduce-remote-sessions-traffic.json)
- [Related dashboard responsiveness work](SEED-225-restore-dashboard-responsiveness.md)
