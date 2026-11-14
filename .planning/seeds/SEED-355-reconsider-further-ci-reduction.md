---
id: SEED-355
status: active
planted: 2026-11-14
trigger_when: selected from the product backlog
scope: story
---

# SEED-355 — Reconsider further CI job reduction with a different approach

<a id="reconsider-further-ci-reduction"></a>

### Reconsider further CI job reduction with a different approach

**Identity:** SEED-355#reconsider-further-ci-reduction

#### Goal

A developer receives CI's useful verdict while further reducing runner demand
beyond the practical 17-job baseline, using a simpler, reconsidered approach.

#### Scope

- Continue the remaining job-reduction goal from SEED-350 after its bounded early close.
- Reconsider the approach during refinement. Do not resume the large campaign,
  assume an exhaustive search, or treat configuration-only assertions as constraints.
- Start from the report-isolation fix and the current layout in
  [shards](../../dashboard/tests/shards.md). Decide
  sharding from what CI already reports for recent `main` runs: the CI proof
  summary and times artifacts for per-test and per-file durations, and the
  GitHub jobs API for each job's queue, setup and completion times. Read them
  when deciding; they are fresher than any copy. Pay for new measurements or
  local profiling only when that report cannot answer the question.
- Raw CI data stays in CI. Record only the resulting decision and its short
  rationale beside the layout it changes (`.github/workflows/ci.yml`,
  [shards](../../dashboard/tests/shards.md),
  [time budget](../../Distribution/tests/time-budget)), naming the runs read.
- Keep meaningful behavioral coverage, complete CI proof and useful verdict time.
  Establish a proportionate decision and stopping rule before new experiments.
- Consider all groups, placement and packing where useful; no unmeasured count
  is a proven floor. Record what the evidence actually supports.
- Decide how future job additions are justified under the reconsidered approach.

#### Evidence and limits

SEED-350's six-run screen (16/17 jobs against 21/22) was inconclusive:
background load and a since-repaired HTML-report collision confounded it. The
developer chose the reasonable first reduction; no minimum or no-slower overlap
claim was established.

The later owned CI repair increased the current layout to 18 jobs after two
integrated-browser deadline failures. The retained 17-job baseline remains the
reduction reference; use the current layout and its documented evidence when
refining this story, rather than restoring a deadline-failing allocation.

#### Origin and priority

Explicit developer transfer from SEED-350's early closure; second queued story,
after configuration/data-only test cleanup. Ordering is not a technical dependency.
