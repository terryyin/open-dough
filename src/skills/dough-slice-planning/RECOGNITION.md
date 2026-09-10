# Recognition: dough-slice-planning

Review: ready for maintainer review

## Original clues

Source on-demand skill: `.agents/skills/slice-planning/SKILL.md` in the supplied
doughnut repository. Project identity is provenance, not a recognition
condition.

## Purpose

Turn one understood story into an ordered executable plan of bounded,
proof-owned Behavior/Structure slices.

## Triggers

A selected story has an agreed outcome, scope, and evaluable examples and the
user requests implementation planning.

## Distinguishing behavior

Behavior/Structure gate; outside-in promise ownership; safe stopping points;
value-and-learning ordering; isolated proof for concrete uncertain assumptions;
direct-execution readiness unless an explicit refinement trigger remains. Missing
numeric limits alone do not block planning or create a timing policy.

## Client project context

Story and seed; canonical executable-plan root, filename layout, lifecycle, and
active-plan status vocabulary; any supplied slice target, hard limit, exceptions,
and repeated-overrun policy; verification and delivery gates; relevant stack
rules and Accepted ADRs.

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

Before release, maintainers must review invocation context, required project
context, and useful outcome under [AGENTS.md](../../../AGENTS.md). Representative
walkthrough: given one bounded weekly-totals export story, a supplied plan path,
a five-minute target and ten-minute hard limit, and a stable export test entry
point, write one Behavior slice for a single-team export before later policy
exceptions. Put any necessary Structure immediately before that Behavior, map
every included promise to observable proof, and recommend refinement only if a
slice has separable beats or a plausible hard-limit path. With no plan destination,
stop before writing rather than inventing a location; with no numeric policy but
the other context, plan from cohesion and proof ownership without inventing a
timing limit.

Dependency review: the source routing targets supplied the story-level base;
their source copies were extended with ADR-0006-style execution sections for the
slice gate, sizing/escalation, executable-plan contract, and proof ownership.
Both slice skills link those authoritative sections rather than copying them.
Client installation remains separate validation.

### Slice 1 numbering walkthrough — 2026-09-10

Candidate: base revision `d0a8263366168cb9cccc82adbcbd642ee40890f3`; uncommitted source change in
`src/skills/dough-slice-planning/` for Quick 033 Slice 1.

Inputs: a disposable quick-plan root containing
`001-existing/PLAN.md` through `032-existing/PLAN.md`, a selected story, and
project layout `NNN-<slug>/PLAN.md`. The walkthrough also supplied an active
matching plan, created `033-new-story` after candidate selection, and omitted
the root in a separate case.

Observed results: a new story selected `033-new-story/PLAN.md`; the matching
active plan was reused; the newly occupied `033-new-story/PLAN.md` retained its
original contents and the result advanced to `034-new-story/PLAN.md`; the absent
root returned missing context without a number. The check inspected paths and
file contents, not wording in this record or skill.

Limitations: this is a disposable source-guidance walkthrough, not native
installed-host acceptance. Slice 2 separately covers absent sizing policy; the
release and installed-use slices retain the remaining native evidence.

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

### Slice 2 optional-budget walkthrough — 2026-09-10

Candidate: base revision `ee88dab8fd6beed40fd4162f42ed1a903a7fd3e9`; uncommitted
source change in `src/skills/dough-slice-planning/`, its authoritative slice-sizing
reference, and `src/skills/dough-slice-plan-refinement/` for Quick 033 Slice 2.

Inputs: the Slice 1 disposable quick-plan layout (`001-existing/PLAN.md` through
`032-existing/PLAN.md`, with `NNN-<slug>/PLAN.md`) and one understood export story:
given team data, a user requests a single-team CSV export and receives that file;
the focused export check observes its row and headers. The no-policy case supplied
the canonical root but no numeric target or hard limit. The supplied-policy case
used the same story and root with a five-minute target and ten-minute hard limit;
comparable endpoint evidence predicted twelve minutes for implementation, focused
verification, and slice-local cleanup. The combined case omitted both a plan
number and numeric policy while retaining the root, story, and layout.

Observed results: the no-policy case produced one Behavior slice for the CSV
export, with the export check as its owning proof, and reported readiness from its
cohesive single outcome and proof loop without a time guarantee. The supplied
policy changed the same example to refinement recommended: its predicted work
had a plausible path beyond the supplied ten-minute hard limit. The combined case
allocated `033` from the established layout and produced the same proof-owned
export slice. The walkthrough inspected the generated slice boundaries, proof
ownership, and whether planning stalled for additional numeric policy; it did not
use phrase matching or authorize implementation.

Changed assumptions: numeric targets and hard limits constrain sizing only when
the project supplies them; in their absence, the Behavior/Structure gate, one
observable outcome, one proof loop, and concrete uncertainty remain the bounded
planning criteria. A missing canonical plan root or unresolved story scope still
stops planning.

Limitations: this is a disposable source-guidance walkthrough, not native
installed-host acceptance. It does not prove release publication or ordinary
adoption; those remain owned by Quick 033 Slices 3–4.
