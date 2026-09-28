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

- [Accept existing guidance natively on Claude Code](seeds/SEED-053-native-guidance-acceptance.md#native-acceptance-claude-code) — SEED-028#native-one-shot-escalation ([plan](slice-plans/139-native-one-shot-escalation-claude-code/PLAN.md))

## Backlog list

- [Start from owned repository context and refresh truthfully](seeds/SEED-008-worktree-branch-trunk-sync.md#owned-context-start-and-truthful-refresh) — SEED-008#owned-context-start-and-truthful-refresh
- [Finish removing default-checkout coordination](seeds/SEED-008-worktree-branch-trunk-sync.md#finish-removing-checkout-coordination) — SEED-008#finish-removing-checkout-coordination
- [Close stories through an installed wrap-up command](seeds/SEED-008-worktree-branch-trunk-sync.md#installed-wrap-up-command) — SEED-008#installed-wrap-up-command
- [Capture and visualize beneficial implementation dependencies between stories](seeds/SEED-041-deliberate-implementation-dependencies.md#deliberate-implementation-dependencies) — SEED-041#deliberate-implementation-dependencies
- [Accept existing guidance natively on Codex](seeds/SEED-053-native-guidance-acceptance.md#native-acceptance-codex) — SEED-044#native-premise-acceptance-codex-cursor
- [Start agent work from the Open Dough dashboard](seeds/SEED-052-start-agent-work-from-dashboard.md#start-agent-work-from-dashboard) — SEED-052#start-agent-work-from-dashboard
- [Accept existing guidance natively on Cursor](seeds/SEED-053-native-guidance-acceptance.md#native-acceptance-cursor) — SEED-028#native-one-shot-other-hosts
