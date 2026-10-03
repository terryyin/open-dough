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

- [Prove a slice through the consumers of what it changes](seeds/SEED-095-slice-proof-through-consumers.md#prove-slices-through-consumers) — SEED-095#prove-slices-through-consumers ([plan](slice-plans/237-prove-slices-through-consumers/PLAN.md))
- [Type the story into Cursor's empty chat](seeds/SEED-096-cursor-empty-chat-prompt.md#cursor-empty-chat-receives-instruction) — SEED-096#cursor-empty-chat-receives-instruction

## Backlog list

- [Align product guidance, shared styles, and tests with the renovated cards](seeds/SEED-091-dashboard-ui-renovation.md#card-renovation-alignment) — SEED-091#card-renovation-alignment
- [Acknowledge a session report without ending the session's state](seeds/SEED-052-start-agent-work-from-dashboard.md#mark-report-read-keeps-session-state) — SEED-052#mark-report-read-keeps-session-state
- [Run a check from any directory and get CI's result](seeds/SEED-093-local-checks-agree-with-ci.md#checks-run-from-any-directory) — SEED-093#checks-run-from-any-directory
- [Show story review and terminal in one resizable side panel](seeds/SEED-091-dashboard-ui-renovation.md#review-and-terminal-share-side-panel) — SEED-091#review-and-terminal-share-side-panel
- [Review only what changed since the last review](seeds/SEED-088-dashboard-story-code-review.md#review-changes-since-last-review) — SEED-088#review-changes-since-last-review
- [Review the combined changes of selected story commits](seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits) — SEED-088#review-selected-commits
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
