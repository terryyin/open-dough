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
  (retiring `frontend.playwright.config.ts`, `.mounted.spec.ts` split naming,
  and dual-runner glue in `scripts/test-frontend.mjs`), and
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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/724-narrow-ad-hoc-review-handler-contracts/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2dec45ebed1e102a783d0d786655f85daeed2f59bc6ac3e5b5304565e685f695","plan":"d93ea5d9097ee47757dfd4585557ad64842fb040413a66d67cacc36d9968cd16"}}
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
  - Admission takes the file handlers' signal. Only follow-up admission,
    which has no response, keeps its own 30 s bound.
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
  [remaining families](#renovate-remaining-dashboard-backend-unit-tests). This
  correction does not change whether the file read refuses a story launch's
  session; that refusal is a product question. Story subjects keep their
  admission path.
- **Plan.** [724](../slice-plans/724-narrow-ad-hoc-review-handler-contracts/PLAN.md)

<a id="renovate-remaining-dashboard-backend-unit-tests"></a>

### Renovate the remaining dashboard backend unit-test families around typed server handlers

**Identity:** SEED-413#renovate-remaining-dashboard-backend-unit-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

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
    one typed contract with `dashboard/src/`.
  - Give each behavior one owner. Move single-service cases to plain Node
    Vitest through the handlers; keep one focused wire check where admission,
    origin refusal, status or framing is the behavior; drop a case another
    group already owns.
  - State arrangement through MakeMe. Driving a launch to arrange a review
    costs 6–13 s per case in CI against about 1 s from kept records, so the
    handler seam alone leaves most of a launch-arranged family's time in
    place.
  - Delete retired `dashboard/test-support/` wrappers, add none, and leave no
    behavioral regression gap.
- **Order.** Highest CI seconds first among the families whose seam the
  earlier ones have shown, as a railway converts its busiest lines first
  while both gauges run. The count of specs still on `@playwright/test` is
  the campaign's progress, and the two-engine group run is its carrying cost
  until that count is zero.
  1. The rest of ad hoc review: Done's capture of session commits, then the
     branch result and manual landing journeys (about 230 s), which retire
     `adHocReview.ts`.
  2. `intent/` landed CI, resolving the load sensitivity of `SEED-324` and
     `SEED-319` and giving the module-level memos in `followUpStory.ts`,
     `ciProofArtifact.ts`, `ciAdapterProof.ts`,
     `baseCiGithubRevisionLookup.ts` and `LandedCiCollection.close()` an
     owner (recoverable at
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
    preload, a held connection). They stay wire or process checks and run on
    Node Vitest.
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

<a id="renovate-dashboard-frontend-unit-tests"></a>

### Prove Project CI history through the components that show it

**Identity:** SEED-413#renovate-dashboard-frontend-unit-tests
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#renovate-dashboard-frontend-unit-tests","dependencies":[{"supplier":{"identity":"SEED-413#pilot-direct-dashboard-unit-tests","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#pilot-direct-dashboard-unit-tests"},"implementation":"The pilot publishes the browser-loadable MakeMe entry and configures Dashboard Frontend Test to use MakeMe without frontend page objects.","rationale":"The history cases must be selected by Intent as *.spec.ts and exercise their components directly. Today that selection requires page objects, and the aggregate MakeMe entry loads Node modules. Supplying another browser entry or changing the conventions in this family would duplicate the pilot's assigned change.","condition":"On trunk a Dashboard Frontend Test case uses the shared browser-loadable MakeMe entry, and the project selector reports makeMe true and pageObjects false for that case.","state":"satisfied","resolution":{"revision":"6723c8e2c2d65e78fa11aad404c69660030f5633","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#pilot-direct-dashboard-unit-tests","summary":"Satisfied: Distribution/tests/support/pageMakeMe.mjs is the shared browser-loadable MakeMe entry, imported by dashboard/frontend-tests/stories/story-notes-dialog.mounted.spec.ts and story-notes-control.mounted.spec.ts, which pass; .planning/open-dough.json sets pageObjects false on dashboard/frontend-tests and test-entry-rules reports makeMe true, pageObjects false for a frontend spec.\nCondition satisfied: On trunk a Dashboard Frontend Test case uses the shared browser-loadable MakeMe entry, and the project selector reports makeMe true and pageObjects false for that case.\nAccepted integration: 36d7dfa9e3f39ea4767cafc7848349ffdddd490e on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/722-project-ci-history-component-tests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"391bd9a4717d51ba30aaab5449cc5690a367fddebb65b9876e03d3dbd8a260c4","plan":"eebd29e314cf98279bc4bda637cb60deeb7ce9a4342a9c04b2474d5e665b2885"}}
```

**Goal.** A developer changing Project Intent's CI history can check its
display, evidence and keyboard access in headless Chromium using prepared
history, judgment and proof. This is the first Intent family after the Story
Notes pilot. The remaining families carry the full-suite timing target.
[Remaining frontend renovation](#renovate-remaining-dashboard-frontend-unit-tests).

**Scope.** Migrate the five cases in the four `intent-ci-wall-time-history*`
specs from the built app to plain Vitest Browser Mode. Preserve each distinct
assertion, including phone layout, exact evidence wording, run links, dates
and the shape of the chart. Keep the existing family filter, case listing and
CI proof. Compare summed case time to the same family's built-app baseline
and report command elapsed time separately. Unit cases use typed MakeMe inputs
and add zero test-support wrappers. Retire only support that loses its last
consumer. History collection, the size of the server's retained window,
Done-story and scope histories, and final runner retirement have other owners.

**Key examples.**

- Two measured builds flank a gap, with build dates running backwards in
  landing order → the reader opens Builds and evidence → all three rows keep
  the answer order, the heading spans the actual build dates, and no line
  connects the points across the gap. A supplied measured time can differ
  from the run's wall time.
- The supplied window contains twenty measured builds and six gaps →
  the reader views the chart and expands its evidence → the duration rises
  and falls with the measured values, every break is visible, and all 26
  entries have their evidence. An empty history leaves the judgment and
  Proof visible and offers no evidence disclosure.
- On a 390 px phone the reader focuses Check again → Shift+Tab opens the
  path to Builds and evidence, Enter expands it, and successive Tabs reach
  the named run links in order. The gap-only answer still explains each gap,
  and the page and the history fit the viewport.

**Architecture.** `IntentCiHistory` owns the evidence rows, date extent and
chart. Its `HistoryReading` input already represents what a successful read
supplies. Use the existing CI history builder and production conversion
`measuredHistoryOf`; expected dates, values and chart breaks come from the
case. `JudgedBranch` owns the combination of judgment, Proof, history and
Check again, so it is the smallest owner for keyboard order and sibling
visibility. A whole-board mount would keep unrelated route substitutes.
Mounting only the child would lose the keyboard transition. This is the same
division as an instrument calibration using a known input at the display
and checking the connections on the assembled instrument. Backend collection
and wire admission still need their own evidence.
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

**Baseline and choice.** The existing five cases took 3.37 summed seconds
and 4.21 s wall in a focused two-worker run at `267a27502`. CI recorded
5.73 summed seconds. Terry selected this family ahead of revision updates
(nine cases, 22.03 summed CI seconds) because the existing typed inputs allow
both proof boundaries to be tested directly. The plan holds the Chromium
observations. Effort M with high confidence in the tested boundaries.

<a id="renovate-remaining-dashboard-frontend-unit-tests"></a>

### Renovate the remaining dashboard frontend unit-test families

**Identity:** SEED-413#renovate-remaining-dashboard-frontend-unit-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** Give dashboard developers readable UI unit tests and feedback from
the complete frontend group in roughly a minute at the usual two workers,
including preparation. This carries the suite-wide commitments split from
[Project CI history](#renovate-dashboard-frontend-unit-tests), including
SEED-404's timing goal and SEED-301's Intent MakeMe work.

**Scope and order.** Select families by feature folder and the interaction
each view owns. Continue in Intent and Sessions. Revision updates are a
candidate within Intent, with selection, focus and recovery across views.
Use shared typed Intent inputs in place of `putFrontend*` project arrangements;
coordinate session proof with [SEED-341](SEED-341-simplify-session-tests.md).
The family map includes Navigation, Launches, Review, Configuration, Terminals,
the Stories cases left by the pilot, and the audit of the four test-harness
specs. The root contains no product specs. Reassess the order by measured
cost and which shared contracts are available as families finish.

- Mount the smallest rendered owner with typed inputs. Keep an enclosing view
  when its children coordinate. Use the backend's existing shared contract
  where coupled. Preserve distinct assertions and remove a duplicate only
  after locating its equivalent proof. For example, reloading an encoded story
  URL and traversing Back and Forward needs a real E2E browser journey.
  Account for the cost of any checks moved there.
- Retire a feature's app mount, route substitutes and page-object scaffolding
  when their last consumers move. For example, `frontendIntentCi.ts` still
  uses `serveFrontendCiHistory` after Project CI history migrates. Add zero
  new wrappers. Audit harness cases against the product behavior they protect
  before retiring machinery whose only checks exercise the harness itself.
- At the last frontend migration retire `frontend.playwright.config.ts`,
  `.mounted.spec.ts` split naming, frontend dual-engine dispatch and its
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
