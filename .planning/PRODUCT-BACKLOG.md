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

- [Keep one-time browser test preparation out of case budgets](seeds/SEED-340-test-preparation-outside-case-budgets.md#keep-one-time-test-preparation-out-of-case-budgets) — SEED-340#keep-one-time-test-preparation-out-of-case-budgets ([plan](slice-plans/685-keep-one-time-test-preparation-out-of-case-budgets/PLAN.md))

## Backlog list

- [Give the Dashboard Frontend group headroom on slow runners](seeds/SEED-382-browser-test-job-headroom-on-slow-runners.md#give-the-frontend-group-headroom-on-slow-runners) — SEED-382#give-the-frontend-group-headroom-on-slow-runners
- [Evaluate recoverable proof evidence in the next real planned execution](seeds/SEED-397-evaluate-recoverable-proof-evidence.md#evaluate-recoverable-proof-evidence) — SEED-397#evaluate-recoverable-proof-evidence
- [Keep the converted navigation proof whole and time-independent](seeds/SEED-334-product-wide-end-to-end-tests.md#keep-navigation-conversion-proof-whole) — SEED-334#keep-navigation-conversion-proof-whole
- [Tell compared Usage tools apart and drop stale read errors](seeds/SEED-383-compare-codex-and-claude-code-token-usage.md#tell-compared-usage-tools-apart) — SEED-383#tell-compared-usage-tools-apart
- [Submit and close the dashboard terminal](seeds/SEED-385-submit-and-close-the-dashboard-terminal.md#submit-and-close-the-dashboard-terminal) — SEED-385#submit-and-close-the-dashboard-terminal
- [Keep Review changes focused on the diff](seeds/SEED-384-keep-review-changes-focused-on-the-diff.md#keep-review-changes-focused-on-the-diff) — SEED-384#keep-review-changes-focused-on-the-diff
- [Verify the silent supplier wait in Codex](seeds/SEED-389-verify-silent-supplier-wait.md#verify-silent-supplier-wait-in-use) — SEED-389#verify-silent-supplier-wait-in-use
- [Verify the silent supplier wait in Claude Code](seeds/SEED-389-verify-silent-supplier-wait.md#verify-silent-supplier-wait-in-claude-code) — SEED-389#verify-silent-supplier-wait-in-claude-code
- [Keep Default main ad hoc session changes for review](seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#keep-default-main-session-changes-for-review) — SEED-379#keep-default-main-session-changes-for-review
- [Keep own-branch ad hoc session results for review](seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#keep-own-branch-session-results-for-review) — SEED-379#keep-own-branch-session-results-for-review
- [Move story navigation checks out and retire Dashboard Integrated UI Test with its documents](seeds/SEED-334-product-wide-end-to-end-tests.md#retire-integrated-ui-test-and-its-documents) — SEED-334#retire-integrated-ui-test-and-its-documents
- [Prefer E2E tests to drive development and optimize the retained suite before completion](seeds/SEED-365-e2e-development-and-test-optimization.md#drive-development-with-e2e-and-optimize-the-suite) — SEED-365#drive-development-with-e2e-and-optimize-the-suite
- [Declare Intent comparison histories through MakeMe](seeds/SEED-353-declarative-git-test-state.md#declare-intent-comparison-histories) — SEED-353#declare-intent-comparison-histories
- [Declare local worktree review state through MakeMe](seeds/SEED-353-declarative-git-test-state.md#declare-local-worktree-review-state) — SEED-353#declare-local-worktree-review-state
- [Declare merged review histories through MakeMe](seeds/SEED-353-declarative-git-test-state.md#declare-merged-review-histories) — SEED-353#declare-merged-review-histories
- [Declare trunk review authorship through MakeMe](seeds/SEED-353-declarative-git-test-state.md#declare-trunk-review-authorship) — SEED-353#declare-trunk-review-authorship
- [Declare completed-story review histories through MakeMe](seeds/SEED-353-declarative-git-test-state.md#declare-completed-story-review-histories) — SEED-353#declare-completed-story-review-histories
- [Declare retained landing and recovery state through MakeMe](seeds/SEED-353-declarative-git-test-state.md#declare-retained-landing-recovery-state) — SEED-353#declare-retained-landing-recovery-state
- [Declare launch and session repository state through MakeMe](seeds/SEED-353-declarative-git-test-state.md#declare-launch-session-repository-state) — SEED-353#declare-launch-session-repository-state
- [Declare runtime and observation repository state through MakeMe](seeds/SEED-353-declarative-git-test-state.md#declare-runtime-observation-repository-state) — SEED-353#declare-runtime-observation-repository-state
- [Close native comparison harness gaps](seeds/SEED-346-native-ab-comparisons.md#close-native-comparison-harness-gaps) — SEED-346#close-native-comparison-harness-gaps
- [Observe a tagged installed workflow and read E2E proof in Intent](seeds/SEED-334-product-wide-end-to-end-tests.md#observe-tagged-install-and-read-e2e-proof) — SEED-334#observe-tagged-install-and-read-e2e-proof
- [Keep one browser test group roster](seeds/SEED-334-product-wide-end-to-end-tests.md#keep-one-browser-test-group-roster) — SEED-334#keep-one-browser-test-group-roster
- [Explain and repair an empty native admission substitute stream](seeds/SEED-349-native-admission-substitute-empty-stream.md#explain-native-admission-substitute-empty-stream) — SEED-349#explain-native-admission-substitute-empty-stream
- [Continue a ready split story automatically after wrap-up](seeds/SEED-366-continue-split-stories-automatically.md#continue-a-ready-split-story-automatically) — SEED-366#continue-a-ready-split-story-automatically
- [Start Claude Code implementers from a role-sized tool set](seeds/SEED-345-session-token-efficiency.md#start-implementers-from-a-role-sized-tool-set) — SEED-345#start-implementers-from-a-role-sized-tool-set
- [Finish slices within a bounded working context](seeds/SEED-345-session-token-efficiency.md#finish-slices-within-a-bounded-working-context) — SEED-345#finish-slices-within-a-bounded-working-context
- [Get long verification results without empty wakes](seeds/SEED-345-session-token-efficiency.md#get-long-verification-results-without-empty-wakes) — SEED-345#get-long-verification-results-without-empty-wakes
- [Close the landed CI repeat checks’ coverage gaps](seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps) — SEED-324#close-landed-ci-repeat-check-gaps ([plan](slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md))
- [Load execution guidance for the current phase](seeds/SEED-345-session-token-efficiency.md#load-execution-guidance-for-the-current-phase) — SEED-345#load-execution-guidance-for-the-current-phase
- [Start Cursor slices from complete Task briefs](seeds/SEED-345-session-token-efficiency.md#start-cursor-slices-from-complete-task-briefs) — SEED-345#start-cursor-slices-from-complete-task-briefs
- [Wait for required conditions before load-sensitive proof](seeds/SEED-367-bounded-slice-active-time.md#wait-for-a-quiet-machine-before-load-sensitive-proof) — SEED-367#wait-for-a-quiet-machine-before-load-sensitive-proof
- [Simplify the remaining session tests](seeds/SEED-341-simplify-session-tests.md#simplify-remaining-session-tests) — SEED-341#simplify-remaining-session-tests
- [Show GitHub retry on the dashboard](seeds/SEED-336-live-dashboard-status.md#show-github-retry-on-the-dashboard) — SEED-336#show-github-retry-on-the-dashboard
- [Keep review cues current with SSE](seeds/SEED-336-live-dashboard-status.md#keep-review-cues-current-with-sse) — SEED-335#keep-review-cues-current-with-sse
- [See session status change live](seeds/SEED-336-live-dashboard-status.md#stream-session-status) — SEED-336#stream-session-status
- [See CI follow-up status change live](seeds/SEED-336-live-dashboard-status.md#stream-ci-follow-up-status) — SEED-336#stream-ci-follow-up-status
- [See host status while the sidebar is open](seeds/SEED-336-live-dashboard-status.md#stream-host-status) — SEED-336#stream-host-status
- [Read only the history the dashboard needs](seeds/SEED-337-dashboard-history-reads.md#read-only-the-history-the-dashboard-needs) — SEED-337#read-only-the-history-the-dashboard-needs
- [Observe dashboard traffic after optimization](seeds/SEED-338-observe-dashboard-traffic.md#observe-dashboard-traffic-after-optimization) — SEED-338#observe-dashboard-traffic-after-optimization
- [Match touch review titles to what each viewport runs](seeds/SEED-321-match-touch-review-titles-to-viewport-coverage.md#match-touch-review-titles-to-viewport-coverage) — SEED-321#match-touch-review-titles-to-viewport-coverage
- [Express launch dialog and startup test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-launch-test-intent-through-page-objects) — SEED-300#express-launch-test-intent-through-page-objects
- [Express settings test intent through page objects](seeds/SEED-300-dashboard-test-page-objects.md#express-settings-test-intent-through-page-objects) — SEED-300#express-settings-test-intent-through-page-objects
- [Express browser measurement test intent through shared setup](seeds/SEED-300-dashboard-test-page-objects.md#express-browser-measurement-test-intent) — SEED-300#express-browser-measurement-test-intent
- [Limit first-layer test cases to ten lines](seeds/SEED-301-limit-first-layer-test-cases-to-ten-lines.md#limit-first-layer-test-cases-to-ten-lines) — SEED-301#limit-first-layer-test-cases-to-ten-lines
- [Hold landed CI follow-up observations under load](seeds/SEED-319-landed-ci-follow-up-observations-under-load.md#hold-landed-ci-follow-up-observations-under-load) — SEED-319#hold-landed-ci-follow-up-observations-under-load
- [Run Open Dough tasks in the cloud](seeds/SEED-339-dashboard-cloud-agent-launches.md#run-open-dough-tasks-in-the-cloud) — SEED-339#run-open-dough-tasks-in-the-cloud
- [Back up and restore dashboard data](seeds/SEED-361-dashboard-data-backup.md#back-up-and-restore-dashboard-data) — SEED-361#back-up-and-restore-dashboard-data
- [View token usage for dashboard-launched Cursor tasks](seeds/SEED-360-cursor-task-token-usage.md#view-cursor-task-token-usage) — SEED-360#view-cursor-task-token-usage
- [Remove old dashboard deployments automatically](seeds/SEED-370-remove-old-dashboard-deployments.md#remove-old-dashboard-deployments-automatically) — SEED-370#remove-old-dashboard-deployments-automatically
- [Publish Intent projects through MakeMe](seeds/SEED-301-limit-first-layer-test-cases-to-ten-lines.md#publish-intent-projects-through-makeme) — SEED-301#publish-intent-projects-through-makeme
- [Prove the type-check reports after a lint failure](seeds/SEED-382-browser-test-job-headroom-on-slow-runners.md#type-check-reports-after-a-lint-failure) — SEED-382#type-check-reports-after-a-lint-failure
- [Reorder backlog stories in the dashboard](seeds/SEED-386-reorder-backlog-stories-in-the-dashboard.md#reorder-backlog-stories-in-the-dashboard) — SEED-386#reorder-backlog-stories-in-the-dashboard
- [Name the effort a Claude Code session actually ran with](seeds/SEED-388-measure-and-control-agent-launch-cost.md#name-the-effort-a-session-ran-with) — SEED-388#name-the-effort-a-session-ran-with
- [Richer Done follow-up card cues](seeds/SEED-395-richer-done-follow-up-card-cues.md#richer-done-follow-up-card-cues) — SEED-395#richer-done-follow-up-card-cues
- [Offer more syntax styling choices beyond Off and Default](seeds/SEED-387-deferred-syntax-styling-follow-ups.md#more-syntax-styling-choices) — SEED-387#more-syntax-styling-choices
- [Further word-emphasis follow-ups](seeds/SEED-387-deferred-syntax-styling-follow-ups.md#further-word-emphasis-follow-ups) — SEED-387#further-word-emphasis-follow-ups
