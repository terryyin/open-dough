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

<a id="split-done-mark-decision-from-store"></a>

### Mark Done through a typed decision and compose Done state in review cases

**Identity:** SEED-413#split-done-mark-decision-from-store
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/734-split-done-mark-decision-from-store/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"016f87495fe2a0222226f80b6549ca2e4f8888c3a6f5ef47f22142879e149c67","plan":"cf1eccb8d442a2d35747d20ee05c7a5c9479ea190b28a8fa4601c270d2d92c4b"}}
```

First of five stories from Terry’s 2026-11-20 reviews of the Done capture
family’s import lists. Terry accepted the first analysis and its order; the
addendum’s two stories were added at Terry’s request. The other four stories are
[branch entry](#split-branch-entry-proposal-from-store),
[delivery observation](#observe-done-deliveries-over-typed-records),
[landing reports](#decide-landings-over-typed-attempts-and-records) and
[launch flavors as MakeMe steps](#fold-done-capture-launches-into-makeme).

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
    [the family's timeout margin](#optimize-done-capture-family-cases).
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
    [delivery observation](#observe-done-deliveries-over-typed-records) and
    [landing reports](#decide-landings-over-typed-attempts-and-records),
    after branch entry and before the launch flavors fold into MakeMe, so
    the fold covers the final builders.
- **Goal.** Dashboard maintainers can prove Done capture and the review of
  Done sessions without a machine home. Marking Done is a typed decision on
  the record plus a Git-only branch-result capture. The store write and pin
  refs belong to the adapter alone. Review cases start from an already-Done
  record.
- **Scope.** Split `setRecordDoneAt` into: a pure Done transition (record,
  Done time and options → next record); a Git-only branch-result capture
  over a typed place that returns its result; and the store adapter that
  persists and pins. Replace the `readAncestry` test hook with the capture's
  own typed Git collaborator, or drop it if the held-Done race moves to the
  adapter's own case. Add MakeMe steps for a Done record with its captured
  branch result or session commits. Move every spec whose topic is the
  review off `keep`, `markDone` and `keptRecords`, and onto composed state
  passed to the typed review. Keep Done marking as the topic only in
  specs that prove the capture, the transition rules (expected, automatic,
  undo) or the adapter's persistence. Cover `madeSince` and run grouping
  with typed-log unit cases, and keep one real-Git case for the reflog read.
  Include the delivery observation and publication cases, where Done is a
  precondition: `twoDoneBranchesMergedByHand`, `ad-hoc-prepared-landing-done`,
  `ad-hoc-manual-landing-revision-observation` and the declared publication
  specs. Make `doneCaptureReview.ts` take composed records rather than read
  `keptRecords(source)`.
- **Key examples.**
  - A review case of a Done isolated branch builds its record with a MakeMe
    branch result and real Git commits, then reads the typed review, with no
    HOME stub and no `markDone`.
  - The Done transition refuses a stale expected Done time and ignores an
    automatic Done the record no longer allows, as plain values.
  - A held capture still loses to a newer Done, proved once at the adapter.
- **Evaluation.** Every replaced case keeps its assertions. Count
  `doneCaptureCase.ts` imports and calls, HOME stubs, and per-case time
  before and after at the same load, under
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
- **Effort hypothesis.** M, one plan.

<a id="split-branch-entry-proposal-from-store"></a>

### Propose a branch entry from typed inputs and expose its pin refs

**Identity:** SEED-413#split-branch-entry-proposal-from-store
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/735-propose-branch-entry-from-typed-inputs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f48af8e3006cf1ad62fc395237b5721c452217ec288320c7179c95467fd6c6f6","plan":"104f6e7f4bae51c3f432da31f6ea6603ee439bca6fb8e7cd2c3a3424fc5d35b4"}}
```

Second of the [Done capture import-list stories](#split-done-mark-decision-from-store);
the analysis and decisions are recorded there.

- **Goal.** Dashboard maintainers can prove what a branch entry captures
  and refuses using a typed launch record and real Git without arranging a
  kept store. Cases about review, attribution, or publication start with the
  branch entry already in the record. Cases about retaining and releasing
  evidence read the actual refs through their production owners, reducing
  setup and keeping the evidence checks tied to the host and session that
  own the pins.
- **Scope.**
  - Separate the proposal over the trunk ref, typed launch record, and
    requested worktree and branch from the adapter that keeps the entry and
    its pins. The proposal validates the registered worktree and captures
    its committed tip and working tree, the Default main tip, and the trunk
    observation. The adapter takes only the source id and ref it uses.
  - Preserve the handoff's admission and persistence rules. A registered
    non-trunk branch of the launch's repository can be recorded while the
    launch is open. The same place returns its previously kept entry.
    The repository restriction protects attribution to the original launch,
    and keeping the first entry fixes the review baseline even if main, the
    worktree, or the live record moves during the request.
  - Query session branch pins and one-shot landing pins via production.
    Use the host-qualified session or the original pin owner where the
    native session has been replaced. Retire the test queries and keep
    `retireAdHocBranch` for cases that actually prune a worktree.
  - Compose a branch entry with MakeMe when it is a precondition, including
    in `aDeclaredPublisherBranch`. Keep the real store adapter where
    persistence or pin survival is the topic. Retire `declaredBranchCase.ts`
    and make the expiry cases' cleanup collaborator explicit. Keep
    deletion cases on the production deletion operation.
  - The sibling stories own the Done transition, the delivery-observation
    and landing-report store splits, and the broader launch presets.
- **Key examples.**
  - Given a Default main launch, proposing a foreign clone, a mismatched
    worktree and branch, or a second place after a successful entry returns
    a conflict without a kept store. The same place returns the first
    entry even after main moves.
  - A successful handoff in a dirty worktree keeps the branch commit, the
    distinct Default main tip and the entry tree. Repeating the handoff
    returns that kept entry and leaves its pins in place.
  - A review whose launch already holds its branch entry shows only the
    branch's post-entry changes in its branch comparison and the earlier
    Default main commits in their own comparison.
  - After Cursor replaces a session, its pins still belong to the
    original host-qualified session. Expiry removes those pins and keeps
    the other session's pins. Deleting a declared landing likewise
    releases its one-shot pins after the comparison has outlived retirement.
- **Evaluation.** Preserve every replaced assertion. Compare affected
  specs' imports, branch-entry actions, HOME stubs, and case time at
  comparable load as in the first story. Also count backend spec imports of
  `adHocReview.ts`.
- **Effort hypothesis.** M, one plan.

<a id="observe-done-deliveries-over-typed-records"></a>

### Observe Done deliveries over typed kept records

**Identity:** SEED-413#observe-done-deliveries-over-typed-records
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#observe-done-deliveries-over-typed-records","dependencies":[{"supplier":{"identity":"SEED-413#split-done-mark-decision-from-store","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#split-done-mark-decision-from-store"},"implementation":"MakeMe branch-result steps for Done records, Git-only branch capture, and composed-record review helpers in doneCaptureReview.ts.","rationale":"This story composes Done isolated-branch records with MakeMe and verifies their reviews without a machine home; common direction and reconciliation cannot supply the missing MakeMe branch-result builder or composed review support while SEED-413#split-done-mark-decision-from-store is reorganizing launchOutcomeTestData.mjs, doneCaptureReview.ts, doneBranchObservation.ts, and the observation specs in flight.","condition":"makeMe.aLaunchRecord provides a step for a Done record's captured branch result and doneCaptureReview.ts reads supplied kept records without reading the machine store.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/736-observe-done-deliveries-over-typed-records/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"97042139380f11b82a47a5743303780e65ec4e0deed0ef41cc7b138dcc168b43","plan":"af6701486622645c306cee2434e96fbda3a50984f8c5d73b0662e02fbb321e3e"}}
```

Third of the [Done capture import-list stories](#split-done-mark-decision-from-store);
the analysis is in its addendum on delivery observation and publication.

- **Goal.** Dashboard maintainers can prove which Done branches a trunk
  revision delivers from composed Done records and real Git, without a
  machine home. Only the store adapter saves a discovered delivery to the
  live record and keeps or releases its delivery pins, removing repeated
  store and Done-capture replay from delivery-observation proof.
- **Scope.**
  - Split `captureObservedLandings` into a typed decision over the kept
    records, the project's trunk ref and observed revision, the authorized
    trunk head reader, and the manual-landing inspection that returns each
    delivery to keep, and the store adapter that applies each delivery to
    the live record and releases its pins on loss. Keep the process-lifetime
    owner (each project's last observed revision, checked witnesses, and
    in-flight pass coalescing) on the typed decision.
  - Preserve the observation's domain restrictions: only an unlanded Done
    branch whose `branchResult` matches the record's current `doneAt` with
    `manualDeliveryChecked: true`, whose witnessed trunk revision is present
    and differs from the observed revision, and whose target matches the
    project's trunk ref is eligible (preventing unverified, stale-Done, or
    wrong-branch delivery associations); a checked witness with no delivery
    is skipped at the same observed revision while an unreachable trunk head
    or thrown inspection stays unchecked to retry and a new observed
    revision resets witnesses; and the adapter verifies the live record
    still exists in retention with the same `launchedAt`, `branchPinOwner`,
    and `branchResult` before pinning and saving, releasing unkept delivery
    pins if saving fails or loses (preventing recreated launches, overwritten
    newer Done state, and orphaned Git refs).
  - Prove delivery selection, skipped witnesses, newly-Done discovery at an
    unchanged revision, and failed-inspection retry from composed Done
    records and real Git with no machine home (`twoDoneBranchesMergedByHand`,
    `ad-hoc-manual-landing-observation`, and
    `ad-hoc-manual-landing-observation-retry`).
  - Keep repeated-observation single-delivery retention and the deletion,
    expiry, and write-loss races as adapter cases over an explicit
    record-store collaborator instead of a stubbed `HOME`,
    `changeLaunchStore`, `launchRecordStore` imports, and
    `installRecordRemovalDispatch` (`ad-hoc-manual-landing-observation-lifecycle`
    and `ad-hoc-manual-landing-revision-observation`).
  - The sibling stories own the Done transition and MakeMe branch-result
    steps, production pin-ref queries, `handleLanding`, and folding launch
    and observation presets into MakeMe. `observeProjectRevision` keeps its
    contract for `performedRead.ts` and `performedRevisionCheck.ts`.
- **Key examples.**
  - Given two composed Done branches merged in order onto published trunk,
    deciding observed deliveries at the published head returns each branch's
    delivered base-and-merge comparison with no kept store and no delivery
    pins written.
  - Given a process-lifetime observation owner at one revision, an
    unmerged Done branch is inspected once and skipped on a repeat check at
    that revision; a session newly Done before the repeat check is
    inspected and delivered; a branch whose inspection throws retries on
    the repeat check while an independent branch's delivery settles; and an
    advanced revision rechecks previously skipped branches.
  - Given a Done branch whose branch result was pinned before branch
    retirement and manually merged with conflict resolution onto trunk,
    observing the later trunk head preserves both `"delivered"` and
    `"branch-result"` comparisons and file diffs when `origin` is offline,
    and repeated or later observations through the adapter retain one
    delivery and one pin pair until removal.
  - Given two Done branches observed through the adapter over an explicit
    record store, deleting or expiring one branch while its inspection
    waits settles only the survivor's delivery and pins without recreating
    the removed launch, and a store write that fails after pinning releases
    the unkept delivery pins.
- **Evaluation.** Preserve every replaced assertion. Under
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md),
  compare `doneCaptureCase.ts`, store-module, and `doneBranchObservation.ts`
  imports and calls, `HOME` stubs, and per-case time across the observation
  specs before and after at comparable load.
- **Effort hypothesis.** S–M, one plan.

<a id="decide-landings-over-typed-attempts-and-records"></a>

### Decide reported landings over typed attempts and records

**Identity:** SEED-413#decide-landings-over-typed-attempts-and-records
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/738-decide-landings-over-typed-attempts-and-records/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"99441286c7ed355fb1dd12bf6bac83ca347e482e7ecdffa43a6d7456b9a89476","plan":"9ca5006cacbd39e599c9b4b7ad2c57f798dc5d7c2c049273e9024d3ed6947b2d"}}
```

Fourth of the [Done capture import-list stories](#done-capture-import-list-analysis);
the analysis is in its addendum on delivery observation and publication.

- **Goal.** Dashboard maintainers can prove landing preparation and
  recording from composed attempts and records. The installed publisher's
  cases reach the dashboard through production's own request admission, so
  no test code repeats it.
- **Scope.** Split `handleLanding` and `submitRetainedLanding` into a typed
  decision over the submission, origin, operation, kept attempts and kept
  records that returns the receipt or refusal and the next attempts and
  records, and the adapter that persists them under the existing lock
  order. The comparison check against Git (`verifyLanding`) stays in the
  decision over its typed repository. Ref pinning and the follow-up receipt
  registration stay effects that run before any save, as today. The receipt
  ID and receipt time become inputs. Let `branchLandingContext` take its
  reporting directory and record from its caller instead of
  `machineDashboardPath` and `changeSessionRecord`. Expose the landing
  request admission (route, method, origin, body → operation and
  submission, or refusal) as a typed production function that
  `submitLanding` uses, and make the publisher bridge in
  `installedPublisher.ts` delegate to it. Let the landing adapter take its
  attempt and record stores as an explicit collaborator, so cases hand it
  MakeMe attempts and records instead of the stores under HOME. Add MakeMe
  steps for a reporting attempt and a record with a landing context, and
  retire `aReportedIsolatedBranch`'s `replaceAttempts` call. The landing
  context file stays written by production `writeLandingContext`, because
  it is the installed publisher's real input. Keep a few
  installed-publisher cases whose topic is the publisher's retained
  comparison and retry. Move the rest to the typed
  decision. The installed-publisher specs are
  `declared-blank-launch-publication`, `declared-worktree-publication`,
  `ad-hoc-prepared-landing-done` and `ad-hoc-session-comparisons`.
- **Scope limits.** About 30 more specs reach the same handler through a
  real dashboard server: the one-shot landing, story-branch landing, landed
  CI and start-session landing specs, many through
  `startSessionLandingCapture.ts`. They stay as the adapter's regression
  gate here, and
  [the later backend families](#renovate-later-dashboard-backend-unit-test-families)
  move onto this story's typed decision.
- **Key examples.**
  - A record of a deleted reporting session refuses a landing, decided from
    composed values.
  - A prepared pair survives Done and is recorded at landing, without the
    attempt store under HOME.
  - Recording a comparison that was never prepared is refused, and a second
    prepare of the same delivery answers the first receipt, as plain values.
  - A wrong origin or route is refused by the production admission in
    the publisher's bridge.
- **Evaluation.** As in the first story, also counting
  `installedPublisher.ts`, `declaredPublisherBranch.ts` and
  `reportedIsolatedBranch.ts` lines and imports.
- **Effort hypothesis.** M, one plan.

<a id="fold-done-capture-launches-into-makeme"></a>

### Build Done capture cases from MakeMe launch steps

**Identity:** SEED-413#fold-done-capture-launches-into-makeme
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#fold-done-capture-launches-into-makeme","dependencies":[{"supplier":{"identity":"SEED-413#split-done-mark-decision-from-store","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#split-done-mark-decision-from-store"},"implementation":"Composed typed Done state for the Done capture family.","rationale":"The case preset must supply the delivered review input and timeline. Folding the present keep-and-mark setup would embed the store replay this story is meant to remove.","condition":"MakeMe can compose a Done record with captured branch or commit evidence, and the review-topic Done capture cases accept composed records.","state":"waiting"},{"supplier":{"identity":"SEED-413#split-branch-entry-proposal-from-store","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#split-branch-entry-proposal-from-store"},"implementation":"Typed branch-entry proposal and composed branch-entry preconditions.","rationale":"The declaring-launch recipe needs the delivered branch-entry value and a separate operation for cases that prove keeping it. Folding the old helper would hide the operation that the handoff cases observe.","condition":"The branch-entry proposal is callable separately from persistence, and review and publisher preconditions can be composed with a typed branch entry.","state":"waiting"},{"supplier":{"identity":"SEED-413#observe-done-deliveries-over-typed-records","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records"},"implementation":"Delivery observation over typed Done records with a separate store adapter.","rationale":"The two-branch preset supplies the delivered decision input. Reusing the ambient-store preset first would encode the store effects in the shared builder and require rebuilding it around the typed boundary.","condition":"Observation decides delivery from typed kept records with real Git inspection, and the store adapter separately owns persistence and lifecycle races.","state":"waiting"},{"supplier":{"identity":"SEED-413#decide-landings-over-typed-attempts-and-records","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records"},"implementation":"Composable landing attempts and launch records with production request admission for the installed publisher.","rationale":"Both publisher recipes must share the delivered reporting values. Composing the current machine-store setup would put staging effects or the duplicate receiver behind a new builder API.","condition":"Landing preparation and recording take typed attempts and records, MakeMe can compose their shared reporting context, and the publisher bridge uses production request admission.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/737-build-done-capture-cases-from-makeme/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b3b1c66d77ad4ac0d8c2fabeb17e8db63c72660ba88abe160c729ea62aeefe46","plan":"c1abc4a8a650d6c785a986242adbd16c19a629505b1120cfd5dba973c596bcd6"}}
```

Fifth of the [Done capture import-list stories](#split-done-mark-decision-from-store);
which records the initial analysis and the decision to fold the final typed
arrangements after the four preceding renovations.

- **Goal.** Dashboard maintainers can read a Done capture case from its
  MakeMe setup through the production entry and assertions. One scenario value
  carries the checkout, its launch record or records, and the timeline so a
  maintainer can see which work occurred during each launch.
- **Scope.**
  - Move the established Default main, blank Default main, isolated and
    declaring launch presets onto the existing launch builder. Give the
    repository builder the shared pre-launch history and use the real checkout
    fixture to materialize named worktrees, with an origin where the case
    publishes. State launch and Done times at the call site and retain the
    distinction between case work and the action under test.
  - Compose the two manually merged Done branches, the declared publisher
    branch and the reported isolated branch from those same builders. Derive
    the observed trunk from the case's source and ref. Reuse the delivered
    Done, branch-entry, observation and landing-report values. Cases that
    exercise persistence, a race, or the installed publisher keep the real
    operation and its independent observations.
  - Remove arrangements and redundant verbs from `doneCaptureCase.ts`,
    `doneBranchObservation.ts`, `declaredPublisherBranch.ts`,
    `reportedIsolatedBranch.ts`, `reportedDoneCase.ts` and the specs. Retire
    modules once their last caller moves. Keep any remaining effect in its
    existing owner and add no support wrappers. The four supplier stories
    own the production seam changes. Runtime optimization has its own story.
- **Key examples.**
  - A Default main case names its launch and Done times in MakeMe. Real work
    before, within and after those times keeps the existing inclusion and
    exclusion assertions, including a shared checkout with overlapping sessions.
  - The branch-entry spec declares the worktrees and launch facts in MakeMe.
    A dirty entry still preserves its first tree and Default main tip, review
    still reads the separate comparisons, and foreign or conflicting places
    are still refused. The spec has no local setup helpers, and any remaining
    import from `doneCaptureCase.ts` is limited to one case builder.
  - A two-branch observation case starts from dated Done records and a real
    manually merged trunk; it keeps the existing delivery, retry and removal
    assertions. A publisher case starts from the matching launch, attempt
    and context and keeps the distinct branch and delivered comparisons,
    including across retirement and exact retry.
- **Evaluation.** Compare support imports and named bindings per affected
  spec, and lines in the affected specs and support, including builders that
  receive moved setup. Rebase the comparison on the delivered supplier state.
  Fewer support verbs and visible scenario facts with every assertion preserved
  are the gain, with any added lines counted in the trade-off.
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
- **Effort hypothesis.** S–M, one plan.

<a id="optimize-done-capture-family-cases"></a>

### Bring the Done capture family's cases to 100–200 ms

**Identity:** SEED-413#optimize-done-capture-family-cases
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#optimize-done-capture-family-cases","dependencies":[{"supplier":{"identity":"SEED-413#split-done-mark-decision-from-store","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#split-done-mark-decision-from-store"},"implementation":"Typed Done transition, Git branch-result capture, and review cases composed from Done state.","rationale":"Profiling the old review setup would measure machine-store writes and Done replay that this story removes.","condition":"The typed Done transition and Git capture are separate from the store adapter, and review-topic cases use composed Done records without replaying the store-backed Done action.","state":"waiting"},{"supplier":{"identity":"SEED-413#split-branch-entry-proposal-from-store","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#split-branch-entry-proposal-from-store"},"implementation":"Typed branch-entry proposal, production pin-ref query, and review cases composed from branch-entry state.","rationale":"The optimization needs to measure the branch-entry setup that remains after repeated store-backed entry actions are removed from review cases.","condition":"Branch-entry proposals are separate from persistence, the session pin-ref query is available, and cases where branch entry is a precondition use composed branch-entry state.","state":"waiting"},{"supplier":{"identity":"SEED-413#fold-done-capture-launches-into-makeme","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#fold-done-capture-launches-into-makeme"},"implementation":"Done capture launch cases built through domain-named MakeMe steps.","rationale":"The launch arrangement changes the setup that the optimization measures, so the remaining costs need to be established with the delivered builders.","condition":"The Done capture cases use MakeMe launch and repository steps, with the checkout, record, and timeline carried by one case object.","state":"waiting"},{"supplier":{"identity":"SEED-413#observe-done-deliveries-over-typed-records","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records"},"implementation":"Typed delivery-observation decision over composed Done records, with the store adapter alone saving deliveries and pins.","rationale":"Profiling the observation cases before the split would measure machine-store reads and writes in a stubbed HOME that this story removes.","condition":"Delivery observation decides from typed kept records separately from its store adapter, and observation cases other than the adapter's races use composed records.","state":"waiting"},{"supplier":{"identity":"SEED-413#decide-landings-over-typed-attempts-and-records","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records"},"implementation":"Typed landing decision over composed attempts and records, production landing request admission, and the publisher bridge delegating to it.","rationale":"Profiling the publication cases before the split would measure attempt and record store writes and the test-side receiver that this story removes.","condition":"Landing preparation and recording decide from typed attempts and records separately from their store adapter, the landing request admission is a production function, and only the publisher-topic cases run the installed publisher.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

Follows the closed SEED-413#arrange-done-ad-hoc-observation-and-publication
(plan recoverable at
`0f1fe2cdd:.planning/slice-plans/730-arrange-done-ad-hoc-observation-and-publication/PLAN.md`),
which made its ten cases plain Vitest, about twice as fast as their
Playwright versions.
Queued after the five [Done capture import-list stories](#split-done-mark-decision-from-store),
which move most of the family off the machine store and the replayed
actions. Profile what remains after them. The Git binary finding below
does not depend on them.

- **Goal.** Dashboard maintainers get Done capture proof that runs at about
  100–200 ms per case and passes reliably under local load. The family's
  cases now take about 1–2 s each at load 6–12 and 3–5 s at load 14–16. Under
  Vitest's 5 s default, two or three of them time out at that load. Hosted CI
  runs them in under 1 s.
- **Measured on 2026-11-20 at `78778ad74`** (trunk's 21 specs and 65 cases
  that import `doneCaptureCase.ts`, macOS, `--workers=2`, load 12–19 from
  other sessions).
  - Each case starts about 41 Git processes (2,685 for the family, counted
    with `GIT_TRACE2_EVENT`). Git itself runs about 7 ms in each. The most
    frequent are `rev-parse` (579), `rev-list` (250), `update-ref` (214),
    `add` (195), `cat-file` (175) and `commit` (148). `push`, `clone` and
    `pull` are few and take 73–87 ms each.
  - `git` resolves to `/usr/bin/git`, Apple's `xcrun` launcher. Starting it
    from Node took 36 ms at load 15, against 7 ms for the binary it runs
    (`xcrun -f git`) and 4 ms for `/usr/bin/true`. Linux has no launcher,
    which fits the hosted CI times.
  - With that binary's directory first on `PATH`, two interleaved pairs of
    family runs summed 54.7 s and 26.3 s of case time, against 70.1 s and
    109.1 s unchanged. Cases of 2 s or more fell from 7 and 23 to 3 and 0.
    The second unchanged run timed one case out at 5 s. At load 12–14 the
    median case was 357 ms and 20 of 65 cases ran within 200 ms.
  - That directory also holds `python3`, `make` and `clang`, so putting it
    first on `PATH` changes more than Git. A private directory holding one
    `git` script that runs the binary gave 61.6 s and 58.5 s against 67.9 s
    unchanged: the extra shell start spends most of the saving. A symbolic
    link starts as fast as the binary, but Git then looks for its templates
    under `/Applications/Xcode.app` and warns on `init`.
  - Load moved between runs and the same arrangement varied twofold, so a
    duration at a named load does not reproduce. The count of Git processes
    per case does.
- **Scope.**
  - On macOS the family's cases run the Git binary directly, resolved once
    per run. Where `git` is already another binary, and on Linux, nothing
    changes. How the binary is reached is the open decision below.
  - Cut the Git processes each case starts, in the family's support and in
    production seams that start more than their answer needs. The family is
    the Git-heavy Done capture cases under `dashboard/backend-tests/review/`
    and `dashboard/backend-tests/launches/`, with their shared support:
    `doneCaptureCase.ts`, `doneCaptureReview.ts`, `doneBranchObservation.ts`,
    `declaredBranchCase.ts`, `declaredPublisherBranch.ts`,
    `installedPublisher.ts`, `reportedIsolatedBranch.ts` and
    `adHocBranchRefs.ts`, as the five import-list stories leave them. Profile per case first: checkout creation, checkout
    work, production Done capture, observation and review reads.
  - Keep the Git that developers run, the production handlers and every
    assertion. The proof is of Git's own behavior (reflog times, merges,
    worktrees, pins), so a Git library in the test process does not replace
    it. Raising timeouts is out of scope.
- **Open decision (Terry).** Which owner reaches the binary. Slice planning
  waits for it.
  - *The Git runners resolve it* (recommended). `dashboard/server/gitRunner.ts`
    and the installed `publication-git.mjs` start the binary `xcrun -f git`
    names when `git` is the launcher. Tests and a developer's own dashboard
    both save the launcher on every Git call, and no other tool's
    resolution changes. It changes shipped code in two places.
  - *The test environment puts the binary's directory first on `PATH`.* No
    product change, and the family gets the measured saving. Every check
    then also takes `python3`, `make` and `clang` from that directory.
  - *Fewer processes only.* No change to how Git starts. The family keeps
    the launcher's cost on each remaining call.
- **Alternatives considered.**
  - *Run the binary directly* (first, by the owner decided below). Measured
    above and independent of the earlier stories. On its own it leaves the
    median case near 350 ms under load.
  - *Fewer processes per case* (chosen second). Build a checkout's history in
    fewer calls, and answer several production reads from one call. The
    saving is whatever the per-case profile shows. Each change is judged by
    the process count.
  - *One built checkout copied per case*, as a machine image is cloned for
    each instance. The image is the materialized base history and the
    instance is a case's checkout. Git stores absolute paths for worktrees
    and the origin, so a copy fits only checkouts with neither. A candidate
    for those cases, to be judged by the profile.
  - *One long-lived `git cat-file --batch` process for reads*, as a
    connection pool reuses one connection. It serves object reads only and
    adds a process lifetime to the production server. Not pursued in this
    story.
- **Key examples.**
  - On macOS a family run starts Git without the launcher. Its cases pass
    with their assertions unchanged.
  - A Done branch capture with a real merge and a typed review read finishes
    within about 200 ms at low load.
  - At load 15 or more, the family passes several runs in a row at
    `--workers=2` with no timeout.
  - A case whose topic is the review of an already Done session starts no
    more Git processes than its real commits and its review reads need.
- **Evaluation.** Use [`dough-test-optimization`](../../.claude/skills/dough-test-optimization/SKILL.md)
  and the [`done-capture-family-timeout-margin`](../TEST-OPTIMIZATION-CANDIDATES.md#done-capture-family-timeout-margin)
  candidate. Count Git processes per case before and after with
  `GIT_TRACE2_EVENT`. Compare per-case durations in interleaved runs of the
  family before and after, at the same worker count, and record the load of
  each, under
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
  If 100–200 ms is not reachable, report the measured floor and the Git
  processes that remain for each case. Explain why they cannot be removed
  without losing protection, and give the margin the family reaches instead.
- **Architecture.** Choosing the Git binary is a new responsibility under
  either of the first two options. No Accepted ADR covers it. In the runners
  it has two owners, one per runner, each resolving once per process. In the
  test environment it has three entries to reach: `scripts/test-environment.bash`
  for shell checks, and the Playwright and Vitest configurations of the
  dashboard groups.

<a id="renovate-later-dashboard-backend-unit-test-families"></a>

### Renovate the later dashboard backend unit-test families around typed server handlers

**Identity:** SEED-413#renovate-later-dashboard-backend-unit-test-families
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Split from `SEED-413#renovate-remaining-dashboard-backend-unit-tests`, which
kept the [completed Done capture family](https://github.com/terryyin/open-dough/blob/8f4cc9480ccb0b736e3b29c787ab49a6ac80d366/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-remaining-dashboard-backend-unit-tests).

- **For / why.** Developers changing `dashboard/server/` get fast,
  compile-time-checked unit tests for every remaining family: plain Node
  Vitest cases that call strongly typed handlers directly with MakeMe domain
  state and real Git and file collaborators. The campaign ends when
  `dashboard/backend.playwright.config.ts` and the backend request and server
  wrappers in `dashboard/test-support/` are deleted.
- **Evaluation.** Split one family at a time when it is reached, each sized
  to one plan. A family is the cases that share a typed handler and its
  arrangement; a feature folder holds several (`review/` alone holds seven).
  For each family:
  - Keep wire transport thin over exported strongly typed handlers sharing
    one typed contract with `dashboard/src/`. At planning, name the production
    entry and the data and collaborators each variant uses. Unit cases
    [call that entry directly](../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability)
    with those inputs. Resolve request context and process-wide state in the
    adapter. Keep each domain shape on its MakeMe builder.
  - Give each behavior one owner. Move single-service cases to plain Node
    Vitest through the handlers. Downgrade a wire check to a unit case of
    the adapter's request admission with typed request values. Upgrade it to
    an `e2e/` journey only when a started server is essential. Drop a case
    another group already owns. No case in this collection starts a server,
    mounts a boundary or runs on Playwright.
  - State arrangement through MakeMe. Driving a launch to arrange a review
    costs 6–13 s per case in CI against about 1 s from kept records, so the
    handler seam alone leaves most of a launch-arranged family's time in
    place.
  - Delete retired `dashboard/test-support/` wrappers, add none, and leave no
    behavioral regression gap.
- **Revisit the completed Story Notes pilot.** The
  [handler](../../dashboard/server/storyNotes.ts) chooses its file through the
  machine home, so the [unit test suite](../../dashboard/backend-tests/review/story-notes.spec.ts)
  changes `process.env.HOME` for every case. Let the production caller bind the
  default notes store and the suite supply its own temporary notes file or
  file-backed store explicitly. Run the existing persistence, isolation and
  unreadable-file cases against real files with the process home untouched.
  Its request admission is already a unit case (`story-notes-request.spec.ts`).
- **Order.** Highest CI seconds first among the families whose seam the
  earlier ones have shown, as a railway converts its busiest lines first
  while both gauges run. The count of specs still on `@playwright/test` is
  the campaign's progress, and the two-engine group run is its carrying cost
  until that count is zero.
  1. The rest of ad hoc review, which retires `adHocReview.ts`. The branch
     result, its handoff, the Done lifecycle, kept-record release, delivery
     observation and publication already run on Vitest. "A newer quiet
     Done takes precedence over a manual mark still capturing
     its branch" stays here, with the developer's native Done in
     `sessions/`. So does the launch-input wiring case of
     `ad-hoc-session-branch-handoff.spec.ts`.
  2. `intent/` landed CI, resolving the load sensitivity of `SEED-324` and
     `SEED-319`. Preserve freshness, invalidation, and close behavior when
     moving reads to typed handler inputs. Check whether those inputs can
     replace the module-level memos in `followUpStory.ts`, `ciProofArtifact.ts`,
     `ciAdapterProof.ts` and `baseCiGithubRevisionLookup.ts`. Give any cache
     the production path still needs an explicit lifecycle owner. The earlier
     analysis includes `LandedCiCollection.close()` (recoverable at
     `6c628be4a:.planning/slice-plans/715-default-dashboard-backend-checks-to-the-mounted-boundary/PLAN.md`).
  3. The remaining families by CI seconds.
- **Family map** (2026-11-19; CI medians over five main runs, 555 files,
  2,519 s; entry kinds counted from each spec's text, so approximate).

  | Folder | Files | CI s | Through a server | Separate process | Direct or no server | Uses a page |
  | --- | ---: | ---: | ---: | ---: | ---: | ---: |
  | `launches/` | 104 | 445 | 59 | 15 | 27 | 3 |
  | `review/` | 64 | 429 | 44 | 11 | 8 | 1 |
  | `intent/` | 110 | 411 | 40 | 13 | 55 | 2 |
  | `usage-history/` | 70 | 349 | 0 | 0 | 70 | 0 |
  | `sessions/` | 76 | 336 | 46 | 11 | 19 | 0 |
  | `observation/` | 56 | 262 | 33 | 15 | 4 | 4 |
  | `runtime/` | 43 | 221 | 6 | 3 | 26 | 8 |
  | `terminals/` | 18 | 48 | 11 | 0 | 7 | 0 |
  | `configuration/` | 14 | 18 | 9 | 0 | 5 | 0 |

  - `usage-history/` already calls server modules directly; its work is the
    engine change and its 349 s is spent below any wire.
  - `runtime/` proves the test runtime itself, including the Playwright
    runners. Those cases retire with the runner they prove; the rest change
    engine.
  - About 68 specs need a separate server process (a signal, a restart, a
    preload, a held connection). Each is downgraded to a unit case of the
    behavior beneath it or, when the process itself is essential, upgraded
    to an `e2e/` journey. None stays in this collection.
  - The 18 specs that open a page belong to `dashboard/frontend-tests/` or
    `e2e/`.
  - 43 of the 445 files in `dashboard/server/` import `node:http` types; the
    domain beneath them is already typed (`AgentLaunches`, the review
    answers), so most seams are an export and a split admission.
- **Alternatives considered.** Changing every spec's engine first while it
  keeps its HTTP entry would retire Playwright early, yet it rebuilds the
  worker fixtures as new test support, gains no speed and touches the suite
  twice. Calling handlers from the Playwright specs first keeps Playwright in
  the group and also touches the suite twice.
- **Effort hypothesis.** L across the suite, as family-sized stories.
- **Safe stopping point.** Every completed family stands on its own with
  faster checks, compile-time contract safety, and fewer `test-support`
  files.

<a id="mount-story-review-diff-reading"></a>

### Read a story review's diff emphasis and syntax in mounted cases

**Identity:** SEED-413#mount-story-review-diff-reading
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/741-mount-story-review-diff-reading/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6b61bb0feff5a1c7183a2af4b33f0ce6b94f04dd0c128d8e666d27feb173286e","plan":"221cde97428f7f03963f8b2c02cd706a22ba0138ada717da387adb470a80f516"}}
```

Split from `SEED-413#renovate-later-dashboard-frontend-unit-test-families`
on 2026-11-20 as the first Review piece, queued ahead of the remaining
families. It follows the
[experience from the completed frontend families](#experience-from-the-completed-frontend-families).

- **Goal.** Dashboard developers read the proof of how a reviewed file's
  diff shows changed words and styles its code as plain Vitest cases on
  mounted Chromium, built from a printed diff and the file's two texts.
  Today 22 built-app cases in eight `story-review-diff-*` specs load
  `<App />`, publish a reviewed story, open its review and choose a file
  before the first assertion (54.5 summed seconds, about 2.5 s a case, in CI
  run 44741808717). Review is the costliest folder per case after
  Navigation, and this is its part with the narrowest owner.
- **Scope.** Move every case whose behavior the diff's own rendering owns.
  Two owners carry them:
  - [`DiffLines`](../../dashboard/src/StoryReviewDiffLines.tsx) already
    renders from typed inputs (`printed`, `sides`, `lineTokens`). It owns
    word emphasis, revealed context, the reading position and the open line
    menu.
  - The styled reading of one file does not stand alone today.
    [`FileDiff`](../../dashboard/src/StoryReviewFileDiff.tsx) joins it to two
    service reads, story notes, Follow up and the page's launches. Extract
    the part that turns a path, a printed diff, the file's text and an
    optional `syntax` hint into styled lines, and leave the reads, notes and
    Follow up in `FileDiff`. The extracted component owns the grammar a path
    or hint selects, each side's tokens and the plain reading before text
    arrives.
  - Cases build their inputs as typed values: a printed unified diff, a
    `ReviewedFileText` and, where a case observes tokens arriving, the
    tokens the production `highlightSourceLines` gives for that text. They
    add zero test-support wrappers and no service substitute. Page objects
    for the diff's lines, marks and tokens live beside the specs.
  - Preserve each distinct assertion, including the copied text of an
    emphasized block, token and underline contrast in light and dark, and
    the unchanged reading position when styling arrives. Name each built-app
    case this story retires and the mounted case that carries its
    assertions.
  - Retire each `dashboard/test-support/` export or module whose last
    consumer moves, and keep the ones the remaining review specs and E2E
    still use.
  - **Scope limits.** These stay built-app cases in the parent story,
    because their behavior belongs to an owner above the diff's rendering:
    the Retry that reads a file's text again; a grammar module that fails to
    load; which Intent settings revision supplies a hint, for a live review
    and for a published Done review; and the comparison of a diff token with
    Intent's source reading of the same code. The other thirteen
    `story-review-*` specs, the full-group timing comparison and the
    `frontendApp.ts` retirement also stay there. This story compares the
    focused selection before and after.
- **Key examples.**
  - *A changed word.* A diff replaces `const limit = 20;` with
    `const limit = 25;` in a `.txt` file. The removed line marks `20` as a
    deletion and the added line marks `25` as an insertion, both underlined
    and never struck through. The unchanged line has no mark. Selecting both
    lines copies `-const limit = 20;` and `+const limit = 25;`.
  - *No emphasis where it would mislead.* A pure addition, a revealed
    context line, a low-similarity rewrite and a several-hundred-line block
    show no marks. A small block beside the large one still marks `20` and
    `25`.
  - *Each side styles from its own whole text.* In a TypeScript diff a
    removed line takes its tokens from the old text and every other line,
    revealed context included, from the new text. Markers, line numbers and
    added and removed backgrounds stay as the plain diff shows them.
  - *The path chooses the grammar, then the hint.* Each supported extension
    styles its keyword as a token. A renamed file follows its new path. A
    path that names no grammar reads plain, takes a known `syntax` hint, and
    stays plain under an unfamiliar one. A path's own grammar wins over a
    hint.
  - *Styling arrives in place.* The diff shows complete plain lines with its
    marks before the file's text is given. Once the text is given the same
    lines gain tokens, the marks stay on the same words, and the reading
    position, revealed context and an open line menu are kept.
  - *Readable in both appearances.* Under dark and light, tokens inside an
    insertion or deletion read at 4.5:1 on the line's tint and the underline
    at 3:1 against it, and the colours differ between the two appearances.
- **Effort hypothesis.** M: about eighteen cases over two typed owners, one
  small extraction, six slices.
- **Plan.** [741](../slice-plans/741-mount-story-review-diff-reading/PLAN.md)

<a id="mount-usage-token-index-reading"></a>

### Read the Usage Token index's selections and refreshes in mounted cases

**Identity:** SEED-413#mount-usage-token-index-reading
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/740-mount-usage-token-index-reading/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"927017454805fd1d73b5ffeedea5c6b0bcf94aa11d923573f2f20bb718e6a77b","plan":"6014f4a65be3cb63f32e562f77dffd8358c2e5eb34d41575e322a4526f4bc3d7"}}
```

Split from `SEED-413#renovate-later-dashboard-frontend-unit-test-families`
on 2026-11-20 as the first Configuration piece, queued ahead of the remaining
families. It follows the
[experience from the completed frontend families](#experience-from-the-completed-frontend-families).

- **Goal.** Dashboard developers read the proof of what System settings →
  Usage shows for a selection, a period and a Refresh as plain Vitest cases
  on mounted Chromium, with each tool's Token index answer given as a typed
  reply. Today these cases load `<App />` on the settings view, open Usage
  and answer `/__usage/token-index` through page routes (13 cases in six
  specs, 16.0 summed seconds in CI run 44741808717). The typed source this
  story adds is also what the 20 chart cases left in the parent story need.
- **Scope.** Move the six specs whose behavior is what Usage reads and
  when: `system-settings-usage`, `-period`, `-estimate`, `-selection`,
  `-checking` and `-tool`.
  - [`SystemSettingsUsage`](../../dashboard/src/SystemSettingsUsage.tsx)
    reads each tool's answer and posts Refresh through `fetch`. Give it a
    typed usage source behind
    [`useUsageAnswers`](../../dashboard/src/useUsageAnswers.ts), as Story
    Notes reads through `storyNotesState(source)`: one read of a cohort and
    period that honours its abort signal, and one refresh. The page supplies
    the source that speaks to the two endpoints and keeps their refusal
    wording. A case supplies replies of the shared
    [`TokenIndexAnswer`](../../dashboard/src/usageTokenIndex.ts) contract.
  - Build answers with `makeMe.aTokenIndexAnswer`, offered through the
    page-loadable MakeMe entry. A case that observes a pending read or
    Refresh holds its own deferred reply.
  - Operate Usage through small page objects beside the specs. The existing
    Playwright page objects stay with the four
    `e2e/configuration/system-settings-usage*` journeys, which keep proving
    the real store, filters and Refresh.
  - Preserve each distinct assertion. Remove a case only where an E2E
    journey already proves the same thing, and name that journey.
  - **Scope limits.** The five chart specs (`-average`, `-compare`,
    `-legend`, `-overflow`, `-spacing`, 20 cases) stay in the parent story
    with their pointer, touch and geometry proof. So do the other eight
    Configuration specs, the full-group timing comparison and the
    `frontendApp.ts` retirement. This story compares the focused selection
    before and after.
- **Key examples.**
  - *A cohort's trend.* Codex answers ten eligible tasks with a rolling
    median of 1,450. Usage shows the cohort note `10 tasks · Last 30 days`,
    ten points and the median `1,450`.
  - *An empty cohort.* The reader chooses the Refinement workflow and its
    answer has no tasks. Usage reads `0 tasks · Last 30 days` and
    `No finished task matches in the last 30 days.`, with no old median.
  - *A failure belongs to its read.* Claude Code's read fails and Usage
    names it: `Claude Code: Usage could not be read.` The reader hides and
    shows Claude Code again, the read answers, and the failure is gone.
  - *A late answer for a selection already left.* Claude Code's answer is
    held, the reader hides Claude Code, and the answer is released. Usage
    shows Codex alone.
  - *Refresh keeps what is shown.* While a Refresh is pending Usage keeps
    the trend, says `Checking for new usage…` and disables Refresh until the
    selection has been read again. A Refresh that fails keeps the trend and
    its check time beside the error.
  - *An invalid period.* Under New York time the first read asks for the
    last 30 local calendar days. The reader types `0`, `1.5` or `abc`. The
    field reads invalid with `Enter a positive whole number of days. Showing
    the last 30 days.`, the trend stays and nothing is read again.
- **Effort hypothesis.** M: thirteen cases over one owner, one typed source
  and new page objects, five slices.
- **Plan.** [740](../slice-plans/740-mount-usage-token-index-reading/PLAN.md)

<a id="renovate-later-dashboard-frontend-unit-test-families"></a>

### Renovate the later dashboard frontend unit-test families

**Identity:** SEED-413#renovate-later-dashboard-frontend-unit-test-families
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Split from `SEED-413#renovate-remaining-dashboard-frontend-unit-tests`, which
moved the Project Intent apply-and-retry cases. The two Optimization
Candidates revision cases already run as mounted cases in
[`intent-candidates-revision.spec.ts`](../../dashboard/frontend-tests/intent/intent-candidates-revision.spec.ts).
Two pieces are split out and queued ahead of this story:
[the story review's diff reading](#mount-story-review-diff-reading) and
[the Usage Token index's selections and refreshes](#mount-usage-token-index-reading).

**Goal.** Give dashboard developers readable UI unit tests and feedback from
the complete frontend group in roughly a minute at the usual two workers,
including preparation. This carries the suite-wide commitments, including
SEED-404's timing goal and SEED-301's Intent MakeMe work.

**Scope and order.** Select families by feature folder and the interaction
each view owns. The Optimization Candidates and open Sessions sidebar
families have landed as mounted Vitest Chromium proof.
Split the next piece by the rendered owner whose cases it moves, sized by the
[experience below](#experience-from-the-completed-frontend-families), and
choose it by the seconds it removes for the production change it needs, read
from the [current state](#frontend-group-state-after-seven-families). Prefer
an owner that already takes typed inputs, then one small extraction or one
typed source behind a hook. Continue with the Usage chart cases, the rest of
Review, Intent and Sessions. Leave Navigation's frame, board and URL cases
until an audit has separated what a mounted board owner can prove from what
needs a real page load or belongs in E2E. Use
the completed
[Project Intent revision family](#project-intent-revision-family-example)
as the reference for the remaining migrations. Keep each legacy case until
its replacement exercises its actual boundary.
Use shared typed Intent inputs in place of `putFrontend*` project arrangements;
coordinate session proof with [SEED-341](SEED-341-simplify-session-tests.md).
The family map includes Navigation, Launches, Review, Configuration, Terminals,
the Stories cases left by the pilot, and the audit of the four test-harness
specs. The root contains no product specs. Reassess the order by measured
cost and which shared contracts are available as families finish.

- Mount the smallest rendered owner with typed inputs. Keep an enclosing view
  when its children coordinate. Its unit test suite should be able to
  [render that view](../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability)
  without preparing answers for unrelated dashboard features. Use the
  backend's existing shared contract where coupled. Preserve distinct assertions and remove a duplicate only
  after locating its equivalent proof. For example, reloading an encoded story
  URL and traversing Back and Forward needs a real E2E browser journey.
  Account for the cost of any checks moved there.
- Render and act in each moved case as soon as the page allows, under
  [Which entry a case uses](../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and the [North Star](../NORTH-STAR.md#act-as-soon-as-the-page-allows-retire-actsettled).
  Remove `actSettled`, React `act` wrapping and `IS_REACT_ACT_ENVIRONMENT`
  from the mounted families already moved (Story Notes, Project CI history,
  the phone board) when the family is next touched. Retire
  `mountedActSettled.ts` and its harness case with `mountedDashboard.ts`.
  When migrating the built-app `intent-read-recovery` and
  `intent-gherkin-settings-problems` specs, replace handwritten locations
  responses with `makeMe.anIntentLocationsAnswer`, and retire the unread
  `locationsRequest` export in `intentReadRecoveryPage.ts`.
- When an Intent family reuses
  [`intent-candidates-publication.ts`](../../dashboard/frontend-tests/intent/intent-candidates-publication.ts),
  mount the production `IntentPageProviders` there instead of re-composing
  the mode and reading providers.
- Retire a feature's app mount, route substitutes and page-object scaffolding
  when their last consumers move. For example, `frontendIntentCi.ts` still
  uses `serveFrontendCiHistory` after Project CI history migrates. Add zero
  new wrappers. Audit harness cases against the product behavior they protect
  before retiring machinery whose only checks exercise the harness itself.
- At the last frontend migration retire `frontend.playwright.config.ts`,
  frontend dual-engine dispatch and its
  dedicated selection/output glue, `frontendApp.ts`, `mountedDashboard.ts`,
  `frontendServiceSubstitutes.ts` and spent `frontend*Rule.ts` modules.
  Preserve shared runner behavior still used by the backend, the frontend npm
  command, filtering, listing, worker budget, shards, timings and CI proof.
  `@playwright/test` remains the E2E runner. The frontend group runs entirely
  on plain Vitest with headless Chromium.
- Finish by comparing a full two-worker run against the baseline below and
  checking the surviving behavior and support surface. A fast filtered run
  already helps one developer on one family. It cannot measure the cost of
  the full group. Each completed family delivers usable feedback on its own.
  Effort L across families, to be refined as each one is reached.

#### Project Intent revision family example

All nine cases in the six `intent-revision-*.spec.ts` files now use mounted
Chromium (`def2a68c3)). The [fixture](../../dashboard/frontend-tests/intent/intent-revision-fixtures.ts)
mounts the real `ProjectIntentReading` with the production reading place and
typed locations and file replies. Reopen and project-switch cases exercise that
reading place. Deferred replies live in the cases that need to observe a
pending read.

The [failed-update case](../../dashboard/frontend-tests/intent/intent-revision-update-failures.spec.ts)
keeps one file switch to prove the old tree stays usable, then verifies that
the notice's Retry loads the new revision and its source. The
[source-target recovery cases](../../dashboard/frontend-tests/intent/intent-source-target-recovery-mounted.spec.ts) own the
separate file Retry across revisions. The [Project Intent visit E2E](../../e2e/intent/intent-project-visit-ci.spec.ts)
proves **Show latest** advances the revision through the composed dashboard.

On 2026-11-20, three interleaved warm runs of
`npm run test:dashboard:frontend -- intent/intent-revision --workers=2`
at `b21c3231b` and the equivalent tested candidate `868250005` gave median
command elapsed times of 6.20 s and 3.49 s. The failed-update case took 519 ms
and 361 ms. The simpler Show latest case had overlapping timing ranges. The
focused selection measures the benefit of removing the last built-app cases
from that command. The full-group goal still needs a full-group measurement.

#### Rework from the completed frontend families

- **Story Notes control.** The [mounted control suite](../../dashboard/frontend-tests/stories/story-notes-control.spec.ts)
  builds a page-wide project map and passes the project key again to render
  one story's control. Have the production page resolve the project's shared
  notes state and let the suite render the same control with that state
  explicitly. Keep the refresh and late-read-after-save cases on the real
  subscribed state. The dialog already renders from notes and callbacks.
- **Project CI history.** [JudgedBranch](../../dashboard/src/IntentCiJudgedBranch.tsx)
  requires the judgment hook's refresh `round` for rendering. The evidence
  reader uses that field and the panel never reads it. Narrow the panel's
  typed input so its suite can omit the round. Move the seven gap rows,
  run links, keyboard traversal within the
  history, and phone overflow proof in the [gap-only case](../../dashboard/frontend-tests/intent/intent-ci-wall-time-history-gaps.spec.ts)
  to the history-only mount already demonstrated by the
  [evidence suite](../../dashboard/frontend-tests/intent/intent-ci-wall-time-history-evidence.spec.ts).
  It should need only the history reading. Keep the [panel cases](../../dashboard/frontend-tests/intent/intent-ci-wall-time-history.spec.ts)
  that prove judgment and Proof beside history, including keyboard movement
  from **Check again** to **Builds and evidence**.

#### Experience from the completed frontend families

Seven frontend stories closed between 2026-11-19 and 2026-11-20: Story Notes,
Project CI history, the Project Intent revision cases, the Show latest file
reads, the two Optimization Candidates stories and the open Sessions sidebar.
Their plans are in Git history (720, 722, 724, 728, 729, 733 and the Sessions
sidebar plan).

- **Size.** Two cases on an existing fixture took two slices and about 40
  minutes from Take to Close. Twelve cases with new page objects, or five
  cases with an extraction, took five to seven slices and about two hours.
  Split a piece at about a dozen to twenty cases over one or two owners.
- **What made a family cheap.** The owner already took typed props (Project
  CI history needed no production change), or an earlier story had left the
  fixture and typed reply (Show latest file reads, candidates revision).
- **What made a family expensive.** The first owner chosen dragged in
  unrelated providers. The Project Intent revision cases first mounted
  `IntentPerspective` with story selection, CI reads and workspaces, then
  needed `ProjectIntentReading` extracted and two more slices. Choose the
  owner by what the cases observe and read its hooks and contexts before
  sizing.
- **Production changes that recur.** A typed source behind the reading hook
  (`storyNotesState(source)`, `readCandidates` on `IntentReadSource`). An
  extracted owner (`ProjectIntentReading`, the open Sessions list). A
  component importing its own stylesheet. A module that pulls Node code
  cannot load in the page.
- **Acting and waiting.** Render and act directly and wait through retrying
  assertions. Removing `actSettled` cut the revision cases from 7.16 s to
  5.75 s. A deferred reply belongs to the case that observes the pending
  read. Answer the first read before expecting what follows it, and wait one
  task before asserting that a late answer changed nothing, or the case
  passes with its guard broken.
- **State that outlives a case.** Read caches keyed by repository, revision
  and path need a new revision per case. Keep readers on one fake clock. A
  component declared inline in a case remounts and loses its state.
- **The mounted page differs from the built app's.** It has touch, so
  desktop disclosure needs a fine pointer set through CDP. Colour scheme and
  time zone are also set through CDP. `makeMe.mjs` cannot load in the page:
  expose the Node-free builder on `pageMakeMe.mjs`.
- **Measuring.** A scratch probe understates delivered time (2.07 s probed
  became 7–8 s). Summed case time can rise while the command gets faster.
  Compare the focused command's elapsed time over interleaved runs, and keep
  the full-group comparison for the end. A selection mixing both engines
  runs only the Vitest specs, so run a built-app spec alone for its
  baseline.
- **Proof that slipped.** Two stories dropped an assertion while moving
  cases (focus after delete, no reread after 70 s) and restored it in a
  later slice. Name each retired case and the mounted case that carries
  each of its assertions before deleting it.
- **Support.** Each story retired the support whose last consumer moved,
  and none could retire a module that E2E or another family still used.
  Steps already owned by an E2E journey (the revision check pace, host
  status cadence) were dropped with that journey named.

#### Frontend group state after seven families

CI run 44741808717 at `93235af49` (2026-11-20) recorded 758 cases and 1,252
summed seconds. The 85 mounted Vitest cases in 32 specs took 24.0 s. The 123
cases in 42 `pageTest.ts` specs took 62.3 s. The 550 built-app cases in 237
specs took 1,165.7 s, 93% of the time.

| Folder | Built-app specs | Cases | CI summed seconds | Seconds per case |
| --- | ---: | ---: | ---: | ---: |
| Navigation | 47 | 116 | 330.1 | 2.8 |
| Intent | 59 | 107 | 248.8 | 2.3 |
| Sessions | 42 | 92 | 154.8 | 1.7 |
| Launches | 29 | 81 | 124.1 | 1.5 |
| Review | 21 | 47 | 119.9 | 2.6 |
| Configuration | 19 | 49 | 87.5 | 1.8 |
| Terminals | 12 | 41 | 71.8 | 1.8 |
| Stories | 8 | 17 | 28.7 | 1.7 |

Mounted cases average 34 ms in Stories and 73 ms in Sessions, and 605 ms in
Intent, where `ProjectIntentReading` is the owner. At 758 cases the
one-minute goal at two workers allows about 150 ms a case. Moving every case
onto Vitest reaches the engine goal and can still miss the minute, so each
piece prefers the narrowest owner and records its mounted time per case.

#### Frontend campaign baseline

At `267a27502` there are 304 frontend spec files, including nine
`.mounted.spec.ts` files. The root holds no specs. The CI proof also names
five Intent modules that register cases for other spec files. The frontend
sources match the measured revision. Summed case time identifies expensive
families. The campaign's roughly one-minute goal is elapsed time for the
complete local group at two workers, including preparation.
[CI run 44503789713, attempt 1, frontend-test-proof artifact](https://github.com/terryyin/open-dough/actions/runs/44503789713/artifacts/14518967274)

| Folder | Specs | Cases | CI summed seconds | Local summed seconds |
| --- | ---: | ---: | ---: | ---: |
| Intent | 110 | 249 | 321.3 | 214.2 |
| Navigation | 49 | 123 | 282.4 | 212.3 |
| Sessions | 46 | 97 | 164.2 | 108.4 |
| Launches | 29 | 81 | 125.6 | 74.7 |
| Review | 21 | 47 | 98.7 | 75.8 |
| Configuration | 19 | 49 | 95.0 | 64.1 |
| Terminals | 12 | 41 | 81.4 | 58.4 |
| Stories, including the Story Notes pilot | 14 | 28 | 34.2 | 26.3 |
| Test harness | 4 | 16 | 4.2 | 3.6 |

The local baseline on 2026-11-19 at `267a27502` was **7 min 15 s** for
the complete command. All 731 cases passed on the first attempt (837.8
summed case-seconds). This was one run after focused checks in this
worktree, using `caffeinate -s -i npm run test:dashboard:frontend -- --workers=2`
on AC power. Natural one-minute load was 5.83 at start and 4.80 at finish.

A scratch experiment in this checkout ran 24 copies of one history-render
case at two workers. It took 3.63 s wall in separate files and 2.32 s together.
This establishes a file cost for that component. Measure the full group to
judge the campaign outcome.
