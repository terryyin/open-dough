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
- [Prove affected indirect consumers before accepting a slice](seeds/SEED-132-acceptance-follows-reachable-behavior.md#prove-indirect-consumers-before-acceptance) — SEED-132#prove-indirect-consumers-before-acceptance ([plan](slice-plans/304-prove-indirect-consumers/PLAN.md))

## Backlog list

- [Read a dashboard proof selection without rerunning it or weakening its verdict](seeds/SEED-131-repository-test-feedback.md#retain-strict-proof-selection) — SEED-131#retain-strict-proof-selection
- [Observe an unattached Start session on the native hosts](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-native-observation) — SEED-066#unattached-session-native-observation
- [Use the dashboard from an iPad or iPhone browser without compromising desktop operation](seeds/SEED-133-mobile-dashboard.md#operate-dashboard-from-mobile-browser) — SEED-133#operate-dashboard-from-mobile-browser
