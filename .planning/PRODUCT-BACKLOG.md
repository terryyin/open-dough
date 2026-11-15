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

- [Move session, terminal, story and observation checks out of Dashboard Integrated UI Test](seeds/SEED-334-product-wide-end-to-end-tests.md#finish-dissolving-integrated-ui-test) — SEED-334#finish-dissolving-integrated-ui-test ([plan](slice-plans/632-finish-dissolving-integrated-ui-test/PLAN.md))

## Backlog list

- [Move Intent and navigation checks out and retire Dashboard Integrated UI Test](seeds/SEED-334-product-wide-end-to-end-tests.md#retire-dashboard-integrated-ui-test) — SEED-334#retire-dashboard-integrated-ui-test
- [Prefer E2E tests to drive development and optimize the retained suite before completion](seeds/SEED-365-e2e-development-and-test-optimization.md#drive-development-with-e2e-and-optimize-the-suite) — SEED-365#drive-development-with-e2e-and-optimize-the-suite
- [Chart CI time without runner waits in Intent](seeds/SEED-364-intent-ci-history-without-runner-waits.md#chart-ci-time-without-runner-waits) — SEED-364#chart-ci-time-without-runner-waits
- [Reduce model work during prolonged supplier waiting (third try)](seeds/SEED-368-third-blocked-execution-attempt.md#reduce-model-work-during-prolonged-supplier-waiting) — SEED-368#reduce-model-work-during-prolonged-supplier-waiting
- [View token usage for dashboard-launched Claude Code tasks](seeds/SEED-359-claude-code-task-token-usage.md#view-claude-code-task-token-usage) — SEED-359#view-claude-code-task-token-usage
- [Reconsider further CI job reduction with a different approach](seeds/SEED-355-reconsider-further-ci-reduction.md#reconsider-further-ci-reduction) — SEED-355#reconsider-further-ci-reduction
- [Declare Git test state through MakeMe](seeds/SEED-353-declarative-git-test-state.md#declare-git-test-state-through-makeme) — SEED-353#declare-git-test-state-through-makeme
- [Highlight syntax in code diffs](seeds/SEED-351-highlight-syntax-in-code-diffs.md#highlight-syntax-in-code-diffs) — SEED-351#highlight-syntax-in-code-diffs
- [Close native comparison harness gaps](seeds/SEED-346-native-ab-comparisons.md#close-native-comparison-harness-gaps) — SEED-346#close-native-comparison-harness-gaps
- [Observe a tagged installed workflow and read E2E proof in Intent](seeds/SEED-334-product-wide-end-to-end-tests.md#observe-tagged-install-and-read-e2e-proof) — SEED-334#observe-tagged-install-and-read-e2e-proof
- [Keep one browser test group roster](seeds/SEED-334-product-wide-end-to-end-tests.md#keep-one-browser-test-group-roster) — SEED-334#keep-one-browser-test-group-roster
- [Explain and repair an empty native admission substitute stream](seeds/SEED-349-native-admission-substitute-empty-stream.md#explain-native-admission-substitute-empty-stream) — SEED-349#explain-native-admission-substitute-empty-stream
- [Capture and edit story notes in the dashboard](seeds/SEED-348-collect-notes-for-story-follow-ups.md#collect-notes-for-story-follow-ups) — SEED-348#collect-notes-for-story-follow-ups
- [Attach story notes to follow-ups and show which are waiting](seeds/SEED-348-collect-notes-for-story-follow-ups.md#attach-story-notes-to-follow-ups) — SEED-348#attach-story-notes-to-follow-ups
- [Count a slice's active time without the agent's own clock](seeds/SEED-367-bounded-slice-active-time.md#count-slice-active-time-deterministically) — SEED-367#count-slice-active-time-deterministically
- [Continue a ready split story automatically after wrap-up](seeds/SEED-366-continue-split-stories-automatically.md#continue-a-ready-split-story-automatically) — SEED-366#continue-a-ready-split-story-automatically
- [Bound flaky-test and CI-failure diagnosis in evidence rounds](seeds/SEED-367-bounded-slice-active-time.md#bound-diagnosis-in-evidence-rounds) — SEED-367#bound-diagnosis-in-evidence-rounds
- [Compare agent effort on comparable runs](seeds/SEED-345-session-token-efficiency.md#compare-agent-effort-on-comparable-runs) — SEED-345#compare-agent-effort-on-comparable-runs
- [Finish slices within a bounded working context](seeds/SEED-345-session-token-efficiency.md#finish-slices-within-a-bounded-working-context) — SEED-345#finish-slices-within-a-bounded-working-context
- [Start Claude Code implementers from a role-sized tool set](seeds/SEED-345-session-token-efficiency.md#start-implementers-from-a-role-sized-tool-set) — SEED-345#start-implementers-from-a-role-sized-tool-set
- [Get long verification results without empty wakes](seeds/SEED-345-session-token-efficiency.md#get-long-verification-results-without-empty-wakes) — SEED-345#get-long-verification-results-without-empty-wakes
- [Reach a proof decision from retained evidence](seeds/SEED-345-session-token-efficiency.md#reach-a-proof-decision-from-retained-evidence) — SEED-345#reach-a-proof-decision-from-retained-evidence
- [Close the landed CI repeat checks’ coverage gaps](seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps) — SEED-324#close-landed-ci-repeat-check-gaps ([plan](slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md))
- [Load execution guidance for the current phase](seeds/SEED-345-session-token-efficiency.md#load-execution-guidance-for-the-current-phase) — SEED-345#load-execution-guidance-for-the-current-phase
- [Start Cursor slices from complete Task briefs](seeds/SEED-345-session-token-efficiency.md#start-cursor-slices-from-complete-task-briefs) — SEED-345#start-cursor-slices-from-complete-task-briefs
- [Record source-review evidence once per independently observable promise](seeds/SEED-010-learn-from-execution-retrospectives.md#review-independently-observable-promises) — SEED-010#review-independently-observable-promises
- [Simplify the remaining session tests](seeds/SEED-341-simplify-session-tests.md#simplify-remaining-session-tests) — SEED-341#simplify-remaining-session-tests
- [Keep one-time browser test preparation out of case budgets](seeds/SEED-340-test-preparation-outside-case-budgets.md#keep-one-time-test-preparation-out-of-case-budgets) — SEED-340#keep-one-time-test-preparation-out-of-case-budgets
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
