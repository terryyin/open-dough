# Slice 3 proof recovery and retained payload

Failure policy: [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests), applied as written. Base `6dd3948b12681f72480e1135f2c02eeadc13734a`. Root owns planning, independent refactor, formatting, staging, status, publication and CI. This return is uncommitted.

## Implemented behavior and PFE

The existing collector now asks `needsCollectedProof` for each retained passed attempt independently of landing-resolution finality. `collectedProofOf` returns the actual existing reader answer with a pending/final judgment. Optional `KeptBuild.proofPending` persists that judgment; absent means an older record whose missing/unreadable answer is classified on its next read.

Classify before serialization: native `isUnansweredProof` identifies only the original in-process failed/waited/malformed-listing answer. A known attempt's missing proof can arrive later. Native unreadable is pending only for an unanswered acquisition; an answered corrupt ZIP is final. Adapter unreadable is recoverable command acquisition. Missing native identity, ambiguous adapter identity, expired/invalid/mismatched/oversized proof are final. No attempt or scope is inferred from current trunk.

`historyWithProof` owns the existing atomic writer's proof merge: accepted summaries are immutable, a classified final unavailable answer survives a stale pending writer, a validated summary may promote unavailable evidence, and an evicted build is not recreated. The writer's new argument is optional for existing direct callers. Identity normalization, the shared window, live proof readers and landing resolver remain the existing owners. The pure merge extraction keeps the store under250lines instead of duplicating storage policy or exporting its private machine store.

Independent read-only PFE `/root/implement_slice3/retry_review` examined original-object classification, adapter command failure, absent identity, legacy classification and late writers before implementation. It later authored only the adapter recovery test. Child lifecycle proof used the existing real Git/CI/receiver fixtures. No child ran heavy verification; parent owned all commands below.

## Decisive red and repair

```sh
caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-scope-proof-recovery.spec.ts --grep 'same collector' --workers=1
```

Before production edits, session39727 exited1. A fresh exact passed run retained `unavailable/none`; after actual CLI summary bytes became available for that same attempt, the periodic collector still returned unavailable instead of summary. Failure at spec64, kept `dashboard/test-results/2026-11-09T13-05-29.620Z-72641/report.txt` and `/tmp/trace-proof-285-slice3-recovery-red.txt`. This was the intended behavior failure, not an import or fixture failure. Root independently inspected it.

After the core change, the two recovery cases passed in session45546, `/tmp/trace-proof-285-slice3-recovery-green.json`. The later9-case final selection includes those same cases, so they are not counted twice.

Final prerequisite typecheck initially rejected a new retained-file fixture missing required `failed`/`other` fields. Added explicit0/0 at the canonical MakeMe builder call, preserving its effective passed1/duration facts and existing defaults. No assertion, timeout, retry or product policy was weakened. Final typecheck and all selected tests pass; no failing/flaky test remains.

## Terminal proof and selection

Before the final heavy selection:21:21SGT, AC power,48GiB host, load3.39/4.26/4.06 and54% memory free. Root confirmed no competing owned heavy proof. Chose one worker under `caffeinate -s -i`; no unrelated process was touched. All new cases keep the default timeout; no sleeps, `test.slow`, suite/group/hook override or rerun-until-green. Tests followed all runtime/helper edits. The subsequent maintained-doc text update changes no test setup or runtime boundary.

```sh
npm run typecheck:dashboard
caffeinate -s -i node --test --test-concurrency=1 tests/support/intent-ci-scope-history*.test.mjs tests/support/landed-ci-history*.test.mjs tests/support/dashboard-ci-scope-history-read.test.mjs
caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-scope-proof backend-tests/intent/landed-ci-scope-retained-window.spec.ts --workers=1 --list --reporter=list
```

Session72955 terminal0 for this dependent prerequisite chain. Typecheck0; captured Node output `/tmp/trace-proof-285-slice3-node-final.txt` has40passed/0failed/0skipped. This is prior37 + slice2matching2 + new atomic proof-write1, not41. List selected9tests/6files; list retained `/tmp/trace-proof-285-slice3-list.txt`.

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-slice3-lifecycle-proof.json caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-scope-proof backend-tests/intent/landed-ci-scope-retained-window.spec.ts --workers=1
```

Session14756 terminal0. Independently parsed custom record: phasecompleted, selected9, runnerpassed/strictpassed,9expected-passed executions and9passed attempts/retry0; duration26.19s. No skipped/fixme observations. These are the8new cases plus the strengthened existing actual21st case.

```sh
caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci --grep-invert 'a failed adapter proof command|an actual Done submission|a final corrupt exact proof|a final retained build|pending CI resumes after|an exact passed attempt resumes|the twenty-first accepted landing' --workers=1 --list --reporter=list
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-slice3-backend-consumers.json caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci --grep-invert 'a failed adapter proof command|an actual Done submission|a final corrupt exact proof|a final retained build|pending CI resumes after|an exact passed attempt resumes|the twenty-first accepted landing' --workers=1
```

Session50229 terminal0. List26tests/17files; parsed custom record26strictpassed,0skips/retries. These are the other existing changed collector/store/identity/proof consumers, disjoint from the9. Together35distinct backend cases have passing observations. No settled new case was rerun by this continuation.

## Source promises and observing assertions

| Commitments | Setup → observing boundary/assertions |
| --- | --- |
|19,113; G5 restart/resume | `landed-ci-scope-proof-recovery`: exactnative91 empty listing→actual CLI V2 in same collector; failed listing→summary after close/restart. Same final resolution, one run key, case1200/file80 plus zero, retained breakdown and public entry/folder/file values. `...adapter-recovery`: command exits2, collector restarts, published V2 summary retains full run/attempt/revision tuple, case1200/file80/zero and no GitHub requests. |
|19,113; interrupted lifecycle | `...proof-lifecycle` pending case closes while CI runs, expires every launch record, then starts two collectors after the run passes. Actual CLI summary/breakdown retained once, one attempt key and receipt, foldercase200/file20, both servers read the same public answer. Collection-off restart/repeated reads add no provider requests. |
|20; repeated Done | `...proof-completion` uses real `resultToLand`/`land` admission, actual `/__agent-launch/completion`, the launch's reporting reference/session host and `.retrying(first.delivery)`. Same accepted receipt, unchanged whole retained history, one run63 key and archive acquisition, then entry500/50, folder300/30 and zero-file local reads. Completion itself does not nudge collection; startup/periodic/capture owns resumption. |
|22,115; G17 final-build backfill | `...proof-lifecycle` two cases seed canonical final measured run61 with no proof or legacy unreadable lacking proofPending; no launch records. Actual CLI bytes backfill both, landings remain exactly unchanged, only artifact-list/ZIP requests occur—no run/workflow re-resolution. Reader restart shows entry500/50, folder100/10 and zero. |
|21,116; G17 bounded payload | Existing actual21st test now retains old published file breakdown, collects newcase2100/file210/zero and keeps a shared retained receipt on one attempt. Exact20build keys/remaining receipts/trunkOrder, oldest proof/build/unshared reference absent, old retained payloads unchanged, common project/scope cohort and no orphans. Evicted selected endpoint gives one nonnumeric outside-retention gap; rereading adds no CI. |
|88; persisted local browsing/shown scope | New native/adapter/backfill/lifecycle/completion cases restart collection OFF and request entry/folder/file/zero scopes, including repeated reads and exact operation counts. Public DTO is unchanged. Compose this new resumed-payload→public-scope proof with accepted slice2 actual folder/file/Purpose/Proof journeys after reader restart (`slice-2-acceptance.md`, `refactor-slice-2.md`): same reader/schema/renderer/selection, unchanged code and observations. No new UI test or claim that reader-only restart proves collection-on resumption. |
|1; observed builds, no causation | Unchanged `IntentScopeTimingHistory` labels Selected landing and “Observed scope at each build; cumulative test execution time, distinct from CI wall time”; existing comparison frame and maintained doc state observed/not attributed. New code acquires named attempt evidence only; it adds no causal calculation. The accepted actual UI2 evidence remains reusable. |
|101–111,118,119; exclusions/context | Aggregate diff/owners inspected: no moving averages, historical-reference deltas, outlier filtering, CI rerun request, slowdown indicator, historical rename discovery, fixed membership, recovery of evicted history, window selector, case-level history or separate story wall-time chart added. Current file path remains history's path; comparison rename mapping stays separate. Same20distinct-build quota remains, without guaranteed30-dayDone coverage or one-day cutoff. About-a-day span/removed mockups are context, not deliverables or new layout/technology. |

Additional finality proof: `...proof-finality` first stores an answered corrupt native ZIP. On restart another older pending attempt becomes a valid summary, an observable barrier after the newest-first pass encounters the corrupt attempt. The corrupt payload stays unchanged and its archive-list count remains1 even when a valid replacement is served. `landed-ci-history-proof-finality.test.mjs` exercises real isolated-machine atomic writes: pending→final corrupt→late pending remains final, then validated1200 summary promotes the gap and survives late pending/9900 replacement, preserving landing resolution.

## Directed consumer dispositions

Final installed trace, session89069 terminal0:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/trace-a-done-story-s-timing-history-into-test-pr --base 6dd3948b12681f72480e1135f2c02eeadc13734a --term proofPending --term needsCollectedProof --term collectedProofOf --term historyWithProof --term keepLandedCiProof --term unavailableBecause --term proofFor > /tmp/trace-proof-285-slice3-consumers-final.md
```

| Owner/reached consumers | Disposition |
| --- | --- |
|Collector → original artifact/adapter dispatch → proof eligibility/classification|Run9new/strengthened plus26existing backend cases: closed-view acquisition, pending interruption, native/adapter and stand-in proof waits remain correct. Exact/final retained proof backfills independently; no resolver or live reader change. |
|KeptBuild schema → machine JSON/read → `historyWithProof`/atomic writer|Run40Node and35backend. New atomic-case observes pending/final durability and late writers. RawV1 normalization, contextual/legacy adapter identity, missing subject, safe URL, store-failure/read-order cases remain green. Optional metadata preserves old records. |
|Identity/window/trunk-order owners|Whole-build spreads preserve pending metadata. Run actual21st/shared-ref retention, unknown-order deferral/restoration, all-parent ancestry, existing equivalent/later/opaque tuple cases; no new quota or identity model. Accepted summaries remain strongest under concurrency. |
|Public project/scope read, DTO/URL schema, authenticated local reader|Run35backend +40Node: actual resumed scope values/zero, exact public project answers, local-only reads and local rate-limit/error behavior. Internal proofPending is not projected by `historyBuildOf`; client contract unchanged. |
|Existing ScopeTimingHistory/Units/Evidence, file wrapper and current comparison/navigation|Reuse accepted slice2 actual23browser observations and3post-refactor producer journeys, plus slice1 unit/legacy/provenance/phone/keyboard proof. No UI, transport, public contract or producer default changed here; new resumed payloads are observed at that same authenticated boundary. Root explicitly accepted this proof composition; no blanket UI repeat. |
|Launch boundary/startup/repeating loop/capture nudge/completion receiver|Run actual pending/restart/two-process and real completion receipt+retry cases. Existing loop schedule/abort and completion semantics unchanged. Do not label completion retry as the acquisition trigger. |
|Canonical proof/history MakeMe builders|Additive `unavailableBecause` and `proofFor` only, no default changes.40Node/35backend reach these and all current CI-history setup consumers. Unrelated MakeMe importers do not call the new methods or consume changed defaults, so excluded from blanket suites. |
|Actual native CLI/ZIP serving, retainedTrunkProofs and public cohort observer|One new technical serving wrapper delegates existing trunkActions/publishes and preserves original CLI text for ZIP. Reuse published producer; adapter test uses published fragment/summarize helper plus real command execution. Retention optionalfile default unchanged; actual21st and old unknown-order consumer pass. Existing public assertions moved without removing independent expected orders/values. |
|Prose, planning, managed copies, generic byFile/file/entry/run/build matches|Excluded lexical/contextual matches. Product-backlog byFileName is unrelated. CLI byFile implementation is unchanged and reached through actual native summaries. Root owns planning; installed guidance untouched. Broad raw trace blank cells are superseded by this directed record, not pending consumers. |

## Ownership and quiescence

`/tmp/trace-proof-285-slice3-owned-paths.txt` lists18nonplanning files:5core server files,5new backend specs plus strengthened existing retention,3technical fixture files,2canonical builder files, one atomic Node test and maintained comparison doc. Root's planning edits excluded. No staging, formatting, commit, status, publication or CI operation performed by this agent/children.

Final `git diff --check` terminal0. All18paths searched marker-free. Prettier API preview18paths≤250lines, maximum lifecycle250; actual selective formatter remains root-owned. Source tests/data/code writers, both children, typecheck/Node/Playwright/list/trace command handles are terminal and quiescent. No unresolved slice3 implementation or proof gap remains. Independent refactor and actual formatter/delivery/CI gates belong to root.

Independent refactor and renewed actual lifecycle proof: [refactor-slice-3.md](refactor-slice-3.md).
