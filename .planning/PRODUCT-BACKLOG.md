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

- [Monitor CI in the background and wake execution or wrap-up sessions only on failure](seeds/SEED-063-dashboard-owned-ci-monitoring.md#background-ci-failure-delivery) — SEED-063#background-ci-failure-delivery ([plan](slice-plans/299-background-ci-failure-delivery/PLAN.md))
- [Missing published backlog](seeds/SEED-119-clear-missing-backlog-message.md#missing-published-backlog) — SEED-119#missing-published-backlog

## Backlog list

- [A GitHub request or failed log that could not be read says why](seeds/SEED-063-dashboard-owned-ci-monitoring.md#request-owner-says-why) — SEED-063#request-owner-says-why
- [Observe an unattached Start session on the native hosts](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-native-observation) — SEED-066#unattached-session-native-observation
