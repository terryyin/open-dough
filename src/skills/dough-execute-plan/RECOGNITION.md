# Recognition: dough-execute-plan

Review: ready for maintainer review

## Original clues

`execute-plan` at `.agents/skills/execute-plan/SKILL.md` in the supplied source checkout.
Provenance does not determine replacement suitability.

## Purpose

Executes slices in a plan for one selected story or bounded correction, taking
queued work before coordinator-owned delivery and asynchronous CI repair.

## Triggers

Execute plan, run plan, execute slices; requires a plan for one selected story.
The story lives in its seed; the seed is not executable.

## Distinguishing behavior

After plan context and execution authorization are resolved, a queued entry
moves to **Taken** as execution's first project-state change. Resume recognizes
an already-taken entry, and work absent from both active lists is not fabricated.
Fresh implementers and independent refactor; proof reuse; owned staging; one
observer per execution; durable owner-bound notifications;
pause/stash/repair/resume; exact shutdown.

## Client project context

Selected executable plan, budgets, proof and formatting commands, Git authorization, client hooks, generation triggers, subsystem policy, Node/gh, workflow selection, and current host bridge.

## Differences that rule out replacement

Synchronous CI gates, per-SHA observers, worker-owned commits, or workflows without an independent refactor pass are not equivalent. Automatic source coexistence-rule activation is not installed.

## Validation needed

Representative invocation-context, required-client-context, and useful-outcome
walkthroughs are recorded in
[the extraction review](../dough-execute-plan/EXTRACTION.md#representative-behavior-review).
Native behavior and host integration, plus installation/update/coexistence
checks, are recorded in the [execution acceptance review](../../../.planning/quick/027-execution-native-acceptance/README.md).
The review retains failures, the Codex adapter corrections, and validation limits.
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
