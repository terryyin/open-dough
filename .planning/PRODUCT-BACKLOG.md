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

- [Review all story worktree changes in one dashboard UI](seeds/SEED-088-dashboard-story-code-review.md#dashboard-story-code-review) — SEED-088#dashboard-story-code-review ([plan](slice-plans/226-dashboard-story-code-review/PLAN.md))

## Backlog list

- [Modernize and streamline the dashboard frame](seeds/SEED-091-dashboard-ui-renovation.md#dashboard-frame-renovation) — SEED-091#dashboard-frame-renovation
- [Make story cards modern, compact information radiators](seeds/SEED-091-dashboard-ui-renovation.md#story-card-information-radiator) — SEED-091#story-card-information-radiator
- [Choose and persist a theme for all embedded terminals](seeds/SEED-090-dashboard-terminal-theme.md#shared-terminal-theme) — SEED-090#shared-terminal-theme
- [Review only what changed since the last review](seeds/SEED-088-dashboard-story-code-review.md#review-changes-since-last-review) — SEED-088#review-changes-since-last-review
- [Review the combined changes of selected story commits](seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits) — SEED-088#review-selected-commits
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
