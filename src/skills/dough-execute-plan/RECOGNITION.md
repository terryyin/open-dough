# Recognition: dough-execute-plan

Review: ready for maintainer review

## Original clues

`execute-plan` at `.agents/skills/execute-plan/SKILL.md` in the supplied source checkout.
Provenance does not determine replacement suitability.

## Purpose

Executes a bounded plan with coordinator-owned delivery and asynchronous CI repair.

## Triggers

Execute plan, run plan, execute slices; requires an executable plan, not a seed.

## Distinguishing behavior

Fresh implementers and independent refactor; proof reuse; owned staging; one observer per execution; durable owner-bound notifications; pause/stash/repair/resume; exact shutdown.

## Client project context

Selected executable PLAN, budgets, proof and formatting commands, Git authorization, client hooks, generation triggers, subsystem policy, Node/gh, workflow selection, and current host bridge.

## Differences that rule out replacement

Synchronous CI gates, per-SHA observers, worker-owned commits, or workflows without an independent refactor pass are not equivalent. Automatic source coexistence-rule activation is not installed.

## Validation needed

Representative invocation-context, required-client-context, and useful-outcome
walkthroughs are recorded in
[the extraction review](../dough-execute-plan/EXTRACTION.md#representative-behavior-review).
Before promotion, review those cases against the selected client, including a
missing-context stop and a human-owned conflict. Native integration and
installation/update/coexistence acceptance remain pending under ADR 0005.
See the same review for dependency disposition, test evidence, and limitations.
Source integrity is recorded in
[SOURCE-CHECKSUMS.json](../dough-execute-plan/SOURCE-CHECKSUMS.json).
