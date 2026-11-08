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

<a id="reuse-immutable-git-histories"></a>

### Reuse immutable Git histories across dashboard tests

**Identity:** SEED-262#reuse-immutable-git-histories
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer running tests that read the same published revisions
gets feedback sooner because equivalent read-only history is prepared once
across its consumers.

**Scope.** Start with the story-column origin shared by the attention and
story-card session journeys. The attention file spent about 3s in each
worker's setup hook building the same history. Apply the result to other
consumers that use equivalent histories. Preserve exact revision contents,
private mutable refs and checkouts, and dedicated coverage of real publication.
This story owns repeated construction of the same history within a run.

**Evaluation.** Run multiple workers and the sibling journey. Show fewer
history constructions and lower elapsed time, accounting for overlap between
hooks. A test that advances or mutates its own repository cannot change the
history another test reads. [Story-column fixture](../../dashboard/tests/launchJourney.ts)

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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer running dashboard journeys gets the next observable
result sooner by avoiding repeated reads of published board data that the
test already has or does not need for the behavior under test.

**Scope.** Start with the attention spec and related board journeys. The
attention profile recorded six full page loads and 116 total fake `gh`
requests. Identify the published-board reads and trace which actions cause
them. Where a scripted reload forces a redundant read, use the normal
in-page update path and wait for the specific published update or local
session result the assertion depends on. Keep real project switches and
explicit reloads where they prove isolation or restored state.

**Evaluation.** Show fewer published-board reads in the attention spec and
at least one related journey. Compare requests by project, revision, and
path alongside time to the asserted state and focused command wall time.
Verify that a published column change still shows the new revision and
correct session placement, that a local session change preserves published
facts, and that the reload and project-switch proofs still hold.
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
