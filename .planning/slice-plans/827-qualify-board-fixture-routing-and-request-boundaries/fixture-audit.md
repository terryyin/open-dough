# Board fixture ref audit

On `9dc3e801e`, the [diagnostic patch](ref-audit.patch.b64) logged the
registered answerer and the first served HOME for successful fake REST
ref responses whose advertised pin differed from `git ls-remote`.
Each listed file had at least one observation. Counts across
entry points overlap when a spec used several publishers. The check
runs after the REST answer is produced, so a move, a different HOME,
or a REST ref used by scheduled fallback needs inspection before
assigning an actual Board migration. The diagnostic only allows file
transport. Held, failed, or otherwise unsuccessful ref answers are
outside this inventory.

Run with `DOUGH_REF_AUDIT` naming a writable JSONL path. Commands:

```sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES DOUGH_REF_AUDIT=/tmp/board-e2e.jsonl caffeinate -s -i npm run test:e2e -- --workers=3 --reporter=dot
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES DOUGH_REF_AUDIT=/tmp/board-backend.jsonl caffeinate -s -i npm run test:dashboard:backend -- --workers=2 --reporter=dot
```

- E2E Test passed **780** cases in 9.9 minutes. The audit recorded **543** mismatch events in **149** files.
- Dashboard Backend Test recorded **94** mismatch events in **26** files. Playwright passed 1,133 cases, failed 2 path-sensitive cases and skipped 1. Five serial cases did not run. All 856 Vitest cases passed. Both affected runtime files passed with a physical dependency directory (8 cases), including the five serial cases.

Use a physical dependency directory when reproducing the backend gate.
The audited worktree used a symlink. The runtime assertions compare
Node’s resolved module path with the configured literal path. A focused
recheck with a physical directory recovered those cases.

The fixed (done plan 824, `548a3814652df8782da71457ac3acffd973a2f08`),
[moving](../826-publish-moving-board-fixtures-through-git/PLAN.md) and
[routing and request-boundary](PLAN.md) plans assign the families.
Plan 827 owns the final backend and E2E qualification and removing
the patch and this inventory once its evidence is spent.

## E2E Test

### dashboard/test-support/publishedMovingOrigin.ts (51)

- `e2e/launches/feedback-maintenance-due-row.spec.ts`
- `e2e/launches/feedback-maintenance-launch-held.spec.ts`
- `e2e/launches/feedback-maintenance-launch.spec.ts`
- `e2e/navigation/story-url-history.spec.ts`
- `e2e/observation/auto-refresh-detail-recovery.spec.ts`
- `e2e/observation/auto-refresh-project-isolation.spec.ts`
- `e2e/observation/auto-refresh-rate-limit.spec.ts`
- `e2e/observation/auto-refresh-recovery.spec.ts`
- `e2e/observation/auto-refresh-visibility.spec.ts`
- `e2e/observation/auto-refresh.spec.ts`
- `e2e/observation/project-read-isolation.spec.ts`
- `e2e/observation/project-read-recovery.spec.ts`
- `e2e/observation/published-facts-isolation.spec.ts`
- `e2e/observation/read-failure.spec.ts`
- `e2e/observation/revision-check-return.spec.ts`
- `e2e/observation/revision-stream-lost.spec.ts`
- `e2e/observation/revision-stream-return.spec.ts`
- `e2e/observation/revision-stream-stopped.spec.ts`
- `e2e/observation/revision-stream-visibility.spec.ts`
- `e2e/observation/revision-stream.spec.ts`
- `e2e/observation/shared-observer-check-reuse.spec.ts`
- `e2e/observation/steady-refresh-bound.spec.ts`
- `e2e/observation/steady-refresh-carry.spec.ts`
- `e2e/observation/steady-refresh-inspection.spec.ts`
- `e2e/observation/steady-refresh.spec.ts`
- `e2e/observation/transient-read-exclusions.spec.ts`
- `e2e/observation/transient-read-recovery.spec.ts`
- `e2e/observation/transient-recovery-currentness.spec.ts`
- `e2e/observation/transient-recovery-lifecycle.spec.ts`
- `e2e/sessions/agent-launch-attention-taken.spec.ts`
- `e2e/sessions/agent-launch-recent-sessions.spec.ts`
- `e2e/sessions/agent-launch-story-card-session-states.spec.ts`
- `e2e/sessions/cursor-sessions-sidebar-navigation.spec.ts`
- `e2e/sessions/cursor-sessions-sidebar-resize-lasting.spec.ts`
- `e2e/sessions/cursor-sessions-sidebar-size-kept.spec.ts`
- `e2e/sessions/recently-done-sessions-sidebar-navigation.spec.ts`
- `e2e/sessions/recently-done-sessions-sidebar-reopen.spec.ts`
- `e2e/sessions/session-alerts-navigation.spec.ts`
- `e2e/sessions/session-workspace-retirement.spec.ts`
- `e2e/sessions/sessions-sidebar-navigation-cases.spec.ts`
- `e2e/sessions/sessions-sidebar-navigation.spec.ts`
- `e2e/sessions/sessions-sidebar-stays-as-left.spec.ts`
- `e2e/sessions/sessions-sidebar-touch.spec.ts`
- `e2e/sessions/sessions-sidebar.spec.ts`
- `e2e/stories/direction-disclosure.spec.ts`
- `e2e/stories/preparation-legend.spec.ts`
- `e2e/stories/recently-done-progressive-navigation-cursor.spec.ts`
- `e2e/stories/recently-done-progressive-navigation.spec.ts`
- `e2e/stories/recently-done-progressive-reset.spec.ts`
- `e2e/terminals/agent-terminal-codex-page.spec.ts`
- `e2e/terminals/agent-terminal-lifetime.spec.ts`

### publishMovingFiles (27)

- `e2e/intent/intent-ci-measure-history.spec.ts`
- `e2e/intent/intent-ci-prior-build-states.spec.ts`
- `e2e/intent/intent-ci-proof-adapter.spec.ts`
- `e2e/intent/intent-ci-proof-ancestor.spec.ts`
- `e2e/intent/intent-ci-proof-legacy-results.spec.ts`
- `e2e/intent/intent-ci-proof-reasons.spec.ts`
- `e2e/intent/intent-ci-proof-sources.spec.ts`
- `e2e/intent/intent-ci-proof-units.spec.ts`
- `e2e/intent/intent-ci-status-reads.spec.ts`
- `e2e/intent/intent-ci-status-story-gaps.spec.ts`
- `e2e/intent/intent-ci-status-story.spec.ts`
- `e2e/intent/intent-ci-status-wall-time.spec.ts`
- `e2e/intent/intent-ci-status.spec.ts`
- `e2e/intent/intent-file-purpose-proof.spec.ts`
- `e2e/intent/intent-project-visit-ci.spec.ts`
- `e2e/intent/intent-summary-ci-proof.spec.ts`
- `e2e/observation/auto-refresh-branches.spec.ts`
- `e2e/observation/auto-refresh-unusable-branch.spec.ts`
- `e2e/observation/reopened-project-reads.spec.ts`
- `e2e/observation/revision-stream-stopped.spec.ts`
- `e2e/observation/steady-refresh-inspection.spec.ts`
- `e2e/observation/story-cards-before-comparison.spec.ts`
- `e2e/observation/unchanged-assignment-credit.spec.ts`
- `e2e/observation/unchanged-records-refresh.spec.ts`
- `e2e/sessions/recently-done-returned-sessions.spec.ts`
- `e2e/stories/agent-roster-avatar.spec.ts`
- `e2e/stories/branch-progress-reading.spec.ts`

### publishFiles (21)

- `e2e/intent/intent-code-browse-projects.spec.ts`
- `e2e/intent/intent-code-browse-sources.spec.ts`
- `e2e/intent/intent-code-browse.spec.ts`
- `e2e/intent/intent-gherkin-browse.spec.ts`
- `e2e/intent/intent-gherkin-unusable.spec.ts`
- `e2e/intent/intent-recorded-purpose-read.spec.ts`
- `e2e/navigation/development-intent-history.spec.ts`
- `e2e/observation/authenticated-project-observation.spec.ts`
- `e2e/sessions/recently-done-returned-sessions.spec.ts`
- `e2e/sessions/recently-done-sessions-select-open.spec.ts`
- `e2e/sessions/recently-done-story-sessions-expired.spec.ts`
- `e2e/sessions/session-column-membership.spec.ts`
- `e2e/stories/agent-roster.spec.ts`
- `e2e/stories/branch-slice-progress.spec.ts`
- `e2e/stories/nerds-cartoon-portrait.spec.ts`
- `e2e/stories/recently-done-follow-up.spec.ts`
- `e2e/stories/recently-done-stories.spec.ts`
- `e2e/stories/taken-agent-profile-refresh.spec.ts`
- `e2e/stories/taken-agent-profile.spec.ts`
- `e2e/stories/taken-execution-complete.spec.ts`
- `e2e/stories/taken-slice-clock.spec.ts`

### Inline spec answerer (17)

- `e2e/intent/intent-candidates-read-recovery.spec.ts`
- `e2e/intent/intent-read-boundary-recovery.spec.ts`
- `e2e/navigation/story-reference-catalog-retry.spec.ts`
- `e2e/observation/limit-recovery-check.spec.ts`
- `e2e/observation/limit-recovery-detail.spec.ts`
- `e2e/observation/limit-recovery-tabs.spec.ts`
- `e2e/observation/limited-reading-detail.spec.ts`
- `e2e/observation/owner-replacement-recovery.spec.ts`
- `e2e/observation/profile-addition-latency.spec.ts`
- `e2e/observation/read-turns-across-tabs.spec.ts`
- `e2e/observation/shared-observer-reads.spec.ts`
- `e2e/observation/transient-credit-recovery.spec.ts`
- `e2e/observation/transient-detail-recovery.spec.ts`
- `e2e/observation/transient-recovery-currentness.spec.ts`
- `e2e/observation/transient-recovery-lifecycle.spec.ts`
- `e2e/stories/recently-done-progressive-added-project.spec.ts`
- `e2e/stories/taken-slice-clock.spec.ts`

### dashboard/test-support/committedOrigin.ts (11)

- `e2e/launches/agent-launch-base-ci.spec.ts`
- `e2e/launches/agent-launch-codex-effort.spec.ts`
- `e2e/launches/agent-launch-preparation-codex.spec.ts`
- `e2e/launches/agent-launch-preparation-phases.spec.ts`
- `e2e/launches/agent-launch-start-codex.spec.ts`
- `e2e/launches/agent-launch-start-phases.spec.ts`
- `e2e/launches/agent-launch-start-taken.spec.ts`
- `e2e/launches/responsive-session-reconciliation-completed.spec.ts`
- `e2e/launches/responsive-session-reconciliation.spec.ts`
- `e2e/review/story-review-one-shot.spec.ts`
- `e2e/sessions/agent-completion-attention.spec.ts`

### dashboard/test-support/recentlyDoneProgressivePage.ts (11)

- `e2e/sessions/recently-done-sessions-sidebar-navigation.spec.ts`
- `e2e/sessions/recently-done-sessions-sidebar-paging-board.spec.ts`
- `e2e/stories/recently-done-progressive-after-sessions.spec.ts`
- `e2e/stories/recently-done-progressive-failed-read-refresh.spec.ts`
- `e2e/stories/recently-done-progressive-loading.spec.ts`
- `e2e/stories/recently-done-progressive-navigation-cursor.spec.ts`
- `e2e/stories/recently-done-progressive-navigation-report.spec.ts`
- `e2e/stories/recently-done-progressive-navigation.spec.ts`
- `e2e/stories/recently-done-progressive-refresh.spec.ts`
- `e2e/stories/recently-done-progressive-reset.spec.ts`
- `e2e/stories/recently-done-progressive-state.spec.ts`

### dashboard/test-support/support/projectAddMachine.ts (7)

- `e2e/configuration/project-add.spec.ts`
- `e2e/configuration/project-hide-sessions.spec.ts`
- `e2e/configuration/project-hide.spec.ts`
- `e2e/configuration/project-remove-selection.spec.ts`
- `e2e/configuration/project-remove.spec.ts`
- `e2e/configuration/system-settings-running-session.spec.ts`
- `e2e/sessions/project-restored-session.spec.ts`

### dashboard/test-support/limitedReadingJourney.ts (4)

- `e2e/observation/limited-reading-check.spec.ts`
- `e2e/observation/limited-reading-detail.spec.ts`
- `e2e/observation/limited-reading-membership.spec.ts`
- `e2e/observation/limited-reading-profile-history.spec.ts`

### dashboard/test-support/publishedFactsArrival.ts (4)

- `e2e/observation/published-facts-arrival.spec.ts`
- `e2e/observation/published-facts-failures.spec.ts`
- `e2e/observation/published-facts-reading.spec.ts`
- `e2e/observation/transient-detail-recovery.spec.ts`

### dashboard/test-support/publishedOrigin.ts (3)

- `e2e/observation/read-failure.spec.ts`
- `e2e/observation/transient-read-exclusions.spec.ts`
- `e2e/stories/published-work.spec.ts`

### dashboard/test-support/agentRosterRecords.ts (2)

- `e2e/stories/agent-roster-avatar.spec.ts`
- `e2e/stories/agent-roster.spec.ts`

### dashboard/test-support/limitRecoveryCredit.ts (2)

- `e2e/observation/limit-recovery-credit-commit.spec.ts`
- `e2e/observation/limit-recovery-credit-history.spec.ts`

### dashboard/test-support/support/projectConfigurationMachine.ts (2)

- `e2e/configuration/project-configuration.spec.ts`
- `e2e/configuration/system-settings-client-configuration.spec.ts`

### dashboard/test-support/publishedFactsIsolation.ts (1)

- `e2e/observation/published-facts-isolation.spec.ts`

### dashboard/test-support/recentlyDoneReadLatencyFixture.ts (1)

- `e2e/stories/recently-done-read-latency.spec.ts`

### dashboard/test-support/retainedAnswersJourney.ts (1)

- `e2e/observation/authenticated-read-retained-answers-reload.spec.ts`

### dashboard/test-support/support/dashboardServer.ts (1)

- `e2e/configuration/system-settings-terminal-theme.spec.ts`

## Dashboard Backend Test

### Inline spec answerer (10)

- `dashboard/backend-tests/observation/authenticated-branch-read-boundary.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-committed-last.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-diagnostics-bounds.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-incident-record.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-output-bound.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-revision-backlog.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-revision-reuse-bounds.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-revision-stream.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-shared-listing-failures.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-turns.spec.ts`

### dashboard/backend-tests/observation/revisionReuseBoundary.ts (5)

- `dashboard/backend-tests/observation/authenticated-read-revision-reuse-bounds.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-revision-reuse-compared.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-revision-reuse-failures.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-revision-reuse-history.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-revision-reuse.spec.ts`

### dashboard/test-support/publishedMovingOrigin.ts (5)

- `dashboard/backend-tests/launches/agent-launch-ad-hoc-codex-input.spec.ts`
- `dashboard/backend-tests/launches/feedback-maintenance-launch.spec.ts`
- `dashboard/backend-tests/launches/feedbackMaintenanceLaunchEligibilityCases.ts`
- `dashboard/backend-tests/runtime/first-open-waits-for-read.spec.ts`
- `dashboard/backend-tests/runtime/settled-page.spec.ts`

### dashboard/test-support/retainedAnswersJourney.ts (3)

- `dashboard/backend-tests/observation/authenticated-read-retained-answers-bounded.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-retained-answers-moved.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-retained-answers.spec.ts`

### dashboard/backend-tests/observation/revisionCheckBoundary.ts (2)

- `dashboard/backend-tests/observation/authenticated-read-output-bound.spec.ts`
- `dashboard/backend-tests/observation/authenticated-read-revision-check-failures.spec.ts`

### dashboard/test-support/committedOrigin.ts (1)

- `dashboard/backend-tests/runtime/committed-origin-actions.spec.ts`

### dashboard/test-support/publishedOrigin.ts (1)

- `dashboard/backend-tests/runtime/first-open-waits-for-read.spec.ts`

### dashboard/test-support/support/sharedReads.ts (1)

- `dashboard/backend-tests/observation/authenticated-read-shared.spec.ts`

### dashboard/test-support/support/sharedRequestOwner.ts (1)

- `dashboard/backend-tests/runtime/fake-gh-in-process-scopes.spec.ts`
