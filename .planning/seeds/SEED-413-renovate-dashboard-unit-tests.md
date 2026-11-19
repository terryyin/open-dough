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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/725-narrow-ad-hoc-review-handler-contracts/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f1b5bc90b7c8fab3497dbfc684cf23371a59677eb533669e47081a4da71da627","plan":"9c84dd9c6eb84d558303cc017afbf084dee4e2077a3f5867b95b3c6cac0823dc"}}
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
- **Plan.** [725](../slice-plans/725-narrow-ad-hoc-review-handler-contracts/PLAN.md)

<a id="renovate-remaining-dashboard-backend-unit-tests"></a>

### Prove what Done keeps of a Default main session's commits in-process

**Identity:** SEED-413#renovate-remaining-dashboard-backend-unit-tests
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#renovate-remaining-dashboard-backend-unit-tests","dependencies":[{"supplier":{"identity":"SEED-413#renovate-dashboard-backend-unit-tests","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-dashboard-backend-unit-tests"},"implementation":"The first family exports typed review, file diff and file text handlers that answer a session subject in-process from a typed read, an AbortSignal and the kept launch records as typed input (only their adapters read the stores), with MakeMe building that input (makeMe.aSessionReviewRead), and states its entry rules in dashboard/backend-tests/README.md.","rationale":"This story's cases read what Done kept through those review handlers and build the kept launch records they read. Before the handlers exist the cases would call the unsplit request functions with a stand-in for the response, and adding that seam here would duplicate the first family's Taken slices in the same files.","condition":"On trunk, exported typed handlers answer an ad hoc session's review, file diff and file text in-process from a typed read, an AbortSignal and the kept launch records as typed input, and MakeMe builds that input.","state":"satisfied","resolution":{"revision":"b3b57f9f92ff351d1abf1df189e994954fc3e4f8","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-dashboard-backend-unit-tests","summary":"Satisfied: storyReview (dashboard/server/storyReviewSnapshot.ts), reviewedFileDiff and reviewedFileText (storyReviewFileResponse.ts) take ReviewInput<R> (storyReviewSessionAdmission.ts), whose session variant carries kept: { records }, and an AbortSignal; review/ad-hoc-review-{landed,unavailable,subject,file}.unit.spec.ts call them in-process on Node Vitest with makeMe.aSessionReviewRead and MakeMe repositories, and dashboard/backend-tests/README.md states the family's rules. Agreement corrected: the removed clause (MakeMe stored-document builders for the launch store and project list) was replaced by Terry's explicit 2026-11-19 story amendment of the supplier (typed handler input carrying only what the handler reads, no machine home or stored document), recoverable at the resolution revision.\nCondition satisfied: On trunk, exported typed handlers answer an ad hoc session's review, file diff and file text in-process from a typed read, an AbortSignal and the kept launch records as typed input, and MakeMe builds that input.\nAccepted integration: d940be196c4386e7657484281ee71ade53a40f93 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/723-prove-done-capture-in-process/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bcb95e5637419ddfa16a29efeb3d465cc75cc1f98274d5b60ee5d4d5278fb9b7","plan":"96443df5b32862dd5825a10611377a5e579ea81fc9e35b840dce44444e2fe36a"}}
```

Second family of the backend renovation, split from the remaining families;
the [later families](#renovate-later-dashboard-backend-unit-test-families)
follow it.

- **Goal.** Developers changing what Done keeps of a session's commits get
  cases that mark a kept session Done in-process on plain Node Vitest and
  read the result from the kept record, the repository's references and the
  typed review handlers. The rules are the read of the checkout's `HEAD` log,
  the runs it makes, the references that keep them and the reason nothing
  was captured. The first family proves reading kept records. This family
  adds what branch result and manual landing need next: a Done mark made
  in-process on a session whose checkout holds real Git work, with that work
  stated through MakeMe. Speed, clarity, and deleted `test-support` surface
  are judged together under
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
- **Scope: cases.**
  - Every case whose trigger is a Done mark on a kept Default main session,
    and whose facts are the kept record, its Git references or the review
    answer, becomes a plain Node Vitest case in a `*.unit.spec.ts` spec, and
    none is lost. On 2026-11-19 those are all of
    `review/ad-hoc-session-commit-runs.spec.ts`,
    `ad-hoc-session-commit-rewrites.spec.ts`,
    `ad-hoc-session-commits-shared.spec.ts`,
    `ad-hoc-session-commits-file-text.spec.ts` and
    `kept-commits-release-after-done.spec.ts`; the three cases of
    `ad-hoc-session-commits.spec.ts` that neither a quiet report marks nor
    the first family moves; and the six cases of
    `ad-hoc-review-unavailable.spec.ts` about a session that committed
    nothing, committed elsewhere, reworded its commit, or whose log could not
    be read: about 25 cases and about 40 s of CI.
  - A case marks the session Done through `setRecordDoneAt`, the store
    function that writes the mark and starts the capture, with the Done time
    the case states. The [Done capture contract](../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability)
    needs the kept launch record and real checkout. Only a case that also
    reads the review sets up the project list. A case deletes a record only
    where the release of the references is the behavior under test.
  - A case states its times against its own clock: a launch earlier than its
    work, the work after the launch, and a Done after the work and no later
    than now.
  - A case states its machine through MakeMe: the kept sessions as the stored
    launch document, and the checkout's work as dated steps of the repository
    MakeMe describes (a commit, an amend, a commit on another branch, a pull
    that fast-forwards, merges or rebases, a rebase onto fetched trunk, a
    continued cherry-pick, an autosquash). Real Git performs each step, so
    the log the capture reads is Git's own.
  - The moved cases' summed case time at two workers is at most half of what
    the same cases take on Playwright, both measured in one session at a
    stated load.
- **Scope: guidance and removal.**
  - `dashboard/backend-tests/README.md` adds the rules this family follows
    beyond the first two: state a checkout's work through MakeMe; state times
    against the case's clock; a store function under a native operation is
    the entry when the kept record is the whole fact the case adds.
  - Every method of `DefaultMainSessionWork` and every function of
    `sessionCheckoutGit.ts` and `adHocReview.ts` with no caller left is
    deleted, and nothing is added outside MakeMe builders.
- **Scope limits.** These stay Playwright specs for the
  [later families](#renovate-later-dashboard-backend-unit-test-families), and
  they keep proving that the developer's Done and a quiet report reach the
  capture: native Done with its rename, stop and removal, reported Done and
  its retries, a held checkout read (`ad-hoc-session-commits-done`,
  `ad-hoc-session-commits-pending-done`, the quiet-report case of
  `ad-hoc-session-commits`), record deletion and expiry at the dashboard
  (`kept-commits-release`), the launch that keeps no start in a checkout Git
  cannot read, the branch result, manual landing and handoff journeys, and
  `ad-hoc-session-comparisons`. The server gains no clock seam.
  `launchStore.ts` and the support modules above stay while those specs
  import them. `Distribution/src/` is unchanged.
- **Key examples.**
  - A session kept as established an hour ago at `base` in a Default main
    checkout, with one commit made there half an hour ago → the case marks it
    Done ten minutes ago → the kept record holds one run from `base` to that
    commit, the repository holds the two references that keep the pair, and
    the review handler answers `session-commits` with that run. No server and
    no agent host run.
  - The same session with a commit either side of a pull that merged trunk's
    work → Done → two runs, oldest first, and neither holds the merge or
    trunk's changes.
  - Two commits, the second amended, then rebased onto pulled trunk → Done →
    one run of the two commits as they ended.
  - A session whose only commit stays on another branch → Done → the review
    says its changes were not captured. A session that edited files and
    committed nothing → Done → the review says it made no commits in the
    Default main checkout.
  - Two kept sessions open in one checkout, each with a commit → Done on one
    → its review holds the commits made while it was open and says the
    checkout was shared.
  - A Done session with a kept run, and a later Done whose log cannot be
    read → the earlier run's references are gone from the repository.
  - A launch that a quiet report marks Done → it stays a Playwright spec
    after this story.
- **Architecture.** No Accepted ADR conflicts.
  [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  asks for fast unit feedback and a useful stopping point, and
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  for dashboard data that maps directly to the domain.
  - *The seam already exists.* `setRecordDoneAt` in `recordDoneAt.ts` owns
    the durable mark and starts the capture (`doneCapture.ts`,
    `sessionCommitsCapture.ts`, `launchRecordPins.ts`). None of them reads
    HTTP or an agent host, so this family changes no server module. Native
    Done (`doneMarks.ts`) sits above that function and needs terminals and a
    host; it belongs to the later lifecycle family.
  - *The clock is the machine's.* The capture stamps its read with the
    current time and answers a Done only when the read is not earlier than
    it, and the store's retention drops a record launched long ago. A case
    therefore states times against now. A clock seam would serve only these
    cases.
  - *Checkout work is data that real Git performs.* The Git steps live today
    in `DefaultMainSessionWork` and `sessionCheckoutGit.ts`, which are test
    support that is neither a builder nor a page object. They become steps of
    the MakeMe repository description, which the repository fixture already
    performs with real Git. The log's action wording is Git's contract with
    the capture, so no case writes a log as text.
  - *One Done seam for three families.* `setRecordDoneAt` also settles the
    branch result at Done (`sessionBranchCapture.ts`), so the arrangement
    proven here is the one branch result and manual landing reuse.
- **Alternatives considered.** Taking all of the remaining ad hoc review
  (about 68 cases, 270 s) retires `adHocReview.ts` in one story and is three
  handlers and more than one plan. Starting with the branch result (115 s in
  18 cases) follows CI seconds, yet it needs this Done seam and a launched
  worktree stated as data, neither shown yet. Calling Git inline in each case
  repeats the dated-command plumbing in every spec. A tachograph test bench
  is the borrowed form: the inspector's reading rules are checked against
  charts a real recorder drew on a bench, without a lorry and a shift. Here
  Git is the recorder, the checkout log the chart, and launch and Done the
  shift's stamps. The analogy breaks where a chart can be filed and replayed:
  a log cannot be stored as text, so Git draws it again in every case.
- **Baseline and observations** (2026-11-19).
  - CI medians over main runs 44528572337, 44512335806, 44503789713,
    44500660591 and 44494044199: the 25 `review/ad-hoc-*` and
    `kept-commits-*` files take 282 s. The files this family moves whole take
    27.5 s for 16 cases; with the moved share of the two partly moved files,
    about 40 s for about 25 cases, 1 to 2.5 s per case.
  - A scratch Node Vitest case at `f9e6023bc`, load about 3.5, Node 24.21.0,
    Vitest 5.1.0: a temporary `HOME`, a MakeMe repository with its base
    revision dated 2019, a MakeMe launch record established an hour ago kept
    as the store document, a commit dated half an hour ago,
    `setRecordDoneAt` with a Done ten minutes ago, then the review read.
    Three cases passed: the arrangement took 54 to 140 ms, the Done mark with
    its capture 98 to 103 ms and the review read 84 to 89 ms. The record kept
    the run, the repository held both references, and the review answered
    `session-commits`. No project list was needed for the Done mark.
  - Two more scratch cases at load about 11, on a MakeMe repository with a
    bare origin: a commit, another clone's commit pushed to trunk and pulled,
    then a second commit, and the Done mark. A merging pull kept two runs and
    a rebasing pull kept one run of both commits as rebased. Each case took
    1.2 to 1.4 s, 0.8 to 1.0 s of it Git's arrangement.
  - The same case with every time in 2020 lost its record to retention, and
    with a Done in 2099 the review answered "not captured". With the base
    revision dated after the launch the capture refused the log. Not
    observed: these Git steps stated as MakeMe steps, and a cherry-pick or an
    autosquash in-process.
- **Effort hypothesis.** M, medium confidence. The Done seam and its timing
  are observed, with and without an origin. The form of the MakeMe steps for
  checkout work is the least observed part.
- **Safe stopping point.** The Done capture cases stand on their own, the
  lifecycle specs still prove the wire's path into the capture, and the
  README carries the rules the next families need.

<a id="renovate-later-dashboard-backend-unit-test-families"></a>

### Renovate the later dashboard backend unit-test families around typed server handlers

**Identity:** SEED-413#renovate-later-dashboard-backend-unit-test-families
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Split from `SEED-413#renovate-remaining-dashboard-backend-unit-tests`, which
kept the [Done capture family](#renovate-remaining-dashboard-backend-unit-tests).

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
    one typed contract with `dashboard/src/`. For each family, check that its
    unit test suite can [call the handler directly](../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability)
    with the stores and services that operation uses. If setup requires an
    unrelated service, narrow the handler’s production contract.
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
- **Revisit the completed Story Notes pilot.** The
  [handler](../../dashboard/server/storyNotes.ts) chooses its file through the
  machine home, so the [unit test suite](../../dashboard/backend-tests/review/story-notes.unit.spec.ts)
  changes `process.env.HOME` for every case. Let the production caller bind the
  default notes store and the suite supply its own temporary notes file or
  file-backed store explicitly. Run the existing persistence, isolation and
  unreadable-file cases against real files with the process home untouched.
  Keep the wire check for project admission, request parsing and HTTP responses.
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
  revision family did this with `ProjectIntentReading`. Measured there, a
  mounted case was not faster per case. Five cases summed 6.97–8.00 s against
  6.28 s built-app, because browser-driven clicks (about 150 ms) and the
  `actSettled` frame round after each (about 85 ms) dominate. Expect the gain
  in group elapsed time once a selection needs no app build. Evaluate letting
  `actSettled` skip its frame round after an action that changes nothing. The
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

#### Rework from the completed frontend families

- **Story Notes control.** The [mounted control suite](../../dashboard/frontend-tests/stories/story-notes-control.mounted.spec.ts)
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
  history, and phone overflow proof in the [gap-only case](../../dashboard/frontend-tests/intent/intent-ci-wall-time-history-gaps.mounted.spec.ts)
  to the history-only mount already demonstrated by the
  [evidence suite](../../dashboard/frontend-tests/intent/intent-ci-wall-time-history-evidence.mounted.spec.ts).
  It should need only the history reading. Keep the [panel cases](../../dashboard/frontend-tests/intent/intent-ci-wall-time-history.mounted.spec.ts)
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
