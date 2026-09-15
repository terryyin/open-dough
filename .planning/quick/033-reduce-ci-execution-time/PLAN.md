# Reduce Open Dough's CI execution time to less than half

## Source and authority

[SEED-004 Story 21](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-test-optimization-and-plan-open-dough).
Status: planned; profiling and optimization have not started.

The maintainer requested this slice plan on 2026-09-15, with profiling deferred
to execution and the installed `dough-test-optimization` skill updating this
same plan from its findings. This request authorizes planning only.
Keep the story queued until execution is authorized and starts.

## Goal and boundaries

Give Open Dough developers trustworthy CI feedback in strictly less than 50%
of the current execution time, preserving behavioral protection and confidence.
Use the installed optimization skill on this project's tests and collect real-use
feedback for an explicitly included process retrospective.

Extraction and installation are complete. Include profiling, measured test
optimization, ordinary local re-profiling, and CI acceptance measurement during
execution. Exclude implementation of feedback-driven skill changes, unrelated
CI infrastructure work, and other projects. Preserve the story's full examples
and constraints; a 10-minute baseline requires less than 5 minutes afterward.
A local speedup with CI still at 60% of baseline leaves the goal unmet.

## Existing solution and architectural context

PFE decision: reuse `npm test` → `scripts/test.sh`, which runs the shell tests
outside `tests/support/` and the self-installation check. Reuse the `CI` workflow
in `.github/workflows/ci.yml`: parallel `lint` and `test` jobs on Ubuntu 24.04,
Node 24, with dependency/setup costs included. `npm run lint` is the existing
lint entry point. Test documentation is `tests/README.md`; shared support lives
in `tests/support/`. No timing evidence yet supports changing the runner,
fixtures, or concurrency, and no new benchmark framework is planned.

[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports inexpensive feedback, evidence-led adaptation, and coherent reuse.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires deterministic CI protection, shared behavior checked once with
adapter-specific differences, and honest separation from native acceptance.
Removing redundant tests must preserve these responsibilities. Installed managed
skills remain unchanged; no new North Star topic or architectural decision is
needed by the current plan. Reassess only when profiling suggests a consequential
change to the established solution.

## Execution entry and measurement decision

Before taking the story, use `dough-execute-plan` to resolve execution checkout,
branch, hook/formatting contract, and delivery destination. Retain execution
identity here when established. Use its ordinary implementation, independent
refactoring, delivery, CI observation, and retrospective workflow.

One human-owned metric remains open: elapsed time from CI execution starting to
all required checks completing, excluding queue time (recommended), versus total
runner time across jobs. Resolve it before choosing the CI baseline. This stops
only metric-dependent measurement; local profiling may proceed independently.
Neither silence nor this plan records agreement to the proposed metric.

During execution, select the baseline revision before optimization. For local
measurement use `/usr/bin/time -p npm test` in the ordinary runner mode after
project runtime setup. Record revision, literal command, runtime, filters,
workers, cache conditions, wall time, executed case count and the counting method.
The shell runner has no standard case-count output; distinguish script counts
from behavioral cases rather than equating them. Obtain focused setup/test
profiles only as needed to choose an experiment; keep raw profiles out of Git.

For CI, reuse sufficient successful baseline runs with matching revision and
conditions, or obtain them before changing the measured code. Record run URLs,
commit, workflow/event, job start/end times, setup/cache conditions, and the
agreed metric. Compare successful baseline and final runs under comparable
conditions. Choose and record a repeat/aggregation procedure before accepting
results, using additional observations when variance could change the verdict.
Do not cherry-pick a favorable pair. Record the same procedure for both sides;
failed or incomplete runs are diagnostics, not acceptance evidence.

## Ordered slices

### 1. A developer can identify the measured cost worth removing

Type: Behavior
Status: planned

Behavior: Given the unchanged test suite and available CI baseline access,
running the installed optimization skill's profiling workflow produces a
successful, comparable baseline and an evidenced first optimization hypothesis
for this project's feedback path.

Proof: The developer can inspect local wall time and available test/setup costs,
CI baseline under the agreed metric, and the behavioral family whose removable
cost plausibly contributes to the target. Name the revision, commands, results,
and evidence locations in this plan. No speedup is claimed in this slice.

Invoke the skill with this exact active plan as its destination. Carry out its
context, baseline, and family investigation steps during execution. Then update
this file's remaining slices; do not create a nested optimization plan or start
another execution lifecycle. Preserve baseline evidence and completed work.

Safe stopping point: a usable baseline and a justified next experiment, with
product behavior unchanged. Missing CI access leaves CI baseline proof pending;
it does not invalidate a successful local profile.

Sizing: one baseline/diagnostic proof loop; elapsed cost is currently unknown.
No numeric slice budget was supplied. Profile only far enough to choose a useful
experiment and its proof; split independently useful follow-on investigation if
it becomes necessary rather than conducting an exhaustive audit.

### 2. Developers receive equivalent CI protection in less than half the time

Type: Behavior
Status: planned; provisional until Slice 1 supplies profiling evidence

Behavior: Given the measured baseline, executing supported optimization
experiments preserves the selected checks' behavioral protection and produces
CI time below 0.5 times baseline, with improved ordinary local test wall time.

Proof: Retained/replacement behavioral assertions pass; comparable whole-scope
local timing improves; comparable successful CI measurements meet the strict
ratio. Include replacement tests' cost and lint/setup time in the appropriate
scope. Failed re-profiling or a ratio of 0.5 or higher leaves this outcome unmet.

Before implementing this slice, replace this provisional section in this same
file with the smallest evidence-backed Behavior/Structure slices. Each Behavior
must own one measured improvement and one focused proof loop. For each experiment
record the family and consumers, expected saving, smallest meaningful change,
surviving proof before removing cases, literal focused verification/timing
command, and safe stopping point. Add Structure only immediately before the
Behavior it enables. Keep final whole-scope timing proof mapped to the last
outcome slice after subdivision. No implementation is authorized by this
placeholder alone.

Each experiment follows hypothesize → try and measure → retain/revise/undo →
reassess. Update the same plan from results. Keep supported improvements;
revert only that experiment's unsupported changes. Reassess the remaining
removable cost against the target instead of continuing ineffective micro-fixes.
Use slice-plan refinement in place when an evidenced slice has multiple proof
loops, uncertain boundaries, or low sizing confidence. A further refinement pass
before profiling cannot identify or size the still-unknown experiments.

Preserve confidence: establish replacement proof first; fix flakiness at its
cause; use no skips, focus markers, weaker assertions, or retry masking to claim
success. For changed async/E2E synchronization, follow the skill's three focused
consecutive passes or stronger applicable evidence. Required cross-tool
protection stays mapped under ADR 0005.

Safe stopping point: retain delivered, verified improvements even if the goal
remains unmet; leave remaining work and measurement gaps explicit. If credible
in-scope savings cannot reach the target, surface the measured limit and the
needed scope/constraint decision. Do not lower the goal or declare completion.

Sizing: unknown until profiling. This section expresses the required outcome,
not a claim that all optimization fits one implementation slice.

## Proof ownership and lifecycle

| Promise | Owner and observable evidence |
| --- | --- |
| Comparable successful baseline | Slice 1: revision/conditions, local timing, CI run evidence and agreed metric |
| Preserve behavioral confidence | Each concrete experiment replacing Slice 2: inspected setup/assertions and surviving proof |
| Improve ordinary local wall time | Final outcome slice replacing Slice 2: comparable full `npm test` re-profile |
| CI time strictly below half | Final outcome slice replacing Slice 2: CI evidence and ratio under the preselected procedure |
| Learn from real use of the skill | Normal execution retrospective with process review explicitly included |

Preserve these mappings when revising slices. Run focused verification for each
change and widen to affected consumers for shared helpers. Use normal execution
refactor/format/commit/push gates; verify the actual hook contract before delivery.
Do not wait for CI after each routine push. Observe CI through the existing
workflow; the final timing claim remains pending until its CI evidence exists.

At retrospective, explicitly assess how the optimization skill helped or hindered
family selection, proof preservation, experiment quality, target reassessment,
local-versus-CI measurement, and updating this plan without nested planning or
execution. Retain actual decisions, rejected experiments, outcomes, and material
friction as review inputs. Record supported findings through the existing
`DearDough.md` workflow, or report no actionable finding. Skill changes remain
follow-up work. If execution stops short of completion, preserve these inputs
for a later requested review rather than inventing a completed retrospective.

Keep plan/evidence for normal retrospective and story wrap-up. Transfer or resolve
remaining optimization candidates through the established follow-up workflow
before cleanup. No separate profiling plan, feedback tracker, or evidence archive.

## Current decisions and learnings

- One active plan; profiling occurs only during authorized execution.
- CI timing metric remains open; no baseline or speedup has been measured.
- Experiments and their sizing await evidence from Slice 1.
- Process review of the optimization skill is explicitly requested.
