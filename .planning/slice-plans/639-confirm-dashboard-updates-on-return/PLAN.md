# Confirm dashboard updates after returning

**Identity:** SEED-372#see-dashboard-connection-status-on-return
**Source:** [See dashboard connection status when returning to the window](../../seeds/SEED-372-dashboard-connection-status-on-return.md#see-dashboard-connection-status-on-return)

**Source review:** [Source commitments](source-review.md)

## Goal and scope

A returning developer sees the door logo border in yellow while awaiting confirmation, green when dashboard
update delivery has been confirmed since the latest return, and red after known
delivery loss. A received stream
message or successful HTTP fallback check supplies confirmation. Window focus
and document reveal reset it; earlier successes and opening alone cannot.
Preserve an already-held stream, passive waiting, hidden-page suspension,
stream-slot limits, recovery pacing, rate limits, and the displayed snapshot.
Known delivery loss clears confirmation and turns the border red through existing health signals.

No added focus-triggered request, forced healthy reconnect, heartbeat protocol,
new health timeout, upstream retry redesign, manual reconnect control, per-section health system. Green means post-return delivery, not that
all displayed data is current. Existing freshness/error cues retain their own
meaning. This plan authorizes no implementation by itself.

## Architecture and reuse

Follow Accepted [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them),
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
and [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The existing [Dashboard status delivery](../../NORTH-STAR.md#dashboard-status-delivery)
topic already separates transport health from upstream progress. No new topic,
protocol, persistent state, or ADR exception is needed.

Borrow the concrete connection-health mechanism described in the seed's
SignalR precedents: incoming activity, silence watchdog, recovery, and a UI
projection. This dashboard already owns the first three. The stricter
post-return confirmation boundary comes from the story, not from SignalR.

PFE at `21c2bad7f48c25ab1c900d7ad4a8fb884524ba15`:

| Responsibility | Existing owner and disposition |
| --- | --- |
| Stream lifecycle, received messages, silence and recovery | Extend `dashboard/src/revisionStreamSchedule.ts` to report receipt and genuine transport loss without moving its ownership or changing its timers. Opening and deliberate cleanup for a read are not loss. A source error delivered over the stream still leaves its independent upstream notice intact. |
| HTTP fallback delivery | Extend `revisionCheckSchedule.ts` through the same confirmation boundary; ordinary successful answers confirm. Preserve its existing reveal, cancellation, pace and rate-limit rules. |
| Page suspension | Reuse `pageVisibility.ts` for hidden/revealed state. Window focus is a separate return signal; do not feed a new focus generation into delivery-effect dependencies and thereby reopen a healthy stream. |
| Selected-source observation | Keep one ephemeral confirmation state with the active source and return generation alongside `publishedObservation.ts`. Ignore callbacks from a departed source/connection. Do not copy snapshot retrieval time into confirmation. |
| Display and accessible meaning | Color the existing `ProductMark.tsx` door outline through `SessionsButton` in the dashboard chrome. Supply accessible awaiting/confirmed/disconnected wording, keep focus and geometry stable, and preserve existing announcements and problems. |
| Terminal connection feedback | `useTerminalRecovery.ts` owns a different connection and user-operated reconnect. Reuse no terminal status as dashboard health. |

Expected TS/UI files are currently below 250 lines: `revisionStreamSchedule.ts`
245, `publishedObservation.ts` 249, `ConfiguredDashboard.tsx` 249,
`PublishedReadStatus.tsx` 95, `revisionCheckSchedule.ts` 141, `styles.css` 186;
`dashboard/PUBLISHED-OBSERVATION.md` is 238. Slice 1 keeps confirmation and its
return listeners in a focused owner; if observation/chrome integration grows
past the limit, separate delivery binding or the existing header presentation
along that cohesive seam, preserving callers. No arbitrary line cutting or
preparatory framework. Keep new journeys in focused files rather than growing
existing large specs. Recheck actual edits under the refactor skill's size rule.

## Decisive premises and retained preparation observations

Observed 2026-11-15 in this owned checkout at
`21c2bad7f48c25ab1c900d7ad4a8fb884524ba15`. `npm ci --ignore-scripts` supplied
the absent local dependencies. Commands A and B used one worker on this Mac,
awake on AC under `caffeinate -s -i`; observed load was 9.65/8.10/7.16 with
55% memory free and other agent processes. Focused runs were chosen rather
than a full suite. Both strict verdicts passed. No scratch edit remains.

| Premise and consuming operation | Observation in the form/profile used | Result and remainder |
| --- | --- | --- |
| A focus return can retain the real stream without prompting an update (slice 1). | Command A's disposable `preparation:` browser probe opened the real preview, held the origin's next listing, dispatched window blur/focus, and advanced page time one second. | Zero extra stream opens or `since` requests. The probe was removed before record writes; the new indicator still needs slice 1 proof. |
| Hide/reveal reaches the actual release and reopen owners (slice 1). | Command A's maintained `revision-stream-visibility.spec.ts` case observed request failure on hide, sole-subscriber listing cessation, then reopened delivery and an answer on reveal. | Passed; no assumption that visible loss of focus is document hiding. |
| Existing recovery can retain content and recover without a new timer (slice 1). | Command A's maintained failed-opens case in `revision-stream-lost.spec.ts` observed 45-second silence, paced reopens, snapshot retention and eventual catch-up. | Passed. New logo border transitions remain owned by the new journey, not this baseline. |
| HTTP fallback has a working prompt reveal and subsequent pace (slice 2). | Command B ran both `auto-refresh-visibility.spec.ts` browser journeys against the real preview/server/fake GitHub boundary, including an outstanding content read across hide/reveal. | Two passed: no hidden checks, one prompt reveal check, pace resumed, stale wait ignored and later revision displayed. Focus-only confirmation must add no request. |
| Status changes have existing enclosing observers (both slices). | Inspected `dashboardParts.ts` (`notice` selects all explicit polite live regions) and `dashboardPage.ts` (`expectSnapshotButtons` checks whole-page button counts; snapshot helpers assert retained revision/time and membership). | Add no interactive logo border control. Preserve announcement meaning and inspect aggregate consumers when adding status text. These reads locate obligations, not evidence that a new rendering already passes them. |

The seed retains literal baseline commands A and B. A's disposable probe was
removed; execution supplies maintained new behavior proof. No paid,
credentialed, native or infrastructure probe is required.

## Outside-in proof ownership

| Story promise | Owner and observable proof |
| --- | --- |
| Yellow after focus return, no reuse of earlier success; first new message turns green even for unchanged revision | Slice 1: hold the next real stream answer after an earlier one, return focus, observe accessible yellow state, then release the answer and observe green. Capture requests independently; no extra open, check or content read caused by focus. |
| Preserve a healthy held stream and wait passively | Slice 1: record stream identity/open count before return; retain it through confirmation. Do not supply confirmation through a fixture or directly invoke the new state owner. |
| Resume a missing stream, wait through establishment, recover while retaining snapshot | Slice 1: hide/reveal and failed-open recovery cases with opening held separately from first data; yellow until data, snapshot revision/time and focus retained. Reuse existing controlled page clock and stream boundary. |
| Latest return wins; stale source/connection cannot confirm current delivery | Slice 1: return twice around a held answer, then switch sources while an earlier answer is outstanding; only receipt on the active observation after its latest return can confirm. Deliberate read/cleanup does not manufacture a failure. |
| Known delivery loss clears confirmation; upstream freshness stays separate | Slice 1: confirm, stop delivery, advance the existing silence bound or deliver transport failure, observe red and existing recovery; a received upstream problem must retain its own notice and snapshot evidence. |
| HTTP fallback follows the same receipt rule without extra traffic | Slice 2: occupy stream slots using the established fixture, return focus after an earlier successful check, observe yellow until the next normal successful response, then green. Hide/reveal retains exactly its existing prompt check and pacing; failed/cancelled responses do not confirm. |
| Small accessible signal, no focus movement or disruptive layout/announcement change | Slice 1 and retained by slice 2: observe text alternative and visible color, keyboard focus, existing read/failure announcements, snapshot retrieval time and whole-page button counts at the real page boundary. |

Disable each new transition in a scratch change during execution to show its
new journey fails, then restore and pass. Existing baseline tests alone are
not discrimination for the new logo border.

## Ordered slices

### 1. Confirm a streaming dashboard after returning
Type: Behavior
Status: done
Proof: Stream promises in the table through new
`e2e/observation/revision-stream-return.spec.ts`, plus existing stream
visibility/lost/stopped journeys and reached rendering consumers.

Behavior: Given a streaming dashboard with a previous answer, returning focus
or revealing the page shows yellow; the first message received after that
return shows green. A held healthy stream remains held without a prompt
request. A missing stream uses existing eligibility/recovery; opening alone
stays yellow. Repeat returns, source departure and transport loss keep the
signal truthful while existing content and feedback stay readable.

Introduce the single source-scoped confirmation owner and bind actual receipt
and transport-loss events to it. Color the existing door outline with accessible meaning and
preserve the current read/failure feedback. Keep cleanup and callback freshness
with their lifecycle owners. Judge receipt against the current return boundary,
not the generation when the stream opened or check began: a held operation's
answer received after return can confirm it. Apply any necessary cohesive observation/chrome
extraction within this slice. Update the maintained observation contract.

Interim boundary: HTTP-check pages keep their current feedback and no new logo border
until immediately following slice 2 joins them to the same confirmation owner.
Do not introduce a second state model or change fallback scheduling meanwhile.
One stream-confirmation proof loop; target 15 active minutes, commands excluded.

Accepted slice-1 evidence (11 active minutes):
- `OPEN_DOUGH_E2E_PROOF_RECORD=/tmp/seed372-stream-accepted-proof.json caffeinate -s -i npm run test:e2e -- e2e/observation/revision-stream-return.spec.ts --workers=1`: six strict passes. Real held answers/headers, source switch, error/silence, focus/reveal, snapshot, geometry, focus and aggregate announcement assertions inspected.
- `OPEN_DOUGH_E2E_PROOF_RECORD=/tmp/seed372-stream-final-proof.json caffeinate -s -i npm run test:e2e -- e2e/observation/revision-stream-return.spec.ts e2e/observation/revision-stream-visibility.spec.ts e2e/observation/revision-stream-lost.spec.ts e2e/observation/revision-stream-stopped.spec.ts e2e/navigation/dashboard-header.spec.ts e2e/navigation/dashboard-header-compact.spec.ts e2e/sessions/sessions-sidebar.spec.ts --workers=1`: 12 strict passes; nonexistent E2E header paths selected nothing, covered below instead.
- `OPEN_DOUGH_E2E_PROOF_RECORD=/tmp/seed372-header-proof.json caffeinate -s -i npm run test:dashboard:integrated -- dashboard/tests/navigation/dashboard-header.spec.ts dashboard/tests/navigation/dashboard-header-compact.spec.ts dashboard/tests/navigation/frame-board-look.spec.ts --workers=1`: exit 0; inspected actual header/frame assertions. That E2E environment variable produced no integrated JSON.
- `npm run typecheck:dashboard && npm run build:dashboard`: pass. New-test-only later synchronization edits preserve maintained consumer proof.
- `/tmp/seed372-mutation-{focus,receipt,loss}-v2-proof.json`: each selected one test and failed at its intended accessible transition; restored six-case command above passed. Earlier zero-selection mutations and stale proof-file runs are not evidence.
- Independent refactor complete: extracted `e2e/observation/connectionMark.ts`; six strict passes with `OPEN_DOUGH_E2E_PROOF_RECORD=/tmp/seed372-stream-refactor-proof.json caffeinate -s -i npm run test:e2e -- e2e/observation/revision-stream-return.spec.ts --workers=1`. Consumers `/tmp/seed372-stream-consumers.md` and `/tmp/seed372-refactor-consumers.md` dispositioned. Screenshots `/tmp/seed372-logo-{yellow,green,red}.png` inspected: silhouette colors, stable mark.
- Source freshness unchanged at trunk `de9dff847bb65d54a8eff6b51d6e3386f30d4302`; intervening work is other stories' preparation/Take, no dashboard or named GitHub-retry sibling change.

### 2. Confirm updates through the existing HTTP fallback
Type: Behavior
Status: planned
Proof: HTTP promise in the table through new
`e2e/observation/revision-check-return.spec.ts`; retain both maintained
`auto-refresh-visibility.spec.ts` cases and reached slot-handover consumers.

Behavior: Given a page using checks because stream slots are occupied, return
shows yellow until a successful response arrives after return, then green.
Focus adds no request; reveal keeps its existing one prompt check. Switching
between stream and fallback retains the same source/return confirmation rule,
without a false confirmation from a cancelled or departed operation.

Bind the existing successful check response to the same receipt operation used
by the stream; preserve source identity, cancellation and the current pace.
Enable the logo border for fallback pages, remove slice 1's interim boundary and finish
the maintained observation contract. One fallback-confirmation proof loop;
target 15 active minutes, commands excluded.

## Verification, comparison and consumer trace

Before test changes apply [AGENTS.md test automation](../../../AGENTS.md#test-automation)
and the installed MakeMe/page-object selector. Selection was resolved enabled
for `e2e/observation/revision-stream-return.spec.ts`; resolve the second new
path before authoring. Reuse the canonical published-work builders, focused
dashboard objects, real preview/server and fake external GitHub. Keep independent
stream/request evidence outside page objects. No `test.slow()` or suite/file/hook
timeout override; retain the default individual timeout.

Local gates: each slice's focused browser proof and reached consumers;
`npm run typecheck:dashboard`, `npm run build:dashboard`, and staged lint for
changed TS/UI/contracts. If the complete reached observation suite fits focused
feedback, run it instead of hand-picking its consumers. Include additional
rendering/announcement journeys found outside it. Before expensive runs inspect
current machine load, memory and competing work; begin with one worker and
reconsider concurrency from current evidence. Long runs use the maintained
[macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
awake on AC, `caffeinate -s -i`; on battery, lid open and `caffeinate -i`, then
inspect the sleep log. No full repository run is needed for preparation Markdown.

Follow the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written, including every local/CI failure, and carry that link into every
delegation or repair handoff. Execution retains applicable final-CI ownership.

For each slice run the installed `dough-execute-plan/scripts/consumer-trace.mjs`
with `--checkout <execution checkout> --base HEAD`, adding effect terms such as
`usePageVisibility`, `revisionAnswers`, `PublishedReadStatus`, `aria-live`, and
the new receipt/return operation. Expand helper exports into their callers and
give every consumer a run, matching-evidence reuse, or justified exclusion.
Inspect actual setup and enclosing text/count assertions; passing helper tests
cannot establish receipt-to-render behavior.

Prospective comparison under ADR 0010: same source, unchanged revision, held
stream/check response and return event before/after. Worth keeping: yellow is
observable until new receipt, green afterwards, and zero additional requests
or healthy reconnects caused by focus. Preserve snapshot retrieval time,
selection and recovery cadence. Measure request/open counts and observe stable
focus/geometry in the new journey; make no broader traffic or latency claim.

## Current decisions and concern review

- Use one confirmation model across existing delivery modes; add no transport
  or health authority. Existing source/return boundaries decide callback validity.
- No human checkpoint, trunk-only product operation or blocking dependency is
  required. The separate GitHub-retry story is not a prerequisite.
- Slice-plan refinement was not needed: two delivery-mode increments share one
  state rule, each has a usable boundary and one outside-in proof loop, and
  the explicit interim fallback boundary is removed by slice 2. Two slices are
  within the eight-slice limit; both target 15 active minutes.
- No remaining slice-specific concern was identified in the inspected boundary.
  Baseline observations establish existing lifecycle/proof routes; new behavior
  has explicit proof owners and is not represented as already verified.

## Learnings

Window focus and document visibility are distinct. Reusing visibility to reset
confirmation could restart the transport effect and violate the healthy-stream
example. The conventional liveness mechanism already exists; the missing work
is its user-facing confirmation boundary and projection.

## Execution context

- Mode: story-branch; identity SEED-372#see-dashboard-connection-status-on-return;
  publisher dashboard-territory.local-open-dough; agent Ai-chan.
- Owned checkout: `/Users/terryyin/git/open-dough/.worktrees/see-dashboard-connection-status-when-returning-t`;
  branch `codex/see-dashboard-connection-status-when-returning-t`; remote `origin`; trunk `main`.
- Starting revision `2470e5ef6c784b273b3587fc640923d14809fe2b`; accepted claim
  and candidate `c124365d015aec64b5186160980db9205b11955a`. No second start.
- Setup: locked `npm ci --ignore-scripts` and `npm run typecheck:dashboard` passed
  in this checkout at the current lockfile. Hook is check-only staged lint and
  dashboard typecheck; selective formatter is `npm run format` (changed and new files only).
- Replanning: preserve existing planning authority; two planned slices, each
  bounded to 15 active minutes. No scope expansion authorized.
- Human amendment: Terry replaced the dot with the door logo border and selected
  yellow for awaiting connection, green for confirmed delivery, red for known
  disconnection. This changes presentation and adds a projection of existing loss
  signals; return confirmation and passive delivery rules remain.
- CI: GitHub Actions `ci.yml` (verified active, name CI); observes origin's story
  branch. Coordinator `ai-chan-seed372`, directory `/tmp/dough-ci-501/watch-TtK0jr`,
  PID 78623, session 29886, yielded cell `g388:7`, launched from this checkout.
  Claim publication on trunk has pendingCi unobserved by this story-branch observer.

Proof decision: this Mac on AC, load 6.14/5.97/5.78 and 56% free memory;
other agent and shell work exists, exact workloads unknown. Slice owners run
focused E2E observation at one worker under `caffeinate -s -i`, then reached
consumers. Reconsider on changed load, failures, or expanded shared-support scope.


## Story obligations

### G1. HTTP fallback indication awaits slice 2
Reported: slice 1 — "HTTP fallback retains existing feedback and has no new border status until slice 2."
Story clause: "Apply the same confirmation rule when the existing slot budget selects HTTP checks."
Disposition: receiving slice 2
Commitment: 27
