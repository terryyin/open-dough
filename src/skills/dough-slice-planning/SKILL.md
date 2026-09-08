---
name: dough-slice-planning
description: >-
  Plans one understood, bounded story as an executable sequence of
  Behavior/Structure leaves with outside-in proof and safe stopping points. Use
  when a selected story is ready for implementation planning. Recommends
  dough-slice-plan-refinement only for complex, low-confidence, or over-budget
  leaves; does not implement the plan.
---

# Slice planning

Write one sufficient executable plan for one understood story. Keep every leaf
bounded, proof-owned, and safe to stop after. Do not implement product code.

## Route unresolved work

Require one user or stakeholder outcome, its value, evaluable key examples, and
boundaries from later stories. Use
[dough-story-refinement](../dough-story-refinement/SKILL.md) when the selected
story's goal, scope, or examples are unresolved. Use
[dough-story-decomposition](../dough-story-decomposition/SKILL.md) when the
parent problem, candidate selection, or story ordering is unresolved. Never
turn a decomposition seed directly into an execution plan.

## Resolve adopter context

Before writing, identify from the user's instructions and adopting repository:

- the selected story and its home, when one exists;
- the executable-plan path, format additions, status vocabulary, and lifecycle;
- the project's execution-leaf target and hard limit, including permitted
  exceptions and overrun escalation;
- required verification, refactoring, commit, and review gates;
- relevant code, tests, stack rules, and Accepted ADRs; and
- any phase or quick-task conventions that own the plan.

Resolve these from the adopting repository, not this skill's location. If the
plan destination or execution-leaf budget is unavailable, name the missing
context and stop before writing or claiming sizing readiness. Do not create a
new plan under a deprecated or merely inferred location.

## Inspect the execution context

Record the source, goal, included scope, material exclusions, assumptions, and
key examples without enlarging the story. Inspect only the code and tests needed
to find the stable outside-in proof entry point, behavior to extend, genuine
dependencies, and any Structure needed immediately before the first Behavior.
Do not slice by file, component, layer, specialist, or activity.

For a concrete uncertain infrastructure or storage assumption, reuse matching
evidence or require one isolated representative proof against the relevant
engine and version. Record the assumption, literal command, critical
postcondition, and result in the plan. Failed proof changes the plan before
broad implementation. Keep experiments off shared and production systems.

## Cut, order, and write leaves

Follow the published
[problem-decomposition reference](../dough-story-decomposition/references/problem-decomposition.md)
for splitting, ordering, safe stopping points, and learning escalation. Follow
the published
[planning reference](../dough-story-refinement/references/planning.md) for scope
discipline, story ownership, lifecycle, and cleanup. Map every checkable promise
to an owning leaf and observable proof. Split independent postconditions,
multi-beat paths, and plausible hard-limit overruns. Put a Structure leaf
immediately before the Behavior it enables, and order Behavior leaves by user
value, learning value, then genuine prerequisites.

Compare every leaf with the refinement triggers in
[dough-slice-plan-refinement](../dough-slice-plan-refinement/SKILL.md):

- If all leaves are cohesive, have one proof loop, meet the adopter's target,
  and have no unexplained hard-limit path, report `ready for direct execution`.
- If any trigger remains, report
  `refinement recommended: <affected leaves>`. Do not claim an execution-time
  guarantee.

Report the plan path, ordered leaves, considered-but-excluded additions, and the
readiness result. End with:

`## SLICE PLAN WRITTEN`
