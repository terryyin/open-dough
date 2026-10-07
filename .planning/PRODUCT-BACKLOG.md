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

- [Recover consistently from GitHub rate limits](seeds/SEED-113-dashboard-github-responsiveness.md#recover-consistently-from-rate-limits) — SEED-113#recover-consistently-from-rate-limits ([plan](slice-plans/264-rate-limit-recovery/PLAN.md))
- [Refresh published work without rereading unchanged files](seeds/SEED-113-dashboard-github-responsiveness.md#reuse-unchanged-records-after-publication) — SEED-113#reuse-unchanged-records-after-publication ([plan](slice-plans/266-reuse-unchanged-records-after-publication/PLAN.md))
- [A Claude Code session marked done is renamed without an open terminal](seeds/SEED-116-claude-done-rename.md#claude-done-rename) — SEED-116#claude-done-rename ([plan](slice-plans/267-claude-done-rename/PLAN.md))
- [Retain actionable diagnostics when a dashboard CI shard times out](seeds/SEED-115-cancelled-dashboard-ci-failures.md#retain-cancelled-ci-evidence) — SEED-115#retain-cancelled-ci-evidence ([plan](slice-plans/265-retain-cancelled-ci-evidence/PLAN.md))

## Backlog list

- [Reuse evidence names every path a merge between changed](seeds/SEED-113-dashboard-github-responsiveness.md#reuse-evidence-merge-correction) — SEED-113#reuse-evidence-merge-correction
- [Mark as done removes an exited Claude Code session's job](seeds/SEED-117-finished-sessions-leave-no-blocked-job.md#remove-exited-claude-job) — SEED-117#remove-exited-claude-job
- [The page ends where the shown dashboard columns end](seeds/SEED-106-dashboard-paged-columns.md#paged-columns-height-follows-shown) — SEED-106#paged-columns-height-follows-shown
- [A terminal the developer closed while its session starts stays closed](seeds/SEED-112-terminal-stays-closed-during-startup.md#closed-terminal-stays-closed) — SEED-112#closed-terminal-stays-closed
- [Paged dashboard columns reveal by structure and count only what is read](seeds/SEED-106-dashboard-paged-columns.md#paged-columns-reveal-and-count-correction) — SEED-106#paged-columns-reveal-and-count-correction
- [Observe decisive planning premises through the full promised journey](seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey
- [A session the dashboard launches prepares its checkout as a developer shell would](seeds/SEED-100-project-checks-trustworthy.md#launched-session-development-environment) — SEED-100#launched-session-development-environment
- [Review the combined changes of selected story commits](seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits) — SEED-088#review-selected-commits
- [Review only a story's uncommitted changes](seeds/SEED-088-dashboard-story-code-review.md#review-uncommitted-changes) — SEED-088#review-uncommitted-changes
- [Review only a Trunk Mode story's own changes](seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes) — SEED-088#review-trunk-mode-story-changes
- [Monitor CI from the dashboard and deliver its state to the execution session](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring) — SEED-063#dashboard-owned-ci-monitoring
- [Choose workspace and automatic landing for unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options) — SEED-066#unattached-session-options
