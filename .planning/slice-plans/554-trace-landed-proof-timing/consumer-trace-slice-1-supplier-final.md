# Slice 1 final published supplier reconciliation

Failure policy: [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests), applied as written.

## Context and implemented delta

Current base `8a9c7ed156bf73241cc394ee77551be76ea352ed` imports published main `e623ab143`, including supplier final `ff10440aa` after the previously integrated `6f5be8b8`. Reviewed that actual delta, rather than copying a supplier draft. Root owns planning, index resolution and delivery. No planning, staging, formatting, commit or publication operation was performed here.

Six working product conflicts are resolved marker-free:

- `landedCiCollection.ts`: keep ancestry order supplied to the real writer, stop an unread-CI project with `break` so local order persists, and continue past an unanswered stand-in proof as the supplier intends. Own retained-proof acquisition remains outside landing finality, with existing G5 retry still deferred to slice3.
- `landedCiHistoryEntries.ts`: preserve the incoming named gap build and safe run fields together with own legacy/unclassified/identity explanations and ancestry order.
- `landedCiObservation.ts`: union imports, canonical storedV1 normalization/current strict schema, contextual adapter keys and the supplier's named gap schema/reason classification.
- `landedCiHistory.ts`: retain incoming pending`proof`/final`no-proof` beside own pending`order` and legacy/identity reasons. Existing URL validation and wall-time semantics remain shared.
- `landed-ci-history-gaps.spec.ts`: retain incoming concrete gap metadata and dynamic actual times, not duplicated old expected gaps. Add a real authenticated entry-scope read of the collected named gaps, with no timing and no additional provider calls.
- `intent-ci-wall-time-history-window.spec.ts`: use incoming shared page helpers and richer gap assertions, preserve explicit synthetic trunk order. Do not re-add the all-gaps case now owned by the incoming dedicated spec.

An effect trace and independent read-only child review found one additional semantic seam: scoped non-build projection discarded newly retained `observed.gap.build`. `ciScopeHistoryGap.ts` now projects the named build/revision/provenance and `runOf` safe identity/link, preserving receipt date and nonnumeric status. It also carries that represented landing's role. The existing DTO and evidence renderer already support these fields. This cohesive extraction keeps `ciScopeHistory.ts` below250lines without another history owner.

`intent-ci-scope-history-gaps.test.mjs` adds a decisive expired/equivalent, unreadable/later and no-proof/exact metadata matrix. `intent-scope-timing-history-gap-build.spec.ts` observes a selected nonnumeric later-build gap, zero measured count, no chart, receipt date, qualification and run link; keyboard Shift+Tab/Tab returns to that link at390px. This supplemental presentation case injects a canonical DTO, not claimed as collection proof. Actual collection-to-public proof is the backend gap case.

## Honest failures and repairs

1. Before the projection change, `caffeinate -s -i node --test --test-concurrency=1 tests/support/intent-ci-scope-history-gaps.test.mjs` ended1:3pass/1fail, chunkcf8e84. The new assertion expected named build71 but gotundefined. After the new gap projection, the same case passes, together with existing safe-link cases and the full37-case own Node selection.
2. Backend continuation initially21pass/1fail. Imported lifecycle fixture's graph is `expired → measured → unbuilt → running`, explicitly constructed by consecutive publishedLanding calls. Its expected pending list had `unbuilt` before `measured`; its restarted expected list accidentally had `unbuilt` twice. Corrected only those expected lists to `measuredPoint, unbuiltGap, running`. Kept original graph, receipt facts, reversed record insertion, expired record setup, run identities, two-process/restart/no-CI observations and exact cardinality. Focused lifecycle then passed. That working file now equals importedHEAD, but its index still contains the stale3way expectation: root must restage the whole owned file.
3. Browser continuation initially26pass/1fail. Incoming all-gaps presentation fixture had no `trunkOrder` for synthetic e0–e6 revisions. Added explicit positions via canonical `.inTrunkOrder([0..6].map(...))`, as other synthetic history rendering cases do. Dates,7expected reasons/roles/run links, phone/keyboard assertions and independent expected list stayed unchanged. This is a presentation precondition; it does not prove Git ancestry. The focused case then passed.

No timeout/retry was increased, no assertion was removed, and no failure was exempted as pre-existing. The initial failing whole commands are not reported as green. Their failing titles are matched to passing focused repair records below.

## Host and terminal proof

Before heavy proof: macOS20:10SGT, AC power,48GiB host, load2.58/2.82/3.09,60% memory free. Root had no competing heavy proof. Used one Playwright worker and `caffeinate -s -i`; no broad full suite. Reconsidered the actual shared-reader/collector effects rather than repeating every earlier G15 consumer.

```sh
caffeinate -s -i node --test --test-concurrency=1 tests/support/intent-ci-scope-history-gaps.test.mjs tests/support/intent-ci-scope-history-links.test.mjs
```

Terminal0,12pass/0fail/0skip (session58307, followed by successful dashboard typecheck). The matrix observes exact named build metadata, unchanged landing date, empty readings/no ms, and existing native/adapter invalid-link cases preserve numeric100ms or pending identity.

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-supplier-final-gap-proof.json caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-history-gaps.spec.ts backend-tests/intent/landed-ci-history-comparison-gap.spec.ts backend-tests/intent/landed-ci-history-pending-proof.spec.ts tests/intent/intent-scope-timing-history-gap-build.spec.ts --workers=1
```

Identical preceding path selection with `--list --reporter=list` selected6tests/4files. Actual terminal0 (session96744):6strictpassed,0skips/retries. Five backend cases exercise real native resolution/collection/public metadata and unchanged live comparison omission, including both supplier unanswered-proof lifecycle cases. One supplemental scope gap UI passed; its stronger keyboard assertion is renewed by the final2-case command below. Comparison-only final-gap test body moved unchanged into the new dedicated spec to keep the actual collection case below250 formatted lines.

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-supplier-final-backend.json caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci --grep-invert "a final gap names|a build that completed|the CI timing comparison answers a Landed gap|a skip whose equivalent build's CI proof read GitHub|a skip recorded two hours ago" --workers=1
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-supplier-final-lifecycle-repair.json caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-history-lifecycle.spec.ts --workers=1
```

Family list selected27tests/18files; first command excludes the five already-passed backend cases. First terminal1 (session19882):22selected,21pass/1fail,0skips/retries. Repair terminal0 (session29422):1selected/1pass,0skips/retries. All27 distinct current backend cases have passing observations: native/adapter V2 acquisition, mixed storedV1, exact/equivalent/later/shared identity, pending/unread-CI order, true21st retention, unknown-order deferral/resumption, actual store and source lifecycle.

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-supplier-final-browser.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-wall-time-history tests/intent/intent-scope-timing-history tests/intent/intent-scope-collected-timing-history.spec.ts tests/intent/intent-summary-story-comparison.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts tests/intent/intent-summary-ci-proof-gaps.spec.ts --grep-invert "a final proof gap names" --workers=1
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/trace-proof-285-supplier-final-browser-repair.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-wall-time-history-gaps.spec.ts tests/intent/intent-scope-timing-history-gap-build.spec.ts --workers=1
```

Family list selected28tests/19files; first command excludes the already-passed new scope gap presentation. First terminal1 (session91223):27selected,26pass/1fail,0skips/retries. Repair terminal0 (session58310):2selected/2pass,0skips/retries. All28 distinct current browser cases have passing observations: actual Done P/E/R endpoint/artifact collection/units/local502Retry/noCI, project order/provenance/newgap labels/phone links, scoped units/gaps/segments/provenance, and existing enclosing comparison/gaps.

```sh
PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_OUTCOMES=/tmp/trace-proof-285-supplier-final-primary-outcomes.txt caffeinate -s -i bash scripts/test.sh tests/support/dashboard-ci-proof-read.test.mjs tests/support/dashboard-landed-exact-build.test.mjs tests/support/dashboard-later-trunk-landed.test.mjs
```

Terminal0(session33734); outcomes exactly3passed filejobs. Covers native proof validation, successful-only memo and unanswered-object identity, exact timedout/rerun metadata, and later-trunk unavailable/final selection.

```sh
caffeinate -s -i node --test --test-concurrency=1 tests/support/intent-ci-scope-history*.test.mjs tests/support/landed-ci-history*.test.mjs tests/support/dashboard-ci-scope-history-read.test.mjs > /tmp/trace-proof-285-supplier-final-node-proof.txt
npm run typecheck:dashboard
```

Combined terminal0(session84839); captured Node output37pass/0fail/0skip; dashboard tsc0. Renews current endpoint/cohort/units/timing/gaps/links, all-parent ancestry, contextual adapter identities/compatibility, mixed retainedV1 conversion and local limit isolation. New browser fixture edits afterward only state synthetic order and strengthen keyboard observation; production/model/type paths unchanged.

Custom proof records were independently parsed: completed phase, selected counts, expectedStatuspassed, retry0. The one failed backend title is contained in lifecycle repair's passed titles; the one failed browser title is contained in browser repair's passed titles. Duration/context and initial failures remain recorded, not erased.

## Directed consumer dispositions

Final installed trace (terminal0, session13301):

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/trace-a-done-story-s-timing-history-into-test-pr --base 8a9c7ed156bf73241cc394ee77551be76ea352ed --term pendingWaits --term scopeHistoryGapOf --term retainedProofSchema --term keepLandedCiResolution --term no-proof --term inTrunkOrder > /tmp/trace-proof-285-supplier-final-consumers-final.md
```

| Reached owner and consumers | Disposition / decisive observation |
| --- | --- |
| `landedCiCollection` → store/resolution/proof dispatch/ordering/window | Reconciled order-argument+break, final-build proof acquisition stays independent.27backend renews actualnative/adapter acquisition and lifecycle/retention effects; actualDone browser reaches closed-view collection and reader. G5/G17 remain3, not claimed by reader-only restart. |
| `landedCiObservation`, `landedCiHistory` enums/schemas, `landedCiHistoryIdentity`/CollectedProof | Incoming proof/no-proof/namedbuild plus own order/legacy/contextual identity/V1 union retained.37Node and actualbackend rawV1/store/native/adapter identity cases pass. Legacy labels never become comparable units. |
| `landedCiHistoryEntries` → `intentCiHistoryRead` → authenticated project history and `IntentCiHistory`/Evidence/Chart/Plot/`ciHistoryWords` | Named gap metadata and reason preserved with shared safe run fields. Actual gap backend and all project browser family pass; window and order cases retain newest20/ancestry/date extents. New syntheticallgap order is explicit, not inferred. |
| `ciScopeHistory` → new `ciScopeHistoryGap` → shared DTO/reader/hook → ScopeTimingHistory/Evidence/Units | New gap matrix fails without projection and passes with it; actualbackend scoped read observes5named gaps/no timings/no extraCI. New rendered gap nameslaterrevision, qualification,0count, receiptdate and keyboardlink. All existing scope browser and37Node renew unchanged perunit behavior. |
| Shared resolver `baseCiRevisionLookup`/Nearest/`exactSkippedEquivalent`/`laterTrunkBuild`/`landedWithoutVerdict`/`unusableBuild`, native artifact reader and live comparison slot | Consumed published owners, no duplicate resolver or reader.3primaryfilejobs,2newpendingbackend, actualnewgapbackend and unchanged moved comparison-slot test pass. Browser enclosingcomparison/gaps and actualDone prove reached live consumers. |
| Existing shared chart/row/link, current comparison/proof and `IntentScopeProof` selection context | Project and scope families above pass including mainrealDone and gap link. Reuse G15 ten explicit V2/legacy proof/comparison browsercases and sevenprimaryunit jobs for unchanged unit contract/UI; incoming native unanswered classification does not change summary conversion or declaredunit rendering. |
| `authenticatedGet`/read guards/error owners, local history and live upstream readers |37Node limit isolation and actualDone corruptstore502/Retry/noCI pass. Existing local-only flag and live freshness/request guard unchanged by supplier delta. |
| Canonical MakeMe proof/evidence/history/landing/launch/source/preparation builders and technical fixture/page helpers | Canonical bodies/defaults retained; only new syntheticallgap call states missing order.27backend/28browser/37Node reach current history/proof paths. Unrelated MakeMe importers have no changed default; earlier G15/preparation/source builder dispositions remain reusable. |
| Current selectors, unit/timing signatures and scopes without namedgapmetadata | Reuse unaffected G15 observations; own Node/perunit UI and realDone renewed. No file Proof extension, historical rename inference, collector transient proof retry or stronger restart claim is made. Those remain slices2/3. |
| Prose, planning, installed copies and broad lexical matches | Root owns planning/source maintenance. Existing instructions, generic evidence/entry/read/run words and unrelated launch/completion/default/profile contexts do not call changed scope-gap projection or supplier proof semantics; raw broad matches are discovery, not additional pending callers. Managed copies unchanged. |

## Ownership and quiescence

`/tmp/trace-proof-285-supplier-final-owned-paths.txt` contains97nonplanning owned paths: union of original93 and current effect paths. Include the lifecycle file even though its working content equals importedHEAD; its stale staged3waydiff must be restaged away by root. Root planning paths are excluded.

All97nonplanning files are conflict-marker-free. The implementation agent left index resolution with root. Root subsequently confirmed clearing all7U entries (including its PLAN) and restaging the lifecycle file; no U entries remain. Final `git diff --check` passes. Prettier API simulation finds no nonplanning file above250lines, maximum250store; actual formatter remains root-owned. No source conflict, refactor, status or delivery judgment was taken here. All own/child writers, traces, lists and verification commands are terminal and quiescent. No unresolved slice1 implementation/proof gap remains in this delta; G5 and G17/folder-file future work remain explicitly owned by later slices.
