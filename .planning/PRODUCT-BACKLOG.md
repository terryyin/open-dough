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

- [Keep a Cursor agent running across a dashboard restart](seeds/SEED-089-cursor-session-visible-from-the-start.md#cursor-runner-survives-dashboard-restart) — SEED-089#cursor-runner-survives-dashboard-restart ([plan](slice-plans/228-cursor-runner-survives-dashboard-restart/PLAN.md))
- [Prove that a story's landed slices leave its review](seeds/SEED-088-dashboard-story-code-review.md#prove-landed-slices-leave-the-review) — SEED-088#prove-landed-slices-leave-the-review ([plan](slice-plans/228-prove-landed-slices-leave-the-review/PLAN.md))
- [Modernize and streamline the dashboard frame](seeds/SEED-091-dashboard-ui-renovation.md#dashboard-frame-renovation) — SEED-091#dashboard-frame-renovation ([plan](slice-plans/230-dashboard-frame-renovation/PLAN.md))
- [Keep the dashboard tests' recurring race shapes out by construction](seeds/SEED-093-local-checks-agree-with-ci.md#expose-timing-races-locally) — SEED-093#expose-timing-races-locally ([plan](slice-plans/233-dashboard-test-race-shapes/PLAN.md))

## Backlog list

- [Prove a slice through the consumers of what it changes](seeds/SEED-095-slice-proof-through-consumers.md#prove-slices-through-consumers) — SEED-095#prove-slices-through-consumers
- [Run a check from any directory and get CI's result](seeds/SEED-093-local-checks-agree-with-ci.md#checks-run-from-any-directory) — SEED-093#checks-run-from-any-directory
- [Make story cards modern, compact information radiators](seeds/SEED-091-dashboard-ui-renovation.md#story-card-information-radiator) — SEED-091#story-card-information-radiator
- [Review only what changed since the last review](seeds/SEED-088-dashboard-story-code-review.md#review-changes-since-last-review) — SEED-088#review-changes-since-last-review
- [Review the combined changes of selected story commits](seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits) — SEED-088#review-selected-commits
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
