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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** A contributor running dashboard tests can finish repeated or
concurrent proof without the suite leaving an ever-growing Node compile cache
on the shared machine.

**Evidence:** [DD-287](../../ProjectFindings.md#dd-287) records one full disk,
a lost 15-minute run, and 134 GB in the shared cache. A later measured run added
about 1 GiB; the source of the entire accumulation is unknown. The locked Vite
and Rolldown launchers enable Node's compile cache, while repository test launch
and fixture setup currently supply no cache lifecycle policy.

**Outcome / scope:** Establish which dashboard-test processes write compile
cache entries, then give the suite's own entries a bounded lifecycle. Choose the
smallest repository test configuration or fixture change supported by that
measurement. Preserve another session's files and any cache outside the suite's
ownership. Do not implement an indiscriminate age-based cleanup of the developer's
shared temporary directory, change installed skills, or widen this into general
machine maintenance.

**Evaluation:** Repeated runs with fresh fixture paths do not accumulate the
suite's cache indefinitely. Two concurrent runs remain independent, and a failed
or interrupted run has an explicit recovery/cleanup outcome. Demonstrate that
unrelated cache entries remain untouched and compare proof time and disk use
with the current launch. At completion, update DD-287 with the observed result
and limitations; implementation alone does not establish effectiveness.

**Alternatives / refinement:** Compare scoped cache storage and cleanup with
disabling caching only for the test subprocesses that cause growth. Measure the
speed tradeoff before selecting the approach. Existing data does not justify
claiming that every cache byte came from this suite or promising a universal
disk quota.

**Value / learning:** Avoid a machine-wide interruption and wasted long proof;
learn which repeated fixture launches own the observed growth.

**Effort hypothesis:** M, low confidence until cache-producing processes and
cleanup ownership are measured.

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

These are independent stories awaiting refinement and approach selection,
not an executable plan or authorization to implement either fix. Other retained
findings remain unqueued; related suite symptoms do not establish a shared cause.

## Breadcrumbs

- [Project findings and priority assessment](../../ProjectFindings.md#priority-assessment).
- [Dashboard tests guide](../../dashboard/tests/README.md).
- [Dashboard reporter contract](../../dashboard/tests/support/quietReporter.ts).
- Terry's 2026-10-12 request to separate project findings, remove confirmed
  repairs, and queue the one or two highest-priority project-only responses.
