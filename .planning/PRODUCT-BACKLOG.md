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

- [Separate dashboard development and production environments](seeds/SEED-082-dashboard-development-and-production.md#dashboard-development-and-production) — SEED-082#dashboard-development-and-production ([plan](slice-plans/213-dashboard-development-and-production/PLAN.md))

## Backlog list

- [Reconnect to a Cursor session without interrupting its running task](seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-reconnect-leaves-the-task-running) — SEED-052#cursor-reconnect-leaves-the-task-running
- [Persist dashboard project configuration](seeds/SEED-083-persistent-dashboard-project-configuration.md#persistent-dashboard-project-configuration) — SEED-083#persistent-dashboard-project-configuration
- [See Cursor activity and use its native controls](seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-native-activity-and-controls) — SEED-052#cursor-native-activity-and-controls
- [Capture and visualize beneficial implementation dependencies between stories](seeds/SEED-041-deliberate-implementation-dependencies.md#deliberate-implementation-dependencies) — SEED-041#deliberate-implementation-dependencies
- [Integrate Story Branch closures through an installed command](seeds/SEED-008-worktree-branch-trunk-sync.md#installed-story-branch-integration) — SEED-008#installed-story-branch-integration
- [Announce a deleted session record to screen readers the first time](seeds/SEED-052-start-agent-work-from-dashboard.md#announce-record-deletion-first-time) — SEED-052#announce-record-deletion-first-time
- [Split the session entry and terminal split files along their operations](seeds/SEED-052-start-agent-work-from-dashboard.md#split-session-entry-and-terminal-split) — SEED-052#split-session-entry-and-terminal-split
- [Slice planning states whether it refined and settles every concern it names](seeds/SEED-056-slice-planning-refinement-decision.md#state-refinement-decision) — SEED-056#state-refinement-decision
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
