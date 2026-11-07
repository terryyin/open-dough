---
id: SEED-257
status: active
planted: 2026-11-07
scope: story
---

# Story CI comparison for custom CI projects

<a id="compare-story-ci-through-adapters"></a>

### Compare story CI builds from custom adapters in Intent

**Identity:** SEED-257#compare-story-ci-through-adapters

**Beneficiary:** A developer reviewing a Taken or Done story in a project
with custom CI.

**Goal:** Intent shows Baseline, Branch and Landed CI builds for a story in a
`ciAdapter` project, with their recorded wall times and comparable CI proof.

**Scope:** Apply the existing story endpoint and Git ancestry rules to
adapter attempts. Use the configured check and the attempt's full revision
and opaque identity to link each build to the existing
[adapter proof read](../../src/skills/dough-execute-plan/manuals/custom-ci-proof.md).
Assess whether retained `discover` results cover those revisions before
defining a separate historical lookup. Keep the source build visible and
explain missing or ambiguous evidence. Preserve GitHub Actions comparisons.
This story covers provider support; the timing measure without runner waits,
skipped-build proof and comparison presentation have their own stories.

**Acceptance:** A Taken Pygardon story with retained builds shows its
baseline and provisional result. A Done story shows its landed build where
available. With recorded timestamps, Intent shows elapsed wall times; with
retained summaries, it compares counts and any reported test durations from
the named attempts. A missing or expired attempt or summary leaves a named
gap. Pygardon's `SEED-20261079#show-ci-attempt-wall-time` supplies timestamps
for the live wall-time example; existing counts-only summaries can prove the
comparison's proof read.

Follow [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for deriving the dashboard view from observed evidence.
