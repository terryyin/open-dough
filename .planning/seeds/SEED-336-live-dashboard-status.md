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

Follow [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them).
Use [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md) to
compare update latency, requests, transferred bytes, and backend work with the
current behavior as the stories land. Terminal traffic stays on WebSocket.
For all five stories, SSE events, snapshots, and HTTP fallbacks map directly to
the same domain concepts, identities, and meanings, sharing one typed contract
between `dashboard/server/` and `dashboard/src/` under
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
and the [Architectural North Star](../NORTH-STAR.md). Keep `e2e/` to one or two
representative streaming journeys; prove backend observation/retry rules in
plain Node Vitest on strongly typed handlers (testing the wire directly only for
SSE framing), prove UI status/cue components in plain Vitest + embedded headless
Chromium without `@playwright/test` or page objects, and add no wrappers or
instrumentation to `test-support` (only MakeMe data builders and `e2e/` page
objects are permitted; any touch outside them removes from `test-support`).
For each status, the unit test suite should be able to
[render the owning view](../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability) from its typed status
and construct the observation handler with only that status’s dependencies.
[History payloads](SEED-337-dashboard-history-reads.md#read-only-the-history-the-dashboard-needs)
have their own story.

## Story decomposition

<a id="show-github-retry-on-the-dashboard"></a>

### Show GitHub retry on the dashboard

**Identity:** SEED-336#show-github-retry-on-the-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/612-show-github-retry-on-the-dashboard/PLAN.md","assessment":"not-ready","reasons":["Realign plan 612 proof rows with plain Vitest unit tests (Node Vitest for typed observation handlers, Vitest + Chromium for UI notice states, e2e/ only for representative stream journeys) and zero test-support wrappers."],"basis":{"document":"94ec0694b0aeaaab9e15682a4cf24982fcbfdccef569aa8c573005c8c6865b6c","plan":"569740ee29d8583a3c5e301607f8956881be0f3c2dc897af45ff728900e35f64"}}
```

#### Goal

A developer can keep reading the last published snapshot during GitHub backoff
and see that the dashboard will retry automatically, when it plans to retry
if known, and when that retry is in progress.

#### Scope

- Backend owns GitHub wait, next attempt, and recovery for active
  published-source observation; browser reports waiting, next planned retry when
  known, actual attempt in progress, and recovery after a successful read
  (neither timer expiry nor opening a connection establishes an attempt or
  recovery).
- Keep the last published snapshot readable with revision and retrieval time
  throughout waiting and retrying; an eligible visible page keeps its SSE
  connection through both, keeping GitHub progress and dashboard connection
  health independently observable (including silent/lost connections).
- Shared GitHub request owner remains authority for wait and admission: no
  GitHub request before wait ends, extensions move reported retry later, and
  backend schedules one shared attempt across interested pages without a browser
  request at expiry.
- Pages without an HTTP/1.1 stream slot retrieve current status and catch up
  over HTTP while backend still retries on schedule; a first visit during a wait
  learns status before any snapshot exists, without asking or waiting on GitHub.
- Preserve visibility-scoped demand, connection budget, source selection, and
  snapshot catch-up; a departed page cannot overwrite the selected source.

#### Scope limits and restrictions

Review cues, sessions, CI follow-up, and host status migrate in their own
stories. Add no manual retry override, extra stream per status, terminal
transport, or durable story state; keep existing transient content-read error
meanings, GitHub wait protection, local auth, and HTTP/1.1 stream budget. Having
a snapshot is not a prerequisite for reporting backend status.

#### Key examples

1. Visible streaming page shows snapshot A; GitHub rate-limits until T → retains
   A and retrieval time on the same connection, announces automatic retry at T
   with zero GitHub requests during the wait, backend attempts at T without a
   browser request and reports retrying, and success clears the notice even if
   revision is still A.
2. Two pages observe one project; shared retry is refused with a later wait or no
   usable GitHub time → both show the new planned attempt (or owner fallback)
   without inventing success or retrying at old T.
3. Streaming page waits past the ordinary silence bound → healthy connection
   stays distinct from closed/silent; connection loss reports lost dashboard
   freshness while retaining A and last GitHub status, and reconnecting catches
   up without restarting the GitHub wait.
4. HTTP/1.1 slotless page stops status GETs before T while interest is active →
   backend still attempts once at T, and the next GET catches up.
5. First visit during a shared wait (no snapshot) → sees retry status before
   content; backend recovery enables initial content read; hiding/leaving ends
   demand without disturbing other pages.

#### UI, architecture, and evidence

Describe wait, active retry, and connection loss distinctly near the published
source summary without new layout/components; one backend observation status has
the same meaning across SSE, HTTP, and browser without moving published-work
interpretation to the backend (historical prose at
`248e6e284:.planning/seeds/SEED-336-live-dashboard-status.md`).

Observed on 2026-11-13 at `22bb416f10d6d8c723a12f8d93f51d008b1d3c3c`: backend
stream sharing/cleanup and 120 s rate-limit events pass; removing only the
immediate close call in a scratch check still closed the stream via effect
cleanup, so retry/status updates must be separated from stream lifecycle
eligibility ([slice plan](../slice-plans/612-show-github-retry-on-the-dashboard/PLAN.md)).

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

- Reuse the existing SSE connection across projects (no extra connection or
  recurring review GET per project); reconnect catches up, and failed saves keep
  the last confirmed state without announcing a change.
- Resolve shown rows' completed-story links on evidence change or needed
  recovery, reusing confirmed links while reads are pending so settled rows do
  not flash (`storyReviewStates.ts` and `recentlyDoneShownLinks.ts` currently
  poll every 15 s; `00295c11c`); preserve published done-story and Ad hoc
  association rules (unverified links supply no warning).
- Keep SSE and local review updates live during GitHub backoff using
  [Show GitHub retry on the dashboard](#show-github-retry-on-the-dashboard),
  reuse the HTTP/1.1 stream budget with catch-up for dropped/slotless pages, and
  keep the local review file distinct from published completion under
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).

#### Key examples to refine

1. Quiet visible page streaming linked rows from two projects over a controlled
   minute → zero disappearing labels, zero recurring review or unchanged-link
   GETs, and no extra SSE connection (measured against baseline).
2. Two pages showing linked rows for one story → **Mark as reviewed** /
   **Unreview** updates both without periodic refresh while other projects keep
   independent state.
3. GitHub rate-limits reads while two pages stream → snapshot and rate-limit
   notice stay visible, saved reviews reach the other page with zero review or
   GitHub GETs during the wait, and published updates resume afterward.
4. Stream drops while another page saves → cues stay visible during the gap,
   first usable observation reconciles them, and revealing older rows or new
   publications never flashes settled rows.

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
