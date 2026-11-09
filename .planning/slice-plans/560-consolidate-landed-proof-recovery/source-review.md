# Source review — SEED-289#consolidate-landed-proof-recovery

## Launch and input

Fresh general-purpose reviewer with no conversation inheritance. Supplied only
the original correction Goal, Scope, and Key examples from
`.planning/seeds/SEED-289-landed-proof-recovery-correction.md#consolidate-landed-proof-recovery`.
No plan, product files, proof, or current-slice scope were provided. Reviewer
instructed to use only those inputs, read no other project files, change
nothing, and return numbered commitments with compound items split.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Maintainers have one complete integration journey for pending CI recovery after a dashboard stop and launch-record expiry | slice 1 | observed: landed-ci-history-lifecycle.spec.ts:61 strengthened pending→stop→expiry→two-collector journey (post-consolidation 3-case focused run) |
| 2 | That consolidation reduces parallel fixtures and assertion ownership | slice 1 | observed: landed-ci-scope-proof-lifecycle.spec.ts duplicate pending/two-collector case removed; ownership in history-lifecycle only |
| 3 | That consolidation retains every meaningful observation | slice 1 | observed: history-lifecycle retained wall-time + scoped summary/entry/folder/zero + OFF-reader + original exclusion/order/concurrency/dev proofs |
| 4 | Strengthen the existing landed-history lifecycle journey before removing the duplicate | slice 1 | observed: history-lifecycle strengthened before scope-proof pending case deletion (green older-only then delete) |
| 4a.1 | Journey includes actual retained validated summary | slice 1 | observed: history-lifecycle.spec.ts retainedHistory builds[run/43/1].proof equals JSON.parse(recoveredSummary) |
| 4a.2 | Journey includes scoped readings | slice 1 | observed: history-lifecycle.spec.ts expectRecoveredScope entry/folder/zero via collectedScopeHistory for both collectors |
| 4a.3 | Journey includes collection-OFF reader restart proof | slice 1 | observed: history-lifecycle.spec.ts restartAsLandedCiReader after second.close; scopes repeated; github.calls length unchanged |
| 5 | Remove the duplicate pending/two-collector case only after strengthenments are in place | slice 1 | observed: landed-ci-scope-proof-lifecycle.spec.ts pending/two-collector case removed after strengthened journey green |
| 6a.1 | Preserve expired-capture exclusion from the older journey | slice 1 | observed: history-lifecycle.spec.ts expired Done outside kept/public history (observedKinds omit expired) |
| 6a.2 | Preserve mixed ancestry order from the older journey | slice 1 | observed: history-lifecycle.spec.ts measuredHistory entries: measuredPoint, unbuiltGap, recovered point |
| 6a.3 | Preserve exact public wall-time answer from the older journey | slice 1 | observed: history-lifecycle.spec.ts measuredHistory recovered completedAt timeAfter(running.at, 430_000) |
| 6a.4 | Preserve concurrency proof from the older journey | slice 1 | observed: history-lifecycle.spec.ts both collectors equal measuredHistory; builds ["run/41/1","run/43/1"] |
| 6a.5 | Preserve development-server no-acquisition proof from the older journey | slice 1 | observed: history-lifecycle.spec.ts developmentGitHub Actions filter [] before and after recovery |
| 7 | Keep both separate final-build backfill variants | slice 1 | observed: landed-ci-scope-proof-lifecycle.spec.ts:23 both final-build without-proof and legacy-unreadable variants retained |
| 8 | Keep all production behavior | slice 1 | observed: git diff --name-only: only test specs + plan/source-review; no dashboard/src production edits |
| 9 | This is a bounded retrospective correction | slice 1 | observed: test-only Structure consolidation; no feature/performance story work |
| X1 | No new feature | slice 1 | observed: no production feature code in diff |
| X2 | No performance target | slice 1 | observed: no performance target or timing budget added |
| X3 | No profiling | slice 1 | observed: no profiling harness or instrumentation added |
| X4 | No unrelated suite optimization | slice 1 | observed: focused selection only; no unrelated suite rewrite |
| X5 | No replacement with injected-only proof | slice 1 | observed: proof uses real serveCollectedTrunkRuns/CLI summary bytes, not injected-only DTO replacement |
| E1 | A running accepted landing survives stop and expired launch records, then two collectors retain the recovered attempt and its actual proof once | slice 1 | observed: history-lifecycle.spec.ts stop→expire launches→two collectors retain recovered attempt and proof once |
| E2 | The same entry, folder and zero-file readings survive a reader-only restart without acquisition | slice 1 | observed: history-lifecycle.spec.ts reader restart entry/folder/zero readings; no new github.calls |
| E3 | Initially expired captures stay excluded | slice 1 | observed: history-lifecycle.spec.ts initially expired capture excluded from kept/public history |
| E4 | The prior point, intervening no-build gap and recovered point retain their public order | slice 1 | observed: history-lifecycle.spec.ts prior point, no-build gap, recovered point public order in measuredHistory |
