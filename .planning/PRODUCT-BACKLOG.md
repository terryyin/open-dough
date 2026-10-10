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

- [Review a Story Branch Mode story's changes after they merge](seeds/SEED-088-dashboard-story-code-review.md#review-merged-story-branch-changes) — SEED-088#review-merged-story-branch-changes ([plan](slice-plans/292-landed-story-branch-review/PLAN.md))

## Backlog list

- [Finish prefers its coordinator's live observer over an ended one](seeds/SEED-121-execution-observer-ownership.md#finish-prefers-live-observer) — SEED-121#finish-prefers-live-observer
- [Review only a story's uncommitted changes](seeds/SEED-088-dashboard-story-code-review.md#review-uncommitted-changes) — SEED-088#review-uncommitted-changes
- [A Trunk Mode story started outside the dashboard offers Review changes](seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-worktree) — SEED-088#review-trunk-mode-story-worktree
- [Review only a Trunk Mode story's own changes](seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes) — SEED-088#review-trunk-mode-story-changes
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
