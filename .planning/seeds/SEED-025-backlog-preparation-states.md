---
id: SEED-025
status: active
planted: 2026-09-23
planted_during: Longer-term product backlog capture requested by the maintainer
trigger_when: Extending backlog visibility to preparation before execution
scope: unknown
---

# SEED-025: Make story preparation visible in the product backlog

## Why This Matters

For Terry and developers coordinating Open Dough stories, the product backlog's
Backlog list and Taken distinction does not show whether queued work is waiting,
being refined, or already properly refined and planned. Refinement may be under
way in a worktree or another workspace while the story still looks untouched
in the shared backlog.

Existing canonical story records already carry refinement, planning, and
readiness facts. The longer-term goal is to make preparation stages visible in
the backlog, including work in progress before execution is Taken.

## Story Decomposition

<a id="show-backlog-preparation-states"></a>

### 1. See refinement in progress and prepared stories in the product backlog

**Identity:** SEED-025#show-backlog-preparation-states
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Status:** Captured on 2026-09-23 as a longer-term goal; queued last, not
refined or planned.

**For / why:** A developer reviewing the product backlog can tell which stories
still await preparation, which are being refined, and which have completed
proper refinement and planning, so they can coordinate preparation and choose
what to work on next.

**Outcome:** Extend the visible backlog lifecycle beyond queued and Taken to
represent preparation in progress and preparation complete. A story being
refined in a worktree or another workspace remains identifiable in the product
backlog, with that preparation activity visible before execution starts.

**Key example / evaluation:** A queued story initially awaits preparation.
An agent starts refining it in a worktree, and a developer viewing the backlog
can see that it is being refined. Once refinement and planning have been
completed and reviewed, the backlog distinguishes that prepared story from
both untouched work and work still being refined. Starting authorized execution
continues to be distinguishable as Taken. The same story retains its identity
and priority throughout preparation.

**Value / learning:** Make otherwise hidden preparation visible and help avoid
duplicated refinement or mistaking unfinished preparation for completed work.

**Depends on:** No new prerequisite established during capture. Build on the
existing backlog and canonical preparation records; revisit dependencies when
the state transitions and workspace visibility boundary are refined.

**Effort hypothesis:** Unestimated; longer-term scope requires refinement.

**Safe stopping point:** Preparation stages are understandable from the backlog
without treating preparation alone as authorization to start execution.

## Open Decisions for Refinement

- Exact state names and transitions, including whether refined but not yet
  planned deserves a separate visible stage.
- What evidence establishes that refinement and planning are properly complete,
  reusing existing preparation and readiness semantics where applicable.
- How starting, pausing, or abandoning refinement is recorded and made visible
  when it happens in a worktree or another workspace.
- How preparation stages appear in the backlog and its dashboard view, and
  which facts must be published versus observed locally.

## Ordering and When to Surface

Keep this story at the end of the product backlog as explicitly requested.
Revisit after nearer-term work; capture does not select a storage format,
change the current lifecycle, or authorize implementation.

## Breadcrumbs

- Maintainer request on 2026-09-23 to capture preparation states as a longer-term goal.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Story dashboard](../../dashboard/README.md).
- [Preparation recording](../../src/skills/dough-product-backlog/references/record-preparation.md).
