---
id: SEED-151
status: active
planted: 2026-10-25
planted_during: Combined feedback maintenance across maintained projects
trigger_when: Test-file changes consume CI share headroom despite sound product code
scope: small
---

# SEED-151: Keep test shares reliable as the suite changes

## Why This Matters

Open Dough contributors need a useful CI verdict without unrelated budget repairs.
[DD-279](../../docs/maintainer/project-test-findings.md#dd-279) records dashboard
deadlines in plan 292 and a Node share-budget failure in plan 350. Refreshing
`longest-first` repaired those runs, but adding or renaming files can reshuffle
the unmeasured remainder and exhaust the margin again. A refreshed list alone
has already proved temporary.

## Stories

<a id="balance-test-shares"></a>

### 1. Keep test-file changes from unexpectedly exhausting CI share budgets

**Identity:** SEED-151#balance-test-shares

**Beneficiary and outcome:** A contributor adding or renaming a test receives a
balanced, attributable CI allocation instead of a sound change failing because
stale duration ordering silently moved unrelated work onto a near-full share.

**Scope:** Inspect the repository's existing Node and dashboard share allocation
and duration evidence, then improve the allocation or refresh boundary needed to
address DD-279. Reuse the existing budget policy; preserve behavioral coverage,
strict failure verdicts, and the documented total ceilings. No published skill
change or generic CI service is part of this story.

**Key examples and evaluation:** Reconstruct plan 350's retained before/after
allocation with the same duration inputs; compare a normal test addition and a
rename with the unchanged baseline; report predicted per-share totals, missing
duration coverage and margin. Prove the selected change distinguishes the
recorded failure mechanism without relaxing the ceiling or omitting tests.
Validate the corresponding dashboard allocation only where the selected
mechanism affects it. Do not claim stable hosted timing from predicted totals.

**Completion:** Record the actual adopted response, revision, measured allocation
and remaining hosted-use observation criterion at
[DD-279](../../docs/maintainer/project-test-findings.md#dd-279) and update its
[project index](../../ProjectFindings.md#dd-279). Queued, not resolved; no plan or
implementation is authorized by this maintenance.
