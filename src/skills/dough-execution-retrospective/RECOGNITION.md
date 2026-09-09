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
separate repository findings from process improvements, and route remaining
bounded work back into the project's established planning lifecycle.

## Triggers

- "execution retrospective" or "review this execution"
- Audit of a completed or unfinished plan's aggregate result
- Recovery of an executed plan from partial names, story phrases, commits, or
  Git history after normal cleanup

## Distinguishing behavior

- Recovers one original plan and story before judging the result.
- Builds an evidence-backed, non-contiguous commit manifest instead of assuming
  a range.
- Reviews the aggregate outcome for bugs, drift, refactoring residue, and
  consequential improvements.
- Rechecks findings at the current revision and updates an unfinished plan in
  place; only a completed execution may receive a follow-up plan.
- Keeps repository findings, process proposals, and overlooked developer
  attention distinct, and never executes planned corrections.

## Client project context

The executing project must supply its plan and story locations, plan format and
lifecycle, status vocabulary, repository navigation, focused verification
commands, and any writer/reviewer assignment. Git history or equivalent
execution provenance must be available. The reusable Open Dough
`dough-post-change-refactor` and `dough-slice-planning` skills supply the smell
and planning gates.

## Differences that rule out replacement

The extracted skill does not carry Doughnut's `.cursor` rule topology, fixed
`.planning/phases` and `.planning/quick` paths, Nix and pnpm commands, stack map,
generated API conventions, or subsystem names. It resolves those from the
executing project. The source remains unchanged and authoritative for Doughnut
until a maintainer separately promotes and releases this Proposed guidance and
the project installs it.

## Validation needed

Walk a representative retrospective where a partial capability phrase resolves
one cleaned-up plan, unrelated intervening commits are excluded, one aggregate
finding is shown to remain unresolved, and a completed execution produces a
bounded follow-up plan without executing it. Confirm invocation context,
required project context, and the useful outcome before promotion.
