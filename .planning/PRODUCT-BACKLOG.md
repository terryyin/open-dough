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

- [Use Cursor for the established dashboard workflows](seeds/SEED-052-start-agent-work-from-dashboard.md#use-cursor-from-dashboard) — SEED-052#use-cursor-from-dashboard ([plan](slice-plans/210-use-cursor-from-dashboard/PLAN.md))
- [Choose Codex model and effort when starting a dashboard session](seeds/SEED-081-codex-session-model-and-effort.md#codex-session-model-and-effort) — SEED-081#codex-session-model-and-effort ([plan](slice-plans/211-codex-session-model-and-effort/PLAN.md))
- [Recheck verifies only what its host can list, and trusts a launch's own record](seeds/SEED-072-responsive-session-start-reconciliation.md#recheck-verification-fidelity) — SEED-072#recheck-verification-fidelity ([plan](slice-plans/212-recheck-verification-fidelity/PLAN.md))

## Backlog list

- [Separate dashboard development and production environments](seeds/SEED-082-dashboard-development-and-production.md#dashboard-development-and-production) — SEED-082#dashboard-development-and-production
- [Persist dashboard project configuration](seeds/SEED-083-persistent-dashboard-project-configuration.md#persistent-dashboard-project-configuration) — SEED-083#persistent-dashboard-project-configuration
- [See Cursor activity and use its native controls](seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-native-activity-and-controls) — SEED-052#cursor-native-activity-and-controls
- [Capture and visualize beneficial implementation dependencies between stories](seeds/SEED-041-deliberate-implementation-dependencies.md#deliberate-implementation-dependencies) — SEED-041#deliberate-implementation-dependencies
- [Integrate Story Branch closures through an installed command](seeds/SEED-008-worktree-branch-trunk-sync.md#installed-story-branch-integration) — SEED-008#installed-story-branch-integration
- [Announce a deleted session record to screen readers the first time](seeds/SEED-052-start-agent-work-from-dashboard.md#announce-record-deletion-first-time) — SEED-052#announce-record-deletion-first-time
- [Split the session entry and terminal split files along their operations](seeds/SEED-052-start-agent-work-from-dashboard.md#split-session-entry-and-terminal-split) — SEED-052#split-session-entry-and-terminal-split
- [Slice planning states whether it refined and settles every concern it names](seeds/SEED-056-slice-planning-refinement-decision.md#state-refinement-decision) — SEED-056#state-refinement-decision
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
