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

- [Keep CI checks independent of package mirror stalls](seeds/SEED-077-ci-independent-of-package-mirror-stalls.md#ci-independent-of-package-mirror-stalls) — SEED-077#ci-independent-of-package-mirror-stalls ([plan](slice-plans/207-stable-native-check-prerequisites/PLAN.md))

## Backlog list

- [Show changes since readiness review without blocking execution](seeds/SEED-080-readiness-change-indicator.md#readiness-change-indicator) — SEED-080#readiness-change-indicator
- [Startup recovery advice comes from the host description](seeds/SEED-075-host-neutral-dashboard-before-cursor.md#startup-advice-from-host-description) — SEED-075#startup-advice-from-host-description
- [Keep reconciled startups settled under one unresolved-attempt rule](seeds/SEED-072-responsive-session-start-reconciliation.md#durable-startup-reconciliation) — SEED-072#durable-startup-reconciliation
- [Use Cursor for the established dashboard workflows](seeds/SEED-052-start-agent-work-from-dashboard.md#use-cursor-from-dashboard) — SEED-052#use-cursor-from-dashboard
- [Capture and visualize beneficial implementation dependencies between stories](seeds/SEED-041-deliberate-implementation-dependencies.md#deliberate-implementation-dependencies) — SEED-041#deliberate-implementation-dependencies
- [Integrate Story Branch closures through an installed command](seeds/SEED-008-worktree-branch-trunk-sync.md#installed-story-branch-integration) — SEED-008#installed-story-branch-integration
- [Announce a deleted session record to screen readers the first time](seeds/SEED-052-start-agent-work-from-dashboard.md#announce-record-deletion-first-time) — SEED-052#announce-record-deletion-first-time
- [Split the session entry and terminal split files along their operations](seeds/SEED-052-start-agent-work-from-dashboard.md#split-session-entry-and-terminal-split) — SEED-052#split-session-entry-and-terminal-split
- [Slice planning states whether it refined and settles every concern it names](seeds/SEED-056-slice-planning-refinement-decision.md#state-refinement-decision) — SEED-056#state-refinement-decision
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
