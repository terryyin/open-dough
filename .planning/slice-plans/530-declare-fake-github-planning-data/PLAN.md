# Serve fake GitHub planning files from explicit MakeMe data

**Identity:** SEED-262#declare-fake-github-planning-data

**Source:** [Serve fake GitHub planning files from explicit MakeMe data](../../seeds/SEED-262-faster-dashboard-test-feedback.md#declare-fake-github-planning-data)
**Source review:** [source review](source-review.md)

## Goal and boundaries

A maintainer reading a dashboard journey that serves a project through the
fake GitHub can see, at its call site or in its fixture file, which planning
facts the project publishes at each revision. The served files come from a
`makeMe.aRepository` description, rendered without Git by the same file
renderer the Git materializer uses. Dashboard feedback does not get slower.

Exclusions:

- Helpers that build a Git repository (`admittedWork.ts`,
  `recentlyDoneSessionsSidebarPage.ts`, `support/retainedReport.ts`, and the
  Git origin of `support/projectAddMachine.ts`) belong to
  dashboard test repositories (completed
  `SEED-262#migrate-dashboard-origin-fixtures`). `projectAddMachine.ts` migrates its fake GitHub files here.
- No dashboard product behavior, fake GitHub answer shape, observation or
  failure injection changes. Revision SHAs, commit dates and path histories
  stay harness inputs.
- No new MakeMe concept beyond what a migrated case needs to state its
  driving facts. Seed and plan prose stays a declared file in the revision.

## Current decisions

- **One file renderer.** Extract from `writeRevisionFiles` in
  `tests/support/repository-revision-files.mjs` a pure renderer: given the
  files a revision starts from and its `RevisionFacts`, it returns the files
  after that revision, applying removals, the backlog, files, story states,
  agent profiles, done records and the rebuilt done catalog with the
  production encoders (`renderPublishedBacklog`, `recordStoryState`,
  `renderAgentProfile`, `renderDoneRecord`,
  `catalogDoneRecords`/`renderDoneCatalog`). `writeRevisionFiles` writes
  through it, so a Git spec and a journey stating the same facts publish the
  same bytes. Plan 512 is executing and may change these modules; at
  execution start, read the landed `repository-revision-files.mjs`,
  `repositoryTestData.mjs` and `materializeRepository`, and keep this
  decision on whatever landed.
- **Served revisions from one description.** A dashboard test helper beside
  `publishedFiles.ts` turns a description and a SHA per revision name into
  one `PublishedRevision` per name, each holding the cumulative files of that
  revision. `publishMovingFiles`, `moveTrunk` and `moveBranch` take those
  revisions unchanged. The helper adds no defaults beyond the description's
  own (an empty valid backlog on the first revision).
- **Same served paths.** Each migrated case declares the files it served
  before and no others, so reads, listings and observed request counts stay
  the same. Backlog bytes may change only to the production encoder's form.
- **Exact bytes stay literal.** Malformed or truncated backlogs (for example
  `backlogWith(..., after)` in `read-failure.spec.ts`), refused or misnamed
  done records, stale or missing catalogs, unanswered paths, and legacy shapes
  stay at the call site. Removing or overriding a catalog uses the
  description's `remove` or `files`.
- **Delete what becomes unused**, such as `emptyBacklog` in
  `originAnswers.ts` and `withDoneCatalog` or `doneCatalogOf` in
  `doneCatalogAnswers.ts` once no case needs them.

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| One description, two outputs: served files equal the materialized checkout | Slice 1 | A `node:test` case in `tests/support/repository-fixture.test.mjs` renders a two-revision description with backlog, seed files, story states with a plan, an agent profile, done records and a removal, and compares every rendered file of each revision with the materialized checkout at that commit. It fails when one encoder is skipped in the renderer. |
| Seed examples 1 and 2: empty project and refresh across revisions | Slice 1 | Specs importing `refreshJourney.ts` or `emptyBacklog` pass with unchanged assertions; the refresh journey declares revisions A and B in one description. |
| Seed example 4: exact bytes kept | Slice 1 | `read-failure.spec.ts` keeps its literal malformed tail at the call site and its verdict; its valid surroundings come from the description. |
| Navigation, session and board journeys declare their facts | Slice 2 | Specs importing the migrated navigation, notification, doughnut, accessible-board, Intent-location and read-support helpers, and the `navigation`, `sessions`, `configuration`, `runtime` and backlog-only `stories` specs, pass unchanged. |
| Seed example 3: profiles and done records | Slice 3 | Profile, roster, avatar, recently done, catalog-project and execution-complete specs pass unchanged; their served profiles, records and catalog come from the description. |
| Seed example 5: superseded templates removed | Slice 3 | `grep -rlE '# Product backlog\|## Backlog list' dashboard` lists only the Git helpers owned by plan 512 and call sites whose spec proves those bytes; each remaining literal names that reason in its comment or is a spec under proof. |
| Remaining helpers compose no planning files outside a description | Slice 4 | The slice-4 encoder search lists only Git helpers owned by plan 512, encoders' own tests and call sites whose spec proves those bytes; `withDoneCatalog` and `doneCatalogOf` are deleted; specs importing the migrated helpers pass unchanged. |
| Served path sets unchanged | Each slice | Before editing a helper, a scratch script in the job directory records the sorted served paths of each exported revision; after the migration the lists are equal. |
| Feedback does not get slower | Slices 1, 3 and 4 | Before and after focused times, two runs each under comparable load, for the refresh family (slice 1) and the recently done and profile family (slice 3) differ by no more than run-to-run noise. |

## Decisive premises

Observed on 2026-11-08 in this worktree at `96077ca87`, macOS, Node
v24.21.0, load average near 11.

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slice 1: an in-memory render reproduces `writeRevisionFiles` | `node <job-tmp>/cmp.mjs`: `queuedReadyRepository()` plus a later revision with an agent profile, a done record, a backlog change and `remove: ["trunk.txt"]`; wrote both revisions to a scratch directory with `writeRevisionFiles`, rendered the same revisions into a map with `renderPublishedBacklog`, `recordStoryState` (assessment second pass), `renderAgentProfile`, `renderDoneRecord`, `catalogDoneRecords`/`renderDoneCatalog` with a Git blob SHA-1, and compared every file | `files 8 same 8`: backlog, two seeds with ready states, two plans, profile, done record and catalog were identical, and `trunk.txt` was absent from both. Every encoder is pure, so no disk or Git is needed. |
| Slice 1: the fake GitHub serves a files map keyed by repository path | Read `publishedFiles.ts` (`PublishedRevision.files`), `listingAnswers.ts` and `catalogProjectRecords.ts` | Files are keyed by repository-relative path such as `.planning/PRODUCT-BACKLOG.md`; listings and blob SHAs derive from the file contents, so the renderer's map is served as is. All dashboard `backlogPath` values are `.planning/PRODUCT-BACKLOG.md`. |
| Slice 3: catalog variants are expressible | Read `writeRevisionFiles` | A revision's `files` overrides the rebuilt catalog and `remove` of `.planning/done/.catalog.json` suppresses it, covering the stale and uncatalogued revisions in `recentlyDoneRecords.ts`. |
| Consumer set | `grep -rlE '# Product backlog\|## Backlog list' dashboard/tests` and fact-kind greps | 48 files: 4 Git helpers (excluded above); profiles in `agentRosterRecords`, `authenticatedAvatarRecords`, `takenAgentProfileRecords`, `support/sharedReads`, `stories/takenExecutionCompleteFixture` and three story specs; story state in `taken-slice-progress` and `plan-execution-complete-detail`; done records in `recentlyDoneRecords`; the rest backlog-only. 26 files import `refreshJourney`, 50 the navigation and board helpers, 39 the record helpers. |
| Proof route | Plan 512's local gates at `96077ca87` use `npm run test:dashboard -- <paths> --workers=2` with `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `NO_COLOR` and `FORCE_COLOR` unset | The same route applies; these journeys need no Git origin. A fresh worktree has no `node_modules`, so run the project's native setup first and compare `node -v` with `.node-version`. |
| No native evidence change | Plan 512's row: `tests/support/*-native-evidence.sh` list no dashboard support module | No paid run is needed. |

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests):
a failing or flaky test is a defect to fix, reproducing it on main is
attribution, not an exemption, and CI failing on a revision this execution
published is this execution's to repair. Never sleep, never use
`test.slow()`, and keep the default timeouts. For full runs on awake macOS
with AC power, use `caffeinate -s -i` and put Homebrew Bash first on `PATH`;
on battery, follow the lid-open procedure and check the sleep log.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Each slice runs its focused selections with
`npm run test:dashboard -- <paths> --workers=2` (variables above unset), and
`npm run typecheck:dashboard` whenever MakeMe, the renderer or a dashboard
helper changes. Slice 1 also runs `bash scripts/test.sh
tests/support/repository-fixture.test.mjs` and the Node tests that load
`repository-revision-files.mjs`, because `writeRevisionFiles` changes. The
renderer and `publishedFiles.ts` helpers are loaded across dashboard and
Node suites, so run the whole `npm run test:dashboard` and `npm test` once
before landing.

## Slices

### 1. Refresh journeys serve revisions of one description

Type: Behavior

Status: done

Proof: Before editing, record the served path lists of `refreshJourney.ts`
and `emptyBacklog` consumers and two focused runs of the refresh family
(specs importing `refreshJourney.ts`). Add the renderer equality case and see
it fail with one encoder skipped, then pass. Run the refresh family,
`read-failure.spec.ts` and the Node tests loading
`repository-revision-files.mjs`; compare path lists and after times; run
`npm run typecheck:dashboard`.

Behavior: a refresh journey declares revisions A and B in one description →
the page reads trunk at A, then trunk moves to B → the board shows the same
titles and order as today, and an empty project shows no stories, with no
literal backlog text in `refreshJourney.ts` or `originAnswers.ts`.

Extract the pure renderer and make `writeRevisionFiles` write through it.
Add the served-revisions helper. Migrate `refreshJourney.ts`, the
`emptyBacklog` consumers, and the observation specs that build their own
backlog around it (`read-failure`, `project-read-isolation`,
`project-read-recovery`, `read-turns-across-tabs`, `shared-observer-reads`,
`transient-read-exclusions`), keeping exact bytes literal.

Accepted proof (2026-11-08): the renderer-equality case in
`tests/support/repository-revision-files.test.mjs` fails with each encoder
skipped and passes; the 267 Node tests loading the renderer passed twice
before refactoring, and the focused renderer, done-catalog and 15 supplier
fixture tests after it; the refresh family (23 specs) passed 65 of 65 twice;
the migrated specs, backend ad-hoc Codex spec and feedback-maintenance specs
passed 53 of 53 after refactoring; Git-materializer dashboard consumers 22 of
22; served-path logs of 103 tests equal before and after; typecheck clean.
Refresh family times: before 71 s and 69 s (load 12.5, 11.7), after 64 s and
63 s (load 11.6, 9.6).

Learnings: `describedRevision(description, sha)` and
`describedBacklog(description)` in `dashboard/tests/describedRevisions.ts`
serve one-revision cases; `describedRevisions` and `publishedFile` serve
moving ones. Grep consumers across `dashboard/`, not only `dashboard/tests`
(`emptyBacklog` had a backend-test consumer). The pure done-catalog rebuild
lives in `tests/support/revision-done-catalog.mjs`; it mirrors
`product-backlog-complete.mjs`, pinned by the equality case. A temporary log
in the four publishers (`publishMovingOrigin.push`, `publishOrigin`,
`publishes`, `publishMovingFiles`) keyed by test title is a cheap served-path
comparison. `revision-stream.spec.ts:186` exceeded its 20 000 ms page-time
bound once at load 32 and passed 20 of 20 on rerun; watch it in the full run.

### 2. Navigation, session and board journeys declare their published facts

Type: Behavior

Status: done

Proof: Record path lists before editing. Run the specs importing each
migrated helper and the migrated specs in one focused run; compare path
lists; run `npm run typecheck:dashboard`.

Behavior: a navigation, session or board journey states its Taken and queued
stories, direction and seed files in a description → the page opens the
project → titles, order, layout and navigation assertions are unchanged.

Migrate `sessionNavigationJourney.ts`, `sourceNavigationJourney.ts`,
`notificationStoryJourney.ts`, `doughnutProject.ts`, `accessibleBoard.ts`
(long titles, direction and identities become declared facts),
`intentLocationsBoundaryFixtures.ts`, `support/frontendServiceState.ts`,
`support/resumingReads.ts`, `support/turnReads.ts`, the fake GitHub files of
`support/projectAddMachine.ts`, `runtime/productionUpdateJourney.ts`, and the
backlog-only specs under `navigation`, `sessions`, `configuration` and
`stories` (`direction-disclosure`, `preparation-legend`, `published-work`,
the three `recently-done-progressive-*` specs).

Accepted proof (2026-11-08): 131 spec files importing a migrated helper
directly or transitively, plus the migrated specs, passed 324 of 324 before
editing (load 12.3→19.9) and after (load 16.2→13.6); served-path logs of 310
tests equal before and after; backlog bytes changed only to the encoder's
form; typecheck clean.

Learnings: `publishes()` answers the backlog for any unpublished content path
and lists only `files`, so a described revision passes through
`backlogApart(at)`. Pygardon's facts live in `dashboard/tests/pygardonProject.ts`
and project selection's in `dashboard/tests/projectSelectionProjects.ts`.
`stories/published-work.spec.ts` keeps its literal backlog because it proves
the older `— SEED-008` shorthand the encoder no longer writes. Thirteen specs
under `dashboard/backend-tests` also serve literal backlogs through the fake
GitHub; seed example 5 covers them, so slice 3 takes them.
The refactor added `publishOnePygardonStory(page)`; slice 3 reuses it for
`recentlyDoneSessionsSidebarPage.ts`'s served Pygardon backlog and gives the
queued workspace story shared by `queuedStoryTaken` and
`recentlyDoneRecords.ts` one home.

### 3. Profile, story-state and done-record journeys declare their records

Type: Behavior

Status: done

Proof: Record path lists and two focused runs of the recently done and
profile family before editing. Run specs importing the migrated helpers and
the migrated specs; compare path lists and after times; run the removal
search from the proof table; run `npm run typecheck:dashboard`.

Behavior: a journey declares agent profiles, story states with plans, or done
records → the page reads them → profile, roster, avatar, slice progress,
execution-complete and recently done views are unchanged, including the
stale, uncatalogued, malformed and unanswered catalog cases.

Migrate `takenAgentProfileRecords.ts`, `agentRosterRecords.ts`,
`authenticatedAvatarRecords.ts`, `support/sharedReads.ts`,
`recentlyDoneRecords.ts`, `catalogProjectRecords.ts`,
`stories/takenExecutionCompleteFixture.ts`, and the specs
`agent-roster-collection`, `nerds-cartoon-portrait`,
`taken-agent-profile-refresh`, `taken-slice-progress` and
`plan-execution-complete-detail`, and the `dashboard/backend-tests` specs that
serve literal backlogs through the fake GitHub (`grep -rlE '# Product
backlog|## Backlog list' dashboard/backend-tests`), keeping literal only the
bytes a spec proves. Delete templates and catalog helpers that become unused.

Accepted proof (2026-11-08): 188 spec files importing a migrated helper
plus the migrated page and backend specs passed 524 of 524 after editing
(516 before); served-path logs of 470 tests have equal paths; profiles are
byte-identical and rebuilt catalogs equal the former `withDoneCatalog` output
at a fixed time; typecheck clean. The recently done and profile family (57
specs) took 151.8 s and 161.3 s before (load 3.7, 7.8) and 168.9 s and 156.2 s
after (load 21.1, 14.0); the loads differ, so slice 4 repeats the comparison
paired.

Learnings: acceptance found fake GitHub helpers and specs outside this
slice's list that still compose published planning files from encoder calls
and literal seed prose without a description (for example
`publishedFactsIsolation.ts`, `revisionReuseOrigin.ts`,
`unchangedRecordsRefresh.ts`, `intentCiStoryBoard.ts`,
`recentlyDoneSelectionJourney.ts`, `support/followUpStories.ts` and the
backend `authenticated-read-done-catalog*` and `listed-records` specs), so
`withDoneCatalog` and `doneCatalogOf` keep consumers. Slice 4 takes them.
When an old fixture listed the backlog among its files, serve
`withBacklogFallback(at)` rather than `backlogApart(at)` so served paths stay
equal. A refined, planned story state is
`makeMe.aStoryPreparation.plannedIn(plan)`.

### 4. Remaining fake GitHub helpers declare their planning files

Type: Behavior

Status: planned

Proof: Record served path lists and two paired before/after runs of the
recently done and profile family (alternate the published slice-3 revision,
in a temporary worktree, with the candidate under the same load). Run specs
importing the migrated helpers and the migrated specs; compare path lists;
run the removal searches below; run `npm run typecheck:dashboard`; then the
whole `npm run test:dashboard` and `npm test` once.

Behavior: a fake GitHub journey that publishes seeds, plans, story states,
profiles, done records or a catalog states them in a description → the page
reads them → its views and verdicts are unchanged, and no fake GitHub helper
or spec assembles published planning files outside a description except
bytes a spec proves.

Find the set with `grep -rlE
'renderPublishedBacklog|renderPublishedPreparation|dough-story-state|renderAgentProfile|renderDoneRecord|withDoneCatalog|doneCatalogOf'
dashboard` and keep the files whose output the fake GitHub serves; the Git
helpers owned by plan 512 stay excluded. Migrate them to descriptions,
keeping literal only bytes a spec proves, with the reason in a comment.
Delete `withDoneCatalog`, `doneCatalogOf` and other helpers that become
unused. After the migration that search lists only Git helpers, encoders'
own tests and call sites whose spec proves those bytes.

## Plan concerns

Slice-plan refinement was not needed: the slices are one proof loop
each, split by helper family, and share one renderer with no special cases.
This review found no remaining slice-specific concern. Slice 4 was added at
slice 3's acceptance for helpers the original inventory missed. Plan 512 executing on
the same support modules is ordinary reconciliation, handled by the first
current decision.

## Story obligations

### G1. Helpers outside the inventory still compose published planning files (found at slice 3 acceptance)
Reported: slice 3 — "withDoneCatalog and doneCatalogOf stay: 15 files outside this slice still use them"
Story clause: "Helpers that already call `renderPublishedBacklog` but hand-write seeds or records, such as `catalogProjectRecords.ts`, move to the same description."
Disposition: receiving slice 4
