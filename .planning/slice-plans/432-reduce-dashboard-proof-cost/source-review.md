# Source review

Launch: fresh general-purpose agent in this execution session (2026-11-01),
without conversation inheritance, told to use only the supplied text, read no
project files and change nothing. Input: the selected story section's Goal,
Beneficiary, Scope, Key examples, Evaluation, Constraints, Boundaries and
Effort hypothesis, verbatim from
`.planning/seeds/SEED-208-dashboard-proof-cost.md#reduce-dashboard-proof-cost`.
No plan, return, product or proof was supplied. The reviewer left out the
effort rating, risk note and ownership sentence as non-promises, and noted
that the named retentions in 4a–4h are examples, not exhaustive rejection rules.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1.1 | Developers wait less for dashboard feedback | slice 9 | observed: PLAN slice 9 Result, story files 199.5 to 172.0 summed s; poll-wait candidate pending |
| 1.2 | Developers maintain fewer redundant test paths | slice 9 | observed: slice 3, 4, 5, 7 Results remove duplicated paths; 1,831 to 1,827 cases |
| 1.3 | The important behavior those tests protect is retained | slice 9 | observed: source-review 4a-4g observations; tmp/final-cand2 strict pass |
| 2.1 | Developers running and maintaining `npm run test:dashboard` | slice 9 | observed: tmp/final-cand2 normal npm run test:dashboard strict pass |
| 3.1 | Implement the supported reductions in the value/cost assessment | slice 9 | observed: PLAN slices 2-8 Results |
| 3.2 | Implement the bounded fixture improvements in the value/cost assessment | slice 9 | observed: slices 2 (admissionWorktree), 3 (codexLaunch), 6 (boundary API setup) Results |
| 3.3 | For every affected test, first judge whether its protected behavior is valuable | slice 9 | observed: per-slice Results judge each family's protected behavior |
| 3.4 | Then judge whether its incremental coverage justifies its runtime, maintenance, complexity, and the cost of improving it | slice 9 | observed: slice 1 cost table and per-slice measured records |
| 3.5 | A negative answer to either judgment removes or narrows the test | slice 9 | observed: slices 4, 5, 7 removed cases; slices 2, 8 narrowed placement |
| 3.6 | For worthwhile remaining coverage, prefer fewer tests first | slice 9 | observed: slices 3, 4, 5, 7 Results |
| 3.7 | Then prefer simpler real preconditions and existing system/test infrastructure | slice 9 | observed: slices 2, 3, 6, 8 Results |
| 3.8 | Accept evidenced residual necessary costs when no credible worthwhile acceleration remains | slice 9 | observed: TEST-OPTIMIZATION-CANDIDATES.md Latest pass (accepted residuals, pending poll waits) |
| 4a.1 | Malformed review/mark requests still cannot select arbitrary repositories | slice 2 | observed: boundary/story-review-refusal, -commit-admission, -one-shot-admission, -mark-admission status/body rows |
| 4a.2 | Malformed review/mark requests still cannot mutate real Git state | slice 2 | observed: observed()/written/origin-main sentinels in boundary/story-review-refusal and -mark-admission; repo+index in -one-shot-admission |
| 4a.3 | That protection is proved without opening a browser | slice 2 | observed: serverMode boundary + request, no page, in all five boundary admission specs |
| 4a.4 | That protection is proved without building irrelevant history | slice 2 | observed: admissionWorktree in support/storyReviewWorktree.ts used by refusal, commit-admission, mark-admission |
| 4b.1 | One story journey retains its distinct launch shape | slice 3 | observed: agent-launch-codex-model.spec.ts execution test on codexStart (worktree cwd, model, effort, profile) |
| 4b.2 | One ad-hoc discovered-model journey retains its distinct launch shape | slice 3 | observed: agent-launch-codex-model.spec.ts ad-hoc test on codexLaunch (home project cwd, model, effort, no turn/start) |
| 4b.3 | Refinement model/effort persistence survives in its existing journey | slice 3 | observed: agent-launch-preparation-codex.spec.ts kept() model/effort before input and first thread/start |
| 4b.4 | Catalog-only cases no longer prepare installed-start repositories | slice 3 | observed: codexModelCatalogCases.ts and codexEffortDialogCases.ts import only support/codexLaunch.ts |
| 4c.1 | Claude execution retains the full phase/observer journey | slice 4 | observed: agent-launch-start-phases.spec.ts expectStartProgress(execution, claude) plus argv readiness |
| 4c.2 | Codex refinement retains the full phase/observer journey | slice 4 | observed: agent-launch-preparation-phases.spec.ts expectStartProgress(refinement, codex) |
| 4c.3 | The existing Codex execution proof retains its changed-readiness handoff | slice 4 | observed: agent-launch-start-codex.spec.ts card start expectExecutionInput(..., true) exact handoff block |
| 4d.1 | The duplicate gaps case for ambiguous attribution is removed | slice 5 | observed: story-review-completed-gaps.spec.ts has no ambiguous-merge iteration |
| 4d.2 | Ambiguous attribution still fails closed with no files after that removal | slice 5 | observed: boundary/story-review-completed-driver.spec.ts ambiguous-merge unavailable + not.toHaveProperty(files); negative control tmp/s5-negctl |
| 4d.3 | Missing-agent recovery remains protected | slice 5 | observed: story-review-completed-gaps.spec.ts agentless story-branch recovery and trunk missing-agent tests |
| 4e.1 | Recently-done deletion keeps each placement result | slice 6 | observed: agent-launch-recent-delete.spec.ts Recently done, done card, Taken, Backlog, sidebar counts |
| 4e.2 | Recently-done deletion keeps each focus result | slice 6 | observed: agent-launch-recent-delete.spec.ts toBeFocused after each delete |
| 4e.3 | Recently-done deletion keeps each no-stop result | slice 6 | observed: agent-launch-recent-delete.spec.ts claudeStopCalls unchanged and stored() loses only the deleted id |
| 4e.4 | Incidental launch setup for those results uses real APIs | slice 6 | observed: agent-launch-recent-delete.spec.ts setup via agentLaunchBoundary launch and markDone |
| 4e.5 | Generic confirmation proof has one owner | slice 6 | observed: agent-launch-story-card-delete.spec.ts Keep/Escape/focus/no announcement; removed from recent-delete |
| 4f.1 | The blank/text matrix is reduced | slice 7 | observed: agent-launch-ad-hoc-terminal.spec.ts has one text journey, no blank iteration |
| 4f.2 | One full ad-hoc terminal attachment path survives that reduction | slice 7 | observed: agent-launch-ad-hoc-terminal.spec.ts starting with text opens the session in the terminal ... Close |
| 4f.3 | Blank UI submission is still proved, at the cheapest real boundary | slice 7 | observed: agent-launch-ad-hoc.spec.ts starting with an empty field sends no instruction |
| 4g.1 | Attention reporting keeps its installed-command lifecycle | slice 8 | observed: agent-completion-attention.spec.ts installed report receipt, store message and card |
| 4g.2 | Attention reporting keeps its restart lifecycle | slice 8 | observed: agent-completion-attention.spec.ts restarted server keeps message and receipt |
| 4g.3 | Attention reporting keeps its retirement lifecycle | slice 8 | observed: agent-completion-attention.spec.ts retainedReceipt after workspace removal |
| 4g.4 | Its raw refusal variants use an existing real boundary fixture | slice 8 | observed: boundary/agent-completion-identity.spec.ts refused deliveries keep the earlier completion message |
| 4h.1 | Completed-review Published/Landed round-trip selection keeps its accepted coverage | slice 9 | observed: story-review-completed.spec.ts untouched, passed in tmp/final-cand2 |
| 4h.2 | Non-owner second-server protection keeps its accepted coverage | slice 9 | observed: agent-launch-second-server and -orphan specs untouched, passed in tmp/final-cand2 |
| 4h.3 | Real production-watcher chains keep their accepted coverage | slice 9 | observed: production-watcher, -updates, -failures and boundary refusals untouched, passed in tmp/final-cand2 |
| 5.1 | Record comparable normal local full-suite before/after wall time | slice 9 | observed: PLAN slice 9 Result, 1,701.9 s vs 1,654.4 s |
| 5.2 | Record comparable normal local full-suite before/after executed case counts | slice 9 | observed: PLAN slice 9 Result, 1,831 vs 1,827 cases |
| 5.3 | Record controlled focused measurements of the infrastructure changes that are kept | slice 9 | observed: tmp/after-s2-*, after2-s3-*, after-s4-w1, s5-*, s6-*, s7-*, s8-* records cited in Results |
| 5.4 | Preserve valuable fault detection | slice 9 | observed: slice 5 negative control tmp/s5-negctl; all families strict |
| 5.5 | Make test/support orchestration simpler | slice 9 | observed: slices 2, 4, 6, 7, 8 Results; codexStart fixture overrides |
| 5.6 | Distinguish measured speedup from independently worthwhile scope reduction | slice 9 | observed: slice 9 Result and candidate record claim only slice 4 focused gain |
| 5.7 | Do not restore redundancy solely because wall time is unchanged | slice 9 | observed: no removed proof restored in git diff e83dfeb3..HEAD |
| 5.8 | Stop speculative acceleration when its expected benefit no longer justifies implementation and future maintenance | slice 9 | observed: candidate record leaves launch-records-poll-waits pending, unimplemented |
| 5.9 | Update the candidate record after proof | slice 9 | observed: .planning/TEST-OPTIMIZATION-CANDIDATES.md Latest pass |
| 6.1 | No mocking as an acceleration strategy | slice 9 | observed: slice 9 diff inspection, no route or fulfill |
| 6.2 | No production answer substitution | slice 9 | observed: slice 9 diff inspection, no answer substitution |
| 6.3 | No new retry policy | slice 9 | observed: slice 9 diff inspection, no retries |
| 6.4 | No new skip policy | slice 9 | observed: slice 9 diff inspection, no skip markers |
| 6.5 | No new exclusion policy | slice 9 | observed: slice 9 diff inspection, no exclusions |
| 6.6 | No weakened timeouts | slice 9 | observed: slice 9 diff inspection, timeouts moved unchanged |
| 6.7 | No shared mutable test state | slice 9 | observed: slice 9 diff inspection, only immutable module constants |
| 6.8 | No additional fixture framework | slice 9 | observed: slice 9 diff inspection, only admissionWorktree added |
| 6.9 | Existing synthetic external hosts are not proof of live vendor behavior | slice 9 | observed: slice 9 diff inspection, synthetic hosts not expanded |
| 6.10 | Existing synthetic external hosts must not be expanded to replace real dashboard/Git/store/transport behavior | slice 9 | observed: slice 9 diff inspection, synthetic hosts not expanded |
| 6.11 | Existing response-rewriting terminal races are not no-mock replacement proof | slice 9 | observed: agent-launch-ad-hoc-terminal races unchanged, not claimed as replacement proof |
| 6.12 | Product behavior is unchanged | slice 9 | observed: git diff e83dfeb3..HEAD has no dashboard/src or dashboard/server change |
| 7.1 | No deployment/cache redesign | slice 9 | observed: no deployment or cache change in the story diff |
| 7.2 | No broad watcher optimization | slice 9 | observed: production watcher specs and code untouched |
| 7.3 | No new test runner | slice 9 | observed: playwright config and runner unchanged |
| 7.4 | No product-wide test audit | slice 9 | observed: only the planned families plus three diagnosed failures changed |
| 8.1 | Fixture gains require bounded measurement before shared changes are kept | slice 9 | observed: slice 2 measured admissionWorktree without gain claim; slice 3 measured origin swap |
