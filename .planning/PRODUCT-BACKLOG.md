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

- [Land unfinished story changes without retiring their execution workspace](seeds/SEED-008-worktree-branch-trunk-sync.md#land-unfinished-stories-without-retirement) — SEED-008#land-unfinished-stories-without-retirement ([plan](slice-plans/314-land-unfinished-stories-without-retirement/PLAN.md))
- [Review every completed story](seeds/SEED-139-completed-story-review.md#review-completed-stories) — SEED-139#review-completed-stories
- [Bound each dashboard test after its event and place page-less specs at the boundary](seeds/SEED-136-dashboard-test-efficiency.md#dashboard-test-bounds-and-placement) — SEED-136#dashboard-test-bounds-and-placement ([plan](slice-plans/313-dashboard-test-bounds-and-placement/PLAN.md))

## Backlog list

- [Restore GitHub Actions CI feedback to under three minutes](seeds/SEED-136-dashboard-test-efficiency.md#restore-ci-under-three-minutes) — SEED-136#restore-ci-under-three-minutes
