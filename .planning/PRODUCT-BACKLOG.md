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

- [Review only a Trunk Mode story's own changes](seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes) — SEED-088#review-trunk-mode-story-changes ([plan](slice-plans/297-trunk-mode-own-changes-review/PLAN.md))

## Backlog list

- [Leave nothing behind after an unattached start](seeds/SEED-066-composable-lightweight-session-options.md#unattached-start-leftovers) — SEED-066#unattached-start-leftovers
- [Observe an unattached Start session on the native hosts](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-native-observation) — SEED-066#unattached-session-native-observation
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Finish retires the worktree only by a decided rule when CI gave no verdict](seeds/SEED-121-execution-observer-ownership.md#finish-retirement-without-verdict) — SEED-121#finish-retirement-without-verdict
