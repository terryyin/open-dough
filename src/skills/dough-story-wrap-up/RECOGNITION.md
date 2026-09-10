# Recognition: dough-story-wrap-up

Review: in progress for Quick 037 Slice 1

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
- Deletes spent standalone plan, story, proof, and queue history without
  archives, tombstones, or finished-list replacements.
- Leaves follow-up plans, shared process logs, and product-review advice intact
  until later slices add those actions.

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

Under ADR 0003 the revision remains Proposed in `src/skills/` and outside the
client payload. Under ADR 0005 spent proof is deleted at wrap-up, not retained
for later judgment. Under ADR 0006 the runtime skill addresses the agent in this
project and keeps maintainer analysis in this record.

## Validation needed

Walk one isolated single-story closure with incomplete-plan,
incomplete-retrospective, and uncommitted-history refusals. Confirm Git
recovery of deleted paths. Later slices own shared records, follow-up
priority, product-review decisions, lifecycle alignment, and installation.

## Slice 1 local behavior evidence

Walked standalone closure on 2026-09-10 in worktree
`/tmp/open-dough-quick-037-story-wrap-up`.
[evidence/slice-1/WALKTHROUGH.md](../../../.planning/quick/037-story-wrap-up/evidence/slice-1/WALKTHROUGH.md).

1. **Invocation.** Description and body name wrap-up after completed execution
   and retrospective, including empty retrospective output.
2. **Required context.** Unfinished plan, missing retrospective completion, and
   uncommitted spent files without Git conventions each leave material intact.
3. **Useful outcome.** Spent plan, seed, and queue entry disappeared; product
   docs received the retry rule; unrelated sentinel and product test remained;
   `git show` recovered the deleted paths from `fe8e287`.
