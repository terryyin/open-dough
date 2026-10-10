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

- [Keep reported gaps owned through the story's remaining slices](seeds/SEED-125-story-gap-acceptance.md#keep-reported-gaps-owned) — SEED-125#keep-reported-gaps-owned ([plan](slice-plans/283-keep-reported-gaps-owned/PLAN.md))
- [The dashboard Playwright suite gives the same result on a loaded developer machine as in CI](seeds/SEED-123-dashboard-suite-stable-under-load.md#dashboard-suite-stable-under-load) — SEED-123#dashboard-suite-stable-under-load ([plan](slice-plans/282-dashboard-suite-stable-under-load/PLAN.md))
- [Keep unchanged dashboard stories steady while story information reloads](seeds/SEED-126-steady-dashboard-refresh.md#steady-dashboard-refresh) — SEED-126#steady-dashboard-refresh ([plan](slice-plans/284-steady-dashboard-refresh/PLAN.md))

## Backlog list

- [Read the opened near-future direction across the full width beneath the project actions](seeds/SEED-127-full-width-near-future-direction.md#full-width-near-future-direction) — SEED-127#full-width-near-future-direction
- [Managed delivery stops a stalled Git transport with a recoverable result](seeds/SEED-008-worktree-branch-trunk-sync.md#bound-managed-git-transport) — SEED-008#bound-managed-git-transport
- [Catch shared fixture signature breaks in the dashboard's local checks](seeds/SEED-124-dashboard-fixture-consumer-checks.md#check-dashboard-fixture-consumers-locally) — SEED-124#check-dashboard-fixture-consumers-locally
- [Show Running Cursor sessions as a resizable sidebar section](seeds/SEED-122-running-cursor-sessions-sidebar-panel.md#running-cursor-sessions-sidebar-panel) — SEED-122#running-cursor-sessions-sidebar-panel
- [Register trunk delivery with its own execution observer](seeds/SEED-121-execution-observer-ownership.md#retain-execution-observer-owner) — SEED-121#retain-execution-observer-owner
- [Review a Story Branch Mode story's changes after they merge](seeds/SEED-088-dashboard-story-code-review.md#review-merged-story-branch-changes) — SEED-088#review-merged-story-branch-changes
- [Review only a story's uncommitted changes](seeds/SEED-088-dashboard-story-code-review.md#review-uncommitted-changes) — SEED-088#review-uncommitted-changes
- [Review only a Trunk Mode story's own changes](seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes) — SEED-088#review-trunk-mode-story-changes
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
