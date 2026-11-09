# Independent slice 3 refactor

Failure policy: [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests), applied as written. Accepted base6dd3948b12681f72480e1135f2c02eeadc13734a. Root owns planning, actual formatter, index/status, publication and CI.

## Decision and bounded edits

Read-only decide pass covered the whole current diff, proof acquisition, kept-state schema, atomic policy, collector orchestration, readers, tests, canonical builders and applicable Accepted ADRs0001/0002/0008. No architecture conflict or production subsystem crossing. Read-only child fixture_review inspected all five new specs, retention and support/builder changes; it found no fixture candidate or lost assertion.

One new rule duplication required a small refactor: `hasProofAttempt` repeated the missing/ambiguous identity gate already used by `readCollectedProof`. In `dashboard/server/landedCiCollectedProof.ts`, private `collectedProofSubjectOf` now creates either that exact valid `CiProofSubject` or the existing unavailable answer once. Unsupported identity returns pendingfalse directly. The original reader result is still classified before serialization, using canonical `isAdapterProofAttempt(subject)` beside native `isUnansweredProof`.

Only that production file changed in this refactor. Removed the two private helpers `hasProofAttempt` and `readCollectedProof`, added private `collectedProofSubjectOf`; no file renamed/deleted or public API changed. Existing missing/ambiguous conditions and explanation strings, native run/attempt/revision fields, adapter full tuple/branch, reader call and pending/final rules are preserved. Read eligibility and atomic immutability remain distinct boundary responsibilities. No generic lifecycle framework is justified.

## Verification and retained proof

Fresh host21:33SGT: AC power,48GiB, load3.26/3.92/4.28,55% memory free. Root/implementation teams had no competing owned heavy command. Other owners' exact workloads were not inspected; observed headroom supports one worker for a roughly26-second selected workload. Use caffeinate; reconsider on contention/failure. All refactor edits finished before these commands.

```sh
npm run typecheck:dashboard
```

Session13460 terminal0. Canonical subject discriminator, narrowed unsupported answer and unchanged collector return type compile.

```sh
caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-scope-proof-recovery.spec.ts backend-tests/intent/landed-ci-scope-proof-adapter-recovery.spec.ts backend-tests/intent/landed-ci-scope-proof-finality.spec.ts backend-tests/intent/landed-ci-scope-proof-lifecycle.spec.ts backend-tests/intent/landed-ci-scope-adapter-identity.spec.ts backend-tests/intent/landed-ci-scope-adapter-shared-attempt.spec.ts --workers=1 --list --reporter=list
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-slice3-refactor-playwright.json caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-scope-proof-recovery.spec.ts backend-tests/intent/landed-ci-scope-proof-adapter-recovery.spec.ts backend-tests/intent/landed-ci-scope-proof-finality.spec.ts backend-tests/intent/landed-ci-scope-proof-lifecycle.spec.ts backend-tests/intent/landed-ci-scope-adapter-identity.spec.ts backend-tests/intent/landed-ci-scope-adapter-shared-attempt.spec.ts --workers=1
```

List terminal0 selects9tests/6files. Actual session73464 terminal0. Independently parsed custom record: completed, selected9, strictpassed,9expected-passed executions and9passed retry0 attempts,0skips;23.87s. Record path was fresh before launch. No failure occurred during this pass.

Concrete observing locations: native recovery spec34/64 observes same-process missing and restarted unanswered acquisition; adapter recovery spec24 observes full contextual request and persisted1200/80/zero readings; finality spec15 uses the completed-pass barrier and one corrupt request; lifecycle spec27/78 observes old final proof backfill and pending/two-collector resumption; adapter identity spec26 and shared-attempt spec29 observe distinct opaque contexts and one actual shared point. Each reaches the changed subject construction through the real collector and public scope boundary.

The implementation's40Node tests have unchanged runtime paths/setup/observations under this refactor: eligibility, atomic merge, schema, normalization, ordering, timing and pure scope projection were not edited. Reuse them. The remaining implementation backend observations retain their specific unchanged responsibilities; their shared subject-acquisition portion is renewed by the9 selected cases above. In particular completion receipt idempotency and true21st co-eviction assertions/fixtures are unchanged, while their exact-native identity branch is renewed by native recovery/backfill. No blanket repeat is required. Existing slice2 UI-after-reader-restart composition remains exactly the implementation's qualified claim; no new rendered-resumption test is claimed.

`git diff --check` passes. Check-only Prettier simulation of all22 then-current changed/new files found none above250lines; maximum250 is the lifecycle spec. Root may add its later records and owns actual formatter. No generator trigger applies.

## Directed consumer dispositions

Installed trace terminal0, session54302:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/trace-a-done-story-s-timing-history-into-test-pr --base 6dd3948b12681f72480e1135f2c02eeadc13734a --term collectedProofSubjectOf --term collectedProofOf --term needsCollectedProof --term hasProofAttempt --term isAdapterProofAttempt --term proofPending > /tmp/trace-proof-285-slice3-refactor-consumers.md
```

| Consumer/concept | Disposition |
| --- | --- |
|Collected subject → collectedProofOf → LandedCiCollection startup/repeating/capture path|Run9 selected real backend cases. Same actual native/adapter subjects, reader validation, pending judgment, one attempt and public values. No extra acquisition or resolver introduced. |
|Canonical isAdapterProofAttempt/CiProofSubject/CiProofUnavailable → live reader/authenticated proof, evidence labels and comparison hooks|Canonical definitions and those callers unchanged. New import reuses the same discriminator already used by readIntentCiProof. Typecheck plus native/adapter actual dispatch run; reuse implementation35backend/earlier live and UI proof for unchanged branches. Broad type imports do not imply new effects. |
|needsCollectedProof, KeptBuild proofPending, historyWithProof/atomic store, identity normalization, measured window and public project/scope readers|Refactor edits none of their rules or fields. Reuse40Node/35backend implementation observations, with9 actual acquisitions renewed here. Pure atomic strongest-answer/eviction proof remains unchanged. |
|New native recovery/adapter/finality/lifecycle and existing contextual/shared adapter cases|Run9 after all edits. Their actual inputs and independent assertions are unchanged; only private subject derivation moved. |
|Actual completion receiver/retry, retained21st cohort/proof/refs/order, old schema/legacy and remaining collected consumers|Reuse their unchanged specific assertions; common valid-native subject path renewed by9. No fixture or entry path was edited and no special outcome supplied by setup. |
|Shared CLI/ZIP/router, MakeMe proof/history builders and support observers|No refactor edit. New9 still traverse these owners; implementation proof/default/discovery dispositions remain valid. Read-only fixture review found no duplication or second scenario framework. |
|UI ScopeTimingHistory/Units/Evidence/file wrapper, transport/local reader/schema, current comparison and source selection|No refactor edit or public payload change. Reuse accepted slice2 actual23browser and3renewed producer journeys, as explicitly composed with new public resumed values in implementation record. |
|Removed private helper names|rg across executing dashboard/tests code finds no remaining hasProofAttempt/readCollectedProof references. Archived coordination prose is not a caller. |
|Planning/seed/done reports, managed copies/install/source-review helpers, generic PLAN/byFile/artifact/build/type matches|Excluded: root-owned coordination prose, unchanged discovery duplicates/CLI contracts or separate concepts. The installed trace covers the whole incoming diff, so these broad matches are not extra effects of this one-file refactor. Implementation's directed record covers the unchanged18-path incoming change. |

Raw blank trace cells are superseded by this directed table and the implementation record; no effect-reaching consumer is left pending. No unresolved contradiction or refactor gap remains.

## Ownership and quiescence

Manifest `/tmp/trace-proof-285-slice3-refactor-owned-paths.txt` retains implementation's18owned nonplanning files; the one refactor path was already included. No planning, formatting, index/staging, status, commit, publication or CI action performed. All writers, read-only child and typecheck/list/test/trace commands are terminal and quiescent. Root owns actual format, final CI/observation and delivery. Approximate active elapsed:8minutes.

## REFACTOR COMPLETE
