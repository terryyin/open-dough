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

- [Accept existing guidance natively on Codex](seeds/SEED-053-native-guidance-acceptance.md#native-acceptance-codex) — SEED-044#native-premise-acceptance-codex-cursor ([plan](slice-plans/141-codex-native-guidance-acceptance/PLAN.md))

## Backlog list

- [Keep planned local verification proportionate to the change](seeds/SEED-053-native-guidance-acceptance.md#proportionate-local-verification) — SEED-053#proportionate-local-verification
- [Finish removing default-checkout coordination](seeds/SEED-008-worktree-branch-trunk-sync.md#finish-removing-checkout-coordination) — SEED-008#finish-removing-checkout-coordination
- [Close stories through an installed wrap-up command](seeds/SEED-008-worktree-branch-trunk-sync.md#installed-wrap-up-command) — SEED-008#installed-wrap-up-command
- [Capture and visualize beneficial implementation dependencies between stories](seeds/SEED-041-deliberate-implementation-dependencies.md#deliberate-implementation-dependencies) — SEED-041#deliberate-implementation-dependencies
- [Start agent work from the Open Dough dashboard](seeds/SEED-052-start-agent-work-from-dashboard.md#start-agent-work-from-dashboard) — SEED-052#start-agent-work-from-dashboard
- [Accept existing guidance natively on Cursor](seeds/SEED-053-native-guidance-acceptance.md#native-acceptance-cursor) — SEED-028#native-one-shot-other-hosts
