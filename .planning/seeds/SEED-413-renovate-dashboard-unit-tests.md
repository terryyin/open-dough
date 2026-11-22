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
    [delivery observation](https://github.com/terryyin/open-dough/blob/24864be6360f87cc9fec3dc4333de5361de165eb/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records) and
    landing reports (completed; recoverable at `086faa5a:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records`),
    after branch entry and before the launch flavors fold into MakeMe, so
    the fold covers the final builders.

<a id="prove-renamed-diff-grammar-from-new-path"></a>

### Prove a renamed file's Review diff reads its grammar from the new path

**Identity:** SEED-413#prove-renamed-diff-grammar-from-new-path
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/746-prove-renamed-diff-grammar-from-new-path/PLAN.md"}
```

Correction from the Intent Coverage check of
SEED-413#reduce-review-diff-reading-to-logic-cases on 21 November 2026.

- **Goal.** Dashboard maintainers get a failing test when a renamed file's
  Review diff reads its grammar from the old path instead of the new one.
- **Scope.** One maintained case for the choice of path given to diff styling.
  It is either a logic case over that choice or a case through
  `StoryReviewFileDiff`. Product behavior stays unchanged.

<a id="optimize-done-capture-family-cases"></a>

### Bring the Done capture family's cases to 100–200 ms

**Identity:** SEED-413#optimize-done-capture-family-cases
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#optimize-done-capture-family-cases","dependencies":[{"supplier":{"identity":"SEED-413#split-done-mark-decision-from-store","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#split-done-mark-decision-from-store"},"implementation":"Typed Done transition, Git branch-result capture, and review cases composed from Done state.","rationale":"Profiling the old review setup would measure machine-store writes and Done replay that this story removes.","condition":"The typed Done transition and Git capture are separate from the store adapter, and review-topic cases use composed Done records without replaying the store-backed Done action.","state":"satisfied","resolution":{"revision":"6250b73992afc1df2fd9b12bb502008527e568d6","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#split-done-mark-decision-from-store","summary":"Satisfied at integration 2a7260d6d: dashboard/server/doneTransition.ts holds the pure Done transition and sessionBranchCapture.ts exports the Git-only captureBranchResult as setRecordDoneAt's collaborator; review-topic cases compose Done records without markDone (plan 734 slices 1, 2, 4–7). The correction SEED-413#restore-done-capture-proof-after-composed-reviews, queued first, adds back a few adapter cases before this measurement.\nCondition satisfied: The typed Done transition and Git capture are separate from the store adapter, and review-topic cases use composed Done records without replaying the store-backed Done action.\nAccepted integration: 2a7260d6d2596365b432d11731b6b57d01dc0f0f on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#split-branch-entry-proposal-from-store","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#split-branch-entry-proposal-from-store"},"implementation":"Typed branch-entry proposal, production pin-ref query, and review cases composed from branch-entry state.","rationale":"The optimization needs to measure the branch-entry setup that remains after repeated store-backed entry actions are removed from review cases.","condition":"Branch-entry proposals are separate from persistence, the session pin-ref query is available, and cases where branch entry is a precondition use composed branch-entry state.","state":"satisfied","resolution":{"revision":"9969388902eb48c56588d9a1d30f45d8be6ac4b3","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#split-branch-entry-proposal-from-store","summary":"Directly satisfied. The proposal is separate from persistence (branchEntryProposal.ts vs sessionBranchEntry.ts), the session pin-ref query is production sessionBranchPins in launchRecordPins.ts (with heldLandingPins for one-shot pins), and cases where the entry is a precondition compose it with makeMe enteredBranch; no test-side identifyBranch, aDeclaringLaunch or aDeclaredBranch remains. Proved by the branch-entry and pin specs and hosted CI run 44783274270 on e8b7e417.\nCondition satisfied: Branch-entry proposals are separate from persistence, the session pin-ref query is available, and cases where branch entry is a precondition use composed branch-entry state.\nAccepted integration: e8b7e4170c63f978270efba32e2396989fd555a1 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#fold-done-capture-launches-into-makeme","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#fold-done-capture-launches-into-makeme"},"implementation":"Done capture launch cases built through domain-named MakeMe steps.","rationale":"The launch arrangement changes the setup that the optimization measures, so the remaining costs need to be established with the delivered builders.","condition":"The Done capture cases use MakeMe launch and repository steps, with the checkout, record, and timeline carried by one case object.","state":"satisfied","resolution":{"revision":"47af39ca65b8c40ee3bd1b352db274a3330c975d","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#fold-done-capture-launches-into-makeme","summary":"Directly satisfied at integration 7b89046e3. The 36-spec Done capture family builds through aDoneCaptureCase() (dashboard/backend-tests/support/doneCaptureCaseBuilder.ts), whose please() returns one value carrying checkout, records, timeline, work and the case clock; its launch steps compose the MakeMe named examples startedOnMainOf, establishedOnMainOf and isolatedIn (from 1cf323753) and the repository step withBaseBeforeEveryLaunch. The preset modules declaredPublisherBranch.ts, reportedIsolatedBranch.ts and reportedDoneCase.ts are retired. Family roster passed at one worker on the merged state; the load-sensitive race cost (ad-hoc-branch-result-race, captureBranchResult's sequential Git calls) is recorded in this consumer's Measured notes. The queued correction SEED-413#tie-done-capture-cases-to-production slightly changes this setup and precedes this story.\nCondition satisfied: The Done capture cases use MakeMe launch and repository steps, with the checkout, record, and timeline carried by one case object.\nAccepted integration: 7b89046e3586e4d407ee231164934840b11365f5 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#observe-done-deliveries-over-typed-records","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records"},"implementation":"Typed delivery-observation decision over composed Done records, with the store adapter alone saving deliveries and pins.","rationale":"Profiling the observation cases before the split would measure machine-store reads and writes in a stubbed HOME that this story removes.","condition":"Delivery observation decides from typed kept records separately from its store adapter, and observation cases other than the adapter's races use composed records.","state":"satisfied","resolution":{"revision":"24864be6360f87cc9fec3dc4333de5361de165eb","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records","summary":"Directly satisfied. Plan 736's typed decision, witness, retry and offline restart cases use composed Done state and real Git; the explicit adapter cases own live record and pin races. The final seven-spec observation family has no direct machine-store imports, HOME setup or Mark Done calls. All 26 passed with the ordinary two workers and default timeouts. The paired ADR 0010 results are recoverable in the completed plan and showed no consistent timing change.\nCondition satisfied: Delivery observation decides from typed kept records separately from its store adapter, and observation cases other than the adapter's races use composed records.\nAccepted integration: 0747fb0a2558f72b185b4299a3ecbb28cd9f3327 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#decide-landings-over-typed-attempts-and-records","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records"},"implementation":"Typed landing decision over composed attempts and records, production landing request admission, and the publisher bridge delegating to it.","rationale":"Profiling the publication cases before the split would measure attempt and record store writes and the test-side receiver that this story removes.","condition":"Landing preparation and recording decide from typed attempts and records separately from their store adapter, the landing request admission is a production function, and only the publisher-topic cases run the installed publisher.","state":"satisfied","resolution":{"revision":"086faa5a284a7030a101032405772eff1cf69077","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records","summary":"Directly satisfied. SEED-413#decide-landings-over-typed-attempts-and-records delivered decideLanding over composed attempts/records, LandingStores on handleLanding, caller-directed branchLandingContext, admitLandingRequest, and the installed-publisher bridge on production admission with composed stores. Key examples and Intent Coverage Caught at 233d31e6c (ad-hoc-prepared-landing-done). Approved remainders (HOME for blank/worktree machine deletion; 29 server specs; local LandingStores until ObservedLandingStore) do not block this condition. Recoverable story/plan at 086faa5a; accepted on origin/main at 4a5ceb24.\nCondition satisfied: Landing preparation and recording decide from typed attempts and records separately from their store adapter, the landing request admission is a production function, and only the publisher-topic cases run the installed publisher.\nAccepted integration: 4a5ceb24a2d50569dfe181e16a1a6a6b1efa9798 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/757-optimize-done-capture-family-cases/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b64cf094a852b5f947a68b1fa902745b768f5d2cf689ab488959d5a20339b3fe","plan":"94b71e1c5a4f6e32d4558b2a9ea9dc1debf68f95c16edd62b6495c69794bbe40"}}
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
- **Observed during the fold (2026-11-21, plan 737 at `b3cd1acfe`).**
  `ad-hoc-branch-result-race` took 1.3–2.3 s at load 8.6 and timed out once at
  5 s at load 27–30: case setup 421–762 ms, the held first capture about
  300–500 ms, the quiet-Done delivery 410–810 ms, review and pins about 100 ms.
  Every phase grew with load; no timer, wait or race was involved.
  `captureBranchResult` (`dashboard/server/sessionBranchCapture.ts`) runs
  about ten Git calls one after another, and the origin cannot be dropped
  because the review then reads `unavailable`. `ad-hoc-branch-result` cases
  also timed out twice in a long one-worker roster run at load 12–17.
- **Scope.**
  - On macOS the dashboard server and installed publisher run the Git binary
    selected by `xcrun -f git` when the effective `PATH` selects Apple’s
    launcher. Reuse the selection within the process for the same environment.
    Preserve a caller-selected Git, normal invocation on other platforms, and
    Git's existing fallback when the developer-tool lookup fails. Leave
    selection of other tools to the caller’s `PATH`.
  - Cut the Git processes each case starts, in the family's support and in
    production seams that start more than their answer needs. The family is
    the Git-heavy Done capture cases under `dashboard/backend-tests/review/`
    and `dashboard/backend-tests/launches/`, with their shared support:
    the case builder `doneCaptureCaseBuilder.ts` with
    `doneCaptureCaseMaterialization.ts` and `doneCaptureCasePlaces.ts`,
    `doneCaptureCase.ts`, `doneCaptureReview.ts`, `installedPublisher.ts`
    and `adHocBranchRefs.ts`, as the five import-list stories leave them.
    Profile per case first, covering checkout creation, checkout work,
    production Done capture, observation and review reads.
    After the branch-entry story, entry setup is gone; the Done review,
    attribution, declared publication and lifecycle deletion cases still take
    4.1–4.6 s at load ~20 in real Done capture and fixture Git.
  - Keep the Git that developers run, the production handlers and every
    assertion. The proof is of Git's own behavior (reflog times, merges,
    worktrees, pins), so a Git library in the test process does not replace
    it. Raising timeouts is out of scope.
- **Decision (Terry, 2026-11-21).** The Git runners own selection.
  `dashboard/server/gitRunner.ts` and the installed `publication-git.mjs`
  use the selected binary for their own calls. The existing Playwright
  service setup has separate `PATH` handling. The Done capture Vitest group
  does not run that setup.
- **Alternatives considered.**
  - Prepending the toolchain’s directory to the test `PATH` also changes
    how checks find `python3`, `make` and `clang`.
  - Cutting Git calls is the second experiment. Start from the repository
    fixture’s existing private copies of shared templates and its repair of
    origin and worktree paths.
  - A long-lived `git cat-file --batch` process would cover object reads
    only and add a process lifetime to the server. It is outside this story.
- **Key examples.**
  - When Apple’s launcher is first on `PATH`, a Done capture and an
    installed publication start the selected Git binary directly. An earlier
    Git executable on `PATH` still receives the calls.
  - A Done branch capture with a real merge and a typed review read targets
    about 200 ms in the low-load comparison. The review keeps the accepted
    trunk parent and actual merge resolution.
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
  1. Ad hoc review handoffs (completed; recoverable at
     `09a9cdc2:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-ad-hoc-review-handoffs-with-typed-handlers`)
     retired the last two users of `adHocReview.ts` and moved the branch-entry
     command case. The other converted cases already use typed entry points.
     Remaining native Done cases belong to `sessions/`.
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

### Remaining dashboard frontend renovation

The former catch-all backlog entry is superseded by the eight stories below.
The split covers every legacy frontend case listed at `42a660a17` on
21 November 2026. The normal command
`caffeinate -s -i npm run --silent test:dashboard:frontend -- --list --reporter=line`
listed 594 Playwright cases across 249 reported source files, including five
Intent files that register cases from other specs. These counts estimate the
starting workload. New or moved tests follow the behavior they prove.
The [most recent completed proof inspected](https://github.com/terryyin/open-dough/actions/runs/44877128434/artifacts/14697265341)
is from `0f9a585684` and records 825 passing cases across both engines and
1,036 summed case-seconds. Local listing and CI execution count different
things, and the CI revision predates current changes to Sessions and Review.

| Order | Story | Legacy cases | Listed sources |
| --- | --- | ---: | ---: |
| 1 | Get fast proof of a story's Intent CI comparison (completed; recoverable at `28e16d406:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-ci-comparison-proof`) | 69 | 24 |
| 2a | Get fast proof of Intent CI status and cue contrast (completed; recoverable at `3acae5160:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-proof-and-timing`) | 15 | 7 |
| 2b | Read Intent, CI, review and side-panel sessions through one required page entry (completed; recoverable at `756f67d70:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-proof`) | 0 | 0 |
| 2c | Get fast proof of Intent CI status on the real page (completed; recoverable at `7b9e64961:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-ci-status-frame-and-timing-history`) | 0 | 0 |
| 2d | Get fast proof of Intent CI wall-time history (completed; recoverable at `dc8d21846:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-on-vitest`) | 6 | 3 |
| 2d′ | Get fast proof of Intent scope timing history (completed; recoverable at `1b8a80724:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-history`) | 11 | 8 |
| 2d″ | [Get fast proof of Intent collected scope timing and chart marks](#speed-intent-scope-timing-reading) | 14 | 8 |
| 2e | [Get fast proof of Intent attempt and Summary proof](#speed-intent-attempt-and-summary-proof) | 49 | 18 |
| 3a | Get fast proof of Intent locations read recovery and settings problems (completed; recoverable at `e0f7d6a6a:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-and-story-reading`) | 7 | 2 |
| 3b | [Get fast proof of Intent source browsing, pinned links and detours](#speed-intent-source-browsing-and-detours) | 23 | 16 |
| 3c | [Get fast proof of story changes, Done references, notes and recorded progress](#speed-story-changes-notes-and-progress-reading) | 41 | 19 |
| 4 | Get fast proof of board and side-panel interactions (completed) | 63 | 28 |
| 5 | Get fast proof of composing and starting a launch (completed; recoverable at `9099d16787c4d0961075c841d3da2987712f508a:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-launch-proof`) | 81 | 29 |
| 6 | [Get fast proof of finding and reviewing Done sessions](#speed-dashboard-done-session-review-proof) | 77 | 34 |
| 7 | [Get fast proof of live sessions and terminal work](#speed-dashboard-live-session-and-terminal-proof) | 77 | 31 |
| 8 | [Run the entire dashboard frontend unit suite on Vitest](#retire-legacy-dashboard-frontend-runner) | 61 | 22 |
| | **Total** | **594** | **249** |

The first two cover the evidence maintainers use to review a story's intent.
They reuse production owners already accepting typed evidence and exercise
the highest-leverage distinction early: presentation can consume held
evidence, while refresh and stale-answer protection must exercise the real
reader. The next five each deliver faster proof for a complete workflow and
can be used independently. The last includes the remaining frame and
navigation integration, the harness audit, and complete frontend runner
retirement, which accounts for its smaller case inventory. The effort
hypotheses are large relative to the recent 23- and 29-case stories.
Confidence is highest for owners that take typed props. Full-page history,
live terminal behavior, and runner integration carry more uncertainty.
Moving only the engine would leave whole-app setup and repetitive cases.
Continuing one component at a time would extend the life of both runners.

#### Acceptance shared by the eight stories

- Use plain Vitest for all frontend unit checks. Use production logic for
  pure rules and the smallest production owner in headless Chromium for
  rendering, layout, accessibility and native input. Exercise the actual
  reader and its typed collaborator for retry, abort, caching and stale
  answers. Real page loads, URL history and other behavior that requires a
  built dashboard belong in representative E2E journeys. Keep the runner
  and coverage of the backend and E2E groups with their respective owners.
- Render the production owner at the typed entry production renders it
  through, with typed sources that production also supplies explicitly.
  Never build a test copy of a production composition, restate a provider
  stack, or call private pipeline functions to make a view's props. Make an
  owner stand alone in production instead. Add a read to a required typed
  source, never as an optional member, context default or defaulted
  parameter. A long production import list in a spec or colocated helper
  is the warning sign; see
  the CI status entry correction (recoverable at
  `7b9e64961:.planning/slice-plans/764-speed-intent-ci-status-frame-and-timing-history/PLAN.md#correction-of-the-ci-status-test-entry`).
- Follow the [frontend test guidance](../../dashboard/frontend-tests/README.md#which-entry-a-case-uses),
  [Architectural North Star](../NORTH-STAR.md), and
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Use page-loadable MakeMe inputs and colocated page objects where they
  clarify the journey. Render and act directly and wait on the observed
  result. Retire React `act` wrapping and
  `IS_REACT_ACT_ENVIRONMENT` as their families move. Remove spent support as
  its last consumer moves. Keep the shared test-support surface shrinking.
- Aim for fewer maintained cases as well as faster feedback in every story.
  Audit loop-generated and table-driven cases first. Use representative
  cases for equivalent paths, observe several independent results of one
  action in the same setup, or move a distinct rule to a direct logic case.
  Keep distinct risks separately named when they need separate setup or
  failure diagnosis. Preserve exact wording, accessibility, viewport and
  input distinctions, races, and error/retry boundaries wherever they are
  the proof. Avoid long unrelated assertion chains and hidden case
  registration. Map each retired case's distinct assertions to their
  new owner or a named existing equivalent before deletion. Report why
  repeated cases were consolidated or kept. Case count and runtime are
  measures of the benefit. Coverage quality decides which reductions to keep.
- Compare comparable before/after selections with two workers and record
  elapsed time including preparation, counts by engine and destination,
  and slow cases that remain. Run each engine's selection explicitly while
  the legacy runner exists. Include the runtime of proof promoted to E2E.
  Use paired runs under comparable load for noisy results. The final story
  measures the complete group including preparation against the recorded
  baseline, with roughly one minute at two workers as the campaign target.
  Report the actual time and any remaining cost.
- The existing recovery/late-styling timing follow-up and renamed-diff
  proof correction have separate owners. Preserve their commitments and
  use their results when available. The migrations own the remaining
  legacy cases. Keep this campaign's test work coordinated with
  [SEED-341](SEED-341-simplify-session-tests.md).

<a id="speed-intent-scope-timing-reading"></a>

### Get fast proof of Intent collected scope timing and chart marks

**Identity:** SEED-413#speed-intent-scope-timing-reading
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#speed-intent-scope-timing-reading","dependencies":[{"supplier":{"identity":"SEED-413#speed-intent-scope-timing-history","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-history"},"implementation":"Slices 1–2 of plan 774 reset page-mount preferences including Board position, reshape openDoneStoryComparison and mountJudgedRunProof to one options object with a ci: Partial<IntentCiReadSource> bag ready for readScopeHistory, give the Done history builder domain-named reference figures, type HeldKind, consolidate Project wall-time journeys, and scope Done history gap().","rationale":"Every collected timing and chart-marks case mounts through that corrected page entry and needs a typed readScopeHistory answer in the reshaped Done and Project test entries. Starting before those corrections land would either keep the preference leak and positional entries the correction removes, or duplicate the correction inside this story.","condition":"SEED-413#speed-intent-scope-timing-history has landed plan 774 Slices 1–2 page-mount preference reset and options-object test entries on main.","state":"satisfied","resolution":{"revision":"1b8a80724a15a31d10c3868e0ce74b964ba8d150","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-history","summary":"Plan 774 Slices 1–2 delivered and integrated on main at b3d71afec: withPagePreferences (dashboard/test-support/component-mount/framePreferences.ts) resets and restores the Sessions sidebar and Board column position for the Board, frame and Intent mounts (a paging case read open-dough.board.position restored; Intent compare + board-paging green in one --workers 1 run); openDoneStoryComparison({ ci, ...review }) and mountJudgedRunProof({ entries, judgment, viewport, ci }) take one options object with a ci: Partial<IntentCiReadSource> bag, which Slices 3–6 already used for readScopeHistory; the Done wall-time builder states averaging(ms, used)/tooFewToAverage(used); HeldKind became heldOnPagePerKey/heldOnPage; openTrunkHistory owns the keyboard and sideways-overflow journeys; the Done history gap() reads within the CI comparison panel. Proof: typecheck, 70 consumer specs, full dashboard frontend group (Vitest 494 tests, Playwright 839), branch CI success at 394c44370. Condition satisfied: plan 774 Slices 1–2 page-mount preference reset and options-object test entries are on main.\nCondition satisfied: SEED-413#speed-intent-scope-timing-history has landed plan 774 Slices 1–2 page-mount preference reset and options-object test entries on main.\nAccepted integration: b3d71afec011d7aac6594c43f9c2877202fd56e4 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/777-speed-intent-scope-timing-reading/PLAN.md","assessment":"not-ready","reasons":["Provisional resplit remainder awaiting story refinement and slice resizing to one or two legacy files per slice."],"basis":{"document":"f6c94e5daeb0249118deb0aee60b56931e4bd27371667eddfe44490703e597db","plan":"7fc7cc2ecfc081fc645cbcbfbad29f06d45b26c55b021cd7d3497c80b4693d97"}}
```

**Split from** SEED-413#speed-intent-scope-timing-history before readiness on
22 November 2026, when the 16-file remainder plus entry correction exceeded
eight slices. Its provisional plan is
[plan 777](../slice-plans/777-speed-intent-scope-timing-reading/PLAN.md),
awaiting story refinement.

- **Goal.** A dashboard maintainer can quickly check what collected scope
  timing history says for units, gaps, provenance and segments, and can read
  Project and Done history chart marks by pointer, keyboard and touch,
  including narrow viewports and light/dark schemes — with every case on
  Vitest through the production Intent page entry.
- **Scope.** Own 8 legacy specs (14 legacy cases):
  `intent-scope-timing-history-absent`, `-gaps`, `-provenance`, `-reading`,
  `-segments`, `-units`, `intent-ci-history-chart-marks` and
  `intent-project-ci-history-chart-marks` (the chart-marks pair moved from
  the CI wall-time story on 22 November 2026 when they proved the scope
  timing history chart). Scope glances, project/source/key isolation and
  recovery belong to
  Get fast proof of Intent scope timing history (completed; recoverable at
  `1b8a80724:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-history`);
  that story also lands the shared page-entry corrections this cohort mounts
  through. Attempt proof and Summary rows belong to
  [Get fast proof of Intent attempt and Summary proof](#speed-intent-attempt-and-summary-proof).
- **Key examples.** Absent, partial and unavailable reasons, separate case
  and file units, interrupted segments, build dates and provenance stay
  readable. Project and Done history chart marks keep build/date labels,
  accessible descriptions and run links, respond to pointer, keyboard and
  touch, and fit the narrowest viewport in light and dark schemes.
- **Evaluation.** All 14 legacy cases across the 8 owned files have a
  traceable disposition and run on Vitest. Apply the
  [shared acceptance](#acceptance-shared-by-the-eight-stories) timing,
  case-count, spent-support and coverage checks, removing any history
  `test-support` module whose last consumer moves, and recording the
  two-worker before/after elapsed comparison for this 8-file cohort.

<a id="speed-intent-attempt-and-summary-proof"></a>

### Get fast proof of Intent attempt and Summary proof

**Identity:** SEED-413#speed-intent-attempt-and-summary-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/760-speed-intent-attempt-and-summary-proof/PLAN.md","assessment":"not-ready","reasons":["Provisional resplit remainder awaiting story refinement and plan realignment onto the corrected CI status test entry."],"basis":{"document":"005a3f982ec657217f5fd52b6c542072871a109f1f27416fabd537bfd9cb0e46","plan":"9b5476b60fe36a5a0fc4658dadecfa9de7ecf93de14c990daf5d523268657b3a"}}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#speed-intent-attempt-and-summary-proof","dependencies":[{"supplier":{"identity":"SEED-413#speed-intent-proof-and-timing","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-proof-and-timing"},"implementation":"Wires IntentCiReadSourceOnPage (including readProof, readComparison, and endpoint proof readers) and exposes Node-free aCiProofEntry, aCiProofEvidence, and aComparedStory on pageMakeMe.mjs.","rationale":"Attempt-proof and Summary slices mount IntentCiProof, IntentScopeProofView, and IntentFileProofView directly over the pageMakeMe.mjs builders and IntentCiReadSourceOnPage contract delivered by SEED-413#speed-intent-proof-and-timing.","condition":"SEED-413#speed-intent-proof-and-timing has landed its IntentCiReadSourceOnPage contract, Node-free pageMakeMe.mjs CI proof builders, and narrowed story split on main.","state":"satisfied","resolution":{"revision":"3acae51604f0f3960816dc48f093c24688572ed4","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-proof-and-timing","summary":"Delivered Slices 1-3 (done) wired IntentCiReadSourceOnPage (including readProof, readComparison, and endpoint proof readers) in dashboard/src/intentCiReadSource.ts, exposed Node-free aCiProofEntry, aCiProofEvidence, and aComparedStory on Distribution/tests/support/pageMakeMe.mjs, and landed the narrowed 7-file status split on main.\nCondition satisfied: SEED-413#speed-intent-proof-and-timing has landed its IntentCiReadSourceOnPage contract, Node-free pageMakeMe.mjs CI proof builders, and narrowed story split on main.\nAccepted integration: 75ab8266d13595ce74344cb9d8c2bf903479d3d9 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#speed-intent-timing-history-proof","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-proof"},"implementation":"Slices 1–2 of plan 759 replace the default-valued Intent, CI and review read contexts with one required typed page-reads entry (dashboard/src/pageReads.tsx) that ConfiguredDashboard supplies through authenticatedPageReads, fix every reader at creation with no optional member or defaulted reader parameter, and make pageReadsSupplying reject unsupplied reads.","rationale":"Every attempt-proof and Summary case reads CI through that required entry. Starting before it lands would either extend the default-valued seam and defaulted readers the correction removes, or duplicate the entry inside this story.","condition":"SEED-413#speed-intent-timing-history-proof has landed its required typed page-reads entry and narrowed story split on main.","state":"satisfied","resolution":{"revision":"756f67d70f4b0b7338eb86c5eef2c9fb41774876","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-proof","summary":"Delivered Slices 1-2 (done): dashboard/src/pageReads.tsx holds the required PageReads entry (intent, ci, review, sessions from sessionServices.ts) with no optional member, context default or defaulted reader parameter; App supplies authenticatedPageReads through ConfiguredDashboard's required reads prop; pageReadsSupplying rejects unsupplied reads. The story was narrowed by Terry's authorized split, with the remainder queued as SEED-413#speed-intent-ci-status-frame-and-timing-history. Proof: typecheck, full dashboard frontend group (822 cases) and the Intent CI status, review, final report, host status and terminal E2E journeys passed; branch CI success at c89c8a5d1.\nCondition satisfied: SEED-413#speed-intent-timing-history-proof has landed its required typed page-reads entry and narrowed story split on main.\nAccepted integration: 07a9bc2ea732a327affc2dfb7d2f2d792f9cd9a4 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#speed-intent-ci-status-frame-and-timing-history","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-ci-status-frame-and-timing-history"},"implementation":"Slices 1–3 of plan 764 move the story notes, CI follow-up and review-state reads behind the typed page entry, render the CI status homepage, kept and side-panel cases through production PageFrame and the extracted production BoardOrIntent component with no outside fetch or WebSocket call, and render the status evidence and dark-contrast cases through the production Intent Summary fed by typed CI reads, with no private pipeline calls or hand-built hook state.","rationale":"Every attempt-proof and Summary case mounts the production Intent composition, Summary included, fed by typed CI reads. Starting before that corrected mount lands would either keep the hand-assembled Summary props and restated provider stacks the correction removes, or duplicate the correction inside this story.","condition":"SEED-413#speed-intent-ci-status-frame-and-timing-history has landed its Slices 1–3 CI status test-entry correction on main.","state":"satisfied","resolution":{"revision":"7b9e64961d0f26df835995d45878222dd19ae638","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-ci-status-frame-and-timing-history","summary":"Delivered Slices 1-3 (done): the CI status homepage, kept and side-panel cases mount production PageFrame and BoardOrIntent with no outside fetch or WebSocket call; freshness, execution-time, sort and dark-contrast render through the production Intent composition and the Done story Summary fed by typed CI reads, with no private pipeline calls, restated provider stacks or hand-built hook state (intent-ci-status-fixtures.ts keeps no production transform). Proof: the 7-file selection passing within the accepted 2-second allowance, full frontend group, branch CI success at d9f9df7a4. The retrospective's mount correction (production layout ancestors) is queued as plan 772 Slice 1.\nCondition satisfied: SEED-413#speed-intent-ci-status-frame-and-timing-history has landed its Slices 1–3 CI status test-entry correction on main.\nCondition satisfied: SEED-413#speed-intent-ci-status-frame-and-timing-history has landed its Slices 1–3 CI status test-entry correction on main.\nAccepted integration: e04fa9bacdc820011b9784845751124478df78b0 on origin/refs/heads/main."}}]}
```

**Split from** SEED-413#speed-intent-proof-and-timing at its delivered Slice 3
boundary alongside Read Intent, CI, review and side-panel sessions through one required page entry (completed; recoverable at `756f67d70:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-proof`).

- **Goal.** A dashboard maintainer can quickly check what current attempt
  proof and compared Summary rows say at the homepage, location, folder, and
  file, including count and timing gaps, fallback endpoints, renamed or
  outside files, and retained presentation across sorting and drill-down.
- **Scope.** Provisional remainder owning the 18 legacy attempt-proof and
  Summary specs (49 legacy cases): `intent-ci-proof`,
  `intent-ci-proof-accessibility`, `intent-ci-proof-grouped-location`,
  `intent-summary-ci-proof-*`, and `intent-summary-story-comparison-*`, plus
  removing spent `dashboard/test-support/` modules whose last consumer moved
  across the split proof cohort. CI status belongs to
  `SEED-413#speed-intent-proof-and-timing`; CI wall-time history belongs to
  Get fast proof of Intent CI wall-time history (completed; recoverable at
  `dc8d21846:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-on-vitest`);
  scope history isolation and recovery to
  Get fast proof of Intent scope timing history (completed; recoverable at
  `1b8a80724:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-history`);
  collected timing reading and chart marks to
  [Get fast proof of Intent collected scope timing and chart marks](#speed-intent-scope-timing-reading);
  the story-source and location views belong to
  [Get fast proof of Intent source browsing, pinned links and detours](#speed-intent-source-browsing-and-detours).
  Cases render the production Intent composition through the typed page-reads
  entry that the page entry story (completed; recoverable at `756f67d70:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-proof`)
  delivered and the CI status frame story (completed; recoverable at
  `7b9e64961:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-ci-status-frame-and-timing-history`)
  completes. They do not hand-assemble Summary or Proof props from private
  evidence pipelines.
- **Key examples.** The chosen attempt lacks some proof → the homepage and
  Summary identify which evidence survived → sorting, drilling into a file, and
  returning preserve the reading, Show % preference, and units without
  rereading CI. A scope with one renamed or unlisted file assigns its evidence
  once from the intended endpoint and explains gaps. Keyboard and
  narrow/zoomed reading still expose the same controls, words, and cues.
- **Evaluation.** All 49 legacy cases across the 18 owned files have a
  traceable disposition and the unit proof runs on Vitest. Apply the
  [shared acceptance](#acceptance-shared-by-the-eight-stories) timing,
  case-count, spent-support, and coverage checks. Summary proof gives faster
  feedback as soon as its slices land.

<a id="speed-intent-source-browsing-and-detours"></a>

### Get fast proof of Intent source browsing, pinned links and detours

**Identity:** SEED-413#speed-intent-source-browsing-and-detours
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#speed-intent-source-browsing-and-detours","dependencies":[{"supplier":{"identity":"SEED-413#speed-intent-source-and-story-reading","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-and-story-reading"},"implementation":"Reshapes makeMe.anIntentLocationsAnswer to build typed IntentLocations, forwards optional readFile on loadRepositoryTexts, retires locationsRequest and pygardon, and lands the narrowed 2-file locations split on main.","rationale":"Source-browsing and detour slices build their configured and empty IntentLocations fixtures through makeMe.anIntentLocationsAnswer and depend on the narrowed SEED-413 story split and retired support already being integrated on main rather than diverging on the unsplit story.","condition":"SEED-413#speed-intent-source-and-story-reading has landed its typed makeMe.anIntentLocationsAnswer builder, loadRepositoryTexts readFile seam, and narrowed story split on main.","state":"satisfied","resolution":{"revision":"e0f7d6a6a52e3ecec7c4556171c6e7a95ddd303f","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-and-story-reading","summary":"Delivered Slices 1-2 (done) reshaped makeMe.anIntentLocationsAnswer in Distribution/tests/support/intentLocationTestData.mjs to build typed IntentLocations, forwarded optional readFile on loadRepositoryTexts in dashboard/src/repositoryFileReads.ts, retired unused locationsRequest and pygardon, proved all 7 legacy locations cases across 8 Vitest checks in dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts and intent-read-recovery.spec.ts, and integrated the narrowed 2-file SEED-413 story split on main.\nCondition satisfied: SEED-413#speed-intent-source-and-story-reading has landed its typed makeMe.anIntentLocationsAnswer builder, loadRepositoryTexts readFile seam, and narrowed story split on main.\nAccepted integration: 6fa6ef623823d329f9e466994ff0b6500cda9a15 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#speed-intent-timing-history-proof","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-proof"},"implementation":"Slices 1–2 of plan 759 replace the default-valued Intent, CI and review read contexts with one required typed page-reads entry (dashboard/src/pageReads.tsx) that App supplies as authenticatedPageReads through ConfiguredDashboard's required reads prop, and remove defaulted reader parameters, readCachedFile's included.","rationale":"Plan 762's correction Slices 1–2 add the page observation's reads to that entry as required members. Starting first would either extend IntentReadSourceOnPage and the defaulted readers the correction removes, or duplicate plan 759's entry inside this story.","condition":"SEED-413#speed-intent-timing-history-proof has landed its required typed page-reads entry and narrowed story split on main.","state":"satisfied","resolution":{"revision":"756f67d70f4b0b7338eb86c5eef2c9fb41774876","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-proof","summary":"Delivered Slices 1-2 (done): dashboard/src/pageReads.tsx holds the required PageReads entry (intent, ci, review, sessions from sessionServices.ts) with no optional member, context default or defaulted reader parameter; App supplies authenticatedPageReads through ConfiguredDashboard's required reads prop; pageReadsSupplying rejects unsupplied reads. The story was narrowed by Terry's authorized split, with the remainder queued as SEED-413#speed-intent-ci-status-frame-and-timing-history. Proof: typecheck, full dashboard frontend group (822 cases) and the Intent CI status, review, final report, host status and terminal E2E journeys passed; branch CI success at c89c8a5d1.\nCondition satisfied: SEED-413#speed-intent-timing-history-proof has landed its required typed page-reads entry and narrowed story split on main.\nAccepted integration: 07a9bc2ea732a327affc2dfb7d2f2d792f9cd9a4 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#speed-intent-ci-status-frame-and-timing-history","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-ci-status-frame-and-timing-history"},"implementation":"Slices 1–2 of plan 764 move the story notes, CI follow-up and review-state reads behind the typed page entry and extract the production BoardOrIntent component from ConfiguredDashboardContent, so the production Intent body (IntentReadRecovery with IntentPerspective or RetainedFollowUpPerspective) stands alone under the real PageFrame with every page read supplied through the entry.","rationale":"Plan 762's correction Slices 1–2 render the locations recovery and settings-problem cases through that standalone production Intent body. Starting first would either rebuild the Intent composition in test code, which the correction forbids, or duplicate plan 764's extraction inside this story.","condition":"SEED-413#speed-intent-ci-status-frame-and-timing-history has landed its Slices 1–2 page reads and standalone production BoardOrIntent component on main.","state":"satisfied","resolution":{"revision":"7b9e64961d0f26df835995d45878222dd19ae638","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-ci-status-frame-and-timing-history","summary":"Delivered Slices 1-2 (done): story notes, CI follow-up and review-state reads are required PageReads members supplied by authenticatedPageReads (dashboard/src/pageReads.tsx), and BoardOrIntent (dashboard/src/boardOrIntent.tsx), extracted from ConfiguredDashboardContent, renders IntentReadRecovery with IntentPerspective or RetainedFollowUpPerspective under the real PageFrame with every page read through the entry. Proof: typecheck, full frontend group, the side-panel case recording no outside fetch or WebSocket, intent-ci-status and agent-terminal-done-report E2E, branch CI success at d9f9df7a4.\nCondition satisfied: SEED-413#speed-intent-ci-status-frame-and-timing-history has landed its Slices 1–2 page reads and standalone production BoardOrIntent component on main.\nCondition satisfied: SEED-413#speed-intent-ci-status-frame-and-timing-history has landed its Slices 1–2 page reads and standalone production BoardOrIntent component on main.\nAccepted integration: e04fa9bacdc820011b9784845751124478df78b0 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/762-speed-intent-source-browsing-and-detours/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5bf24c931cf406787c35be704703d1be283884622d6f987e8bbaccac30878481","plan":"9ab56bb5acfa619f065d3053ddeefefed75fb98efb9dce0f295095ac97641b8b"}}
```

**Split from** SEED-413#speed-intent-source-and-story-reading, which delivered
the 2-file Intent locations read-recovery and settings-problem Vitest suite,
and typed `makeMe.anIntentLocationsAnswer`.

- **Correction first.** Review of the split-from story found that its
  recovery cases render a test copy of the page's published observation and
  Intent body (`PageIntentRecovery`), through a defaulted `readFile` reader
  that production gained only for that copy. The settings-problem cases spy
  on `fetch` and call transport and limit functions directly. Slices 1–4 of
  [plan 762](../slice-plans/762-speed-intent-source-browsing-and-detours/PLAN.md#correction-of-the-locations-recovery-test-entry)
  add the page observation's reads to the required typed page entry, record
  the standing rate limit where a typed reply is received, and render both
  files through the production Intent body before any source-browsing move.
  The recovery cases that the published observation drives (the transient
  schedule, a hidden then revealed page, the end of a standing limit and the
  wait shared with published detail) keep the `PageIntentRecovery` copy as
  an interim until
  [the published observation runs through the page entry](#drive-published-observation-through-page-entry)
  (Terry's amendments, 22 November 2026).

- **Goal.** Dashboard maintainers get fast Vitest feedback that a developer
  can browse Gherkin and code sources at the chosen scope, line and revision,
  follow canonical and plan links safely, open Project Intent or a selected
  story, and resume the exact reading place after a detour through another
  view.
- **Scope.** Own the 15 legacy source-browsing, pinned-navigation, and
  reading-detour specs (22 legacy cases): Navigation's `source-navigation` and
  `source-navigation-refused`, and Intent's `intent-entry-folder-summaries`,
  `intent-entry-folder-summaries-folders`, `intent-gherkin-groups`,
  `intent-gherkin-layout`, `intent-code-browse-java`, `intent-purpose-case`,
  `intent-home-activation`, `intent-project-visit`,
  `intent-project-visit-selection`, `intent-read-reuse`,
  `intent-reading-place`, `intent-recent-stories` and
  `intent-selection-reads`. `intent-story-review-return` left with the Intent
  header's Review control at `ffb4ef63d`. Replace the provider composition in
  `intent-candidates-publication.ts` with the production Intent body and
  retire spent
  `dashboard/test-support/` modules whose last consumer moves
  (`support/frontendSourceNavigation.ts`, `intentEntryFolderSummariesFixtures.ts`,
  and `putFrontendFolderSources` on `support/frontendIntentSources.ts`). Retain
  composed source, settings, visit, and popup navigation journeys in
  representative `e2e/intent/` and `e2e/navigation/` coverage. Locations read
  recovery belongs to `SEED-413#speed-intent-source-and-story-reading`;
  Changed tests story context, Done Intent, Done references, Story notes, and
  recorded progress belong to
  [Get fast proof of story changes, Done references, notes and recorded progress](#speed-story-changes-notes-and-progress-reading).
- **Key examples.** Clicking names and toggles selects or expands the intended
  item, Gherkin panes scroll independently, a missing Java grammar keeps
  readable plain text, and selecting an Optimization Candidates case opens its
  exact source and line. Canonical and plan links use the inspected revision
  while external, unsafe, and invalid targets keep their distinct results.
  When a pinned file read fails, the reader sees the specific cause and can
  Retry to load the right revision and source; while a later revision is
  pending, Purpose keeps the applicable source. With a file selected two
  folders deep in a story's Changes, a visit to Development and back restores
  the story, file and reading position without extra reads, and switching
  projects resets the reading place.
- **Evaluation.** All 22 legacy cases across the 15 owned files have a
  traceable disposition and the unit proof runs on Vitest without `act`
  wrapping. Apply the [shared acceptance](#acceptance-shared-by-the-eight-stories)
  timing, case-count, spent-support, and coverage checks, recording each
  retired case's proof owner, any E2E popup/focus runtime, and the two-worker
  elapsed comparison for this 15-file cohort. Production and every case
  supply reads through the required typed page entry; no test file
  re-creates the page observation, the Intent body or its providers, and no
  production read keeps a defaulted reader parameter.

<a id="drive-published-observation-through-page-entry"></a>

### Drive the published observation through the typed page entry

**Identity:** SEED-413#drive-published-observation-through-page-entry

Split from [Get fast proof of Intent source browsing, pinned links and detours](#speed-intent-source-browsing-and-detours)
on 22 November 2026, when its correction found that rendering production
`ConfiguredDashboard` in a case reaches reads outside the page entry.

- **Goal.** Dashboard maintainers can render the production published
  observation in a Vitest case with every read it makes supplied through the
  required typed page entry, so cases that depend on the observation, such as
  the wait published detail and Intent locations share, prove production
  instead of an E2E stand-in or a test copy.
- **Scope.** The reads `ConfiguredDashboard` still makes directly: the
  revision stream's `EventSource` (`revisionStreamSchedule.ts`), the detail
  reads in `publishedWorkDetails.ts` (published sessions, agent profiles and
  profile additions, assignments, done stories, slice clocks, moved branch
  progress), and machine sessions and agent acceptance in `useAgentLaunches`.
  Module-level transient-failure state becomes owned per page mount, so cases
  need no test-side reset. The four observation-driven cases in
  `intent-read-recovery.spec.ts` (transient schedule, hidden then revealed
  page, standing-limit end, the wait shared with published detail) move onto
  `ConfiguredDashboard`, and the `PageIntentRecovery` copy is deleted. The
  retired legacy source-navigation case's check that showing story links
  reads exactly the in-repository canonical files returns here, on the
  observation's preparation reads, and the retired Gherkin layout case's
  check that the region below the page banner never scrolls returns here,
  on the composed page.
  `navigation/board-frame-mount.ts` stops mocking
  production modules and supplies typed replies, letting `readPublishedWork`
  take its reads first.
- **Key examples.** A case renders `ConfiguredDashboard` with
  `pageReadsSupplying` and makes no `fetch`, `EventSource` or module mock;
  "published detail and Intent locations share a wait" runs on the
  production observation and fails when production breaks the shared wait; two cases in one file
  start with no transient failure left by the other.
- **Evaluation.** Apply the [shared acceptance](#acceptance-shared-by-the-eight-stories);
  every added read is a required member of the typed page entry, and no test
  file copies the published observation.

<a id="speed-story-changes-notes-and-progress-reading"></a>

### Get fast proof of story changes, Done references, notes and recorded progress

**Identity:** SEED-413#speed-story-changes-notes-and-progress-reading
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#speed-story-changes-notes-and-progress-reading","dependencies":[{"supplier":{"identity":"SEED-413#speed-intent-source-and-story-reading","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-and-story-reading"},"implementation":"Reshapes makeMe.anIntentLocationsAnswer to build typed IntentLocations, forwards optional readFile on loadRepositoryTexts, and lands the narrowed SEED-413 story split on main.","rationale":"Story-changes, Done-Intent, Done-reference, notes, and progress slices share the typed IntentLocations builder and narrowed SEED-413 story split landed by SEED-413#speed-intent-source-and-story-reading.","condition":"SEED-413#speed-intent-source-and-story-reading has landed its typed makeMe.anIntentLocationsAnswer builder, loadRepositoryTexts readFile seam, and narrowed story split on main.","state":"satisfied","resolution":{"revision":"e0f7d6a6a52e3ecec7c4556171c6e7a95ddd303f","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-and-story-reading","summary":"Delivered Slices 1-2 (done) reshaped makeMe.anIntentLocationsAnswer in Distribution/tests/support/intentLocationTestData.mjs to build typed IntentLocations, forwarded optional readFile on loadRepositoryTexts in dashboard/src/repositoryFileReads.ts, proved the 2-file locations cohort on Vitest, and integrated the narrowed SEED-413 story split on main.\nCondition satisfied: SEED-413#speed-intent-source-and-story-reading has landed its typed makeMe.anIntentLocationsAnswer builder, loadRepositoryTexts readFile seam, and narrowed story split on main.\nAccepted integration: 6fa6ef623823d329f9e466994ff0b6500cda9a15 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#speed-intent-source-browsing-and-detours","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-browsing-and-detours"},"implementation":"Slices 1–4 of plan 762 add the page observation's reads to the required typed page entry, have Intent reading record the standing rate limit when it receives a typed limited reply, and render the settings-problem and malformed-settings cases through the production Intent body with MakeMe replies, keeping the observation-driven recovery cases on an interim copy until SEED-413#drive-published-observation-through-page-entry.","rationale":"Story changes, Done Intent and Done-reference cases read published detail and Intent sources through the page observation. Starting before that correction would extend the test-only reader and the test copy of the page observation, or duplicate the correction inside this story.","condition":"SEED-413#speed-intent-source-browsing-and-detours has landed its Slices 1–4 test-entry correction on main.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/763-speed-story-changes-notes-and-progress-reading/PLAN.md","assessment":"not-ready","reasons":["Provisional resplit remainder awaiting story refinement and plan realignment onto the corrected typed page entry."],"basis":{"document":"cec7aec641bc24baf9cf1905b1a1fa2a57d9f0f70631392dd69e17b26e221f25","plan":"33839dd0ea8524f56a18b1ae1bbcdd79460eeade24a92ce2c7f72ebef45bd0b8"}}
```

**Split from** SEED-413#speed-intent-source-and-story-reading at its delivered
Slice 2 boundary alongside
[Get fast proof of Intent source browsing, pinned links and detours](#speed-intent-source-browsing-and-detours).

- **Goal.** Dashboard maintainers get fast Vitest feedback on what a developer
  sees about a selected or Done story's Changed tests, historical or live
  source across Review modes, Done story references, Story notes, and recorded
  slice progress, execution completion, and coverage.
- **Scope.** Provisional remainder owning the 19 legacy specs (41 legacy
  cases): Intent's `intent-read-reuse-story`, `intent-sidebar-toggle`,
  `intent-story-changes-gaps`, `intent-story-changes-only`,
  `intent-story-ci-cues`, `intent-story-dark-appearance`,
  `intent-story-summary-title`, `intent-story-views-narrow`,
  `intent-done-landed-review-mode`, `intent-done-project-refresh`,
  `intent-done-review-modes`, `intent-done-source-selection`,
  `intent-story-notes`, and `intent-story-coverage`; Navigation's
  `story-reference-done`, `story-reference-done-cancellation`, and
  `story-reference-done-recovery`; and Stories' `taken-slice-progress` and
  `plan-execution-complete-detail`, plus narrowing
  `stories/story-notes-control` to its project's subscribed state and removing
  its legacy `act` settle path, and removing any remaining
  `dashboard/test-support/` modules whose last consumer moved across the split
  reading cohort. Cases render the production Intent body or page through
  the typed page entry that
  [the source-browsing story](#speed-intent-source-browsing-and-detours)
  corrects; they do not mount below it with hand-supplied props or a
  test-only reader. Locations read recovery belongs to
  `SEED-413#speed-intent-source-and-story-reading`; source browsing, pinned
  links, and reading-place detours belong to
  [Get fast proof of Intent source browsing, pinned links and detours](#speed-intent-source-browsing-and-detours).
- **Key examples.** Selected story only follows the current revision, an
  opened changed file uses its diff without rereading published text, and
  empty or failed comparisons name their cause while keeping the tree usable.
  While another story selection or Review mode is pending, Purpose keeps the
  applicable source and never shows the other selection's text. A held Done
  reference can be superseded by navigation, pointer input, or Tab, and an
  expired or failed reference reports its actual state and recovers on Retry
  without reading older stories. A note saved before an older read answers
  remains visible, and Taken progress, execution completion, and story
  coverage present their recorded facts and distinct gaps without treating
  future plan proof as a completed result.
- **Evaluation.** All 41 legacy cases across the 19 owned files and the
  narrowed `stories/story-notes-control` Vitest spec have a traceable
  disposition and run on Vitest without `act` wrapping. Apply the
  [shared acceptance](#acceptance-shared-by-the-eight-stories) timing,
  case-count, spent-support, and coverage checks.

<a id="finish-launch-proof-orthogonal"></a>

### Get launch unit proof in about eight seconds

**Identity:** SEED-413#finish-launch-proof-orthogonal
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#finish-launch-proof-orthogonal","dependencies":[{"supplier":{"identity":"SEED-413#make-launch-proof-orthogonal","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#make-launch-proof-orthogonal"},"implementation":"Slices 1–6 reshape the launch dialog, dictation, story card status and startup recovery specs, narrow TranscriptReview and StartupRecovery in production, and change shared launch page helpers.","rationale":"This story reshapes the same launch page helpers (story-card-launch-page.ts, story-startup-page.ts) and measures the whole launch selection; starting from the unintegrated branch would conflict on those helpers and measure against a selection trunk does not hold. Reconciliation cannot help because the supplier's changes are not yet on trunk.","condition":"SEED-413#make-launch-proof-orthogonal is integrated on trunk with its reshaped launch selection.","state":"satisfied","resolution":{"revision":"265d6750b2aff5f953fee6e6684dbfd28d507b89","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#make-launch-proof-orthogonal","summary":"Slices 1–6 integrated: dense launch layout, model and effort reset, TranscriptReview, native recording races, typed StartupStatus and StartupRecovery, with plan 768's mappings and paired timing (reshaped families 21.4–21.7 s against 26.0–29.0 s at load about 13) at 265d6750b:.planning/slice-plans/768-make-launch-proof-orthogonal/PLAN.md. The merged launch selection passed 71/71 and the whole frontend group 452/452 before integration.\nCondition satisfied: SEED-413#make-launch-proof-orthogonal is integrated on trunk with its reshaped launch selection.\nAccepted integration: ac398c66a245cca4b63758b5b742e31df369492b on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/771-finish-launch-proof-orthogonal/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"84224af1d862c0e2510b7a8d343f962513980e96d33606d99c82f5d4d2ce79c3","plan":"e03d8d9c6951494e14123e4e3c2c93f4419c0a261a68d06f9a33117f4b73a73d"}}
```

- **Goal.** Dashboard maintainers get the local launch unit selection in
  about 7–8 seconds at two workers, including preparation, so launch
  changes get feedback within one short wait. Distinct launch behavior and
  the existing composed journeys stay covered. This story completes the
  launch family's share of the campaign's one-minute frontend target.
- **Scope.** Own `follow-up-note-handoff`, `ad-hoc-start-session`,
  `ad-hoc-start-session-answer`, `responsive-unattached-startup`,
  `ad-hoc-creation-entry`, `launch-attachments` and
  `launch-record-details` under `dashboard/frontend-tests/launches/`, the
  launch page helpers that hand-build launches from production
  `launchOffers` (`story-card-launch-page.ts`, `story-startup-page.ts`,
  `follow-up-note-handoff.spec.ts` and the unattached startup spec), and
  the whole launch selection's timing. Each case is arranged at the
  smallest production owner through typed inputs; production code may
  narrow an owner so it stands alone in production; tests never copy a
  production composition. Before removing an observation, name the
  retained case that would fail for the same regression. Note attachment
  takes a required notes answer, and the reading wrapper renders that
  choice. Unattached startup already takes its attempt on Start session
  and the project-actions row; the responsive terminal cases stop
  spreading `launchOffers`. Image paste, refusal and cancel stay on the
  dialog and attachment control that own them. Recorded model, effort and
  option words are read from the launch subject on the session entry and
  its details. The creation entry already mounts `CreationEntry` with a
  typed record; keep that case and include the file in the selection
  timing. Delivered files this story does not own stay as they are,
  including `launch-refinement-options.spec.ts`. Preserve genuine browser
  conditions, capture and recovery races, and the existing native,
  install and backend journeys at their current owners. Add no E2E case.
  A change to the shared frontend runner configuration is allowed only
  with whole frontend group proof; `story-card-launch-offers.spec.ts` and
  `story-card-startup.spec.ts` still need the `chromium-desktop` instance.
  Apply the
  [shared acceptance](#acceptance-shared-by-the-eight-stories) mapping,
  spent-support and timing checks. If the remaining time cannot reach the
  target without losing a distinct observation, stop with the measured
  remainder and its cause for the maintainer to decide.
- **Key examples.**
  - Note attachment receives its typed notes, with distinct waiting, no
    waiting and unreadable states; one composed Start session Follow-up
    request remains.
  - Unattached startup receives its typed attempt: progress and refusal
    stay on the project-actions row, and a blank keyboard start presents
    the terminal while an instructed start leaves it closed.
  - Story card launches mount without a hand-built copy of the machine
    sessions composition.
  - Measurement: the whole selection run with
    `npm run test:dashboard:frontend -- dashboard/frontend-tests/launches --workers=2`
    reports about 7–8 s wall including preparation, compared under similar
    machine load with a paired run of the starting selection.
- **Evaluation.** The seven owned files have a traceable disposition and
  the whole launch selection is measured as the key example states. Apply
  the [shared acceptance](#acceptance-shared-by-the-eight-stories) mapping,
  spent-support and timing checks.
- **Carried evidence.** Split from
  SEED-413#make-launch-proof-orthogonal on 22 November 2026. Plan 768 at
  `265d6750b:.planning/slice-plans/768-make-launch-proof-orthogonal/PLAN.md`
  records each reshaped family's mapping. Its paired run at `840788d00`
  (two workers, load 13 → 16) took the 17 reshaped files to 21.40 s and
  21.68 s against 29.02 s and 26.01 s for their 16 starting files. Its
  Slice 7 return found these seven files at 1,054 lines. The source map is
  `cb5c6fea2:.planning/slice-plans/762-speed-dashboard-launch-proof/remaining-proof.md`.

<a id="speed-dashboard-done-session-review-proof"></a>

### Get fast proof of finding and reviewing Done sessions

**Identity:** SEED-413#speed-dashboard-done-session-review-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Outcome.** Developers get fast proof that a Done session appears for
  the right project or story, opens the right review, and carries truthful
  evidence and navigation through Review. Evaluate selected versus stale
  results, published versus local evidence, and exact comparison and diff
  provenance through the rendered owner.
- **Boundary.** Own `sessions/recently-done*`, `sessions/follow-up-source-navigation*`,
  `stories/recently-done*` and all remaining legacy `review/` cases.
  These include Review actions, sidebar width and retained diff text,
  grammar, retry and appearance interactions. Preserve production selection
  and update ownership, existing mounted review proof, and the separately
  queued renamed-path regression assertion.
- **Effort and stopping point.** Large, medium confidence. Start from
  `StoryReview`'s typed reading source and the existing page owners for
  Done and Review. Distinct real publication, Git and install behavior
  keeps its existing service or E2E owner.

<a id="speed-dashboard-live-session-and-terminal-proof"></a>

### Get fast proof of live sessions and terminal work

**Identity:** SEED-413#speed-dashboard-live-session-and-terminal-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Outcome.** Developers get fast feedback on live session discovery,
  actions and reporting, and terminal operation. Evaluate a held terminal
  or session update while the reader interacts, including the right
  selection, input, completion or recovery result.
- **Boundary.** Own the remaining legacy `sessions/` specs outside Done
  review, all `terminals/`, and Stories' `story-note-voice*`. Cover live
  listings, card actions, Mark Done interactions, final reports, terminal
  layout and input, touch selection, prompts and transcription recovery.
  Retain native keyboard, touch, clipboard or terminal behavior at the
  boundary where each is observable. Real processes and transports belong
  in existing backend or E2E owners. Also own the mounted Sessions sidebar
  open-list mount (`dashboard/frontend-tests/sessions/sessions-sidebar-open-mount.ts`),
  which still renders `usePageSidePanel` and `SessionsSidebarOpenList`
  itself: its cases render the production page frame through the required
  page-reads entry instead.
- **Effort and stopping point.** Large, medium confidence. A replacement
  must observe the delivered input or update and any recovery it claims
  before the legacy setup retires.

<a id="retire-legacy-dashboard-frontend-runner"></a>

### Run the entire dashboard frontend unit suite on Vitest

**Identity:** SEED-413#retire-legacy-dashboard-frontend-runner
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Outcome.** A maintainer can list, filter, run and review CI proof for
  the complete dashboard frontend unit suite using Vitest. The final
  checkout has no frontend unit path to `@playwright/test`, or frontend
  legacy config, setup, output, fixture or built-app substitute infrastructure.
- **Boundary.** Own the last frame/header, project switching, recent
  stories and direct URL/reference navigation cases in `navigation/`
  outside the earlier stories, all remaining legacy `configuration/`,
  Stories' `agent-roster-collection`, and all `test-harness/` cases.
  Prove real deep links, reload and Back/Forward through a named E2E journey
  when required. Audit harness specs for genuine measurement, touch and
  reachability assertions before retiring checks for deleted scaffolding.
- **Cutover.** After the other seven migration outcomes, retire
  `frontend.playwright.config.ts`, its registration and frontend-specific
  Playwright selection and output branches, `frontendGlobalSetup.ts`,
  `frontendApp.ts`, the comparison bundle/mount and `pageTest.ts` paths
  with no surviving consumers,
  `frontendServiceSubstitutes.ts`, `frontendSubstituteAnswers.ts` and
  spent `frontend*Rule.ts`/route state. Trace their transitive imports,
  documentation, package commands, CI and generated-output settings.
  Where E2E or backend owns a shared utility, preserve that use and remove
  its frontend legacy path. Preserve the npm command, filter and list
  behavior, worker admission and deadline, frontend shards, timings, CI
  proof label and publication. Vitest's Chromium browser provider remains
  the driver for mounted unit tests. Keep Playwright Test with E2E and
  the separately scheduled backend migration.
- **Proof and effort.** Large, lower confidence because it retires shared
  entry points. Verify a complete two-worker run including preparation,
  focused file/title and empty selections, the full roster partitioned
  across both CI shards without omissions or duplicates, and timings and
  CI proof consumption. Verify the absence of legacy frontend execution
  and configuration through imports and runner selection, the continued
  E2E/backend entry points, and the behavior and case-count ledger for all
  eight stories. Every intermediate migration is usable on its own while
  the legacy entry still has a consumer.

<a id="frontend-renovation-evidence"></a>

### Frontend renovation evidence

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

#### Intent scope timing history example

The 11 cases of the eight Project and Done scope history specs
(`intent-project-scope-glance`, `intent-scope-glance`,
`intent-project-scope-history-*`) moved from Playwright to Vitest under the
same file names, mounted through `mountIntentCiPage` and
`openDoneStoryComparison` with typed `readScopeHistory` replies (closed
2026-11-22; plan 774 in Git history at `112ade772`). Five alternating
two-worker runs of the eight files including preparation, at load 5–9, gave
medians of 11.23 s before (`0ca3d0028`) and 7.95 s after. The Done drill-down
(1.7–2.5 s) and the refresh walk (1.8–2.1 s) remain the slowest cases.

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
- **The Review changes panel (plan 748, 2026-11-21).** 23 cases over one
  owner took seven slices; a typed `ReviewSourceOnPage` behind
  `useReviewRead` was the only production change. Four of six moving slices
  were returned at acceptance for a dropped or self-supplied check (the
  problem gone after a retry, the eye's tooltip and centring, a
  test-chosen remount key instead of `storyReviewPanelKey`, the comparison
  description after Notes). The panel still needs an inert
  `MachineSessions` of about 30 members for `LaunchesOnPage`, though Follow
  up reads only `records`, and a Done record's body is read over HTTP, so a
  mounted case reaches Add note only through a Taken story. Mounted cases
  took about 0.6 s each; the divider drag and the first details mount cost
  most. Built-app per-case results need
  `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`.
- **Support.** Each story retired the support whose last consumer moved,
  and none could retire a module that E2E or another family still used.
  Steps already owned by an E2E journey (the revision check pace, host
  status cadence) were dropped with that journey named.

#### Frontend group state after seven families

CI run 44855532096 at `be03d5643` (2026-11-21) recorded 812 cases and 1,069
summed seconds after the Review diff and Usage reading stories. 522 built-app
cases in 226 specs took 980 s: Navigation 116 cases (270 s), Intent 102
(193 s), Sessions 92 (156 s), Launches 81 (125 s), Terminals 41 (72 s),
Configuration 36 (71 s), Review 30 (64 s), Stories 21 (29 s) and the test
harness 3 (1 s). Another 128 cases in 44 Intent and test-harness specs run
`pageTest.ts` or `comparisonMountPage.ts` on the Playwright runner (58 s).
The table below is the earlier state at `93235af49`.

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

##### Review diff reading after migration

On the same AC-powered Mac with Node 24.21.0, the focused
`review/story-review-diff --workers=2` selection ran on clean
`4e991ea00` and on the slice 6 working tree at `a3563cf18`.
Both worktrees used their own locked dependencies. Three baseline/revised
pairs ran alternately on 20–21 November 2026 with the macOS sleep guard.
Elapsed seconds include runner preparation. One-minute load was natural.

| Selection | Elapsed seconds | Load before → after |
| --- | ---: | ---: |
| Before 1 | 38.85 | 10.54 → 10.89 |
| After 1 | 21.41 | 10.89 → 18.07 |
| Before 2 | 31.57 | 20.15 → 19.93 |
| After 2 | 17.96 | 19.93 → 20.59 |
| Before 3 | 24.37 | 20.59 → 17.56 |
| After 3 | 13.18 | 17.56 → 16.09 |

The median elapsed time fell 43%, from 31.57 s before to 17.96 s after.
The three original clean runs earlier in the story took 30.924, 29.209
and 28.382 s. This comparison covers the focused Review diff selection
under the observed loads. The full frontend group's time is a separate
measurement.

The original eight built-app specs passed 22 cases. The revised selection
passed 43 mounted cases in six specs and five retained built-app cases in
three specs. The five built-app cases still cover these boundaries.

- File diff and text reads. `syntax-arrival` checks Retry after an
  unavailable file text and plain rendering after a failed grammar load.
- Review revision selection. `syntax-intent-hints` checks the live snapshot
  revision and the published Done revision used to resolve syntax hints.
- Review and Intent rendering. `syntax-appearance` checks token appearance
  against the same Intent source in both schemes. It also observes zero
  additional diff or text reads while switching schemes in Review.

The five audited shared support files fell from 568 to 220 lines.
The word-emphasis opener and fixture retired, the retained diff helper
kept the observations the built-app cases still read, and both grammar
helpers still serve the Intent cases that hold or fail a module load.

Mounted attempts had a median of 56 ms and a maximum of 761 ms.
The table gives each case's median of three attempts, rounded to milliseconds.
Spec names omit `story-review-diff-` and `.spec.ts`.

| Mounted spec | Case | Median ms |
| --- | --- | ---: |
| `syntax-appearance-mounted` | styled changed words keep token colours inside insertions and deletions | 63 |
| `syntax-appearance-mounted` | emphasized tokens and underlines stay readable in light and dark | 97 |
| `syntax-appearance-mounted` | diff tokens on added, removed and unchanged lines read at 4.5:1 in both appearances | 50 |
| `syntax-arrival-mounted` | a diff shown before its text is read stays plain and complete until the text arrives | 172 |
| `syntax-arrival-mounted` | styling that arrives after the diff keeps the reading position, revealed context and an open line menu | 473 |
| `syntax-arrival-mounted` | emphasis is present before tokens arrive and stays on the same words after | 138 |
| `syntax-languages-mounted` | a modified README heading and fence take distinct token colours while markers and backgrounds stay | 45 |
| `syntax-languages-mounted` | a JSON property name and string value take distinct colours from each other and punctuation | 35 |
| `syntax-languages-mounted` | a removed CSS property and colour value differ and stay readable when appearance switches | 71 |
| `syntax-mounted` | a TypeScript diff styles each line by its side's whole text and keeps the plain diff's change facts | 672 |
| `syntax-paths-mounted` | a.ts styles the file's keyword | 159 |
| `syntax-paths-mounted` | a.mts styles the file's keyword | 106 |
| `syntax-paths-mounted` | a.cts styles the file's keyword | 54 |
| `syntax-paths-mounted` | a.tsx styles the file's keyword | 53 |
| `syntax-paths-mounted` | a.js styles the file's keyword | 115 |
| `syntax-paths-mounted` | a.mjs styles the file's keyword | 8 |
| `syntax-paths-mounted` | a.cjs styles the file's keyword | 12 |
| `syntax-paths-mounted` | a.jsx styles the file's keyword | 27 |
| `syntax-paths-mounted` | A.java styles the file's keyword | 22 |
| `syntax-paths-mounted` | a.py styles the file's keyword | 73 |
| `syntax-paths-mounted` | a.sh styles the file's keyword | 33 |
| `syntax-paths-mounted` | a.bash styles the file's keyword | 7 |
| `syntax-paths-mounted` | a.feature styles the file's keyword | 14 |
| `syntax-paths-mounted` | README.md styles the file's keyword | 123 |
| `syntax-paths-mounted` | data.json styles the file's keyword | 39 |
| `syntax-paths-mounted` | a.css styles the file's keyword | 58 |
| `syntax-paths-mounted` | a.yaml styles the file's keyword | 8 |
| `syntax-paths-mounted` | a.yml styles the file's keyword | 21 |
| `syntax-paths-mounted` | a rename from old.txt to new.ts styles by its new path | 10 |
| `syntax-paths-mounted` | a rename from settings.yaml to settings.yml styles by its new path | 22 |
| `syntax-paths-mounted` | notes.txt with no supported extension reads plain | 86 |
| `syntax-paths-mounted` | new.txt with no supported extension reads plain | 84 |
| `syntax-paths-mounted` | scripts/setup.test uses a known hint when its path names no grammar | 23 |
| `syntax-paths-mounted` | scripts/setup-renamed.test uses a known hint when its path names no grammar | 7 |
| `syntax-paths-mounted` | an unfamiliar hint leaves a path-silent file plain | 106 |
| `syntax-paths-mounted` | the file's path grammar wins over a known hint | 17 |
| `word-emphasis-mounted` | changed words in a block are deletions and insertions; copy stays plain | 69 |
| `word-emphasis-mounted` | a three-line rewrap gaining a word emphasizes only that word | 63 |
| `word-emphasis-mounted` | splitting a call across lines emphasizes the added comma, indent and argument | 114 |
| `word-emphasis-mounted` | re-indent emphasizes the changed whitespace on both lines | 109 |
| `word-emphasis-mounted` | a pure addition and revealed context have no word emphasis | 131 |
| `word-emphasis-mounted` | a low-similarity rewrite stays line-level with no word emphasis | 2 |
| `word-emphasis-mounted` | a several-hundred-line block stays line-level while a small block is emphasized | 31 |

##### Usage Token index reading after migration

All 13 cases across the six moved Usage reading specs (`system-settings-usage`,
`-period`, `-estimate`, `-selection`, `-checking`, `-tool`) now mount
[`SystemSettingsUsage`](../../dashboard/src/SystemSettingsUsage.tsx) directly on
headless Chromium over a typed [`UsageSource`](../../dashboard/src/usageSource.ts),
plus 3 mounted cases in
[`system-settings-usage-source.spec.ts`](../../dashboard/frontend-tests/configuration/system-settings-usage-source.spec.ts)
proving `pageUsageSource`'s refusal wording and abort forwarding.

- **Focused 6-spec timing comparison** (`--workers=2`, AC power,
  `caffeinate -s -i`, Node 24.21.0, explicit paths for the 6 moved specs):
  three interleaved warm runs comparing pre-story baseline `1817333330f5`
  against the mounted replacement at matching 1-minute natural load
  (`8.09–12.60`) cut median command elapsed time from **`9.66 s` to `5.78 s`**
  (**`-40.2%`**, `-3.88 s`; summed per-case medians `12.49 s → 5.85 s`,
  `-53.2%`):
  - Pair 1: Before `8.89 s` (load `9.03 → 8.56`) vs After `5.78 s` (load `8.56 → 8.28`)
  - Pair 2: Before `9.66 s` (load `8.28 → 8.09`) vs After `5.63 s` (load `8.09 → 8.32`)
  - Pair 3: Before `12.75 s` (load `8.32 → 12.60`) vs After `8.06 s` (load `12.60 → 12.47`)
  - Slice 1's earlier clean baseline at `1817333330f5` under heavier host load
    (`35.16–40.97`) took `39.25 s`, `45.13 s`, `39.75 s` (median `39.75 s`).
  - Including [`system-settings-usage-source.spec.ts`](../../dashboard/frontend-tests/configuration/system-settings-usage-source.spec.ts)
    (all 7 mounted Vitest specs, 16 cases), three warm runs took `7.09 s`,
    `6.63 s`, `6.23 s` (median **`6.63 s`**, load `7.82–8.24`).
- **Audited `dashboard/test-support/support/` Usage support (`wc -l`):**
  `697 → 675` total lines (`-22` lines):
  - [`systemSettingsUsagePage.ts`](../../dashboard/test-support/support/systemSettingsUsagePage.ts):
    `216 → 194` lines (`-22`). Removed zero-consumer re-export `UsageToolName`,
    unexported internal `expectGeneralSettingsShown`, `openUsage`,
    `TaskDetail`, and `usageView`, and removed zero-consumer `usageView`
    methods `showsDaysProblem`, `showsLoading`, `showsPartialPoints`,
    `showsNoPoints`, and `showsNoProblem`. Kept `visitUsage` and the remaining
    19 `usageView` methods consumed by the 5 retained built-app chart specs
    (`-average`, `-compare`, `-legend`, `-overflow`, `-spacing`) and 4
    `e2e/configuration/system-settings-usage*` journeys.
  - [`usageSpacingPage.ts`](../../dashboard/test-support/support/usageSpacingPage.ts):
    `71 → 71` lines. Unexported internal `taskOrderWords`; kept `usageSpacing`
    and its 7 methods for `-spacing` and
    [`e2e/configuration/system-settings-usage-tools.spec.ts`](../../e2e/configuration/system-settings-usage-tools.spec.ts).
  - [`usageToolsPage.ts`](../../dashboard/test-support/support/usageToolsPage.ts)
    (`115`), [`usageChartPage.ts`](../../dashboard/test-support/support/usageChartPage.ts)
    (`221`), and [`usageLegendPage.ts`](../../dashboard/test-support/support/usageLegendPage.ts)
    (`74`): unchanged; every export and method remains consumed by the 5 chart
    specs and/or 4 E2E journeys.
- **Reusable building blocks for the 20 retained chart cases** (`-average`,
  `-compare`, `-legend`, `-overflow`, `-spacing`):
  - the typed source (`UsageSource` in [`dashboard/src/usageSource.ts`](../../dashboard/src/usageSource.ts))
  - the page MakeMe entry (`makeMe.aTokenIndexAnswer` in [`Distribution/tests/support/pageMakeMe.mjs`](../../Distribution/tests/support/pageMakeMe.mjs))
  - the mounted Usage page objects ([`system-settings-usage-page.ts`](../../dashboard/frontend-tests/configuration/system-settings-usage-page.ts) and [`system-settings-usage-tools-page.ts`](../../dashboard/frontend-tests/configuration/system-settings-usage-tools-page.ts))
- **Removed built-app cases paired with mounted replacements and per-case median durations** (`0` cases removed as E2E-only duplicates; every distinct assertion across all 13 moved cases preserved in place; the 4 `e2e/configuration/system-settings-usage*` journeys — [`system-settings-usage.spec.ts`](../../e2e/configuration/system-settings-usage.spec.ts), [`-period.spec.ts`](../../e2e/configuration/system-settings-usage-period.spec.ts), [`-tools.spec.ts`](../../e2e/configuration/system-settings-usage-tools.spec.ts), [`-estimate.spec.ts`](../../e2e/configuration/system-settings-usage-estimate.spec.ts) — stay intact proving the real store, filters, and Refresh; average median `450 ms` across the 13 moved cases, `428 ms` with the 3 `pageUsageSource` cases):

| Spec (`dashboard/frontend-tests/configuration/`) | Removed built-app case title | Mounted Vitest case | 3-run attempts (ms) | Median (ms) |
| --- | --- | --- | --- | ---: |
| `system-settings-usage.spec.ts` | `"ten eligible tasks draw their one rolling median value"` | `system-settings-usage.spec.ts:34` (same title) | `59, 57, 93` | `59` |
| `system-settings-usage.spec.ts` | `"partial and unpriced tasks explain a sparse trend, and an empty cohort explains its absence"` | `system-settings-usage.spec.ts:45` (same title) | `392, 173, 229` | `229` |
| `system-settings-usage.spec.ts` | `"task detail distinguishes repeated launches and unknown outcomes, with keyboard selection and focus restoration"` | `system-settings-usage.spec.ts:97` (same title) | `684, 594, 1002` | `684` |
| `system-settings-usage-period.spec.ts` | `"local calendar requests retain the last valid day view through invalid input and cohort changes"` | `system-settings-usage-period.spec.ts:27` (same title) | `291, 317, 322` | `317` |
| `system-settings-usage-period.spec.ts` | `"empty periods explain their counts and do not show an old median"` | `system-settings-usage-period.spec.ts:89` (same title) | `20, 26, 36` | `26` |
| `system-settings-usage-selection.spec.ts` | `"a failure leaves once its selection is read again"` | `system-settings-usage-selection.spec.ts:25` (same title) | `775, 499, 1045` | `775` |
| `system-settings-usage-selection.spec.ts` | `"a failure leaves once a day round trip reads its period again"` | `system-settings-usage-selection.spec.ts:59` (same title) | `389, 262, 276` | `276` |
| `system-settings-usage-selection.spec.ts` | `"an answer for a selection already left never joins the one shown"` | `system-settings-usage-selection.spec.ts:95` (same title) | `475, 264, 696` | `475` |
| `system-settings-usage-tool.spec.ts` | `"adding Claude Code keeps a Codex-only model, offering both tools' models once; hiding Codex then resets that model and keeps the workflow and a shared effort"` | `system-settings-usage-tool.spec.ts:24` (same title) | `736, 424, 713` | `713` |
| `system-settings-usage-tool.spec.ts` | `"the Claude Code cohort names, once and in words, the background work it leaves out and each task's own missing usage; Codex names no left-out work"` | `system-settings-usage-tool.spec.ts:98` (same title) | `929, 440, 1319` | `929` |
| `system-settings-usage-checking.spec.ts` | `"checking survives a selected cohort read and waits for Refresh's selected-cohort reread"` | `system-settings-usage-checking.spec.ts:41` (same title) | `713, 553, 744` | `713` |
| `system-settings-usage-checking.spec.ts` | `"a failed Refresh after a filter change retains the selected chart and time beside its error"` | `system-settings-usage-checking.spec.ts:96` (same title) | `337, 296, 396` | `337` |
| `system-settings-usage-estimate.spec.ts` | `"refreshing to an explicit rate replaces the estimate and keeps another model's warning"` | `system-settings-usage-estimate.spec.ts:42` (same title) | `316, 233, 665` | `316` |
| `system-settings-usage-source.spec.ts` | — *(added for `pageUsageSource`)* | `system-settings-usage-source.spec.ts:30` (`"a refused read shows Usage could not be read. or the endpoint's own message"`) | `58, 81, 91` | `81` |
| `system-settings-usage-source.spec.ts` | — *(added for `pageUsageSource`)* | `system-settings-usage-source.spec.ts:61` (`"a refused Refresh shows Usage could not be refreshed. or the endpoint's own message"`) | `440, 465, 477` | `465` |
| `system-settings-usage-source.spec.ts` | — *(added for `pageUsageSource`)* | `system-settings-usage-source.spec.ts:99` (`"leaving a pending read aborts the page source's request"`) | `104, 111, 106` | `106` |

##### System settings sections and Usage charts after migration

The nine Configuration specs in the table below moved all 29 original cases
to mounted Chromium. Each built-app title, including its viewport context,
matches one mounted title at the same spec path. No whole case was omitted.
The retained built-app appearance and Settings Look cases still observe the
real outer Settings heading and sticky header.

The local comparison ran the same nine explicit spec paths with two workers
on the AC-powered arm64 Mac under `caffeinate -s -i` and Node 24.21.0.
Three runs in a detached checkout of `0759aff061` with its own locked
`npm ci` install interleaved with three runs from `75ba18360` and the
support cleanup in the working tree. Each run passed 29 cases with no retry.
The elapsed time includes runner startup. The parenthesized values are
one-minute load before and after each run.

| Pair | Built app | Mounted |
| --- | ---: | ---: |
| 1 | 34.864 s (15.76 → 17.23) | 14.090 s (17.23 → 17.02) |
| 2 | 27.731 s (17.02 → 18.30) | 17.645 s (18.30 → 15.75) |
| 3 | 22.312 s (15.75 → 13.07) | 14.366 s (13.07 → 11.94) |

Median focused elapsed time fell from **27.731 s to 14.366 s**
(**48.2% less**). The earlier clean baseline took 25.624, 26.558
and 36.570 s at one-minute starting loads of 5.53, 7.47 and 12.23. The
interleaved comparison reflects this machine and selection at the observed
load.

Tracked Dashboard Test Support fell from 83,084 lines in 797 files at the
published baseline to 82,626 lines in 796 files. The earlier reading move
removed 40 lines from `settingsTouchPage.ts`. The final cleanup removed 418
more across `frontendSettingsSubstitutes.ts` (63), `systemSettingsUsagePage.ts`
(17), `usageChartPage.ts` (200), `usageLegendPage.ts` (74),
`usageSpacingPage.ts` (32), and `usageToolsPage.ts` (32).

The times below are milliseconds from each runner's completed case record.
The mounted attempts are shown in run order, rounded to the nearest
millisecond. Each median is computed from the original three durations
before rounding.

| Configuration spec | Original and mounted case title | Built-app median | Mounted attempts | Mounted median |
| --- | --- | ---: | ---: | ---: |
| `project-add-dialog.spec.ts` | Cancel and Escape save nothing, return focus and keep project arrows inside the modal | 1110 | 425, 932, 720 | 720 |
| `project-add-dialog.spec.ts` | origin mismatch stays linked to the path, retains both inputs and saves nothing | 1374 | 284, 689, 737 | 689 |
| `system-settings-openai.spec.ts` | a held status response cannot overwrite successful remove | 1338 | 610, 981, 709 | 709 |
| `system-settings-openai.spec.ts` | a held status response cannot overwrite successful save | 889 | 212, 467, 340 | 340 |
| `system-settings-openai.spec.ts` | a held status response cannot overwrite successful save after read error | 811 | 306, 683, 601 | 601 |
| `system-settings-openai.spec.ts` | phone OpenAI settings recovery › touch keeps the password draft and the configured key through reduced height, rotation, a refused save and explicit recovery | 2755 | 2347, 3180, 2829 | 2829 |
| `system-settings-project-management-touch.spec.ts` | phone project settings editing › touch edits at reduced height and retries a refused save with the exact draft | 2486 | 2116, 2889, 2088 | 2116 |
| `system-settings-terminal-theme.spec.ts` | phone terminal theme recovery › touch reads the theme, keeps the saved theme shown after a refused save, and reaches Retry after rotation | 3151 | 1496, 1768, 1855 | 1768 |
| `system-settings-terminal-theme.spec.ts` | terminal Light and Solarized samples keep their palette while settings chrome follows the system appearance | 741 | 102, 162, 95 | 102 |
| `system-settings-usage-average.spec.ts` | 200% zoom › day control, task actions and true overflow values remain readable without hovering | 1283 | 483, 688, 373 | 483 |
| `system-settings-usage-average.spec.ts` | an in-scale median breaks across above-scale observations and all-large medians stay explicit | 663 | 98, 69, 77 | 77 |
| `system-settings-usage-average.spec.ts` | narrow touch › day control, task actions and true overflow values remain readable without hovering | 986 | 341, 585, 529 | 529 |
| `system-settings-usage-average.spec.ts` | the chart shows a one-million median and the sixty-five-million task separately | 752 | 53, 63, 100 | 63 |
| `system-settings-usage-average.spec.ts` | the rolling median is distinct above dots and never enlarges ordinary geometry | 889 | 125, 143, 140 | 140 |
| `system-settings-usage-compare.spec.ts` | an empty tool says so, a failed read names its tool, and neither tool asks for one | 1589 | 448, 879, 528 | 528 |
| `system-settings-usage-compare.spec.ts` | both tools share one time axis and scale with their own medians, units and notes, keeping each task's tool through inspection | 1393 | 881, 1056, 514 | 881 |
| `system-settings-usage-compare.spec.ts` | each tool's marks differ by shape, partial ones keep the caution stroke, and either tool's selected task is the one larger diamond | 1345 | 364, 730, 596 | 596 |
| `system-settings-usage-compare.spec.ts` | narrowest reading window › tool choices work by keyboard and a compared point opens by touch, in light and dark, without sideways scroll | 2024 | 969, 996, 1125 | 996 |
| `system-settings-usage-compare.spec.ts` | phone › tool choices work by keyboard and a compared point opens by touch, in light and dark, without sideways scroll | 1742 | 880, 1550, 1360 | 1360 |
| `system-settings-usage-legend.spec.ts` | narrowest reading window › the compared key fits without sideways scroll in light and dark | 1373 | 90, 220, 193 | 193 |
| `system-settings-usage-legend.spec.ts` | phone › the compared key fits without sideways scroll in light and dark | 1228 | 113, 262, 263 | 262 |
| `system-settings-usage-legend.spec.ts` | the key and summary swatches show each shown tool's marks, and a hidden tool leaves the key | 1663 | 323, 602, 371 | 371 |
| `system-settings-usage-overflow.spec.ts` | coincident large tasks remain separate by pointer touch and keyboard with partial details and focus return | 2374 | 1446, 2440, 2452 | 2440 |
| `system-settings-usage-overflow.spec.ts` | exactly fifty million remains ordinary and measured zero keeps an honest scale | 846 | 129, 90, 70 | 90 |
| `system-settings-usage-overflow.spec.ts` | large tasks keep actual values and dates without flattening ordinary points | 1106 | 186, 338, 231 | 231 |
| `system-settings-usage-spacing.spec.ts` | an above-scale median stands at its own large task's slot under equal spacing | 984 | 203, 605, 392 | 392 |
| `system-settings-usage-spacing.spec.ts` | equal spacing gives each shown task one slot in completion order across tools, keeps medians on their tasks and actual times, and restores time positions | 2333 | 1377, 2366, 1327 | 1377 |
| `system-settings-usage-spacing.spec.ts` | narrowest reading window › equal spacing works by keyboard and its points open by touch, in light and dark, without sideways scroll | 1935 | 1011, 1366, 1266 | 1266 |
| `system-settings-usage-spacing.spec.ts` | phone › equal spacing works by keyboard and its points open by touch, in light and dark, without sideways scroll | 1946 | 996, 1778, 1385 | 1385 |

##### Review changes panel reading after migration

The eleven Review changes panel specs (23 cases) ran by file with
`--workers=2` on AC power under the macOS sleep guard. Built-app at
`17fe6c2c4` (load 6–9): 30.8, 34.5 and 29.7 s elapsed. Mounted on the
slice 7 working tree at `5a6b3f667` (load 8.3 → 10.5, 10.5 → 17.6,
17.6 → 16.0): 16.7, 16.6 and 11.0 s. The median fell 46%, from 30.8 s to
16.6 s, under a higher load than the baseline, so the baseline was not
rerun. Mounted cases took a median of 488–693 ms and 593–787 ms on average
per run (58 ms to 2.9 s; the divider drag and the first details mount
are slowest). Retiring the support the moved cases left behind took
`dashboard/test-support/` from 79,355 to 79,143 lines (753 modules).

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
