# Recognition: dough-resplit-story

Source: Terry Yin's maintainer request, 2026-09-08.
Review: representative behavior review complete; native behavior unverified.

## Behavior review

Reviewed under [AGENTS.md](../../../AGENTS.md) and
[ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Decomposition, story refinement, slice refinement, and backlog ranking remain
in their existing skills; this skill owns resplit mapping and readiness rules.

Representative walkthrough (manual instruction review, not a native run): a
refined 16-slice export story at backlog position two separates into immediate
export, scheduled export, and policy exceptions. Decomposition establishes
independently valuable outcomes before the existing slices are assigned. The
immediate-export story receives Goal, Scope, and Key examples and an aligned,
refined plan. Scheduling and exceptions retain provisional plans with explicit
holds until their stories are refined and plans realigned. Position two may
remain appropriate for immediate export; scheduling and exceptions are assessed
against other backlog items and may be lower or unqueued. Completed export
evidence and original-slice traceability survive; splitting is not completion.

Invocation and missing-context review: a count recommendation alone does not
start resplitting. Missing story, refined plan, client lifecycle, or required
dependency stops affected writes. An unresolved first-story boundary prevents
claiming a completed resplit or inherited readiness.

Threshold review for slice-plan refinement: 13 current slices produces no
count-based recommendation; 14 does, without invoking resplit or changing the
backlog. Completed slices count; obsolete replaced slices do not. Later held
plans route to story refinement before slice-plan refinement.

Both changed skills passed the skill-creator validator. Conventional shared
delivery is unchanged; no fresh Codex, Cursor, or Claude Code native execution
or installation validation is claimed.
