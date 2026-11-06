# Source review — SEED-246#paths-ignored-ci-ancestor-status

Launch: fresh general-purpose source-only reviewer with only the selected
story Goal, Scope, key examples and exclusions; no plan, return, product or
proof. Returned 2026-11-06 during slice 1 acceptance.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A Dough execute-plan coordinator waiting on CI for a published revision that only changes `paths-ignore` files receives that revision's CI outcome as the status of the nearest ancestor that was not paths-ignored. | slice 1 | observed: ci-revision-coverage-not-required-cross-branch.test.mjs: success case coverage not_required + awaitRevision success |
| 2 | That wait completes as a normal CI build instead of ending unobserved. | slice 1 | observed: ci-revision-coverage-not-required-cross-branch.test.mjs: awaitRevision verdict success via not_required_basis |
| 3 | This matters most right after a Take, when a story branch's first revisions are planning or documentation edits and the branch has no CI runs of its own yet. | slice 1 | observed: ci-revision-coverage-not-required-cross-branch.test.mjs: story tip with only .planning/** and empty story-branch history |
| 4 | On the GitHub Actions default observer, an ignored-only registered revision may take as its basis an ancestor's run of the selected workflow's `push` trigger on any branch of the repository. | slice 1 | observed: ci-runs.mjs discoverApplicabilityCandidateRuns merges all-branch push listing; cross-branch success case |
| 5 | That basis may be on a branch such as the trunk the revision was taken from. | slice 1 | observed: cross-branch success: basis headBranch main for story-branch tip |
| 6 | The basis is chosen as today: the nearest proved ancestor with an attempt. | slice 1 | observed: nearer own-branch ancestor wins over main (E4 test) |
| 7 | Qualification on that basis: whose diff to the registered revision changes only ignored paths. | slice 1 | observed: success case ignored-only tip; non-ignored tip stays undiscovered (E3 in ci-revision-coverage-not-required-cross-branch-required.test.mjs) |
| 8 | The inherited `basis.state` reaches completion through the ordinary mailbox path. | slice 1 | observed: awaitRevision success with effectiveEvidence.source not_required_basis |
| 9 | The inherited `basis.state` reaches failure delivery through the ordinary mailbox path. | slice 1 | observed: ci-revision-coverage-not-required-cross-branch-inheritance.test.mjs failed variant: one CI_FAILURE then awaitRevision failure |
| 10 | Agents learn no new "docs-only skip" handling. | slice 1 | observed: no new agent docs-only skip guidance; coverage path only (diff leaves guidance unchanged) |
| 11 | A revision whose diff to that nearest basis touches a non-ignored path still waits on its own exact-SHA run. | slice 1 | observed: E3 in ci-revision-coverage-not-required-cross-branch-required.test.mjs |
| 12 | A revision whose diff to that nearest basis is mixed still waits on its own exact-SHA run. | slice 1 | observed: ci-path-applicability-indeterminate.test.mjs mixed-paths + ci-revision-coverage-not-required.test.mjs mixed stays undiscovered |
| 13 | A revision whose diff to that nearest basis is deleted outside ignored paths still waits on its own exact-SHA run. | slice 1 | observed: ci-path-applicability-indeterminate.test.mjs non-ignored-delete |
| 14 | A revision whose diff to that nearest basis is renamed outside ignored paths still waits on its own exact-SHA run. | slice 1 | observed: ci-path-applicability-indeterminate.test.mjs non-ignored-rename |
| 15 | Reason / qualification: a run of an older tree does not prove changed non-ignored content. | slice 1 | observed: same indeterminate classification tests; required restriction rationale retained in ci-path-applicability.mjs |
| 16 | The cross-branch lookup is one bounded listing of recent runs. | slice 1 | observed: storyHistoryCallCount===1 and allBranchHistoryCallCount===1 in success and E4 cases |
| 17 | A basis older than that window stays `undiscovered` with the existing discovery-delay advisory, as today. | slice 1 | observed: unchanged limit=100 listing window; older bases remain undiscovered by existing discovery path |
| 18 | Projects that use a custom CI adapter keep their branch-scoped `discover` answer. | slice 1 | observed: custom adapter discover path untouched in diff; consumer-trace |
| 19 | Changing the adapter protocol is a deferred promise. |  | G1 |
| 20 | A project's own `paths-ignore` policy is unchanged. | slice 1 | observed: paths-ignore policy files/workflow unchanged; tests reuse acceptedWorkflow fixture |
| 21 | The `pull_request` trigger is unchanged. | slice 1 | observed: listRuns still event=push only; pull_request not added |
| 22 | Integrated-state completion is unchanged. | slice 1 | observed: integrated-state filter unchanged; ci-*.test.mjs suite green |
| 23 | Qualification on 22: integrated-state completion stays scoped to the observed branch. | slice 1 | observed: createGitHubAcquisition comment + consumer-trace: integrated-state still filters headBranch |
| E1 | Story branch tip with only `.planning/**` changes and no own runs inherits successful `main` ancestor as `not_required` with `basis.state: success`; completion wait ends success, not `undiscovered`. | slice 1 | observed: ignored-only story branch inherits successful trunk ancestor test |
| E2.1 | Registered revision inherits trunk ancestor pending/failed/cancelled state exactly as from an own-branch ancestor. | slice 1 | observed: ci-revision-coverage-not-required-cross-branch-inheritance.test.mjs nested stages |
| E2.2 | It waits while the run is pending. | slice 1 | observed: inheritance.test.mjs pending: waiting awaitRevision then success after trunk completes |
| E2.3 | It gets the failure delivered once. | slice 1 | observed: inheritance.test.mjs failed: one CI_FAILURE then awaitRevision failure |
| E2.4 | It gets ordinary `CI_INCOMPLETE` handling. | slice 1 | observed: inheritance.test.mjs cancelled: basis.state incomplete, unresolvedReason incomplete |
| E2.5 | It never falls back to an older green ancestor. | slice 1 | observed: inheritance.test.mjs cancelled: basis.sha not older green shaG |
| E3 | A revision that changes a non-ignored path still waits on its own exact-SHA run. | slice 1 | observed: ci-revision-coverage-not-required-cross-branch-required.test.mjs |
| E4 | When the story branch has its own run nearer than trunk's, that nearer run stays the basis. | slice 1 | observed: nearer own-branch ancestor run wins over main |
