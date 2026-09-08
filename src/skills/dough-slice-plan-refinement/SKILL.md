---
name: dough-slice-plan-refinement
description: >-
  Refines an existing executable plan in place into smaller, proof-owned
  Behavior/Structure leaves. Use after dough-slice-planning when leaves are
  complex, sizing confidence is low, or execution overruns. Creates no new plan
  and does not change the selected story outcome.
---

# Slice-plan refinement

Edit the existing plan in place so every remaining leaf is a plausible
target-sized hypothesis with one cohesive proof loop and no unexplained path
beyond the adopter's hard limit. Do not create another plan or implement code.

## Resolve the refinement gate

Require an existing executable plan and the adopter context required by
[dough-slice-planning](../dough-slice-planning/SKILL.md), especially its target,
hard limit, exceptions, overrun policy, and plan lifecycle.

- If no plan exists, use `dough-slice-planning`.
- If the selected story's goal, scope, or examples must change, use
  [dough-story-refinement](../dough-story-refinement/SKILL.md).
- If the parent problem, candidate selection, or sibling ordering must change,
  use [dough-story-decomposition](../dough-story-decomposition/SKILL.md).
- If all remaining leaves are already cohesive, single-proof-loop,
  target-sized, and free of unexplained hard-limit paths, execute directly;
  refinement is optional.

## Refinement triggers

Refine when any remaining leaf:

- contains multiple independent postconditions or proof loops;
- requires several separable implementation beats before a green result;
- hides preparation not tied to its immediate next Behavior;
- has low sizing confidence at its execution or integration boundary;
- is likely to exceed the target or could plausibly exceed the hard limit,
  excluding a stated focused-test or external-wait exception;
- has exceeded the target without converging; or
- has exceeded the hard limit without a stated exception.

## Inspect and classify the current plan

Read the plan and only the code and tests needed to judge execution boundaries.
Preserve completed leaves and the selected story's goal and scope. Reconcile
existing promise ownership and completed evidence using the published
[planning reference](../dough-story-refinement/references/planning.md).

Classify each remaining leaf:

| Result | Decision |
| --- | --- |
| **Ready** | One Behavior/Structure gate, one proof loop, cohesive path, and a plausible target-sized hypothesis |
| **Refine** | Same story, but the leaf has multiple beats, low confidence, or a target or hard-limit concern |
| **Escalate** | Learning requires selected-story or parent-story review |

Route Escalate through the input gate. Refine every Refine leaf.

## Split remaining leaves

Use the moves and safeguards in the published
[problem-decomposition reference](../dough-story-decomposition/references/problem-decomposition.md).
Keep one Behavior, or one Structure immediately before its Behavior, in every
replacement leaf. Keep one outside-in proof loop and a green, adopter-approved
delivery boundary. Include implementation, focused verification, and local
cleanup in the sizing hypothesis. Split again when separable beats or a
plausible hard-limit path remain.

Do not split tests from their Behavior, end a leaf on red, create horizontal
layer leaves, or change the selected outcome.

## Handle an execution overrun

Record elapsed time, completed evidence, the failure or thrash point, and the
sizing assumption that proved false. Confirm attempt-owned work was safely
parked or reverted before editing the plan. Preserve developer and unrelated
changes; stop for human judgment if ownership is unclear.

Replace leaves only when learning escalation permits. Refine later leaves only
when the same disproved assumption applies. Keep a stated exception when one
focused test or external wait explains elapsed time and decomposition cannot
reduce it. Follow the adopter's repeated-overrun escalation policy.

## Update the same plan

Replace obsolete planned detail instead of appending a competing breakdown.
Preserve completed history needed for resume, repoint promise ownership to the
replacement leaves, and record only learnings that changed the plan. Do not
commit, push, implement, or verify product behavior unless the invoking workflow
separately authorizes it.

Report the plan path, replaced leaves, resulting leaves, sizing exceptions, and
whether execution can resume. End with:

`## SLICE PLAN REFINED`
