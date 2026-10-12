---
id: SEED-131
status: active
planted: 2026-10-12
planted_during: Terry's one-shot review of project retrospective findings
trigger_when: Improve repository test feedback for parallel contributors
scope: medium
---

# SEED-131: Reliable repository test feedback on a shared machine

## Why This Matters

Open Dough contributors run dashboard proof concurrently in separate worktrees.
A full disk can invalidate a long run and interrupt other work. More frequently,
a silent successful run leaves contributors listing or rerunning tests to learn
what they selected. Both costs belong to this repository's test tooling.

The selected responses address [ProjectFindings.md](../../ProjectFindings.md),
not the published skills or their workflow guidance. They do not change the
dashboard's behavior for its users, the public runtime's caching or CI policy,
or the required meaning of a passing test. The findings' original occurrences
remain in that file and its linked Git history.

## Stories

<a id="bound-suite-compile-cache"></a>

### 1. Bound the dashboard suite's own compile-cache disk use

**Identity:** SEED-131#bound-suite-compile-cache
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/302-bound-suite-compile-cache/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9d2c0eab6a3425e097307c408eb07c3b09f9dc2692bfcd0362219d36d1c3ded1","plan":"66539d3bf94af1f1c59d45f2a38661f9bfa3b7382a5fc9da2f49a94ddd62ce60"}}
```

**Goal:** A contributor can run repeated or concurrent dashboard proof with
fresh fixture paths without those test subprocesses accumulating Node compile
cache on the shared machine, avoiding lost proof and interference with other
contributors.

**Evidence:** [DD-287](../../ProjectFindings.md#dd-287) records one full disk,
a lost 15-minute run, and 134 GB in the shared cache. A later measured run added
about 1 GiB; the source of the entire accumulation is unknown. The locked Vite
and Rolldown launchers enable Node's compile cache, while repository test launch
and fixture setup currently supply no cache lifecycle policy.

**Scope:** Prevent persistent compile-cache writes from the suite's builds,
dev/preview servers, and fresh deployment fixture descendants. Put the policy
at the shared dashboard test entry so the documented npm and direct Playwright
invocations inherit it. Preserve assertions, strict quiet reporting, failure
status, worker/process cleanup, and existing suite deadlines. Preserve other
sessions' cache and the behavior of ordinary dashboard commands outside tests.
Measure actual disk effects and elapsed proof time against the current launch,
then update DD-287 with the observed result and limitations at completion.

The selected approach disables compile caching for test descendants rather
than allocating a cache that must later be reclaimed. Failure or interruption
therefore leaves no new compile cache from those descendants to recover;
existing process and non-cache fixture cleanup keeps its current contract.
This does not promise that a forcibly killed worker cleans up all its other
resources.

**Constraints and deferred promises:** Never sweep the shared temporary
directory or delete entries owned by another session. This follows the shared
machine preservation requirement above, not a fixture example. Existing shared
cache is not migrated or reclaimed. General machine maintenance, a universal
disk quota, runtime/CI policy changes, installed skill changes, and the sibling
proof-selection story are outside this delivery. A caller explicitly enabling
Node caching before Playwright loads its configuration may still cache that
runner's startup; the promise concerns the suite-created descendants and fresh
fixture growth, not changing the calling shell's policy.

**Key examples:**

1. A normal dashboard selection builds the app and installs/builds a fresh
   deployment fixture → run it twice with distinct fixture paths → both strict
   verdicts pass and no new persistent Node compile cache comes from those
   descendants on either run.
2. Two test runs overlap on the same machine → each builds and serves its own
   fixtures → both complete independently, without deleting or replacing the
   other's files or relying on the other's cleanup.
3. A test fails, or its run is interrupted after a child starts → observe its
   failure/interruption and stop its owned processes → the cache does not grow,
   and no shared-cache cleanup is required before another run.
4. A cache directory already holds another session's entries, including when a
   child inherits an explicit cache location → the suite runs → those entries
   remain byte-for-byte intact. An ordinary dashboard command launched outside
   the suite retains its existing cache behavior.

**Alternatives and decision:** Preparation reproduced growth from real Vite
build/preview journeys and compared a temporary test-config disable setting
with caching into an isolated directory. Two fresh-deployment runs grew that
directory from 10,784,756 to 18,839,696 bytes; two disabled runs added no files
or bytes. Their elapsed times were 8.413/8.106 seconds versus 7.696/8.102
seconds. Dev/preview page journeys also passed with disabled caching and
preserved the existing cache hashes. This small sample supports disabling
test-descendant caching: no measured speed penalty justifies a separate cache
allocation, cleanup, and interrupted-run recovery mechanism. It does not
establish a suite-wide speedup or attribute all historical 134 GB to this suite.

**Value / learning:** Avoid a machine-wide interruption and wasted long proof;
learn which repeated fixture launches own the observed growth.

**Effort hypothesis:** One cohesive configuration change with regression proof;
the remaining cost is proving inheritance, concurrency, interruption, and broad
suite compatibility. The preparation observations settle the approach, not the
story's final acceptance.

**Depends on:** None; no blocking story prerequisite.

**Safe stopping point:** The suite manages only its own cache impact and leaves
other sessions running, even if proof-selection visibility remains unchanged.

<a id="retain-strict-proof-selection"></a>

### 2. Read a dashboard proof selection without rerunning it or weakening its verdict

**Identity:** SEED-131#retain-strict-proof-selection
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** A contributor can report which dashboard tests a focused run
selected and how they finished without repeating a passing suite or replacing
the reporter that enforces the project's output policy.

**Evidence:** [DD-216 and DD-243](../../ProjectFindings.md#dd-216) record the
same cost in five executions. The configured quiet reporter intentionally
prints nothing on success and removes passing-run output. Some later agents
used a separate listing, reducing the cost but still requiring another command.
DearDough's DD-262 is the separate general lesson about accepting a weaker
reporter's verdict, not an additional occurrence for this story.

**Outcome / scope:** Provide inspectable selection and result evidence for the
actual dashboard proof run through repository test tooling. Preserve quiet
console success, failure on unexpected output, normal assertions, and the
original exit status. Keep concurrent runs' evidence attributable to their own
selection. No change to published delegation or proof-acceptance instructions.

**Evaluation:** Run a focused selection once with the configured strict
reporter. Its evidence identifies the selected tests/count and actual outcome
without a second execution or a reporter override. Show that a test which
passes assertions but writes unexpected output still fails, and that selection
evidence is not confused with completed proof if a run fails or is interrupted.
At completion, update DD-216/DD-243 with observed evidence and any remaining
cost; do not mark them resolved just because a mechanism was added.

**Alternatives / refinement:** Compare an opt-in record from the same run with
the existing separate `--list` workaround. Choose a bounded retention and
discovery approach consistent with the repository's silent-pass contract;
do not require permanent accumulation of passing-run directories.

**Value / learning:** Eliminate repeated counting work across contributors
without losing the strict proof policy.

**Effort hypothesis:** S, medium confidence; reporting already sees the run,
but evidence retention/discovery and interrupted runs need refinement.

**Depends on:** None; it can proceed independently of the cache story.

**Safe stopping point:** One focused run supplies trustworthy selection evidence
without changing suite behavior or waiting for other test-tool improvements.

## Ordering and Scope Reduction

Terry authorized selecting and queueing up to two project-specific responses
at the top of the backlog. Cache ownership ranks first because the confirmed
full disk affects other work, despite only one recorded execution. Selection
visibility ranks second because it recurs in five executions but usually costs
seconds to minutes. The existing native-observation story stays queued after
these two, and the Taken work stays in place.

These are independent stories; each section records its own preparation and
approach. Neither queue selection nor preparation authorizes implementation.
Other retained findings remain unqueued; related suite symptoms do not
establish a shared cause.

## Breadcrumbs

- [Project findings and priority assessment](../../ProjectFindings.md#priority-assessment).
- [Dashboard tests guide](../../dashboard/tests/README.md).
- [Dashboard reporter contract](../../dashboard/tests/support/quietReporter.ts).
- Terry's 2026-10-12 request to separate project findings, remove confirmed
  repairs, and queue the one or two highest-priority project-only responses.
