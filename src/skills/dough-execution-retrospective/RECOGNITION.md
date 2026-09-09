# Recognition: dough-execution-retrospective

Review: ready for maintainer review

## Original clues

- Original skill: `execution-retrospective`
- Source project: Doughnut
- Source path: `.agents/skills/execution-retrospective/SKILL.md`
- The source reconstructs deleted or partial plan evidence, reviews related
  execution commits as one outcome, and plans only unresolved findings.

## Purpose

Review one completed or in-progress plan execution against its original story,
separate repository findings from process improvements, and route only
unresolved bounded work back into the project's established planning lifecycle.

## Triggers

- "execution retrospective" or "review this execution"
- Audit of a completed or unfinished plan's aggregate result
- Recovery of an executed plan from partial names, story phrases, commits, or
  Git history after normal cleanup

## Distinguishing behavior

- Uses six decision principles: original intent is the contract, commit
  membership needs evidence, the aggregate result is the review boundary,
  current truth decides remediation, plan state decides the destination, and
  the user owns disputed scope.
- Rechecks findings at the current revision, updates an unfinished plan in
  place, and permits a follow-up plan only for a completed execution.
- Keeps repository findings, process proposals, and overlooked user attention
  distinct, and never executes planned corrections.

## Client project context

The executing project must supply its plan and story locations, plan format and
lifecycle, status vocabulary, repository navigation, focused verification
commands, and any writer/reviewer assignment. Git history or equivalent
execution provenance must be available. The Open Dough
`dough-post-change-refactor` and `dough-slice-planning` skills supply the smell
and planning gates.

## Differences that rule out replacement

The rewrite follows ADR 0001's Proposed vocabulary boundary: this recognition
record uses maintainer terms, while the runtime skill addresses the agent in
"this project." It does not carry Doughnut's `.cursor` topology, fixed planning
paths, Nix and pnpm commands, stack map, generated API conventions, or subsystem
names.

Under ADR 0003 the revision remains Proposed in `src/skills/` and outside the
client payload. Under ADR 0006 the runtime skill is principle-led, links to the
authoritative refactoring and planning behavior instead of repeating it, and
keeps provenance in this recognition record. The unchanged Doughnut source
remains authoritative for that project unless separately replaced there.

## Validation needed

Walk a representative retrospective where a partial capability phrase resolves
one cleaned-up plan, unrelated intervening commits are excluded, and one
aggregate finding is shown to remain unresolved. Confirm that a completed
execution produces a bounded follow-up plan without executing it, while an
unfinished execution updates its existing plan. Verify invocation context,
required project context, and the useful outcome before promotion.
