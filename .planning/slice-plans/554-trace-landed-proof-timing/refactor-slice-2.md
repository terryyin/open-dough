# Independent slice 2 refactor

Failure policy: [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests), applied as written. Accepted base d4130605530aa4aed22c3d2be0e7ff5ff89ad968. Root owns planning, actual formatting, index/status, commit and publication.

## Decide and scope

Read the current whole diff, related Summary/file composition, actual CLI producer, canonical test-data guidance, plan and accepted proof. Applicable Accepted ADRs0001/0002/0008 remain respected; no conflict or new architecture decision. The file wrapper is already coherent with the existing Summary owner and needs no production refactor.

One new duplication is exposed by this slice: complete-file serving and the gap journey construct the same case/file CLI declarations, reports, outcomes and milliseconds-to-seconds wire. Consolidate that technical producer knowledge. Existing serving APIs use small labeled tuples and preserve explicit call-site facts; their signatures/defaults need no redesign. One CI-history test seam is affected, with no production subsystem crossing.

## Edits and moved knowledge

- New `dashboard/tests/support/scopeHistoryProofs.ts`: `collectedScopeFileSummary` compiles native runner facts through the existing `collectedSummary` CLI. It owns case/file declarations, independent case part count, breakdown flag and outcomes time conversion. `ScopeFileTiming` names the existing raw input tuple; it is not another retained-summary model.
- `dashboard/tests/support/scopeHistoryCollection.ts`: complete-file serving delegates producer construction to that function. Existing `serveCollectedScopeRuns`, `serveCollectedScopeFileRuns` and `serveCollectedScopeProofs` APIs, Actions router, raw ZIP bytes and MakeMe CI-run construction stay unchanged.
- `dashboard/tests/intent/intent-scope-collected-file-timing-gaps.spec.ts`: repeated CLI construction becomes the shared function call, keeping file facts, `{caseParts: parts, byFile}` and every independent expected value/assertion at the case. No successful response is injected.

No production file, runtime behavior, test title, assertion, timeout or selected case was changed by this refactor. No existing file renamed/deleted and no test body split. All changes are complete; tests ran afterward.

## Verification and accepted-proof reuse

Fresh local host20:52SGT: AC power,48GiB, load4.63/4.19/4.19,51% memory free. Root and implementation writer were quiescent. Another project worktree was running a two-worker comparison selection; no unrelated process was touched. Chose one worker under caffeinate for exactly3 actual journeys, preserving coverage. Reconsideration would be required on contention/failure; no failure occurred.

```sh
npm run typecheck:dashboard
```

Session1697 terminal0 after all edits. New type/module/imports and existing exact-optional tuple delegation are valid.

```sh
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-scope-collected-timing-history.spec.ts tests/intent/intent-scope-collected-file-timing-history.spec.ts tests/intent/intent-scope-collected-file-timing-gaps.spec.ts --workers=1 --list --reporter=list
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-slice2-refactor-playwright.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-scope-collected-timing-history.spec.ts tests/intent/intent-scope-collected-file-timing-history.spec.ts tests/intent/intent-scope-collected-file-timing-gaps.spec.ts --workers=1
```

List terminal0 selects3tests/3files. Actual session51950 terminal0. Independently parsed custom record: phasecompleted, selected3, runnerpassed/strictpassed,3expected-passed executions,3passed attempts/retry0,0skips; duration38.69s. This renews every caller whose producer construction moved: old entry1200/0 and80/900 with actual local502Retry; new entry/folder/hidden/file-zero/Purpose journey; entry-only/partialcase/completefile/selectedunit-gap journey. Artifact acquisition and all independent values remain observed.

Other accepted implementation proof stays valid: the remaining20 of23 browser cases have unchanged implementation, setup, boundary and observation locations; their full records are in slice2dispositions. The two MakeMe matching Node cases and unchanged projection/units/timing/store proof remain reusable, with no rerun. No final CI or slice3 recovery claim is made.

`git diff --check` terminal0. Prettier API check-only simulation of all12current changed/new files found no file above250lines, maximum243PLAN. Actual formatter remains root-owned. No generated-artifact trigger applies.

## Directed consumer dispositions

Installed trace terminal0(session66293):

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/trace-a-done-story-s-timing-history-into-test-pr --base d4130605530aa4aed22c3d2be0e7ff5ff89ad968 --term collectedScopeFileSummary --term serveCollectedScopeFileRuns --term serveCollectedScopeProofs --term serveCollectedScopeRuns --term caseParts > /tmp/trace-proof-285-slice2-refactor-consumers.md
```

| Reached concept/consumers | Disposition |
| --- | --- |
| New producer → complete-file serving → new main folder/file journey | Run renewed actual main journey; same explicit file arrays, hidden ghost, both units, zero, common rows, phone/keyboard and noCI. |
| New producer → gap variation → serialized Actions serving | Run renewed actual gap journey; same caseParts/byFile/file facts and asserted no-breakdown, partial/no200 substitute, file20, case0/absent file unit and terminal annotation. |
| Root-file convenience serving → complete-file serving → old entry journey | Run renewed old entry journey; same API/default file, producer values, real collection/P-E-R, unit evidence and local corruption/Retry/provider counts. |
| Existing CLI collectedSummary/playwrightRecord/summaryTextZipAnswer, run/landing/launch builders and raw ZIP router | Actual3journeys run through unchanged owners. Other CLI/MakeMe importers consume no changed API/default and do not call the new scoped producer; no blanket suite. |
| IntentFileProof/IntentFileReading, CI evidence/comparison/table/labels, ScopeTimingHistory/hook/public projection | Reused implementation’s23browser observations, with3actual journeys renewed here. No runtime/refactor edit reaches another UI setup or assertion. Remaining20file/source/fallback cases stay valid. |
| Scope matching/longest owner/former path/segments and canonical proof builders | Reused accepted2Node cases and slice1 matrices; no code, setup, observed value or canonical default changed. |
| Generic byFile/caseMs/fileMs/PLAN/source-review references, done-catalog byFileName and unrelated test/report fields | Excluded from this delta: separate concepts, unchanged CLI readers or metadata. Actual producer and UI consumers are disposed above. |
| Planning, maintained prose, source/installed skill copies and archived reports | Root owns planning; guidance/source contract is unchanged. Lexical references do not execute scoped producer. No installed-copy edit. |

All actual helper callers were also checked by rg: the old entry spec, new complete-file spec and new gap spec are the only executing users. Raw trace blank disposition cells are superseded by this directed record; no effect-reaching consumer is left uncovered.

## Ownership and quiescence

`/tmp/trace-proof-285-slice2-refactor-owned-paths.txt` lists7nonplanning owned files: implementation’s6 plus the new producer module. Parent planning paths excluded. No formatting, staging/index, status, commit, publication or CI observer action performed. All writers, list/typecheck/test/trace commands are terminal and quiescent. No unresolved refactor gap or product decision. Approximate active elapsed8minutes.

## REFACTOR COMPLETE
