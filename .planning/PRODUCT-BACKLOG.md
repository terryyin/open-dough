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

- [Complete dashboard sessions quietly and retain messages needing attention](seeds/SEED-008-worktree-branch-trunk-sync.md#installed-story-branch-integration) — SEED-008#installed-story-branch-integration ([plan](slice-plans/220-quiet-dashboard-session-completion/PLAN.md))
- [Dictate additional instructions when starting a session](seeds/SEED-084-session-instruction-voice-input.md#session-instruction-voice-input) — SEED-084#session-instruction-voice-input ([plan](slice-plans/223-session-instruction-voice-input/PLAN.md))

## Backlog list

- [See and instruct a Cursor agent from the start](seeds/SEED-089-cursor-session-visible-from-the-start.md#cursor-session-interactable-from-the-start) — SEED-089#cursor-session-interactable-from-the-start
- [Keep a Cursor agent running across a dashboard restart](seeds/SEED-089-cursor-session-visible-from-the-start.md#cursor-runner-survives-dashboard-restart) — SEED-089#cursor-runner-survives-dashboard-restart
- [Remove installed files that a newer release no longer declares](seeds/SEED-001-install-and-update-open-dough.md#remove-files-a-release-dropped) — SEED-001#remove-files-a-release-dropped
- [Review all story worktree changes in one dashboard UI](seeds/SEED-088-dashboard-story-code-review.md#dashboard-story-code-review) — SEED-088#dashboard-story-code-review
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
