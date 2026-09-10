---
name: dough-slice-planning
description: >-
  Plans one understood, bounded story as an executable sequence of
  Behavior/Structure slices with outside-in proof and safe stopping points. Use
  when a selected story is ready for implementation planning. Stays within the
  triggering instruction's execution authority: finish after writing and
  reporting the plan unless that instruction explicitly also requests execution.
  Recommends dough-slice-plan-refinement only for complex, low-confidence, or
  over-budget slices. A readiness assessment does not authorize execution.
---

# Slice planning

Write one sufficient executable plan for one understood story. Stay within the
triggering human or parent-agent instruction's explicit execution authority.
Do not implement product code or invoke execution unless that instruction
explicitly also requests execution after planning.

## Require an understood story

Require one user or stakeholder outcome, its value, evaluable key examples, and
boundaries from later stories. Use
[dough-story-refinement](../dough-story-refinement/SKILL.md) when the selected
story's goal, scope, or examples are unresolved. Use
[dough-story-decomposition](../dough-story-decomposition/SKILL.md) when the
parent problem, candidate selection, or story ordering is unresolved. Never
turn a decomposition seed directly into an execution plan.

## Resolve execution context

Before writing, identify from the user's instructions and this project's guidance:

- the selected story and its seed, when one exists;
- the executable-plan root, filename layout, format additions, status
  vocabulary, and lifecycle;
- any supplied slice target and hard limit, including their permitted
  exceptions and overrun escalation;
- required verification, refactoring, commit, and review gates;
- relevant code, tests, stack rules, and Accepted ADRs; and
- any phase or quick-task conventions that own the plan.

Resolve these from this project, not this skill's location. First reuse a plan
that is active under this project's status vocabulary and identifies the
selected story. Otherwise, inspect the established plan entries in the known
root: use the number after the highest allocated entry, preserving its numeric
padding and path layout rather than filling an old gap. Immediately before
writing, recheck the candidate path. If it is occupied, leave it unchanged,
advance to the next number, and check again. Do not add allocation or locking
tooling.

If the canonical plan root is unavailable, name that missing context and stop
before writing; do not ask for a plan number or invent a location. A missing
numeric limit alone is not missing context: apply the linked sizing guidance
without inventing a timing policy. Do not create a new plan under a deprecated
or merely inferred location.

## Write the plan

Record the source, goal, included scope, material exclusions, assumptions, and
key examples without enlarging the story. Read and apply:

- [slice decomposition](../dough-story-decomposition/references/problem-decomposition.md#decompose-slices),
  including its sizing and escalation rules; and
- [executable-plan decisions](../dough-story-refinement/references/planning.md#write-an-executable-plan),
  including executable proof ownership.

Inspect only the code and tests needed to find the stable outside-in proof entry
point, behavior to extend, genuine dependencies, and any Structure needed
immediately before the first Behavior.

For a concrete uncertain infrastructure or storage assumption, reuse matching
evidence or require one isolated representative proof against the relevant
engine and version. Record the assumption, literal command, critical
postcondition, and result in the plan. Failed proof changes the plan before
broad implementation. Keep experiments off shared and production systems.

Use [dough-slice-plan-refinement](../dough-slice-plan-refinement/SKILL.md) only
when the reference's refinement conditions apply:

- If all slices are cohesive, have one proof loop, meet any supplied target,
  and have no unexplained path beyond a supplied hard limit, report
  `ready for direct execution`.
- If any trigger remains, report
  `refinement recommended: <affected slices>`. Do not claim an execution-time
  guarantee.

A readiness result is an assessment of the plan, not authorization to execute.
It does not grant, expand, or replace the triggering instruction's execution
authority.

## Stay within the triggering instruction

After writing and reporting the plan, the next action remains within the
triggering human or parent-agent instruction:

- Planning-only request: report the plan path, ordered slices,
  considered-but-excluded additions, and the readiness result, then stop.
  Do not implement and do not invoke execution.
- Parent-agent delegation that asks only for slice planning: return the plan
  and readiness result to the parent. The parent's broader implementation task
  is not an explicit execution request to this planner.
- Explicit plan-and-execute request: after reporting, the authorized workflow
  may continue into execution without asking again for the same authorization,
  subject to this project's gates and any unresolved concerns that still block
  progress. Prefer the project's established execution path (for example
  [dough-execute-plan](../dough-execute-plan/SKILL.md)) when that path applies.

Report the plan path, ordered slices, considered-but-excluded additions, and the
readiness result. End with:

`## SLICE PLAN WRITTEN`
