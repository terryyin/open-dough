# Recognition: dough-story-decomposition

Status: ready for maintainer review

## Original clues

Source on-demand skill: `.agents/skills/story-decomposition/SKILL.md` in the
supplied doughnut repository. Project identity is provenance, not a recognition
condition.

## Purpose

Challenge a broad product problem and write one non-executable seed of ordered
3V stories.

## Triggers

Unclear value, solution-first requests, competing outcomes, or disputed learning
priority.

## Distinguishing behavior

Human-owned framing decisions; strongest simpler alternative; 3V rejection;
effort hypotheses without code inspection; safe stopping points and
first-to-drop order.

## Client project context

Seed location, IDs, metadata and anchors; S/M/L definitions; backlog path and
execution workflow only when requested.

## Differences that rule out replacement

A workflow that permits technical-layer stories, code-based estimation, or
automatic implementation is not equivalent.

The source dependencies `problem-decomposition.mdc` and `planning.mdc` are
Cursor `alwaysApply: true` rules. The published references preserve the shared
fractal behavior at story and slice resolutions; this skill invokes
the story-level workflow, while the slice skills invoke the execution-level
workflow. They do not replace automatic repository-wide application; client
installation owns that delivery.

Source-specific paths, exact timers, test tooling, and GSD artifact management
remain client project context rather than public defaults.

## Validation needed

Before release, maintainers must review invocation context, required client project
context, and useful outcome under [AGENTS.md](../../../AGENTS.md), including a
representative use in the intended client project. Extraction-time manual walkthrough:

For a supplied problem where staff retype weekly totals, with all seven framing
decisions answered and client project paths and effort bands supplied: evaluate
defer/manual/existing-tool options, retain a one-team end-to-end totals export,
reject a database-only candidate, and defer automatic scheduling. Write one seed
with an observable export check, effort confidence and assumptions, safe
stopping value, and scheduling first to drop. With missing effort bands or
competing human framing answers, stop before seed writing rather than fabricate
them.

Dependency review: decomposition owns the shared fractal decomposition
reference and seed format; refinement owns the shared story/executable planning
reference. The story and slice skills select the relevant resolution without
copying those rules. Refinement links the existing public
`dough-adr-awareness` skill, whose inspected source is byte-identical to the
current public copy. Client installation remains separate validation work.

Inspected source SHA-256 values (paths relative to the supplied repository):

- `.agents/skills/story-decomposition/SKILL.md`:
  `e103114aee314042f85823510089f2854d23e8afc0fca5d7cc5c8cb73568dcf4`
- `.cursor/rules/problem-decomposition.mdc`:
  `744f1099dcd3c3280402eacc38b0a5a22a0d871bae8b9f511f8389ee01a16b33`
