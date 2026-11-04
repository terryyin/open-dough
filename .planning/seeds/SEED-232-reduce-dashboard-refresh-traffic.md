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

<a id="share-published-git-refreshes"></a>

### Keep the same project fresh across views with fewer GitHub requests

**Identity:** SEED-232#share-published-git-refreshes
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/468-share-published-git-refreshes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e9abda136d2deae35c9351cfcf580aae100c8e5a11dad7548852ab40231896af","plan":"c5afa3e53060fd645c3a1f7422ae7d8979558157dc882f4574c082b966a12098"}}
```

**Goal.** A developer following one published project from several visible
dashboard pages of one dashboard process sees newly published work within
the current refresh pace while that process asks GitHub for one branch-head
listing per pace for that project, not one per page. Today each visible page
schedules its own check every 15 seconds and only checks outstanding at the
same moment share one `gh` listing; a finished answer is never reused, so
pages opened at staggered times multiply the listings by the number of
pages. The outcome is fewer `gh` requests reaching GitHub for the same
observation, with freshness, credential isolation, rate-limit handling, and
failure behavior as they are.

**Scope.**

Required behavior:

- A page's scheduled revision check is answered from the branch-head listing
  this dashboard process last settled for that project when that listing is
  younger than the check pace (the same reuse window host status uses, one
  second under the pace), joins a listing already outstanding otherwise, and
  asks GitHub only when neither exists. Each page still learns its own
  answer from the shared listing: whether the configured ref still names the
  revision that page shows, and the head of each story branch that page
  watches.
- A page that becomes visible again checks at once, under the same reuse,
  so a tab switch costs no listing when another page checked recently.
- A listing GitHub refused, that failed, or that timed out keeps no settled
  answer, as today; every page waiting on it is told so alike, keeps its
  last snapshot, and recovers as today. A rate-limit wait is still the
  request owner's, and a limited answer serves no later check.
- The reuse is per dashboard process, per project, and per request-owner
  scope (host and login): a listing read under one login never answers a
  check under another, and separately launched dashboard processes keep
  sharing only outstanding requests as today.
- A reload or a return to a project still resolves the configured ref afresh,
  as today; it does not reuse a settled listing.
- The branch-head listing's `304` hint, the content reuse at known commits,
  the eight-at-once bound, and the 30-second wait bound stay as they are.

Boundary assumption: a listing whose every page left before it settled may
still settle, so that its answer serves the next check within the window;
today the last page leaving aborts it. A listing already at GitHub is
counted either way, and letting it settle saves the next listing.

Deferred promises: sharing settled listings across separately launched
dashboard processes, decided from those servers' measurements (see Open
Decisions); delivering updates to pages without their recurring local check
(the SSE story); fewer requests for a single page; an immediate shared check
on a known publication event.

Scope limits: no change to what a page shows or when it reads content; no
new daemon, database, or scheduler; no change to the request owner's
protocol.

**Key examples.**

1. *Staggered pages share the pace.* Two visible pages show the same project
   at the same revision on one dashboard process, the second opened seven
   seconds after the first, and origin is quiet. Over the next minute, that
   process sends GitHub four conditional branch-head listings for that
   project, where today it sends eight, and both pages keep their snapshot
   with no problem shown.
2. *Each page learns its own answer.* Page A shows revision R and watches
   story branch X, recorded by a Taken Story Branch Mode entry at R; page B
   shows R and watches nothing. Origin moves X. One listing answers both: A
   learns X's new head and reads only X's plan and last commit time there;
   B learns nothing changed.
3. *A new commit still arrives within the pace.* Three staggered visible
   pages show R; origin publishes R'. Each page shows R' within the current
   pace from publication, about 30 seconds, after one read of R' 's
   backlog shared as today. A page whose own check would have fallen
   between the shared listing and its reuse may see R' up to one window
   later than today, never later than the pace plus the window.
4. *Seen again.* Page B is hidden for ten minutes while page A keeps
   checking. B is seen again three seconds after A's last listing: B checks
   at once and is answered from that listing; B seen again twenty seconds
   after it asks GitHub.
5. *Last page gone.* Both pages close, hide, or switch project. No further
   listing for that project is asked; the next visible page's check asks
   GitHub.
6. *Failure is not reused.* A shared listing fails with a `504`. Both pages
   keep their snapshot, report the failed check as today, and the next check
   asks GitHub; the earlier successful listing does not stand in.
7. *Separate credentials.* A check under login A settles a listing; `gh auth
   switch` changes the login; a check two seconds later under login B asks
   GitHub.

**Evaluation basis.** Baseline, from the current design: one visible page
costs four listings a minute per project; N staggered pages cost 4N. Target:
N visible pages on one process cost four a minute, and
publication-to-display stays within the current pace. Count `gh` requests
that reach GitHub, conditional `304` answers included: a `304` was observed
on 2026-11-04 to leave GitHub's `X-RateLimit-Used` unchanged, so the gain is
in `gh` invocations (about half a second each), request-owner turns shared
with content reads and CI observers, and exposure to GitHub outages, not in
the primary rate-limit allowance. Count latency as the time from a
published commit to each page showing it. The permitted trade-off is example
3's bounded extra delay for one page.

**Architecture.** The shared observation moves the decision "ask GitHub or
reuse" from each page's timer to the dashboard server's revision checks,
keyed by project and request-owner scope, with the reuse window the server
already applies to host status (`dashboard/server/sharedObservation.ts`,
`dashboard/server/hostStatusObservation.ts`). Pages keep their own timers,
their own `since` and watched branches, and their own interpretation of the
shared listing, so a page's shown revision stays its own observation and
the view still rebuilds from origin
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
derived caches rebuildable from their sources; fetching or caching remote
Git data is compatible; no new daemon, database, or scheduler). The request
owner keeps sharing only outstanding requests, so no owner protocol change
and no cross-process cache is introduced. A settled answer younger than the
window is reused as an observation of origin at its settlement time, which
is why a limited, failed, or timed-out listing keeps none. Evaluation
follows [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)
with the basis above set before the observed run. No conflict with an
Accepted decision was found.

**Effort hypothesis.** Lower than the SSE story with good confidence: the
reuse-window primitive, the outstanding sharing, the per-page comparison,
and request-counting tests at the boundary and in the browser already exist.

**Prerequisite and stopping point.** No blocking story prerequisite.
Developers get fewer upstream requests at the existing refresh pace even if
browser delivery stays as it is.

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
