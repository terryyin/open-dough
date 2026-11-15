# Source review

Refreshed 2026-11-15 after the split at delivered slice 5. Launch: fresh general-purpose subagent (no fork/inheritance); input: the narrowed story's Goal, Scope, Scope limits and Key examples verbatim from `.planning/seeds/SEED-334-product-wide-end-to-end-tests.md#retire-dashboard-integrated-ui-test`; instructed to read no files and change nothing. The pre-split review (68 ids) is recoverable at `4ceb02349033764c7dc0fa842e184180626f99e7`.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | Maintainer runs CI status, wall-time history and scope timing history regression checks at their owning boundaries | slice 5 | observed: plan slices 1–5 Accepted notes — backend-tests/intent/intent-ci-status-read-boundary.spec.ts, landed-ci-history-read-window.spec.ts; dashboard/frontend-tests/intent/intent-ci-status-*.spec.ts, intent-ci-wall-time-history*.spec.ts, dashboard/frontend-tests/intent-scope-timing-history-{gaps,provenance,units}.spec.ts |
| C2 | Every distinct assertion is preserved outside Dashboard Integrated UI Test | slice 5 | observed: per-slice disposition tables recorded in slice Accepted notes; G2 returned and proved by slice 2 |
| C3 | This reduces the remaining mixed test tier | slice 5 | observed: integrated --list 230 tests/113 files before, 205 tests/98 files after slice 5 |
| C4 | Intent's CI evidence stays trustworthy | slice 5 | observed: scratch breaks failed old and new homes in slices 1–5 and passed restored |
| C5 | No speed improvement is claimed without measurement | slice 5 | observed: plan 633 and slice commits make no speed claim |
| C6.1 | Convert the seven `intent-ci-status-*` specs | slice 2 | observed: slice 1 read-boundary and slice 2 six specs deleted with their duration rows |
| C6.2 | Convert the four `intent-ci-wall-time-history*` specs | slice 4 | observed: slices 3–4 deleted all four with their rows |
| C6.3 | Convert the four `intent-scope-timing-history-*` specs | slice 5 | observed: slice 5 deleted gap-build, gaps, legacy, provenance with their rows |
| C7.1 | HTTP refusal assertions go to Backend | slice 1 | observed: backend-tests/intent/intent-ci-status-read-boundary.spec.ts 400 refusals |
| C7.2 | Request-accounting assertions go to Backend | slice 1 | observed: same spec judgmentCalls exact lists; e2e/intent/intent-ci-status.spec.ts reused in slice 2 |
| C7.3 | Acquisition assertions go to Backend | slice 4 | observed: landed-ci-history-collection.spec.ts collection point verified in slice 4 |
| C7.4 | Storage assertions go to Backend | slice 4 | observed: backend-tests/intent/landed-ci-history-read-window.spec.ts reads a kept 35-build history |
| C7.5 | Controlled service answers go to Frontend | slice 2 | observed: frontendCiStatusAnswers.ts, frontendCiHistoryAnswers.ts, summaryScopeHistory.ts feed the Frontend specs |
| C7.6 | Actual rendering or interaction goes to Frontend | slice 2 | observed: dashboard/frontend-tests/intent/intent-ci-status-sort.spec.ts Tab/Enter/Space; -homepage return home by click/Enter/Space |
| C7.7 | Representative real-server workflows go to E2E | slice 2 | observed: e2e/intent/intent-ci-status.spec.ts and -story.spec.ts reused, 4 passed in slice 2 |
| C8 | Mixed cases are split by their assertions, including negative effects | slice 2 | observed: kept T2 split between Frontend reads() and E2E judgment calls; other-branch negative in dashboard/frontend-tests/intent/intent-ci-status-kept.spec.ts |
| C9 | Each distinct regression is preserved, not merely names or counts | slice 5 | observed: disposition tables map each expect to file and test in slices 1–5 |
| C10.1 | read-boundary converted directly to Backend without browser: malformed branch refusal | slice 1 | observed: backend-tests/intent/intent-ci-status-read-boundary.spec.ts judged/branch queries expect 400 |
| C10.2 | … malformed revision refusal | slice 1 | observed: same spec revision query expects 400; scratch break failed it |
| C10.3 | … malformed kept refusal | slice 1 | observed: same spec kept=yes and kept=1&kept=1 expect 400 |
| C10.4 | … fresh unread answer | slice 1 | observed: same spec 200 toMatchObject unread/fresh |
| C10.5 | … kept-none answer | slice 1 | observed: same spec kept=1 toEqual {none:true} |
| C10.6 | … exact additional-GitHub-call assertions | slice 1 | observed: same spec asked() toEqual the three exact calls |
| C11 | Before a migrated case is deleted, each assertion is accounted for in a named maintained home | slice 5 | observed: each slice's disposition table preceded its git rm |
| C12.1 | A representative changed proof boundary catches the same scratch break before and after conversion | slice 1 | observed: slices 1–5 scratch breaks (revision refusal, kept cue, gap run link, window width, later wording) failed old and new homes |
| C12.2 | … then passes once the break is restored | slice 1 | observed: restored runs passed in each slice |
| C13.1 | Shared helpers stay usable | slice 5 | observed: trunkCiAnswers re-exported by intentCiStatusPage.ts; consumers run or typechecked per slice consumer traces |
| C13.2 | Current runner support stays usable | slice 5 | observed: integrated --list loads 205 tests/98 files; full Frontend suite 373 passed in slice 2 |
| C13.3 | Historical proof stays usable | slice 5 | observed: consumer traces excluded and left .planning/done records unchanged |
| C14 | Only converted specs and their interim duration-list entries are removed | slice 5 | observed: dashboard/integrated.longest-first-project lost exactly the 15 converted rows; ciHistoryWindowPage.ts removed only with its last consumer |
| C15 | Remaining Intent and navigation cases keep running in the interim group | slice 5 | observed: integrated --list still selects 98 files |
| C16.1 | Malformed branch, pinned revision or kept form at the real Backend → HTTP 400 | slice 1 | observed: backend-tests/intent/intent-ci-status-read-boundary.spec.ts |
| C16.2 | … no extra GitHub request | slice 1 | observed: same spec asked() toEqual [] after refusals |
| C16.3 | Fresh unread still returns its previous answer | slice 1 | observed: same spec toMatchObject unread/fresh |
| C16.4 | Kept-none still returns its previous answer | slice 1 | observed: same spec toEqual {none:true} |
| C17.1 | Frontend observes the same values | slice 4 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history{,-window}.spec.ts headings and latest values |
| C17.2 | Frontend observes the same gaps | slice 3 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history-gaps.spec.ts evidence rows and dashboard/frontend-tests/intent-scope-timing-history-gaps.spec.ts |
| C17.3 | Frontend observes the same freshness cues | slice 2 | observed: dashboard/frontend-tests/intent/intent-ci-status-freshness.spec.ts Previously retrieved at |
| C17.4 | Frontend observes the same keyboard interaction | slice 2 | observed: dashboard/frontend-tests/intent/intent-ci-status-sort.spec.ts and intent-ci-wall-time-history-gaps.spec.ts run links by keyboard |
| C18.1 | Backend/E2E keep request counts | slice 1 | observed: intent-ci-status-read-boundary judgmentCalls; e2e intent-ci-status(-story).spec.ts branchJudgmentCalls |
| C18.2 | Backend/E2E keep stored-history windows | slice 4 | observed: backend-tests/intent/landed-ci-history-read-window.spec.ts |
| C19 | Converted interim specs and their timing rows are removed | slice 5 | observed: 15 specs and rows removed across slices 1–5 |
| C20 | All remaining Intent and navigation cases still run in the interim group | slice 5 | observed: integrated --list 98 files |
| X1 | Exclusion: `intent-scope-glance` belongs to the next story | slice 5 | observed: dashboard/tests/intent/intent-scope-glance.spec.ts retained; mapped to plan 651 |
| X2 | Exclusion: CI proof, comparison and optimization-candidate specs belong to the next story | slice 5 | observed: those specs retained; plan 651 slices 2–5 |
| X3 | Exclusion: Intent source/review/revision conversion belongs to later stories | slice 5 | observed: no such spec changed |
| X4 | Exclusion: navigation conversion and interim-group retirement belong to later stories | slice 5 | observed: no navigation spec or runner retired |
| X5 | Exclusion: no new test tier | slice 5 | observed: only existing Frontend/Backend/E2E groups used |
| X6 | Exclusion: no product behavior change | slice 5 | observed: git diff of dashboard/src and dashboard/server empty across slices |
| X7 | Exclusion: no speed target | slice 5 | observed: none set |
| X8 | Exclusion: no shard-count target | slice 5 | observed: none set |
| X9 | Exclusion: no tagged-install proof | slice 5 | observed: none run |
| X10 | Exclusion: no E2E renaming | slice 5 | observed: e2e changes are header comments only |
| X11 | Exclusion: no removal of shared helpers, runner support, historical proof or unconverted duration entries | slice 5 | observed: same as C14 |
