---
id: SEED-304
status: active
planted: 2026-11-11
scope: story
---

# SEED-304 — One CI proof row per location

<a id="show-one-ci-proof-row-per-location"></a>

### Show one CI proof row per location

**Identity:** SEED-304#show-one-ci-proof-row-per-location

#### Goal

A developer reading Intent's CI status can see the full result for a test
location without scanning repeated paths. Show each location once in the Proof
table, with each result type's own labeled counts and execution time in that row.

#### Scope

Use the existing CI proof summary. Keep counts, measured times, and genuine
reporting or timing gaps attributable to their result type. Show the totals
across shards for each result type. A dashboard deployment delivers the change
for already published summaries.

#### Key examples

- Doughnut's two Vitest shards appear as one `frontend/tests` row with 2,542
  passing test cases and zero file-level failures. If a file fails before any
  cases run, its failure is visible in that same row.
- Doughnut's `scripts` row shows 450 passing Node test cases and 22 passing Bash
  test files, with separately labeled execution times. Empty Node file reports
  do not count as timing gaps.

Observed in [Doughnut CI run 42828209530](https://github.com/nerds-odd-e/doughnut/actions/runs/42828209530).
