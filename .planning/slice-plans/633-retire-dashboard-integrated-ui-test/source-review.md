# Source review

Launch: fresh general-purpose subagent (no fork/inheritance), 2026-11-15, during execution of SEED-334#retire-dashboard-integrated-ui-test.
Input: the story's Goal, Scope, Scope limits and Key examples verbatim from `.planning/seeds/SEED-334-product-wide-end-to-end-tests.md#retire-dashboard-integrated-ui-test`; instructed to read no files, change nothing, and return numbered commitments and exclusions. Returned ids are recorded below as returned (lightly shortened).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1.1 | Maintainer runs CI status checks at their owning boundaries | slice 2 | observed: dashboard/frontend-tests/intent/intent-ci-status-*.spec.ts (presentation, 14 cases) + e2e/intent/intent-ci-status.spec.ts judgmentCalls + backend-tests/intent/intent-ci-status-read-boundary.spec.ts |
| C1.2 | Maintainer runs timing checks at their owning boundaries | slice 4 | |
| C1.3 | Maintainer runs proof checks at their owning boundaries | slice 5 | |
| C1.4 | Maintainer runs comparison checks at their owning boundaries | slice 6 | |
| C1.5 | Maintainer runs optimization-candidate checks at their owning boundaries | slice 8 | |
| C2 | Every distinct assertion is kept outside Dashboard Integrated UI Test (assertions, not names or counts) | slice 8 | |
| C3 | The change shrinks the remaining mixed test tier | slice 8 | |
| C4 | Intent's CI evidence stays trustworthy | slice 8 | |
| C5 | No speed improvement is claimed without measurement (claim limit, not a target) | slice 8 | |
| C6.1 | Convert `intent-ci-status-*` specs | slice 2 | observed: all seven intent-ci-status-* interim specs deleted and their duration rows removed; integrated --list 215 tests/106 files |
| C6.2 | Convert `intent-ci-wall-time-history*` specs | slice 3 | |
| C6.3 | Convert `intent-scope-*` specs | slice 4 | |
| C6.4 | Convert `intent-ci-proof*` specs | slice 5 | |
| C6.5 | Convert `intent-ci-comparison-*` specs | slice 6 | |
| C6.6 | Convert `intent-summary-*` specs | slice 6 | |
| C6.7 | Convert `intent-test-optimization-candidates*` specs (35 total across families) | slice 8 | |
| C7.1 | HTTP refusal assertions sit at the Backend boundary | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts: five malformed queries and two kept forms each expect 400 via rawRequest against startDashboardServer(developmentBoundary) |
| C7.2 | Request accounting assertions sit at the Backend boundary | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts: judgmentCalls(server.github.calls.slice(before)) toEqual [] after refusals and exactly three calls after fresh/kept reads |
| C7.3 | Acquisition assertions sit at the Backend boundary | slice 5 | |
| C7.4 | Storage assertions sit at the Backend boundary | slice 5 | |
| C7.5 | Controlled service answers sit at Frontend | slice 2 | observed: dashboard/tests/support/frontendCiStatusAnswers.ts serves fresh/kept/failed/held intent=ci-status answers to dashboard/frontend-tests/intent/intent-ci-status-*.spec.ts |
| C7.6 | Actual rendering or interaction sits at Frontend | slice 2 | observed: dashboard/frontend-tests/intent/intent-ci-status-sort.spec.ts Tab/Enter/Space sorting, -homepage click/Enter/Space return home, -side-panel, -freshness kept cue |
| C7.7 | Representative real-server workflows sit in E2E (representative, not every case) | slice 8 | |
| C8 | Mixed cases are split by their assertions, including negative effects | slice 8 | |
| C9 | Each distinct regression is preserved; names or counts alone do not meet this | slice 8 | |
| C10.1 | read-boundary converts directly to Backend without browser, keeping the malformed-branch refusal | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts: judged=main..other, has%20space, main&judged=other and branch=main expect 400, then asked() toEqual [] |
| C10.2 | … keeping the malformed-revision refusal | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts: revision=<pinned> expects 400, then asked() toEqual [] |
| C10.3 | … keeping the malformed-kept refusal | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts: kept=yes and kept=1&kept=1 expect 400, and final asked() still equals the three calls |
| C10.4 | … keeping the fresh-unread answer | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts: intent=ci-status → 200 toMatchObject {branch:main,state:unread,freshness:fresh} |
| C10.5 | … keeping the kept-none answer | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts: kept=1 → 200 toEqual {none:true} with no extra judgment calls |
| C10.6 | … keeping the exact assertions about additional GitHub calls | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts: asked() toEqual [actions-runs, actions-workflow, commit-list main] after fresh read and again after kept reads |
| C11 | The omitted-attempt refusal in `intent-ci-proof.spec.ts` also moves to that Backend home | slice 5 | |
| C12 | Before a migrated case is deleted, its assertions are accounted for in named maintained homes | slice 8 | |
| C13.1 | A representative changed proof boundary catches the scratch break before conversion | slice 1 | observed: PLAN Premises row: old integrated spec failed at pinned revision (expected 400, got 200) with revision refusal removed from parseIntentCiStatusRead |
| C13.2 | It catches the same break after conversion | slice 1 | observed: slice 1 return: same scratch removal of params.get("revision") refusal failed dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts at revision query, Expected 400 Received 200 |
| C13.3 | It passes once the break is restored | slice 1 | observed: slice 1 return: restored dashboard/server/intentCiStatusRead.ts, dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts passed (1 passed) |
| C14.1 | Shared helpers stay usable | slice 8 | |
| C14.2 | Current runner support stays usable | slice 8 | |
| C14.3 | Historical proof stays usable | slice 8 | |
| C15 | Removal is limited to converted specs and their interim duration-list entries | slice 8 | |
| C16 | Intent source/review/revision and navigation conversion/retirement are left to the two later stories | slice 8 | |
| C17.1 | Malformed CI-status branch at the real Backend → HTTP 400 and no extra GitHub request | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts: judged=main..other, has%20space, main&judged=other and branch=main expect 400, then asked() toEqual [] |
| C17.2 | Same for a malformed pinned revision | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts: revision=<pinned> expects 400, then asked() toEqual [] |
| C17.3 | Same for a malformed kept form | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts: kept=yes and kept=1&kept=1 expect 400, and final asked() still equals the three calls |
| C17.4 | Fresh unread still returns its previous answer | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts: intent=ci-status → 200 toMatchObject {branch:main,state:unread,freshness:fresh} |
| C17.5 | Kept-none still returns its previous answer | slice 1 | observed: dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts: kept=1 → 200 toEqual {none:true} with no extra judgment calls |
| C18.1 | Mixed CI proof case: Frontend observes actual presentation using controlled service answers | slice 5 | |
| C18.2 | Backend or E2E keeps the real parsing | slice 5 | |
| C18.3 | Backend or E2E keeps the real acquisition | slice 5 | |
| C18.4 | Backend or E2E keeps the real refusal | slice 5 | |
| C18.5 | Backend or E2E keeps the request counts | slice 5 | |
| C19.1 | Comparison scope navigation / candidate opens Purpose: maintained homes observe values | slice 6 | |
| C19.2 | … observe gaps | slice 6 | |
| C19.3 | … observe source pinning | slice 6 | |
| C19.4 | … observe keyboard behavior | slice 6 | |
| C19.5 | … observe reading position | slice 7 | |
| C20 | Converted interim specs and their timing rows are removed | slice 8 | |
| C21 | All remaining Intent and navigation cases still run in the interim group | slice 8 | |
| X1 | Exclusion: no conversion/retirement of Intent source/review/revision | slice 8 | |
| X2 | Exclusion: no conversion/retirement of navigation | slice 8 | |
| X3 | Exclusion: no new test tier | slice 8 | |
| X4 | Exclusion: no product behavior change | slice 8 | |
| X5 | Exclusion: no speed target | slice 8 | |
| X6 | Exclusion: no shard-count target | slice 8 | |
| X7 | Exclusion: no tagged-install proof | slice 8 | |
| X8 | Exclusion: no E2E renaming | slice 8 | |
| X9 | Exclusion: remove nothing beyond converted specs and their interim duration-list entries | slice 8 | |
| X10 | Exclusion: no speed-improvement claim without measurement | slice 8 | |
