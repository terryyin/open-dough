---
id: SEED-336
status: active
planted: 2026-11-13
planted_during: Terry requested a staged move of live dashboard status to SSE after observing staggered Needs review flashes
trigger_when: selected from the product backlog
scope: five stories
---

# SEED-336 — Keep dashboard status current with SSE

## Why this matters

Developers monitoring work need a steady view of published and machine-local
status. The browser currently closes its revision stream during GitHub backoff.
Local review state and sidebar links are polled independently, which adds
requests and can make **Needs review** flash. Session status, CI follow-up, and
host status have their own browser refresh schedules.

## Alternatives and rollout

Keeping the current behavior or manually refreshing leaves avoidable requests
and delays. Retaining settled review links alone would remove a source of
flicker, and belongs in the review story. Moving GitHub retry scheduling and
its indicator first gives developers a clear account of what the dashboard is
doing and establishes a connection that can keep carrying local updates. Then
bring review, session, CI follow-up, and host status onto that connection in
order of user value. Each story delivers a usable view when later work waits.
Host status comes last because its current sampler is already shared and the
browser only reads it while the sidebar is visible.

Follow [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them)
and the [Architectural North Star](../NORTH-STAR.md#dashboard-status-delivery).
Use [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md) to
compare update latency, requests, transferred bytes, and backend work with the
current behavior as the stories land. Terminal traffic stays on WebSocket.
For all five stories, SSE events, snapshots, and HTTP fallbacks map directly to
the same domain concepts, identities, and meanings. Compact payloads use subsets
of those concepts and the minimum necessary translation under
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution).
[History payloads](SEED-337-dashboard-history-reads.md#read-only-the-history-the-dashboard-needs)
have their own story.

## Story decomposition

<a id="show-github-retry-on-the-dashboard"></a>

### Show GitHub retry on the dashboard

**Identity:** SEED-336#show-github-retry-on-the-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/612-show-github-retry-on-the-dashboard/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"671c1ae6e1acd5935c62d8b1a5169b679ba85ad765569dc57f3fcf15573ec95b","plan":"61b79d05e3cd0b7c834ec2a4cfdedc3cd02bc3f7b5780738344f52348579ecea"}}
```

#### Goal

A developer can keep reading the last published snapshot during GitHub backoff
and see that the dashboard will retry automatically, when it plans to retry
if known, and when that retry is in progress.

#### Scope

- The backend owns the GitHub wait, next attempt, and recovery for active
  published-source observation. The browser reports waiting, the next planned
  retry time when known, an attempt actually in progress, and recovery after
  a successful read. Expiring a browser timer or opening a connection does
  not establish either an attempt or recovery.
- Keep the last published snapshot readable with its revision and retrieval
  time throughout waiting and retrying. A visible page eligible for streaming
  keeps its dashboard SSE connection through both states. GitHub progress and
  dashboard connection health remain independently observable, including a
  lost or silent connection during a long GitHub wait.
- The existing shared GitHub request owner remains the authority for the wait
  and request admission. No GitHub request starts before that wait ends; an
  extension moves the reported retry later. The backend schedules the next
  attempt without needing a browser request at expiry, sharing observation
  among interested pages rather than scheduling one retry per page.
- Pages without an HTTP/1.1 stream slot may retrieve current status and catch
  up over HTTP. Their active observation still has a backend-owned retry. A
  first visit during a wait can learn that status before a snapshot exists.
  Status retrieval itself need not ask GitHub or wait for GitHub to answer.
- Preserve visibility-scoped demand, the existing connection budget, source
  selection, and snapshot/content catch-up. A returning or reconnecting page
  learns current status; a departed page cannot overwrite the selected source.

#### Scope limits and required restrictions

Review cues, sessions, CI follow-up, and host status migrate in their own
stories. This story keeps the connection usable through GitHub backoff but
does not add their events. It adds no manual retry override, new stream per
status, terminal transport, or durable story state. Existing ordinary read
errors and eligible transient recovery keep their meanings; this is not a
general move of every read scheduler to the backend.

The no-request-before-retry rule protects GitHub's directed or validated
fallback wait. Shared request admission, local authentication, and the
HTTP/1.1 stream budget protect the existing upstream and connection limits;
they are correctness constraints rather than limits inferred from examples.
Having a snapshot is not a prerequisite for reporting backend status.

#### Key examples

1. A visible streaming page shows snapshot A. GitHub rate-limits the next
   observation until T. The page retains A and its retrieval time, keeps the
   same connection, and says that the dashboard will retry automatically at
   T. No GitHub request starts during the wait. At T, the backend starts the
   attempt without a new browser request and reports retrying. Success clears
   the GitHub notice and catches up with published work, even if the revision
   is still A.
2. Two pages observe one project. Their shared retry is refused with a later
   wait, or with no usable GitHub time. Both show the backend's new planned
   attempt, including the request owner's existing fallback wait when used.
   Neither page invents a success or starts an independent retry at the old T.
3. A streaming page waits longer than the ordinary silence bound. A healthy
   connection remains distinguishable from one that has closed or fallen
   silent. Losing that connection reports lost dashboard freshness while A
   and the last known GitHub status remain available; reconnecting catches up
   with current backend status rather than restarting the GitHub wait.
4. An HTTP/1.1 page has no stream slot. It retrieves the same waiting and
   retrying status as streaming pages. Stop its status GETs before T while
   its observation interest is active: the backend still attempts at T. Its
   next status read catches up without creating a second upstream attempt.
5. A first visit during a shared GitHub wait has no snapshot. It sees the
   automatic retry status before published content is available. Backend
   recovery permits the normal initial content read. Hiding or leaving ends
   that page's observation demand; revealing or returning gets current status
   without replaying missed attempts or disturbing another observing page.

#### UI and architecture

Describe the wait and automatic retry near the published source summary,
using the existing status/announcement surface. Say when an attempt is in
progress and clear the GitHub notice only on successful observation. Keep a
connection problem distinct so a developer can tell whether the dashboard
still receives updates. A planned time promises an attempt, not successful
publication or delivery at that time. No new layout or component is selected.

Follow Accepted [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them)
and [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution):
one backend observation status has the same meaning through SSE, HTTP, and
the browser. Connection health is transport evidence, not GitHub success or
story state. The existing [Dashboard status delivery](../NORTH-STAR.md#dashboard-status-delivery)
topic supplies direction; no new ADR or architectural exception is needed.
Backend recovery signals may trigger the browser's existing snapshot readers;
this does not transfer published-work interpretation into the backend.

#### Alternatives, challenge, and evidence

The existing browser countdown/reopen is the smallest change but leaves retry
ownership in the page and interrupts the connection. A separate status stream
could report backend progress but would consume another connection and repeat
connection recovery. Recommend the selected shared-stream direction, with HTTP
status for pages without a slot: it satisfies the goal within the existing
budget and keeps one source of retry scheduling.

Borrow a departure board's relationship to dispatch: the dispatcher owns the
next attempt and reports a delay, dispatch, or recovery; the board presents
that account without controlling it. Here the backend observer and request
owner supply that account and the browser is the board. The analogy stops at
the planned time: GitHub can extend the wait and no successful read is assured.

The strongest challenge is that a countdown can reach zero while nothing is
being attempted, or a live stream can be mistaken for fresh GitHub data. The
examples require backend-originated progress and independent connection
health, preserving the already selected goal rather than broadening it.

Observed in this owned workspace on 2026-11-13 at `22bb416f10d6d8c723a12f8d93f51d008b1d3c3c`:
the controlled backend stream tests pass for shared listings/last-close cleanup
and a rate-limit event carrying a 120-second wait. The browser rate-limit
journey passes for retaining A, closing, waiting, reopening, and recovery.
Removing only the immediate close call in a reverted scratch experiment still
passed: the limit change also triggers effect cleanup. Retry/status changes
therefore need separation from stream lifecycle eligibility. The
[slice plan](../slice-plans/612-show-github-retry-on-the-dashboard/PLAN.md)
records exact commands, remaining proof, and extension points. Autonomous
due-time retry, bootstrap/fallback status, and liveness through a long wait
are new behavior to prove, not findings claimed from the baseline.

This remains useful if later status migrations wait. There is no open goal,
scope, or architecture decision from this refinement.

<a id="keep-review-cues-current-with-sse"></a>

### Keep review cues current with SSE

**Identity:** SEED-335#keep-review-cues-current-with-sse
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer can scan **Recently done sessions** while its **Needs review**
labels stay steady. Saving a review updates the Board and linked sidebar rows
on the same page immediately and reaches other connected pages on the same
dashboard through server-sent events (SSE), without waiting for a poll.

#### Scope to refine

- Reuse the dashboard's existing SSE connection for story review updates,
  including rows from projects other than the one selected on the Board.
  A streaming page needs no separate connection or recurring review GET per
  project. Reconnecting catches up with saved changes. Failed saves leave the
  last confirmed state visible and do not announce a change.
- Resolve shown rows' completed-story links when the evidence changes or an
  unresolved read needs recovery. Reuse confirmed links for unchanged rows
  while new answers are pending. Update a row when the link or review state
  actually changes. Preserve the existing rules for published done stories and
  confirmed Ad hoc associations. An unverified link supplies no warning.
- Keep the dashboard SSE connection and its machine-local review updates live
  while GitHub reads are rate-limited or temporarily unavailable. Use the
  connection and status behavior delivered by
  [Show GitHub retry on the dashboard](#show-github-retry-on-the-dashboard).
  Confirmed labels stay visible as local review changes continue to arrive.
- Reuse the existing HTTP/1.1 stream budget. Settle how a page catches up when
  the dashboard connection itself drops or a page has no stream slot.
- Keep the existing review file as the durable source for the dashboard
  machine. Keep published completed-story evidence and machine-local review
  state distinct under
  [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).

#### Key examples to refine

1. A quiet visible page streams with linked rows from two projects. Over a
   controlled minute, no established label disappears and there are zero
   recurring review GETs or repeated completed-story link requests for those
   unchanged rows. Measure the request counts against the current behavior,
   including catalog and Ad hoc association requests, and check that the page
   holds no additional SSE connection.
2. Two pages show linked rows for the same story. A successful **Mark as
   reviewed** clears the cue on the saving page and the other streaming page
   without a periodic refresh. **Unreview** restores it. Rows with the same
   story identity in a different project keep their own state.
3. GitHub rate-limits published reads while two dashboard pages are streaming.
   The published snapshot stays visible with a rate-limit notice. A review
   saved on one page updates the other through its existing connection, with
   no review GET or GitHub read during the wait. Published updates resume after
   the backend's wait ends.
4. A page loses its stream while another page saves a change. Existing cues
   stay visible during the interruption, and the first usable observation
   reconciles them with the saved state. Revealing older rows or receiving new
   publication evidence updates the affected rows without flashing settled rows.

#### Background

[Spot completed stories that need review](https://github.com/terryyin/open-dough/blob/00295c11c7e28959be063196ae152921c51f2c6d/.planning/seeds/SEED-333-spot-completed-stories-that-need-review.md#spot-completed-stories-that-need-review) added
the cue. [The review store](../../dashboard/src/storyReviewStates.ts) polls
once per project every 15 seconds. [The sidebar link reader](../../dashboard/src/recentlyDoneShownLinks.ts)
also refreshes every 15 seconds and publishes partial results from a fresh
map, which can briefly hide a label until its link resolves again. The
[published observation stream](../../dashboard/PUBLISHED-OBSERVATION.md#published-dashboard-observation)
owns connection limits, visibility and reconnect behavior. Today the browser
closes its EventSource when it receives a GitHub rate-limit event. This story
delivers steadier review cues independently of the later status migrations.

<a id="stream-session-status"></a>

### See session status change live

**Identity:** SEED-336#stream-session-status
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer watching the Board and Sessions sidebar sees a session start,
wait for input, report, or finish as soon as the dashboard observes it.

#### Scope and evaluation

- Reuse the shared dashboard stream and the existing server-side machine-session
  observation across projects. Keep explicit post-action reads and catch-up
  where needed. Share native host sampling where a host requires it, and send
  compact changes or a revision notification rather than repeating snapshots.
- A session changes while two pages are open. Each page reflects the same
  observed state and attention cue, without steady overview GETs or a second
  observation loop for each tab. Feedback maintenance can reuse the same live
  session state where it currently polls that overview. An idle tab should
  consume less traffic than the current conditional polling baseline.

Faster session visibility is useful before CI follow-up or host status migrates.

<a id="stream-ci-follow-up-status"></a>

### See CI follow-up status change live

**Identity:** SEED-336#stream-ci-follow-up-status
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer watching a completed story sees an automatic CI follow-up start
and then settle when the dashboard records the result.

#### Scope and evaluation

Use the shared stream for changes to the existing CI follow-up status. A
visible done card updates from rerun in progress to the settled outcome, with
its existing explanation and evidence links, without recurring CI follow-up
GETs on a streaming page. A page catching up reads the current recorded state.
This delivers live card feedback independently of host status.

<a id="stream-host-status"></a>

### See host status while the sidebar is open

**Identity:** SEED-336#stream-host-status
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer viewing the Sessions sidebar sees current CPU and free-disk
figures, with one shared backend sample for interested pages.

#### Scope and evaluation

Use the shared stream while the status is in view. Opening two sidebars shows
their host figures without recurring per-page host-status GETs. Closing the
last interested sidebar or hiding its page ends the sampling demand. Preserve
the meaning and availability of the existing figures. Compare the traffic and
sampling cost with the existing shared, visibility-scoped polling before
keeping the migration. It is the first story to defer if the gain is too small.
