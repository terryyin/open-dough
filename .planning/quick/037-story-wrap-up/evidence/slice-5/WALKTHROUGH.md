# Slice 5 behavior walkthrough

Candidate sources after lifecycle alignment. Date: 2026-09-10. Local
review, not native acceptance.

Journey fixture: Slice 4 starting tree is the post-execution / post-retrospective
target ([../slice-4/starting/](../slice-4/starting/)). Slice 4 empty-review is
the post-wrap-up target ([../slice-4/empty-review/](../slice-4/empty-review/)).

## Handoff 1 — plan execution complete

`dough-execute-plan` now keeps the completed plan and review evidence. The
starting fixture still has
`.planning/quick/001-widget-status/PLAN.md` with every slice `done`.
Execution did not delete spent history.

## Handoff 2 — retrospective complete

The same tree still has that plan plus `RETROSPECTIVE.md` and `DearDough.md`.
`dough-execution-retrospective` records process findings and product
recommendations; it does not write the backlog or delete the plan. Skip
options and correction planning are unchanged.

## Handoff 3 — wrap-up

[empty-review](../slice-4/empty-review/) has no `001-widget-status` path.
Follow-up plan `002-retry-backoff` remains first. Spent markers are gone.

## Caller alignment

Inspected:

- `src/skills/dough-execute-plan/SKILL.md` finish path retains the plan.
- `src/skills/dough-story-refinement/references/planning.md` defers spent
  cleanup to wrap-up.
- `src/skills/dough-execution-retrospective/SKILL.md` recommends product
  work and keeps process writes during review; it no longer applies backlog
  edits.
- `src/skills/dough-product-backlog/SKILL.md` keeps standalone add/reorder
  maintenance and hands completed-story closure to wrap-up without a
  recently-done requirement.

No unrelated historical recognition walkthroughs were rewritten.

## Behavior review

1. **Invocation context.** Each participant states when it runs and what it
   must not delete or write.
2. **Required context.** Missing wrap-up still leaves a completed plan
   inspectable.
3. **Useful outcome.** One sequence: plan survives execution and retrospective;
   only wrap-up performs routine closure and deletes spent history.
