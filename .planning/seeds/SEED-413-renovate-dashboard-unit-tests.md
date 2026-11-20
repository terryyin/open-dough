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
SEED-413#split-done-mark-decision-from-store, is done; the others are
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

<a id="restore-done-capture-proof-after-composed-reviews"></a>

### Restore Done capture proof after the composed review move

**Identity:** SEED-413#restore-done-capture-proof-after-composed-reviews
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/743-restore-done-capture-proof-after-composed-reviews/PLAN.md"}
```

Correction from the execution retrospective of
SEED-413#split-done-mark-decision-from-store (story at
`6250b7399:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md`).

- **Goal.** Dashboard maintainers again have a failing test when Done's
  capture or adapter stops writing what reviews and landings rely on: the
  reflog actions Git really writes, a shared checkout, the branch entry's
  Default main tip, a prepared receipt, and a delivery kept beside the branch
  comparison. Composed review cases state only what production stores.
- **Scope.** Restore that proof at the production capture or adapter, retire
  the test-support writers that imitate the adapter, and correct the stale
  hold comment and vacuous assertions. The review cases stay composed. Branch
  entry, the observation and landing store reads, and the launch preset fold
  stay with their stories.
- **Plan.** [743](../slice-plans/743-restore-done-capture-proof-after-composed-reviews/PLAN.md)

<a id="split-branch-entry-proposal-from-store"></a>

### Propose a branch entry from typed inputs and expose its pin refs

**Identity:** SEED-413#split-branch-entry-proposal-from-store
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Second of the [Done capture import-list stories](#done-capture-import-list-analysis);
the analysis and decisions are recorded there.

- **Goal.** Dashboard maintainers can prove branch-entry identification and
  its refusals from typed inputs. Review cases start from a record that
  already holds its branch entry, and tests ask production for a session's
  pins instead of copying the ref layout.
- **Scope.** Split `recordSessionBranchEntry` into a proposal over
  `{ trunk ref, record, place }` (verify the registered worktree, read the
  entry state and Default main tip, observe trunk) that returns the entry
  or a refusal, and the adapter that writes the record and pins. Narrow its
  `PublishedSource` input to what it reads. Expose the session's pin refs as
  a production query beside `sessionBranchRefPrefix` in
  `server/launchRecordPins.ts`, and retire `sessionBranchPins` and its
  hard-coded host. Do the same for a landing's one-shot pins, retiring
  `landingPins`, so `adHocBranchRefs.ts` keeps only `retireAdHocBranch`.
  Move `aDeclaredPublisherBranch` onto the composed entry. Add a MakeMe step for a record with a branch entry, and
  move cases where entry is a precondition off `identifyBranch`. Retire
  `declaredBranchCase.ts` when its last caller moves. Replace the
  `installRecordRemovalDispatch` setup with an explicit collaborator where
  these cases need retention or deletion.
- **Key examples.**
  - A foreign clone, a wrong branch and a second place are refused by the
    proposal, without a kept store.
  - An entry kept before main moves still answers the same entry.
  - A review of a declared branch, composed with its entry, separates the
    branch from the Default main commits made before entry.
- **Evaluation.** As in the first story, also counting `adHocReview.ts`
  imports from `dashboard/backend-tests/`.
- **Effort hypothesis.** M, one plan.

<a id="observe-done-deliveries-over-typed-records"></a>

### Observe Done deliveries over typed kept records

**Identity:** SEED-413#observe-done-deliveries-over-typed-records
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Third of the [Done capture import-list stories](#done-capture-import-list-analysis);
the analysis is in its addendum on delivery observation and publication.

- **Goal.** Dashboard maintainers can prove which Done branches a trunk
  revision delivers from composed Done records and real Git, without a
  machine home. Only the store adapter saves the delivery and keeps or
  releases its pins.
- **Scope.** Split `captureObservedLandings` into a typed decision over the
  kept records, the observed revision, the authorized trunk head and the
  inspection that returns each delivery to keep, and the adapter that
  applies each one to the live record and releases it on loss. Keep the
  process-lifetime owner and its witnesses on the typed decision. Prove
  delivery selection, skipped witnesses and retry with composed records.
  Keep the deletion and expiry races as adapter cases over an explicit
  record-store collaborator, instead of a stubbed HOME,
  `changeLaunchStore` and `installRecordRemovalDispatch`. Move the
  `ad-hoc-manual-landing-observation*` and
  `ad-hoc-manual-landing-revision-observation` specs accordingly.
- **Key examples.**
  - Two Done branches merged by hand are each delivered by the published
    head, decided from composed records with no kept store.
  - A record deleted or expired while its inspection waits is not
    recreated and leaves no delivery pins, proved once at the adapter.
- **Evaluation.** As in the first story, also counting store-module imports
  and `doneBranchObservation.ts` imports in the observation specs.
- **Effort hypothesis.** S–M, one plan.

<a id="decide-landings-over-typed-attempts-and-records"></a>

### Decide reported landings over typed attempts and records

**Identity:** SEED-413#decide-landings-over-typed-attempts-and-records
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Fourth of the [Done capture import-list stories](#done-capture-import-list-analysis);
the analysis is in its addendum on delivery observation and publication.

- **Goal.** Dashboard maintainers can prove landing preparation and
  recording from composed attempts and records. The installed publisher's
  cases reach the dashboard through production's own request admission, so
  no test code repeats it.
- **Scope.** Split `handleLanding` into a typed decision over the
  submission, origin, operation, kept attempts and kept records that returns
  the receipt or refusal and the next attempts and records, and the adapter
  that persists them. Let `branchLandingContext` take its reporting
  directory and record from its caller instead of `machineDashboardPath`
  and `changeSessionRecord`. Expose the landing request admission (route,
  method, origin, body → operation and submission, or refusal) as a typed
  production function that `submitLanding` uses, and make the publisher
  bridge in `installedPublisher.ts` delegate to it. Add MakeMe steps for
  a reporting attempt and record with a landing context, and retire
  `aReportedIsolatedBranch`'s `replaceAttempts` and `writeLandingContext`
  calls. Keep a few installed-publisher cases whose topic is the
  publisher's retained comparison and retry. Move the rest to the typed
  decision.
- **Key examples.**
  - A record of a deleted reporting session refuses a landing, decided from
    composed values.
  - A prepared pair survives Done and is recorded at landing, without the
    attempt store under HOME.
  - A wrong origin or route is refused by the production admission in
    the publisher's bridge.
- **Evaluation.** As in the first story, also counting
  `installedPublisher.ts`, `declaredPublisherBranch.ts` and
  `reportedIsolatedBranch.ts` lines and imports.
- **Effort hypothesis.** M, one plan.

<a id="fold-done-capture-launches-into-makeme"></a>

### Build Done capture cases from MakeMe launch steps

**Identity:** SEED-413#fold-done-capture-launches-into-makeme
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Fifth of the [Done capture import-list stories](#done-capture-import-list-analysis);
the analysis and decisions are recorded there.

- **Goal.** Dashboard maintainers read a Done capture case as one built
  scenario. A spec imports `makeMe` and the production entry it proves,
  not a list of support verbs.
- **Scope.** Turn `anEstablishedSession`, `aDefaultLaunch`,
  `anIsolatedLaunch`, `aDeclaringLaunch` and `historyBeforeTheCase` into
  domain-named steps of the MakeMe launch and repository builders. Do the
  same for the delivery and publication presets, `twoDoneBranchesMergedByHand`,
  `aDeclaredPublisherBranch` and `aReportedIsolatedBranch`, and the
  `observedTrunk` constant, so `doneBranchObservation.ts`,
  `declaredPublisherBranch.ts` and `reportedIsolatedBranch.ts` keep only
  what MakeMe cannot hold, or are retired. Give the
  case one object that carries its checkout, record and timeline, so calls
  no longer thread `checkout` and `record` separately and launch and Done
  times are visible in the case. Shrink `doneCaptureCase.ts`,
  `reportedDoneCase.ts` and the remaining spec-local helpers to what MakeMe
  cannot hold. Add no new support wrappers.
- **Key examples.**
  - `ad-hoc-session-branch-entry.spec.ts` imports no names from
    `doneCaptureCase.ts` beyond a case builder, and has no spec-local setup
    helpers.
  - A case states its launch and Done times in its own builder chain.
- **Evaluation.** Imports per spec, support lines and spec lines before
  and after, under
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
Queued after the five [Done capture import-list stories](#done-capture-import-list-analysis),
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

**Goal.** Give dashboard developers readable UI unit tests and feedback from
the complete frontend group in roughly a minute at the usual two workers,
including preparation. This carries the suite-wide commitments, including
SEED-404's timing goal and SEED-301's Intent MakeMe work.

**Scope and order.** Select families by feature folder and the interaction
each view owns. The Optimization Candidates and open Sessions sidebar
families have landed as mounted Vitest Chromium proof.
Continue with the rest of Intent and Sessions. Use
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
