# Show GitHub retry on the dashboard

**Identity:** SEED-336#show-github-retry-on-the-dashboard
**Source:** [Story](../../seeds/SEED-336-live-dashboard-status.md#show-github-retry-on-the-dashboard)

## Goal and scope

A developer keeps reading the last published snapshot during GitHub backoff
and sees the backend's wait, next planned attempt when known, actual retry in
progress, and recovery. A streaming page keeps its connection through the
wait and retry; transport health remains distinguishable from upstream health.
HTTP fallback and a first visit without a snapshot report the same backend
status. The backend retries for active observation without a browser request
at expiry. The source's five examples define the complete promised journey.

Exclude sibling review/session/CI/host event migrations, additional status
connections, manual retry overrides, and a general migration of ordinary
transient content recovery. Preserve source selection, the existing stream
budget, authentication/admission, snapshot interpretation, and useful content
catch-up. This plan authorizes no implementation by itself.

## Architecture and PFE

Follow Accepted [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them),
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
and [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The existing [Dashboard status delivery](../../NORTH-STAR.md#dashboard-status-delivery)
topic governs this work; no new topic or ADR exception is needed. Status is
machine-local observation evidence, never story state. SSE and HTTP carry
the same domain meanings, including planned time versus attempt versus success.

PFE at `22bb416f10d6d8c723a12f8d93f51d008b1d3c3c`:

| Responsibility | Existing owner and disposition |
| --- | --- |
| Machine-wide GitHub admission/wait | Change the shared request owner only as needed to expose authoritative current wait without an upstream read: `src/skills/dough-execute-plan/scripts/github-request-admission.mjs`, `github-requests.mjs`, and owner wire/client handling. Reuse its validated directed/fallback times, extension, persistence, first-read admission and scope. Do not add a dashboard cooldown authority or read its private persisted file directly. |
| Active published-source observation | Extend `dashboard/server/revisionStreamObservation.ts` and `sourceRevisionStream.ts`, reusing `revisionChecks.ts`/`sharedObservation.ts` for listings. One source/scope observation owns demand, timer, wait/retry/recovery and cancellation. A status read joins that observation; it does not drive a due retry. |
| Transport and HTTP/1.1 slots | Reuse `revisionStreamEvents.ts`, `requestedRevisionStream.ts`, and `revisionStreamSlot.ts`. Keep one dashboard stream per eligible visible page and the current cap; broaden status eligibility beyond a completed snapshot. Reuse existing local origin/source admission for HTTP status. |
| Browser status/content | Change `revisionStreamSchedule.ts`, `revisionCheckRead.ts`, `readingLimit.ts`, `limitRecovery.ts`, and `publishedObservation.ts` so status updates do not tear down transport. Reuse the published snapshot readers for catch-up on backend recovery; GETs fetching content are not retry scheduling. Keep ordinary transient error policy distinct. |
| Feedback | Extend `PublishedReadStatus.tsx`/`ReadingLimitNotice.tsx` and the existing failure/announcement surface. Retain snapshot revision/time and selection. Report connection loss separately; a heartbeat proves only transport liveness. |

The owner greeting already advertises optional operations under protocol 2.
Keep a passive status operation additive and capability-gated: generalize
`github-request-owner-link.mjs`'s current workflow-rerun-only operation gate.
A responsive older owner must receive no unsupported status frame and must
not be replaced to acquire the capability. Continue normal published reads
through it, retaining validated waits learned from held/refused read answers;
missing passive status is unknown, never recovery. The dashboard still owns
its next observation attempt and the existing owner still admits GitHub reads.
Do not carry status across a change of host/login scope.

Expected oversized edit: `sourceRevisionStream.ts` is **255 lines**. Slice 1
separates subscriber/HTTP stream delivery from shared source observation and
its scheduling, keeping its public entry point and `RevisionStreamObservation`
callers stable. Preserve listing sharing, per-subscriber watched answers,
setup-departure cancellation, and last-subscriber cleanup through the existing
backend stream specs. Do not split at arbitrary line counts.

Near the limit: `revisionStreamSchedule.ts` 245, `publishedObservation.ts` 249,
backend stream spec 247, shared `github-requests.mjs` 228 and owner 245.
Slices 2–3 keep status projection separate from connection lifecycle and
snapshot orchestration; grow focused specs in new files using existing support.
If owner handling exceeds 250, separate passive status handling from request
execution along their existing protocol boundary, preserving clients. Recheck
every proposed edit under the installed refactor skill's file-size rule.

## Decisive premises and preparation observations

Observed 2026-11-13 in this owned checkout at `22bb416f10d6d8c723a12f8d93f51d008b1d3c3c`.
Initial test setup could not create a bundle below absent local `node_modules`;
`npm ci` exited 0, and the same focused routes then passed. No product change
was needed for that setup defect. The browser run used AC power and the
maintained macOS guard. No scratch observation edit remains.

| Premise and consuming operation | Result-bearing observation | Unverified remainder and owner |
| --- | --- | --- |
| Real backend stream route can observe sharing, cleanup and a GitHub wait (slice 1). | Command A below exited 0: two selected cases reached real HTTP and fake `gh`, shared listings across streams, stopped pace after last close, and delivered a 120-second limited event. | New due-time scheduler and progress states require slice 2 proof. No claim that these baseline tests already prove them. |
| The current browser journey retains the snapshot through a wait and recovers (slice 2). | Command B exited 0: A and its retrieval time remained, no premature GitHub read, browser reopen at T and eventual B. | Replace its old close/reopen expectations with direct same-connection and backend-originated-attempt assertions. |
| Removing one catch close would keep the connection (slice 2). | **False.** Command B still exited 0 with only the catch-handler `stopHolding()` removed in a scratch edit. `noteLimit` also changes the effect dependency; cleanup closes it. The edit was reverted. | Slice 2 separates status subscription from lifecycle eligibility. Existing test is not accepted as discrimination for keeping a stream. |
| Status before a snapshot and backend-owned HTTP fallback exist today (slice 3). | **False by contract trace:** `requestedRevisionStream.ts` requires `at`; `revisionStreamSchedule.ts` requires a settled shown revision; `limitRecovery.ts` invokes browser `readAfresh` after its limit expires. The successful B journey exercises that existing timer-driven path. | Slice 3 adds status/demand independent of snapshot and proves it through the real boundary. No retained test is claimed for the new route. |
| Optional owner capability absence can preserve normal reads (slice 2). | Command C exited 0 (2 passed): the legacy owner answered the read without receiving an unsupported action frame; startup refused a responsive incompatible owner without replacement or a GitHub call. | Slice 2 extends the same fixture to the new status operation and keeps workflow-rerun gating distinct. |

```sh
# A: real backend boundary; controlled observation pace
npm run test:dashboard:backend -- dashboard/backend-tests/observation/authenticated-read-revision-stream.spec.ts --grep 'two streams of one source|rate-limited listing'
# B: real browser/server/request owner; controlled page and owner clocks
caffeinate -s -i npm run test:e2e -- e2e/observation/revision-stream-lost.spec.ts --grep 'a rate-limited stream answer'
# C: legacy capability and owner replacement policy
node --test --test-name-pattern='a legacy read-only owner|startup refuses' src/skills/dough-execute-plan/scripts/ci-github-workflow-repeat-transport.test.mjs src/skills/dough-execute-plan/scripts/github-request-owner-startup.test.mjs
```

The passive owner status operation and backend retry/heartbeat are new work,
not premises that they already exist. Existing controlled clock and HTTP
fixtures are available through the successful routes above. Extend their
observation clocks rather than substituting a mocked scheduler. No paid,
credentialed or developer-operated probe is required for this story's proof.

## Outside-in proof and consumer trace

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| Example 1: same connection, retained A/time, wait → real attempt → success, no browser request at T | 2 | New real-boundary streaming journey plus controlled backend test: pause browser clock/request activity, advance backend/owner clock to T, block and then release fake GitHub so retrying is observable; upstream request starts once, same connection survives until recovery, notice clears only on success. Include unchanged-revision success. |
| Example 2: shared retry, extension, fallback wait without usable GitHub time | 2 | Two stream subscribers plus request-owner admission tests: hold until T, extend beyond old T, observe updated backend status on both; no upstream start during either wait, one source/scope listing on resume. Use existing owner fallback policy rather than browser-invented time. |
| Owner compatibility and scope correctness | 2 | Legacy owner still serves ordinary reads, receives zero unsupported status frames and is not replaced; capable owner status costs zero GitHub calls; previous clients still read the extended greeting; workflow rerun keeps its own capability; owner loss/login change produces unknown or current-scope status. |
| Example 3: healthy long wait versus lost/silent stream | 2 | Advance controlled clocks beyond the ordinary silence bound while transport remains healthy; no false loss. Then suppress transport liveness/close it: show connection loss with A and the last upstream status retained, reconnect and receive current status. A heartbeat must not clear GitHub failure or update snapshot retrieval time. |
| Example 4: HTTP fallback interest, autonomous attempt and catch-up | 3 | Real browser slot-budget journey plus backend HTTP test: slotless page registers bounded observation demand, stops GETs while that demand is active, backend/owner advances to T and attempts once; next GET reports current status. Slot handover keeps one demand/attempt owner. |
| Example 5: initial wait, catch-up, visibility and source departure | 3 | Real initial-page journey: no snapshot/valid `at` precondition for status; waiting then retrying shown before content, success triggers normal read. Hide/leave/reveal and switch source: last demand cancels observation, other page continues, no stale answer changes new source. |

Consumer starting points: browser `revision-stream*.spec.ts`,
`auto-refresh-rate-limit`, `auto-refresh-visibility`, `limited-reading-*`,
`limit-recovery-*`; backend `authenticated-read-revision-stream*.spec.ts`,
`authenticated-read-backoff.spec.ts`, request-owner wire/admission/client tests
under `src/skills/dough-execute-plan/scripts/`, and shared GitHub requests used
by dashboard reads and CI observers. Inspect setup/assertions and trace changed
protocols into those observers before selecting their focused regression proof.

For each slice run the installed `dough-execute-plan/scripts/consumer-trace.mjs`
with `--checkout <execution checkout> --base HEAD`, supplying the changed effect
as `--term`: `revisionStreamUrl`, `Automatic checks resume then.`,
`limitedUntil`, `retryAfterSeconds`, and any added owner operation. Expand
listed support/page-object exports to their journeys. Disposition each consumer
as run, reused with matching evidence, or excluded because the effect does not
reach its boundary. Do not infer unaffected consumers from filenames alone.

## Ordered slices

### 1. Separate shared source observation from stream delivery
Type: Structure
Status: planned
Proof: Existing backend stream, setup-departure, browser stream and slot/visibility
journeys retain their external behavior. Run the observation folder suites
when they fit focused feedback; include reached owner consumers if changed.

Separate the 255-line `sourceRevisionStream.ts` along the cohesive seam above,
enabling immediately following slice 2. Keep API, subscriber-specific answers,
single shared listing, cancellation and tracked-controller cleanup unchanged.
Do not build general event subscriptions for later status migrations.

Before altering retry behavior, capture the comparable two-page wait/recovery
baseline below using the existing fake-GitHub/HTTP journey and controlled clocks.
Keep observation instrumentation in test support, not a new benchmark system.

### 2. Keep a streaming page informed while the backend waits and retries
Type: Behavior
Status: planned
Proof: Examples 1–3 through the real browser/server/owner boundary; focused
owner admission/status tests and the complete affected observation consumers.

Behavior: Given snapshot A on visible streaming pages, GitHub backoff preserves
A and the connection, reports the backend's wait and actual retry at T without
a browser request, shares the attempt, handles an extended limit, and clears
the notice only after successful observation. Connection loss is independently
reported and recovery catches up.

Expose the minimal passive owner wait status needed by the observer, without
running GitHub or creating a second admission policy, with the legacy-owner
compatibility path above. Implement the common
source/scope observation lifecycle once: demand → observing/waiting → retrying
→ observed or new wait/failure, with timer/in-flight cancellation on last demand
and boundary shutdown. An asynchronous failure must be observed by this owner.
Send transport liveness independently of GitHub progress. Separate browser status
projection from stream effect dependencies, preserve content catch-up, and align
the maintained `dashboard/PUBLISHED-OBSERVATION.md` contract and status wording.

Interim boundary: existing HTTP fallback keeps its previous behavior until
slice 3 joins it to the same lifecycle. Slice 2 must not remove fallback or
require a new owner protocol operation from unrelated existing clients.

### 3. Report backend retry before a snapshot and without a stream slot
Type: Behavior
Status: planned
Proof: Examples 4–5 through real HTTP and browser routes; full affected
observation journeys, existing slot budget and withheld-content recovery cases.

Behavior: Given a slotless visible page or a first visit during backoff, current
backend status appears without a completed snapshot. Active demand causes the
backend to retry at T even if no browser GET arrives then; later HTTP/stream
observation catches up. Visibility, departure, reconnect and slot changes
preserve the shared lifecycle and stop demand when no page remains interested.

Use the same domain status and source/scope observer as slice 2. Establish
bounded HTTP observation interest with explicit release and eventual cleanup
for a vanished page; test active interest across T independently of polling.
Status reads bypass browser upstream-withholding only for this local operation;
they never bypass request-owner admission for GitHub. Backend recovery permits
the existing initial/withheld content readers to catch up, without a competing
page-clock retry. Preserve ordinary transient failures and source-switch
cancellation. Finish the contract documentation and comparative evidence.

## Verification and comparison basis

Apply [AGENTS.md test automation](../../../AGENTS.md#test-automation): before
test changes resolve installed dough-makeme and, for browser tests/support,
dough-page-objects against `.planning/open-dough.json`. Use existing builders,
controlled owner/page/backend clocks and observable events; no wall-clock
sleeps, `test.slow()` or suite/hook timeout overrides. New tests must discriminate
the promised behavior: disabling autonomous scheduling, transport liveness or
status eligibility must fail their corresponding journey.

Local gates: run the focused affected owner tests and observation suites above,
dashboard typecheck/build for changed TS/wire contracts, and staged lint. Broader
checks are added only for reached consumers, such as shared owner clients.
Use [the maintained macOS sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos)
for long runs: awake on AC, `caffeinate -s -i`; on battery, lid open and
`caffeinate -i`, inspecting sleep logs afterwards. Inspect host load/memory and
competing runs before expensive proof; respect full-suite admission. No full
repository suite is required merely for this preparation's Markdown changes.

Prospective comparison under ADR 0010: use the same two visible pages, source,
fake GitHub limit/recovery, controlled 120-second wait and unchanged snapshot
for before/after. Record browser/local requests, upstream attempts, response
bytes, backend observation work and observed-change-to-stable-display time.
Worth keeping: actual automatic backend retry with no expiry-time browser
trigger, no premature upstream read or duplicated per-page attempt, no extra
SSE connection, and no false connection-loss alarm during a healthy wait.
Retained snapshot and shared steady-state GitHub pace must not regress. Explain
added status/heartbeat bytes and their bounded cost against the user-visible
gain; make no general traffic or latency improvement claim from this fixture.

Follow [the project's failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written for every local/CI failure: base attribution is no exemption, and
rerunning until green is no repair. An exact active repair owner is a
coordination boundary whose files must be preserved. Published revision failures
remain the executor's responsibility through applicable final CI.

## Current decisions and readiness review

- Same retry authority and status meanings across delivery modes; browser content
  interpretation stays in the existing snapshot reader. Request-owner wait,
  dashboard demand, transport health and published snapshot freshness are distinct.
- No human checkpoint/trunk-only action or new product decision is needed.
  No implementation or Take is authorized by this preparation.
- Slice-plan refinement was not needed: one preserved-behavior reorganization
  immediately enables the common streaming lifecycle; the following slice joins
  bootstrap/fallback consumers to it. Each has one proof loop and a safe boundary.
- No remaining slice-specific concern was identified within the inspected
  boundaries. New behavior has explicit proof owners; preparation observations
  are limited to the baseline and the false one-close premise above.

## Learnings

The browser's limit state currently couples presentation, content recovery and
transport cleanup. Separating only the immediate close cannot preserve a stream;
both its effect eligibility and source of progress must change together.
