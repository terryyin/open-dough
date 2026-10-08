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

- [Done catalog stays current through Git integration and failed reads recover on refresh](seeds/SEED-119-recently-done-progressive-loading.md#done-catalog-currency-correction) — SEED-119#done-catalog-currency-correction ([plan](slice-plans/276-done-catalog-currency-correction/PLAN.md))
- [Review the combined changes of selected story commits](seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits) — SEED-088#review-selected-commits ([plan](slice-plans/277-review-selected-commits/PLAN.md))

## Backlog list

- [Show Running Cursor sessions as a resizable sidebar section](seeds/SEED-122-running-cursor-sessions-sidebar-panel.md#running-cursor-sessions-sidebar-panel) — SEED-122#running-cursor-sessions-sidebar-panel
- [Register trunk delivery with its own execution observer](seeds/SEED-121-execution-observer-ownership.md#retain-execution-observer-owner) — SEED-121#retain-execution-observer-owner
- [Recover a Cursor session after the computer restarts](seeds/SEED-120-cursor-session-restart-recovery.md#cursor-session-restart-recovery) — SEED-120#cursor-session-restart-recovery
- [Review a story's merged one-shot change](seeds/SEED-088-dashboard-story-code-review.md#review-merged-one-shot-change) — SEED-088#review-merged-one-shot-change
- [Review a Story Branch Mode story's changes after they merge](seeds/SEED-088-dashboard-story-code-review.md#review-merged-story-branch-changes) — SEED-088#review-merged-story-branch-changes
- [Review only a story's uncommitted changes](seeds/SEED-088-dashboard-story-code-review.md#review-uncommitted-changes) — SEED-088#review-uncommitted-changes
- [Review only a Trunk Mode story's own changes](seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes) — SEED-088#review-trunk-mode-story-changes
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
