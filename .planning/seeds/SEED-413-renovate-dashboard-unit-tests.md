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

<a id="renovate-dashboard-backend-unit-tests"></a>

### Prove ad hoc session review reads in-process through a typed review handler

**Identity:** SEED-413#renovate-dashboard-backend-unit-tests
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#renovate-dashboard-backend-unit-tests","dependencies":[{"supplier":{"identity":"SEED-413#pilot-direct-dashboard-unit-tests","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#pilot-direct-dashboard-unit-tests"},"implementation":"The pilot makes npm run test:dashboard:backend and the dashboard-backend CI job run plain Node Vitest cases beside the Playwright specs, with the group's split, times and proof record, and states the backend entry rules in dashboard/backend-tests/README.md.","rationale":"This story's cases are plain Node Vitest cases in the backend group. Before the pilot's group run exists they have no command or CI job to run in, and building that run here would duplicate the pilot's Taken slices in the same files.","condition":"Plain Node Vitest cases under dashboard/backend-tests/ run in npm run test:dashboard:backend and in the dashboard-backend CI job with the group's split, times and proof record.","state":"satisfied","resolution":{"revision":"6723c8e2c2d65e78fa11aad404c69660030f5633","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#pilot-direct-dashboard-unit-tests","summary":"Satisfied: npm run test:dashboard:backend is node scripts/test-backend.mjs over the shared two-engine group run; dashboard/backend-tests/review/story-notes.unit.spec.ts ran on Node Vitest in the dashboard-backend CI job (run 44515013156, shard 2/3 only) and locally under _SPLIT, _TIMES and _PROOF_RECORD (engine node in the proof record); dashboard/backend-tests/README.md states the backend entry rules.\nCondition satisfied: Plain Node Vitest cases under dashboard/backend-tests/ run in npm run test:dashboard:backend and in the dashboard-backend CI job with the group's split, times and proof record.\nAccepted integration: 36d7dfa9e3f39ea4767cafc7848349ffdddd490e on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/721-prove-ad-hoc-review-reads-in-process/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f90455a6d14b18f5a96a49a62d4be96ed9bbd7dfc9274ca633cce541cd38ce8f","plan":"a800d529ca9d3e464b6b8fa4cddad3d06828b2d127bec59855b7b67ec02eb136"}}
```

First family of the backend renovation, split from the suite-wide story; the
[remaining families](#renovate-remaining-dashboard-backend-unit-tests) follow
it.

- **Goal.** Developers changing how the dashboard server answers an ad hoc
  session's review get cases that call a typed review handler in-process on
  plain Node Vitest, with MakeMe records and real Git repositories and no
  server or request wrapper. Story Notes proves the pattern on one JSON
  endpoint over one file. This family adds what the other backend families
  need and Story Notes cannot show: server state held for the whole process,
  real Git collaborators, and several endpoints admitted by one boundary.
  Speed, clarity, and deleted `test-support` surface are judged together under
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
- **Scope: server.**
  - The review, file diff and file text reads separate a thin wire adapter
    from typed handlers. The adapter owns method, origin, turning the query
    into a typed subject, answering the status a refusal carries, and turning
    a closed response into a bounded abort signal. A handler takes a
    `ReviewedWorkSubject` (with the run or the file pair the read names) and
    an `AbortSignal`, answers `StoryReview`, `ReviewedFileDiff` or
    `ReviewedFileText`, and keeps every rule about what a kept record admits
    and what its repository can still answer. The types already come from
    `dashboard/src/reviewedWorkSubject.ts` and
    `dashboard/src/storyReviewContract.ts`; the story adds no second contract.
  - The handlers serve story subjects through the same admission path as
    today. This story's delivery and proof cover session subjects.
- **Scope: cases.**
  - Every ad hoc review case whose state is kept launch records and a
    repository becomes a plain Node Vitest case through the handlers, in
    `*.unit.spec.ts` specs as the backend README's entry rule names them, and
    none is lost. On 2026-11-19 those are all of
    `review/ad-hoc-review.spec.ts`, `ad-hoc-review-file.spec.ts` and
    `ad-hoc-review-subject.spec.ts`, the three kept-record cases of
    `ad-hoc-review-unavailable.spec.ts`, and the unreadable kept comparison
    case of `ad-hoc-session-commits.spec.ts`: about fourteen cases.
  - A case states its machine through MakeMe: the configured project, the
    kept launch records as the stored document, and the repository with its
    revisions. It mounts the project configuration through the production
    function a server uses, under a machine home of its own.
  - One focused wire check through a started server keeps what only the wire
    owns for these reads: a refused method, a foreign origin, a query naming
    both a story and a session, a malformed run or file pair, and the status
    a story session, an unknown session and a foreign file pair map to.
  - The moved cases total at most about 3 s summed case time at two workers.
- **Scope: guidance and removal.**
  - `dashboard/backend-tests/README.md` adds the rules this family follows
    beyond the reference family: state a case's machine and repositories
    through MakeMe; call another handler in arrangement only when that step
    is the behavior under test; mount process-wide server state through its
    production function.
  - Every `dashboard/test-support/` function and module with no importer
    left is deleted, and nothing is added outside MakeMe builders.
- **Scope limits.** Ad hoc cases that work in a checkout and mark Done, the
  branch result, manual landing and handoff journeys, `kept-commits-*`, the
  story-subject `story-review-*` specs and the range read stay as they are
  for their own families. `adHocReview.ts`, `launchStore.ts` and
  `completedReviewRequests.ts` stay while those import them.
  `backend.playwright.config.ts` stays until its last user leaves.
  `Distribution/src/` is unchanged.
- **Key examples.**
  - A kept Done session whose landing was captured from `base` to `result`,
    in a repository whose trunk advanced afterwards → the handler is asked
    for that session's review → it answers `landed` with baseline `base`,
    tree `result` and `delivered.txt` modified, and the repository's `HEAD`
    and index are unchanged. No server runs.
  - A kept session whose landing repository is gone → the handler is asked
    for its review → it answers `unavailable` with the explanation of the
    gap.
  - A kept session with one kept run → the file diff handler is asked for
    that run's pair, then for another pair → the first answers the diff and
    the second is refused.
  - A subject naming a story launch's session, then an unknown session → each
    is refused with the message a reviewer reads today.
  - A started server → a query naming both a story and a session, a foreign
    origin, a refused method and an unknown session each reach the review
    endpoint → 400, 403, 405 and 404.
  - A case that commits in a Default main checkout and marks the session Done
    → it stays a Playwright spec after this story.
- **Architecture.** No Accepted ADR conflicts; ADR 0008's direct mapping of
  dashboard data across the wire and ADR 0002 support the seam.
  - *Two admissions, separated.* `storyReviewRequest(url)` reads the query and
    the kept records in one step and refuses with an HTTP status either way.
    Reading the query's shape belongs to the adapter. Deciding what a kept
    record admits belongs to the handler, which refuses as `storyNotes`
    does: it throws `RefusedRequest` with the message and the status the
    adapter answers.
  - *The signal, not the response.* `storyReviewResponse` and the file
    responses take a `ServerResponse` only to end the read when the response
    closes or the bounded wait passes. The handler takes the signal; the
    adapter makes it.
  - *Process-wide state has a production owner.* The project list is module
    state that `mountProjectConfiguration` mounts and closes, and twenty
    more server modules hold module-level state. A case uses the owner the
    server uses. A family whose state has no owner yet, such as the landed
    CI memos, gives it one in production code.
  - *MakeMe owns stored documents.* The launch store and the project list are
    files under the machine home. MakeMe builds each as a stored document, as
    `makeMe.aStoredStoryNotesDocument` does for notes, and the case keeps it
    under its own machine home, so `launchStore.ts` loses users family by
    family. This is the kept-record
    part of `SEED-353#declare-launch-session-repository-state`; that story
    keeps the launch and session repository state.
- **Baseline and observations** (2026-11-19).
  - CI medians over five main runs: the 23 `review/ad-hoc-*` files take
    264 s for 65 cases. The three files that move whole take 5.7 s for nine
    cases, about 0.9 s per case through a mounted boundary server. Files that
    arrange by launching a session take 6–13 s per case
    (`ad-hoc-branch-result` 39.9 s for 3, `ad-hoc-manual-landing` 28.2 s for
    5).
  - A scratch Node Vitest case, at load about 9, repeated the landed ad hoc
    review example in-process: a temporary `HOME`, a MakeMe repository and
    launch record, the project list written under that home,
    `mountProjectConfiguration`, then `storyReviewRequest` and
    `storyReviewResponse` with a stand-in for the response. Three cases
    passed in 295, 84 and 65 ms; the read itself took 56–79 ms. The local
    Playwright time of the same cases was not measured.
  - With the pilot on trunk at `78126b37f`, `npm run test:dashboard:backend
    -- review/story-notes` at load about 3 ran the nine cases of
    `story-notes.unit.spec.ts` on Node Vitest in 2–18 ms each; the group's
    times record gave 0.1 s for the file and its proof record named the
    Vitest configuration.
- **Effort hypothesis.** S to M, medium confidence. The seam and the
  in-process read are observed; the MakeMe step for the stored documents is
  the least observed part; the pilot's stored-document builder shows its form.
- **Safe stopping point.** The review handlers and their cases stand on
  their own, and the README carries the rules the other families need.

<a id="renovate-remaining-dashboard-backend-unit-tests"></a>

### Prove what Done keeps of a Default main session's commits in-process

**Identity:** SEED-413#renovate-remaining-dashboard-backend-unit-tests
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#renovate-remaining-dashboard-backend-unit-tests","dependencies":[{"supplier":{"identity":"SEED-413#renovate-dashboard-backend-unit-tests","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-dashboard-backend-unit-tests"},"implementation":"The first family exports typed review, file diff and file text handlers that answer a session subject in-process, gives MakeMe stored-document builders for the launch store and the project list, and states its entry rules in dashboard/backend-tests/README.md.","rationale":"This story's cases read what Done kept through those review handlers and keep their sessions as the stored launch document. Before the handlers exist the cases would call the unsplit request functions with a stand-in for the response, and adding the stored-document builders here would duplicate the first family's Taken slices in the same files.","condition":"On trunk, exported typed handlers answer an ad hoc session's review, file diff and file text in-process from a ReviewedWorkSubject and an AbortSignal, and MakeMe builds the launch store and the project list as stored documents.","state":"waiting"}]}
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
