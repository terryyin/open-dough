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

<a id="see-published-changes-over-sse"></a>

### See published changes without recurring browser checks

**Identity:** SEED-232#see-published-changes-over-sse
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/469-see-published-changes-over-sse/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d2065fee6bac70bea5294c14681f723c15021ec6556b8d070d46a53c57a164e5","plan":"d0e0637ffdf64fa6188ed5119101551a8731e7ddd1014f96487655b25f4dd5e6"}}
```

**Goal.** A developer watching the Board, especially over the limited
Tailscale route, sees newly published work as soon as the dashboard process
observes it, while the page sends no recurring revision-check requests and
the stream costs fewer bytes than those checks did. Today every visible page
asks the dashboard every 15 seconds whether the configured ref and its
watched story branches still name what it shows. With this story, the
dashboard keeps checking origin at the same pace for each project that a
page has open. It then tells every streaming page of that project the
answer for that page's own revision and watched branches. Freshness,
credential isolation, rate-limit handling and failure behavior stay as they
are, and a dropped stream loses freshness visibly and catches up.

**Scope.**

Required behavior:

- A visible page showing a settled snapshot holds one server-sent event (SSE)
  stream for its project, its shown revision and its watched story branches.
  The page then asks no recurring revision check. Its first message, on every
  open and reopen, is the current answer for that revision and those branches,
  so a change missed while disconnected is caught up without replaying events.
- The dashboard process observes origin at the current 15-second pace for each
  project and request-owner scope (host and login) that has at least one open
  stream. That observation asks GitHub at most as often as one page's checks
  do today, and stops when the last stream for that project and scope closes.
  When an observation settles, every open stream for that project and scope
  gets its own answer from the same branch-head listing, in the shape a
  revision check answers today. A changed ref leads the page to read exactly
  the new revision. A moved watched branch leads it to read only that entry's
  plan and last commit time. Any other branch moving sends that page nothing
  that leads to a read.
- While a stream's revision or watched branches differ from what origin names,
  each pace repeats that answer. A page whose read of the new revision failed
  then reads it again at the pace, as today's recurring check does.
- A page that hides, switches project, starts a new read, or is waiting out
  GitHub's rate limit holds no stream. It opens one again when the condition
  ends, and its first message then serves as today's check of a page seen
  again. After a read changes the page's revision or watched branches, the
  page reopens its stream with them.
- A healthy stream carries the page's current answer once per pace. A stream
  that fails, closes, or stays silent for longer than one pace plus the
  30-second wait bound is reported as a failed check is today: the snapshot stays shown with its revision and
  retrieval time, and the existing problem wording says freshness was lost.
  The page reopens no more often than the pace. The first answer after a
  reopen clears the problem, as a successful check does.
- A failed branch-head listing still yields an answer naming the ref alone,
  never a removal of a watched branch. Failed checks, rate limits and
  unanswered checks reach the page as today's check answers do. A
  rate-limited answer starts the page's existing limit record and notice.
- Streams never use up the browser's connections to the dashboard. On a route
  that does not multiplex requests, such as the loopback HTTP/1.1 route, at
  most two pages of one browser hold a stream at once. A visible page without
  a stream keeps today's recurring check, and it takes a stream when a holder
  hides or closes. On a multiplexing route, such as the Tailscale HTTPS route,
  every visible page streams.

Required restriction, with its reason: the stream cap on a non-multiplexing
route. Observed on 2026-11-04, six open streams to one loopback dashboard
origin in Chromium stopped a seventh page from loading at all, because
HTTP/1.1 browsers share six connections per origin across every tab.

Deferred promises: one shared stream per browser so that every visible page
streams on a non-multiplexing route; WebSocket delivery; carrying host
status, agent launches or local sessions on the stream (the Board's other
two 15-second reads stay as they are); a faster server pace, an immediate
check on a known publication event, or GitHub webhooks; sharing observations
across separately launched dashboard processes.

Scope limits: no change to what a page shows, how it reads content at a
revision, the 15-second pace, reload's fresh resolution of the ref, or the
request owner's protocol. No new daemon, database or scheduler outside the
dashboard process.

**Key examples.**

1. *Quiet over Tailscale.* One visible page shows the Open Dough Board at R
   through the Tailscale route, and origin stays quiet for a minute. The
   browser sends no revision-check request. The stream transfers fewer bytes
   than today's four checks in that minute, and the page shows no problem.
2. *Publication arrives.* Two pages of one dashboard process show R, opened
   seven seconds apart. Origin publishes R'. Both pages are told R' from the
   same listing, at the latest one pace after publication. Each reads R' as
   today, with the cards shown within the current freshness of about 30
   seconds.
3. *Each page its own answer.* Page A watches story branch X, and page B
   watches nothing. Origin moves X. A is told X's new head and reads only X's
   plan and last commit time, and B is told nothing that leads to a read. A
   branch-head listing that fails with a `504` tells A only the ref, and X
   is not shown as removed.
4. *Dropped across a change.* A page shows R, and its Wi-Fi drops (or the
   production dashboard is replaced). Within 45 seconds (one pace plus the
   wait bound) the page reports the lost freshness and keeps R. Origin publishes R'. When the connection
   returns, the page reopens at its next attempt and is told R' first. It
   reads R', and the problem clears.
5. *Hidden.* The only visible page of a project hides. Its stream closes, and
   the dashboard asks GitHub nothing more for that project. Seen again, it
   reopens at once and is answered as a page seen again is today.
6. *Seven local windows.* Seven visible windows show the Board through
   loopback HTTP/1.1 in one browser. Every page loads and reads. Two of them
   stream and five check every 15 seconds. When a streaming window hides, a
   checking window starts streaming.
7. *Rate limit.* An observation is answered as limited until T. Each
   streaming page shows today's notice, closes its stream, and asks nothing
   until T. At T it reopens, and the first answer resumes freshness.

**Evaluation basis.** Set before the observed run, under
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
The baseline is today's route: one visible page sends four revision-check
requests a minute, plus their response bytes. The target is that one visible
page with a healthy stream sends no revision-check request during a quiet
minute. The stream's bytes for that minute, connection setup included, stay
below the baseline's bytes for the four checks. Publication-to-display is no
later than today's for any streaming page.

Count browser requests and transferred bytes per minute. Measure the
publication-to-display time from the published commit to each page showing
it. Measure in the loopback test harness and once through the Tailscale route
after the change reaches the production dashboard. Disclose that the Board's
host status and agent launch reads still recur every 15 seconds. The quiet
Board therefore drops from three recurring 15-second requests to two, not to
zero. The permitted trade-off is that pages beyond two streams on a
non-multiplexing route keep today's checks.

**Architecture.** The local read boundary gains a stream request beside the
revision check. It takes the same inputs (source, `since`, watched branches)
and answers with a sequence of revision-check answers in today's shape. The
page therefore keeps one interpretation path: its parsing, moved-branch
comparison and failure reporting (`dashboard/src/revisionCheckSchedule.ts`,
`dashboard/src/authenticatedRead.ts`). Delivery becomes the page's choice
between a stream and today's recurring check, and the reactions to an answer
do not change.

On the server, the pace moves from each page's timer to an in-process
observation per project and request-owner scope. It is demand-driven by open
streams and settles through the revision checks
(`dashboard/server/revisionChecks.ts`). The observation is the shared
observation that
[the shared refresh story](#share-published-git-refreshes) adds when trunk
holds it, not a second cache. It evaluates each stream through the existing
per-request comparison (`dashboard/server/performedRevisionCheck.ts`). It is
in memory, per process and rebuildable from origin. It is neither a daemon,
database nor cross-process scheduler, and the stream carries observations of
origin, not a new authority
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).

Facts, observed on 2026-11-04:

- The loopback route answers over HTTP/1.1, and the Tailscale route answers
  over HTTP/2.
- Chromium blocks a seventh page once six streams hold one HTTP/1.1 origin.
- Vite 8.3.0's preview installs its compression middleware after plugin
  middleware, so boundary responses are not buffered by it. Development
  installs none.

Hypotheses for the plan's first proof:

- The boundary's origin check admits a same-origin `EventSource` request
  (`dashboard/server/localOrigin.ts`).
- Tailscale's HTTPS proxy delivers each event without buffering. The
  Tailscale measurement settles this.

Growth path: a later push of host status, agent launches or local sessions
shares a page's one stream rather than opening another, because of the
connection budget. Machine-local evidence stays distinguishable from
published facts, as ADR 0008 requires. No conflict with an Accepted decision
was found.

**Effort hypothesis.** The largest of the three stories, with moderate
confidence. The main uncertainties are the cross-tab stream cap and reliable
liveness and reopening on the Tailscale route.

**Prerequisite and stopping point.** No blocking story prerequisite. The plan
builds on the revision checks as trunk holds them when execution starts,
including the shared refresh story's observation once it has landed. A
developer sees published updates with no recurring revision checks even if
local session updates keep their own schedule.

<a id="reduce-running-cursor-session-requests"></a>

### Keep Running Cursor sessions current with fewer local requests

**Identity:** SEED-232#reduce-running-cursor-session-requests
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/470-reduce-running-cursor-session-requests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a8a10e49c278fd8bb8fede2bbccf47a2f418c2076d01ef23e72c499c5192d7a9","plan":"98b9e50dcef4ffca5b2408f89af1c6fea6760e2049babc81ecdb2e3d50721e3a"}}
```

**Goal.** A developer watching the expanded Running Cursor sessions section
sees which sessions the Cursor runner holds and what their screen labels say,
while the browser and the dashboard make far fewer requests during a quiet
period than today, and a session appearing, leaving, or changing label still
shows within about one second of the change. Today that expanded section asks
the dashboard again 50 ms after each settled answer, and each settled answer
re-reads the runner (`SharedObservation` reuse is zero), so a quiet runner
that answers in milliseconds is asked on the order of sixteen times a second
from one open section. Overlapping asks already share one in-flight runner
read. The outcome is fewer browser-to-dashboard and dashboard-to-runner
requests for the same quiet watch, with runner-up / unreachable / empty-list
distinctions, collapse ending demand, and independence from the published Git
feed kept as they are.

**Scope.**

Required behavior:

- While the Sessions sidebar is open and the Running Cursor sessions section
  is expanded, each list ask is answered from the held-session observation
  this dashboard process last settled for the current home and machine-document
  revision when that observation is younger than about one second (the same
  reuse window machine-session observation already uses for related Cursor
  evidence), joins an observation already outstanding otherwise, and reads the
  runner only when neither exists. Session cards and other readers of the same
  held evidence keep sharing that observation as today.
- The section's own ask gap matches that reuse window: after a settled answer
  it waits about one second before the next owned ask while still expanded and
  visible, instead of 50 ms. A page that becomes visible again asks at once
  under the same reuse. Collapse, sidebar close, or unmount ends owned demand;
  a hidden document pauses further asks until it is seen again.
- A runner that is not running, cannot be reached, or answers no sessions stays
  distinct in the section as today. A failed or unanswered observation keeps no
  settled answer for reuse, as other shared observations do; the next ask reads
  again.
- The section remains machine-local evidence, independent of the published Git
  revision feed and of the Board's other recurring reads.

Boundary assumption: a settled held-session observation younger than the
window is an observation of the runner at its settlement time, so a label that
flipped inside that window may appear up to about one second later than today's
near-continuous ask. That bound is the permitted freshness trade-off.

Deferred promises: delivering local session updates over SSE or another push
without recurring browser asks (sibling published-SSE growth path); sharing
settled runner observations across separately launched dashboard processes;
unchanged / digest answers that shrink quiet response bytes while the ask pace
stays high; a sub-second continuous watch; aligning this section to the Board's
15-second pace.

Scope limits: no change to what a row shows or how choosing a row opens the
terminal; no new daemon, database, or scheduler; no change to the runner
protocol or to machine-session observation's own 15-second page pace; no
carrying of this list on the published-progress stream.

**Key examples.**

1. *Quiet watch.* The sidebar is open, the section is expanded, three sessions
   stay held with unchanged labels, and the runner answers quickly. Over the
   next minute the browser sends about sixty list asks (one per second), where
   today it sends on the order of a thousand, and the dashboard reads the
   runner about sixty times, where today it reads on the order of a thousand.
   The section keeps showing the same three rows and runner sentence with no
   problem.
2. *Label change within the bound.* One held session's screen moves from
   working to the follow-up prompt. Within about one second of that change,
   the section's next settled ask shows the follow-up label on that row.
3. *List membership.* A new session is kept, or a held session leaves. Within
   about one second the section gains or drops that row.
4. *Seen again under reuse.* The page is hidden for ten seconds while another
   reader on this process settled a held-session observation one second ago.
   Seen again with the section still expanded, the section asks at once and is
   answered from that observation without a new runner read when it is still
   inside the window; after the window it reads the runner.
5. *Collapse ends demand.* The developer collapses the section. No further list
   asks leave the browser for it; machine-session and other readers keep their
   own demand as today.
6. *Unreachable stays distinct.* The runner stops answering. The section shows
   today's unreachable wording and no session rows, and does not reuse an
   earlier successful list as if the runner were still fine.
7. *Independent of Git.* Origin publishes a new revision while the section is
   expanded and the runner is quiet. The section's ask and runner-read counts
   for that quiet minute stay as in example 1; the published Board refresh is
   unchanged by this story.

**Evaluation basis.** Set before the observed run, under
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
Baseline, from the current design and a 2026-11-04 observation of a live
runner answering `/sessions` in milliseconds with three held sessions: one
expanded visible section costs on the order of sixteen browser list asks and
sixteen runner `/sessions` reads per second. Target: the same quiet watch costs
about one browser ask and at most one runner read per second, and a
session-list or label change appears within about one second of the change.
Count browser `GET` requests to the cursor-sessions endpoint and dashboard
`GET` requests to the runner's `/sessions`. Measure change-to-display from the
runner holding the new label or membership to the section showing it. The
permitted trade-off is that bound. Disclose that machine-session page reads
remain every 15 seconds and already share this held observation.

**Architecture.** The shared held-session read
(`dashboard/server/hosts/cursor/heldSessions.ts`) already joins overlapping
asks through `SharedObservation` and deliberately reuses nothing once settled,
so labels stay as current as the next ask. This story sets that observation's
reuse window to about one second under the same home and machine-document
revision key, matching the window machine-session observation already uses
(`dashboard/server/machineSessionObservation.ts`,
`dashboard/AGENT-LAUNCH-OBSERVATION.md`), and raises the section's ask gap in
`dashboard/src/RunningCursorSessions.tsx` to the same bound. The list stays an
in-process, rebuildable observation of the runner, not a new authority, daemon,
database, or cross-process cache
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
machine-local evidence supplements the published view; derived caches
rebuildable from their sources). Session cards keep sharing the same evidence
path. Push delivery and connection-budget choices stay with the published SSE
story's deferred local-session path. Evaluation follows
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md) with the
basis above. No conflict with an Accepted decision was found.

**Alternatives considered.** Leaving the 50 ms gap and zero reuse preserves
near-instant labels and saves nothing in the quiet case that dominates. Raising
only the browser gap to the Board's 15-second pace cuts requests furthest among
poll options, but can leave a follow-up or membership change unseen for a full
pace—materially weaker than "promptly" for a section whose job is live local
labels. Unchanged/digest answers alone shrink bytes while the ask rate stays
high and still re-read the runner without settled reuse. SSE or runner push
meets both goals with the least quiet traffic, at the cost and connection-budget
coupling of the larger published-SSE design; defer it. Borrowed mechanism:
settled `SharedObservation` reuse already used for machine sessions and host
status—roles map (demand → shared observe → short age bound → no reuse of
failures); the analogy breaks if this list required sub-second continuous
truth, which would need push instead. Recommended direction: one-second settled
reuse plus a matching section ask gap.

**Effort hypothesis.** Smaller than the published SSE story with good
confidence: the sharing primitive, in-flight join, demand lifecycle, and
request-counting tests already exist; the change is the reuse window and ask
gap, with proof of quiet rates and change-within-bound.

**Prerequisite and stopping point.** No blocking story prerequisite. Lower
local request volume at a one-second bound is useful even if published delivery
stays as it is.

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
