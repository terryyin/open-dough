---
id: SEED-372
status: active
planted: 2026-11-15
planted_during: Terry asked to show the dashboard connection status when returning to an inactive browser window
trigger_when: selected from the product backlog
scope: story
---

# SEED-372 — Dashboard connection status on return

<a id="see-dashboard-connection-status-on-return"></a>

### See dashboard connection status when returning to the window

**Identity:** SEED-372#see-dashboard-connection-status-on-return
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/639-confirm-dashboard-updates-on-return/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"684d2e286b46e1c80cc4df22b6b871d03bfb7ca7a74be23de8a62b70a4a11d8e","plan":"4e3e39e1be2f93ae94a11202c81bcddbb0919e55acd39dac379ca573f6cf61f8"}}
```

#### Goal

A developer returning to the dashboard can tell at a glance whether it is
receiving live updates again, from evidence received since that return rather
than a success remembered from before it.

#### Scope

- Show the requested small yellow/green connection dot. Returning focus to an
  already visible browser window, or revealing a hidden dashboard page, starts
  an unconfirmed period: yellow until a new live-update message or successful
  fallback check response is received. A previously received answer cannot
  confirm this return.
- Keep an open stream when focus returns to a visible window. Wait for its next
  message without a prompt request, a forced reconnect, or a separate probe.
- When no stream is held, reuse the existing stream eligibility and recovery
  path. Establishment alone does not confirm delivery; its first new
  message does. Preserve hidden-page suspension, stream-slot limits, recovery
  pacing, rate-limit waits, and the last displayed snapshot.
- Confirmation is about receiving updates after return. It does not establish
  that GitHub, published content, session state, or every dashboard section is
  current. Existing freshness and failure information retains its meaning.
- Apply the same confirmation rule when the existing slot budget selects HTTP
  checks. A successful response received after return confirms delivery. Keep
  that schedule, including its prompt check after document reveal; window
  focus alone adds no request. Slot availability does not create a different
  user-facing health policy.
- A known delivery loss clears confirmation and uses existing recovery. Reuse
  the current silence deadline rather than adding another health timer.

Deferred promises: new heartbeats, server-side freshness/retry work, a maximum
time to green, manual reconnect controls, additional connection colors, and
per-section connection indicators. These are delivery limits, not restrictions
on naturally supported behavior. The explicit prohibition on a prompt request
for an already-open stream preserves the requested passive confirmation and
avoids unnecessary observation traffic.

#### Key examples

- A visible window has received a message, then loses focus → the developer
  returns focus → the dot is yellow; the earlier message cannot make it green.
- The same stream is still open → no new message has arrived after return →
  the dot stays yellow, the same stream is retained, and no request is sent to
  prompt an update. Its first new message turns the dot green even
  when the published revision is unchanged.
- The page was hidden and released its stream, or the stream has failed → the
  developer returns → the existing eligibility/recovery path resumes delivery;
  the dot stays yellow through opening and turns green on the first new
  message, with the last snapshot still available.
- An opening succeeds but no new message arrives, or another return
  occurs before confirmation → the dot stays yellow until a new message
  arrives after the latest return. Opening or replaying an old success is not
  confirmation.
- A page has no stream slot and uses HTTP checks → the developer returns →
  yellow until the next successful response arrives; it turns green without
  adding a request to the existing focus/reveal schedule.

#### Interaction and architecture

The small dot conveys unconfirmed versus confirmed-since-return. Give those
meanings accessible text as well as color, without requiring an action or
moving keyboard focus. Exact placement and component choice belong to
implementation; no layout change is selected here.

Keep the confirmation boundary independent of transport ownership and snapshot
freshness. Resetting confirmation on focus must not restart the stream effect
or alter revision-check scheduling. This is disposable browser observation
state, not a workflow fact or persisted project record. Follow Accepted
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them)
and [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
with the existing [Dashboard status delivery](../NORTH-STAR.md#dashboard-status-delivery)
direction. No ADR conflict was found. The broader
[GitHub retry story](SEED-336-live-dashboard-status.md#show-github-retry-on-the-dashboard)
is separate planned work; this story does not claim or depend on its proposed
backend status and heartbeat migration.

#### Exploration, challenge, and investigation

The selected user's dot and passive confirmation are existing direction, not
proposals introduced by this refinement. Compare mechanisms against the same
goal and that no-prompt constraint:

| Candidate | User consequence and system consequence | Assessment |
| --- | --- | --- |
| Reuse the existing read/failure status alone | No new display or state, but an earlier successful read cannot say whether delivery resumed after return. | Simpler existing mechanism; misses the requested signal. |
| Force a reconnect or send a request on every return | Produces an active confirmation opportunity but interrupts a healthy stream or adds traffic. | Incompatible with the supplied open-stream example; not selected. |
| Record confirmation since each return, independently of the existing delivery lifecycle | Shows yellow until new evidence arrives while retaining the held stream and its recovery owner; HTTP fallback confirms through its normal responses. | Selected preparation direction; follows the supplied examples and applies the same rule across delivery modes. |

Borrow the established real-time connection-health mechanism: lifecycle state,
incoming activity, a silence watchdog, and automatic recovery. Microsoft's
[SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration)
uses messages/keepalives with a server-activity timeout; its
[JavaScript connection events](https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client)
let the UI report reconnecting and reconnected. These are concrete precedents,
not a requirement to introduce SignalR. The
[EventSource standard](https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface)
exposes opening, messages, and errors separately, so an open event alone need
not supply the stronger confirmation this story requests.

Map its roles directly: existing revision messages/check responses are incoming
activity, the revision stream scheduler already owns the silence watchdog and
recovery, and the dot projects confirmation. Returning starts a new confirmation
period without restarting the transport. Existing periodic revision messages
serve the role that a heartbeat would otherwise fill; no new heartbeat or
framework is needed. The conventional mechanism does not by itself require
confirmation after every focus return: that stricter boundary comes from this
seed's existing examples. Its limit remains that a message establishes receipt,
not upstream freshness, and supplies no guaranteed time to green.

Strongest challenge: a green "connection" dot could be read as "all dashboard
data is current" even though it establishes only post-return delivery. Keep
that distinction in its accessible meaning and preserve independent snapshot
and failure cues; expanding this into end-to-end freshness would change the
story. No such expansion is selected.

Facts observed in this owned workspace on 2026-11-15 at
`21c2bad7f48c25ab1c900d7ad4a8fb884524ba15`:

- [Page visibility](../../dashboard/src/pageVisibility.ts) observes document
  visibility, not window focus. A disposable browser probe dispatched blur and
  focus while a real revision stream was held and observed zero additional
  stream opens or `since` requests while advancing page time by one second.
  This establishes the current transport behavior, not a new indicator.
- The real-browser
  [visibility journey](../../e2e/observation/revision-stream-visibility.spec.ts)
  passed: hiding closed the held request and stopped sole-subscriber listings;
  revealing reopened and received another answer.
- The failed-opens case in the
  [lost-stream journey](../../e2e/observation/revision-stream-lost.spec.ts)
  passed: the 45-second silence deadline retained the snapshot, paced reopens,
  and recovered on an answer. Reuse this owner rather than adding a reconnect
  timer for the dot.
- Both [HTTP visibility journeys](../../e2e/observation/auto-refresh-visibility.spec.ts)
  passed: hidden pages stopped checks; reveal checked once promptly and then
  resumed its pace, including reveal while a content read was outstanding.
- [Stream-slot selection](../../dashboard/src/revisionStreamSlot.ts) uses HTTP
  checks when a capped route has no slot. Use its normal responses as the
  confirmation evidence rather than exposing the implementation choice as a
  separate product policy.

Observation commands (one worker, macOS awake on AC with `caffeinate -s -i`):

```sh
OPEN_DOUGH_E2E_PROOF_RECORD=/tmp/seed372-baseline-proof.json caffeinate -s -i npm run test:e2e -- e2e/observation/revision-stream-return.spec.ts e2e/observation/revision-stream-visibility.spec.ts e2e/observation/revision-stream-lost.spec.ts --grep 'preparation:|hiding closes|failed stream opens' --workers=1
OPEN_DOUGH_E2E_PROOF_RECORD=/tmp/seed372-fallback-proof.json caffeinate -s -i npm run test:e2e -- e2e/observation/auto-refresh-visibility.spec.ts --workers=1
```

The first run selected three cases and the second selected two; both strict
verdicts passed. `revision-stream-return.spec.ts` was disposable preparation
instrumentation and was removed before this seed write. No implementation or
new indicator proof is claimed. MakeMe and page-object selection were resolved
as enabled for that probe. Terry's follow-up asked for the conventional solution
to this common need. The concrete connection-health precedent above replaces
the earlier abstract acknowledgment analogy and unnecessary fallback blocker;
the same receipt rule covers the existing fallback within the stated goal.
No human-owned decision remains for preparation.

#### Starting point

The [revision stream scheduler](../../dashboard/src/revisionStreamSchedule.ts)
already handles stream silence and reopening. Check how that behavior applies
when focus returns and reuse the existing recovery path where it fits.
