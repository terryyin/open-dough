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

<a id="narrow-ad-hoc-review-handler-contracts"></a>

### Narrow the ad hoc review handlers' contracts to what they read

**Identity:** SEED-413#narrow-ad-hoc-review-handler-contracts
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/725-narrow-ad-hoc-review-handler-contracts/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ce81021981f609bd52b2d1b4133e092749258fa0d76f60347e0ed2622a7398b5","plan":"1038a1fd7f85069b2047b7378a4bdb84fbcffbb155b2428bbbaa777e45055b8d"}}
```

Correction of the typed ad hoc review handlers
(`SEED-413#renovate-dashboard-backend-unit-tests`, recoverable at
`b3b57f9f92ff351d1abf1df189e994954fc3e4f8:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md`) after
their execution's retrospective.

- **Goal.** Developers who call the ad hoc review handlers, or copy them as
  the reference family, get a contract that holds only what each read uses,
  so a case cannot build input the handler ignores or refuses. A departed
  reader's file read also stops its admission Git reads. The wire answers
  every non-aborted read as it does today.
- **Scope.**
  - A session review read and a session file read get their own typed
    shapes. These carry no story-only field. The handler's copy of the
    adapter's refusal for a published completion on a session read is
    deleted.
  - Admission takes the file handlers' request signal and keeps each existing
    30-second deadline. Request cancellation stops the read. Expiry while the
    caller stays active keeps the existing refusal. Follow-up admission also
    keeps its existing deadlines.
  - Placement and naming: the reading of process-wide stores sits in adapter
    modules. File admission is separate from the range read's adapter. The
    admitted-file type is named for every file read, the session lookup is
    written once, and the stale comment is fixed. The backend README points
    at the moved module.
  - The landed ad hoc session and the session with a kept run become
    `LaunchRecordBuilder` steps, and the session review read builder
    composes them.
- **Scope limits.** Moving `ad-hoc-session-commits-file-text.spec.ts` and the
  Default main landing case to unit cases stays with the
  [completed Done capture family](https://github.com/terryyin/open-dough/blob/8f4cc9480ccb0b736e3b29c787ab49a6ac80d366/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-remaining-dashboard-backend-unit-tests). The
  [file-read follow-up](#refuse-story-launch-session-file-reads) owns the
  story-launch refusal. Story subjects keep their admission path.
- **Plan.** [725](../slice-plans/725-narrow-ad-hoc-review-handler-contracts/PLAN.md)

<a id="refuse-story-launch-session-file-reads"></a>

### Direct story-launch file reads to their story

**Identity:** SEED-413#refuse-story-launch-session-file-reads
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/726-direct-story-launch-file-reads-to-their-story/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bea5c06226a2ffbb401764af913d1f00585feb053edec78301d8c9a04fe5aeb6","plan":"dbf1d4e467385c136dd122eb0bcdf949f6cd6a7d48a5bc82c38ecf1749301aba"}}
```

- **Goal.** A dashboard reader who requests a story launch's diff or file text
  by session learns to open the file through its story. The reply matches the
  direction the session review already gives.
- **Scope.** Resolve the kept launch by project, host, and session. Share the
  session review's eligibility rule with both file endpoints. Use the kept
  launch's recorded story identity to decide before either reference or
  comparison-pair admission can read the comparison or its repository. Keep
  existing query validation and the rules for unknown projects and sessions.
- **Key examples.**
  - Given a kept story launch, a well-formed session-addressed diff or text
    request receives HTTP 400 with “This session belongs to a story launch
    and is reviewed by its story.” The response is the same with a launch
    reference or the comparison pair alone.
  - Given that launch's captured comparison and a valid file, naming the
    story identity and retained reference returns the diff or file text for
    that same comparison.
  - Given a standalone ad hoc session, its valid retained comparison and file
    still return the diff or file text. A mismatched kept pair still gets
    HTTP 409.
- **Scope limits.** The [handler contract correction](#narrow-ad-hoc-review-handler-contracts)
  owns input typing, cancellation, adapter placement, and test-builder cleanup.
- **Plan.** [726](../slice-plans/726-direct-story-launch-file-reads-to-their-story/PLAN.md)

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
  1. The rest of ad hoc review, which retires `adHocReview.ts`: the branch
     result with its handoff (115 s in 18 cases) and manual landing (94 s in
     12 cases), on the Done seam the capture family shows; then Done's
     lifecycle (native and reported Done, the held checkout read) and record
     deletion and expiry (about 24 s in 14 cases).
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
moved the Project Intent apply-and-retry cases.

**Goal.** Give dashboard developers readable UI unit tests and feedback from
the complete frontend group in roughly a minute at the usual two workers,
including preparation. This carries the suite-wide commitments, including
SEED-404's timing goal and SEED-301's Intent MakeMe work.

**Scope and order.** Select families by feature folder and the interaction
each view owns. Continue in Intent and Sessions. In Intent, the original
revision family leaves four built-app cases for the next boundary: the
Development → Intent cases in `intent-revision-notice.spec.ts` and
`intent-revision-update-outcomes.spec.ts`, the project switch in
`intent-revision-update-boundaries.spec.ts`, and the planning-only update
and return in `intent-revision-planning-only.spec.ts`. The two Optimization
Candidates revision cases also remain here, including late answers. Keep
each legacy case until its replacement exercises its actual boundary.
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
- Mount the component that owns the behavior through an explicit typed
  contract, under "Design production code for testability" in the
  refactoring checks. When a fixture needs unrelated providers, stylesheets or
  service answers, change the production contract first. The Project Intent
  revision family did this with `ProjectIntentReading`.
- Render and act in each moved case as soon as the page allows, under
  [Which entry a case uses](../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and the [North Star](../NORTH-STAR.md#act-as-soon-as-the-page-allows-retire-actsettled).
  Remove `actSettled`, React `act` wrapping and `IS_REACT_ACT_ENVIRONMENT`
  from the mounted families already moved (Story Notes, Project CI history,
  the phone board) when the family is next touched. Retire
  `mountedActSettled.ts` and its harness case with `mountedDashboard.ts`.
  Measured on the five Project Intent revision cases on 2026-11-20, removing
  `actSettled` cut the median summed case time from 7.16 s to 5.75 s (10
  runs each, five interleaved pairs all faster) with 31 consecutive green
  runs. The built app summed 6.28 s for the same cases. The remaining cost is
  mostly browser-driven clicks of about 150 ms each. Expect the gain
  in group elapsed time once a selection needs no app build. The
  built-app `intent-read-recovery`, `intent-gherkin-settings-problems` and
  `intent-revision-update-boundaries` specs still hand-write the
  `IntentLocationsAnswer` that `makeMe.anIntentLocationsAnswer` now builds.
  No maintained case completes a successful **Show latest** through the composed
  `IntentPerspective`; the mounted cases render `ProjectIntentReading` alone.
  Intent Coverage at `89401655a` found the remaining built-app cases catch a
  composition fault only at the offer. When those cases move, keep one
  composed journey that applies the latest revision successfully.
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
