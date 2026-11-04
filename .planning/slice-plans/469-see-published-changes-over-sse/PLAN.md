# See published changes without recurring browser checks

**Identity:** SEED-232#see-published-changes-over-sse
**Source:** [selected story](../../seeds/SEED-232-reduce-dashboard-refresh-traffic.md#see-published-changes-over-sse)
in SEED-232, refined 2026-11-04 with explore, borrow, challenge, clarify,
investigate, stress-test and architecture.
**Prepared:** 2026-11-04. Planning only, in the story's established workspace
(branch `claude/see-published-changes-without-recurring-browser`, agent
viktor-chan), continuing the refinement in the same session.

## Goal and boundaries

A developer watching the Board, especially over the Tailscale route, sees
newly published work as soon as the dashboard process observes it. The page
sends no recurring revision checks, and the stream costs fewer bytes than
those checks did. The story's seven key examples and its evaluation basis
are the acceptance.

Included:

- a server-sent event stream at the local read boundary, answering each
  open stream in today's revision-check shape;
- an in-process observation per project and request-owner scope, at the
  current pace, that runs only while a stream for it is open;
- the page holding a stream instead of its recurring check while it is
  visible with a settled snapshot and no rate-limit wait, reopening it
  when its revision or watched branches change;
- at most two stream holders per browser on a non-multiplexing route, with
  the other pages keeping today's check;
- lost freshness shown, and caught up, when a stream fails or goes silent;
- the two documents that account for checks.

Excluded, as the story records: one shared stream per browser; WebSocket
delivery; host status, agent launches or local sessions on the stream; a
faster pace, publication-event checks or webhooks; cross-process sharing;
any change to what a page shows, how it reads content, reload's fresh ref
resolution or the request owner's protocol.

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout. Local full suites follow `tests/local-test-resources.md`: Bash 5
on PATH, and on AC power `caffeinate -s -i` around the run
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).

## Direction and PFE

- **One answer shape, two deliveries.** The stream's events carry exactly
  what a revision check answers today, its status included: a success, a
  failure, or a limited answer with its wait. So `checkPublishedRevision`'s
  parsing (`dashboard/src/authenticatedRead.ts`), `movedBranches`, the
  failure wording and the limit record stay the page's one interpretation.
  `useRevisionCheckSchedule` (`dashboard/src/revisionCheckSchedule.ts`)
  splits into the reaction to an answer and its delivery. The recurring
  check remains a real delivery for pages without a stream.
- **The server owns the pace while streams are open.** A per-process
  observation keyed by catalog source and `GitHubRequests` scope runs
  `RevisionChecks.check` once per pace and evaluates each open stream
  through `performRevisionCheck`
  (`dashboard/server/performedRevisionCheck.ts`) with that stream's
  `since` and watched branches. When the shared refresh story's
  `SharedObservation` is on trunk, the observation demands it rather than
  adding a second cache. Otherwise its own once-per-pace tick is the
  sharing. Its timers and responses are registered in the boundary's
  `tracked` lifetime (`dashboard/server/authenticatedRead.ts`), so closing
  the boundary ends them.
- **Pace and bounds.** The pace is `checkIntervalMs` (15 s). Tests lower it
  through `configuredLimit` (`dashboard/server/configuredLimit.ts`, the
  existing precedent for test-lowered server limits). The page treats
  silence longer than the pace plus `readWaitLimitMs` (45 s) as lost.
- **A distinct request.** The stream names its revision with a parameter
  other than `since`, so `isCheck` (`dashboard/tests/pageRequestNoting.ts`)
  and the request accounting keep counting checks only.
- **Connection budget.** The page decides from
  `performance.getEntriesByType("navigation")[0].nextHopProtocol`. Any
  protocol other than `h2` or `h3` is capped at two holders through Web
  Locks slots. A page that gets no slot keeps the check, and a queued slot
  request lets it take over when a holder hides or closes.
- **Existing check journeys stay on the check delivery.** About 40 page
  journeys drive checks through the paused page clock and note `since`
  requests. The dashboard test fixture's pages therefore pre-hold both
  slots from an init script, a genuine "other tabs hold the slots"
  condition, so those journeys keep proving the check delivery. Stream
  journeys opt out of that init script.
- **Documentation.** `dashboard/PUBLISHED-OBSERVATION.md` (the 15-second
  check paragraph, hidden pages, and the sharing paragraph) and
  `dashboard/GITHUB-REQUESTS.md` (per-page check accounting) say what
  changes.

Accepted decisions:

- The stream carries observations of origin. It is in-process,
  demand-driven and rebuildable, and it adds no daemon, database or
  cross-process scheduler
  ([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
- The evaluation basis is stated before the observed run, and the trade-off
  is explicit
  ([ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)).
- Existing parts are reused before new machinery
  ([ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)).

No ADR conflict was found, and no North Star topic is needed.

## Decisive premises

| Premise | Consuming operation, observed form, revision | Result | Unverified remainder |
| --- | --- | --- | --- |
| The loopback route is HTTP/1.1 and the Tailscale route multiplexes | `curl -s -o /dev/null -w "%{http_version}"` against `https://territory.tailb878f6.ts.net/` and `http://127.0.0.1:43128/`, 2026-11-04 | `2` and `1.1` | — |
| Open streams to one HTTP/1.1 origin block further pages of the same browser | Scratch Node SSE server and Playwright Chromium (`chromium-1248`), seven pages in one context, each opening `EventSource`, 2026-11-04 | True: pages 0–5 received their event, the seventh page's navigation timed out after 5 s, and a fetch from page 0 never answered | Slice 4's seven-window journey observes the cap preventing it |
| A same-origin `EventSource` passes the boundary's origin check | Same scratch setup, request headers logged: `Sec-Fetch-Site: same-origin`, `Sec-Fetch-Mode: cors`, loopback Host; `verifyLocalOrigin` returns on `same-origin` (`dashboard/server/localOrigin.ts`) | True at the header level | Slice 2's boundary spec opens a stream through the real boundary, and a cross-site request is refused with no `gh` call |
| Web Locks and the navigation protocol are available to the page on loopback | Same scratch page: `typeof navigator.locks.request` is `function`, `isSecureContext` is `true`, and `nextHopProtocol` is `http/1.1` | True | — |
| `EventSource` delivers while the page clock is paused, as journeys install it | Scratch page with `page.clock.install` and `pauseAt`, then `EventSource`: `open` and the message arrived within 0.5 s without advancing page time | True | — |
| Boundary responses are not buffered by Vite's compression | Vite 8.3.0 `dist/node/chunks/node.js`: preview runs plugin `configurePreviewServer` hooks (where `localBoundaryPlugin` mounts) before `app.use(build_default())`; the only compression use is in preview | True by source | Slice 2's preview-mode case receives the first event promptly with `Accept-Encoding: gzip` |
| Existing journeys drive checks with the page clock and `since` requests | `grep -l` for `passTimeUntilChecked`, `whileNotingChecks`, `isCheck` and `isHeadsCheck` in `dashboard/tests/*.spec.ts`: 40 spec files | True | Slice 3 runs them green with slots pre-held, and slice 4's whole suite does again |
| Tailscale's HTTPS proxy delivers each event as it is written | Not observed: adding a probe mapping changes the tailnet's serve configuration | Open | Slice 1 |

## Outside-in proof

| Story example | Owning slice | Observable signal |
| --- | --- | --- |
| 1 quiet over Tailscale (harness) | 4 | Journey: a streaming page notes no `since` request over a quiet minute of page and server time and shows no problem |
| 1 quiet over Tailscale (bytes, route) | 6 | Real dashboard: stream bytes per quiet minute below four checks' bytes, locally and through the Tailscale route |
| 2 publication arrives | 2, 4 | Boundary: two streams of one source are answered from one listing per tick. Journey: two streaming pages show R' with one backlog read, no later than one pace after publication |
| 3 each page its own answer | 2, 4, 5 | Boundary: different `since` and watched branches answered their own way. Journey: a watched branch move reads only that entry's plan and last commit time. Slice 5: a `504` listing tells the ref alone and the branch is not removed |
| 4 dropped across a change | 5 | Journey: the dashboard server is stopped (SIGSTOP), then replaced on its port; within 45 s of page time the failed-check problem shows with R kept; on return the first answer names R', and the problem clears |
| 5 hidden | 2, 4 | Boundary: the last stream closing ends the listings. Journey: hiding closes the stream; revealing answers at once |
| 6 seven local windows | 4 | Journey: seven pages of one context all load and read; two hold streams and five check at the pace; hiding a holder lets a checking page stream |
| 7 rate limit | 5 | Journey: a limited answer over the stream shows today's notice, closes the stream, asks nothing until T, then reopens |
| Evaluation basis | 6 | Real dashboard measurement against the baseline, recorded as a learning |

Local gates:

- Focused specs per slice run through
  `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`:
  - slice 2: the new boundary spec plus
    `dashboard/tests/boundary/authenticated-read-revision-check*.spec.ts`
    and `shared-observation.spec.ts`;
  - slices 3–5: `dashboard/tests/auto-refresh*.spec.ts`,
    `steady-refresh*.spec.ts`, `limit-recovery-*.spec.ts`,
    `limited-reading-check.spec.ts`, `shared-observer-reads.spec.ts`,
    `read-turns-across-tabs.spec.ts` and the new journeys.
- Before each commit, run `npm run --silent typecheck:dashboard` and
  `npm run --silent format`.
- For each slice, run the consumer trace
  (`node .claude/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout "$PWD" --base <revision> --term 'every 15 seconds' --term 'revision check'`).
- Run the whole dashboard suite once before publishing slice 4, because the
  fixture default reaches every page journey (`tests/local-test-resources.md`,
  with the sleep guard named above).
- Hosted CI runs the full suites after publication, and its failures stay
  owned under the policy above.

## Ordered slices

### 1. Probe: the Tailscale route delivers each event as written
Type: Behavior (early probe)
Status: planned
Proof:

- First ask Terry to authorize a temporary, tailnet-only
  `tailscale serve --bg --https=<unused port>` mapping to a scratch SSE
  server on a free loopback port. Ask once, with slice 6's route
  measurement in the same request.
- Through the route, a headless Chromium page and `curl -N` each receive
  an event written every second within about one second of its writing.
- Remove the mapping with `--https=<port> off`, and confirm that
  `tailscale serve status` shows only the two existing mappings again.
- Record the times as a learning.
- If events arrive late or in bursts, stop slices 4–6 and change the plan.
  If authorization is withheld, the observation moves to slice 6's
  post-deployment measurement, and the execution-complete record names the
  premise as still open.

Behavior: An SSE response through the Tailscale HTTPS proxy → each event
reaches the browser as it is written.

### 2. The read boundary streams each subscriber's revision answers
Type: Behavior
Status: planned
Proof: A new boundary spec beside
`authenticated-read-revision-check.spec.ts`, through real HTTP, the
synthetic `gh` and a lowered pace, shows:

- the stream answers `text/event-stream`, uncacheable, with its first
  answer at open;
- two streams of one source at different revisions and watched branches
  cost one `matching-refs` invocation per tick, and each gets its own
  answer;
- after the last stream closes, no further listing is asked;
- a cross-site request is refused before any `gh` call;
- closing the boundary ends open streams and stops the observation;
- a `504` listing answers the ref alone without branches;
- a rate-limited listing answers limited with its wait;
- a preview-mode case with `Accept-Encoding: gzip` receives the first event
  promptly.

The existing revision-check boundary specs stay green.

Behavior: A client opens a revision stream for a source, a revision and
watched branches → the boundary answers at once and then once per pace in
the check's shape, sharing one listing across that source's streams.

### 3. The page's revision observation separates answers from their delivery
Type: Structure
Status: planned
Proof:

- `useRevisionCheckSchedule`'s reaction to an answer (changed, unchanged,
  moved branches, failure, limit) is separated from its recurring-check
  delivery.
- The page asks for a delivery slot by the route's protocol. A slot holder
  still checks until slice 4.
- The test fixture's pages pre-hold both slots.
- A unit case covers the protocol choice (`h2` and `h3` uncapped, anything
  else capped at two).
- The focused journeys of slices 3–5 stay green unchanged.

Internal change: delivery becomes the observation's choice, and external
behavior is unchanged. Enables slice 4.

### 4. The Board follows published changes over its stream
Type: Behavior
Status: planned
Proof: New journeys, without pre-held slots and with the server pace
lowered, show:

- a streaming page sends no `since` request over a quiet minute;
- two pages show R' from one listing after a publication, with one
  backlog read;
- a watched branch move reads only that entry's plan and last commit time,
  and the other page reads nothing;
- hiding closes the stream, and with no other stream the fake GitHub sees
  no further listing; revealing answers at once;
- after reading R' the page reopens its stream at R';
- seven pages of one context all load, two stream and five check at the
  pace, and hiding a holder lets a checking page stream.

`PUBLISHED-OBSERVATION.md` and `GITHUB-REQUESTS.md` describe streams, the
cap and the remaining check delivery. Run the whole dashboard suite once
before publication.

Behavior: A visible settled page on a route with a free slot → it holds a
stream instead of recurring checks and reads each published change the
stream names.

Interim behavior until slice 5: a failed or silent stream is not reported,
and the browser's own reconnect may retry sooner than the pace. In Trunk
Mode, publish slices 4 and 5 together, because the production watcher
deploys qualifying trunk commits.

### 5. A lost stream shows lost freshness and catches up
Type: Behavior
Status: planned
Proof: Journeys show:

- with the server process stopped (SIGSTOP on its group), 45 s of page
  time shows today's failed-check problem with R and its retrieval time
  kept;
- reopen attempts come no more often than the pace;
- after the server is replaced on its port across a publication of R', the
  first answer names R', the page reads it, and the problem clears;
- a `504` listing over the stream leaves the watched branch shown, not
  removed;
- a rate-limited answer shows today's notice, closes the stream, asks
  nothing until T, then reopens and resumes.

The page closes a failed `EventSource` itself rather than relying on its
automatic retry. The documents add the lost-stream wording.

Behavior: A streaming page whose stream fails, closes or falls silent → it
shows lost freshness with its snapshot kept, reopens at the pace, and the
first answer catches it up.

### 6. The gain is observed on a real dashboard
Type: Behavior
Status: planned
Proof: On a throwaway preview server built from this checkout (private
HOME with a one-project list, `GH_TOKEN="$(gh auth token)"`, a private
`DOUGH_GITHUB_REQUEST_OWNER_ROOT`), headless Playwright measures the Open
Dough Board over one quiet minute:

- Count `since` requests and transferred bytes from CDP
  `Network.loadingFinished` and `Network.dataReceived` encoded lengths. Do
  this once with slots pre-held (the check delivery, the baseline route)
  and once streaming.
- Measure publication-to-display with the project's configured ref set to
  a scratch branch cut from `main`: push one commit to it, time it to the
  page showing that revision, and delete the branch afterwards. Trunk is
  not touched.
- Repeat the streaming minute through the Tailscale route, using slice 1's
  authorization, or record it as the post-deployment check that wrap-up
  confirms.
- Record the revision, counts, bytes and times as a learning.

A stream that costs more bytes than the checks is a defect to diagnose,
not a result to report and move on from. No production dashboard is
restarted.

Behavior: The landed dashboard with one real visible page → no recurring
check requests, fewer bytes than four checks a minute, and no later
display.

## Current decisions

- The transport is SSE, as the story decided. WebSocket and a shared
  per-browser stream are deferred.
- The cap is two holders per browser on routes whose navigation protocol
  is not `h2` or `h3`. Pages without a slot keep the recurring check, which
  stays a maintained delivery.
- The stream sends the current answer once per pace. That answer is the
  liveness message, so a stream needs no separate heartbeat or event
  history. The first answer at every open is the catch-up, and no
  `Last-Event-ID` is used.
- The page owns reopening: it closes a failed stream and reopens no more
  often than the pace.
- The observation is keyed by catalog source and request-owner scope, and
  an undefined scope shares nothing. It runs only while a stream for it is
  open.
- Slices 2 and 3 are safe stopping points: no page uses the stream before
  slice 4. Slices 4 and 5 reach trunk together.

## Concern evidence

Slice-plan refinement was not needed. Each slice owns one proof loop. The
one Structure slice sits immediately before the Behavior it enables, and
the sequence reuses the revision check's answer, comparison and failure
paths rather than adding a second interpretation.

Remaining concern: slice 1's Tailscale premise is open until its probe
runs. It is bounded by that early probe slice, whose failure stops slices
4–6. Interim behavior between slices 4 and 5 is named above with its
publication constraint.
