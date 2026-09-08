---
name: dough-product-backlog
description: Organizes, updates, and reprioritizes an ordered product backlog of story references across canonical story homes. Use for product backlog ordering and maintenance; story details stay in their home documents. Does not prepare classroom or workshop exercise backlogs.
---

# Product backlog

## Adopter-provided context

Resolve these settings from the adopter's instructions or repository guidance
before editing:

- Repository root and canonical product backlog path.
- Story home locations, their identifier convention, and heading or stable-anchor
  linking convention. A home may contain several stories.
- Local workflows for story decomposition, selected-story refinement, and slice
  planning, when those activities are needed.
- Repository commit conventions, if a commit is separately authorized.

If the backlog or story homes cannot be identified, ask for the missing context
and stop before editing. If a needed related workflow is unavailable, identify
the missing guidance and stop that path instead of inventing it.

## Backlog contract

- A short **Near-future direction** section immediately follows the title,
  followed by the unfinished story queue, with **Recently done** at the bottom.
- The direction states the general product goal for the near future. Most
  queued items should align with it; urgent fixes and urgent architecture
  changes are exceptions and may take priority.
- The queue is one numbered list, highest priority first. Each entry contains
  only the exact story title linked to its heading or stable anchor, and its
  home document ID. Requirements, estimates, dependencies, and status stay in
  the story home.
- The queue selects unfinished stories; it is not an exhaustive inventory of
  story homes, a milestone roadmap, or an execution plan.
- Recently done lists the ten most recently completed items, newest first, or
  all completed items if fewer than ten. Use the same linked title and home ID
  format as the queue; completion details stay in the story home.
- This skill maintains the product queue, not a separate classroom or workshop
  exercise backlog.

## Maintain the queue

Read the backlog, including its near-future direction, and the referenced story
sections before changing order. Follow the owner's priority instructions;
otherwise order by alignment with the direction, user value, learning value,
and genuine product prerequisites, allowing the urgent exceptions above.
Preserve unrelated order. Do not infer global priority from home IDs or story
order within a home.

One story has one canonical home even when its journey crosses several
features. Related documents may link to it; do not duplicate its requirements
or enqueue the same outcome twice. Preserve stable story anchors when renaming
or moving a story, and update incoming links when needed.

Add only actual stories with a named beneficiary and evaluable outcome. Use
the adopter's story-decomposition workflow when those are unresolved; use
selected-story refinement for detail, then slice planning. Reprioritizing does
not authorize execution or mean other story candidates are cancelled.

On completion, verify evidence, record completion in the canonical story home,
and move the queue entry to the top of Recently done. Keep at most ten entries:
when a new completion makes eleven, drop the oldest entry at the bottom,
retaining its completion record in its home. On deferral, remove the queue
entry while retaining the story; deferred items do not belong in Recently done.
If a dependency is unfinished, place it first or explain the ordering conflict
to the owner; do not manufacture technical preparation stories. If the owner's
explicit order conflicts with a prerequisite, cite the conflicting stories and
leave that ordering decision with the owner before changing the affected order.

Check every link and exact title, duplicate outcomes, and prerequisite order.
Check that the direction section comes first, most queued items align with it,
and Recently done comes last with at most ten entries in newest-first order.
Summarize what moved and why. Follow repository commit conventions; backlog
maintenance alone does not authorize a commit or push.
