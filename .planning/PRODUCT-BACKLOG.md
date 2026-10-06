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

- [Dashboard columns page horizontally instead of wrapping in narrower windows](seeds/SEED-106-dashboard-paged-columns.md#paged-dashboard-columns) — SEED-106#paged-dashboard-columns ([plan](slice-plans/225-paged-dashboard-columns/PLAN.md))
- [Retained sessions show who was assigned when they launched](seeds/SEED-109-retained-session-attribution.md#retained-session-attribution) — SEED-109#retained-session-attribution
- [Completed Claude sessions remain readable after their workspace is retired](seeds/SEED-110-retired-claude-session-access.md#retired-claude-session-access) — SEED-110#retired-claude-session-access

## Backlog list

- [Recently done reads beside owners, keeps the session look, and closes completely](seeds/SEED-107-dashboard-recently-done.md#recently-done-correction) — SEED-107#recently-done-correction
- [Story Branch increments publish only to their execution branch](seeds/SEED-008-worktree-branch-trunk-sync.md#story-branch-delivery-target) — SEED-008#story-branch-delivery-target
- [A session the dashboard launches prepares its checkout as a developer shell would](seeds/SEED-100-project-checks-trustworthy.md#launched-session-development-environment) — SEED-100#launched-session-development-environment
- [Review the combined changes of selected story commits](seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits) — SEED-088#review-selected-commits
- [Review only a story's uncommitted changes](seeds/SEED-088-dashboard-story-code-review.md#review-uncommitted-changes) — SEED-088#review-uncommitted-changes
- [Review only a Trunk Mode story's own changes](seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes) — SEED-088#review-trunk-mode-story-changes
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
