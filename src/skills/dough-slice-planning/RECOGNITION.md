# Recognition: dough-slice-planning

Status: ready for maintainer review

## Original clues

Source on-demand skill: `.agents/skills/slice-planning/SKILL.md` in the supplied
doughnut repository. Project identity is provenance, not a recognition
requirement.

## Purpose

Turn one understood story into an ordered executable plan of bounded,
proof-owned Behavior/Structure slices.

## Triggers

A selected story has an agreed outcome, scope, and evaluable examples and the
user requests implementation planning.

## Distinguishing behavior

Behavior/Structure gate; outside-in promise ownership; safe stopping points;
value-and-learning ordering; isolated proof for concrete uncertain assumptions;
direct-execution readiness unless explicit refinement triggers remain.

## Adopter-provided context

Story and home; executable-plan path and lifecycle; slice target, hard
limit, exceptions, and repeated-overrun policy; verification and delivery gates;
relevant stack rules and Accepted ADRs.

## Differences that rule out replacement

A workflow that plans unresolved stories, slices by technical layer, omits
observable proof ownership, prepares beyond the next Behavior, guarantees
duration, or implements without separate authorization is not equivalent.

The source dependencies `problem-decomposition.mdc` and `planning.mdc` are
Cursor `alwaysApply: true` routing rules. Their targets became the shared Open
Dough references. Those references now also preserve the generalized
execution-level invariants recovered from the rules' pre-redirection history,
while this skill remains a concise entrypoint under ADR 0006. It does not
recreate automatic repository-wide application; client installation owns that
delivery.

## Validation needed

Before release, maintainers must review invocation context, required adopter
context, and useful outcome under [AGENTS.md](../../../AGENTS.md). Representative
walkthrough: given one bounded weekly-totals export story, a supplied plan path,
a five-minute target and ten-minute hard limit, and a stable export test entry
point, write one Behavior slice for a single-team export before later policy
exceptions. Put any necessary Structure immediately before that Behavior, map
every included promise to observable proof, and recommend refinement only if a
slice has separable beats or a plausible hard-limit path. With no plan destination
or sizing policy, stop before writing instead of inventing conventions.

Dependency review: the source routing targets supplied the story-level base;
their public copies were extended with ADR-0006-style execution sections for the
slice gate, sizing/escalation, executable-plan contract, and proof ownership.
Both slice skills link those authoritative sections rather than copying them.
Client installation remains separate validation.

Inspected source SHA-256 values (paths relative to the supplied repository):

- `.agents/skills/slice-planning/SKILL.md`:
  `08000845894c037b5ccc32b892ac738f355e4cfd4f2287ac7c389580b23e3517`
- `.cursor/rules/problem-decomposition.mdc`:
  `46ac1800552ff36274526cf9378643396f69b9ff4592ee1c41a59c53f9c1d3a9`
- `.cursor/rules/planning.mdc`:
  `2d7292270da9702738b1bdc3ade0c0dec1d1fef22ff8ce94a5d84584f1d7b488`
- `.agents/skills/dough-story-decomposition/references/problem-decomposition.md`:
  `b9f6b603680c60ba0b1c8e0ead0f2626f86f5b7b04d531060d232929f1fda626`
- `.agents/skills/dough-story-refinement/references/planning.md`:
  `6acb01af53cdef6c33497e03e8b8334c62c1cc425aa334b371170835e5f2ff89`
