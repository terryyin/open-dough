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

- [Automatic and manual completion use one Mark as done action](seeds/SEED-108-cohesive-session-done.md#cohesive-session-done) — SEED-108#cohesive-session-done
- [Dashboard shows recently done stories with their sessions](seeds/SEED-107-dashboard-recently-done.md#recently-done) — SEED-107#recently-done ([plan](slice-plans/253-dashboard-recently-done/PLAN.md))

## Backlog list

- [Dashboard columns page horizontally instead of wrapping in narrower windows](seeds/SEED-106-dashboard-paged-columns.md#paged-dashboard-columns) — SEED-106#paged-dashboard-columns
- [Four intermittently failing dashboard specs pass deterministically](seeds/SEED-100-project-checks-trustworthy.md#dashboard-specs-deterministic) — SEED-100#dashboard-specs-deterministic
- [Story Branch increments publish only to their execution branch](seeds/SEED-008-worktree-branch-trunk-sync.md#story-branch-delivery-target) — SEED-008#story-branch-delivery-target
- [A session the dashboard launches prepares its checkout as a developer shell would](seeds/SEED-100-project-checks-trustworthy.md#launched-session-development-environment) — SEED-100#launched-session-development-environment
- [Review the combined changes of selected story commits](seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits) — SEED-088#review-selected-commits
- [Review only a story's uncommitted changes](seeds/SEED-088-dashboard-story-code-review.md#review-uncommitted-changes) — SEED-088#review-uncommitted-changes
- [Review only a Trunk Mode story's own changes](seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes) — SEED-088#review-trunk-mode-story-changes
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
