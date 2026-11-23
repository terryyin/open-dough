# Drive the published observation through the typed page entry

**Identity:** SEED-413#drive-published-observation-through-page-entry
**Source:** [Drive the published observation through the typed page entry](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#drive-published-observation-through-page-entry)

## Goal and scope

Dashboard maintainers get fast Vitest proof of the real published observation
and page composition. Complete the required page reads, make transient recovery
page-owned, and move the named recovery, Board frame and Intent cases onto their
production owners. Restore the canonical-request and below-banner scroll checks.
Preserve transport, rate-limit semantics, and the published versus machine-local
sources of truth. Runner retirement and migration of other test families are
separate stories.

## Decisions and existing owners

- [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md) and
  [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them)
  guide direct typed contracts over the existing wire adapters. Keep the
  published snapshot, moved-branch answer, and machine answer distinct. Keep
  authenticated SSE and its current fallback, close, and limit behavior.
- [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  governs the comparison. Measure the cases whose proof moves and account for
  removed copies and retained independent assertions.
- [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  Extend `PageReads.observation` and the page's machine-side contract with
  required operations. Keep the migrated cases free of fetch or EventSource
  stubs and production module mocks. Reuse authenticated implementations at the page
  boundary, `PageReadsOnPage` for descendants, and `pageReadsSupplying` for
  cases. Supply pinned backlog text and typed collaborator replies. Let
  `readPublishedWork` interpret membership and fill detail itself. Reuse
  page-loadable MakeMe data and the generic mount and preference helpers.
- [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  and [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Mounted cases act in Chromium and wait on visible changes or the typed
  request they cause. The test-entry selector enables MakeMe for frontend and
  E2E sources and the shared page-object convention for E2E. Keep true
  navigation, authenticated transport, and service integration proof in E2E.
- Reuse the production ownership already divided between
  `ConfiguredDashboard` and `ConfiguredDashboardContent`. Extract the shared
  configured frame where it already composes banner, story navigation, notice,
  and content. Pass observation and navigation as typed inputs across that
  boundary. A held-work case can render the same shell directly. Recovery
  cases need `ConfiguredDashboard` since the shell cannot observe read
  settlement on its own.
- `transientRecovery.ts` currently supplies both contributors. Keep its
  scheduling rule in a page-owned instance with one shared due time.
  `ProjectIntentReading` already has an independent production entry through
  `IntentReadRecoveryOfItsOwn`. Let that entry own its recovery when mounted
  independently. Preserve the login-wide limit in `readingLimit.ts`.

## Decisive premises

Observations are from the preparation worktree at `05f60fc746c1` on
2026-11-23, using Node 24.21.0 and AC power.

| Consuming operation | Observation and result |
| --- | --- |
| Production membership, then detail, through the mounted page | Ran `caffeinate -s -i npm run test:dashboard:frontend -- intent/published-observation-preparation-probe.spec.ts --workers=2`. The temporary Chromium case mounted `ConfiguredDashboard` with one MakeMe Pygardon source and a typed snapshot of a valid backlog containing `SEED-302#queued`. It observed one canonical read of `.planning/seeds/SEED-302-queued.md` through `readDetailFile`. A fresh resource timing buffer then observed the page's direct `agents=profiles` and `done=catalog` requests to the local Vitest server, which has no authenticated service. The check passed and the scratch spec was removed. |
| Existing assertions that the new entry must carry | Ran `caffeinate -s -i npm run test:dashboard:frontend -- intent/intent-read-recovery.spec.ts intent/intent-candidates-read-recovery.spec.ts intent/intent-gherkin-layout.spec.ts navigation/accessible-board-announcements.spec.ts navigation/story-card-selection.spec.ts --workers=2`. All 13 Chromium cases passed in five files. Their current entries are the interim recovery compositions, the held-work shell copy, and the Board frame with module mocks. Their assertions supply the before-state for the proof moves. |
| Legacy reader selection for Slices 7 and 8 | Ran `node_modules/.bin/playwright test --config dashboard/frontend.playwright.config.ts 'intent-(project-visit(-selection)?\|selection-reads)\.spec\.ts$' --project=chromium --list --reporter=list`. It collected one visit, one selection-transition and one startup-detail case. This settles the runner selection. Capture elapsed comparison runs under comparable load at execution. |
| Shared-wait assertion can discriminate loss of the pending contributor | [Prior Intent Coverage](../../done/SEED-413_speed-intent-source-and-story-reading.json) at `3d1fef8a` caught clearing all contributors when detail healed. The observed read counts were `[2, 2]` where `[2, 3]` was required. It exercised the old composition. Slice 5 reruns that discriminating change on the production page path. |

## Slices

### 1. Published detail reads only the reachable records at the inspected revision

Type: Behavior
Status: done

Extend the required observation reads for published sessions, profiles and
profile-addition history, and the Done catalog. Pass the current typed
replies into `readPublishedDetails` and its existing assignment, attribution,
Done and sessions owners. Keep their pins, partial answers, and abort
semantics. Keep one profile-addition lookup shared by assignment attribution
and the slice clock.

**Proof.** Give `readPublishedWork` a pinned typed snapshot with the retired
source-navigation fixture's path mix and typed detail replies. Observe link
kinds and exactly the distinct canonical file paths at that revision. Include
the local seed, local plan, root-relative path, and path with dot segments or
encoded spaces. External and refused targets stay out of these requests.
Assert the observed profile/owner, published sessions and Done results,
including a group that fails while the others answer. Connect the exact
request set to the visible story Sources control in Slice 4. Retain the
transport proof in `e2e/stories/published-work.spec.ts` and
`e2e/sessions/recently-done-published-sessions.spec.ts`. Recover the legacy assertion with `git show e007256601^:dashboard/frontend-tests/navigation/source-navigation.spec.ts`.

### 2. Moved branches refresh their own progress and clocks at the delivered head

Type: Behavior
Status: done

Supply the required typed branch head, branch file, and commit time operations
through the same observation reads. Use them for startup details and
`requestedRead` → `readMovedProgress`. Keep profile attribution and the
distinction between a known head, a vanished branch, and a head still to read.
`progressSource.ts` is already 278 lines. Separate resolving and reading one
branch's plan from projecting and watching its progress source. Keep the
projection used by `publishedWorkDetails`, `movedBranchProgress`, and
`publishedObservation` cohesive, and preserve the branch watch set.

**Proof.** Drive the production read with typed branch replies for an assigned
branch plus a trunk sibling. Observe the branch plan and clock at the supplied
head. Drive a moved-head answer, verify exactly the affected branch and clock
reads, and keep the trunk sibling's observed progress. A disappeared branch
shows its own gap. Run the reached observations in
`e2e/stories/branch-progress-reading.spec.ts` and
`e2e/stories/taken-slice-clock.spec.ts`.

### 3. Revision delivery enters through a typed subscription

Type: Behavior
Status: done

Bind the existing authenticated SSE adapter to a required subscription beside
`checkRevision`. Let the production scheduler still own the watch, polling
fallback, silence deadline, visibility, close, and reopen. Keep wire decoding
and browser `EventSource` in the adapter. Reorganization of the 249-line
`revisionStreamSchedule.ts` follows that existing boundary.

**Proof.** Supply a typed revision message or delivery loss to the production
delivery owner. Observe a changed pin requested once, correct fallback, and
subscription close on departure. Use `e2e/observation/revision-stream.spec.ts`,
`revision-stream-visibility.spec.ts`, `revision-stream-lost.spec.ts` and
`revision-stream-return.spec.ts` for transport and scheduling integration.
Retain the typed polling path and the pause imposed by a standing rate limit.

### 4. The Board frame responds to published and machine answers

Type: Behavior
Status: done

Give `useAgentLaunches` required page-supplied machine session and agent
acceptance operations. Replace `board-frame-mount.ts` module mocks with typed
snapshot, details, revision subscription and machine replies. Let an accepted
request and subsequent machine answer flow through the production launch owner.
Retain the full/unchanged/fresh machine read distinctions. Keep the launch
client's transport and other call sites intact.

**Proof.** Board announcements, retained work, focus, selection, narrow
layout and roster still read correctly on the real configured page. Exercise
ordered typed replies and observe the requests at their boundary, including
the exact new revision after a delivery and no fresh snapshot for a failed
check. Open Sources on the canonical-path case and verify the request set
from Slice 1. Observe the acceptance and machine refresh through the consuming
page, with the existing launch-client spec and a reached launch E2E journey
for wire and lifecycle evidence. Run every reached Board frame consumer,
including the indirect readers of `development-intent-frame-page.ts`.

### 5. Published detail and Intent share a recovery wait owned by their page

Type: Behavior
Status: done

Mount one transient schedule for the production page, shared by the
observation and Intent, with independent state for another page mount.
Retain the standing GitHub limit at the existing shared boundary. Move the
four observation-driven cases in `intent-read-recovery.spec.ts` and the
Candidates standing-limit case in `intent-candidates-read-recovery.spec.ts`
through `ConfiguredDashboard`. Delete `PageIntentRecovery` and
`mountIntentOnObservationRecovery`, retaining only the necessary clock,
visibility and DOM observations.

**Proof.** Controlled typed file and locations replies distinguish the 15,
30, 60 and 60 s retries, a hidden page doing no recovery until reveal,
healing detail leaving Intent pending, and locations waiting until the standing limit ends. Candidates stay
withheld past their shorter transient backoff until that end. A new
mount after a pending failure starts with its own first step without a reset
call. Leave malformed settings, refusal and absent-record cases on their
existing production owner and keep the distinctions. Repeat the prior
shared-wait break on the new entry and restore it before accepting the slice.
Run `e2e/intent/intent-read-boundary-recovery.spec.ts` and the reached
`e2e/observation` lifecycle and limit cases.

### 6. The composed page bounds the Gherkin reading panes below the banner

Type: Behavior
Status: done

Use the common production shell from `ConfiguredDashboard` and
`mountIntentCiPage`. Let the held-work mount supply typed view inputs while
the production owner decides the frame, banner, notice and scroll
composition. Keep routing, selection and published I/O with their existing
production owners.

**Proof.** Extend `intent-gherkin-layout.spec.ts` with the below-banner check
from `06aa8eeb1^:dashboard/frontend-tests/intent/intent-gherkin-layout.spec.ts`.
With visible Gherkin content, the outer region fits its height and remains
stationary while the tree scrolls to 200 and the reading pane to 300. Preserve
the left-edge and pane-bottom checks. Recheck reached Intent and Navigation
consumers of `mountIntentCiPage` for layout, notice, and navigation behavior.

### 7. Visiting Project Intent preserves the Board selection and separate reading places

Type: Behavior
Status: done

Move `intent-project-visit.spec.ts` and
`intent-project-visit-selection.spec.ts` to the production observation.
Supply typed snapshot and detail replies for the story card, typed Intent
source and Candidates replies, and typed story and project CI replies.
Select the story on the visible Board and switch perspectives through the
page controls.

**Proof.** Keep the story Purpose/Proof, file and scroll across a Project
visit. In Project Intent the candidate shows the pinned published source
and trunk CI. Returning focuses the candidate and restores story reading
without rereading the candidate or source. Clearing and reselecting while
Intent is hidden opens the selected story's CI comparison, and clearing
after a Candidates visit returns to project CI. Keep the separate
`e2e/intent/intent-project-visit-ci.spec.ts` service-cost proof.

### 8. Startup detail settles without displacing the feature being read

Type: Behavior
Status: planned

Move `intent-selection-reads.spec.ts` onto the configured page. Hold the
canonical source reply through its required typed read while membership is
visible, and use typed locations and file replies for the same revision.

**Proof.** Select the feature while the canonical detail is held. Release
it, observe the actual detail settling, and confirm the expanded location,
selected file, Purpose and single locations read. Retire legacy helpers
whose last consumers have moved.

## Verification and delivery

- Local gate follows the [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Run from the owned checkout under `caffeinate -s -i` on AC. On battery,
  plug in or start fully awake with the lid open under `caffeinate -i` and inspect the sleep log. Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Use the dashboard typecheck for the required contracts and
  `npm run test:dashboard:frontend -- <reached specs> --workers=2` for
  mounted proof. Retain wire, server, and navigation integration evidence
  where the change reaches those boundaries. Use the installed
  [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  against each actual diff. Initial term search linked the frame helper to
  the Intent reading, CI, Gherkin and story-comparison suites and linked
  the Board helper to keyboard, scroll, announcement, roster and
  Development/Intent specs. Include indirect frame and status observers.
- At comparable load, run the three legacy files before their conversion
  and the moved cases after it, at two workers. Use the dedicated Playwright
  and Vitest selections, recording elapsed time including runner preparation,
  counts by engine, remaining slow cases, and any E2E proof that moved.
  Compare the recovery and frame selections with the same cases and scope
  as above. The high load during the diagnostic mount makes its timing
  unsuitable for comparison. Keep reachability proof separate from
  measurement, and retain each displaced assertion's destination.
- Refactor and verify at each slice boundary through the installed
  [execution workflow](../../../.agents/skills/dough-execute-plan/SKILL.md).

## Readiness review

Dedicated slice-plan refinement was unnecessary. The eight slices follow the
existing read owners, reuse the same page mount and recovery semantics, and
each names its own outside-in observation. The delivery sequence moves proof
only once its production boundary can be exercised. This review found no
remaining slice-specific concern.

## Execution context

- Mode: story-branch; workspace
  `/Users/terryyin/git/open-dough/.worktrees/drive-the-published-observation-through-the-type`;
  branch `cursor/drive-the-published-observation-through-the-type`; remote
  `origin`; target `main`
- Publisher ID: `dashboard-territory.local-open-dough`; agent: Nao-chan
- Retained published revisions: claim `8a41b269fa1b1591fb5f1e55a62dde54a2a6b2e2`
  on `origin/main`; increments `a99bc3797fc4fc1c99dbf1abd4f2783174a1dc18`,
  `ec1e99e6139f0653f0990845b0227a2094d36d9f`,
  `4daa9c40a0d6acb1530b704fb4281b98bba46644`,
  `98a8be7fda620be498dce3461ebf0f081f52de34`,
  `a1dd7faac41f3ee5ed51e42f14c353ebab921fd1`,
  `d6475f771fac0d16429b90794d33ffc6792dcec4` on
  `refs/heads/cursor/drive-the-published-observation-through-the-type`
- CI observer: `/tmp/dough-ci-501/watch-VdTqA3` (attached at Slice 5 publish)
- Replanning permission: preserve existing (allowed)

## Accepted proof

### Slice 1 — reachable published detail and typed detail groups

- Promise: observation reads for profiles, profile-addition, Done catalog and
  published sessions; `readPublishedWork` path-mix detail set; partial sessions
  gap while profiles and Done answer
- Boundary: `PublishedObservationReadSource` → `readPublishedDetails` owners;
  unread `pageReadsSupplying` observation
- Setup: pinned typed snapshot with legacy source-navigation path mix; typed
  detail, profiles, addition, sessions and Done replies via
  `published-detail-path-mix-supply.ts`
- Observations:
  - `dashboard/frontend-tests/observation/published-detail-reachable-records.spec.ts`
    link kinds and exact four reachable detail paths; owner/sessions/Done;
    sessions unavailable while Done and owner answer
  - `dashboard/frontend-tests/test-harness/unread-page-reads.spec.ts` unread
    rejects new observation ops
- Command:
  `caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/observation/published-detail-reachable-records.spec.ts dashboard/frontend-tests/test-harness/unread-page-reads.spec.ts --workers=2`
  (pass; typecheck `npm run typecheck:dashboard` pass)
- Evidence: `open-dough/evidence/slice1-implementation-return.md`,
  `open-dough/evidence/refactor-slice1-return.md`

### Slice 2 — moved-branch progress and clocks through typed observation

- Promise: typed branch-head, branch-file, commit-time reads; startup plan and
  clock at supplied head; moved head rereads only the affected branch/clock;
  trunk sibling kept; vanished branch own gap; `progressSource` split
- Boundary: `PublishedObservationReadSource` → `withProgressSources` /
  `readMovedProgress` / `withSliceClocks`; `branchPlanRead` resolve/read;
  `progressSource` projection/watch
- Setup: `moved-branch-progress-supply.ts` with story-branch + trunk sibling +
  vanished branch typed replies
- Observations:
  - `moved-branch-progress.spec.ts` startup and moved-head cases
  - `unread-page-reads.spec.ts` new branch/commit ops
- Command:
  `caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/observation/moved-branch-progress.spec.ts dashboard/frontend-tests/test-harness/unread-page-reads.spec.ts --workers=2`
  (pass; typecheck pass)
- Evidence: `open-dough/evidence/slice2-implementation-return.md`,
  `open-dough/evidence/refactor-slice2-return.md`

### Slice 3 — typed revision subscription

- Promise: required `subscribeRevision` beside `checkRevision`; scheduler owns
  watch/fallback/silence/visibility/close/reopen; EventSource+decode in adapter;
  changed pin once; loss → pace reopen; close on departure; typed polling;
  standing rate-limit pause
- Boundary: `subscribePublishedRevision` → `useRevisionStreamSchedule` /
  `useRevisionCheckSchedule`
- Observations: `revision-stream-delivery.spec.ts` five cases; unread
  `subscribeRevision`
- Command:
  `caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/observation/revision-stream-delivery.spec.ts dashboard/frontend-tests/test-harness/unread-page-reads.spec.ts --workers=2`
  (pass; typecheck pass)
- Evidence: `open-dough/evidence/slice3-implementation-return.md`,
  `open-dough/evidence/refactor-slice3-return.md`

### Slice 4 — Board frame typed published and machine answers

- Promise: page-supplied `MachineReadSource` on `useAgentLaunches`; retire
  board-frame module mocks; typed snapshot/detail/revision/machine through
  `pageReadsSupplying`; acceptance and machine refresh through production
  launch owner; full/unchanged/fresh distinctions; Board consumers incl.
  Sources/`expectedDetailPaths` and indirect `development-intent-frame-page`
- Boundary: `PageReads.machine` → `useAgentLaunches`; observation typed reads →
  `ConfiguredDashboard` via `board-frame-mount` without `vi.mock`
- Flake fix: parallel `frame-launch-look` Cancel→Enter reopen — wait for first
  machine-session settle in `mountBoardFrame`; reclaim launcher focus after
  modal close; open Start on Enter/Space `keydown` (`openDialogFromActivation`)
- Observations:
  - Board announcements / accessible / Sources / frame board-launch-roster /
    story selection / development-intent frame (+keyboard/sessions) / unread
    machine ops
  - `board-sources-canonical-paths.spec.ts`: detailPaths ===
    `expectedDetailPaths`
  - narrow Cancel→Enter Start session stable under parallel Board suite
- Command (accepted parallel Board suite after flake fix):
  `caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/navigation/accessible-board-announcements.spec.ts dashboard/frontend-tests/navigation/accessible-board.spec.ts dashboard/frontend-tests/navigation/accessible-board-keyboard.spec.ts dashboard/frontend-tests/navigation/accessible-board-scroll.spec.ts dashboard/frontend-tests/navigation/board-sources-canonical-paths.spec.ts dashboard/frontend-tests/navigation/board-reading-keys.spec.ts dashboard/frontend-tests/navigation/board-scroll.spec.ts dashboard/frontend-tests/navigation/frame-board-look.spec.ts dashboard/frontend-tests/navigation/frame-launch-look.spec.ts dashboard/frontend-tests/navigation/frame-roster-look.spec.ts dashboard/frontend-tests/navigation/story-card-selection.spec.ts dashboard/frontend-tests/navigation/development-intent-frame.spec.ts dashboard/frontend-tests/navigation/development-intent-frame-keyboard.spec.ts dashboard/frontend-tests/navigation/development-intent-frame-sessions.spec.ts dashboard/frontend-tests/test-harness/unread-page-reads.spec.ts --workers=2`
  (pass ×2: `slice4-flake-parallel-3/4.log.run.json` exit 0; typecheck pass)
- Evidence: `open-dough/evidence/slice4-implementation-return.md`,
  `diagnosis-slice4-frame-launch-look-flake.md`,
  `open-dough/evidence/refactor-slice4-return.md`,
  `open-dough/evidence/slice4-flake-parallel-3.log`,
  `open-dough/evidence/slice4-flake-parallel-4.log`

### Slice 5 — page-owned transient recovery shared by observation and Intent

- Promise: page-owned `TransientRecoverySchedule` (`TransientRecoveryOnPage`);
  observation and Intent share one due time; independent state per mount;
  standing GitHub limit stays at `readingLimit.ts`; four observation-driven
  Intent recovery cases and Candidates standing-limit through
  `ConfiguredDashboard`; delete `PageIntentRecovery` /
  `mountIntentOnObservationRecovery`; 15/30/60/60 retries; hidden→reveal;
  healing detail leaves Intent pending; locations wait for standing limit;
  new mount starts at first step without reset; malformed/refusal/absent on
  existing owners; IC shared-wait Caught+restored; e2e intent-boundary and
  reached observation lifecycle/limit
- Boundary: `ConfiguredDashboard` → `TransientRecoveryOnPage` →
  `usePublishedObservation` / `recordSettledOutcomes(schedule)` +
  `IntentReadRecovery`; Intent creates own schedule when mounted alone
- Setup: `onRecoveryClock` fake timers (no module reset);
  `mountIntentRecovery` / `mountIntentOnConfiguredDashboard` with typed
  observation+intent via `boardFrameObservationSupplying`;
  `workWithPublishedDetail` for shared-wait
- Observations:
  - `intent-read-recovery.spec.ts`: 15/30/60/60; hidden→reveal; shared wait
    `[2,3]` after 30 s; rate-limited locations; malformed/refusal/absent
  - `intent-candidates-read-recovery.spec.ts`: standing-limit withhold past
    shorter transient; refusal/absent/mismatched on existing owner
  - IC restored: shared-wait discriminating break Caught then restored
  - `e2e/intent/intent-read-boundary-recovery.spec.ts` (3); reached
    `e2e/observation` lifecycle/transient/limit (10)
- Command (accepted frontend):
  `caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-read-recovery.spec.ts dashboard/frontend-tests/intent/intent-candidates-read-recovery.spec.ts --workers=2`
  (pass; `slice5-frontend-proof-3.log.run.json` exit 0; IC restored;
  typecheck `npm run typecheck:dashboard` pass)
- Evidence: `open-dough/evidence/slice5-implementation-return.md`,
  `open-dough/evidence/refactor-slice5-return.md`,
  `open-dough/evidence/slice5-frontend-proof-3.log`,
  `open-dough/evidence/slice5-ic-restored.log`,
  `open-dough/evidence/slice5-e2e-intent-boundary-3.log`,
  `open-dough/evidence/slice5-e2e-observation.log`,
  `open-dough/evidence/slice5-typecheck.log`

### Slice 6 — composed page bounds Gherkin panes below the banner

- Promise: shared `ConfiguredDashboardFrame` for ConfiguredDashboard and
  held-work `mountIntentCiPage`; production owns frame/banner/notice/scroll;
  routing/selection/published I/O stay with existing owners; below-banner
  outer region fits height and stays stationary (scrollTop 0) while tree
  scrolls to 200 and reading pane to 300; left-edge and pane-bottom preserved;
  recheck Intent/Navigation mountIntentCiPage layout/notice/navigation
- Boundary: `ConfiguredDashboardFrame` → `PageFrame` +
  `StoryReferenceNavigation` + banner; `ConfiguredDashboardContent` owns
  PerspectiveScroll / page-header / BoardOrIntent; empty projects stay on
  `PageFrame` alone
- Setup: MakeMe published work + gherkin locations/files; viewport 1280×600
  for layout; unread CI reads; held-work typed view inputs into Frame + Content
- Observations:
  - `intent-gherkin-layout.spec.ts`: no outer overflow; stationary region;
    left-edge; pane bottoms; independent scroll `[0,200,300]`
  - Intent/Navigation mountIntentCiPage consumers: gherkin-groups,
    reading-place, recent-stories, story-reference-done{,-reveal,-recovery,
    -cancellation} (20 passed)
  - Production path: accessible-board-announcements + intent-read-recovery
    through Frame (7 passed)
- Command (accepted layout + Done notice):
  `caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-gherkin-layout.spec.ts dashboard/frontend-tests/navigation/story-reference-done.spec.ts --workers=2`
  (pass; `slice6-layout-proof-2.log.run.json` exit 0; consumers
  `slice6-consumers-proof.log.run.json` exit 0; configured-path
  `slice6-configured-path.log.run.json` exit 0; typecheck
  `slice6-typecheck-2.log.run.json` exit 0)
- Evidence: `open-dough/evidence/slice6-implementation-return.md`,
  `open-dough/evidence/refactor-slice6-return.md`,
  `open-dough/evidence/slice6-layout-proof-2.log`,
  `open-dough/evidence/slice6-consumers-proof.log`,
  `open-dough/evidence/slice6-configured-path.log`,
  `open-dough/evidence/slice6-typecheck-2.log`

### Slice 7 — Visiting Project Intent preserves Board selection and reading places

- Promise: move `intent-project-visit.spec.ts` and
  `intent-project-visit-selection.spec.ts` onto production observation via
  `mountBoardFrame`; typed snapshot/detail, Intent source/Candidates, story
  and project CI; select story on visible Board; switch perspectives through
  page controls; keep Purpose/Proof, file and scroll across Project visit;
  candidate shows pinned published source and trunk CI; return focuses
  candidate without reread and restores story reading; clear/reselect while
  Intent hidden opens story CI comparison; clear after Candidates opens
  project CI; keep `e2e/intent/intent-project-visit-ci.spec.ts` separate
- Boundary: `ConfiguredDashboard` via `mountBoardFrame` optional `ci`/`review`
  into `pageReadsSupplying`; `intent-project-visit-fixtures` mount/selection
- Setup: MakeMe published Taken work; memoized Intent candidates/text;
  review diffs/text; `inertCiReads` + `judgedStatus` for trunk; Board Taken
  card + Development/Intent radios
- Observations:
  - `intent-project-visit.spec.ts`: deepSpec scroll restore; published
    candidate `a 11` without `more`; `data-candidates-reads` stable; keyboard
    CI home; reads `["candidates", text path]`
  - `intent-project-visit-selection.spec.ts`: hidden clear/reselect → story
    CI comparison; clear after Candidates → Project CI of main
  - Timing at workers=2: Playwright BEFORE ~6094ms; Vitest AFTER ~5533–6915ms;
    engines after move Playwright 0 / Vitest 2 for these files
- Command (accepted visit + selection):
  `caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-project-visit.spec.ts dashboard/frontend-tests/intent/intent-project-visit-selection.spec.ts --workers=2`
  (pass after refactor and format; typecheck
  `caffeinate -s -i npm run typecheck:dashboard` pass on implementation)
- Evidence: `open-dough/evidence/slice7-implementation-return.md`,
  `open-dough/evidence/refactor-slice7-return.md`,
  `open-dough/evidence/slice7-vitest-proof-3.log`,
  `open-dough/evidence/slice7-vitest-after.log`,
  `open-dough/evidence/refactor-slice7-vitest-proof.log`,
  `open-dough/evidence/slice7-vitest-postformat.log`,
  `open-dough/evidence/slice7-typecheck.log`,
  `open-dough/evidence/slice7-timing.md`

## Learnings

- Frontend Vitest Chromium cases must use browser-safe `pageMakeMe` and
  `renderPublishedBacklog`, not Node `makeMe.mjs` / `describedRevisions`.
- Slice 4 must open Sources against the same `expectedDetailPaths` set exported
  from the path-mix supply.
- `progressSource` resolve/read lives in `branchPlanRead.ts`; projection and
  the watch set stay in `progressSource.ts`.
- Replacing sync `useAgentLaunches` mocks with typed machine reads exposes
  Cancel→Enter reopen races; settle the first machine answer before Board
  interaction and open Start on keydown, not click synthesis alone.
- Vitest browser `toHaveAttribute` does not accept a RegExp expected value;
  use `expect.poll(...).toMatch`.
- Typed Intent reads must memoize candidates/file fetches like `answerMemo`
  when asserting one-shot HTTP-style accounting after Project Intent remounts.
