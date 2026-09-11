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

Story 44 Slice 4 manually walked three planned basket-total execution variants:

- **Still-valid finding:** The plan's evidenced basket-total candidate still
  owns the same responsibility under the same rules and lifecycle. Execution
  carries the finding and candidate evidence through delegation and does not
  invoke PFE merely because another slice or fresh agent starts.
- **Unforeseen responsibility:** A slice reveals that a second process must now
  introduce or relocate ownership of basket totals. That trigger invokes the
  linked `dough-pfe` skill with the plan context and observation. Its
  purpose-preserving modularization result becomes necessary Structure work in
  the remaining plan, even across the two real process boundaries; the active
  plan's specific concept-and-boundary authorization permits the implicated
  refactor but not unrelated cross-subsystem cleanup.
- **Invalidated candidate:** New lifecycle evidence shows the planned candidate
  owns accounting settlement rather than basket pricing. Execution invokes PFE
  again because fit is invalidated, rather than silently reusing it. When the
  evidence cannot resolve which domain owns discounts, execution gives the
  developer the competing meanings and evidence and stops the affected path;
  the coordinator cannot treat structural reach as permission to choose.

Only the latter two variants trigger PFE. In each, current necessary structure
is planned without changing the selected story outcome, while unresolved domain
meaning and unauthorized consequential choices retain the existing human stop.
This is a manual source walkthrough, not a native agent run or a release claim.

Story 44 Slice 5 manually walked the midway direction-conflict journey:

- **Contrary topic evidence:** The basket-total plan cites a North Star topic
  placing pricing before checkout, but execution finds current ownership and
  lifecycle evidence that settlement is the required owner. The executing role
  returns the topic, evidence, affected slices, and consequences, stops only
  that dependent path, and does not edit or reinterpret the topic. Independent
  work with separate state and proof may continue.
- **Coordinator application and resume:** The coordinator uses the linked
  architectural-thinking procedure as the planner, weighs the affected stories,
  domain meaning, product structure, and Accepted ADRs, selects the supported
  owner, updates the topic when needed, and refines the same active plan until
  remaining slices and direction agree. Only then does the affected path resume.
  The story remains active; completed proof, its **Taken** backlog entry, the
  recorded execution checkout and branch, and its worktree remain intact. No
  retrospective, wrap-up, partial closure, new approval gate, or history record
  is introduced.
- **Accepted ADR conflict:** If the settlement direction would contradict an
  Accepted ADR, the topic is not rewritten around that decision. The dependent
  path remains stopped while the project's existing human-owned ADR exception
  or supersession process supplies the decision; unrelated safe work may still
  proceed. The coordinator then applies the human-owned result and aligns the
  remaining plan before resumption.

This is a manual authoring walkthrough of the linked source instructions, not a
native agent run, acceptance claim, or release claim.
