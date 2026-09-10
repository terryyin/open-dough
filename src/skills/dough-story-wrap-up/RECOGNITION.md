# Recognition: dough-story-wrap-up

Review: native wrap-up acceptance recorded for Codex, Cursor, and Claude Code

## Original clues

- Working name: Story Wrap-Up
- Public Open Dough skill under `src/skills/dough-story-wrap-up/`
- Human direction: delete spent plan/story history from the current snapshot;
  Git owns recovery; maintained product content carries lasting knowledge

## Purpose

Close one completed feature story or bounded retrospective correction after
execution and retrospective so the current project keeps useful product
knowledge and no spent source or plan history, while Git can recover what was
removed.

## Triggers

- wrap up a story
- wrap up a bounded correction
- close a completed story
- delete spent plan and execution history after retrospective

## Distinguishing behavior

- Requires completed execution and retrospective; empty retrospective output
  is allowed and does not invent another review. A process-log occurrence,
  spent evidence file, or completed seed status is not that completion record.
- Commits uncommitted spent history with the project's Git conventions before
  deleting the only copy; refuses closure when recovery cannot be resolved.
- Assimilates lasting knowledge into maintained product content without
  execution narration or judgments. A spent-plan-only product fact is written
  into maintained documentation even when tests already exercise related
  behavior.
- Deletes spent plan, story, proof, **Taken**, queue, and finished-history
  entries, related log occurrences, and incoming historical links without
  archives or tombstones.
  Execution may retain the plan through retrospective; wrap-up still deletes
  that spent plan.
- Preserves sibling stories, unrelated log text, human notes, and ambiguous
  records that cannot be attributed to the selected execution.
- Puts an existing follow-up plan first through one canonical active home:
  its supplied feature story or, for a seedless correction, the plan itself.
- Closes a completed seedless correction by plan identity after Git recovery,
  while leaving unfinished corrections intact.
- Applies authorized product-review advice with optional human input; human
  input wins; unresolved choices are reported.

## Client project context

The executing project must supply repository root, selected feature-story or
bounded-correction identity, plan location and status vocabulary,
retrospective-completion evidence, and Git conventions for a recoverable commit.
Seed conventions apply only to feature stories. Backlog path is required only
when a **Taken** or queue entry points at the selected work.

## Differences that rule out replacement

This is public source, not a rewrite of an installed skill. It does not
replace `dough-execute-plan`, `dough-execution-retrospective`, or standalone
`dough-product-backlog` maintenance. Those participants keep their review and
delivery behavior; wrap-up owns later closure.

Under ADR 0003 the skill is in the 0.3.6 payload; later source clarifications
remain Proposed until a later release. Under ADR 0005 spent proof is deleted
at wrap-up, not retained for later judgment. Under ADR 0006 the runtime skill
addresses the agent in this project and keeps maintainer analysis in this
record.

## Validation needed

Native wrap-up acceptance on Codex, Cursor, and Claude Code is recorded.
Recover that plan and evidence from Git when a later source change needs a new
native judgment. Do not treat the v0.3.6 release exception as passing proof.
The 2026-09-10 source review confirmed that the existing active-entry removal
also names **Taken** entries. The human explicitly skipped new native acceptance
for this wording extension.
