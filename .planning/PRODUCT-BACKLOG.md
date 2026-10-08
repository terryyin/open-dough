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

- [Reduce repeated GitHub reads across tabs and deployments](seeds/SEED-118-dashboard-reading-reliability.md#reduce-repeated-reads-across-tabs-and-deployments) — SEED-118#reduce-repeated-reads-across-tabs-and-deployments ([plan](slice-plans/275-retained-answers-across-processes/PLAN.md))
- [Observe decisive planning premises through the full promised journey](seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey ([plan](slice-plans/258-observe-promised-journey/PLAN.md))

## Backlog list

- [The dashboard Playwright suite gives the same result on a loaded developer machine as in CI](seeds/SEED-123-dashboard-suite-stable-under-load.md#dashboard-suite-stable-under-load) — SEED-123#dashboard-suite-stable-under-load
- [Backlog Git adapters end edge outcomes in an actionable result](seeds/SEED-119-recently-done-progressive-loading.md#done-catalog-adapter-edge-results-correction) — SEED-119#done-catalog-adapter-edge-results-correction
- [Register trunk delivery with its own execution observer](seeds/SEED-121-execution-observer-ownership.md#retain-execution-observer-owner) — SEED-121#retain-execution-observer-owner
- [Recover a Cursor session after the computer restarts](seeds/SEED-120-cursor-session-restart-recovery.md#cursor-session-restart-recovery) — SEED-120#cursor-session-restart-recovery
- [Review the combined changes of selected story commits](seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits) — SEED-088#review-selected-commits
- [Review only a story's uncommitted changes](seeds/SEED-088-dashboard-story-code-review.md#review-uncommitted-changes) — SEED-088#review-uncommitted-changes
- [Review only a Trunk Mode story's own changes](seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes) — SEED-088#review-trunk-mode-story-changes
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
