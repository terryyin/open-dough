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

- [Settle observer ownership at its recovery edges](seeds/SEED-121-execution-observer-ownership.md#settle-observer-owner-edges) — SEED-121#settle-observer-owner-edges ([plan](slice-plans/288-observer-owner-edges/PLAN.md))
- [The full dashboard suite passes three consecutive local runs, fresh and loaded](seeds/SEED-123-dashboard-suite-stable-under-load.md#dashboard-suite-passes-loaded-acceptance) — SEED-123#dashboard-suite-passes-loaded-acceptance ([plan](slice-plans/289-dashboard-suite-passes-loaded-acceptance/PLAN.md))
- [Automatically land completed slice planning when no coordinator question remains](seeds/SEED-128-automatic-preparation-handoffs.md#land-planning-without-coordinator-questions) — SEED-128#land-planning-without-coordinator-questions ([plan](slice-plans/290-land-planning-without-coordinator-questions/PLAN.md))

## Backlog list

- [Land unpublished preparation before starting execution from fresh remote main](seeds/SEED-128-automatic-preparation-handoffs.md#publish-dirty-preparation-before-execution) — SEED-128#publish-dirty-preparation-before-execution
- [Review a Story Branch Mode story's changes after they merge](seeds/SEED-088-dashboard-story-code-review.md#review-merged-story-branch-changes) — SEED-088#review-merged-story-branch-changes
- [Review only a story's uncommitted changes](seeds/SEED-088-dashboard-story-code-review.md#review-uncommitted-changes) — SEED-088#review-uncommitted-changes
- [Review only a Trunk Mode story's own changes](seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes) — SEED-088#review-trunk-mode-story-changes
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
