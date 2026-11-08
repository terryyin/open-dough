# Build each test’s Git repository from explicit MakeMe data

**Identity:** SEED-262#build-explicit-git-fixtures

**Source:** [Build each test’s Git repository from explicit MakeMe data](../../seeds/SEED-262-faster-dashboard-test-feedback.md#build-explicit-git-fixtures)
**Source review:** [Source-only commitments](source-review.md)

## Execution context

- Story Branch Mode in the dashboard-established linked worktree on
  `codex/build-each-test-s-git-repository-from-explicit-m`. Integration checkout
  is `/Users/terryyin/git/open-dough`, with target `origin/main`. Publisher
  `dashboard-territory.local-open-dough` and agent `chaifeng-chan` own the
  established Take at `16d42d6acf6556d8e63b9f62fd14f73fa8d8f89b` from
  `3c05bff870ef5eb76d815d82dbe89edcf4d04118`. The Take is on the story branch
  and in trunk history. The checkout passed locked npm install, native
  Chromium prerequisite validation and dashboard typecheck.
- Codex observer `seed262-510-45715bb8`, cell `g128:12`, session `7362`,
  PID `73853`, directory `/tmp/dough-ci-501/watch-Qkcwh4`, on the remote story
  branch, verified against GitHub Actions `ci.yml`.
- Existing planning authority applies. For focused dashboard proof on the AC
  powered macOS development host, run two workers under `caffeinate -s -i`.
  At launch, the host had 16 logical CPUs, 66% memory free, short load 3.32,
  and no full-suite admission holder. Keep owned expensive runs sequential and
  recheck load and admission when contention or failures change that basis.

## Goal and boundaries

A maintainer reading a test in the queued-trunk family can see which
repository facts drive it. These are the stories, published records, named
trunk revisions, and the author and committer the product reads. The tests
get the facts from a MakeMe repository description that the shared harness
materializes as real Git. The family is `createQueuedTrunk`,
`createPreparationTrunk`, `createSiblingTrunk`, the startup and admission
fixtures and their case modules, the supplier-dependency fixtures, and the
dashboard `launchJourney` with its story-columns history. On 2026-11-08 this
was 126 non-native files, including about 100 dashboard specs that reach the
journeys through the worker fixture or `publishStoryColumnsJourney`.

Exclusions:

- The four native scenario fixtures and the startup shell fixture keep
  calling `createQueuedTrunk` and `createPreparationTrunk` unchanged, so their
  evidence identities and paid runs are untouched.
  [Shell release and native fixtures](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-shell-release-and-native-fixtures)
  moves them and removes the last copy.
- Other fixture hubs belong to their sibling stories.
- New cross-description caching belongs to
  [faster Git fixture construction](../../seeds/SEED-262-faster-dashboard-test-feedback.md#reuse-immutable-git-histories).

The story records a blocking dependency on the
[published agent profile pilot](../../seeds/SEED-261-share-domain-test-data.md#share-published-agent-profile-builders)
([plan 505](../505-share-published-agent-profile-builders/PLAN.md)). Execution
starts only after the pilot publishes `tests/support/makeMe.mjs` and
`anAgentProfile` on trunk, and then reuses that entry point.

## Current decisions

- **Description in MakeMe, Git in the harness.** `makeMe.aRepository` builds
  plain data: the starting published files, then ordered named revisions. Each
  revision holds file changes, removals, message, author and committer.
  Revision content composes `anAgentProfile` and the published-work builders,
  and is encoded with `renderBacklog` and `renderEntry`,
  `recordStoryState`, `renderAgentProfile`, `renderDoneRecord`, and
  `catalogDoneRecords` with `renderDoneCatalog`. Literal bytes pass through
  unchanged. One harness materializer lives in `tests/support` beside
  MakeMe and reuses `createBareFixtureRemote` and `fixtureTeardown`. It
  creates the bare origin and an integration checkout, commits and pushes
  each revision, and returns `{ origin, integration, fixture, revisions,
  cleanup, defer }`. That shape stays compatible with what `createQueuedTrunk`
  callers read.
  [Test data architecture](../../../tests/README.md#test-data-architecture) ·
  [ADR 0002 §5](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
- **Reuse published-work builders.** Compose the existing backlog entry,
  story preparation, and done-record builders from
  [MakeMe](../../../tests/support/makeMe.mjs). Extend those builders when a
  repository description needs additional facts.
- **Name shared histories.** About 100 dashboard specs observe the same
  worker-scoped launch or story-columns history. Those histories become named
  descriptions in `launchJourney.ts`, so the facts are readable there.
  `StoryColumnsJourney` keeps its `queued`, `preparing`, `taken` and
  `completed` fields, and `LaunchJourney` keeps `taken`. A case whose facts
  differ declares its own description at its call site.
- **Declare driving commit facts.** An agent's announcement or Take commit
  names the agent as author and the developer as committer, as the
  production commands do today. The dashboard credits the committer and
  reads committer time. Other commits use the fixed developer identity and
  Git's current time. A done record's `completedAt` is passed explicitly from
  the test's clock, because the Recently done window depends on it.
- **Run commands only where they are proven.** Setup no longer runs `start`,
  Take, or `complete`. A test whose subject is one of these commands still
  runs it on the materialized repository.
- **Keep reuse.** The materializer keeps today's per-process reuse for
  identical descriptions: build once into a template, copy it, and point the
  copied checkout's `origin` at the copy. This replaces the queued-trunk
  template so focused runs do not slow down. Every test still gets its own
  mutable repository.
- **Coordinate with plan 507.** [Plan 507](../507-avoid-redundant-board-reads/PLAN.md)
  is Taken and edits the attention spec's observation steps. This plan
  changes only how the history is built and keeps the journey's public fields
  unchanged. Rebase on 507's landing when the two meet.

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| Seed example 2: the attention journey's history comes from an explicit description | Slice 1 | Both attention cases pass with unchanged assertions. At each named revision the description's files match a command-replayed baseline byte for byte, with matching author and committer. No production command runs during journey setup. |
| Every consumer of the shared launch and story-columns journeys keeps its verdict | Slice 1 | The specs that use `launchJourney`, `publishStoryColumnsJourney`, `preparingJourney`, `longTitleLaunch` and `terminalPastePage` pass in one focused dashboard run, and `npm run typecheck:dashboard` passes. |
| Seed examples 1 and 3: default repository and a command under proof | Slice 2 | Skill tests on `createPreparationTrunk` pass with real `start`, land, and one-shot commands. The announce test declares the rival profile at its call site. Every description starts from the default: a one-commit `main` whose valid backlog is empty until the case declares its stories. |
| Seed examples 4 and 5: Git operations and literal input stay in the test | Slice 3 | Race, rejection and readiness cases on the startup, admission, one-shot and agent-commit fixtures pass with their pushes and literal bytes at the call site. |
| Supplier dependency facts are explicit | Slice 4 | The `tests/support` supplier visit and dependency tests pass. Their supplier and consumer stories are declared, and agreement changes still run through the real CLI. |
| Seed example 6 and the evaluation baseline | Slice 4 | No non-native family file calls a superseded helper. Only the native fixtures call `createQueuedTrunk` or `createPreparationTrunk`. Before and after times are recorded as the reuse story's baseline. |

## Decisive premises

[Decisive premise observations](proof.md#decisive-premise-observations).

Remaining hypothesis: the dashboard consumers' verdicts with the
materialized history. Slice 1's focused run settles it before other slices
build on the materializer.

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Never sleep, never use `test.slow()`, and keep the default timeouts. For full
runs on awake macOS with AC power, use `caffeinate -s -i` and put Homebrew Bash
first on `PATH`. On battery, follow the lid-open procedure and check the sleep
log. [Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Each slice runs its focused selections:

- dashboard: `npm run test:dashboard -- <paths> --workers=2`, with
  `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `NO_COLOR` and `FORCE_COLOR` unset;
- Node and skill: `bash scripts/test.sh <paths>`;
- `npm run typecheck:dashboard` whenever MakeMe or a dashboard helper changes.

The family's fixtures are loaded by about 230 test files across all
runners. So once before landing, run the whole `npm test` and
`npm run test:dashboard` suites.

## Slices

### 1. Build the launch and story-columns histories from a repository description

Type: Behavior

Status: done

Proof: Before changing anything, record two baseline runs of
`agent-launch-attention.spec.ts` with the proof record. Use a scratch command
replay to compare files, authors and committers at each named revision
against the description, then discard the scratch. Next, run the attention
spec and every spec that uses the launch or story-columns journey in one
focused dashboard run. Finally, run `npm run typecheck:dashboard`. Record the
attention spec's after times.

Add `makeMe.aRepository` and the harness materializer with the reuse
described above. Describe the queued trunk: Stories A and B Ready with plans,
and Story C queued last and not refined. Describe the story-columns history:
Yui-chan announces preparation of Story B, Akiho-chan takes it in Trunk Mode,
and Story C is completed. Describe the launch history, where Yui-chan takes
Story A. Rebuild `publishLaunchJourney` and `publishStoryColumnsJourney` on
these descriptions. Move `preparingJourney`, `longTitleLaunch`,
`terminalPastePage` and `sessionHostStatus` to the materializer where they
arrange a repository; keep any command a spec proves as a real call.

[Accepted proof and timing](proof.md#slice-1-accepted-proof).

Learning: Plan 507's closure was already on the accepted claim, so the
before and after timing used the same attention observation steps. Plan
508's sibling candidate had a compatible published backlog renderer but
was still outside trunk. This slice reused that renderer's contract with
current production types, and adds no competing backlog-entry or
story-preparation builder.

### 2. Preparation-assignment tests declare their trunk

Type: Behavior

Status: done

Proof: Run the 25 `createPreparationTrunk` and 7 `createSiblingTrunk`
consumers under `src/skills/dough-story-refinement` and
`src/skills/dough-execute-plan`, the dashboard `preparingJourney` consumers,
and `npm run typecheck:dashboard`. The announce, land, nerds, abandon,
recovery and one-shot tests keep their assertions and their real `start`,
`release`, `abandon` and land calls.

Express Story C and rival assignments as description facts at the call site.
`publishAssignment` becomes a declared revision. Keep the abandon test's
unrecognized rival profile literal. Every description extends the default
repository, so these real tests exercise it. Leave `createPreparationTrunk` in place only
for the native owned-context and one-shot fixtures.

[Accepted proof and timing](proof.md#slice-2-accepted-proof).

### 3. Startup, admission and agent-commit tests declare their trunk

Type: Behavior

Status: planned

Proof: Run the `createQueuedTrunk` consumers under
`src/skills/dough-execute-plan`: startup cases, admission, one-shot queued,
races, and agent-commit. Pushes, rejections, ownership refusals, readiness
and dependency outcomes stay asserted as before.
`CONTRIBUTING.md` and the setup and command scripts are declared files.
Durable command evidence keeps its fixture-relative marker paths.

Replace `createQueuedTrunk` options with description facts: the stories each
case needs and the `contributing` text. Keep `createQueuedTrunk` with its
current body only for the native callers. Its non-native template code moves
into the materializer's reuse.

### 4. Supplier fixtures declare their stories and the family drops superseded setup

Type: Behavior

Status: planned

Proof: Run the `tests/support` supplier dependency, land, integration and
closure visit tests. A repository search shows no non-native family file
calling `createQueuedTrunk`, `createPreparationTrunk` or a removed helper.
Run the whole `npm test` and `npm run test:dashboard` suites once. Record the
attention spec and one migrated skill selection before and after, under the
same conditions, as the reuse story's baseline. Include executed cases,
elapsed time and fixture time.

Route `supplier-dependency-fixture.mjs` and its visit fixtures through
descriptions that declare supplier and consumer stories. Keep agreement and
resolution in the real CLI. Delete helpers whose last non-native consumer is
gone.

## Plan concerns

Slice-plan refinement was not needed. Each slice migrates one consumer group
behind the shared materializer with its own focused proof, and slice 1 settles
the remaining hypothesis before the others depend on it. No slice-specific
concern remains. Keeping `createQueuedTrunk` and `createPreparationTrunk` for
the native fixtures is an accepted interim behavior, replaced by
[shell release and native fixtures](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-shell-release-and-native-fixtures).
