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

<a id="prove-launch-starts-and-recovery-on-vitest"></a>

### Prove Dashboard launch starts and recovery in Node Vitest

**Identity:** SEED-413#prove-launch-starts-and-recovery-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/846-prove-launch-starts-and-recovery-on-vitest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"25dd18ab6d0ff2c644deefa86552fb4dbea0f17f4fb7e8281ae5f83a26a1df56","plan":"519cf8aedb33724a238092ce00dc80232eb8ebed4c1a343af2476a4a8bd58a6c"}}
```

- **Goal.** Developers changing Dashboard Start and Continue get quick proof
  that the Dashboard keeps one intended attempt before work starts, then
  protects or recovers that attempt when a caller or worker disappears.
- **Scope.** Move the 14 legacy specs owned by the plan's proof map off
  backend Playwright. Exercise request refusal, kept-first admission, competing
  starts and open sessions, worker handoff, continuation, change reads,
  reconciliation, and drain through typed operations. Retain the process
  boundaries that demonstrate restart, Git publication or actual native input.
  The [coverage map](#backend-vitest-replacement-coverage) assigns the other
  launch outcomes, notes, attachment admission, and test fixtures.
- **Key examples.**
  - Given overlapping launches for the same story, the first request is
    durably kept before publication or host effects. Another workflow cannot
    claim that story while it is held. A failed record write starts nothing.
  - Given an interrupted attempt with its choices held, a fresh Start cannot
    bypass it. Continue on the kept attempt reuses its identity, workspace and
    input. An existing confirmed record settles the attempt without another
    dispatch. A newer running or settled attempt cannot be overwritten.
  - Given a pending accepted start when the updater requests drain, Start and
    Continue are refused and drain waits through publication, native
    confirmation and the final outcome write. A change reader sees the settled
    result after the owner has released the write lock.

<a id="restore-session-workspace-vitest-proof"></a>

### Restore dropped session workspace proof in Node Vitest

**Identity:** SEED-413#restore-session-workspace-vitest-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/854-restore-session-workspace-vitest-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"15474c50669b760c29ab1fa1a28262f07e509d689bf5e6e0ad27b9639f27b8b0","plan":"3030fb1989c2421fc5d57f32e3d9b8021bff40931455679145c691dba31b282c"}}
```

**Goal.** Dashboard maintainers get the session workspace and scheduled
feedback observations that the [Node Vitest move](https://github.com/terryyin/open-dough/blob/daea1238c354addf980ff601d7b794fe4523c927/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-workspace-starts-on-vitest)
dropped or credited to checks that do not assert them, and that move's last
mapped spec leaves the legacy backend runner.

**Scope.** Correct that story's delivered proof only. Restore each lost
observation at a typed production boundary. Convert the retained Codex
isolated spec. Collapse the duplicated attempt-run setup and the oversize
or branching specs the review found. Product behavior and that story's
promises stay unchanged.

**Plan.** [Restore dropped session workspace proof](../slice-plans/854-restore-session-workspace-vitest-proof/PLAN.md)

<a id="prove-follow-up-context-on-vitest"></a>

### Prove retained follow-up context in Node Vitest

**Identity:** SEED-413#prove-follow-up-context-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer continuing a follow-up gets fast proof that the correct source context reaches the receiving agent even after the original record expires.
- **Boundary.** Cover ordinary story and session context, source identity, input order, and retry. Reconcile source-story binding with [story-linked ad hoc sessions](https://github.com/terryyin/open-dough/blob/1ee3eb03b59a2133fdb73dddaf28c9d44fef2de8/.planning/seeds/SEED-439-complete-story-linked-ad-hoc-sessions.md#complete-story-linked-ad-hoc-sessions). The coverage map assigns Story Notes and published comparison selectors to their owners.
- **Evaluation.** Two source sessions with the same instruction remain distinct. Repeating one after expiry sends its saved context and preserves the developer's instruction.
- **Effort hypothesis.** M, low confidence. Cover the retained context through the corresponding host inputs.
- **Mapped slices.** See the [provisional plan](../slice-plans/850-prove-follow-up-context-on-vitest/PLAN.md).
- **Replacement trace.** Split from [launch starts and recovery](#prove-launch-starts-and-recovery-on-vitest).

<a id="prove-kept-launch-records-on-vitest"></a>

### Prove retained launch records in Node Vitest

**Identity:** SEED-413#prove-kept-launch-records-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/851-prove-kept-launch-records-on-vitest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c66cbb5b20ebd1ab93edf341b3bad77d19d5c4191220c89c8c3dc0147a4970be","plan":"cf8812b2b23c3f534513ca2d545b0a4eaadbfbdbf1559df8231c38858e0f5638"}}
```

- **Goal.** Developers changing how the Dashboard keeps launches get fast,
  typed Node Vitest proof that kept starts and launch records survive
  restart, reads from another Dashboard process, replacement and expiry,
  and that each native session stays bound to its own host.
- **Scope.** Move the seven legacy specs the
  [plan](../slice-plans/851-prove-kept-launch-records-on-vitest/PLAN.md)
  maps off backend Playwright, through the existing start store, launch
  record store, done-mark, deletion and host-observation operations. Use a
  real second Node process where another writer or reader is the
  observation, and real machine files for locks, replacement and
  unreadable copies. Start no Dashboard server or Vite host for these
  cases. The catalog fixture observations in the shared-machine spec
  check test support, not product records, so
  [runner cutover](#retire-legacy-dashboard-backend-runner) owns them. Product
  behavior stays unchanged.
- **Key examples.**
  - Given a store this process has already read, another process records a
    launch: the next read here answers both records. A replacement that is
    unreadable but has the same size and time answers no records and stays
    in place. The next launch moves it aside next to any earlier
    unreadable copy.
  - Given 24 kept sessions, two processes mark them done concurrently: every
    done mark survives, and a later native completion revives no review
    attention.
  - An unclosed record is kept however old it is. A done record is dropped
    on the next write once 30 days have passed since it was marked done.
  - Given a refused native start, its start stays kept and is never reported
    running. A held store lock refuses a write and leaves the document
    unchanged. A lock whose owner has gone is reclaimed.
  - Given a Claude and a Codex record with the same native ID, each host
    reads only its own record. A Done or Delete naming Codex changes only
    the Codex record and calls Claude for nothing. One that names no host
    addresses Claude. A host whose read fails or never settles leaves the
    other host's healthy observation intact.

<a id="prove-native-session-and-terminal-lifecycle-on-vitest"></a>

### Prove native session and terminal lifecycle in Node Vitest

**Identity:** SEED-413#prove-native-session-and-terminal-lifecycle-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers changing an existing agent session need fast
  feedback on what the Dashboard discovers, keeps, reopens, attaches to,
  stops, and completes. A session's terminal must still reflect actual input,
  output, and lifecycle transitions.
- **Evaluation.** Given a kept conversation that finishes or is reattached,
  its status and terminal evidence agree with the retained record. A
  confirmation, cancellation, or stopped input leaves the actual persisted
  outcome and session ownership observable.
- **Boundary.** Own surviving `sessions/` and `terminals/` cases, including
  native discovery, reporting, Done/read/stop/recovery, input services,
  attachment, connection lifecycle and terminal replay. Keep an actual host,
  PTY or socket in E2E when that boundary supplies the proof. Recount after
  [story-linked ad hoc sessions](https://github.com/terryyin/open-dough/blob/1ee3eb03b59a2133fdb73dddaf28c9d44fef2de8/.planning/slice-plans/833-complete-story-linked-ad-hoc-sessions/PLAN.md)
  changes the standalone paths. Launch admission and note delivery keep
  their own stories.
- **Effort hypothesis.** L, low confidence. Direct record arrangement should
  replace many launch-as-setup cases. Essential process and socket journeys
  determine how much proof still belongs in E2E.
- **Safe stopping point.** Session and terminal feedback stays available
  through the same observable outcomes with fewer incidental agent launches.

<a id="prove-published-dashboard-reads-on-vitest"></a>

### Prove published Dashboard reads and evidence in Node Vitest

**Identity:** SEED-413#prove-published-dashboard-reads-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers reviewing a story need quick proof that the Board,
  Review and Intent return evidence for the published revision requested and
  correctly disclose stale, refused, or unavailable data.
- **Evaluation.** Given a retained comparison and a newer publication,
  refreshing advances only to readable evidence. Review, Intent, and a
  follow-up from a selected comparison preserve the requested endpoints,
  paths, and session facts. A wrong story or comparison is refused.
- **Boundary.** Own surviving observation, Review and Intent proof after
  applying the coverage map. Include publication binding and recovery,
  historical comparison and file admission, selected published follow-up
  evidence, and all surviving read/cache/refresh lifecycle checks. Reconcile
  with the [local Git North Star](../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads),
  including retirement of superseded authenticated reads and retention of
  real Git where the result depends on repository history. The automatic
  repeat correction retains its proof and load obligations. After it lands,
  take disposition of any of its product-unit cases still on Playwright.
- **Effort hypothesis.** L, low confidence. The earlier overlap inventory
  identified 49 observation and five Intent paths in moving local-Git
  boundaries. The estimate depends on accounting for retirements and
  consolidating proof under the surviving boundary during refinement.
- **Safe stopping point.** The remaining published read, history, and
  admission promises have one named owner each, including live refresh
  checks that still require end-to-end observation.

<a id="prove-dashboard-configuration-and-serving-on-vitest"></a>

### Prove Dashboard configuration and serving in Node Vitest

**Identity:** SEED-413#prove-dashboard-configuration-and-serving-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer changing project or machine settings, or
  updating the Dashboard, needs fast feedback about what configuration becomes
  effective and what the running program actually serves.
- **Evaluation.** Given a configured project and a staged production update,
  accepted configuration applies to the selected service and a refused
  change leaves the previous state usable. The installed, dev, and preview
  entry points retain the relevant serving and lifecycle proof.
- **Boundary.** Own `configuration/` and surviving product-facing `runtime/`
  coverage, including setup, notifier, preferences, project membership,
  serving, deployment, update selection and watcher lifetime. Recount
  project-add coverage after the default-branch story. Keep a real process or
  installed journey where the product contract involves it. The final runner
  story owns test-harness-only runtime cases.
- **Effort hypothesis.** L, low confidence. Existing configuration
  owners expose typed inputs. Installed program and process cases determine
  how much work remains.
- **Safe stopping point.** Settings and lifecycle behavior remain visible
  through typed checks and representative actual serving or installed proof.

<a id="retire-legacy-dashboard-backend-runner"></a>

### Run the entire Dashboard backend unit suite on Node Vitest

**Identity:** SEED-413#retire-legacy-dashboard-backend-runner
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#retire-legacy-dashboard-backend-runner","dependencies":[{"supplier":{"identity":"SEED-413#finish-backend-vitest-renovation-after-launch-attachments","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-attachments"},"implementation":"Land the typed Story Notes and note-follow-up checks with native confirmation preserved in E2E.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No Story Notes or note-bearing follow-up unit case depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"dec37b6b829b7b5d20a57df4a3775e9c6a015faa","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-attachments","summary":"The exact five-spec backend selection passed all 41 cases in Node Vitest, covering 29 pilot cases, 11 previously mounted launch cases, and one valid Attach contrast. The twelfth original launch case passed in Chromium E2E in e2e/stories/recently-done-cursor-follow-up-notes.spec.ts with the same kept input confirmed and its admitted note version sent. The Dashboard sent-state journey passed separately. The archived plan records the selectors and timing checks. No Story Notes or note-bearing follow-up unit case depends on the legacy backend runner.\nCondition satisfied: No Story Notes or note-bearing follow-up unit case depends on the legacy backend runner.\nAccepted integration: 720879458315e6b86aa70f5d9a609274de119f31 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-launch-starts-and-recovery-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-starts-and-recovery-on-vitest"},"implementation":"Land the proof disposition for launch admission, attempts and worker handoff.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No launch admission or recovery case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-native-session-and-terminal-lifecycle-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest"},"implementation":"Land the session and terminal proof disposition.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No session or terminal unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-published-dashboard-reads-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest"},"implementation":"Land the surviving published data and review proof disposition, including residual repeat unit cases after the correction.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No published evidence unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-dashboard-configuration-and-serving-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-dashboard-configuration-and-serving-on-vitest"},"implementation":"Land the settings and product runtime proof disposition.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No configuration or serving unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#finish-backend-vitest-renovation-after-launch-options","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-options"},"implementation":"Land the typed upload and claim cleanup checks, with accepted delivery kept in E2E.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No launch attachment unit case depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"ee8d963f593e06a2a2ca518b8c4072e888b8bae6","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-options","summary":"The integrated backend selector classifies both selected launch attachment specs as Node Vitest. Six focused Node cases passed, covering the former upload, cleanup, filename and selection observations. The retained Chromium refinement and recovery journeys passed and verify accepted bytes at the ordered native paths and the reused recovery path. The archived slice plan records the commands and proof.\nCondition satisfied: No launch attachment unit case depends on the legacy backend runner.\nAccepted integration: fec5480484657266e715615024f3d6b630ad4b35 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-324#close-landed-ci-repeat-check-gaps","href":"seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps"},"implementation":"Land the retained repeat and load proof disposition for the correction.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"All repeat correction proof and load obligations have maintained owners through cutover.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-installed-story-starts-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-installed-story-starts-on-vitest"},"implementation":"Land the proof disposition for installed execution and refinement starts.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No installed execution or refinement start case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"79475eaef07720be5bdd25722433060d62f8a19a","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-installed-story-starts-on-vitest","summary":"The integrated backend selector classifies all 18 selected specs as Node Vitest and selects zero of them for Playwright. The archived plan and proof record map the 15 legacy specs to 48 passing typed real-Git cases, with eight passing retained Chromium E2E cases for actual native dispatch, kept starts and restart. The runner cutover owns its existing harness and survivor recount.\nCondition satisfied: No installed execution or refinement start case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 5725b315656e159e4cfc59dc069b9edf76b3091d on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-session-workspace-starts-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-workspace-starts-on-vitest"},"implementation":"Land the proof disposition for workspace choice, admission and scheduled launch.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No workspace choice or scheduled launch case in this supplier’s scope depends on the legacy backend runner.","state":"waiting","resolution":{"revision":"daea1238c354addf980ff601d7b794fe4523c927","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-workspace-starts-on-vitest","summary":"Plan 848 moved 18 of the 19 mapped workspace and scheduled launch specs to Node Vitest (43 node cases in 15 files). It retained agent-launch-start-session-isolated-codex.spec.ts on the legacy backend runner as the only owner of Codex thread/start cwd, the codex/<slug> namespace and ordered first input, so the condition is not yet met. Next action: SEED-413#restore-session-workspace-vitest-proof (plan 854, queued first) slice 4 moves that case to Node Vitest and deletes the file; judge this agreement again after it lands.\nCondition remains unresolved: No workspace choice or scheduled launch case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 23f2e537f24386746952c12a261a55b8bbaa67c0 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-native-first-input-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-first-input-on-vitest"},"implementation":"Land the proof disposition for host choices and first native input.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No host-choice or first-input case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"eac4d5e9e4041f64f603a5afc08378552a9c433c","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-first-input-on-vitest","summary":"The integrated maintained backend selection passed 88 Node Vitest cases across 21 specs, with zero Playwright cases and zero retries. Plan 849 at the recoverable revision maps all 79 legacy observations and separates four unchanged creation controls from 84 migrated Node cases. The retained Chromium selection covers 24 cases, including the moved real worker shutdown and restart. No host-choice or first-input case in this supplier’s scope depends on the legacy backend runner.\nCondition satisfied: No host-choice or first-input case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: cbab58ebbe335734f8990002e6fb50fec0df4738 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-follow-up-context-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-follow-up-context-on-vitest"},"implementation":"Land the proof disposition for ordinary follow-up context and retry.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No ordinary follow-up context case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-kept-launch-records-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-kept-launch-records-on-vitest"},"implementation":"Land the proof disposition for retained launch record behavior.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No retained launch record case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"}]}
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
- **Boundary.** Own runtime specs solely about test runners and their harness
  (selection, reporters, setup, fixtures, fake hosts and browser waiting),
  the remaining Playwright launch-options runner specimen if still
  present, and the four `start-origin-*` private fixture contracts. Replace harness contracts still in use and retire cases proving
  removed setup. Remove the backend Playwright config, the backend dual-runner
  path and unused backend request/server wrappers. Keep test contracts shared
  by frontend or E2E until their own last consumer is gone. The three
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
Review 31, Intent 17, configuration 13, and terminals 12. Allocate legacy
paths in the following order so each has one owner. A surviving file can be
converted, consolidated with a named proof owner, moved to the correct suite,
or removed once its behavior or duplicate is accounted for.

| Selection at the recount | Proof disposition owner |
| --- | --- |
| Two `launch-attachment-*` specs | [Attachment admission](https://github.com/terryyin/open-dough/blob/ee8d963f593e06a2a2ca518b8c4072e888b8bae6/.planning/slice-plans/842-prove-launch-attachment-admission-on-vitest/PLAN.md), completed on Node Vitest |
| Three `agent-launch-follow-up-notes*` specs, plus the two Vitest Story Notes pilot specs | [Story Notes](https://github.com/terryyin/open-dough/blob/dec37b6b829b7b5d20a57df4a3775e9c6a015faa/.planning/slice-plans/845-prove-story-notes-and-follow-up-delivery-on-vitest/PLAN.md), completed on Node Vitest with Cursor confirmation in E2E |
| Six `agent-launch-follow-up-{file-admission,file,landed-comparison-admission,published-range-admission,published-sessions,selection}` specs | [Published reads and evidence](#prove-published-dashboard-reads-on-vitest) |
| `agent-launch-options-rules.spec.ts` | [Runner cutover](#retire-legacy-dashboard-backend-runner), while it is a runner specimen |
| 14 launch admission, attempt and worker specs | [Launch starts and recovery](#prove-launch-starts-and-recovery-on-vitest) |
| 15 installed execution and refinement specs | [Installed story starts](https://github.com/terryyin/open-dough/blob/79475eaef07720be5bdd25722433060d62f8a19a/.planning/slice-plans/847-prove-installed-story-starts-on-vitest/PLAN.md), completed on Node Vitest with native dispatch and restart in E2E |
| 18 workspace and scheduled launch specs, plus the cutover's later `admitted-session-duplicate.spec.ts` | [Session workspace choices](https://github.com/terryyin/open-dough/blob/daea1238c354addf980ff601d7b794fe4523c927/.planning/slice-plans/848-prove-session-workspace-starts-on-vitest/PLAN.md), completed on Node Vitest except the Codex isolated case, which [its correction](#restore-session-workspace-vitest-proof) moves |
| 15 native dispatch and first-input specs | [Host choices and first input](https://github.com/terryyin/open-dough/blob/eac4d5e9e4041f64f603a5afc08378552a9c433c/.planning/slice-plans/849-prove-native-first-input-on-vitest/PLAN.md), completed on Node Vitest with worker shutdown and restart in E2E |
| 6 ordinary follow-up context specs | [Prove retained follow-up context in Node Vitest](#prove-follow-up-context-on-vitest) |
| 7 retained launch record specs | [Prove retained launch records in Node Vitest](#prove-kept-launch-records-on-vitest) |
| Four `start-origin-{default,demand,isolation,private}` specs | [Runner cutover](#retire-legacy-dashboard-backend-runner), preserving private installed fixture behavior wherever it remains in use |
| 50 session and 12 terminal specs | [Native session and terminal lifecycle](#prove-native-session-and-terminal-lifecycle-on-vitest) |
| Eleven Playwright Intent paths named in the [repeat proof selection](../slice-plans/607-close-landed-ci-repeat-check-gaps/proof-selection.txt) | [Automatic repeat correction](SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps), including its failure and load proof |
| 54 observation, 31 Review, and six other Intent specs | [Published reads and evidence](#prove-published-dashboard-reads-on-vitest) |
| 13 configuration specs and nine product-facing runtime specs listed below | [Configuration and serving](#prove-dashboard-configuration-and-serving-on-vitest) |
| Other 30 runtime specs, which prove test infrastructure | [Runner cutover](#retire-legacy-dashboard-backend-runner) |

The nine product-facing runtime specs are `boundary-server`,
`dev-server-cache-ownership`, `production-deployment`,
`production-qualification`, `production-update-selection`,
`production-watcher-preview`, `production-watcher-refusals`,
`production-watcher-setup-lifetime`, and `serving-modes`. Use the
same distinction for newly added runtime cases according to what they observe.

Story Notes used explicit store inputs and retained records to preserve
receiving-input and note-version observations through typed operations.
Next are launch and session families, which carry the largest
historical setup cost, followed by published evidence after reconciling the
moving local-Git boundaries. Configuration and serving can move up if that
overlap is still active. Runner cutover is last. When pausing for product work,
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

<a id="refuse-non-vitest-frontend-specs"></a>

### Refuse frontend specs the Vitest-only runner would skip

**Identity:** SEED-413#refuse-non-vitest-frontend-specs
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/855-refuse-non-vitest-frontend-specs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a71cbdfe5b57f2df7a17de990126f4c6c9fa9543ba2018a2704a0ce00f20fe35","plan":"ea6c2576ea44db213a2ca2fca1c3cc41490938bf772fdf4818eb430252883b15"}}
```

**Goal.** Dashboard maintainers learn at once when a frontend spec cannot
run, rather than CI passing without it, after the
[runner retirement](https://github.com/terryyin/open-dough/blob/2294ce3f9f4fa243024941f689e862ee01b7d0bf/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-frontend-runner) made the
frontend group Vitest-only.

**Scope.** Correct that story's delivered runner and its residue only: a
frontend spec without a Vitest import, and an unsupported option with an
empty selection, are refused by name. Name the group runner kind and the
failure output once, and remove the comments and the one-consumer fixture
module left by the retired runner. [Plan](../slice-plans/855-refuse-non-vitest-frontend-specs/PLAN.md).
