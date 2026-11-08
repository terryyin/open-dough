---
id: SEED-262
status: active
planted: 2026-11-08
scope: epic
---

# Faster dashboard test feedback

Developers running dashboard checks should get a result sooner while keeping
the integration proof that makes each check worth running. Start with
[`agent-launch-attention.spec.ts`](../../dashboard/tests/sessions/agent-launch-attention.spec.ts).
Both cases passed in 12.02–13.01s wall with two local workers. That profile
separated run startup, shared hooks, and test bodies. Use it to find other
consumers of each cost and prove savings across the affected family.
[Profiling evidence](../TEST-OPTIMIZATION-CANDIDATES.md#card-attention-launch-and-origin-setup)

For each story, compare the same ordinary test selection before and after
under comparable conditions. Include the starting example where it bears the
cost and a second consumer or representative selection. Report elapsed time,
executed cases, and the phase or operation each story changes. Keep the
surviving proof explicit and include its runtime when coverage moves to another
tier. Follow the project's
[test automation rules](../../AGENTS.md#test-automation),
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests),
[macOS test gate](../../tests/local-test-resources.md#machine-sleep-on-macos),
and [definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Story decomposition

<a id="build-explicit-git-fixtures"></a>

### Build each test’s Git repository from explicit MakeMe data

**Identity:** SEED-262#build-explicit-git-fixtures
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A maintainer can see at the test's call site which Git repository
facts the case needs. A test using the default gets a minimal valid client
repository. Any setting, ref, file, story, or historical transition that
drives the case is declared explicitly.

**Scope.** Extend the shared MakeMe API with descriptive repository setup
that composes the canonical domain builders. A shared test harness
materializes the description as real Git, using the repository's test data
architecture for setup and teardown. Start with the attention spec, then
migrate all test families that arrange Git repositories across the test
entries. Route existing setup helpers through the shared path or remove
them when superseded. Keep the real operations under test and independent
assertions visible in each case. Pass any exact malformed or legacy input
under proof explicitly.

**Evaluation.** In the attention spec, each case declares only the stories
and published transitions it observes. Across the suite, all repository
setup uses the shared builder and materializer, with obsolete setup code
removed. Verify that existing cases still prove their Git and product
behavior. Record ordinary fixture and run times after migration as the
baseline for the performance story.
[Test data architecture](../../tests/README.md#test-data-architecture) ·
[Published work domain data conversion](SEED-261-share-domain-test-data.md#map-published-work-test-data)

<a id="reuse-immutable-git-histories"></a>

### Speed up Git fixture construction behind the builder

**Identity:** SEED-262#reuse-immutable-git-histories
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer gets faster test feedback when equivalent repository
requests can reuse immutable Git data behind the same MakeMe setup.

**Scope.** Use the [migrated Git fixtures](#build-explicit-git-fixtures)
to find recurring repository shapes and reusable immutable parts, such
as trees or commit histories. The attention spec's original workers each
spent about 3s preparing the same history. Measure which reuse is worthwhile
with the new builder. Keep reuse inside the shared materializer. Each
test gets its own mutable refs, config, index, and working state.

**Evaluation.** Compare the same selections before and after with cold and
warm setup and parallel workers. Show lower elapsed time and equivalent
file contents, refs, ancestry, and test verdicts. A test that advances or
mutates its repository leaves a concurrent test's repository independent.
[Existing template reuse](../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs#L132)

<a id="prepare-artifacts-on-demand"></a>

### Prepare dashboard test artifacts only when selected tests need them

**Identity:** SEED-262#prepare-artifacts-on-demand
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer can run a focused backend, frontend, or integrated
selection without paying to produce run-wide artifacts the selection never uses.

**Scope.** Start with the setup charged to the attention spec and the
in-process count checks. Three count checks took 4ms combined and 3.31s from
the command line. Cover the build, server bundle, and installed-start origin
preparation in the common entry point. Keep required outputs fresh from the
current checkout, shared within their run when safe, and cleaned up.

**Evaluation.** Compare an in-process selection, a frontend-only selection,
and mixed and installed-start selections. Observe which artifacts each
produces and when. Show lower focused wall time and measure mixed-run time
to catch costs that move from startup into the tests.
[Global setup](../../dashboard/tests/support/globalSetup.ts)

<a id="arrange-prerequisite-state"></a>

### Set up test preconditions without replaying unrelated workflows

**Identity:** SEED-262#arrange-prerequisite-state
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer running a journey can get to the behavior it proves
sooner when an unrelated workflow only supplies its initial state.

**Scope.** Start with already-open sessions in the attention and related
session journeys. Each attention case starts three workflows before its
first named assertion step. Arrange valid prerequisite state through shared
builders and the relevant persistence and fake-host boundaries. Extend the
approach to other journeys where the setup workflow has dedicated coverage.
Keep the real actions when launch, the resulting state, or a later change
such as Mark as done is the behavior being proved.

**Evaluation.** Show lower setup time and fewer launch-triggered requests
while keeping the attention, membership, and session-management assertions.
Run the journey that owns starting from a card to confirm its coverage still
holds. [Journey coverage ownership](../../dashboard/tests/native-host-fixtures.md)

<a id="refresh-without-unneeded-reloads"></a>

### Avoid redundant board reads

**Identity:** SEED-262#refresh-without-unneeded-reloads
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/507-avoid-redundant-board-reads/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5a65a26158daace7eeb1530382fe68baf66e923b8ad87c2e4aadf166cdf8d2a3","plan":"0fc16c0d73ed158e2106da62181d24ecd7d7da56eeb24bc9f23deae93b5259c6"}}
```

**Goal.** Developers running the dashboard’s Board and session journeys get to
the same assertions sooner by avoiding full Board reads for steps that can
observe the published revision or machine-local session change in place.

**Scope.** Start with the attention journey and the related card-session-state
journey. Drive revision changes through normal in-page published observation
and session changes through the existing session-record observation. Preserve
the integrated browser, committed fake origin, real launch and done actions,
and existing membership and session assertions. Keep explicit reloads,
server restart, and project switches that prove restored state or isolation.
Production observation and caching, broader journey conversion, and fixture
and polling changes owned by the other stories are outside this increment.

**Key examples.**

- With sessions already shown on the open Board, origin publishes Preparing,
  Taken, or a revision where a story leaves all lists. The same document
  shows the new revision and corresponding membership. Attention follows
  the published card, and the removed story’s open session is still reachable
  from local Taken.
- With the published revision unchanged, the session listing fails. Open
  entries become State unknown and retain Open terminal in the same
  document without another published snapshot. The attention journey still
  proves that local changes affect counts and leave published card facts intact.
- Switching projects shows only that project’s sessions and attention.
  Returning, deliberately reloading, or restarting where the journeys call
  for it still proves restoration through the normal open path.

**Evaluation.** Compare the same ordinary focused selection before and after.
Both journeys must make fewer full Board reads that resolve the configured
ref. Attribute requests by project, revision and path, and show separately
the pinned snapshot reads needed for new revisions, conditional heads checks,
and unrelated launch traffic. Compare elapsed time to the asserted result
and focused command wall time with the same cases and proof intact.
[Board transition helper](../../dashboard/tests/storyColumnsPage.ts)

<a id="reduce-private-fixture-lifecycle-cost"></a>

### Reduce the cost of private dashboard test fixtures

**Identity:** SEED-262#reduce-private-fixture-lifecycle-cost
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer running browser or boundary tests spends less time
starting and stopping private test infrastructure while cases can still run
independently.

**Scope.** Start with per-case preview, browser context, fake service, and
native-host setup and cleanup in the attention profile. Find similar
per-case costs and use the cheapest fixture that still proves the required
boundary. Preserve real preview and restart paths where they provide unique
proof. Run-wide build and Git artifact production belong to the other
setup stories.

**Evaluation.** Compare per-case setup and teardown as well as wall time for
the affected selection. Concurrent cases and runs keep their own mutable
state and fake answers, and all processes and scratch data are cleaned up.
[Dashboard fixture contract](../../dashboard/tests/README.md#what-is-real-and-what-is-replaced)

<a id="drive-polls-with-time-and-replies"></a>

### Make dashboard polling tests advance on controlled time and observed replies

**Identity:** SEED-262#drive-polls-with-time-and-replies
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer running observation tests gets results as soon as the
relevant answer is available, with time-dependent behavior still proven.

**Scope.** Start with session polling in the attention spec. Its eight
virtual clock steps took 13ms, while observing the session answers took about
0.42s. Look across session and revision observation tests for repeated waits,
unnecessary polling, and remaining elapsed waits. Use controlled clocks for
cadence and observable events for completed requests. A clock seam in the
released GitHub request owner remains a
[separate decision](../TEST-OPTIMIZATION-CANDIDATES.md#auto-refresh-rate-limit-real-waits).

**Evaluation.** Show a measurable reduction in real wait or request cost
across the selected family. Retain checks for the absence of early requests,
the expected cadence, and failure and recovery. Compare wait duration and
request count with the ordinary test verdicts and fixtures intact.
[Synchronization guidance](../../dashboard/tests/writing-journeys.md)
