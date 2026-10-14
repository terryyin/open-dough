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

- [Recover retained CI coverage for registered revisions](seeds/SEED-008-worktree-branch-trunk-sync.md#registered-ci-history-coverage) — SEED-008#registered-ci-history-coverage
- [Avoid duplicate CI when main receives an already validated commit](seeds/SEED-008-worktree-branch-trunk-sync.md#reuse-ci-validation-at-integration) — SEED-008#reuse-ci-validation-at-integration ([plan](slice-plans/306-reuse-ci-validation-at-integration/PLAN.md))

## Backlog list

