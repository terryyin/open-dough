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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer can keep reading the last published snapshot during GitHub backoff
and see that the dashboard will retry automatically, when it plans to retry
if known, and when that retry is in progress.

#### Scope and evaluation

- The backend owns the GitHub wait, next attempt, and recovery. Keep the
  dashboard SSE connection live for an eligible visible page through the wait
  and retry. The browser renders the backend's reported state and can detect
  a lost connection independently of GitHub progress.
- A visible streaming page showing a published snapshot receives a GitHub
  rate limit. It keeps the snapshot and the same connection, shows the wait,
  then shows the retry in progress. The backend makes no GitHub request during
  the wait, retries without a browser request at expiry, and sends recovery
  when the read succeeds. If GitHub extends the limit, the notice updates.
- Preserve useful status for pages without an HTTP/1.1 stream slot. The
  browser may retrieve status and catch up. The backend owns the retry for
  active observation in either delivery mode. A first visit during a wait
  can see the same backend status before a published snapshot is available.

This is useful on its own. It changes the existing GitHub status flow and its
indicator before the first local status migrates.

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

[SEED-333](../done/SEED-333_spot-completed-stories-that-need-review.json) added
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
