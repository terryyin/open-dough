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
| Tailscale's HTTPS proxy delivers each event as it is written | Temporary `tailscale serve --bg --https=9443` → `127.0.0.1:18765` scratch SSE (1 event/s); headless Chromium and `curl -N` against `https://territory.tailb878f6.ts.net:9443/events`, 2026-11-04; mapping removed afterward | Chromium lag 1–4 ms, gaps ~1 s; curl lag ~1.0 s (steady, not bursty) | — |

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
