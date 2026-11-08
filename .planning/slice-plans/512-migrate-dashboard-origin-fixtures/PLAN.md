# Build dashboard test repositories from explicit MakeMe data

**Identity:** SEED-262#migrate-dashboard-origin-fixtures

**Source:** [Build dashboard test repositories from explicit MakeMe data](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-dashboard-origin-fixtures)
**Source review:** [source review](source-review.md)

## Goal and boundaries

A maintainer reading a dashboard journey or backend spec can see at its call
site, or in its fixture file, which repository facts its fixture starts with
and which later commits it adds. The shared harness materializes the MakeMe
descriptions for `startOrigin`, its publishers, and the standalone readiness
and admission fixtures. Dashboard feedback does not get slower.

Exclusions:

- The description gains no branch or merge model. Story branches, worktrees,
  merges, fast-forwards, first-parent rewrites and held pushes stay Git
  operations in the helper or test. A completion that a helper runs on a story
  branch, as in `completedPublishedStory`, stays as it is.
- Clean-trunk, Node and shell fixtures belong to their sibling stories.
- Cross-description caching beyond today's run-wide preparation and the
  materializer's per-process reuse belongs to
  [faster Git fixture construction](../../seeds/SEED-262-faster-dashboard-test-feedback.md#reuse-immutable-git-histories).

The story records a blocking dependency on
[the shared repository builder](../../../tests/support/repository-fixture.mjs).
Execution starts after `makeMe.aRepository` and its materializer are on trunk,
then extends them.

## Current decisions

- **Shared description, explicit at each call site.** Reuse the description
  plan 510 builds for the skill tests: `queuedReadyRepository()` in
  `tests/support/queued-repository.mjs`, Stories A and B queued, refined,
  planned and Ready, with their seeds and plans. Its `.planning` files match
  today's start origin byte for byte, so the dashboard adds no copy of it.
  `queuedIdentity` and `otherQueuedIdentity` come from its `storyA` and
  `storyB`. `queuedTitle` is a launch title, not a repository fact, and stays
  with the launch expectations. Each `startOrigin` call and each of the seven
  origin fixtures (`startOriginTest`, `responsiveStart`, `keptStartJourney`,
  `storyDependencyFixture`, `preparationPage`, `codexStart`, `cursorStart`)
  passes a description. A spec that needs other facts overrides the fixture's
  description with `test.use`. `startOrigin()` with none gets the
  description's default: an empty valid backlog. No implicit default holds
  stories. [Test data architecture](../../../tests/README.md#test-data-architecture)
- **Installation is a harness layer.** Before materializing, the dashboard
  harness adds `.gitignore` and the installed skills for the selected layout,
  from this run's working-tree source, to the first revision's `files`, with
  Dashboard Developer as author and committer. The origin keeps one root
  commit, as today. Installation never enters MakeMe or the shared
  description.
- **Keep run-wide preparation.** Global setup prepares the default and the
  shared description once per layout through `materializeRepository` with
  the installation layer. It packs each origin with
  `git clone --bare --no-local` as today, and each test copies the
  prepared origin and clones its project with the same `insteadOf`, no
  upstream and no `origin/HEAD`. A different description is materialized
  through the materializer's per-process reuse on top of the same
  installation layer. A nested configuration without global setup prepares
  what it uses, as `initializeStartOrigin` does now.
- **Declare published planning facts.** A helper that writes or commits
  seeds, story state, backlog entries, agent profiles, dependency agreements
  or done records on trunk declares them as description revisions encoded by
  the production encoders. `publishChangedReview` becomes a declared revision
  that changes Story A's seed and keeps its recorded assessment bytes.
- **Preserve what the standalone fixtures exercise.** Migrate the starting
  repositories built through `storyReadinessCli.ts` and `admittedWork.ts`.
  Readiness still serves the selected checkout commit, with the deliberate
  unpushed seed edit, path-specific commits, and malformed or stale inputs
  arranged as the specs require. In admission, materialize the published
  queue and apply the draft as local files. The real `start --admit` still
  publishes the revision the dashboard reads.
- **Declare claims a spec does not prove.** `takenByAnotherAgent` used only to
  make a story Taken becomes a declared Take revision. It changes the backlog
  and the agent's profile, is authored by the agent's
  `<name>-chan@example.org` identity and is committed by the developer, with
  the message `Take queued work: <identity>` that `claimOf` searches for.
  `start-origin-isolation`, `agent-launch-preparation-resume` and any spec
  whose subject is the start keep the real call. `takenInTrunkMode` stays
  real where the spec reads the worktree and branch that the start leaves.
- **Build on plan 510 as it lands.** The published-work builders
  (`aBacklogEntry`, `aStoryPreparation`, `anAgentProfile`,
  `aSupplierAgreement`, `aDoneRecord`) are on trunk. The names above are plan
  510's at `eba65e39c`, with its slices 3 and 4 still to run. At execution
  start, read the landed `makeMe.aRepository`, `materializeRepository` and
  queued description, and keep these decisions on whatever names landed.
  Extend them rather than adding dashboard copies.
- **The shared writer outlives this story.** Slice 1 removes the dashboard
  re-export and use of `writeQueuedStories`. Plan 510 keeps
  `createQueuedTrunk`, which calls it, for the native fixtures, so the writer
  stays until its last consumer migrates.

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| Seed examples 1 and 2: default origin and the named shared stories | Slice 1 | A backend spec shows `startOrigin()` with no description has one commit with the installed skills and an empty valid backlog. Every spec importing `startOrigin` or one of the seven origin fixtures passes with unchanged assertions in one focused run. The prepared origin's first commit has the same files as before. `npm run typecheck:dashboard` passes. |
| Feedback does not get slower | Slice 1, then slice 3 | Before and after focused times for `agent-launch-start-refusal.spec.ts` and the `startOriginTest` journey family, under comparable load, differ by no more than run-to-run noise. |
| Seed examples 3 and 6: declared planning facts, superseded setup removed | Slice 2 | The story dependency, story reference, recently done, Trunk Mode review, one-shot review, completion closure, later-story and readiness-change specs pass unchanged. A repository search finds no dashboard helper calling `writeQueuedStories` or writing a published planning file on trunk that a description can state. |
| Seed example 7: standalone readiness and admission | Slice 2 | The focused specs keep their verdicts and assertions, including the invisible unpushed edit and the Taken card read from the real admission commit. Compare before and after times under comparable load. |
| Seed examples 4 and 5: commands and Git under proof | Slice 3 | The refusal, reconciliation, Intent and CI comparison specs pass with declared Take revisions and their Git graph steps unchanged. `claimOf` finds each declared claim. Start isolation and preparation resume still run the real start. |

## Decisive premises

Observed on 2026-11-08 in this worktree at `9f436aba4` on macOS with Node 24,
under a load average near 5.

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slice 1 reuses plan 510's shared description | On 2026-11-08 at `6d1f994d8`, with plan 510's branch at `eba65e39c` extracted into the job directory, `node <job-tmp>/cmp510.mjs` wrote `queuedReadyRepository().please()`'s one revision with that branch's `writeRevisionFiles`, wrote `writeQueuedStories` from trunk into another directory, and compared every file | The backlog, both seeds and both plans were SAME. The description also adds `trunk.txt`, and its revision message is `base trunk commit`. |
| Slice 1 encodes the shared description with production encoders | `node <job-tmp>/enc.mjs` imports `writeQueuedStories`, writes the stories into a scratch directory, and renders the backlog again with `parseBacklog`/`renderBacklog`. `renderEntry({identity:"SEED-A#a",title:"Story A",href:"seeds/A.md#a"})` is compared with the queued line. | Both SAME. The seeds already come from `recordStoryState`, so the description can reproduce today's bytes. |
| Slice 1 keeps run-wide preparation instead of committing stories per test | `<job-tmp>/m.sh`, run twice: 10 copies of a packed skills-only origin with `--no-hardlinks` clones, then one commit of two seeds and a backlog with a push in each | Copy and clone took 94–98 ms per test, and the extra commit and push took 113–120 ms per test. Per-test commits would roughly double origin setup, so preparation stays run-wide. |
| Slice 1 consumer set | `grep` for `startOrigin(` and for `origin: async` fixtures in `dashboard/` | 47 files called `startOrigin` at `9f436aba4` and 49 at `6d1f994d8`, 11 of them helpers at the first count. Seven fixtures create an origin. 70 helper modules and 95 specs import `startOrigin.ts`. About 200 dashboard test files name Story A or its identity. |
| Slice 2 preserves the standalone publication boundary | Read `storyReadinessFixture.ts`, `committedOriginRepo.ts`, `admittedWork.ts` and `taken-admitted-investigation.spec.ts` at `fe1b9d4bf` | Readiness serves committed bytes and local branch heads from the checkout at a chosen revision. Admission serves the bare origin at the revision accepted by the production command. Keep both inputs to the publisher and check the landed materializer against the focused specs. |
| Slice 3 declared claims are found as claims | Read `claimOf` in `storyCiComparisonHistory.ts` | It finds the latest commit on any ref by `<name>-chan@example.org` with `Take queued work` in its message, so a declared revision with that author and message is found the same way. |
| Slice 3 declared Take matches what start publishes | `0eb86657:.planning/slice-plans/510-build-explicit-git-fixtures/proof.md`, decisive premise observations, observed on 2026-11-08 at `3be3f59df` | `renderAgentProfile` and `renderBacklog` reproduced the profile and backlog bytes a real Take published, with the agent as author. |
| No native evidence changes | `tests/support/*-native-evidence.sh` list their inputs | None lists a dashboard support module, so no paid run is needed. |

The migrated verdicts cannot be observed before plan 510's materializer
lands. Slice 1's first focused run checks the default and shared origins,
including the extra `trunk.txt` and first-commit message of the shared
description, before slices 2 and 3 build on it. Slice 2 checks the standalone
fixtures against the landed materializer and the focused timing baseline.
Slice 3 checks declared claims.

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Never sleep, never use `test.slow()`, and keep the default timeouts. For full
runs on awake macOS with AC power, use `caffeinate -s -i` and put Homebrew Bash
first on `PATH`. On battery, follow the lid-open procedure and check the sleep
log. [Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Each slice runs its focused selections with
`npm run test:dashboard -- <paths> --workers=2`, with
`GIT_ALTERNATE_OBJECT_DIRECTORIES`, `NO_COLOR` and `FORCE_COLOR` unset, and
`npm run typecheck:dashboard` whenever MakeMe or a dashboard helper changes.
Global setup and `startOrigin` are loaded by most dashboard specs, so run the
whole `npm run test:dashboard` suite once before landing. Run `npm test` then
too, because MakeMe is shared with the Node tests.

## Slices

### 1. Start origins hold the facts their call site names

Type: Behavior

Status: done

Proof: Before changing anything, record two focused runs of
`agent-launch-start-refusal.spec.ts` and the `startOriginTest` consumers.
Then add the backend default-origin case and run every spec importing
`startOrigin` or one of the seven origin fixtures in one focused run. Compare
the prepared origin's first-commit file list with the old one. Run
`npm run typecheck:dashboard` and record the after times.

Let `startOrigin` and `initializeStartOrigin` take a description, and let
global setup prepare the default and the shared queued description per layout
through the materializer with the installation layer. Pass the description at
every call site and in each fixture, and remove the dashboard's
`writeQueuedStories` re-export and use.

Accepted proof (2026-11-08): one focused run of the 352 specs importing the
start-origin modules passed 827 of 827; `start-origin-default.spec.ts` observes
the default origin; the prepared first commit keeps all 705 old entries and
modes, adds only `trunk.txt`, and its message is now `base trunk commit`. The
shared revision writer gained `executable` so installed scripts keep 100755.
Fixtures name `queuedOriginRepository` from `startOrigin.ts` as their
overridable `originRepository` option. After-times ran under heavier load
(14.8–16.3 against 10.5), so G3 carries the timing comparison to slice 3.

### 2. Publishers declare the planning facts they add

Type: Behavior

Status: planned

Proof: Run the specs of `storyDependencyFixture`, `storyReferenceDone`,
`recentlyDoneSessionsSidebarPage`, `responsiveRecovery`,
`storyReviewTrunkMode`, `oneShotExecutionReview`,
`completionClosurePublication`, `laterStoryMergesTrunk` and the
readiness-change specs that call `publishChangedReview`. Include any other
specs that reach the changed `storyReadinessCli.ts` helpers. Then search for
`writeQueuedStories` and for trunk writes of published planning files in
dashboard helpers.

Before migrating the standalone fixtures, record focused times for
`story-readiness.spec.ts`, `story-readiness-gaps.spec.ts`,
`story-readiness-accessible.spec.ts`, `preparation-legend.spec.ts`,
`frame-board-look.spec.ts`, `project-keyboard-navigation-eligibility.spec.ts`
and `taken-admitted-investigation.spec.ts`. Repeat that selection after the
migration under comparable load and keep the same assertions. If the extra
origin setup slows readiness feedback beyond run-to-run noise, coordinate
the shared local-checkout option with
[plan 524](../524-migrate-backlog-scratch-repositories/PLAN.md) and recheck
before closing the slice.

Replace each hand-written seed, story state, backlog, profile, agreement or
done record committed to trunk with description revisions at the call site or
in the fixture file. Keep literal bytes that a spec proves, such as an
unreadable record, at the call site. Move the standalone readiness and
admission setup onto the same materializer. Keep the real admission and
the readiness edits and commits under proof. Delete helpers that become
unused.

### 3. Specs declare claims they do not prove

Type: Behavior

Status: planned

Proof: Run the specs that reach `takenByAnotherAgent` or `takenInTrunkMode`,
including the Intent and CI comparison families in `dashboard/tests/intent`.
Then run the whole `npm run test:dashboard` and `npm test` suites once. Record
the slice 1 selections again under comparable load as the evaluation and as
the reuse story's baseline, with executed cases and elapsed time.

Replace arranging uses of `takenByAnotherAgent` with a declared Take
revision, and the CI comparison publishers' trunk planning and claim commits
with description revisions under their Git graph steps. Keep the real start
where it is proven, and `takenInTrunkMode` where the spec reads the worktree
it leaves.

## Plan concerns

Slice-plan refinement was not needed. Each slice migrates one consumer group
with its own focused proof. Slice 1 settles the shared materialized origin
before slices 2 and 3 build on it. No slice-specific concern remains beyond
the dependency on plan 510's materializer, which the recorded agreement
blocks on.


## Story obligations

### G1. Fixture description override not yet exercised
Reported: slice 1 — "No spec overrides a fixture's description with test.use yet; the option exists in all seven fixtures."
Story clause: "a spec that needs other facts overrides it with `test.use`"
Disposition: receiving slice 2
Commitment: 11


### G2. Private materialization of a non-shared description not yet exercised
Reported: slice 1 — "Only the no-owner isolation cases exercise private preparation; no third description reaches it yet."
Story clause: "A description that is not prepared run-wide is materialized through the shared materializer's per-process reuse on top of the same installed skills."
Disposition: receiving slice 2
Commitment: 17

### G3. Slice 1 after-times ran under heavier load
Reported: slice 1 — "After-times ran at load 14.8-16.3 against about 10.5 before (refusal 9/8 s vs 9/6 s; startOriginTest consumers 73/81 s vs 60/68 s), so they cannot show no slowdown."
Story clause: "Dashboard feedback must not get slower."
Disposition: receiving slice 3
Commitment: 6