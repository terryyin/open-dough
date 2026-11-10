# Slice 3 accepted implementation proof

This report belongs to the current fa1cb8 implementation session. The older `/tmp/seed285-slice3-return.md` is not an input or acceptance record.

Base: `fa1cb8d8dabb05e1cc2102cb39ccdbb0cf1363fa`.
Checkout: `/Users/terryyin/git/open-dough/.worktrees/repeat-a-slow-landed-ci-build-once-and-flag-a-pe`.
Branch: `codex/repeat-a-slow-landed-ci-build-once-and-flag-a-pe`.
Publisher `dashboard-territory.local-open-dough`; author `viktor-chan`; Story Branch Mode; origin, final main; claim85eb42227b7887104aa80b9be39ac0ab27b73d24, starting5574b930e231e49a6f384aca561a6229d91993e8.

No commit/push/Take/mark-done/stash/branch switch/formatter/refactor pass/hook lint performed. Root-owned execution-evidence.md is preserved and excluded from ownership below. Root retains delivery, formatting, independent refactor and CI ownership. Failure policy applies verbatim by [AGENTS.md#failing-and-flaky-tests](https://github.com/terryyin/open-dough/blob/fa1cb8d8dabb05e1cc2102cb39ccdbb0cf1363fa/AGENTS.md#failing-and-flaky-tests).

## Implemented behavior

One machine-local fail-closed, fsynced ledger owns explicit default-off project enablement, designated hostname, immutable new-receipt eligibility and one consumed original-landing allowance. New reservation and enablement use attempts→ledger locking. Enablement snapshots retained/attempt/native receipts with canonical target; disable and rising enable permanently revoke every pre-existing UNSPENT eligibility. Spent requests remain observable. Project/target/revision key ignores receipt aliases/workflow configuration. A complete exact published Done delivery is required through existing landingCompletesStory; Taken/intermediate receipts cannot spend.

The after-pass collector reuses wallTimeReferenceOf and its single supplier/filter/completeness rule, then verifies actual original workflow/current/exact identity and complete original job inventory. Missing extra comparability evidence produces an explicit retained unavailable assessment rather than silent threshold rejection. Atomic spend precedes POST. Abort, lost reply or crash never renews or resends intent. Existing request observes fresh current/exact attempt/jobs, with full job-name multiset, fresh disjoint IDs, run/SHA and bounds inside the actual later attempt; no undocumented job.run_attempt assumption. A later increment alone cannot establish full rerun. Multiple later attempts, carried jobs or missing proof remain unverified. Failure/cancellation retain actual raw verdict/attempt and settle observation. Accepted intent, acceptance and observed CI outcome stay separate. An uncertain/intent request can retain a later measured full attempt while its acceptance remains honestly unverified.

Frozen request retains original build/proof/links, workflow/run/revision, complete actual reference samples/exclusions/average, original jobs and literal provisional5% attempt-start rule. Original pins are applied when the same landing is represented again, including workflow changes/pruning/restart. A corrupt follow-up ledger blocks new/rebuilt later attempt from becoming an ordinary sample and returns an identity explanation; previously retained finalized original subjects (including attempt2) remain readable. Original and repeat are never substituted or added twice.

Recently done renders actual collected progress/recovery/red textual Possible CI slowdown/unverified explanation, both totals and saved average/rule. Multiple retained records for one identity show ambiguity rather than selecting an arbitrary first historical result. New settings explain unsupported providers and machine authority. No dead comparison link was added. Detailed Intent sample/link navigation and maintained docs are deliberately slice4, as planned.

Primary technical premise: [GitHub job-attempt API](https://docs.github.com/en/enterprise-cloud%40latest/rest/actions/workflow-jobs) exposes IDs, run/SHA and start/end bounds; implementation uses these documented fields. [Full rerun operation](https://docs.github.com/en/rest/actions/workflow-runs#re-run-a-workflow) has201 acceptance with no response correlation guarantee. No live provider rerun/probe or real project enablement occurred.

## Current focused proof

All commands ran in the required checkout. Reused exact locked Nodev24.21.0, npm/browser/check foundation and Chromium153.0.8010.12; no package/lock/Node/hooks changes.

Resource basis: AC awake. Initial current observation load5.03/6.40/11.76/free57%, unrelated pygardon pytest and normal apps. Browser gates sequenced with one worker; no root heavy proof concurrent. Incremental typecheck and a bounded10Node-file gate were treated as compatible small work under that basis (no browser concurrent). Before final browser3case gate: AC100%, load9.55/8.41/7.68/free51%, no owned competing command; kept1worker+caffeinate-s-i. No wall-clock sleeps or test timeout overrides; browser advances controlled page clock15s for the normal retained read refresh.

### P1

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-admission.spec.ts backend-tests/intent/landed-ci-repeat-reconciliation.spec.ts tests/intent/recently-done-ci-automatic-repeat.spec.ts --workers=1 --reporter=list
```

Terminal: 94079: exit0,16 passed,1.1m.

### P2

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-repeat-reconciliation.spec.ts backend-tests/configuration/machine-json-reuse.spec.ts backend-tests/configuration/machine-json-revision.spec.ts backend-tests/launches/agent-launch-start-session-landing-boundary.spec.ts backend-tests/launches/agent-launch-start-session-landing-admission.spec.ts backend-tests/launches/agent-launch-start-session-landing-retained.spec.ts backend-tests/intent/landed-ci-history-lifecycle.spec.ts backend-tests/intent/landed-ci-history-window.spec.ts backend-tests/intent/landed-ci-scope-retained-window.spec.ts backend-tests/intent/landed-ci-attempt-start-adapter.spec.ts tests/configuration/system-settings.spec.ts tests/stories/recently-done-stories.spec.ts --workers=1 --reporter=list
```

Terminal: 88626: exit0,25 passed,1.3m.

### P3

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/support/ci-follow-up-ledger.test.mjs tests/support/ci-follow-up-policy.test.mjs tests/support/landed-ci-history-order.test.mjs tests/support/landed-ci-history-proof-finality.test.mjs tests/support/landed-ci-history-identity.test.mjs tests/support/landed-ci-history-identity-subject.test.mjs tests/support/intent-ci-scope-history-cohort.test.mjs src/skills/dough-execute-plan/scripts/ci-github-workflow-repeat.test.mjs src/skills/dough-execute-plan/scripts/ci-github-workflow-repeat-transport.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-leads-cli.test.mjs
```

Terminal: 34382: exit0,10 selected files; new policy17 and ledger8 cases.

### P4

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-repeat-receipt-boundary.spec.ts tests/intent/recently-done-ci-automatic-repeat.spec.ts --workers=1 --reporter=list
```

Terminal: 22661: exit0,3 passed,20.7s.

### P5

```sh
npm run typecheck:dashboard
```

Terminal: 31197: exit0 (also3290 exit0 before final verdict correction).

### P7

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-repeat-verdict.spec.ts --workers=1 --reporter=list
```

Terminal: 74400: exit0,5 passed,22.9s.

### P8

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-repeat-verdict.spec.ts --grep "verdict undefined" --workers=1 --reporter=list
```

Terminal: 90269: exit0,1 selected case passed,6.5s.

### P6

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-history-collection.spec.ts backend-tests/intent/landed-ci-history-gaps.spec.ts --workers=1 --reporter=list
```

Terminal: 59734: exit0,4 passed,12.3s.

P1 setup: `dashboard/tests/support/ciFollowUpScenario.ts::prepareRepeatScenario` publishes five real trunk100-second predecessors and a real CLI-completed story, serves MakeMe run/job/API/validated proof facts through synthetic gh. `ingest` seeds only accepted launch/native starting authority via shared MakeMe then invokes actual prepare/accept HTTP endpoints; it supplies no follow-up outcome. Servers use isolated HOME and actual background collector. First test starts both collecting production servers BEFORE receipt ingestion. POST handler asserts ledger submission.intent exists before answering201, gates reply, and duplicate delivery still yields exactly `[71]`.

P1 observations: `landed-ci-automatic-repeat.spec.ts` first named test observes105000/106000/100000, queued/running progress, slow text, one fullPOST and restart. Six named outcome cases observe104000 recovered versus particular refused403/failed/cancelled/carried-partial/uncertain503 explanations, retain original120000 and Done source. Uncertain case additionally waits for actual104000 repeat evidence while kind remains unverified. `landed-ci-repeat-admission.spec.ts` separates otherwiseeligible105 old receipt from new104 threshold, Taken identity, disable/re-enable unspent receipt, development409 and unsupported provider explanation/409. Original job-unavailable condition is observed before disable, rather than invented eligibility. P1/P2 reconciliation lost reply sees intent on disk while provider reply is gated, stops server, restarts and retains full106000 evidence with acceptance unverified and onePOST; incomplete proof and multiple attempts do not become recovered.

P2 setup: same actual scenario for new-current-reference test; after real request, shared MakeMe history builder supplies a current300000 predecessor reference while saved100000 remains in the ledger. It then serves actual106000 repeat and clears ordinary bounded history, restarting normal collection.

P2 observations: reconciliation frozen-reference test explicitly observes current average300000 before actual106000 still becomes slow against saved100000; original120000 remains run/71/1, persists after clearing/rebuilding history and restart. Existing machine-json-reuse tests assert frozen shared read object, independent replacement refresh, repeated unreadable, unsettled identity, missing-file empty, authoritative default write; revision test observes own/cross-process replacements. Existing adapter test observes original opaque attempt timing migration+restart without switching to discovered newer attempt. History lifecycle asserts first-pass acquisition, pending/restart, two collecting processes, expired-native reference and development read-only; history/scoped-window tests assert exactly20 measured cohort and proof retention despite reversed receipt dates. Landing boundary/admission/retained tests exercise existing capture owner (including identityless, review policy, old startup expiry and installed-Codex delivery). System settings3cases preserve local facts, project selection/history, running native terminal; Recently done2cases preserve published records/sessions/order/malformed explanations. These are normal product consumers, not result fixtures.

P3 setup: `ciFollowUpLedgerFacts.mjs::repeatLedgerFacts` arranges only canonical MakeMe landing/history/request/job inputs. `ciFollowUpMachineTest.mjs` forks real ledger boundaries under isolated HOME. `tests/fixtures/ci-follow-up-worker.mjs` executes actual production spend/read/update/history functions and uses IPC as an event barrier, without wall-clock waits. Native policy builds exact retained cohorts through shared MakeMe API, calling real shared comparison/decision.

P3 observations: ledger tests assert off/old aliases; two independent processes exactly[false,true]; restart/alias/workflow-change no renewal and original workflow staysci.yml; fsynced intent is on disk before SIGKILL prior to submission and fresh process spendsfalse; disabled candidate cannot spend, re-enable does not renew unspent eligibility, another hostname cannot spend a newly eligible receipt; corrupt bytes remain byte-for-byte identical through observer/settings/spend updates and fresh reads; eviction/new faster representation selects original71/1 once; corrupt-ledger fresh attempt2 becomes an identity gap with zero builds while an already retained exact original2 remains readable. Policy matrix asserts104false/105true/120true, insufficient4/zero/failed/missing proof/mixedbasis/equivalent/laterfalse; successful decision retains100000 and5actual evidence rows. Exact-job cases reject carried IDs/bounds, missing jobs, wrong names/SHA and pending/absent/reversed bounds, admitting a fully fresh set with NO job.run_attempt. Existing native order/identity/cohort/finality and full-rerun transport/CLI tests protect affected shared contracts (normal GET and narrow POST/no retry).

P4 setup: same published/collector scenario. Legacy receipt is constructed through shared MakeMe retained history with target deliberately absent; new actual prepare/accept alias has explicit main target. Race runs actual enable POST and immutable prepare concurrently. Browser uses real settings and actual collected states, advancing its controlled clock for15-second read refresh rather than waiting.

P4 observations: legacy/new aliases share one target-main ledger entry, eligiblefalse, two receipt IDs and0POST at otherwiseeligible105000/5samples. Enable/prepare race uses persisted eligibility as its linearization evidence and asserts exactly0or1POST according to that boundary, with no second allowance. Browser exact accessible Done article shows off→on, provisional rule, observed progress, red rgb(220,38,38) Possible CI slowdown, original1min45s/repeat1min46s/saved1min40s, no regression/cause claim, Done unchanged, visible at390px and no sideways scroll; exactlyonePOST71. It supplies no result under test.

P5 setup: current entire dashboard TypeScript graph; observation zero diagnostics/exit0.

P6 setup/observations: existing actual collector and gap scenarios, selected specifically for C095/C096: confirmed planning skip reuses equivalent evidence, ordinary exact/later/error evidence remains retained, timed equivalent without proof remains its existing reused point, reversed bounds never become zero and invalid run URLs are omitted. Terminal59734 exit0,4passed12.3s.

P7 setup: exact raw provider conclusions are the input under test, applied outside domain builders by the synthetic API encoder. Other original/run/job/proof starting facts remain canonical MakeMe/actual receipt collection.

P7 observations: `landed-ci-repeat-verdict.spec.ts` all5cases observe missing, null, neutral, skipped and future provider values as unverified, explicitly asserting explanation does NOT contain failed. Missing/null then change actual provider verdict to success and refresh to observed106000 slow, proving they were not prematurely settled. Production stores the actual nullable verdict. Only explicit failure/timed_out use failed text; cancellation remains its separate explanation. P8 reruns the specifically selected undefined case after the exact provider encoder moved into a cohesive test-support owner to satisfy file size; it observes that helper through the full normal collection boundary. The other verdict bodies and production paths are unchanged by that move.

## Failing-first and diagnosed failures

Initial current-base policy entry import failed because new module did not exist; that only establishes missing entry, not full loop behavior. The meaningful existing product-boundary observation is separate: exact base archive fa1cb8, isolated HOME with one synthetic MakeMe project, production boundary, collectionoff. `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i node /tmp/seed285-baseline-boundary.mjs` session87592 terminal0 recorded GET `/__project-configuration/ci-follow-up?id=open-dough` →404 `Not found`, versus current normal settings/read endpoint200. Complete setup/actual result: `/tmp/seed285-baseline-boundary.json`. Earlier helper69689 terminal1 bundled import.meta incorrectly and ran unrelated CLI entry guards; fixed helper preserves each source import.meta, removed only owned scratch directory and reran the explained baseline. No base product failure was waived.

Browser intermediate failures were deterministic test defects, diagnosed/fixed:54338 exit1 because publishCommittedOrigin replaced synthetic provider answerer (composed prior answerer);81523 exit1 because mounted Board had normal15s old retained snapshot (controlled browser clock advance);91902 exit1 because broad article-heading locator matched a native session as well as Done after refresh (exact accessible article name). P1/P4 final actual journeys pass. New-code typecheck diagnostics were fixed (attempt source/narrowing, optional job URL/config text/assessment union); final31197 passes. No flake, rerun-until-green, skipped failure or unowned repair exemption claimed.

## Consumer trace

Literal command:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/repeat-a-slow-landed-ci-build-once-and-flag-a-pe --base fa1cb8d8dabb05e1cc2102cb39ccdbb0cf1363fa --term collectCiFollowUps --term ciFollowUpEndpoint --term readLandedCiHistory --term registerFollowUpReceipt --term machineJsonStore --term DoneStoryCard
```

Current raw trace `/tmp/seed285-slice3-consumers.md`; all 335 listed consumers have a per-path disposition in `/tmp/seed285-slice3-fa1cb8-consumer-dispositions.md`. P1–P6 above define actual observing assertions/setup for affected history/store/capture/UI/provider boundaries. Broad field/import/name matches are explicitly distinguished from executed tests; there is no claim every unrelated matched feature suite ran. Installed .agents/.claude source matches are untouched; no hand synchronization. Root-owned metadata lexical matches are not my edits. No affected changed contract has an unassigned proof gap.


## Coordinator acceptance

Compared the unchanged independent source review with actual source, plan,
implementation, MakeMe setup and observing assertions. Inspected admission,
reconciliation, verdict, phone-card and native ledger/policy cases and their
provider/receipt setup. These exercise production boundaries; fixtures supply
starting facts, not follow-up outcomes. All P1–P8 terminal results are accepted.
P8 selects exactly one undefined-verdict case after the test encoder moved;
P7's other unchanged cases retain their passing evidence. Baseline87592's
exact-base404 is an endpoint absence observation, not a full-loop assertion.

Freshness is unchanged at main
`af23ca1e5ff11ef31378e45c175e4cfc9d49e8e1`, base09b455646f66ef273375965c55523fa610dfd834.
Named comparison supplier source/done record/reference owners have no incoming
change. Its accepted API is already consumed; no reconciliation is needed.

All335located trace paths have nonempty dispositions, with no missing path.
Affected original-pinned history/reference, capture, settings and enclosing UI
observations were inspected. Generic stores preserve their default contract;
the new preserve/durable options are explicit. The retained source review stays
valid. Full Recently done reviewability C001 is allocated to slice4, which owns
selected-landing comparison navigation; G1/G2 preserve the reported interim
limitations rather than treating them as observations. No live provider action
or real enablement occurred. Independent refactor is accepted below; delivery remains pending.

## Independent refactor

Fresh independent return `/tmp/seed285-refactor3-fa1cb8-return.md` ends with
`## REFACTOR COMPLETE`. Root inspected the new shared `ciFollowUpRule.ts` and
its admission, retained schema, observation and prose callers. It removes
duplicated arithmetic and policy text; classification reads `request.rule`.
No observable rule, public re-export, builder, provider operation or source
promise changed. No other refactor candidate or unresolved gap was reported.

Renewed actual collector/settings/outcome/phone proof:

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-admission.spec.ts backend-tests/intent/landed-ci-repeat-reconciliation.spec.ts backend-tests/intent/landed-ci-repeat-verdict.spec.ts tests/intent/recently-done-ci-automatic-repeat.spec.ts --workers=1 --reporter=list
```

Session25679 exit0,22 cases in1.5m. Same actual receipt/provider MakeMe setup
and assertions as P1/P2/P4/P7; explicitly includes final failure/cancellation,
104000 recovery,106000 persistence against saved100000/current300000,
missing/null refresh and red phone card. No result is supplied by setup.

Renewed decision and durable ledger proof:

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/support/ci-follow-up-ledger.test.mjs tests/support/ci-follow-up-policy.test.mjs
npm run typecheck:dashboard
```

Session39229 exit0,2 selected files (17 policy/8 ledger cases); session94065
exit0, complete graph with no diagnostics. These renew P3's changed schema/rule
and P5. Other P2/P3/P4/P6 boundaries, setup and assertions are unchanged and
retain their accepted terminal evidence rather than repeat for process.

New trace command uses the installed consumer-trace script at basefa1cb8 with
terms followUpRule,provisionalRepeatRule,reachesFollowUpThreshold,
repeatDecisionOf,observeRepeat and the three actual outcome/rule texts.
`/tmp/seed285-refactor3-consumer-dispositions.md` has783located/783nonempty
dispositions; root checked no missing path. Added metadata/lexical matches do
not claim unrelated feature execution. New rule consumers have renewed proof.
At launch AC100%,load2.00/4.30/5.65,65%free; one browser worker, bounded native
and incremental type checks. Every owned handle is terminal; no watch remains.
Read-only actual/Prettier size checks cover all44dirty files and stay at250 or
below. Root metadata hashes were unchanged by refactoring; no generator applies.

Guarded preparation then exposed typed tooling findings, corrected and verified
in [preparation repair proof](slice-3-preparation-proof.md). No commit or push
preceded that repair. Its independent continuation is the final refactor gate.
