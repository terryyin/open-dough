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

- [Correct start-eligibility gaps found in review](seeds/SEED-138-computed-execution-readiness.md#correct-start-eligibility-gaps) — SEED-138#correct-start-eligibility-gaps ([plan](slice-plans/312-correct-start-eligibility-gaps/PLAN.md))

## Backlog list

- [Bound each dashboard test after its event and place page-less specs at the boundary](seeds/SEED-136-dashboard-test-efficiency.md#dashboard-test-bounds-and-placement) — SEED-136#dashboard-test-bounds-and-placement
- [Restore GitHub Actions CI feedback to under three minutes](seeds/SEED-136-dashboard-test-efficiency.md#restore-ci-under-three-minutes) — SEED-136#restore-ci-under-three-minutes
