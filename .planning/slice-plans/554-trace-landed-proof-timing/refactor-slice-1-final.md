# Independent final slice1 refactor

Failure policy: [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests), applied as written.

## Decision and scope

Independent read-only decide pass covered the current diff, previous full refactor and V2 reconciliation, canonical units/timing/store owners, client/DTO/UI callers, proof construction and test layout. Applicable Accepted ADRs0001/0002/0008 remain respected. No domain or cross-subsystem refactor is needed. Shared unit semantics already have one owner and current V2 model is coherent.

Prettier simulation exposed five nonplanning files exceeding250 after format, despite their compact unformatted source. Resolve their size along proof concepts. Remove one unused type export. All other production representations are already clean; no behavior change or additional helper framework is justified.

## Changed paths and proof movement

- `dashboard/src/ciScopeHistory.ts`: remove `ScopeHistoryPointReading`, confirmed no callers. DTO runtime schema and types used by all consumers unchanged.
- `dashboard/tests/support/ciProofArtifacts.ts`: shorten header only; producer/artifact helper behavior untouched.
- `dashboard/tests/intent/intent-scope-timing-history-units.spec.ts`: move legacy-only case into new `intent-scope-timing-history-legacy.spec.ts`. Both test bodies and independent assertions survive.
- `tests/support/intent-ci-scope-history.test.mjs`: retain exact-middle endpoint case; move missing/outside/ancestry cohort cases unchanged into new `intent-ci-scope-history-cohort.test.mjs`.
- `dashboard/tests/intent/intent-scope-collected-timing-history.spec.ts`: common evidence/facets/keyboard observations and actual store-corruption/Retry observation move into existing `scopeHistoryCollectedPage.ts`. All timing facts and expected rows remain explicit at the journey call site. Repeated retained-proof expectations now use one loop over explicit independent key/revision/case/file facts. No successful history response is injected.
- `dashboard/tests/support/scopeHistoryCollectedPage.ts`: hosts those cohesive page observers beside existing published-story opening/read readiness. Helpers keep actual store bytes, Retry, no-auth-error, keyboard and phone observations; case supplies reopen and preserved-comparison observations.
- `dashboard/backend-tests/intent/landed-ci-scope-legacy-gap.spec.ts`: exact V1 wire remains visibly handwritten JSON in the case. Technical atomic order-write operation moves to existing local-store support. Expected normalized payload, readable public scope/project results and no acquisition assertions survive.
- `dashboard/tests/support/collectedScopeHistory.ts`: `writeCollectedHistoryOrder(home, order)` runs the same existing real store writer with isolated HOME; no alternative data builder or normalization algorithm.

These are10 edited/new paths. No renames/deletions. No index/staging, plan-status, formatting, commit or publication operation performed by this agent. Root owns formatting and planning/source resolution.

## Terminal verification

Before proof: macOS19:56SGT, AC,48GiB, load4.25/2.96/3.50,58% free memory. Root had no competing heavy proof. Choose one Playwright worker under `caffeinate -s -i`; prior actual main journey fits60s individual timeout. No broad suite or repeated attempt needed.

```sh
npm run typecheck:dashboard
```

Session50069 exit0. This checks the removed type and moved support contract imports.

```sh
caffeinate -s -i node --test --test-concurrency=1 tests/support/intent-ci-scope-history.test.mjs tests/support/intent-ci-scope-history-cohort.test.mjs tests/support/landed-ci-history-proof-versions.test.mjs
```

Terminal0,5passed/0failed/0skipped (bd17ad). Existing endpoint/cohort cases retain same setup/assertions after movement; rawV1/atomic conversion public data assertions remain unchanged.

```sh
caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-scope-legacy-gap.spec.ts tests/intent/intent-scope-collected-timing-history.spec.ts tests/intent/intent-scope-timing-history-units.spec.ts tests/intent/intent-scope-timing-history-legacy.spec.ts --workers=1 --list --reporter=list
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-final-refactor-playwright.json caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-scope-legacy-gap.spec.ts tests/intent/intent-scope-collected-timing-history.spec.ts tests/intent/intent-scope-timing-history-units.spec.ts tests/intent/intent-scope-timing-history-legacy.spec.ts --workers=1
```

List terminal0 selected4tests/4files. Actual session95556 terminal0; custom proof record independently shows phasecompleted, selected4, runnerpassed/strictpassed,4expected-passed executions and4passed attempts/retry0. Duration29.28s. This renews all4 moved/changed integrated/presentation proof cases. No failing test or retry during this pass.

`git diff --check` terminal0. Prettier API simulation of all109 changed/new files gives maximum250lines (`landedCiHistoryStore.ts`), no file above250. This is check-only line sizing; root still owns actual selective `npm run format`. Tests ran after all refactor edits.

## Consumer dispositions and accepted proof

Installed trace command (terminal0, session15319):

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/trace-a-done-story-s-timing-history-into-test-pr --base fcf4c00410f737f0a396fb3c0bae95508a5d2671 --term ScopeHistoryPointReading --term expectCollectedEntryHistory --term expectCollectedHistoryRecovery --term writeCollectedHistoryOrder --term proofSummaryForEntry > /tmp/trace-proof-285-final-refactor-consumers-raw.md
```

| Consumer/concept | Disposition |
| --- | --- |
| Exact endpoint/cohort Node specs and canonical MakeMe setup | Run5 selected Node cases above, includes all4 moved original cases plus unchanged rawV1 conversion. No coverage removal. |
| Actual collector-to-Done Summary, publishedP/E/R endpoint, zero, units, common links/facets/keyboard/phone, actual corruptstore502/Retry and preserved comparison | Run actual Done browser case. Observing locations moved to `expectCollectedEntryHistory` and `expectCollectedHistoryRecovery`; all independent values still in case. Provider counts remain case assertions. |
| Supplemental case/file facet and terminal legacy presentation | Run units and new legacy browser cases. Setup/observations unchanged, only file location moves. |
| Public V1/V2 legacy store compatibility and real atomic write | Run backend legacy case; rawwireJSON parsed locally retains exactly same input fields, atomic writer operation same command/HOME, payload/public/no-CI assertions unchanged. |
| `ScopeHistoryPointReading` | Excluded: unused definition only; removed. `rg` confirms no callers. Runtime schema and all externally consumed inferred types unchanged; typecheck passes. |
| Shared `ciProofArtifacts` imports across proof/archive/live comparison fixtures | Reused G15 primary7Node jobs + actual backend/Done/unit browser proof. This delta changes header only; same exported helper bodies, signatures/defaults and callers. No additional archive suite required. |
| Existing `openCollectedHistoryStory` and `collectedScopeHistory`/`retainedHistory` callers | Run actual Done and backend legacy cases; existing functions unchanged, added cohesive observer/technical writer do not alter other callers. |
| Whole-base production/store/collector/retention/identity/units/read guards/chart/evidence/client contracts and reached existing proof consumers | Reused all G15 accepted36ownNode/24backend/37browser/7primaryNode jobs per retained V2 consumer record. This pass changes no runtime boundary, implementation, setup or observation in those other cases. No G15 gap reopened. |
| Prior full-refactor unaffected MakeMe/preparation/source builders, README/test guides and unit owner | Reused prior accepted records. No edits to their representation or operation in this delta. |
| Planning, skill copies, lexical generic evidence/entry/run/summary names, unrelated artifact imports | Excluded from this delta: coordination prose, unchanged managed guidance, or different domain concepts. Prior directed records retain actual effect-reaching whole-base dispositions; this trace's raw blank cells are superseded by those records and this table. |

The current plan's source freshness decision is independently root-owned; this refactor neither resolves it nor marks/publishes the slice. G5 and slices2/3 remain their owners. No refactor gap, domain choice or pending command remains. Product/test/docs manifest `/tmp/trace-proof-285-final-refactor-owned-paths.txt` lists93owned nonplanning paths. All own and child writers/tests are quiescent. Approximate active pass elapsed:8minutes.

## REFACTOR COMPLETE

Root actual formatting: first `npm run format` failed on unsafe-any assignment
from the shared JS summary converter. Added `as unknown` before the existing
strict schema validation, matching the established artifact reader. Independent
refactor delta accepted the annotation as runtime-neutral. Second `npm run
format` exited0 (session53508), with lint and format clean. Root dashboard
typecheck after that annotation exited0 (session76803). No new runtime proof
was invalidated by formatting or the annotation.

# Independent refactor after published supplier final

Failure policy: [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests), applied as written.

## Read-only decision

Reviewed current97owned productpaths,6working conflict reconciliations, implementation return `/tmp/trace-proof-285-supplier-final-dispositions.md`, current base8a9c7ed156bf73241cc394ee77551be76ea352ed and retained prior V2/fullrefactor decisions. Rechecked pending/proof/order orchestration, final gap metadata, persisted/current proof units, shared retention and affected client rendering. Existing ADR0001/0002/0008 boundaries remain intact; no plan restriction dispute or cross-subsystem refactor.

One candidate: the new scope gap repeats the same public build projection already in project gaps and measured scope entries: revision, provenance and safe run identity/link. Give that concept one existing authoritative home. All remaining naming, ownership, unit rules, support and tests are already coherent. No extra fixture abstraction, resolver or history owner is justified.

## Edits

Exactly3serverpaths, one CI-history subsystem:

- `dashboard/server/landedCiHistoryEntries.ts`: capability-name and export existing `gapBuildOf` as `historyBuildOf`. Body unchanged: revision/provenance plus shared safe `runOf`. Both existing project gap callers use it.
- `dashboard/server/ciScopeHistoryGap.ts`: use the same helper for newly delivered named gap metadata; pending identity still uses `runOf` because it names no measured build.
- `dashboard/server/ciScopeHistory.ts`: measured build metadata uses that helper. Existing selection/provenance conditions, unsupported ancestor handling, dates, attempt grouping and independent unit readings unchanged.

No files added, renamed, split or deleted in this pass. No plan/index/status/formatter/commit/publication writes. No runtime output/value/default changed.

## Terminal proof after all edits

Expensive-proof basis:20:23SGT macOS, AC,48GiB, load2.71/3.74/3.74,61% memory free, root no heavy proof. Select one Playwright worker under `caffeinate -s -i`; no broad suite or rerun needed. All commands terminal.

```sh
npm run typecheck:dashboard
caffeinate -s -i node --test --test-concurrency=1 tests/support/intent-ci-scope-history-gaps.test.mjs tests/support/intent-ci-scope-history-links.test.mjs tests/support/intent-ci-scope-history-provenance.test.mjs
```

Typecheck session87550 exit0. Node terminal0 (3527c3),14pass/0fail/0skip. Concrete observations: named expired/equivalent, unreadable/later and no-proof/exact gaps preserve revision/provenance/run and no numbers; malformed/nonweb URLs preserve native/adapter identity/100ms or pending state; shared-equivalent/later measured observations preserve one point and real metadata.

```sh
caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-history-gaps.spec.ts tests/intent/intent-ci-wall-time-history-gaps.spec.ts tests/intent/intent-scope-timing-history-gap-build.spec.ts tests/intent/intent-scope-collected-timing-history.spec.ts --workers=1 --list --reporter=list
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-supplier-refactor-playwright.json caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-history-gaps.spec.ts tests/intent/intent-ci-wall-time-history-gaps.spec.ts tests/intent/intent-scope-timing-history-gap-build.spec.ts tests/intent/intent-scope-collected-timing-history.spec.ts --workers=1
```

List terminal0 selected5tests/4files. Actual session53051 terminal0. Custom proof independently parsed: completed,5selected, runner/strictpassed,5expected-passed executions,5passed attempts,0retries/skips,27.49s. Actual backend2 observes named gaps + public scope metadata and safe links; browser3 observes project/allgaps phone/keyboard, selected scoped latergap link/count/date and actual Done collector/artifact/P/E/R/units/local502Retry/noCI journey. Setup and assertion locations unchanged by this pass.

`git diff --check` terminal0. Prettier simulation of all116current changed/newpaths finds none above250lines; max250store. Root owns actual selective formatting and any later rootrecord changes.

## Directed trace and accepted-proof dispositions

Installed trace terminal0, session15887:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/trace-a-done-story-s-timing-history-into-test-pr --base 8a9c7ed156bf73241cc394ee77551be76ea352ed --term gapBuildOf --term historyBuildOf --term scopeHistoryGapOf > /tmp/trace-proof-285-supplier-refactor-consumers.md
```

| Reached consumer/concept | Disposition |
| --- | --- |
| Private old `gapBuildOf` references | Removed/updated all2project callers, `rg` no remaining old symbol. New exportedhelper has4actual callsites:2project+scopegap+scopemeasured. |
| Public project history gap metadata -> read DTO, evidence words/link/rendering | Run backend2 + projectallgapsbrowser. Helper body and old project caller values unchanged; public expected roles/revisions/links/date/no-number remain inspected. |
| Scope nonbuild projection -> DTO/read/hook -> common evidence/units | Run Nodegapmatrix+link8, actual gapbackend publicscope and new scopegapbrowser. New helper keeps exact incoming metadata and safe link policy, no numeric substitute or chart/count. |
| Scope measured projection -> exact/equivalent/later attempt rows/facets | Run Nodeprovenance2+safe native/adapter links and actualDonebrowser. Original independent unit outputs, P/E/R selectedendpoint and noacquisition remain unchanged. |
| Supplier pending-proof/resolver/collector/window/order/store, current conversion/schema and client unit chart contracts | Reuse accepted supplierfinal37ownNode/3primaryfilejobs/27uniquebackend/28uniquebrowser observations. This extraction changes no operation/finality/pruning/identity/proof units or setup/observations in those cases. No further replay is justified. |
| Shared `runOf`, `keptRunOf`, current `provenanceOf`, all metadata schemas | Reuse unchanged accepted branches; run focused links/gaps/provenance and typecheck above. Persisted named build deliberately uses `keptRunOf`, preserving rawread subject; public helper uses safe `runOf`, so these are distinct storage/read responsibilities rather than duplicated policy. |
| Previous rawV1, V2 acquisition, native/adapter identity, old full-refactor support/guide cases | Reused prior accepted records. Their boundaries/implementation/setup/observations do not change here. |
| Broad lexical planning/prose, managed skills, generic entry/evidence/read/run matches and unrelated MakeMe imports | Excluded from this delta: they do not call new helper or receive changed output. Whole-base directed dispositions stay in supplierfinal/G15/priorrefactor records; rawtrace blank cells are superseded by those records plus this table. |

No uncovered consumer, required observation, disputed decision or failed test remains in this pass. G5/G17 and slices2/3 remain their existing owners. Root owns G16/source decisions, actualformat/status/delivery. Manifest `/tmp/trace-proof-285-supplier-refactor-owned-paths.txt` retains97nonplanning owned paths (no additions). All writers/tests/traces terminal and quiescent. Approximate active elapsed5minutes.

## REFACTOR COMPLETE
