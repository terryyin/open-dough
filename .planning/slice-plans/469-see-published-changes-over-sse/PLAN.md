# See published changes without recurring browser checks

**Identity:** SEED-232#see-published-changes-over-sse
**Source:** [selected story](../../seeds/SEED-232-reduce-dashboard-refresh-traffic.md#see-published-changes-over-sse)
in SEED-232, refined 2026-11-04 with explore, borrow, challenge, clarify,
investigate, stress-test and architecture.
**Source review:** [source-review.md](./source-review.md)
**Prepared:** 2026-11-04. Planning only, in the story's established workspace
(branch `claude/see-published-changes-without-recurring-browser`, agent
viktor-chan), continuing the refinement in the same session.

## Goal and boundaries

A developer watching the Board, especially over the Tailscale route, sees
newly published work as soon as the dashboard process observes it. The page
sends no recurring revision checks, and the stream costs fewer bytes than
those checks did. The story's seven key examples and its evaluation basis
are the acceptance.

Included: a server-sent event stream at the local read boundary,
answering each open stream in today's revision-check shape; an in-process
observation per project and request-owner scope, at the current pace, only
while a stream for it is open; the page holding a stream instead of its
recurring check while visible with a settled snapshot and no rate-limit wait,
reopening when its revision or watched branches change; at most two stream
holders per browser on a non-multiplexing route (other pages keep today's
check); lost freshness shown and caught up when a stream fails or goes silent;
the two documents that account for checks.

Excluded, as the story records: one shared stream per browser; WebSocket
delivery; host status, agent launches or local sessions on the stream; a
faster pace, publication-event checks or webhooks; cross-process sharing; any
change to what a page shows, how it reads content, reload's fresh ref
resolution or the request owner's protocol.

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout. Local full suites follow `tests/local-test-resources.md`: Bash 5
on PATH, and on AC power `caffeinate -s -i` around the run
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).

## Direction, premises, proof and decisions

Retained in [planning-basis.md](./planning-basis.md).

## Ordered slices

### 1. Probe: the Tailscale route delivers each event as written
Type: Behavior (early probe)
Status: done
Proof:

- Terry authorized the temporary mapping and slice 6's Tailscale route
  measurement (2026-11-04).
- Mapping: `tailscale serve --bg --https=9443` → scratch SSE on
  `127.0.0.1:18765` (one event per second with `writtenAt`). Route URL
  `https://territory.tailb878f6.ts.net:9443/`.
- Headless Chromium (Playwright): five events, lagMs `[4, 2, 1, 3, 1]`,
  gapsMs `[1000, 1002, 1004, 999]`.
- `curl -N`: five events, lagMs ≈ 1001–1003 (steady gaps ≈ 1000–1003 ms;
  not bursty; within about one second).
- `tailscale serve --https=9443 off`; `tailscale serve status` matched the
  pre-probe baseline (only `:443`→43128 and `:8443`→17235).
- Premise holds; slices 4–6 stay as planned. Slice 6 may reuse this
  authorization for the Tailscale quiet-minute measurement.

Behavior: An SSE response through the Tailscale HTTPS proxy → each event
reaches the browser as it is written.

### 2. The read boundary streams each subscriber's revision answers
Type: Behavior
Status: done
Proof: `dashboard/tests/boundary/authenticated-read-revision-stream.spec.ts`
through real HTTP, synthetic `gh`, and `DOUGH_REVISION_STREAM_MS=80`, plus
existing revision-check and shared-observation specs (21 passed; coordinator
rerun 2026-11-04). Shows:

- `text/event-stream`, `Cache-Control: no-store`, first answer at open;
- two streams (`at`+`watch` vs other `at`) share one `matching-refs` per
  tick and each get their own answer; after both close, no further listing;
- cross-site Origin refused with 403 and no `gh` call;
- `server.close` ends the stream and stops further listings;
- `504` listing → `{ revision, changed }` without branches;
- rate-limited listing → limited error with `retryAfterSeconds: 120`;
- preview + `Accept-Encoding: gzip` first event within 2 s.

Implementation: `revisionStreamObservation.ts` / `sourceRevisionStream.ts`
demand `SharedObservation` per source+scope; `at` parameter (not `since`);
optional listing into `performRevisionCheck`. `npm run typecheck:dashboard`
exit 0.

Behavior: A client opens a revision stream for a source, a revision and
watched branches → the boundary answers at once and then once per pace in
the check's shape, sharing one listing across that source's streams.

### 3. The page's revision observation separates answers from their delivery
Type: Structure
Status: done
Proof (coordinator rerun 2026-11-04):

- `revisionAnswer.ts` holds reaction; `revisionCheckSchedule.ts` is check
  delivery only; `revisionStreamSlot.ts` + `publishedObservation.ts` choose
  delivery (`revisionDeliveryForSlot` still returns `"check"`).
- `dashboardTest.ts` init script pre-holds both Web Lock slots.
- `tests/support/revision-stream-slot.test.mjs`: h2/h3 uncapped, else 2
  (2 passed).
- Focused journeys 33 passed; `typecheck:dashboard` exit 0.

Internal change: delivery becomes the observation's choice, and external
behavior is unchanged. Enables slice 4.

### 4. The Board follows published changes over its stream
Type: Behavior
Status: done
Proof (coordinator 2026-11-05):

- `dashboard/tests/revision-stream.spec.ts` (no pre-hold slots,
  `DOUGH_REVISION_STREAM_MS` lowered): quiet minute with no `since`; two
  pages one listing/one backlog; watched-branch move; hide/reveal; reopen
  at R'; seven pages two stream / five check with slot handoff — focused
  stream + boundary specs 13 passed; `typecheck:dashboard` exit 0.
- Full `npm run test:dashboard` under `caffeinate -s -i` exit 0 after fixing
  open-vs-pace race in `sourceRevisionStream.ts` (pace starts only after
  first open demand settles).
- Docs: `PUBLISHED-OBSERVATION.md`, `GITHUB-REQUESTS.md`.
- Implementation: `revisionStreamSchedule.ts` EventSource; slot holders
  get `"stream"` via `revisionDeliveryForSlot`.

Behavior: A visible settled page on a route with a free slot → it holds a
stream instead of recurring checks and reads each published change the
stream names.

Interim behavior until slice 5: a failed or silent stream is not reported,
and the browser's own reconnect may retry sooner than the pace. In Trunk
Mode, publish slices 4 and 5 together, because the production watcher
deploys qualifying trunk commits.

### 5. A lost stream shows lost freshness and catches up
Type: Behavior
Status: done
Proof (coordinator 2026-11-05):

- `dashboard/tests/revision-stream-lost.spec.ts`: SIGSTOP → lost freshness
  in 45s page time with R kept; reopen ≤ pace; replace server across R'
  catches up; 504 leaves branch; rate-limit notice then reopen at T.
- Focused suite including revision-stream* + refresh/limit journeys: 42
  passed; `typecheck:dashboard` exit 0.
- `revisionStreamSchedule.ts`: silence bound `checkIntervalMs +
  readWaitLimitMs`; onerror/silence close EventSource and reopen at pace;
  keep effect-level rate-limit guard (do not defer open via page-clock
  `scheduleOpenAfter` alone — that stranded streams under paused clocks).
- Docs: lost-stream wording in PUBLISHED-OBSERVATION.md and
  GITHUB-REQUESTS.md.

Behavior: A streaming page whose stream fails, closes or falls silent → it
shows lost freshness with its snapshot kept, reopens at the pace, and the
first answer catches it up.

### 6. The gain is observed on a real dashboard
Type: Behavior
Status: done
Proof (coordinator 2026-11-05): Throwaway preview at `40eb66ce` (private
HOME, keyring `GH_TOKEN`, private request-owner root). Learning records:

- Check quiet minute: `since` **3** / **1860** B → four-check baseline
  ≈**2480** B; stream quiet minute: `since` **0** / **1008** B
  (**1008 < 2480**).
- Publication-to-display **15302** ms on scratch branch (deleted; trunk
  untouched).
- Sessions still **4**/min (**1160** B) — M7 disclosed.
- Tailscale Board quiet-minute: **post-deployment wrap-up check** (direct
  serve blocked by Vite Host + loopback origin; production uses Caddy).

Behavior: The landed dashboard with one real visible page → no recurring
check requests, fewer bytes than four checks a minute, and no later
display.

## Concern evidence

Slice-plan refinement was not needed. Each slice owns one proof loop; the one
Structure slice sits before the Behavior it enables. Remaining concern: none
from slice 1 (Tailscale SSE premise held). Interim behavior between slices 4
and 5 stays named under slice 4 with its publication constraint.

## Story obligations

### G1. Deferred shared stream per browser
Reported: slice 1 — "one shared stream per browser so that every visible page streams on a non-multiplexing route"
Story clause: "one shared stream per browser so that every visible page streams on a non-multiplexing route"
Disposition: excluded "one shared stream per browser so that every visible page streams on a non-multiplexing route"
Commitment: D1

### G2. Deferred WebSocket delivery
Reported: slice 1 — "WebSocket delivery"
Story clause: "WebSocket delivery"
Disposition: excluded "WebSocket delivery"
Commitment: D2

### G3. Deferred host status, launches and local sessions on the stream
Reported: slice 1 — "carrying host status, agent launches or local sessions on the stream"
Story clause: "carrying host status, agent launches or local sessions on the stream (the Board's other two 15-second reads stay as they are)"
Disposition: excluded "carrying host status, agent launches or local sessions on the stream (the Board's other two 15-second reads stay as they are)"
Commitment: D3

### G4. Deferred faster pace, publication events and webhooks
Reported: slice 1 — "a faster server pace, an immediate check on a known publication event, or GitHub webhooks"
Story clause: "a faster server pace, an immediate check on a known publication event, or GitHub webhooks"
Disposition: excluded "a faster server pace, an immediate check on a known publication event, or GitHub webhooks"
Commitment: D4

### G5. Deferred cross-process observation sharing
Reported: slice 1 — "sharing observations across separately launched dashboard processes"
Story clause: "sharing observations across separately launched dashboard processes"
Disposition: excluded "sharing observations across separately launched dashboard processes"
Commitment: D5

## Learnings

- 2026-11-04 slice 1: Tailscale HTTPS delivered each 1 Hz SSE event as written
  (Chromium lag 1–4 ms; curl ~1 s steady). Premise holds; slices 4–6 unchanged.
- 2026-11-04 slice 4 interim (until slice 5): a failed or silent stream is not
  yet reported as lost freshness; the browser's EventSource reconnect may retry
  sooner than the revision-stream pace. Web Locks `ifAvailable` cannot be
  combined with `signal` (Chromium NotSupportedError); slot acquisition uses
  `ifAvailable` alone and aborts the held wait separately.
- 2026-11-05 slice 6 measurement (`40eb66ce`, `vite preview` `127.0.0.1:52491`,
  private HOME one-project list, keyring `GH_TOKEN`, private
  `DOUGH_GITHUB_REQUEST_OWNER_ROOT` 0700; CDP `loadingFinished` /
  `dataReceived`; no production restart; trunk untouched). Check quiet
  (`http/1.1`, slots held): `since` **3** / **1860** B → four-check ≈**2480** B
  (~15.5 s; 60.003 s window). Stream quiet: `since` **0** / **1008** B one
  EventSource (**1008 < 2480**, not a defect). Sessions (M7): still **4**
  `/__agent-launch` / **1160** B each quiet minute. Publication-to-display
  **15302** ms: scratch `slice6-sse-measure-1793829261431` from
  `origin/main` `7e4a9287…`, empty commit `736ca7d1…`, status showed
  `Published work read at revision 736ca7d`, branch deleted. Tailscale Board
  quiet-minute deferred to **post-deployment wrap-up**: temporary
  `tailscale serve --bg --https=9443` added then removed (status restored
  `:443`→43128, `:8443`→17235); Vite Host + loopback-only
  `__authenticated-read` block direct serve; production reaches Board via
  Caddy Host rewrite — confirm stream quiet-minute bytes after deploy.
