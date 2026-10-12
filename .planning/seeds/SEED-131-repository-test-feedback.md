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
A silent successful run leaves contributors listing or rerunning tests to learn
what they selected. This cost belongs to this repository's test tooling.

The selected responses address [ProjectFindings.md](../../ProjectFindings.md),
not the published skills or their workflow guidance. They do not change the
dashboard's behavior for its users, the public runtime's caching or CI policy,
or the required meaning of a passing test. The findings' original occurrences
remain in that file and its linked Git history.

## Stories

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

Selection visibility remains selected and queued because it recurs across
executions while usually costing seconds to minutes. Its current order is owned
by the product backlog. The cache policy and its measured effectiveness are
maintained in the dashboard tests guide and ProjectFindings.md.

Queue selection and preparation do not authorize implementation. Other retained
findings remain unqueued; related suite symptoms do not establish a shared cause.

## Breadcrumbs

- [Project findings and priority assessment](../../ProjectFindings.md#priority-assessment).
- [Dashboard tests guide](../../dashboard/tests/README.md).
- [Dashboard reporter contract](../../dashboard/tests/support/quietReporter.ts).
- Terry's 2026-10-12 request to separate project findings, remove confirmed
  repairs, and queue the one or two highest-priority project-only responses.
