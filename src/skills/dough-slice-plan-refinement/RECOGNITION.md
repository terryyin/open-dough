# Recognition: dough-slice-plan-refinement

Status: ready for maintainer review

## Original clues

Source on-demand skill: `.agents/skills/slice-plan-refinement/SKILL.md` in the
supplied doughnut repository. Project identity is provenance, not a recognition
condition.

## Purpose

Replace complex, low-confidence, or overrun slices in one existing executable
plan with smaller proof-owned Behavior/Structure slices.

## Triggers

Multiple postconditions or proof loops, separable implementation beats, hidden
preparation, low sizing confidence, plausible budget overruns, or actual
non-converging overruns.

## Distinguishing behavior

Ready/Refine/Escalate classification; same-plan replacement; completed-evidence
preservation; attempt-owned work safety; repeated-overrun escalation; proof
ownership reconciled before execution resumes.

## Client project context

Existing plan and selected story; slice target, hard limit, exceptions,
and repeated-overrun policy; plan lifecycle and delivery gates; ownership of
work in progress after an execution attempt.

## Differences that rule out replacement

A workflow that creates a second plan, changes story scope, splits tests from
behavior, restarts an overrun by renaming slices, discards completed evidence,
or edits work of unclear ownership is not equivalent.

The source depends on Cursor `alwaysApply: true` planning and decomposition
rules. Their public references now preserve the generalized execution-level
invariants recovered from the rules' pre-redirection history, while this skill
remains a concise entrypoint under ADR 0006. It does not recreate automatic
repository-wide application; client installation owns that delivery.

## Validation needed

Before release, maintainers must review invocation context, required client project
context, and useful outcome under [AGENTS.md](../../../AGENTS.md). Representative
walkthrough: given an existing weekly-export plan with one slice combining CSV
generation and scheduling, preserve completed export evidence, replace only the
remaining combined slice with one proof loop per observable behavior, and repoint
its promises. Given a prior overrun, record elapsed time and the disproved
assumption and touch later slices only when it applies to them. If work ownership
is unclear or the evidence changes story scope, stop for human review.

Dependency review: the source routing targets supplied the story-level base;
their public copies were extended with ADR-0006-style execution sections for the
slice gate, sizing/escalation, executable-plan contract, and proof ownership.
This skill links those authoritative sections and introduces no competing copy.
Client installation remains separate validation.

Inspected source SHA-256 values (paths relative to the supplied repository):

- `.agents/skills/slice-plan-refinement/SKILL.md`:
  `dce5b1324a0b73c65cbc514f8dc612956d5c584b08302d4cc87502ddf30d8beb`
- `.cursor/rules/problem-decomposition.mdc`:
  `46ac1800552ff36274526cf9378643396f69b9ff4592ee1c41a59c53f9c1d3a9`
- `.cursor/rules/planning.mdc`:
  `2d7292270da9702738b1bdc3ade0c0dec1d1fef22ff8ce94a5d84584f1d7b488`
- `.agents/skills/dough-story-decomposition/references/problem-decomposition.md`:
  `b9f6b603680c60ba0b1c8e0ead0f2626f86f5b7b04d531060d232929f1fda626`
- `.agents/skills/dough-story-refinement/references/planning.md`:
  `6acb01af53cdef6c33497e03e8b8334c62c1cc425aa334b371170835e5f2ff89`
