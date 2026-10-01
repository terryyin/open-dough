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

- [Align one-shot callers and starts with the review default](seeds/SEED-066-composable-lightweight-session-options.md#align-one-shot-callers-with-review-default) — SEED-066#align-one-shot-callers-with-review-default ([plan](slice-plans/196-align-one-shot-callers-with-review-default/PLAN.md))
- [Control the dashboard session panel from its header](seeds/SEED-071-session-panel-header-controls.md#session-panel-header-controls) — SEED-071#session-panel-header-controls ([plan](slice-plans/197-session-panel-header-controls/PLAN.md))
- [Investigate Codex terminal attachment failure](seeds/SEED-073-investigate-codex-terminal-attachment.md#investigate-codex-terminal-attachment) — SEED-073#investigate-codex-terminal-attachment
- [Re-optimize CI feedback and test wall time after concurrent story branches land](seeds/SEED-070-reoptimize-ci-test-wall-time.md#reoptimize-ci-test-wall-time) — SEED-070#reoptimize-ci-test-wall-time ([plan](slice-plans/198-reoptimize-ci-test-wall-time/PLAN.md))
- [Keep the dashboard responsive while session startup settles](seeds/SEED-072-responsive-session-start-reconciliation.md#responsive-session-start-reconciliation) — SEED-072#responsive-session-start-reconciliation ([plan](slice-plans/192-responsive-session-start-reconciliation/PLAN.md))
- [Check how Dough Land handles a kept one-shot result whose story was taken](seeds/SEED-066-composable-lightweight-session-options.md#dough-land-kept-one-shot-ownership) — SEED-066#dough-land-kept-one-shot-ownership ([plan](slice-plans/199-dough-land-kept-one-shot-ownership/PLAN.md))
- [Review dashboard architecture before adding more AI IDE tools](seeds/SEED-069-review-dashboard-multi-tool-architecture.md#review-dashboard-multi-tool-architecture) — SEED-069#review-dashboard-multi-tool-architecture ([plan](slice-plans/200-review-dashboard-multi-tool-architecture/PLAN.md))

## Backlog list

- [Use Cursor for the established dashboard workflows](seeds/SEED-052-start-agent-work-from-dashboard.md#use-cursor-from-dashboard) — SEED-052#use-cursor-from-dashboard
- [Capture and visualize beneficial implementation dependencies between stories](seeds/SEED-041-deliberate-implementation-dependencies.md#deliberate-implementation-dependencies) — SEED-041#deliberate-implementation-dependencies
- [Integrate Story Branch closures through an installed command](seeds/SEED-008-worktree-branch-trunk-sync.md#installed-story-branch-integration) — SEED-008#installed-story-branch-integration
- [Announce a deleted session record to screen readers the first time](seeds/SEED-052-start-agent-work-from-dashboard.md#announce-record-deletion-first-time) — SEED-052#announce-record-deletion-first-time
- [Split the session entry and terminal split files along their operations](seeds/SEED-052-start-agent-work-from-dashboard.md#split-session-entry-and-terminal-split) — SEED-052#split-session-entry-and-terminal-split
- [Slice planning states whether it refined and settles every concern it names](seeds/SEED-056-slice-planning-refinement-decision.md#state-refinement-decision) — SEED-056#state-refinement-decision
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
