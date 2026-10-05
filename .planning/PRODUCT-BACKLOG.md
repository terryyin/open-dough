# Product backlog

## Near-future direction

Enable agents to execute stories in parallel while collaborating through
trunk-based development, with each agent working in its own Git worktree.
Give developers visibility into a client project's status and progress through
the user-story perspective of an Open Dough dashboard, showing how ideas move
through development and become assimilated into the product.
First, derive progress solely from Git state published to origin, treating
developers as working on separate machines. Owned worktree workflows use remote
history without requiring a default checkout. Then add local operational
visibility for multiple agents working in worktrees on one machine.

## Taken

- [Read and mark attention messages read directly on the story card](seeds/SEED-103-attention-message-on-story-card.md#attention-message-on-story-card) — SEED-103#attention-message-on-story-card ([plan](slice-plans/248-attention-message-on-story-card/PLAN.md))
- [Prove the Mark as done rule for every reading it reads](seeds/SEED-104-confirm-mark-as-done.md#prove-mark-as-done-rule) — SEED-104#prove-mark-as-done-rule ([plan](slice-plans/249-prove-mark-as-done-rule/PLAN.md))
- [Review changes in a full-height panel with compact context and independent file navigation](seeds/SEED-102-review-changes-ui.md#full-height-review-changes) — SEED-102#full-height-review-changes ([plan](slice-plans/247-full-height-review-changes/PLAN.md))

## Backlog list

- [Dashboard specs pass CI on a revision that changes no code](seeds/SEED-100-project-checks-trustworthy.md#dashboard-specs-pass-unchanged-code) — SEED-100#dashboard-specs-pass-unchanged-code
- [A session the dashboard launches prepares its checkout as a developer shell would](seeds/SEED-100-project-checks-trustworthy.md#launched-session-development-environment) — SEED-100#launched-session-development-environment
- [Review only what changed since the last review](seeds/SEED-088-dashboard-story-code-review.md#review-changes-since-last-review) — SEED-088#review-changes-since-last-review
- [Optional process retrospective for Dough Land and Story Wrap Up](seeds/SEED-105-land-and-wrap-up-process-retrospective.md#land-and-wrap-up-process-retrospective) — SEED-105#land-and-wrap-up-process-retrospective
- [Review the combined changes of selected story commits](seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits) — SEED-088#review-selected-commits
- [Review only a story's uncommitted changes](seeds/SEED-088-dashboard-story-code-review.md#review-uncommitted-changes) — SEED-088#review-uncommitted-changes
- [Review only a Trunk Mode story's own changes](seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes) — SEED-088#review-trunk-mode-story-changes
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
