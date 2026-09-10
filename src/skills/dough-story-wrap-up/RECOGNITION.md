# Recognition: dough-story-wrap-up

Review: ready for maintainer review; native wrap-up acceptance pending

## Original clues

- Authored for [SEED-011 Story Wrap-Up](../../../.planning/seeds/SEED-011-story-wrap-up.md#story-wrap-up)
- Working name: Story Wrap-Up
- Public Open Dough skill under `src/skills/dough-story-wrap-up/`
- Human direction: delete spent plan/story history from the current snapshot;
  Git owns recovery; maintained product content carries lasting knowledge

## Purpose

Close one completed story after execution and retrospective so the current
project keeps useful product knowledge and no spent story or plan history,
while Git can recover what was removed.

## Triggers

- wrap up a story
- close a completed story
- delete spent plan and execution history after retrospective

## Distinguishing behavior

- Requires completed execution and retrospective; empty retrospective output
  is allowed and does not invent another review.
- Commits uncommitted spent history with the project's Git conventions before
  deleting the only copy; refuses closure when recovery cannot be resolved.
- Assimilates lasting knowledge into maintained product content without
  execution narration or judgments.
- Deletes spent plan, story, proof, queue and finished-history entries, related
  log occurrences, and incoming historical links without archives or tombstones.
- Preserves sibling stories, unrelated log text, human notes, and ambiguous
  records that cannot be attributed to the selected execution.
- Puts an existing follow-up plan's story first without replanning or executing it.
- Applies authorized product-review advice with optional human input; human
  input wins; unresolved choices are reported.

## Client project context

The executing project must supply repository root, selected story identity,
plan location and status vocabulary, retrospective-completion evidence, and Git
conventions for a recoverable commit. Backlog path is required only when a queue
entry points at the selected story.

## Differences that rule out replacement

This is new public source, not a rewrite of an installed skill. It does not
replace `dough-execute-plan`, `dough-execution-retrospective`, or standalone
`dough-product-backlog` maintenance. Those participants keep their review and
delivery behavior; wrap-up owns later closure.

Under ADR 0003 the skill is declared in the candidate payload and is not
in a release tag. Under ADR 0005 spent proof is deleted at wrap-up, not
retained for later judgment. Under ADR 0006 the runtime skill addresses the
agent in this project and keeps maintainer analysis in this record.

## Validation needed

Native wrap-up acceptance on Codex, Cursor, and Claude Code remains unfinished.
Recover prior walkthroughs from Git if a current native judgment needs them.
