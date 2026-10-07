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

- [Recover automatically from temporary GitHub failures](seeds/SEED-118-dashboard-reading-reliability.md#recover-from-temporary-github-failures) — SEED-118#recover-from-temporary-github-failures ([plan](slice-plans/273-temporary-github-recovery/PLAN.md))
- [Show the latest 10 done items and reveal older items on demand](seeds/SEED-119-recently-done-progressive-loading.md#recently-done-progressive-loading) — SEED-119#recently-done-progressive-loading ([plan](slice-plans/274-recently-done-progressive-loading/PLAN.md))
- [Paged dashboard columns reveal by structure and count only what is read](seeds/SEED-106-dashboard-paged-columns.md#paged-columns-reveal-and-count-correction) — SEED-106#paged-columns-reveal-and-count-correction ([plan](slice-plans/259-paged-columns-reveal-and-count-correction/PLAN.md))
- [Reduce repeated GitHub reads across tabs and deployments](seeds/SEED-118-dashboard-reading-reliability.md#reduce-repeated-reads-across-tabs-and-deployments) — SEED-118#reduce-repeated-reads-across-tabs-and-deployments ([plan](slice-plans/275-retained-answers-across-processes/PLAN.md))

## Backlog list

- [Recover a Cursor session after the computer restarts](seeds/SEED-120-cursor-session-restart-recovery.md#cursor-session-restart-recovery) — SEED-120#cursor-session-restart-recovery
- [Observe decisive planning premises through the full promised journey](seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey
- [A session the dashboard launches prepares its checkout as a developer shell would](seeds/SEED-100-project-checks-trustworthy.md#launched-session-development-environment) — SEED-100#launched-session-development-environment
- [Review the combined changes of selected story commits](seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits) — SEED-088#review-selected-commits
- [Review only a story's uncommitted changes](seeds/SEED-088-dashboard-story-code-review.md#review-uncommitted-changes) — SEED-088#review-uncommitted-changes
- [Review only a Trunk Mode story's own changes](seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes) — SEED-088#review-trunk-mode-story-changes
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
