---
name: dough-test-optimization
description: >-
  Profiles and optimizes test performance across related behaviors, fixtures,
  and test boundaries, then measures the result. Use to speed up slow tests,
  reduce redundant tests, optimize a test suite, or investigate its slowest
  tests. Seeks faster execution, fewer cases, less code, and cleaner design
  together while preserving behavioral coverage and confidence. With
  --resolve, triages recorded candidates without profiling or optimizing.
---

# Optimize test performance

Aim for a substantially faster, smaller, clearer suite with equal or stronger
behavioral protection. Treat speed, fewer cases, less test and support code,
determinism, and cleaner design as mutually supporting design goals. Explore
how to achieve them together; do not assume a necessary trade-off or accept a
cosmetic change as the goal. Measure the result rather than promise a reduction
quota or weaken proof to meet one.

## Establish context and mode

Use the project established by the task. Resolve from its guidance and tooling:

- the requested scope, test locations and actual behavioral boundaries;
- profile and verification commands, runtime wrapper, reporters, service setup,
  and applicable test-style and architectural decisions;
- the existing plan location and execution workflow before writing a plan;
- any candidate record and approved profile-only exclusions, when present.

Do not assume a particular stack, test taxonomy, directory layout, or exclusion
tag. Reuse established context. If a required command, scope, or execution input
cannot be resolved, name the gap and stop its dependent step without inventing
project conventions. An absent candidate record or exclusion mechanism does
not block profiling.

Default mode profiles, plans, executes optimization, and re-profiles. A request
only to profile or assess ends with findings before implementation. For
`--resolve`, read [candidate resolution](references/resolving-candidates.md)
and perform only that workflow.

Before assessing or changing tests, read the shared
[behavioral test guidance](../dough-post-change-refactor/references/refactor-checks.md#tests-as-behavioral-documentation).
Use its test style and proof rules within this optimization's authorized scope;
the post-change skill's diff-only entry condition does not restrict this pass.

## Profile the selected scope

Run the complete selected scope once to obtain a baseline. Capture revision,
literal command, runner mode, environment, workers, filters, cache/startup
conditions, wall time, executed case count, and per-test or per-file durations.
Inspect expensive setup, teardown, process startup, and shared fixtures when
test-body durations do not explain the cost. Count parameterized executions,
not just test declarations. Keep raw profiles local and out of commits.

Apply only established exclusions and record them. Candidate proposals remain
eligible until resolved; never silently filter them out. Profile-only exclusions
must leave normal verification and CI coverage intact.

If instrumentation requires a different runner mode, record that limitation and
also capture an ordinary verification-mode baseline before claiming that mode
became faster. A failed or incomplete run is diagnostic evidence, not an accepted
green baseline. Resolve it before comparisons that depend on it.

Rank individual slow tests; the slowest 10% can seed investigation. Also rank
aggregate cost by related behavior and shared setup so many modest tests with a
large combined cost are visible. Do not use the percentile as an edit boundary.

## Form complete optimization groups

For each promising hotspot, trace all tests of the same behavior or rule and
the setup, fixtures, helpers, and lower-level code responsible for its cost.
Search across files, packages, and test layers within the selected scope,
including fast siblings outside the slowest set. Inspect relevant proof beyond
that scope when needed to establish overlap; expand edits only with authority.

Group by a coherent behavioral responsibility or evidenced shared cost, not by
file, adjacent timing ranks, fixed batch size, or the smallest number of groups.
A common runner alone is not a useful grouping reason. For a shared harness
cost, inspect its consumers without merging their unrelated behavior scenarios.

For each group, record its common cause, included tests and support code,
aggregate cost, important behavior variants and integration obligations, and
where surviving proof belongs. Merge groups addressing the same responsibility.
When distinct families share a helper or setup cost, assign that change once
and record its consumers and dependencies; shared files alone do not merge
their behavior scenarios or justify double-counting the saving.
Keep the complete related family in view even when execution needs smaller
slices. Split execution by a safe conceptual change with explicit dependencies;
give each slice the family analysis and proof map, not only its local test list.

## Choose the optimization design

Read [optimization tactics](references/optimization-tactics.md). First challenge
redundant scenarios and repeated setup across the whole group. Compare materially
different designs, including consolidating proof and moving detailed variations
to a cheaper stable boundary. Continue beyond the first applicable micro-fix
when a larger opportunity remains. Keep this comparison brief and evidence-led.

## Record the optimization plan

Write or update one plan in this project's established location. Record the
request and evidence provenance, beneficiary and bounded outcome, current
findings, scope, preserved promises and constraints, group rationale, chosen
design, proof mapping, and execution slices. This is the authoritative input
for the bounded optimization correction; do not fabricate a retrospective or
a feature seed. Use the shared
[executable plan format](../dough-story-refinement/references/planning.md#write-an-executable-plan).

Each slice names its conceptual change, affected boundaries, surviving proof
for removed or narrowed cases, focused verification, and expected saving. Include
baseline evidence and a final comparable re-profile. In resolve-only mode, reuse
recorded evidence; if a fresh baseline is needed, make it a prerequisite slice
for later execution, without running it now. Capture test/support-code size
before editing so moving code into helpers cannot masquerade as reducing it.

## Execute the plan

Execute through [dough-execute-plan](../dough-execute-plan/SKILL.md), preserving
its independent implementation/refactor ownership, delivery, and review
contract. Pass the whole group analysis to each implementation agent and return
for coordinator-owned delivery. A broad analysis is not a demand for one huge
slice. Keep shared fixtures and overlapping edits sequential; update the same
plan when discoveries change remaining work.

Preserve product behavior and applicable decisions. If an optimization requires
a product, architectural, or confidence trade-off, cite the specific conflict
and stop that change for human resolution. Do not disguise it as test cleanup.

## Verify and measure

Establish replacement proof before deleting or narrowing its predecessor. Run
focused verification in the project's ordinary test mode for the changed family;
widen to affected consumers when shared setup or production seams changed.
Reserve complete-scope profiling for baseline and final measurement, unless a
shared change requires broader verification earlier.

Flaky is failure: fix the cause rather than add retries, fixed waits, or skips.
For changed asynchronous or E2E synchronization, require three consecutive
passing focused runs, or stronger project-required stability evidence. Repetition
alone does not explain or fix a race. Avoid routine repeated runs of unaffected
proof. Commit no focus/only markers or raw timing dumps.

After all optimization slices, re-run the baseline profile command with the
same conditions and approved exclusions. Report:

- selected-scope wall time and executed case count before/after;
- cost of the same behavioral families, including replacement tests, plus the
  newly slowest tests; independently changing top-10% lists are not a fixed cohort;
- test and supporting fixture/helper code size before/after, and the concrete
  design simplification or remaining duplication;
- retained behavioral and integration proof, verification results, and any gaps.

Label summed test durations as such; they are neither suite wall time nor CPU
time. Report CPU only when measured. If an apparent improvement is within run
noise, repeat matched measurements enough to resolve it or report it as
inconclusive. Do not attribute speedup to fewer workers, different filters,
retries, or changed environments without a controlled comparison.

For a failed final run, record the failure and any valid focused evidence;
neither per-file timings nor green CI substitute for a comparable suite speedup.
Leave the measurement step incomplete until its required evidence is available.

## Close or retain a candidate

Only after serious attempts across the complete family, record a hard-to-improve
candidate with test locations, duration, unique protection, alternatives tried,
evidence, date, and any needed decision. Reuse the project's candidate record;
if none exists, retain it in the active plan. Do not create a parallel blacklist.
Do not force a weak change or treat a proposal as an approved exclusion.

Retain the plan and concise measurement/proof evidence for retrospective and
[story wrap-up](../dough-story-wrap-up/SKILL.md). Do not delete review inputs at
execution completion. A cleanup-only request follows that lifecycle and leaves
unresolved candidates and unrelated work intact.
Candidates held only in the plan are still live input: retain them there until
resolved or transferred to the project's established follow-up location before
that plan is deleted.

Report scope, before/after metrics, optimized families, actual delivered commits,
remaining candidates, and limitations. Emit `## TEST OPTIMIZATION COMPLETE` only
when planned work and required verification, measurement, and delivery are
complete. For incomplete work, report the remaining step or decision without
claiming completion or an unmeasured gain.
