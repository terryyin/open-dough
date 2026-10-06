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

- [Share repeated reads across dashboard observers](seeds/SEED-113-dashboard-github-responsiveness.md#share-repeated-observer-reads) — SEED-113#share-repeated-observer-reads ([plan](slice-plans/261-shared-observer-reads/PLAN.md))
- [Determine whether cancelled dashboard CI failures need repair](seeds/SEED-115-cancelled-dashboard-ci-failures.md#explain-cancelled-ci-failures) — SEED-115#explain-cancelled-ci-failures

## Backlog list

- [Retain actionable diagnostics when a dashboard CI shard times out](seeds/SEED-115-cancelled-dashboard-ci-failures.md#retain-cancelled-ci-evidence) — SEED-115#retain-cancelled-ci-evidence
- [Recover consistently from GitHub rate limits](seeds/SEED-113-dashboard-github-responsiveness.md#recover-consistently-from-rate-limits) — SEED-113#recover-consistently-from-rate-limits
- [Refresh published work without rereading unchanged files](seeds/SEED-113-dashboard-github-responsiveness.md#reuse-unchanged-records-after-publication) — SEED-113#reuse-unchanged-records-after-publication
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
