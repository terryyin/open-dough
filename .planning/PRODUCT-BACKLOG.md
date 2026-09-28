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

- [Start from owned repository context and refresh truthfully](seeds/SEED-008-worktree-branch-trunk-sync.md#owned-context-start-and-truthful-refresh) — SEED-008#owned-context-start-and-truthful-refresh ([plan](slice-plans/142-owned-context-start-and-refresh/PLAN.md))
- [Launch execution in a Claude Code background session](seeds/SEED-052-start-agent-work-from-dashboard.md#launch-claude-planned-execution) — SEED-052#launch-claude-planned-execution ([plan](slice-plans/144-launch-claude-execution/PLAN.md))
- [Start queued work whose backlog link percent-encodes its path](seeds/SEED-008-worktree-branch-trunk-sync.md#percent-encoded-home-links) — SEED-008#percent-encoded-home-links

## Backlog list

- [Finish removing default-checkout coordination](seeds/SEED-008-worktree-branch-trunk-sync.md#finish-removing-checkout-coordination) — SEED-008#finish-removing-checkout-coordination
- [Close stories through an installed wrap-up command](seeds/SEED-008-worktree-branch-trunk-sync.md#installed-wrap-up-command) — SEED-008#installed-wrap-up-command
- [Accept existing guidance natively on Codex](seeds/SEED-053-native-guidance-acceptance.md#native-acceptance-codex) — SEED-044#native-premise-acceptance-codex-cursor ([plan](slice-plans/141-codex-native-guidance-acceptance/PLAN.md))
- [Find recent dashboard-launched sessions after leaving the story](seeds/SEED-052-start-agent-work-from-dashboard.md#revisit-dashboard-sessions) — SEED-052#revisit-dashboard-sessions
- [Interact with a launched Claude Code session inside the dashboard](seeds/SEED-052-start-agent-work-from-dashboard.md#interact-with-claude-terminal) — SEED-052#interact-with-claude-terminal
- [Start story refinement and answer its questions in the dashboard](seeds/SEED-052-start-agent-work-from-dashboard.md#launch-claude-refinement) — SEED-052#launch-claude-refinement
- [Start execution with mechanical preparation already handled](seeds/SEED-052-start-agent-work-from-dashboard.md#script-execution-preparation) — SEED-052#script-execution-preparation
- [Start refinement with mechanical preparation already handled](seeds/SEED-052-start-agent-work-from-dashboard.md#script-refinement-preparation) — SEED-052#script-refinement-preparation
- [Use Codex for the established dashboard workflows](seeds/SEED-052-start-agent-work-from-dashboard.md#use-codex-from-dashboard) — SEED-052#use-codex-from-dashboard
- [Use Cursor for the established dashboard workflows](seeds/SEED-052-start-agent-work-from-dashboard.md#use-cursor-from-dashboard) — SEED-052#use-cursor-from-dashboard
- [Capture and visualize beneficial implementation dependencies between stories](seeds/SEED-041-deliberate-implementation-dependencies.md#deliberate-implementation-dependencies) — SEED-041#deliberate-implementation-dependencies
- [Accept existing guidance natively on Cursor](seeds/SEED-053-native-guidance-acceptance.md#native-acceptance-cursor) — SEED-028#native-one-shot-other-hosts
