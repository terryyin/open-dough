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

- [Dictate additional instructions when starting a session](seeds/SEED-084-session-instruction-voice-input.md#session-instruction-voice-input) — SEED-084#session-instruction-voice-input ([plan](slice-plans/223-session-instruction-voice-input/PLAN.md))
- [Production nerd avatars](seeds/SEED-090-production-nerd-avatars.md#production-nerd-avatars) — SEED-090#production-nerd-avatars
- [See and instruct a Cursor agent from the start](seeds/SEED-089-cursor-session-visible-from-the-start.md#cursor-session-interactable-from-the-start) — SEED-089#cursor-session-interactable-from-the-start ([plan](slice-plans/227-cursor-agent-visible-from-the-start/PLAN.md))

## Backlog list

- [Prove that a story's landed slices leave its review](seeds/SEED-088-dashboard-story-code-review.md#prove-landed-slices-leave-the-review) — SEED-088#prove-landed-slices-leave-the-review
- [Keep a Cursor agent running across a dashboard restart](seeds/SEED-089-cursor-session-visible-from-the-start.md#cursor-runner-survives-dashboard-restart) — SEED-089#cursor-runner-survives-dashboard-restart
- [Review only what changed since the last review](seeds/SEED-088-dashboard-story-code-review.md#review-changes-since-last-review) — SEED-088#review-changes-since-last-review
- [Review the combined changes of selected story commits](seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits) — SEED-088#review-selected-commits
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
