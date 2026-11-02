# Source review: SEED-219#ci-status-review-corrections

Launch: a fresh general-purpose reviewer (no conversation inheritance, fork or
resume), 2026-11-02, by the plan 448 coordinator. Input: only the correction
story text of `.planning/seeds/SEED-219-intent-ci-status-tab.md#ci-status-review-corrections`
(heading, Goal, Scope, Key example) at `ee132468d`; no plan, product, proof or
slice scope. Instructions: use only that input, read no files, change nothing,
return numbered commitments with qualifications, examples and exclusions.
Reviewer note: the source does not say whether the trunk ref is named in every
unread case or only in the 404 example (1.1 takes it from the key example).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | When GitHub cannot list the trunk's history, a developer reading Intent's CI status sees **Could not be read** along with GitHub's reason. | slice 1 | observed: intent-ci-status-reads.spec.ts "CI status that could not be read…" step "a 404 on main's history is Could not be read…": state Could not be read, reason contains 404 and /commits?sha=main |
| 1.1 | In that unread case, CI status names the trunk ref. | slice 1 | observed: intent-ci-status-reads.spec.ts "CI status that could not be read…" step "a 404 on main's history is Could not be read…": heading "CI status of main" |
| 1.2 | In that unread case, CI status says **Could not be read**. | slice 1 | observed: intent-ci-status-reads.spec.ts "CI status that could not be read…" step "a 404 on main's history is Could not be read…": .intent-ci-state "Could not be read" |
| 1.3 | In that unread case, CI status shows GitHub's reason, such as the HTTP 404 reason; an unread trunk judgment keeps its reason visible. | slice 1 | observed: intent-ci-status-reads.spec.ts "CI status that could not be read…" step "a 404 on main's history is Could not be read…": .intent-ci-reason contains "404"; baseCiGitHubReads.ts readBranchHistory routes the trunk 404 through githubAcquisitionUnread |
| 2 | The configured ref is never marked as no longer published; in the unread case it never says "main is not published". | slice 1 | observed: intent-ci-status-reads.spec.ts "CI status that could not be read…" step "a 404 on main's history is Could not be read…": panel not toContainText "not published"; baseCiGitHubReads.ts guard branch !== source.ref; IntentCiJudgment.tsx trunk wording removed |
| 3 | A story branch that is absent on GitHub is still reported as absent, by name. | slice 1 | observed: intent-ci-status-story-gaps.spec.ts step "a recorded branch no longer published is said so by name" (green in the 12-spec CI status run) |
| 4 | The maintained Intent doc describes when trunk runs count for a story branch, matching how the dashboard actually judges them. | slice 1 | observed: docs/dashboard-development-intent.md CI status paragraph: trunk runs count for ciWorkflow story branches; trunk 404 is Could not be read |
| 4.1 | The Intent doc states that a `ciAdapter` project judges a story branch from its own discover answer only. | slice 1 | observed: docs/dashboard-development-intent.md CI status paragraph: "with a ciAdapter, only the adapter's discover results for the judged branch count"; baseCiJudgment.ts adapter path merges no trunk listing |
| 5 | Maintainers get one plain parameter for the judged branch: the `ci-status` read names its judged branch with its own parameter, not the shared `branch` read parameter. | slice 2 | observed: intentCiStatusRead.ts reads `judged` with no `branch` carve-out; requestedRead.ts has no ci-status exception; intent-ci-status-reads.spec.ts "the CI status read refuses an unsafe branch name…" refuses judged=main..other, judged twice and branch=main with 400; intent-ci-status-story.spec.ts judges the story branch through `judged` |
| 6 | Maintainers get no overlapping CI status end-to-end tests. | slice 3 | |
| 6.1 | Each overlapping CI status end-to-end test either moves to unit tests, or | slice 3 | |
| 6.2 | is removed, with its surviving coverage named. | slice 3 | |
| X1 | Exclusion: this correction does not decide whether `ciAdapter` projects should also count trunk runs. | slice 1 | observed: docs/dashboard-development-intent.md describes only the built adapter rule; the trunk-run question stays in PLAN.md Current decisions for Terry |
| E1 | Trigger example: GitHub answers HTTP 404 for `main`'s commit history, for example after the repository is renamed. | slice 1 | observed: intent-ci-status-reads.spec.ts "CI status that could not be read…" step "a 404 on main's history is Could not be read…" setup: serveCi answers httpErrorAnswer(404) to commit-list main |
