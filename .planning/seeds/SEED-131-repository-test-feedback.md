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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/305-retain-strict-proof-selection/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2a46c99c88da6eccff9a906d1b162f5bb718c32d7edba57986516694153a6887","plan":"467116c3a7d169ca75926baabbb4ed4d4583e76d2df1d3f22bb86987fbb69c10"}}
```

**Goal:** A contributor can report the tests selected by one focused dashboard
proof run, their count, and their actual outcomes from retained evidence of that
same run, without executing the selection again or replacing the strict reporter.

**Evidence:** [DD-216/DD-243](../../ProjectFindings.md#dd-216) records this cost
in five executions. Successful strict runs intentionally print no summary and
remove their output directory. A separate listing can explain selection but
cannot establish what the original run executed or how its strict verdict ended.
DearDough's DD-262 remains a separate general proof-acceptance lesson.

**Scope:** Offer an opt-in, inspectable record at a path the contributor supplies
before running the normal dashboard test command. Record the actual selected
tests and count, identifiable by project, file/location and title; distinguish
selection from observed test results, and distinguish assertion results from the
strict run verdict. Include enough run context to attribute the record to its
checkout, invocation and run. Keep retries/repeated tests and skips from being
misreported as additional selected tests or successful executed assertions.

Preserve quiet successful console output, normal assertions, failure on unexpected
test or run output, existing failure diagnostics, output-directory cleanup, and
the command's strict exit status. Opting out retains today's behavior. Completed
successful evidence survives passing-run output cleanup. A failed, timed-out,
interrupted, listing-only, or incompletely recorded run never masquerades as
completed passing proof. A process killed before selection may leave no evidence;
after selection is retained, lack of a completed verdict remains explicit.

**Retention and discovery:** The requested path is the discovery mechanism: one
compact record for one invocation, outside its disposable test-results directory,
without automatically retaining traces or successful output directories. The
caller owns retention and deletion. Separate invocations use separate paths;
refuse to replace an existing record so a mistaken shared path cannot silently
mix or erase evidence. Recording errors are explicit and make the requested
record unavailable/incomplete; they do not replace the underlying strict test
exit status with a new verdict. No automatic history, latest-run pointer, or
cross-worktree cleanup is needed.

**Constraints and deferred promises:** Strict output policy and evidence
attribution are requirements of the selected story, so a weaker reporter or a
shared overwrite-prone record is insufficient. Do not change published skills,
delegation or proof-acceptance guidance, runtime/CI policy, dashboard UI, or the
sibling compile-cache work. No permanent proof archive, trace retention on pass,
postmortem reconstruction after an uncatchable kill, or shell/Node-suite reporting
is promised. At completion, update DD-216/DD-243 with actual acceptance evidence
and remaining cost; adding a mechanism alone does not resolve the finding.

**Key examples:**

1. A contributor chooses an unused record path and a focused test filter → runs
   the ordinary strict command once → it succeeds silently, removes its normal
   passing output, and leaves a readable record naming the selected tests/count,
   their observed outcomes and completed strict success. Reading it runs no tests.
2. A selected test passes assertions but writes unexpected output, or setup writes
   output outside a test → the strict command fails as today → the record shows
   the observed assertion result separately from the failed strict verdict.
3. A run selects several tests and fails, times out, or is interrupted partway →
   inspect the retained record → selection and completed attempts remain distinct
   from uncompleted work; there is no completed passing proof. A forced kill may
   leave a running snapshot, never a fabricated terminal result.
4. Two focused runs overlap, with distinct record paths → each record identifies
   only its own selection/results. A second run requests an existing path → it
   reports that recording is unavailable without overwriting that file or changing
   its own strict test verdict.
5. A listing or a selection containing skipped/repeated tests is requested →
   inspect its record → selected tests, attempts and skips remain distinguishable;
   listing success alone does not mean execution passed.
6. No record is requested → ordinary strict success/failure and retained failure
   diagnostics behave as before. An unwritable destination when recording is
   requested produces an explicit recording diagnostic, not apparent valid proof.

**Alternatives and decision:** Use an opt-in compact record owned by the existing
strict reporter. Doing nothing retains the repeated work. A separate `--list`
command needs another command and observes another selection, not this run's
outcomes; preparation also observed the quiet reporter's listing ending with a
passed runner status and no test attempts. A second standard reporter can record
raw assertion success while the strict reporter rejects output. Keeping every
passing output directory would add automatic accumulation and artifact cleanup.
The caller-selected file provides bounded, directly discoverable evidence while
preserving the existing verdict owner.

**Value / learning:** Remove repeated counting work while keeping trustworthy
proof; verify that retained evidence reflects the strict verdict, not only
Playwright's assertion status.

**Effort hypothesis:** S, medium confidence; one cohesive reporter/configuration
change with subprocess regression proof. Storage errors, interruption and nested
test runners belong to this same lifecycle, not separate reporting systems.

**Depends on:** None; no blocking story prerequisite.

**Safe stopping point:** One focused run supplies trustworthy evidence without
changing suite behavior or waiting for other test-tool improvements.

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
