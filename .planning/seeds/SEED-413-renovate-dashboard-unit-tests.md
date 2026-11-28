---
id: SEED-413
status: active
planted: 2026-11-19
planted_during: Terry aligned unit-test entry guidance around strongly typed backend handlers and narrow UI components, set the Architectural North Star to minimize test support, and started the dashboard unit-test renovation campaign
trigger_when: selected from the product backlog after the updated test-boundary release is installed
scope: three stories (one vertical pilot and two renovation epics decomposed by feature folder)
---

# SEED-413 — Renovate dashboard unit tests around directly testable production seams

## Why this matters

`dashboard/backend-tests/` (555 `.spec.ts` files), `dashboard/frontend-tests/`
(302 `.spec.ts` files), and `dashboard/test-support/` (~790 files alongside
~1,145 production files in `dashboard/src/` and `dashboard/server/`) grew
around two expensive entry habits:

- Backend unit specs start or mount HTTP servers (`startDashboardServer`,
  `adHocReview.ts`, `launchStore.ts`) because `dashboard/server/` mixes
  `node:http` (`URL`, `IncomingMessage`, `ServerResponse`) into domain
  admission and selection.
- Frontend unit specs mount `<App />` (`frontendApp.ts`, `mountedDashboard.ts`),
  triggering 8+ background endpoints and requiring whole-app route mini-servers
  (`frontendServiceSubstitutes.ts`, `frontend*Rule.ts`) and Node arrangement
  commands (`SEED-404`'s baseline at
  `986aad0f1:.planning/seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md`
  measured ~29 minutes locally at two workers, against Doughnut's 2,573
  narrow-component cases in 65 seconds).

The released and installed
[test boundary rule](../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary),
[architectural thinking guidance](../../.agents/skills/dough-slice-planning/references/architectural-thinking.md),
and [Architectural North Star](../NORTH-STAR.md) establish the target
direction:

- **Test support holds only data builders (MakeMe) and page objects** (plus rare
  minimal seam code strictly forced by a framework limitation); no new wrappers
  may be added to test support, and every change outside data builders and page
  objects only removes from it.
- **Plain Vitest runs unit tests; `@playwright/test` stays in `e2e/` only:**
  `dashboard/frontend-tests/` runs on plain Vitest + embedded headless Chromium
  (retiring `frontend.playwright.config.ts` and dual-runner glue in `scripts/test-frontend.mjs`), and
  `dashboard/backend-tests/` runs on plain Vitest in Node (retiring
  `backend.playwright.config.ts`).

## Alternatives and decision

Migrating 247 built-app frontend files to whole-`<App />` `mountAnsweredDashboard`
first (`SEED-404`) or piling layered settle helpers onto full-board mounts
(`DD-587`, `a3a734696`) adds test-support machinery and touches the suite
twice. Renovating all 857 unit-test files in one uninterrupted block would
stall product work.

Instead:

1. Run **one small vertical pilot family first** (`Story Notes`, folding in
   `SEED-407`'s ~100 ms/case target at `47cf696e5` without `DD-587`'s settle
   complexity) to prove the shared typed contract pattern between
   `dashboard/src/` and `dashboard/server/`, delete that family's `test-support`
   wrappers, and align `dashboard/backend-tests/README.md`,
   `dashboard/frontend-tests/README.md`, and `.planning/open-dough.json` so all
   subsequent stories follow the new architecture immediately.
2. Decompose **Backend Renovation** and **Frontend Renovation** by feature
   folder when reached, leading each family with its shared typed contract and
   backend handler seam so neither side invents throwaway adapters.

Assume the Open Dough release containing the updated test-boundary and
direct-mapping guidance is already published and installed in this repository;
do not spend story scope re-editing `Distribution/src/`. Judge speed, clarity,
and deleted `test-support` surface together under
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Story decomposition

<a id="done-capture-import-list-analysis"></a>

The Done capture import-list stories come from Terry’s 2026-11-20 reviews of
the Done capture family’s import lists. Terry accepted the first analysis and
its order; the addendum’s two stories were added at Terry’s request. The first,
SEED-413#split-done-mark-decision-from-store, is done, as is the second,
branch entry (SEED-413#split-branch-entry-proposal-from-store; recoverable at
`9969388`); the others are
[delivery observation](https://github.com/terryyin/open-dough/blob/24864be6360f87cc9fec3dc4333de5361de165eb/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records),
landing reports (completed; recoverable at `086faa5a:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records`) and
launch flavors as MakeMe steps (completed; recoverable at `47af39ca6:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#fold-done-capture-launches-into-makeme`).

- **Analysis (shared by the five stories, at `25f76e98d`).**
  - *Symptom.* 21 specs under `dashboard/backend-tests/review/` import from
    `support/doneCaptureCase.ts`. Most import the same verbs: `minutesAgo`
    (19 specs, 140 calls), `aCheckout` (19, 32), `work` (19, 67), `review`
    (18, 59), `keep` (16, 23), `markDone` (15, 53), `inWorktree` (8, 24),
    and `source` in 9. Many also import production store modules
    (`deleteRecord`, `changeSessionRecord`, `installRecordRemovalDispatch`,
    `keptRecords`) and Playwright-side helpers from
    `test-support/support/adHocReview.ts` (`sessionBranchPins`,
    `retireAdHocBranch`). `ad-hoc-session-branch-entry.spec.ts` still needs
    four spec-local helpers on top. Nearly every spec repeats the same
    script: checkout → launch record → `keep` in a stubbed HOME → dated
    `work` → `markDone` → `review`.
  - *Test design.* (1) The support module is loose procedures, not a model
    of the case: `checkout` and `record` are threaded separately through
    every call. (2) Data building is split across three layers:
    `anEstablishedSession`, `aDefaultLaunch`, `anIsolatedLaunch`,
    `aDeclaringLaunch` and `historyBeforeTheCase` are preset MakeMe chains
    living outside MakeMe. (3) Production actions run as setup: `markDone`
    and `identifyBranch` run the real capture even where the review is the
    topic. (4) The timeline is hidden: launch at 60 and Done at 10 are
    support defaults, while specs add their own `minutesAgo` literals around
    them.
  - *Production testability (the root cause).* (1) Writes go through an
    ambient store under `$HOME`, keyed by a source string:
    `setRecordDoneAt(sourceId, session, …)`, `recordSessionBranchEntry`,
    `changeSessionRecord` and `deleteRecord`. Hence `keep()` stubs HOME,
    and `review()` reads `keptRecords(source)` back, even though the review
    read already takes typed `KeptSessionState`
    (`server/storyReviewSessionAdmission.ts`). The read seam is typed; the
    write seams are not. (2) `setRecordDoneAt` (`server/recordDoneAt.ts`)
    does three jobs in one function: the record's state change (expected
    and automatic Done, disposition time), the Git capture of the branch
    result (`withBranchResultAtDone`), and persistence plus ref pinning
    (`keptWithDoneCapture`). Its `readAncestry` option exists only so
    `aHeldDone` can pause the Git read. (3) `recordSessionBranchEntry`
    (`server/sessionBranchEntry.ts`) has the same shape and asks for a whole
    `PublishedSource`, hence the `identifyBranch` wrapper. (4) The pin-ref
    layout lives in `server/launchRecordPins.ts`
    (`refs/open-dough/session-branch/${host}/${sessionId}/`), and
    `sessionBranchPins` copies it with the host hard-coded to `claude`.
    (5) `installRecordRemovalDispatch()` is a process-wide registration that
    retention and deletion specs must install. (6) Commit attribution
    (`madeSince`: reflog time at or after `launchedAt`) and run grouping in
    `server/sessionCommitsCapture.ts` are pure logic over log entries, but
    are reachable only through real repositories. As a result, all 21 specs
    are Git, file-store and ref integration tests. That is the cost behind
    the family's timeout margin.
  - *Decisions.* Split each write action into a typed decision and an
    effect-only shell, so only the adapter persists and pins. Review-topic
    cases compose Done and branch-entry state with MakeMe and call the typed
    review directly. A few cases keep each action as their topic. Order:
    this story (Done), then branch entry and the pin-ref query, then the
    launch flavors as MakeMe steps.
- **Addendum: delivery observation and publication (at `4fd00aed1`).**
  Terry's 2026-11-20 review of the closed
  SEED-413#arrange-done-ad-hoc-observation-and-publication found the same
  problem one layer further on. That story shortened the family's support
  overall, but added six backend-specific modules: `doneCaptureReview.ts`
  (26 specs), `adHocBranchRefs.ts` (12), `doneBranchObservation.ts` (4),
  `declaredPublisherBranch.ts` (3), `installedPublisher.ts` (3) and
  `reportedIsolatedBranch.ts` (1). Its specs import 5–9 support names from
  3–5 support modules beside the production store modules. Much of that
  support translates between typed cases and the machine stores, so the
  specs end up proving their own arrangement.
  - *Shared with these stories.* Every observation and publication case
    still runs `keep` and `markDone` in a stubbed HOME, and `review` reads
    `keptRecords(source)` back. `twoDoneBranchesMergedByHand`,
    `aDeclaredPublisherBranch` and `aReportedIsolatedBranch` are more preset
    MakeMe chains outside MakeMe. `landingPins` copies the
    `refs/open-dough/one-shot` layout as `sessionBranchPins` copies the
    session-branch one. The scopes below now name these.
  - *New write seams.* Two more production entries take a source string
    and read and write the ambient stores themselves.
    `captureObservedLandings` (`server/observedSessionLandings.ts`) reads
    `keptRecords`, decides each delivery and saves with
    `changeSessionRecord`. `handleLanding`
    (`server/launchLandingReporting.ts`) reads and replaces both the attempt
    store and the record store, and `branchLandingContext` writes reporting
    files under `machineDashboardPath`. That is why
    `aReportedIsolatedBranch` calls `replaceAttempts` and
    `writeLandingContext`, and why the lifecycle spec ages records through
    `changeLaunchStore(home, …)`.
  - *Test code that re-implements production.* `installedPublisher.ts`
    stubs global `fetch` with its own receiver. That receiver repeats the
    landing route table, method, origin and body admission that
    `submitLanding` owns. The publication cases therefore depend on a test
    copy of the wire admission.
  - *Decisions.* Apply the same split to the two new seams in
    [delivery observation](https://github.com/terryyin/open-dough/blob/24864be6360f87cc9fec3dc4333de5361de165eb/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records) and
    landing reports (completed; recoverable at `086faa5a:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records`),
    after branch entry and before the launch flavors fold into MakeMe, so
    the fold covers the final builders.

<a id="lock-launch-store-writes-beside-server"></a>

### Change launch records beside a running server under its lock

**Identity:** SEED-413#lock-launch-store-writes-beside-server
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Goal.** Dashboard maintainers get browser and backend specs that stop
  losing a record change they make while the dashboard server runs.
- **Scope.** A page's reconciliation rewrites `agent-launches.json` under the
  machine-document lock about a second after a start settles. A test that
  rewrites that store in place without the lock can lose its change. Audit
  test-side launch-store writes made after a page start beside a running
  server (`keepLaunchStore`, `changeLaunchStore`, `forgetLaunchSession`,
  `keepMoreLaunchRecords`, `keepLaunchRecords`), and route them through the
  lock. For example, make the unlocked read-modify-write helpers take the
  lock, as `changeKeptSessionsBesideServer` and
  `keepMoreLaunchRecordsBesideServer` already do. Writes made before the
  server or page starts stay as they are.
- **Evidence.** CI run `46011428917` failed
  `e2e/sessions/cursor-session-recovery.spec.ts:166` this way. The forced
  experiment lost `doneAt` in 2 of 3 runs with the unlocked write and in 0
  of 5 with the locked write. Representatives to audit first:
  `e2e/sessions/recently-done-sessions-sidebar-reopen.spec.ts`,
  `e2e/sessions/agent-launch-retained-history.spec.ts`,
  `e2e/launches/agent-launch-story-card-open-session.spec.ts`,
  `dashboard/test-support/runningCursorSessionsPage.ts`, and
  `dashboard/backend-tests/launches/agent-launch-own-record-continuation-race.spec.ts`.

<a id="renovate-remaining-backend-families-after-browser-reporter"></a>

### Prove machine-session reads through typed backend answers

**Identity:** SEED-413#renovate-remaining-backend-families-after-browser-reporter
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/829-prove-machine-session-reads-through-typed-answers/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7946d5994d6f587cccc4994a439c3398155d1d8916d73d940d19be878bb27c02","plan":"81751012ddce35cfc985dee33074b83603aec6e3764a9a13d52a025ebbe4e1a3"}}
```

- **Goal.** Developers changing the dashboard's machine-session read get fast,
  typed Node Vitest feedback on what an overview or history reader receives.
- **Scope.** The six legacy session-read specs listed in the plan. Exercise
  host reading and record composition, the overview/history split, revision
  reuse and fresh demand, and request admission and encoding. Keep native host
  translation proof with that boundary. Start no server for the Node cases.
  Session mutations, alerts, and other backend families have their own owners.
- **Key examples.** With open records, retained Done records and settled
  attempts, the overview gives the reader the compact listing and the history
  restores the detail under its own revision. A reader holding the current
  revision gets an unchanged answer. A fresh ask can see a changed Codex
  observation while an ordinary ask still reuses a held observation. A full
  answer accepted as gzip decodes to the plain response.

<a id="published-refresh-lifecycle-via-vitest"></a>

### Prove published refresh lifecycle in Node Vitest

**Identity:** SEED-413#published-refresh-lifecycle-via-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/861-prove-published-refresh-lifecycle-on-vitest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1a09e5561b94413ebd42d842f6c35967fc4c60665a5db3978d348d0d353b6b6c","plan":"8570850f22cef831feeb0b5383aed707b60646bb1bb84c30ef02e13876b7e869"}}
```

- **Goal.** Give Dashboard maintainers fast Node Vitest feedback that published
  revision checks, shared listings, SSE revision streams, cross-revision reuse,
  and machine-retained answers preserve their confirmation, failure, cleanup,
  and byte-budget guarantees.
- **Scope.** Account for all fifteen named observation specs (60 legacy
  Chromium cases) in plan 861. Preserve machine-retained answer persistence,
  permissions, failure/miss handling, and LRU byte-budget eviction; pinned
  backlog reads and conditional revision checks with ETag, fallback, rate-limit
  wait validation, and refusal; cross-revision comparison reuse, bounds,
  merge/rename accuracy, concurrency, failure isolation, and history reuse;
  shared listing reuse windows, scope isolation, timeout/failure clearing, and
  abort on close; and SSE revision-stream delivery, shared pacing, subscriber
  and setup departure, boundary close, and preview gzip flushing. Drive the
  typed production seams directly in Node Vitest, keeping a small Node HTTP
  witness only where wire headers, SSE framing, gzip flushing, or request and
  subprocess departure supply the proof. Keep browser rendering, recovery cues,
  and real-origin Board journeys with their existing E2E owners. Measure the
  same maintained one-worker selection before and after, account for every
  migrated, consolidated, or retained case, and delete test-support wrappers
  whose last caller leaves. Plans 856 and 853 own the verified Git cold open
  and in-place Refresh; plan 823 owns moving automatic observation and pinned
  reads to local Git; plan 860 owns published read admission, and plans 862
  and 890 own authenticated GitHub request ownership.
- **Key examples.** After one process answers a project at revision A, a later
  process on the same machine home answers pinned reads from the retained store
  (asking only for the recorded branch head beside membership), while another
  home, a torn or foreign entry, a previously failed, missing, or rate-limited
  read, or a read pinned at an unheard revision still asks upstream; writes
  over the byte budget evict least-recently-used entries while keeping recently
  used ones. A revision check returns unchanged on matching head or 304 and
  changed with an updated ETag when main moves; one source's ETag is never sent
  for another; a non-rate-limit listing failure falls back to the ref alone
  without branch heads for that check only; rate limits validate and bound
  `Retry-After` or `X-RateLimit-Reset` (defaulting to 60 s); malformed, mixed,
  unknown-source, or cross-origin checks are refused before any upstream call.
  When a configured ref moves from A to B within 10 commits and under 300
  files, untouched records, listings, and history facts at B reuse A's answers
  after one shared comparison and per-commit read, while touched, merged,
  renamed, removed, behind/diverged, over-bound, or failed-comparison reads
  fetch at B, and a rate-limited comparison fails the record without blocking
  the backlog. Settled listings serve later checks for the same source and
  scope within the reuse window (with each caller's own `since` and watched
  branches), survive a departing requester, and are cleared by fallback,
  timeout, rate limit, scope change, or boundary close. Two SSE revision
  streams for one source at different revisions and watched branches share one
  listing per pace tick and stop polling when the last stream closes; a page
  departing or boundary closing during held scope setup asks upstream nothing
  and leaves no timer; preview gzip delivers the first event without buffering.
- **Replacement trace.** [Published Dashboard reads and evidence before the split](https://github.com/terryyin/open-dough/blob/fb8983cb8eb62b38c79fbc293b491128f411bdb2/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest).

**Plan.** [Prove published refresh lifecycle in Node Vitest](../slice-plans/861-prove-published-refresh-lifecycle-on-vitest/PLAN.md)

<a id="github-request-lifetime-and-evidence-via-vitest"></a>

### Prove GitHub request lifetime and failure evidence in Node Vitest

**Identity:** SEED-413#github-request-lifetime-and-evidence-via-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/890-prove-github-request-lifetime-and-evidence-on-vitest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8b1d24f833ad201939a2294dc686fcfd8474020c6d43cc8ae7e80e2cef251afc","plan":"38a3d3235a6382d8d9f697ac6830ec54de0fc6b8e71e5b13ada5109e437a3a5a"}}
```

- **Goal.** Give Dashboard and CI maintainers fast Node Vitest feedback that
  authenticated GitHub reads end their owned work when the last owner
  leaves, share one owner across Dashboards and CI, and leave bounded,
  safe evidence of failures.
- **Scope.** Account for the 13 legacy observation paths in plan 890: the
  late-join and close cases left in `authenticated-read-shared-failures.spec.ts`
  and `authenticated-read-turns.spec.ts`, and the waiter, subprocess, hook,
  shared owner, diagnostics, and incident record paths. Preserve actual
  child-process cleanup, Dashboard and CI owner wiring, local diagnostics,
  and incident evidence across shutdown and restart. Keep real owner
  processes, subprocesses, Git, HTTP, and durable files where their behavior
  supplies the observation. Measure the same maintained one-worker workload
  for those paths before and after. Failure classification, held and resumed
  reads, request sharing, and turn timing were delivered by
  [authenticated GitHub observation](https://github.com/terryyin/open-dough/blob/71cc76188db2356fd0f4cd2f064cfd27be95c037/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#authenticated-github-observation-via-vitest).
  Board cold open and refresh routing, session and Review reads, browser
  recovery, login isolation, and runner cutover have separate owners.
- **Key examples.** Two Dashboards and CI share the owner's eight available
  turns. A departing pinned-read waiter leaves a peer's read running. The
  last departure ends that child, while a check's tracked listing can
  outlive the requesting connection. A late waiter keeps its own bound.
  A failed shared invocation leaves one safe diagnostic per observing
  Dashboard. An oversized answer leaves an incident record with its source
  and cause and no secret. After a restart, the same machine retains
  bounded evidence with the original attribution and distinguishes a clean
  close from a lost process.
- **Replacement trace.** Split at a delivered slice boundary from
  SEED-413#authenticated-github-observation-via-vitest (its slices 4–8 of
  [plan 862](https://github.com/terryyin/open-dough/blob/fa4d5c57608966483d829faae8feba252e6c22c8/.planning/slice-plans/862-prove-authenticated-github-observation-on-vitest/PLAN.md)).

**Plan.** [Prove GitHub request lifetime and failure evidence in Node Vitest](../slice-plans/890-prove-github-request-lifetime-and-evidence-on-vitest/PLAN.md)

<a id="landing-capture-evidence-via-vitest"></a>

### Prove retained landing capture in Node Vitest

**Identity:** SEED-413#landing-capture-evidence-via-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/864-prove-landing-capture-evidence-on-vitest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"68efd1ac921b19403fe57ce1331a841c5a814680985deb78e274745e113a1f09","plan":"7dee15cf53398731c8c933ace984e3ce3ee42dd67e2d1a9430db02defe6877f6"}}
```

- **Goal.** Give Dashboard developers fast, discriminating feedback that the
  comparison used for a launch comes from the work origin accepted for that
  launch. Dispose of all 12 legacy backend specs in this family so the runner
  cutover can remove the legacy execution path.
- **Scope.** Cover landing-context handoff, preparation and capture, one-shot
  and Story Branch publication, native binding, recovery, and pin lifetime.
  Keep real Git and persisted launch records wherever they supply the
  observation. Use Node Vitest for Dashboard unit cases and keep installed
  command, receiver, Git transport, and native interaction in maintained
  workflow checks where their interaction supplies the proof. Account for
  every prior case by its observed outcome. Published Review reads, UI
  selection, completion reporting, and runner cutover have separate owners.
  This work preserves the existing publication, capture, and retention rules.
- **Key examples.**
  - An installed publisher prepares the workspace candidate before push. When
    the authorized trunk accepts it, the launch keeps that base and revision
    pinned after retirement. A Story Branch merge compares the fetched trunk
    tip with the accepted merge, and a fast-forward uses the accepted story
    tip. Acceptance and capture are independent of completion and Done.
  - A wrong launch, story, workspace candidate, remote, or target cannot claim
    that comparison. A prepared candidate that trunk has yet to accept cannot
    become a landing. A later trunk publication leaves the first accepted pair
    intact.
  - A lost record or receipt can be retried with the original input after
    retirement. A pending receipt binds to the same launch when native
    identity arrives. The retained launch can capture its prepared pair after
    normal attempt expiry. Premature store loss, record expiry, and deletion
    retain their refusal semantics. Failed pin cleanup keeps the deletion
    intent so retry removes only that launch’s pins.
  - A conflicted or rejected Story Branch integration can resume with its
    resolved pair. After a retained unfinished landing, the claim, local
    branch, and native session still support the next slice. Manual Done
    acknowledges the session and preserves the execution record.
- **Replacement trace.** [Published Dashboard reads and evidence before the split](https://github.com/terryyin/open-dough/blob/fb8983cb8eb62b38c79fbc293b491128f411bdb2/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest).

**Plan.** [Prove retained landing capture in Node Vitest](../slice-plans/864-prove-landing-capture-evidence-on-vitest/PLAN.md)

<a id="published-intent-evidence-via-vitest"></a>

### Prove published Intent evidence in Node Vitest

**Identity:** SEED-413#published-intent-evidence-via-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/865-prove-published-intent-evidence-on-vitest/PLAN.md"}
```

- **For / why.** Give developers reading Intent fast proof that evidence comes from the selected project and revision and that unavailable evidence has an explicit outcome.
- **Evaluation.** When a revision publishes Intent configuration and test sources, the selected scope returns its own candidates and readable locations. Missing locations and unavailable CI status keep their distinct outcomes.
- **Boundary.** Reconcile the source move in SEED-434 and CI Git input move in SEED-435. After plan 607 lands, account for any product-unit cases the repeat correction leaves on Playwright. Plan 607 keeps its repeat behavior, obligations and load proof.
- **Effort hypothesis.** S to M, low confidence. Recount surviving proof and size the observed cases during refinement.
- **Safe stopping point.** Every case for this outcome has a maintained owner or a recorded replacement.
- **Replacement trace.** [Published Dashboard reads and evidence before the split](https://github.com/terryyin/open-dough/blob/fb8983cb8eb62b38c79fbc293b491128f411bdb2/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest).

**Plan.** [Prove published Intent evidence in Node Vitest](../slice-plans/865-prove-published-intent-evidence-on-vitest/PLAN.md)

<a id="prove-launch-attempts-with-typed-state"></a>

### Prove Dashboard launch attempts with typed machine state

**Identity:** SEED-413#prove-launch-attempts-with-typed-state
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers changing launch recovery or drain need Node Vitest
  cases that show which machine state drives each decision. `LaunchAttemptOwner`,
  the attempt store, and project configuration currently pull state from the
  environment. Launch-owner cases repeat a stubbed `HOME`, mounted project
  configuration, and owner teardown to exercise those decisions.
- **Evaluation.** Launch-owner decision cases compose typed attempts and
  project state directly, without a stubbed `HOME` or mounted configuration.
  A retry after interruption uses the retained attempt identity and request.
  An update drain refuses new starts and continuations and waits until the
  accepted attempt's outcome is durably recorded. The held-gate cases in
  `agent-launch-duplicate.spec.ts` and `agent-launch-codex-duplicate.spec.ts`
  pass under the load other local suites create. On 2026-11-27, at a load
  average of about 17, three of them missed their 3 s wait for the native
  launch, while each spec passed alone, both before and after the
  published Follow up story's continuation change.
- **Cause (plan 853 diagnosis, 2026-11-27).** Each of these cases runs the
  real start pipeline (`execution-start.mjs draft` and `start`: two Node
  processes and about 50 Git processes per launch, including three
  `git fetch origin` calls and two throwaway worktree add/remove pairs)
  inside the 5 s default test timeout; at load 15 one launch took 2.2–3.1 s,
  and 19 of 22 local failures were that timeout rather than the 3 s poll.
  The same signature also failed `agent-launch-{,codex-}model-boundary`,
  `agent-launch-follow-up-file-admission`,
  `agent-launch-incomplete-reporting-settlement`,
  `agent-launch-codex-lifetime`, `admitted-session-start`,
  `ad-hoc-existing-changes-start`, `execution-checkout-start-stops`,
  `isolated-start-{after,before}-establishment` and
  `agent-launch-preparation-continuation-refusal`, equally on base and
  branch. Repair options found: give cases whose subject is not the start
  a held or instant start stand-in at the server's `execution-start.mjs`
  call and wait for its arrival; make the start cheaper (fewer fetches and
  throwaway worktrees) for cases that test the start itself.
- **Boundary.** Extend the typed decision and persistence split used for
  session and landing state to launch attempts. Keep focused production
  adapter proof for persistence and configuration, and preserve the real
  process, Git, and native checks that observe those boundaries. Keep the
  existing launch assertions and avoid new test-support wrappers. Runner
  removal belongs to [runner cutover](#retire-legacy-dashboard-backend-runner).
- **Baseline.** [Worker recovery and drain](https://github.com/terryyin/open-dough/blob/23e911e465339f1b371fd9e36cc99a583c580ac1/.planning/slice-plans/857-prove-launch-worker-recovery-on-vitest/PLAN.md#execution-complete)
  landed at `62522f4f`. Its focused selection ran 23 Node cases in 8.71 s.
  Use the same selection to compare runtime and check for lost observations.

<a id="admit-launch-requests-as-typed-values"></a>

### Admit Dashboard launch requests as typed values

**Identity:** SEED-413#admit-launch-requests-as-typed-values
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers proving launch admission in Node Vitest reach
  `answer()` in `dashboard/server/launchBoundaryAnswer.ts` by hand-building
  a `Socket`, `IncomingMessage` and `ServerResponse`, because admission in
  `agentLaunchAdmission.ts` (`launchRequest`) reads the request stream.
  About ten backend files repeat that construction, for example
  `launches/agent-launch-refusal.spec.ts`,
  `launches/agent-launch-model-admission.spec.ts`,
  `server/landingRequestAdmission.spec.ts` and
  `sessions/agent-launch-session-refusal.spec.ts`.
- **Evaluation.** Admission and the accept branch take a typed launch
  request, and a thin wire adapter keeps origin checking and JSON parsing.
  The listed specs call the typed entry for their decisions and keep one
  wire case where status, headers or origin are the observation, without
  new test-support wrappers.
- **Provenance.** Named by the post-change refactor pass of
  [session retention, one-shot starts and input](https://github.com/terryyin/open-dough/blob/162a60bd6b5378db843deadc972fbac8728c6352/.planning/slice-plans/874-prove-session-retention-and-input-on-vitest/PLAN.md#3-refuse-a-session-policy-that-cannot-be-established).

<a id="retire-legacy-dashboard-backend-runner"></a>

### Run the entire Dashboard backend unit suite on Node Vitest

**Identity:** SEED-413#retire-legacy-dashboard-backend-runner
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#retire-legacy-dashboard-backend-runner","dependencies":[{"supplier":{"identity":"SEED-413#finish-backend-vitest-renovation-after-launch-attachments","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-attachments"},"implementation":"Land the typed Story Notes and note-follow-up checks with native confirmation preserved in E2E.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No Story Notes or note-bearing follow-up unit case depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"dec37b6b829b7b5d20a57df4a3775e9c6a015faa","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-attachments","summary":"The exact five-spec backend selection passed all 41 cases in Node Vitest, covering 29 pilot cases, 11 previously mounted launch cases, and one valid Attach contrast. The twelfth original launch case passed in Chromium E2E in e2e/stories/recently-done-cursor-follow-up-notes.spec.ts with the same kept input confirmed and its admitted note version sent. The Dashboard sent-state journey passed separately. The archived plan records the selectors and timing checks. No Story Notes or note-bearing follow-up unit case depends on the legacy backend runner.\nCondition satisfied: No Story Notes or note-bearing follow-up unit case depends on the legacy backend runner.\nAccepted integration: 720879458315e6b86aa70f5d9a609274de119f31 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-launch-starts-and-recovery-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-starts-and-recovery-on-vitest"},"implementation":"Integrate the proof disposition for the eight launch admission and settlement paths in slices 1–4.","rationale":"Runner cutover removes the legacy execution path. Its eight proof paths must have maintained owners before that removal. A separate supplier owns legacy recovery, worker, change and drain proofs.","condition":"No launch admission or settlement case in the original story's delivered slices 1–4 depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"420905723de59e71180451879726f684dcc7915e","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-starts-and-recovery-on-vitest","summary":"The retained launch admission and settlement plan accounts for all eight legacy spec paths. The replaced fixture-only spec was removed with its fixture. The seven surviving paths and maintained cross-server, admission-close and worker controls passed in the one-worker Node Vitest selection, with zero Chromium selections. The integrated 61-case check also passed both worktree-retry cases and Dashboard typecheck. The plan preserves the receiving real process, Git and native E2E observations. The six worker recovery and drain paths remain assigned to the queued follow-up.\nCondition satisfied: No launch admission or settlement case in the original story's delivered slices 1–4 depends on the legacy backend runner.\nAccepted integration: 6eaca3b874431ad8c5e1dca386b6a4dc6b49e5ac on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-launch-worker-recovery-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-worker-recovery-on-vitest"},"implementation":"Integrate the proof disposition for the six worker recovery, continuation, change, reconciliation and drain legacy specs.","rationale":"Runner cutover removes the legacy execution path. The cases transferred from the original story still need their Node or retained E2E proof before the runner can be removed.","condition":"No legacy launch worker recovery, continuation, change, reconciliation or drain case in the six-spec follow-up still depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"23e911e465339f1b371fd9e36cc99a583c580ac1","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-worker-recovery-on-vitest","summary":"All six paths now run on Node Vitest in place: agent-launch-continuation-interrupted, agent-launch-uncertain-continuation, agent-launch-worker-handoff, agent-launch-change-wait, settled-attempt-reconciliation and dashboard-update-drain. Own-record settlement moved to the new Node spec agent-launch-confirmed-continuation. The final one-worker backend selection at 7af0fb4a6 ran 23 Node cases with no Chromium case, all passing first try. Native receipt, server death, the phone effort check and preview replacement stay in their E2E journeys, which passed 11, 1 and 10 cases. Plan 857 completed all seven slices; its Delivered notes record each slice's proof and mutation checks.\nCondition satisfied: No legacy launch worker recovery, continuation, change, reconciliation or drain case in the six-spec follow-up still depends on the legacy backend runner.\nAccepted integration: 62522f4fa327ea55218cd963a3bef90c9c50eb8a on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-native-session-and-terminal-lifecycle-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest"},"implementation":"Land the proof disposition for Mark as done, native stop and removal, record deletion and reopening.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No Done, stop, delete or reopen unit case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"499d3b82bfe3b987b927c3f77aaece6d0f68fd2d","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest","summary":"The integration candidate passed 56 Node Vitest cases across all 14 mapped specs, with zero backend Chromium selections and zero retries. Archived plan 867 accounts for all 58 legacy cases, including the shared origin duplicates. The retained E2E selection passed, including terminal reopen and record deletion. The accepted integration has the same runtime and proof source bytes as the tested candidate.\nCondition satisfied: No Done, stop, delete or reopen unit case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 03e815bda8318b75c4c627022a7ed3e114f50419 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-published-dashboard-reads-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest"},"implementation":"Land the maintained proof disposition for published Follow up evidence.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published Follow up evidence is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"satisfied","resolution":{"revision":"c57304660d75709c648e3129d8cf175f393b1a93","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest","summary":"All six published Follow up specs now run on Node Vitest in place, plus agent-launch-follow-up-forged-context and agent-launch-follow-up-line-resume split from them. The final one-worker selection of those eight specs ran 17 Node cases and no Playwright case in 23.1 s, against 18 Playwright cases in 68.0 s at the base. Each refusal was checked by disabling its production guard. The two Intent browser journeys in e2e/intent/intent-story-follow-up.spec.ts keep the actual selection and first-input receipt and passed. The merged state at the integration passed 61 Node cases across the follow-up and continuation specs. Plan 859 at the recoverable revision maps every legacy case.\nCondition satisfied: The proof disposition for published Follow up evidence is published, and its surviving product-unit cases no longer require the legacy backend runner.\nAccepted integration: cce90482c879d459a7dd3da56939c0e34e9cb8b8 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-dashboard-configuration-and-serving-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-dashboard-configuration-and-serving-on-vitest"},"implementation":"Land the settings and product runtime proof disposition.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No configuration or serving unit case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"13d7e049249851833514e2eb598eacb022d34fba","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-dashboard-configuration-and-serving-on-vitest","summary":"All 13 configuration specs and the nine product-facing runtime specs (boundary-server, dev-server-cache-ownership, production-deployment, production-qualification, production-update-selection, production-watcher-preview, production-watcher-refusals, serving-modes; production-watcher-setup-lifetime moved to e2e/runtime) import vitest and run on Node Vitest. Plan 868's integrated gate ran 68 Node cases and 0 Chromium cases, and branch CI passed on the merged state (run 45936529444).\nCondition satisfied: No configuration or serving unit case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 132c431b3b494ca3c3e86d1e0cc0ab51f0a7484c on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#finish-backend-vitest-renovation-after-launch-options","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-options"},"implementation":"Land the typed upload and claim cleanup checks, with accepted delivery kept in E2E.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No launch attachment unit case depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"ee8d963f593e06a2a2ca518b8c4072e888b8bae6","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-options","summary":"The integrated backend selector classifies both selected launch attachment specs as Node Vitest. Six focused Node cases passed, covering the former upload, cleanup, filename and selection observations. The retained Chromium refinement and recovery journeys passed and verify accepted bytes at the ordered native paths and the reused recovery path. The archived slice plan records the commands and proof.\nCondition satisfied: No launch attachment unit case depends on the legacy backend runner.\nAccepted integration: fec5480484657266e715615024f3d6b630ad4b35 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-324#close-landed-ci-repeat-check-gaps","href":"seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps"},"implementation":"Land the retained repeat and load proof disposition for the correction.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"All repeat correction proof and load obligations have maintained owners through cutover.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-installed-story-starts-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-installed-story-starts-on-vitest"},"implementation":"Land the proof disposition for installed execution and refinement starts.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No installed execution or refinement start case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"79475eaef07720be5bdd25722433060d62f8a19a","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-installed-story-starts-on-vitest","summary":"The integrated backend selector classifies all 18 selected specs as Node Vitest and selects zero of them for Playwright. The archived plan and proof record map the 15 legacy specs to 48 passing typed real-Git cases, with eight passing retained Chromium E2E cases for actual native dispatch, kept starts and restart. The runner cutover owns its existing harness and survivor recount.\nCondition satisfied: No installed execution or refinement start case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 5725b315656e159e4cfc59dc069b9edf76b3091d on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-session-workspace-starts-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-workspace-starts-on-vitest"},"implementation":"Land the proof disposition for workspace choice, admission and scheduled launch.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No workspace choice or scheduled launch case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"daea1238c354addf980ff601d7b794fe4523c927","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-workspace-starts-on-vitest","summary":"Plan 848 moved 18 of the 19 mapped workspace and scheduled launch specs. Plan 854 at cfd4dcfac7e06fa70e73be54cca2ad6626b1ab36 moved its remaining isolated Codex case to Node Vitest and removed the legacy spec. The same case observes the established worktree cwd, codex branch namespace and ordered native input. The mapped backend listing on integrated d4c2df6a0d40041869a89b395f8fd28316a46db1 found 46 Node cases and zero legacy cases. The separately owned scheduled admission case stays outside this supplier’s scope.\nCondition satisfied: No workspace choice or scheduled launch case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: d4c2df6a0d40041869a89b395f8fd28316a46db1 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-native-first-input-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-first-input-on-vitest"},"implementation":"Land the proof disposition for host choices and first native input.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No host-choice or first-input case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"eac4d5e9e4041f64f603a5afc08378552a9c433c","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-first-input-on-vitest","summary":"The integrated maintained backend selection passed 88 Node Vitest cases across 21 specs, with zero Playwright cases and zero retries. Plan 849 at the recoverable revision maps all 79 legacy observations and separates four unchanged creation controls from 84 migrated Node cases. The retained Chromium selection covers 24 cases, including the moved real worker shutdown and restart. No host-choice or first-input case in this supplier’s scope depends on the legacy backend runner.\nCondition satisfied: No host-choice or first-input case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: cbab58ebbe335734f8990002e6fb50fec0df4738 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-follow-up-context-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-follow-up-context-on-vitest"},"implementation":"Land the proof disposition for ordinary follow-up context and retry.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No ordinary follow-up context case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"76b599da18dca0da2499f87944e2c6020f4f0807","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-follow-up-context-on-vitest","summary":"The ordinary follow-up Playwright specs (boundary, story, identity, live, codex, cursor) and the membership spec are deleted. Their observations run as Node Vitest: session input, established input, story input, attempt identity, refusal, continuation, and the cross-server repeat. None of those cases select the legacy backend runner. The intent check caught a continuation that dropped the recorded source context.\nCondition satisfied: No ordinary follow-up context case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 2cd10b04b890e30d764289c4b21eefbf877cd8ca on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-kept-launch-records-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-kept-launch-records-on-vitest"},"implementation":"Land the proof disposition for retained launch record behavior.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No retained launch record case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"29e3287e862e5d5415d32653b3e71c91287b90a8","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-kept-launch-records-on-vitest","summary":"The plan's maintained backend selection over the seven retained launch record specs, with the new Vitest owners, selected 26 Node Vitest cases and zero Playwright cases. All passed on one worker in 6.5 s, against 18 legacy Chromium cases and 50.7 s at the base. start-store, launch-observations and agent-launch-host-identity were converted in place. launch-records-across-processes and launch-record-store replace the three records specs. The refused kept start joined agent-launch-boundary. Plan 851 at the recoverable revision maps every legacy case. agent-launch-records-shared-machine.spec.ts is deleted. Its remaining catalog fixture observations (one bare catalog origin, the same installed checkout for both servers, Claude cwd in that checkout) test test-support/support/catalogProjectOrigin.ts, not product records, and now fall under this consumer's harness and fixture boundary; recover them from 48e1d1f37.\nCondition satisfied: No retained launch record case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 1600a87c37e1073a306f8273709c21e06df10f97 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#published-read-admission-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#published-read-admission-via-vitest"},"implementation":"Land the maintained proof disposition for published read admission.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published read admission is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"satisfied","resolution":{"revision":"ebdf4ebac57a7d7cd41172def1b8089a2d4fd455","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#published-read-admission-via-vitest","summary":"Plan 860 accounts for all twelve legacy observation spec paths. Its maintained one-worker selection passed 103 published-read family cases and six existing cold Git cases in Node, with zero legacy Chromium cases and no retries. The combined branch selection also passed at c8dfc7ba4, and integration preserved the executable tree of the CI-passing closure tip. The Node HTTP witness retains wire admission, response, and CLI child departure, and the maintained Board, Review, follow-up, and roster E2E owners retain the visible journeys. The published proof meets this supplier condition for the backend runner cutover.\nCondition satisfied: The proof disposition for published read admission is published, and its surviving product-unit cases no longer require the legacy backend runner.\nAccepted integration: dc1c2cb1b12bce3e98bc0031ac201e790bc7c7f8 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#published-refresh-lifecycle-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#published-refresh-lifecycle-via-vitest"},"implementation":"Land the maintained proof disposition for published refresh lifecycle.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published refresh lifecycle is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#authenticated-github-observation-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#authenticated-github-observation-via-vitest"},"implementation":"Land the maintained proof disposition for authenticated GitHub observation's failure classification, held and resumed reads, and shared requests and turn timing.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for authenticated GitHub observation's failure classification, held and resumed reads, and shared requests and turn timing is published, and those surviving product-unit cases no longer require the legacy backend runner.","state":"satisfied","resolution":{"revision":"71cc76188db2356fd0f4cd2f064cfd27be95c037","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#authenticated-github-observation-via-vitest","summary":"Plan 862 retired ten legacy observation specs (transient-eligibility, directed-wait, output-bound, backoff, cooldown, cooldown-reach, wait-in-turn, resumption, shared, turns-timing) and the five sharing, refusal and admission cases of authenticated-read-shared-failures and authenticated-read-turns. Their observations run in 49 plain Node Vitest cases with zero Chromium cases: `(observation/authenticated-read-(failure-report|output-bound|admission|resumption|request-turns|shared-requests|server-timing)|configuration/project-add-while-held)\\.spec\\.ts$` passed 49/49 at b0db97567 and again on the merged state 6cd3227d5, with green branch CI. The developer chose to split the story after slice 3; request lifetime, the two-Dashboard and CI owner, diagnostics, incident evidence and stalls (13 paths, including the three remaining Chromium cases of shared-failures and turns) moved to SEED-413#github-request-lifetime-and-evidence-via-vitest, which this consumer now waits on separately. The removed obligation therefore follows that explicit split decision.\nCondition satisfied: The proof disposition for authenticated GitHub observation's failure classification, held and resumed reads, and shared requests and turn timing is published, and those surviving product-unit cases no longer require the legacy backend runner.\nAccepted integration: 509fe32fe4da7527d96da52e3227ab5562028445 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#published-review-comparisons-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#published-review-comparisons-via-vitest"},"implementation":"Land the maintained proof disposition for published Review comparisons.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published Review comparisons is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"satisfied","resolution":{"revision":"cc7802ace20bd4475751c5e75713d983290607e5","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#published-review-comparisons-via-vitest","summary":"Plan 863 replaced all 19 legacy published-Review specs (55 Chromium cases) with Node Vitest owners, landed on main at 99e94dcb8. At that revision the only dashboard/backend-tests/review specs not importing vitest are the 12 landing-capture specs owned by plan 864. The family selection passed 137 of 137 Node cases at one worker (plan 863 Proof and local gate).\nCondition satisfied: The proof disposition for published Review comparisons is published, and its surviving product-unit cases no longer require the legacy backend runner.\nAccepted integration: 99e94dcb8701836c7af234b766616340efcb109a on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#landing-capture-evidence-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#landing-capture-evidence-via-vitest"},"implementation":"Land the maintained proof disposition for retained landing capture.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for retained landing capture is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#published-intent-evidence-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#published-intent-evidence-via-vitest"},"implementation":"Land the maintained proof disposition for published Intent evidence.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published Intent evidence is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#machine-observation-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#machine-observation-via-vitest"},"implementation":"Land the maintained proof disposition for Dashboard machine observations.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for Dashboard machine observations is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"satisfied","resolution":{"revision":"acf16a47afc535fd6ddc787ee13c116b723a8e72","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#machine-observation-via-vitest","summary":"Plan 866 Final comparison records the maintained proof for every one of the seven legacy cases from git-files-identity.spec.ts and host-status.spec.ts. The replacements ran 16 Node Vitest cases and zero Chromium cases. The original host status spec was removed. The three replacement specs passed again with Vitest 5.1.2, and branch CI passed on both the combined branch and its closure. The accepted integration contains the completed proof and retained Sessions Sidebar E2E journey.\nCondition satisfied: The proof disposition for Dashboard machine observations is published, and its surviving product-unit cases no longer require the legacy backend runner.\nAccepted integration: 17471d5d744f23b6b036ea60d02f2a614a32c6ba on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-session-completion-reporting-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-completion-reporting-on-vitest"},"implementation":"Land the proof disposition for session completion reporting and final report admission.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No completion reporting unit case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"1308a09321731e3b91077cd93968609cecf3c803","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-completion-reporting-on-vitest","summary":"All 11 legacy completion specs left backend Playwright: nine run on Node Vitest in place (agent-completion-{attempt-loss,binding,early-recovery,identity,input,returned-closure}, admitted-session-{no-change,shared-checkout}-completion, final-report-admission), agent-completion-{quiet-closure,superseded} were deleted with their observations moved to the new Node specs agent-completion-{refusals,quiet-recovery,later-reports}. The final selection ran 28 Node cases and zero Playwright cases (plan 870 Final comparison at the before-cleanup revision); integrated at 1fdf5b1d3 with branch CI green on e2e23ba69.\nCondition satisfied: No completion reporting unit case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 1fdf5b1d3b76a27450e68290f7946bc9e0e42753 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-native-session-observation-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-observation-on-vitest"},"implementation":"Land the proof disposition for native session observation, alerts and the Sessions replay.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No session observation or alert unit case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"0e82130ff6693e0f9a7b936aa8871aacb6ebbfee","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-observation-on-vitest","summary":"The maintained selection on accepted integration e49a4aa8 covered the nine legacy session observation, alert and replay specs. It selected 19 Node Vitest cases and zero Playwright cases. All 18 active cases passed and the opt-in replay was skipped. Plan 869 maps the 19 active predecessor cases and opt-in measurement, with the redundant Cursor sharing case consolidated. The enabled replay and all 14 retained Chromium cases passed locally before integration. The resulting unit proof no longer requires the legacy backend runner.\nCondition satisfied: No session observation or alert unit case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: e49a4aa8d64245bc2560cd5b044d6f5cded010e9 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-terminal-attach-and-cursor-turns-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-terminal-attach-and-cursor-turns-on-vitest"},"implementation":"Land the proof disposition for terminal attach.","rationale":"Runner cutover removes the legacy execution path. Disposition of these terminal attach checks belongs to their existing supplier before that removal.","condition":"No terminal attach unit case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"0f91c70c84ffdbcd0d79126cdb741b4c2879f236","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-terminal-attach-and-cursor-turns-on-vitest","summary":"All five legacy terminal attach specs now run on Node Vitest in place or split by question: agent-terminal-admission (11, new) and agent-terminal-boundary (6), agent-terminal-resize (2), agent-terminal-close (1), agent-terminal-codex-close (1) and agent-terminal-codex (3). The one-worker selection of those six files ran 24 Node cases and zero Playwright cases, all passing, at 12.5 s; the integrated merge reran them with the trunk Done/stop specs, 40 cases passing. Plan 871 at the before-cleanup revision records each slice's proof, and an Intent Coverage break on the Codex resume environment was caught.\nCondition satisfied: No terminal attach unit case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 66d05a5eae9d44f78fde7b4c935ef467b2a5cd6a on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-cursor-runner-lifecycle-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-cursor-runner-lifecycle-on-vitest"},"implementation":"Land the proof disposition for the Cursor runner lifecycle.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No Cursor runner unit case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"4e89cf93f9664722e1ba16ef786cc6472c45c3d1","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-cursor-runner-lifecycle-on-vitest","summary":"All 25 observations of the seven legacy Cursor runner specs now run in Node Vitest: six session specs converted in place and the terminal runner spec split into cursor-runner-{start-admission,process-ownership,rejoin,dashboard-close,stop} with sessions/cursor-runner-current-proof. The legacy terminal file and its runner support modules are deleted. The final focused gate selected 28 Vitest cases and zero Playwright cases, all passing; branch CI passed on the merged state acd7addf0 and Intent Coverage caught a removed replacement-under-lock fault.\nCondition satisfied: No Cursor runner unit case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: a5ccc1c59cd64f1a16b46046836961c08bb38e9e on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-session-retention-and-input-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-retention-and-input-on-vitest"},"implementation":"Land the proof disposition for session retention, one-shot session starts and session input.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No retention, one-shot session start or session input unit case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"6656107c8ab9b33e998f6393e5df4491bc74449d","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-retention-and-input-on-vitest","summary":"All nine supplier spec paths now run on Node Vitest. The plan's local gate on the final slice candidate selected 27 Node cases and 0 Chromium cases with zero retries (34.972 s summed, 51.47 s elapsed at load 18–26); the same selection at the starting revision selected 27 Chromium cases. Plan 874 at this revision records the per-slice dispositions. No retention, one-shot session start or session input unit case in this supplier's scope depends on the legacy backend runner.\nCondition satisfied: No retention, one-shot session start or session input unit case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: e2774c6481e8a3e7787b85babb99845a68b9e093 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-cursor-turns-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-cursor-turns-on-vitest"},"implementation":"Land the proof disposition for Cursor turns.","rationale":"Runner cutover removes the legacy execution path. Disposition of these Cursor turn checks belongs to their supplier before that removal.","condition":"No Cursor turn unit case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"aa6ee4483c067e5ab32541ab8e76a7e4e9968c1f","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-cursor-turns-on-vitest","summary":"All six Cursor turn specs (18 cases: agent-terminal-cursor{,-exit,-idle,-launch,-launch-wait,-trust-join}.spec.ts) now run on Node Vitest (18/18 passed, 74.04s summed case time, 77.32s elapsed; 0 Playwright tests listed), workingKeptCursorTest and the pageTest import were removed from keptCursorTurn.ts, npm run typecheck:dashboard passed, and Dough Intent Coverage returned Caught on the trust-prompt readiness gate.\nCondition satisfied: No Cursor turn unit case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 54c3899ad57382bf893f524a28de04966f070aff on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#fast-runtime-unit-cases","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#fast-runtime-unit-cases"},"implementation":"Move every dashboard/backend-tests/runtime/ case to fast Node Vitest unit cases or a named end-to-end owner.","rationale":"Runner cutover removes the backend Playwright path. 27 runtime specs still run on it, and their disposition now belongs to the runtime story.","condition":"No dashboard/backend-tests/runtime/ case depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"7fdf8e265edfb72ded348f3845080a186f5a39f1","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#fast-runtime-unit-cases","summary":"The whole dashboard/backend-tests/runtime/ folder ran 102 cases, all in the Node Vitest project, 812 ms summed, slowest 83 ms (plan 879 slice 8 proof record at load 26); after integration the merged tree ran 104 runtime and launch-wait cases with no Playwright project. No spec in the folder imports Playwright fixtures; real process, Git, npm and build behavior moved to named E2E cases (production-qualification-git, dev-server-cache-ownership, published-development-install) and runner scripts (fake-gh-real-owner.sh, production-build-gate.sh).\nCondition satisfied: No dashboard/backend-tests/runtime/ case depends on the legacy backend runner.\nCondition satisfied: No dashboard/backend-tests/runtime/ case depends on the legacy backend runner.\nAccepted integration: 125d39333c453b32348f2cbce6f696d529b46e92 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#github-request-lifetime-and-evidence-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#github-request-lifetime-and-evidence-via-vitest"},"implementation":"Land the maintained proof disposition for GitHub request lifetime and failure evidence.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal; it took over these cases from SEED-413#authenticated-github-observation-via-vitest at its split.","condition":"The proof disposition for GitHub request lifetime and failure evidence is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Maintainers running Dashboard Backend Test locally or in CI
  get one Node Vitest execution path with the same selection, sharding,
  timing, failure and proof-record contracts.
- **Evaluation.** A full backend selection contains every surviving unit
  check on Vitest, with each former legacy observation accounted for.
  A filtered or sharded run reports the right cases and times. A deliberate
  failing specimen is carried in the expected proof record and retains its
  diagnostics.
- **Boundary.** Own the remaining Playwright launch-options runner specimen
  if still present and the four `start-origin-*` private fixture contracts.
  Replace harness contracts still in use and retire cases proving removed
  setup. Every `runtime/` spec already runs on Node Vitest after
  [fast runtime cases](https://github.com/terryyin/open-dough/blob/7fdf8e265edfb72ded348f3845080a186f5a39f1/.planning/slice-plans/879-prove-runtime-in-fast-unit-cases/PLAN.md). Remove the backend Playwright config, the backend dual-runner
  path and unused backend request/server wrappers. Keep test contracts shared
  by frontend or E2E until their own last consumer is gone. Own the private
  stand-in fixture and runner process teardown in `observation/`
  (`private-http-stand-in-runner` and `run-processes`). The three other
  `observation/` specs that the frontend runner retirement moved
  (`control-reachability-observation`, `observation-measurements` and
  `touch-reading-observation`, 11 cases) prove Playwright-only helpers that
  E2E and backend page objects use; give them a home that keeps that proof.
- **Prerequisite.** The product stories in the coverage map, attachment admission and the
  repeat correction supply the product-proof disposition needed before
  removing the legacy runner. Recount from fetched trunk and account for
  all survivors, including any that were added after the split.
- **Effort hypothesis.** M to L, low confidence, assuming product legacy
  specs have reached their named owners before cutover.
- **Safe stopping point.** The standalone backend command and CI producer both
  run on Node Vitest, with full selection and proof-record discrimination
  rechecked and the legacy backend entry point removed.
- **Conversion learnings.** From the configuration and serving migration
  (27 November 2026):
  - Vitest's `expect.poll` waits 1 s by default, not Playwright's 5 s.
  - A hook timeout cannot be overridden here, so start expensive shared
    servers lazily inside each test, bounded by that test's own timeout.
  - Shared support asserts with `node:assert`, not Playwright `expect`, so
    both runners can use it.
  - `Distribution/tests/test-runner/dashboard-concurrent-runs.sh` now judges
    its Vitest sample by proof record and standard error, not silence.

<a id="backend-vitest-replacement-coverage"></a>

#### Backend Vitest coverage and order

Developers need the current mixed-runner backend tests to become fast,
compile-time-checked evidence without losing native, Git, filesystem or
process behavior. Manual spot checks would leave routine regression proof to
the developer. Deferring keeps useful checks but prolongs their setup cost.
An import-only migration would retain expensive HTTP and worker setup and
move the same tests twice. These stories use typed production answers, kept records, and real
collaborators at the boundary whose behavior the case observes.

The maintained `groupFiles(backendGroup)` selector at `1e0e1f876` on
25 November 2026 counted 592 backend specs, 307 Playwright and 285 Vitest.
The 307 paths were launches 91, observation 54, sessions 50, runtime 39,
Review 31, Intent 17, configuration 13, and terminals 12. The later print
from the same selector at `43b6506e7` found 607 paths overall, 369 Vitest
and 238 Playwright. Its updated published-read inventory was 57 observation,
33 Review, 17 Intent and six selected launch paths on Playwright. Allocate legacy
paths in the following order so each has one owner. A surviving file can be
converted, consolidated with a named proof owner, moved to the correct suite,
or removed once its behavior or duplicate is accounted for.

| Selection at the recount | Proof disposition owner |
| --- | --- |
| Two `launch-attachment-*` specs | [Attachment admission](https://github.com/terryyin/open-dough/blob/ee8d963f593e06a2a2ca518b8c4072e888b8bae6/.planning/slice-plans/842-prove-launch-attachment-admission-on-vitest/PLAN.md), completed on Node Vitest |
| Three `agent-launch-follow-up-notes*` specs, plus the two Vitest Story Notes pilot specs | [Story Notes](https://github.com/terryyin/open-dough/blob/dec37b6b829b7b5d20a57df4a3775e9c6a015faa/.planning/slice-plans/845-prove-story-notes-and-follow-up-delivery-on-vitest/PLAN.md), completed on Node Vitest with Cursor confirmation in E2E |
| Six `agent-launch-follow-up-{file-admission,file,landed-comparison-admission,published-range-admission,published-sessions,selection}` specs | [Published Follow up evidence](https://github.com/terryyin/open-dough/blob/c57304660d75709c648e3129d8cf175f393b1a93/.planning/slice-plans/859-prove-published-follow-up-evidence-on-vitest/PLAN.md), completed on Node Vitest; the two Intent browser journeys keep the receipt |
| `agent-launch-options-rules.spec.ts` | [Runner cutover](#retire-legacy-dashboard-backend-runner), while it is a runner specimen |
| Eight launch admission and settlement spec paths | [Launch admission and settlement](https://github.com/terryyin/open-dough/blob/420905723de59e71180451879726f684dcc7915e/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-starts-and-recovery-on-vitest) |
| Six launch recovery, worker, change and drain specs | [Worker recovery and drain](https://github.com/terryyin/open-dough/blob/23e911e465339f1b371fd9e36cc99a583c580ac1/.planning/slice-plans/857-prove-launch-worker-recovery-on-vitest/PLAN.md), completed on Node Vitest with native receipt, server death and preview replacement in E2E |
| 15 installed execution and refinement specs | [Installed story starts](https://github.com/terryyin/open-dough/blob/79475eaef07720be5bdd25722433060d62f8a19a/.planning/slice-plans/847-prove-installed-story-starts-on-vitest/PLAN.md), completed on Node Vitest with native dispatch and restart in E2E |
| 18 workspace and scheduled launch specs, plus the cutover's later `admitted-session-duplicate.spec.ts` | [Session workspace choices](https://github.com/terryyin/open-dough/blob/daea1238c354addf980ff601d7b794fe4523c927/.planning/slice-plans/848-prove-session-workspace-starts-on-vitest/PLAN.md), completed on Node Vitest, including the isolated Codex case and restored observations in [plan 854](https://github.com/terryyin/open-dough/blob/cfd4dcfac7e06fa70e73be54cca2ad6626b1ab36/.planning/slice-plans/854-restore-session-workspace-vitest-proof/PLAN.md) |
| 15 native dispatch and first-input specs | [Host choices and first input](https://github.com/terryyin/open-dough/blob/eac4d5e9e4041f64f603a5afc08378552a9c433c/.planning/slice-plans/849-prove-native-first-input-on-vitest/PLAN.md), completed on Node Vitest with worker shutdown and restart in E2E |
| 6 ordinary follow-up context specs | [Prove retained follow-up context in Node Vitest](https://github.com/terryyin/open-dough/blob/76b599da18dca0da2499f87944e2c6020f4f0807/.planning/slice-plans/850-prove-follow-up-context-on-vitest/PLAN.md), completed on Node Vitest |
| 7 retained launch record specs | [Retained launch records](https://github.com/terryyin/open-dough/blob/29e3287e862e5d5415d32653b3e71c91287b90a8/.planning/slice-plans/851-prove-kept-launch-records-on-vitest/PLAN.md), completed on Node Vitest; the shared-machine spec's catalog fixture checks moved to [runner cutover](#retire-legacy-dashboard-backend-runner) |
| Four `start-origin-{default,demand,isolation,private}` specs | [Runner cutover](#retire-legacy-dashboard-backend-runner), preserving private installed fixture behavior wherever it remains in use |
| 14 Done, stop, delete and reopen specs | [Marking sessions done, stopping, deleting and reopening](https://github.com/terryyin/open-dough/blob/499d3b82bfe3b987b927c3f77aaece6d0f68fd2d/.planning/slice-plans/867-prove-marking-sessions-done-on-vitest/PLAN.md), completed on Node Vitest with the terminal and deletion journeys retained in E2E |
| 11 completion reporting specs | [Session completion reporting](https://github.com/terryyin/open-dough/blob/1308a09321731e3b91077cd93968609cecf3c803/.planning/slice-plans/870-prove-session-completion-reporting-on-vitest/PLAN.md), completed on Node Vitest with the HTTP report, real hosts and receivers in E2E |
| Nine observation, alert and replay specs | [Native session observation and alerts](https://github.com/terryyin/open-dough/blob/0e82130ff6693e0f9a7b936aa8871aacb6ebbfee/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-observation-on-vitest) |
| Five Claude and Codex terminal attach specs | [Terminal attach](https://github.com/terryyin/open-dough/blob/0f91c70c84ffdbcd0d79126cdb741b4c2879f236/.planning/slice-plans/871-prove-terminal-attach-on-vitest/PLAN.md), completed on Node Vitest |
| Six Cursor turn specs | [Cursor turns](https://github.com/terryyin/open-dough/blob/aa6ee4483c067e5ab32541ab8e76a7e4e9968c1f/.planning/slice-plans/872-prove-cursor-turns-on-vitest/PLAN.md), completed on Node Vitest |
| Seven Cursor runner specs | [Cursor runner lifecycle](https://github.com/terryyin/open-dough/blob/4e89cf93f9664722e1ba16ef786cc6472c45c3d1/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-cursor-runner-lifecycle-on-vitest) |
| Nine retention, one-shot start and input specs | [Session retention, one-shot starts and input](https://github.com/terryyin/open-dough/blob/6656107c8ab9b33e998f6393e5df4491bc74449d/.planning/slice-plans/874-prove-session-retention-and-input-on-vitest/PLAN.md), completed on Node Vitest with browser gestures, voice capture and visible Done retained in E2E |
| Eleven Playwright Intent paths named in the [repeat proof selection](../slice-plans/607-close-landed-ci-repeat-check-gaps/proof-selection.txt) | [Automatic repeat correction](SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps), including its failure and load proof |
| 12 observation Playwright paths | [Published read admission in Node Vitest](https://github.com/terryyin/open-dough/blob/ebdf4ebac57a7d7cd41172def1b8089a2d4fd455/.planning/slice-plans/860-prove-published-read-admission-on-vitest/PLAN.md#final-family-measurement) |
| 15 observation Playwright paths | [Prove published refresh lifecycle in Node Vitest](#published-refresh-lifecycle-via-vitest) |
| 23 observation Playwright paths | [Authenticated GitHub observation in Node Vitest](https://github.com/terryyin/open-dough/blob/71cc76188db2356fd0f4cd2f064cfd27be95c037/.planning/slice-plans/862-prove-authenticated-github-observation-on-vitest/PLAN.md#local-gate-and-delivery) for ten paths and the delivered cases of two shared paths; [Prove GitHub request lifetime and failure evidence in Node Vitest](#github-request-lifetime-and-evidence-via-vitest) for the other 13 |
| 21 review Playwright paths | [Published Review comparisons in Node Vitest](https://github.com/terryyin/open-dough/blob/cc7802ace20bd4475751c5e75713d983290607e5/.planning/slice-plans/863-prove-published-review-comparisons-on-vitest/PLAN.md#proof-and-local-gate), completed on Node Vitest with three Review journeys retained in E2E |
| 12 review Playwright paths | [Prove retained landing capture in Node Vitest](#landing-capture-evidence-via-vitest) |
| 6 intent Playwright paths | [Prove published Intent evidence in Node Vitest](#published-intent-evidence-via-vitest) |
| 2 observation Playwright paths | [Dashboard machine observations in Node Vitest](https://github.com/terryyin/open-dough/blob/acf16a47afc535fd6ddc787ee13c116b723a8e72/.planning/slice-plans/866-prove-machine-observation-on-vitest/PLAN.md#final-comparison), completed on Node Vitest with the Sessions sidebar retained in E2E |
| Five observation harness specs | [Runner cutover](#retire-legacy-dashboard-backend-runner) |
| 13 configuration specs and nine product-facing runtime specs listed below | [Configuration and serving](https://github.com/terryyin/open-dough/blob/13d7e049249851833514e2eb598eacb022d34fba/.planning/slice-plans/868-prove-dashboard-configuration-and-serving-on-vitest/PLAN.md), completed on Node Vitest |
| Other 30 runtime specs, which prove test infrastructure, and the speed of all runtime specs | [Prove Dashboard runtime behavior in fast unit cases](https://github.com/terryyin/open-dough/blob/7fdf8e265edfb72ded348f3845080a186f5a39f1/.planning/slice-plans/879-prove-runtime-in-fast-unit-cases/PLAN.md), completed on Node Vitest |

The nine product-facing runtime specs are `boundary-server`,
`dev-server-cache-ownership`, `production-deployment`,
`production-qualification`, `production-update-selection`,
`production-watcher-preview`, `production-watcher-refusals`,
`production-watcher-setup-lifetime`, and `serving-modes`. Use the
same distinction for newly added runtime cases according to what they observe.

Story Notes used explicit store inputs and retained records to preserve
receiving-input and note-version observations through typed operations.
Launch and session families carry the largest historical setup cost.
Published Follow up can move independently. Recount the remaining read
families against the local-Git publications that affect their boundaries.
Follow the repeat correction with disposition of its residual Intent
unit cases. Runner cutover is last. When pausing for product work,
defer cutover first. Each earlier outcome can stop safely with the mixed
runner still active.

Measure each selected family with the maintained command under comparable
conditions before and after. Record per-case times against roughly 100 ms,
counts, summed case time, elapsed selection time, and the cost and named
owner of any proof moved to E2E. Preserve distinct failures and interactions,
compose state with MakeMe, add zero request or server wrappers to test support,
and remove those with no remaining caller. Recount each boundary before
refinement. The remaining unrefined product scopes are effort hypotheses. The old 14–25 active-hour estimate for the whole
remainder assumed per-file migrations. At `07435ba0f` the selector picked 592 backend specs (305 Playwright and
287 Vitest), including 89 launch Playwright specs. The original 79 launch
specs spanned independent proof outcomes and exceeded one eight-slice plan.
The six launch stories above account for 75 product specs. The other four
exercise the private test-origin builder (installed fixture source, object
isolation, failure cleanup and copy ownership), so runner cutover owns their
disposition. Check those fixture contracts at their surviving consumers.
Reconcile landed product work, consolidate equivalent assertions, and retain
actual process proof where its result requires it.

The original launch selection at `07435ba0f` excluded notes, published
follow-up cases, attachments, and the options specimen. The maintained
backend command with one worker passed 271 Chromium and 78 Node cases on
their first attempt. It took 1,046.47 s wall and 972.027 s summed case time.
The per-story plans carry the relevant excerpts. Take fresh scoped
comparisons for execution under comparable load.

Earlier direct conversion reduced summed case time from 37.308 s to 31.758 s
while mixed-engine wall time rose from 36.842 s to 40.582 s. The typed Usage
History importer reduced focused elapsed time from 88.701 s to 36.389 s and
CLI starts from 288 to six. Keep both measures. The
[original remainder](https://github.com/terryyin/open-dough/blob/1e0e1f8767e7cebaba46182d141d75d7fb026525/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-attachments)
retains the earlier family counts, timing samples, overlap analysis and
links to completed proof.
