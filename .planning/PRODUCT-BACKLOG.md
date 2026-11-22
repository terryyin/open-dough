# Product backlog

## Near-future direction

Help developers keep product intent clear, organized, and protected as a story
changes the product. Focus on reviewing how well a newly developed story's
intent has been distilled into maintained high-level automated tests, what
protection those tests provide, and what behavioral and test complexity the
change introduces.

Make a story's intent reviewable in context: test source expresses expected
behavior as Purpose, while CI proof shows observed results and the cost of
running the tests. Help developers decide what intent or proof to clarify,
strengthen, simplify, or retain.

Discover and validate explainable ways to assess intent protection and
complexity, including AI-assisted judgment. Treat conventional code coverage as
supporting evidence. Judge success by whether these reviews help maintain
understandable intent and worthwhile protection at justified cost, including
the cost of the review itself, following the
[definition of improvement](../docs/adrs/0010-definition-of-improvement-accepted.md).

Use the [product intent review memorandum](../docs/product-intent-review-memorandum.md)
for the starting assessment criteria and longer-term direction. Domain models,
static types, written specifications, and assessment of whole-product intent
protection are later extensions; the immediate focus is automated tests and the
intent introduced or affected by a newly developed story.

## Taken

- [Disclose shared-checkout overlap in published session records](seeds/SEED-418-review-published-session-changes.md#disclose-shared-checkout-overlap) — SEED-418#disclose-shared-checkout-overlap ([plan](slice-plans/766-disclose-shared-checkout-overlap/PLAN.md))
- [Get fast proof of Intent CI status on the real page and of timing history](seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-ci-status-frame-and-timing-history) — SEED-413#speed-intent-ci-status-frame-and-timing-history ([plan](slice-plans/764-speed-intent-ci-status-frame-and-timing-history/PLAN.md))

## Backlog list

- [Keep the expired-record prune when a record commit is retried](seeds/SEED-418-review-published-session-changes.md#prune-expired-records-after-a-retried-record-commit) — SEED-418#prune-expired-records-after-a-retried-record-commit
- [Repair the intermittent tap hang in the refinement touch proof](seeds/SEED-413-renovate-dashboard-unit-tests.md#repair-refinement-touch-tap-hang) — SEED-413#repair-refinement-touch-tap-hang
- [Get launch unit proof in about eight seconds](seeds/SEED-413-renovate-dashboard-unit-tests.md#make-launch-proof-orthogonal) — SEED-413#make-launch-proof-orthogonal
- [Correct stale token totals for completed Dashboard tasks](seeds/SEED-422-correct-stale-dashboard-token-totals.md#correct-stale-token-totals) — SEED-422#correct-stale-token-totals
- [Open Review changes on a Story card in Intent](seeds/SEED-420-unified-intent-review.md#route-review-changes-to-intent) — SEED-420#route-review-changes-to-intent
- [Get fast proof of Intent source browsing, pinned links and detours](seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-browsing-and-detours) — SEED-413#speed-intent-source-browsing-and-detours
- [Get fast proof of story changes, Done references, notes and recorded progress](seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-story-changes-notes-and-progress-reading) — SEED-413#speed-story-changes-notes-and-progress-reading
- [Get fast proof of Intent attempt and Summary proof](seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-attempt-and-summary-proof) — SEED-413#speed-intent-attempt-and-summary-proof
- [Reopen completed ad hoc work and its follow-ups under one identity](seeds/SEED-420-unified-intent-review.md#review-standalone-done-work) — SEED-420#review-standalone-done-work
- [Compare a story branch with and without incoming trunk changes](seeds/SEED-420-unified-intent-review.md#compare-story-contributions) — SEED-420#compare-story-contributions
- [Read CI proof for the selected comparison](seeds/SEED-420-unified-intent-review.md#read-proof-for-the-comparison) — SEED-420#read-proof-for-the-comparison
- [Bring the Done capture family's cases to 100–200 ms](seeds/SEED-413-renovate-dashboard-unit-tests.md#optimize-done-capture-family-cases) — SEED-413#optimize-done-capture-family-cases
- [Renovate the later dashboard backend unit-test families around typed server handlers](seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families) — SEED-413#renovate-later-dashboard-backend-unit-test-families
- [Get fast proof of finding and reviewing Done sessions](seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-done-session-review-proof) — SEED-413#speed-dashboard-done-session-review-proof
- [Get fast proof of live sessions and terminal work](seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-live-session-and-terminal-proof) — SEED-413#speed-dashboard-live-session-and-terminal-proof
- [Run the entire dashboard frontend unit suite on Vitest](seeds/SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-frontend-runner) — SEED-413#retire-legacy-dashboard-frontend-runner
- [Prove a renamed file's Review diff reads its grammar from the new path](seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-renamed-diff-grammar-from-new-path) — SEED-413#prove-renamed-diff-grammar-from-new-path
- [Choose clear follow-up context](seeds/SEED-415-choose-clear-follow-up-context.md#choose-clear-follow-up-context) — SEED-415#choose-clear-follow-up-context
- [Choose a session in a story’s change review](seeds/SEED-418-review-published-session-changes.md#select-a-story-session-for-review) — SEED-418#select-a-story-session-for-review
- [Finish slices within a bounded working context](seeds/SEED-345-session-token-efficiency.md#finish-slices-within-a-bounded-working-context) — SEED-345#finish-slices-within-a-bounded-working-context
- [Use proportionate refactoring for small test edits](seeds/SEED-345-session-token-efficiency.md#use-proportionate-refactoring-for-small-test-edits) — SEED-345#use-proportionate-refactoring-for-small-test-edits
- [Wait for Codex workers with fewer model wakeups](seeds/SEED-345-session-token-efficiency.md#wait-for-codex-workers-with-fewer-model-wakeups) — SEED-345#wait-for-codex-workers-with-fewer-model-wakeups
- [Observe a tagged installed workflow and read E2E proof in Intent](seeds/SEED-334-product-wide-end-to-end-tests.md#observe-tagged-install-and-read-e2e-proof) — SEED-334#observe-tagged-install-and-read-e2e-proof
- [Explain and repair an empty native admission substitute stream](seeds/SEED-349-native-admission-substitute-empty-stream.md#explain-native-admission-substitute-empty-stream) — SEED-349#explain-native-admission-substitute-empty-stream
- [Continue a ready split story automatically after wrap-up](seeds/SEED-366-continue-split-stories-automatically.md#continue-a-ready-split-story-automatically) — SEED-366#continue-a-ready-split-story-automatically
- [Put story actions in the comment toolbar](seeds/SEED-416-put-story-actions-in-the-comment-toolbar.md#put-story-actions-in-the-comment-toolbar) — SEED-416#put-story-actions-in-the-comment-toolbar
- [Choose the whole project or a recent story from the bookmark](seeds/SEED-420-unified-intent-review.md#choose-review-scope) — SEED-420#choose-review-scope
- [Review the combined changes of selected sessions](seeds/SEED-418-review-published-session-changes.md#review-selected-sessions-together) — SEED-418#review-selected-sessions-together
- [Start Claude Code implementers from a role-sized tool set](seeds/SEED-345-session-token-efficiency.md#start-implementers-from-a-role-sized-tool-set) — SEED-345#start-implementers-from-a-role-sized-tool-set
- [Close the landed CI repeat checks’ coverage gaps](seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps) — SEED-324#close-landed-ci-repeat-check-gaps ([plan](slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md))
- [Use sidebars consistently across the Dashboard](seeds/SEED-417-use-sidebars-consistently-across-the-dashboard.md#use-sidebars-consistently-across-the-dashboard) — SEED-417#use-sidebars-consistently-across-the-dashboard
- [Filter the file browser by Intent and by changes](seeds/SEED-420-unified-intent-review.md#filter-review-files) — SEED-420#filter-review-files
- [Read the whole repository and its CI from Project Intent](seeds/SEED-420-unified-intent-review.md#browse-the-project-at-a-revision) — SEED-420#browse-the-project-at-a-revision
- [Load execution guidance for the current phase](seeds/SEED-345-session-token-efficiency.md#load-execution-guidance-for-the-current-phase) — SEED-345#load-execution-guidance-for-the-current-phase
- [Verify the silent supplier wait in Codex](seeds/SEED-389-verify-silent-supplier-wait.md#verify-silent-supplier-wait-in-use) — SEED-389#verify-silent-supplier-wait-in-use ([plan](slice-plans/692-verify-silent-supplier-wait-in-codex/PLAN.md))
- [Verify the silent supplier wait in Claude Code](seeds/SEED-389-verify-silent-supplier-wait.md#verify-silent-supplier-wait-in-claude-code) — SEED-389#verify-silent-supplier-wait-in-claude-code
- [Start Cursor slices from complete Task briefs](seeds/SEED-345-session-token-efficiency.md#start-cursor-slices-from-complete-task-briefs) — SEED-345#start-cursor-slices-from-complete-task-briefs
- [Wait for required conditions before load-sensitive proof](seeds/SEED-367-bounded-slice-active-time.md#wait-for-a-quiet-machine-before-load-sensitive-proof) — SEED-367#wait-for-a-quiet-machine-before-load-sensitive-proof
- [Simplify the remaining session tests](seeds/SEED-341-simplify-session-tests.md#simplify-remaining-session-tests) — SEED-341#simplify-remaining-session-tests
- [Prefer E2E tests to drive development and optimize the retained suite before completion](seeds/SEED-365-e2e-development-and-test-optimization.md#drive-development-with-e2e-and-optimize-the-suite) — SEED-365#drive-development-with-e2e-and-optimize-the-suite
- [Show GitHub retry on the dashboard](seeds/SEED-336-live-dashboard-status.md#show-github-retry-on-the-dashboard) — SEED-336#show-github-retry-on-the-dashboard
- [Keep review cues current with SSE](seeds/SEED-336-live-dashboard-status.md#keep-review-cues-current-with-sse) — SEED-335#keep-review-cues-current-with-sse
- [See session status change live](seeds/SEED-336-live-dashboard-status.md#stream-session-status) — SEED-336#stream-session-status
- [See CI follow-up status change live](seeds/SEED-336-live-dashboard-status.md#stream-ci-follow-up-status) — SEED-336#stream-ci-follow-up-status
- [See host status while the sidebar is open](seeds/SEED-336-live-dashboard-status.md#stream-host-status) — SEED-336#stream-host-status
- [Read only the history the dashboard needs](seeds/SEED-337-dashboard-history-reads.md#read-only-the-history-the-dashboard-needs) — SEED-337#read-only-the-history-the-dashboard-needs
- [Observe dashboard traffic after optimization](seeds/SEED-338-observe-dashboard-traffic.md#observe-dashboard-traffic-after-optimization) — SEED-338#observe-dashboard-traffic-after-optimization
- [Match touch review titles to what each viewport runs](seeds/SEED-321-match-touch-review-titles-to-viewport-coverage.md#match-touch-review-titles-to-viewport-coverage) — SEED-321#match-touch-review-titles-to-viewport-coverage
- [Declare retained landing and recovery state through MakeMe](seeds/SEED-353-declarative-git-test-state.md#declare-retained-landing-recovery-state) — SEED-353#declare-retained-landing-recovery-state
- [Declare launch and session repository state through MakeMe](seeds/SEED-353-declarative-git-test-state.md#declare-launch-session-repository-state) — SEED-353#declare-launch-session-repository-state
- [Declare runtime and observation repository state through MakeMe](seeds/SEED-353-declarative-git-test-state.md#declare-runtime-observation-repository-state) — SEED-353#declare-runtime-observation-repository-state
- [Keep one browser test group roster](seeds/SEED-334-product-wide-end-to-end-tests.md#keep-one-browser-test-group-roster) — SEED-334#keep-one-browser-test-group-roster
- [Hold landed CI follow-up observations under load](seeds/SEED-319-landed-ci-follow-up-observations-under-load.md#hold-landed-ci-follow-up-observations-under-load) — SEED-319#hold-landed-ci-follow-up-observations-under-load
- [Express launch dialog and startup test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-launch-test-intent-through-page-objects) — SEED-300#express-launch-test-intent-through-page-objects
- [Express settings test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-settings-test-intent-through-page-objects) — SEED-300#express-settings-test-intent-through-page-objects
- [Limit first-layer test cases to ten lines](seeds/SEED-301-limit-first-layer-test-cases-to-ten-lines.md#limit-first-layer-test-cases-to-ten-lines) — SEED-301#limit-first-layer-test-cases-to-ten-lines
- [Run Open Dough tasks in the cloud](seeds/SEED-339-dashboard-cloud-agent-launches.md#run-open-dough-tasks-in-the-cloud) — SEED-339#run-open-dough-tasks-in-the-cloud
- [Back up and restore dashboard data](seeds/SEED-361-dashboard-data-backup.md#back-up-and-restore-dashboard-data) — SEED-361#back-up-and-restore-dashboard-data
- [View token usage for dashboard-launched Cursor tasks](seeds/SEED-360-cursor-task-token-usage.md#view-cursor-task-token-usage) — SEED-360#view-cursor-task-token-usage
- [Remove old dashboard deployments automatically](seeds/SEED-370-remove-old-dashboard-deployments.md#remove-old-dashboard-deployments-automatically) — SEED-370#remove-old-dashboard-deployments-automatically
- [Reorder backlog stories in the dashboard](seeds/SEED-386-reorder-backlog-stories-in-the-dashboard.md#reorder-backlog-stories-in-the-dashboard) — SEED-386#reorder-backlog-stories-in-the-dashboard
- [Name the effort a Claude Code session actually ran with](seeds/SEED-388-measure-and-control-agent-launch-cost.md#name-the-effort-a-session-ran-with) — SEED-388#name-the-effort-a-session-ran-with
- [Richer Done follow-up card cues](seeds/SEED-395-richer-done-follow-up-card-cues.md#richer-done-follow-up-card-cues) — SEED-395#richer-done-follow-up-card-cues
- [Further word-emphasis follow-ups](seeds/SEED-387-deferred-syntax-styling-follow-ups.md#further-word-emphasis-follow-ups) — SEED-387#further-word-emphasis-follow-ups
- [Deferred submit-and-close follow-ups](seeds/SEED-398-deferred-submit-and-close-follow-ups.md#deferred-submit-and-close-follow-ups) — SEED-398#deferred-submit-and-close-follow-ups
- [Introduce Cucumber to E2E Test](seeds/SEED-405-introduce-cucumber-to-e2e-test.md#introduce-cucumber-to-e2e-test) — SEED-405#introduce-cucumber-to-e2e-test
- [Review what Default main session reviews left deferred](seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#review-deferred-default-main-session-changes) — SEED-379#review-deferred-default-main-session-changes
- [Recover expired session reviews from Git history](seeds/SEED-418-review-published-session-changes.md#recover-expired-session-reviews) — SEED-418#recover-expired-session-reviews
