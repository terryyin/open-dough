---
id: SEED-003
status: dormant
planted: 2026-09-06
planted_during: unknown
trigger_when: when relevant
scope: unknown
---

# SEED-003: Refine oversized slice plans into smaller user stories

## Idea

After producing a slice plan, use the size of the resulting plan as feedback
about the source user story. If the plan is too large—for example, more than
ten slices—return to the user story and apply the user-story-refinement skill
again, following the same refinement principles, to split it into smaller user
stories.

Reuse the existing slice plan where its work remains valid. Partition or map
its slices to the newly separated stories instead of discarding useful
planning. Then refine the first new user story and update only that story's
slice plan to reflect the refined story.

Plans mapped to the remaining stories are provisional. Each must carry an
explicit note that it is not ready for immediate refinement or execution. Its
user story must be refined first, and its mapped plan must then be updated to
match the refined story before either further plan refinement or execution.

This is a general workflow idea; it does not need to be expressed in user-story
form at capture time.

## Why This Matters

_To be filled in. Run `$gsd-capture --seed --enrich SEED-003` to add context._

## When to Surface

**Trigger:** when relevant

This seed will surface during `$gsd-new-milestone` when the milestone scope matches.

## Scope Estimate

**Unknown** — run `$gsd-capture --seed --enrich SEED-003` to estimate effort.

## Breadcrumbs

- [Existing versioned-updates slice plan](../quick/004-versioned-updates/PLAN.md)
  includes a large slice breakdown and already discusses slice-plan-refinement
  triggers.
- [Installation and update seed](SEED-001-install-and-update-open-dough.md)
  records earlier use of Donut story-refinement and slice-planning workflows.

## Notes

Captured via one-shot seed capture. Enrich with trigger, why, and scope at your convenience.
