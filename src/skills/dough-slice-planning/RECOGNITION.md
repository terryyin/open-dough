# Recognition: dough-slice-planning

Review: ready for maintainer review

## Original clues

Source on-demand skill: `.agents/skills/slice-planning/SKILL.md` in the supplied
doughnut repository. Project identity is provenance, not a recognition
condition.

## Purpose

Turn one understood story into an ordered executable plan of bounded,
proof-owned Behavior/Structure slices, report remaining concerns or a limited
no-concerns finding, then stop or continue only within the triggering
instruction's explicit execution authority.

## Triggers

A selected story has an agreed outcome, scope, and evaluable examples and the
user or parent agent requests implementation planning. Execution after planning
requires that same triggering instruction to request it explicitly.

## Distinguishing behavior

Behavior/Structure gate; outside-in promise ownership; safe stopping points;
value-and-learning ordering; isolated proof for concrete uncertain assumptions;
construction-time correction of obvious separable outcomes; report of remaining
slice-specific concerns (or a limited no-concerns finding) without prescribing
refinement or certifying execution readiness. Concern evidence assesses the plan
and does not authorize execution. Planning-only and parent-delegated
planning-only requests return the plan and stop; an explicit plan-and-execute
request may continue into the authorized execution handoff without a duplicate
confirmation, subject to project gates and unresolved concerns. A parent's
broader implementation task does not authorize execution by a planner delegated
only planning. Missing numeric limits alone do not block planning or create a
timing policy.

## Client project context

Story and seed; canonical executable-plan root, filename layout, lifecycle, and
active-plan status vocabulary; any supplied slice target, hard limit, exceptions,
and repeated-overrun policy; verification and delivery gates; relevant stack
rules and Accepted ADRs; the triggering human or parent-agent instruction's
execution authority.

## Differences that rule out replacement

A workflow that plans unresolved stories, slices by technical layer, omits
observable proof ownership, prepares beyond the next Behavior, guarantees
duration, issues a planner workflow verdict in place of concern evidence,
treats a clean assessment as execution permission, inherits a parent's broader
implementation task as planner execution authority, or implements without
separate authorization from the triggering instruction is not equivalent.

The source dependencies `problem-decomposition.mdc` and `planning.mdc` are
Cursor `alwaysApply: true` routing rules. Their targets became the shared Open
Dough references. Those references now also preserve the generalized
execution-level invariants recovered from the rules' pre-redirection history,
while this skill remains a concise entrypoint under ADR 0006. It does not
recreate automatic repository-wide application; client installation owns that
delivery.

The Proposed `references/architectural-thinking.md` addition keeps topic
direction with the same planner and links to `dough-pfe` as the authoritative
find-and-use behavior. It is not part of the declared payload until the complete
caller-and-reference dependency set is promoted.

## Validation needed

Before release, maintainers must review invocation context, required project
context, and useful outcome under [AGENTS.md](../../../AGENTS.md). Representative
walkthrough: given one bounded weekly-totals export story, a supplied plan path,
a five-minute target and ten-minute hard limit, and a stable export test entry
point, write one Behavior slice for a single-team export before later policy
exceptions. Put any necessary Structure immediately before that Behavior, map
every included promise to observable proof, and report remaining concerns when a
slice has separable beats or a plausible hard-limit path. With no plan destination,
stop before writing rather than inventing a location; with no numeric policy but
the other context, plan from cohesion and proof ownership without inventing a
timing limit.

Dependency review: the source routing targets supplied the story-level base;
their source copies were extended with ADR-0006-style execution sections for the
slice gate, sizing/escalation, executable-plan contract, and proof ownership.
Both slice skills link those authoritative sections rather than copying them.
Client installation remains separate validation.
