---
id: SEED-028
status: active
planted: 2026-09-24
planted_during: Product backlog capture requested by the maintainer
trigger_when: Ad hoc work starts or completes outside the product backlog
scope: unknown
---

# SEED-028: Make ad hoc work visible in the product backlog

## Why This Matters

For developers coordinating Open Dough work, tasks such as bug fixing, test
automation, and test optimization can happen without appearing in the product
backlog. A developer reading the queue then cannot see that work alongside
planned stories, its priority, or whether it is underway or complete.

## Story Decomposition

<a id="track-ad-hoc-work"></a>

### 1. Track ad hoc work in the product backlog

**Identity:** SEED-028#track-ad-hoc-work
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Status:** Captured and queued on 2026-09-24; not refined or planned.

- **For / why:** A developer reviewing the product backlog can see ad hoc
  product work alongside planned stories and understand its place in the queue
  and its progress.
- **Evaluation:** A bug fix, test automation task, or test optimization task
  that would otherwise bypass the backlog receives one canonical work item and
  appears in the backlog with a stable identity. Its entry can move through the
  existing queued, Taken, and completion flow without a duplicate entry. An
  urgent task can still start promptly; recording it does not require
  manufacturing a feature story or delaying a necessary fix.
- **Value / learning:** Gives the team one view of active and upcoming product
  work and reveals how often unplanned work displaces the intended queue.
- **Effort hypothesis:** Unestimated; refine the recording boundary and
  workflow before sizing.
- **Depends on:** Existing backlog identity and lifecycle behavior. No new
  product prerequisite is established during capture.
- **Safe stopping point:** Ad hoc work has a canonical reference in the product
  backlog without duplicating already queued work or changing the priority of
  unrelated entries.

## Open Decisions for Refinement

- Which ad hoc activities merit a backlog entry, and when should a short task
  be recorded relative to starting urgent work?
- What canonical home and identity should a task use when it has no seed or
  executable plan, while preserving the existing treatment of larger bugs and
  planned test optimization work?
- How should completion and later review remain visible after an entry leaves
  the active backlog?

## Ordering and When to Surface

Queue this story at priority 4 as requested. It follows the first three
published-progress and default-checkout coordination stories. Refine it before
implementation; capture does not change current task workflows.

## Breadcrumbs

- Maintainer request on 2026-09-24 to track ad hoc tasks absent from the
  product backlog, including bug fixing, test automation, and test optimization.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Existing test optimization continuation](SEED-004-extract-and-adopt-project-guidance.md#continue-test-optimization-plans).
