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
  arrangement. Recount the review families after
  [Review published changes](SEED-427-review-published-changes.md#review-published-changes)
  so migration covers the surviving published-review cases and fixtures.
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

The former catch-all backlog entry is superseded by the stories below.
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
| 2d″ | Get fast proof of Intent collected scope timing and chart marks (completed; recoverable at `d156695c5:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-reading`) | 14 | 8 |
| 2e | Get fast proof of Intent attempt and Summary proof (completed; recoverable at `4f454b0a29e118c54e7d8eae64ad12f7c2f6c900:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-attempt-and-summary-proof`) | 49 | 18 |
| 3a | Get fast proof of Intent locations read recovery and settings problems (completed; recoverable at `e0f7d6a6a:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-and-story-reading`) | 7 | 2 |
| 3b | Get fast proof of Intent source browsing and pinned links (completed; recoverable at `8fb7691cc:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-browsing-and-detours`) | 12 | 10 |
| 3b′ | Get fast proof of Intent revision reading and reading-place detours (completed; recoverable at `3619577173:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-revision-and-detour-reading`) | 10 | 7 |
| 3c | Get fast proof of story changes, Done references, notes and recorded progress (completed; recoverable at `981048196:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-story-changes-notes-and-progress-reading`) | 41 | 19 |
| 4 | Get fast proof of board and side-panel interactions (completed) | 63 | 28 |
| 5 | Get fast proof of composing and starting a launch (completed; recoverable at `9099d16787c4d0961075c841d3da2987712f508a:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-launch-proof`) | 81 | 29 |
| 6 | Get fast proof of finding and reviewing Done sessions (completed; recoverable at `9eacf1dd1ef87a3a52ab40f14ac22ff6f11dc13c:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-done-session-review-proof`) | 77 | 34 |
| 7 | Get fast proof of live sessions and terminal work (completed; recoverable at `290706bb1557f5437eb54df4d97da62cc1648457:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-live-session-and-terminal-proof`) | 77 | 31 |
| 8a | Get fast proof of the dashboard frame, navigation and settings (completed; recoverable at `ad76d2ebbb88abe998fa1300963627dd10ac6551:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-frame-and-navigation-proof`) | ≈67 | 22 |
| 8b | [Run the entire dashboard frontend unit suite on Vitest](#retire-legacy-dashboard-frontend-runner) | ≈11 | 3 |
| | **Total** | **594** | **249** |

The first two cover the evidence maintainers use to review a story's intent.
They reuse production owners already accepting typed evidence and exercise
the highest-leverage distinction early: presentation can consume held
evidence, while refresh and stale-answer protection must exercise the real
reader. The next five each deliver faster proof for a complete workflow and
can be used independently. Story 8a moves the remaining frame, navigation
and settings cases. Story 8b audits the harness and retires the frontend
runner. It starts once every other story has moved its legacy cases, which
accounts for its small case inventory. Counts for 8a and 8b come from the
legacy specs at `24ae92074` and include three Intent story-changes specs
that no completed story moved. The effort
hypotheses are large relative to the recent 23- and 29-case stories.
Confidence is highest for owners that take typed props. Full-page history,
live terminal behavior, and runner integration carry more uncertainty.
Moving only the engine would leave whole-app setup and repetitive cases.
Continuing one component at a time would extend the life of both runners.

#### Acceptance shared by the frontend stories

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

<a id="retire-legacy-dashboard-frontend-runner"></a>

### Run the entire dashboard frontend unit suite on Vitest

**Identity:** SEED-413#retire-legacy-dashboard-frontend-runner
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#retire-legacy-dashboard-frontend-runner","dependencies":[{"supplier":{"identity":"SEED-413#speed-dashboard-done-session-review-proof","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-done-session-review-proof"},"implementation":"The supplier moves every legacy frontend case in its boundary onto Vitest and removes the support those cases alone used.","rationale":"The cutover deletes the legacy frontend runner, its built-app setup and its substitutes. While a Done review spec still runs on that runner, deleting it would drop that proof, and moving those cases is the supplier’s own scope.","condition":"No legacy frontend spec in the supplier’s Done review boundary remains on trunk.","state":"waiting"},{"supplier":{"identity":"SEED-413#speed-dashboard-live-session-and-terminal-proof","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-live-session-and-terminal-proof"},"implementation":"The supplier moves every legacy frontend case in its boundary onto Vitest and removes the support those cases alone used.","rationale":"The cutover deletes the legacy frontend runner, its built-app setup and its substitutes. While a live session and terminal spec still runs on that runner, deleting it would drop that proof, and moving those cases is the supplier’s own scope.","condition":"No legacy frontend spec in the supplier’s live session and terminal boundary remains on trunk.","state":"satisfied","resolution":{"revision":"290706bb1557f5437eb54df4d97da62cc1648457","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-live-session-and-terminal-proof","summary":"All 31 formerly legacy specs in this supplier boundary select Vitest with the same contents as the tested campaign at integrated revision 92ab15e07689d189d5484d1c89fe472d0cf547eb. The focused mounted selection passed 80 cases in 37 files, including the five already-mounted sidebar files. Plan 800 records the migration inventory, unchanged native E2E boundaries and focused run.\nCondition satisfied: No legacy frontend spec in the supplier’s live session and terminal boundary remains on trunk.\nAccepted integration: 92ab15e07689d189d5484d1c89fe472d0cf547eb on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#speed-dashboard-frame-and-navigation-proof","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-frame-and-navigation-proof"},"implementation":"The supplier moves every legacy frontend case in its boundary onto Vitest and removes the support those cases alone used.","rationale":"The cutover deletes the legacy frontend runner, its built-app setup and its substitutes. While a frame, navigation and settings spec still runs on that runner, deleting it would drop that proof, and moving those cases is the supplier’s own scope.","condition":"No legacy frontend spec in the supplier’s frame, navigation and settings boundary remains on trunk.","state":"satisfied","resolution":{"revision":"ad76d2ebbb88abe998fa1300963627dd10ac6551","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-frame-and-navigation-proof","summary":"At integrated revision 2b5ad6affc3613c048318f12d23f5d09433fce1d, all 22 originally scoped frontend spec paths either select Vitest or were retired with their observations reassigned. Plan 802 at the before-cleanup revision records the exact assertion map, 52 mounted passes, the real-history and Retry E2E, and the no-legacy audit. The integrated live-session overlap passed typecheck and 18 targeted cases in eight specs.\nCondition satisfied: No legacy frontend spec in the supplier’s frame, navigation and settings boundary remains on trunk.\nAccepted integration: 2b5ad6affc3613c048318f12d23f5d09433fce1d on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/800-run-the-entire-dashboard-frontend-unit-suite-on-vitest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"70ced1c4fd5f863a78561fdc7753002f72fd3a45fc8360d0ad1d93b113c6f725","plan":"db4d681532b2f73a01775427f30b9cbcb1e4d466bd487aac3c00e307ef743135"}}
```

**Goal:** A maintainer can list, filter, run and review CI proof for the
complete dashboard frontend unit suite using Vitest alone. The final
checkout has no frontend unit path to `@playwright/test`. It also has no
frontend legacy config, setup, output, fixture or built-app substitute
infrastructure. The suite completes in about one minute at two workers,
or the report states the remaining cost.

**Scope:**

- **Harness audit.** Audit the three `pageTest.ts` specs in `test-harness/`
  (observation measurements, control reachability and touch reading). Keep
  each genuine measurement, touch or reachability assertion on a Vitest
  owner. Retire checks that only prove deleted scaffolding, and map each
  one to its reason.
- **Cutover.** Retire `frontend.playwright.config.ts`, its registration and
  frontend-specific Playwright selection and output branches in the group
  command and runner support. Retire `frontendGlobalSetup.ts`,
  `frontendApp.ts`, `frontendAppServer.ts`, the comparison bundle and mount,
  `pageTest.ts`, `frontendServiceSubstitutes.ts`,
  `frontendSubstituteAnswers.ts` and the spent `frontend*` substitute,
  rule and route-state modules. Trace their transitive imports,
  documentation, package commands, CI and generated-output settings.
  Backend specs that assert the frontend preparation, such as
  `test-preparation-frontend` and `dashboard-artifact-demand`, change to
  the preparation that remains.
- **Preserved behavior.** Keep the npm command and its file, title, list
  and empty selections; worker admission and deadline; frontend shards and
  timings; and the CI proof label and its publication. Where E2E or
  backend owns a shared utility, keep that use and remove only the
  frontend legacy path. Vitest's Chromium browser provider remains the
  driver for mounted unit tests. Playwright Test stays with E2E and the
  separately scheduled backend migration.
- **Scope limit.** Evaluation case overlays that run against a pinned
  revision keep that revision's files.

**Key examples:**

- `npm run test:dashboard:frontend -- --list` lists every frontend case
  under the Vitest projects only. A file filter, a title filter, and a
  filter that matches nothing each behave as they did with two runners.
- The CI `dashboard-frontend` shards together run the full roster with no
  omission or duplicate. The published proof and the timings that the
  shard split reads come from Vitest alone.
- A search of the dashboard for frontend imports of `@playwright/test` and
  for the retired modules finds nothing. The E2E and backend commands still
  list and run their own cases.
- A complete local two-worker run including preparation is measured
  against the [campaign baseline](#frontend-campaign-baseline) of 7 min
  15 s. The report gives the actual time and the slowest remaining cases.
- The behavior and case-count ledger accounts for every story in the frontend
  campaign.

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
