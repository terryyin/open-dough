# Reconcile, prune, and prioritize retrospective findings

Invoke [maintain-feedback-cycle](../../.agents/skills/maintain-feedback-cycle/SKILL.md)
for one combined project and shared feedback cycle: project-local maintenance
across the discovered set first, then shared collection, priorities and delivery
of every resulting repository change. Its explicit invocation authorizes both
phases; it does not implement their selected improvements.

Invoke [collect-client-feedback](../../.agents/skills/collect-client-feedback/SKILL.md)
for shared-only Open Dough feedback maintenance. That internal skill is the single
workflow for discovering maintained projects, retaining and adopting evidence,
cleanup/watch decisions, challenged top-two selection, and committing and
synchronizing all changed repositories including Open Dough.

Each shared review ends by recording its date and the next review's due date in
the `json dough-feedback-review` block below the
[near-term watch list](near-term-watch-list.md)'s heading, as
[retention and watch](../../.agents/skills/collect-client-feedback/references/retention-and-watch.md)
describes. The dashboard reads that block
([reader](../../dashboard/src/feedbackReview.ts)) to learn when the next cycle is
due.

An explicit request to run this former runbook invokes the shared-only skill with the same
complete maintenance authority, subject to narrower current instructions. Reading
or editing this pointer starts no maintenance. See the skill for required inputs,
source preservation, partial-run reporting and recovery.
