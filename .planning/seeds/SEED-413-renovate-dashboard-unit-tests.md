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

<a id="pilot-direct-dashboard-unit-tests"></a>

### Pilot direct backend handler and narrow UI component tests on one dashboard family

**Identity:** SEED-413#pilot-direct-dashboard-unit-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/720-pilot-direct-dashboard-unit-tests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a24695b021d20dd1bfafac834567a2ce80e1209bd2b0b4b883f76eea6bd3352a","plan":"406d8ff86c517f261b216578bcc314e7d150608afb2ae7f5f2c0c5fb191f7019"}}
```

- **Goal.** Contributors and agents changing the dashboard get one reference
  family, Story Notes, whose unit tests exercise production code directly: the
  backend cases call a typed notes handler in-process, and the frontend cases
  mount the component that owns each interaction. The repository's test
  guidance says how to do the same, so the two renovation stories and every new
  dashboard story copy this family instead of HTTP wrappers and `<App />`
  route substitutes. Speed, clarity, and deleted `test-support` surface are
  judged together under
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
- **Scope: backend.**
  - `dashboard/server/storyNotes.ts` separates a thin wire adapter from a
    typed notes handler. The adapter owns method, the `?id=` project and its
    admission, body parsing against the shared change schema, and abort. The
    handler takes an admitted project and a typed `StoryNoteChange`, answers a
    `StoryNotesAnswer`, and keeps every store rule. Both types already come
    from the shared contract in `dashboard/src/storyNote.ts`; the story adds no
    second contract.
  - The notes store rules are proven by plain Node Vitest cases that call the
    handler in-process against the real durable store under a machine home of
    their own: assigned ids and times, notes kept by project and identity,
    newest first, edit and delete rules, delivered notes and versions, an
    unreadable file reported and preserved, and an unwritable store refused.
  - One focused wire check through a started server keeps what only the wire
    owns: refused methods, a missing or unconfigured project, malformed and
    non-JSON bodies, a foreign origin, `no-store`, and the status each refusal
    maps to.
  - Plain Node Vitest cases under `dashboard/backend-tests/` run in
    `npm run test:dashboard:backend` and in the `dashboard-backend` CI job
    beside the remaining Playwright specs, with the group's split, times and
    proof record, and no added CI job. This is the first Node Vitest run in
    the repository.
- **Scope: frontend.**
  - Each of the eleven Story Notes behaviors in
    `dashboard/frontend-tests/stories/story-notes-*.mounted.spec.ts` has one
    owner, and none is lost. A behavior a rendered Story Notes component owns
    is a plain Vitest case that mounts `StoryNotesDialog` or the `StoryNotes`
    control with MakeMe notes and typed inputs. A behavior the server owns,
    such as newest-first order, is proven by the backend cases alone. Story
    notes leaving an attached terminal mounted and connected spans the board
    and the session terminal, so one step in the E2E terminal-lifetime
    journey owns it. That each card kind hosts the control stays with the
    board keyboard spec (Backlog and Taken cards) and the Recently done
    follow-up E2E journey (Done card), which already observe it.
  - MakeMe gains a page-loadable entry for builders whose data a browser case
    needs, starting with `aStoryNote`; `makeMe.mjs` keeps exposing the same
    builders from that one definition.
  - The `StoryNotes` control reads and changes notes through a typed notes
    source, `(change?: StoryNoteChange) => Promise<StoryNotesAnswer>` for one
    project, which production binds to the notes endpoint. A case supplies its
    own source, so pending, refused, unreachable, and out-of-order answers
    need no route substitute and no held-answer helper.
  - Cases deliver input in the page, as Doughnut's do, and use real pointer or
    keyboard delivery only where native input is the behavior under test.
  - The Story Notes unit cases total at most about 1.1 s summed case time at
    two workers.
- **Scope: guidance and removal.**
  - `dashboard/backend-tests/README.md` and
    `dashboard/frontend-tests/README.md` state the entry rules this family
    follows (typed handler in-process with one wire check; owning component
    with typed inputs and in-page input; plain Vitest), the test-support
    freeze, and name this family as the reference.
  - `.planning/open-dough.json` disables `pageObjects` on
    `dashboard/frontend-tests`. Its remaining Playwright specs keep the page
    objects they have until their folders migrate.
  - Every `dashboard/test-support/` module and browser command with no
    importer left is deleted, and nothing is added outside MakeMe builders. On
    2026-11-19 that is `mountedStoryNotesBoard.ts`, `mountedStoryNotesPage.ts`,
    `mountedSessionTerminal.ts`, `mountedStoryReviewPage.ts`,
    `mountedRetainedNoteCommands.ts`, the notes board commands, and the held
    notes answer in `mountedServices.ts` and `mountedDashboard.ts`.
- **Scope limits.** The other notes specs stay as they are for the renovation
  stories: `stories/story-note-voice*.spec.ts`,
  `intent/intent-story-notes.spec.ts`, the `review/` notes specs and
  `launches/follow-up-attach-notes.spec.ts`. `frontendStoryNotesRule.ts` and
  `storyNotesPage.ts` stay while those import them. Both Playwright configs,
  the `.mounted.spec.ts` naming, and the frontend runner glue stay until the
  renovation stories remove their last users. The other endpoints in
  `projectConfigurationBoundary.ts` keep their shape. `Distribution/src/` is
  unchanged.
- **Key examples.**
  - A project with two saved notes for one story → the handler receives an
    `add` change for that story → its answer lists the new note first with an
    assigned id and time, and the notes file holds the same three notes. No
    server runs.
  - An unreadable notes file → the handler is asked to read, then to add → the
    read answers `unreadable`, the add is refused, and the file's bytes are
    unchanged.
  - A started server → a `PUT`, a body with an extra field, and a foreign
    origin each reach the notes endpoint → 405, 400 and 403, and no notes file
    exists.
  - `StoryNotesDialog` mounted with no notes → the user adds "First
    observation" and saves → the dialog asks for one `add` change carrying
    that text and the story's identity; when the change is refused, the draft
    stays and "The note could not be saved." shows.
  - The `StoryNotes` control mounted with a source whose earlier read answers
    after a later save → the control keeps showing the save's notes and count.
  - The control mounted with an `unreadable` answer → it shows "The notes
    could not be read." in place of a count.
  - A session terminal attached in the E2E journey → the user opens and closes
    Story notes on a card → the same terminal keeps printing and is not
    attached again.
- **Architecture.** No Accepted ADR conflicts; ADR 0008's direct mapping of
  dashboard data across the wire and ADR 0002 support the seams. This is the
  first family of the campaign, so its seams are the ones the others repeat.
  - *One contract, tested from both sides.* `dashboard/src/storyNote.ts` is
    the single gauge both sides are checked against: the handler's answers and
    the frontend cases' prepared answers carry the same types. A frontend case
    prepares the answer the server would give and re-implements no server
    rule, so the notes rule in `frontendStoryNotesRule.ts` gains no new user.
    A shared type proves shape, not behavior or the wire's JSON and statuses,
    which is why the wire check and the E2E journeys remain.
  - *Wire adapter over handler.* Admission that needs the request (method,
    query, body, origin) stays in the adapter, where `localJsonEndpoints`
    already maps refusals to statuses. Domain refusals, such as a note that no
    longer exists, stay in the handler.
  - *Machine state per case.* The store resolves the machine home through
    `HOME` at each call, so a case owns a temporary home; MakeMe supplies
    notes and the stored document.
  - *One group runner for two engines.* The backend group needs what the
    frontend group already has: Vitest cases selected, split, timed and
    recorded beside Playwright ones. Serve both groups from the same runner
    code instead of a second copy for the backend, and keep whatever marks a
    file as Vitest transitional, since each group ends with one engine.
  - *Typed source behind the hook.* `useStoryNotes` keeps its hook and its
    `localSettingState` ordering behind the rendered control; only where its
    request comes from becomes an input. This is the seam later families
    reuse for components that read through a page-level hook.
- **Baseline and observations** (2026-11-19, load about 4, this revision).
  - Frontend family today: 11 cases, 4.3 s summed case time, 6.1 s wall; a
    file's first case takes 320–1,040 ms and later cases 124–145 ms.
  - A scratch case mounting `StoryNotesDialog` directly and adding a note:
    mount 1–33 ms; about 5 ms per case with in-page input; 286–548 ms per case
    with the browser provider's real clicks (95–260 ms each). The mount
    boundary and the input delivery both decide the time; real pointer input
    alone would be slower than today.
  - Backend family today: 7 cases through a started server, 4.5 s summed
    (447–1,151 ms each), 5.3 s wall.
  - A scratch Node Vitest case reading and changing the real notes store
    in-process under a temporary `HOME`: 12–27 ms per case, 0.8 s wall.
  - A scratch case mounting the `StoryNotes` control inside
    `StoryNotesOnPage` with `localSettingState` over a case-supplied source:
    the unreadable state and an older read losing to a save both passed at
    20–33 ms, with no production change.
  - `makeMe.mjs` cannot load in a browser case: 8 of the 111 modules in its
    import closure import Node modules. `storyNoteTestData.mjs` loads there.
  - `StoryCard` and `DoneStoryCard` take whole published work and machine
    sessions, so they do not mount on their own today; their folders'
    renovation owns that seam.
  - A scratch Node Vitest spec under `dashboard/backend-tests/` ran through
    the frontend group's existing Vitest and proof code unchanged and wrote a
    completed proof record and times file.
  - A scratch step in `e2e/terminals/agent-terminal-lifetime.spec.ts` opened
    and closed Story notes on a card; the terminal kept its one attachment
    and kept echoing input.
- **Effort hypothesis.** M, medium confidence. The frontend and handler seams
  are small and observed; the backend Vitest run joining the group's CI proof
  is the largest and least observed part.
- **Safe stopping point.** Even before the remaining folders migrate, every new
  story follows the updated READMEs and copies a clean reference family.

<a id="renovate-dashboard-backend-unit-tests"></a>

### Prove ad hoc session review reads in-process through a typed review handler

**Identity:** SEED-413#renovate-dashboard-backend-unit-tests
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#renovate-dashboard-backend-unit-tests","dependencies":[{"supplier":{"identity":"SEED-413#pilot-direct-dashboard-unit-tests","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#pilot-direct-dashboard-unit-tests"},"implementation":"The pilot makes npm run test:dashboard:backend and the dashboard-backend CI job run plain Node Vitest cases beside the Playwright specs, with the group's split, times and proof record, and states the backend entry rules in dashboard/backend-tests/README.md.","rationale":"This story's cases are plain Node Vitest cases in the backend group. Before the pilot's group run exists they have no command or CI job to run in, and building that run here would duplicate the pilot's Taken slices in the same files.","condition":"Plain Node Vitest cases under dashboard/backend-tests/ run in npm run test:dashboard:backend and in the dashboard-backend CI job with the group's split, times and proof record.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/721-prove-ad-hoc-review-reads-in-process/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"388772da2b4a63b692edaec52bf26e354006711071ca839da9157e0258972b13","plan":"bebf6e70935f1c1e6f40744c259bc282c9614feff55e5ada792d5aa18cfaad7b"}}
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
    into a typed subject, the status each refusal maps to, and turning a
    closed response into a bounded abort signal. A handler takes a
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
    repository becomes a plain Node Vitest case through the handlers, and
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
    record admits belongs to the handler, with the pilot's refusal
    convention.
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
    files under the machine home; MakeMe writes them from its builders, so
    `launchStore.ts` loses users family by family. This is the kept-record
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
- **Effort hypothesis.** S to M, medium confidence. The seam and the
  in-process read are observed; the MakeMe step for the stored documents is
  the least observed part.
- **Safe stopping point.** The review handlers and their cases stand on
  their own, and the README carries the rules the other families need.

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

### Renovate dashboard frontend unit tests around narrow owning components

**Identity:** SEED-413#renovate-dashboard-frontend-unit-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers changing `dashboard/src/` get Doughnut-speed
  (~1 minute full two-worker run, absorbing `SEED-404`'s goal recoverable at
  `986aad0f1:.planning/seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md`)
  and readable UI unit tests that mount the smallest rendered component or view
  owning the interaction instead of `<App />` and fake backend mini-servers.
- **Evaluation.** Decompose by feature folder (`intent/`, `navigation/`,
  `sessions/`, `launches/`, `review/`, `configuration/`, `terminals/`, top-level,
  and auditing/retiring `test-harness/` — 302 `.spec.ts` files), starting with
  the highest case-second families (`intent/` — absorbing
  `SEED-301#publish-intent-projects-through-makeme` onto narrow typed Intent
  component inputs rather than `putFrontend*` — and `sessions/` alongside
  `SEED-341`). For each folder:
  - Give components narrow typed props or shared typed boundary contracts so
    plain Vitest + headless Chromium specs mount the owning component/view
    directly without `@playwright/test`, `page.route(...)`, or `test.step(...)`
    (mounting an enclosing container only when focus return or cross-child
    coordination is the contract, and moving any true multi-service or
    full-reload straggler to `e2e/` or dropping duplicates).
  - Retire `dashboard/frontend.playwright.config.ts`, `.mounted.spec.ts` split
    naming, dual-runner glue (`scripts/test-frontend.mjs`,
    `frontendMounted.mjs`, `frontendOutputs.mjs`, `frontendSelection.mjs`),
    `frontendApp.ts`, `mountedDashboard.ts`, `frontendServiceSubstitutes.ts`,
    `frontend*Rule.ts`, and `frontend-tests` page-object scaffolding.
- **Effort hypothesis.** L across the suite — split by folder during refinement,
  following each folder's shared typed contract from Backend Renovation where
  coupled.
- **Safe stopping point.** Each migrated folder drops its multi-second `<App />`
  tax and deletes its route-substitute rules independently.
