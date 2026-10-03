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

- [Show story review and terminal in one resizable side panel](seeds/SEED-091-dashboard-ui-renovation.md#review-and-terminal-share-side-panel) — SEED-091#review-and-terminal-share-side-panel ([plan](slice-plans/240-review-terminal-side-panel/PLAN.md))

## Backlog list

- [Align product guidance, shared styles, and tests with the renovated cards](seeds/SEED-091-dashboard-ui-renovation.md#card-renovation-alignment) — SEED-091#card-renovation-alignment
- [Launch-card specs give CI's verdict on a loaded machine](seeds/SEED-093-local-checks-agree-with-ci.md#launch-card-waits-hold-under-load) — SEED-093#launch-card-waits-hold-under-load
- [Review only what changed since the last review](seeds/SEED-088-dashboard-story-code-review.md#review-changes-since-last-review) — SEED-088#review-changes-since-last-review
- [Review the combined changes of selected story commits](seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits) — SEED-088#review-selected-commits
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
