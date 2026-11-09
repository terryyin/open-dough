# Slice 1 independent refactor and renewed proof

Identity SEED-285#trace-landed-proof-timing; base `50f4f4f1eddbf442164ae326adc5d95904a286e8`. This pass follows accepted slice-1 semantics and the final supplier reconciliation. [AGENTS.md failure policy](../../../AGENTS.md#failing-and-flaky-tests) applies as written. No commits, staging, publication or planning edits were made by this pass.

## Cohesive changes

- Existing `landedCiObservation.ts` remains the schema/build-key owner. Adapter legacy compatibility moved from the store into `landedCiHistoryIdentity.ts`; strict reads and atomic proof/order/resolution updates retain their existing public API. No lost association is reconstructed and no G5 retry behavior was introduced.
- `landedCiCollectedProof.ts` owns conversion of a retained build into the existing validated proof-reader subject. The collector owns its lifecycle. `mostCompleteLandingOrder` in the existing measured-window owner now owns coverage ranking for collector and public read; candidate tie priority, endpoint filtering and fallback remain at their original callers.
- `ciScopeHistoryTiming.ts` owns one retained build's timing eligibility, signature and reason. Cohort selection, grouping and segmentation remain in `ciScopeHistory.ts`.
- `HistoryRunAttempt.tsx` shares the existing attempt words/optional link between both history lists. `IntentScopeProof` attaches history once around its existing evidence content. Generic SVG plot rendering moved to `IntentCiHistoryPlot.tsx`, with series types in `ciHistoryChart.ts`; the responsive chart's exported API remains stable. Exact published Done endpoint derivation moved into the existing `IntentStorySummary.tsx` model.
- Browser/Node/backend files were split along independent behaviors, retaining all cases. The real producer-to-Summary journey remains one test. Shared support owns canonical producer/landing construction, public/local collected reads and guarded disposable-Git fault injection. Safe Git removal restores in finally and is reused by both restart/order journeys; backend additionally names its bare origin.
- One canonical MakeMe history builder remains. Existing published-source and story-preparation constructors moved into dedicated builder modules with unchanged facts/defaults. `tests/README.md` retains its old anchors and links the extracted test-data/environment guides in the same directory.

Production refactors stay within landed CI evidence persistence/acquisition/projection or Intent evidence presentation. Applicable Accepted ADRs0001/0002/0008 are preserved; no coordinated cross-subsystem exception or changed story promise was needed.

## Exact terminal verification

All implementation/refactor writers were quiescent before checks. Fresh host basis: AC,48GiB; load3.23/5.16/6.41. One owned browser worker and one Node runner job were selected under `caffeinate -s -i`; no full suite or standalone lint was run.

```sh
npm run format
npm run typecheck:dashboard
```

Final selective format session45168 exit0; typecheck12512 exit0. The first refactor format caught three imports omitted from a split backend file; they were restored before running tests. The original formatter's loose-null/non-null/unused/unreachable findings were repaired without rule suppression or weaker assertions. Undefined/null cases remain distinct; meaningful fixture guards replace unsupported assertions.

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-refactor-playwright.json caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci tests/intent/intent-ci-wall-time-history tests/intent/intent-scope-timing-history tests/intent/intent-scope-collected-timing-history.spec.ts tests/intent/intent-summary-story-comparison.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts tests/intent/intent-summary-ci-proof-gaps.spec.ts --workers=1
```

Session17538 exit0. The retained completed proof record independently lists51 selected tests,51 expected-passed executions and51 passed attempts:24 backend,9 project-history,9 scoped-history and9 comparison cases. No skipped tests or retries. A same-selection `--list` command also exited0 before execution. Filename prefixes include every moved case; this is not a zero-selection claim.

```sh
PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh tests/support/intent-ci-scope-history.test.mjs tests/support/intent-ci-scope-history-timing.test.mjs tests/support/intent-ci-scope-history-gaps.test.mjs tests/support/intent-ci-scope-history-provenance.test.mjs tests/support/intent-ci-scope-history-links.test.mjs tests/support/landed-ci-history-identity.test.mjs tests/support/landed-ci-history-identity-subject.test.mjs tests/support/landed-ci-history-order.test.mjs tests/support/landed-ci-history-reading-order.test.mjs tests/support/dashboard-ci-scope-history-read.test.mjs tests/support/story-state-sibling-readiness.test.mjs tests/support/supplier-dependency-correction-satisfied.test.mjs
```

Session84676 exit0,12 selected Node files. These retain all11 original scope cases and all6 identity cases, plus invalid optional links, real ancestry/persisted order/stale snapshot, local/default transport guards, and the moved MakeMe constructors' existing callers.

Final `git diff --check` exit0. All97 current changed/new files, including root-owned planning records, are at most250 lines after formatting. Maximum250 (`performedRead.ts`, `landedCiHistoryStore.ts`). Product/test/docs ownership manifest: `/tmp/trace-proof-285-refactor-owned-paths.txt`,85 paths; planning excluded. No commands/writers remain running. Approximate active full-pass time:25 minutes.

## Inspected observing boundaries and moved locations

- `landed-ci-scope-adapter-identity.spec.ts:26` still acquires two real adapter subjects with reused opaque attemptId and1200/3400ms. Shared-attempt continuation moved to `landed-ci-scope-adapter-shared-attempt.spec.ts:29`: one acquisition/build/point, two represented receipts, restart/local browsing counts.
- Native equivalent proof remains in `landed-ci-scope-build-provenance.spec.ts:40`; cancelled/later proof moved to `landed-ci-scope-later-build.spec.ts:44`. Both preserve actual resolution/artifact bytes, measured dates/revisions, represented roles, later unrelated exclusion and no browsing acquisition.
- `landed-ci-scope-retained-window.spec.ts:37` retains the real21st accepted landing, reversed receipts, exact surviving proof bytes and public project/scope equality. Legacy reason compatibility moved to `landed-ci-scope-legacy-gap.spec.ts:29`; unknown-order periodic resumption moved to `landed-ci-scope-pending-order.spec.ts:41`. Canonical20-build construction now states times/run/duration ranges at the case call site and uses MakeMe internally; Git publication stays harness action. All destructive retention relationships/assertions remain.
- `intent-scope-collected-timing-history.spec.ts:36` still arranges explicit same-identityP/E/R, actual raw producer timing facts, accepted nudge, collector-retained proof, selectedE UI, zero, actual corrupt-store502/ownRetry, comparison/Purpose/keyboard/phone and stable provider counts. Safe Git/persisted-order observations now live in `scopeHistoryCollectedOrder.ts`/`scopeHistoryCollectedGit.ts`, called within that same journey; they never inject a successful history answer.
- Supplemental scoped browser cases now span `intent-scope-timing-history-{reading,segments,provenance,gaps}.spec.ts`; accepted-order project evidence moved to `intent-ci-wall-time-history-order.spec.ts`. Their independent assertions and9 total scoped cases remain. Main scope matrix now spans `intent-ci-scope-history{,-timing,-gaps,-provenance}.test.mjs`; identity's subject cases moved to `landed-ci-history-identity-subject.test.mjs` while legacy cases remain in the original file.

## Directed consumer dispositions

Mandatory current-base discovery `/tmp/trace-proof-285-slice1-refactor-consumers-raw.md` exited0. Child directed discoveries `/tmp/trace-proof-285-server-node-refactor-consumers.md` and `/tmp/trace-proof-285-client-refactor-consumers.md` exited0. This table supersedes their blank lexical disposition cells; earlier final-reconciliation/G10/G11 records remain relevant for unchanged responsibilities.

| Consumer or concept | Disposition and current evidence |
| --- | --- |
| Store, extracted identity compatibility, observation/build-key owner, canonical history builder | Renewed backend24 plus both identity Node files: full contextual keys, safe legacy reuse/gaps, immutable proof, raw read/write compatibility and exact retained payload relationships. No API or key policy changed. |
| Collector/extracted proof subject, validated reader dispatch and pending lifecycle | Renewed backend24: native/adapter actual bytes, collisions/repeats, pending/read/order, startup/restart and ordinary periodic continuation. Wider live proof freshness/memo/artifact/adapter bodies remain unchanged and their accepted proof is reused. G5 remains receiving slice3. |
| Shared order ranking, measured window, public project/scoped read, launchLandingGit | Renewed21st/missing-Git cases, project-order browser case, real graph/order/reading-order Node files and actual Done journey. Coverage ranking/ties/endpoint fallback preserve original semantics. Shared20 CI-build cohort, all-parent recorded ancestry and actual date labels survive. |
| Scope timing eligibility, grouping/signatures, client schema and optional links | Renewed four scope Node files plus links8, backend scope acquisition/provenance/window, scoped9 browser cases. Zero/partial/untimed/unit/owner/no-scope/terminal gaps and invalid optional URL-only filtering remain distinct. |
| ScopeProof outer attachment, shared history attempt/link, exact Done endpoint, chart/plot/types | Renewed project9+scope9+comparison9 browser cases. Current tests observe unchanged comparison, publishedE despiteP/R, links, dates/extent, selected marker, gaps/segments, keyboard/phone and independent local retry. No separate series/collector introduced. |
| History hooks/authenticated history readers/default transport guard | Renewed scope client Node and history18 browser cases. Hooks remain separate by their existing lifecycles; local:true stays limited to collected history, default live guard/freshness untouched. |
| Split backend/browser/Node files and new shared construction/infrastructure | Renewed51 Playwright and12 Node files include every moved case. Helpers arrange canonical input facts, actual producer bytes and technical isolation; observing assertions remain independent. Safe Git helper's extra bare-origin parameter preserves backend fault scope. |
| MakeMe new constructor modules/factBuilder/global entry | Typecheck and all renewed tests load the shared entry. Selected existing source-read and preparation/dependency Node callers exercise unchanged constructors/defaults. Other MakeMe imports keep identical API and facts; no second builder for a canonical shape was added. |
| README, test-data/environment guides, references | Maintained prose moved within tests/; relative targets and old README anchors remain. No runner/runtime behavior changed. Other tests/README links and broad shell/environment names are lexical references, not new execution effects. |
| Unchanged resolver/wider comparison/live proof/request-accounting consumers | Their production bodies and preconditions are unchanged by this refactor; accepted published-supplier/earlier proof is reused. The nine affected scope comparison cases were renewed because the outer attachment moved. No unrelated suite was omitted for CI. |
| Root planning/source/retrospective records and generic PLAN/README/date/series/signature/run/proofOf matches | Excluded as coordination/prose or unrelated local symbols; no such record executes changed owners. Broad helper/module imports are covered by compilation and renewed entry cases; their unchanged unrelated behaviors are not reclassified as affected by spelling alone. |

No unresolved refactor gap or disputed restriction remains. Slice2 folder/file and slice3 backfill/restart obligations remain their existing owners; this refactor does not claim them complete.
