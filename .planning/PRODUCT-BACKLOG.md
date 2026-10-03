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

- [Reconnect to a Cursor session without interrupting its running task](seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-reconnect-leaves-the-task-running) — SEED-052#cursor-reconnect-leaves-the-task-running ([plan](slice-plans/218-cursor-turn-survives-detach-and-reconnect/PLAN.md))
- [Complete dashboard sessions quietly and retain messages needing attention](seeds/SEED-008-worktree-branch-trunk-sync.md#installed-story-branch-integration) — SEED-008#installed-story-branch-integration ([plan](slice-plans/220-quiet-dashboard-session-completion/PLAN.md))

## Backlog list

- [Prevent a second refinement or execution session for an active story](seeds/SEED-052-start-agent-work-from-dashboard.md#one-active-story-session) — SEED-052#one-active-story-session
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
