# Recognition: dough-execute-plan

Review: ready for maintainer review

## Original clues

`execute-plan` at `.agents/skills/execute-plan/SKILL.md` in the supplied source checkout.
Provenance does not determine replacement suitability.

## Purpose

Executes slices in a plan for one selected story or bounded correction, or an
explicitly selected canonical story as one quick slice without a plan, taking
queued work before coordinator-owned delivery and asynchronous CI repair.

## Triggers

Execute plan, run plan, execute slices, or explicitly execute a canonical story
without slice planning. Ordinary execution requires a plan. Quick execution
requires both the current skip-planning instruction and an understood canonical
story; the seed alone is not executable.

## Distinguishing behavior

After execution-source context and execution authorization are resolved, a queued entry
moves to **Taken** as execution's first project-state change. Resume recognizes
an already-taken entry, and work absent from both active lists is not fabricated.
Fresh implementers and independent refactor; proof reuse; owned staging; one
observer per execution; durable owner-bound notifications;
pause/stash/repair/resume; exact shutdown.

## Client project context

Selected executable plan or canonical quick story and conversation, budgets,
proof and formatting commands, Git authorization, client hooks, generation
triggers, subsystem policy, Node/gh, workflow selection, and current host bridge.

## Differences that rule out replacement

Synchronous CI gates, per-SHA observers, worker-owned commits, or workflows without an independent refactor pass are not equivalent. Automatic source coexistence-rule activation is not installed.

## Validation needed

Representative invocation-context, required-client-context, and useful-outcome
walkthroughs are recorded in
[the extraction review](../dough-execute-plan/EXTRACTION.md#representative-behavior-review).
See the extraction review for dependency disposition and source differences.
Source integrity is recorded in
[SOURCE-CHECKSUMS.json](../dough-execute-plan/SOURCE-CHECKSUMS.json).

The 2026-09-10 source review walked authorized first execution, resume, missing
authorization, and work not selected from the backlog. Only authorized first
execution moved the existing queued entry, before plan-state or implementation
changes. Resume and non-backlog execution did not duplicate or invent entries;
missing authorization stopped with the queue intact. The human explicitly
skipped new native acceptance, so the earlier native review remains evidence
for the unchanged delivery machinery only.
