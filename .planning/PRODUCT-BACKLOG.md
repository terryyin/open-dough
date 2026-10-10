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

- [The full dashboard suite passes three consecutive local runs, fresh and loaded](seeds/SEED-123-dashboard-suite-stable-under-load.md#dashboard-suite-passes-loaded-acceptance) — SEED-123#dashboard-suite-passes-loaded-acceptance ([plan](slice-plans/289-dashboard-suite-passes-loaded-acceptance/PLAN.md))
- [Land unpublished preparation before starting execution from fresh remote main](seeds/SEED-128-automatic-preparation-handoffs.md#publish-dirty-preparation-before-execution) — SEED-128#publish-dirty-preparation-before-execution ([plan](slice-plans/291-execution-handoff-in-preparation-worktree/PLAN.md))
- [Recovery holds after a path is reused and after finish reruns](seeds/SEED-121-execution-observer-ownership.md#recovery-holds-after-reuse-and-rerun) — SEED-121#recovery-holds-after-reuse-and-rerun ([plan](slice-plans/292-recovery-holds-after-reuse-and-rerun/PLAN.md))
- [Review a Story Branch Mode story's changes after they merge](seeds/SEED-088-dashboard-story-code-review.md#review-merged-story-branch-changes) — SEED-088#review-merged-story-branch-changes ([plan](slice-plans/292-landed-story-branch-review/PLAN.md))

## Backlog list

- [A conflicted Story Branch integration still records its landing](seeds/SEED-088-dashboard-story-code-review.md#landing-capture-after-integration-conflict) — SEED-088#landing-capture-after-integration-conflict
- [Review only a story's uncommitted changes](seeds/SEED-088-dashboard-story-code-review.md#review-uncommitted-changes) — SEED-088#review-uncommitted-changes
- [Review only a Trunk Mode story's own changes](seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes) — SEED-088#review-trunk-mode-story-changes
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
