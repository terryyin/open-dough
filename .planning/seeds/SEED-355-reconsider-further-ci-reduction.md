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
- Start from the report-isolation fix and the adopted 17-job layout. Use retained
  CI proof and timings before paying for new measurements or local profiling.
- Keep meaningful behavioral coverage, complete CI proof and useful verdict time.
  Establish a proportionate decision and stopping rule before new experiments.
- Consider all groups, placement and packing where useful; no unmeasured count
  is a proven floor. Record what the evidence actually supports.
- Decide how future job additions are justified under the reconsidered approach.

#### Evidence and limits

[Retained measurements](../../docs/maintainer/ci-layout-measurements.md) preserve
all six original runs. Background load and a repaired HTML-report collision made
the screen inconclusive. The developer chose the reasonable first reduction;
no minimum or no-slower overlap claim was established.

#### Origin and priority

Explicit developer transfer from SEED-350's early closure; second queued story,
after configuration/data-only test cleanup. Ordering is not a technical dependency.
