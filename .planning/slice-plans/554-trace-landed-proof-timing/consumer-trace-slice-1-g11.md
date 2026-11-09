# G11 retained adapter identity

Identity SEED-285#trace-landed-proof-timing, working contents over base `5187b17548e20e3d48f839b5d0b55a2f700e6293`. Failure policy: [AGENTS.md#failing-and-flaky-tests](/Users/terryyin/git/open-dough/.worktrees/trace-a-done-story-s-timing-history-into-test-pr/AGENTS.md#failing-and-flaky-tests).

## Changed behavior and compatibility

The existing per-project store owner now keys adapter builds by an opaque-safe JSON tuple of textual runId, textual attemptId and measured revision. Raw numeric/string identity fields remain on the stored build, native GitHub run keys remain unchanged, and same full subjects deduplicate. No discovery/proof-reader/resolver lifecycle changed.

The existing read/update owner projects legacy `attempt/<id>` records into full keys. Supported exact surviving metadata/proof remains available. A demonstrably mismatched exact reference, unprovable legacy non-exact reference, ambiguous adapter or mismatched proof becomes a final explained identity gap. This happens before collector skip-final and before project/scoped readers, rather than only in chart projection. Browsing does not write; existing store updates persist the canonical view atomically. New trusted equivalent/later resolutions reuse the surviving full subject and retained proof once.

Old bytes cannot reveal a same-SHA overwrite to another run: no reconstruction or detection of that lost original association is claimed. These compatibility gaps do not claim automatic re-resolution/recovery. No migration framework or new resolver was added.

## Exact terminal proof

The real acquisition failing-first command was:

```sh
caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-scope-adapter-identity.spec.ts --grep 'different adapter runs' --workers=1
```

Session76526 exit1 at line72: first run-a/revA proof1200 was acquired; second run-b/revB with the same opaque attemptId reached stored build resolution but its proof request never occurred. Evidence: `dashboard/test-results/2026-11-09T08-17-35.359Z-22680`. Product keying changed only after this observation.

Legacy behavior was also observed red after repairing a missing required base in the new test arrangement: supported old exact keys were not canonicalized; wrong exact/non-exact/ambiguous/proof-mismatched old aliases still answered builds. The correction was then enabled in the existing store owner.

Final passing commands:

```sh
caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-scope-adapter-identity.spec.ts backend-tests/intent/landed-ci-proof-collection.spec.ts backend-tests/intent/landed-ci-history-collection.spec.ts --workers=1
PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh tests/support/landed-ci-history-identity.test.mjs tests/support/landed-ci-history-order.test.mjs tests/support/intent-ci-scope-history.test.mjs tests/support/dashboard-ci-scope-history-read.test.mjs
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-scope-collected-timing-history.spec.ts --workers=1
npm run typecheck:dashboard
```

Backend8 session94810 exit0; shell4 session80753 exit0; main1 session11036 exit0; typecheck session88924 exit0. Typecheck's earlier new-builder exact-optional defect was repaired by omitting undefined optional facts. The optional initial adapter-equivalent fixture also had an incorrect premise: the unchanged shared confirmed-skip resolver uses native artifact proof only. That fixture was corrected to two exact recorded receipts at the same actual adapter SHA; the final backend command includes its pass. The genuine trusted equivalent/later legacy-dedup promise is asserted through the actual store owner in the six-case identity Node test.

Backend setup/assertions: new spec first case line46 sequentially publishes actual A then B, supplies distinct adapter proof summaries1200/3400 with one repeated opaque attemptId, and independently expects both full proof subjects, both retained summaries and two exact scoped points. Second case line100 uses two exact recorded receipts at one actual SHA and expects one acquisition/build/scoped point and two represented references. Each closes the collector after observable collection and restarts the same local reader before unchanged adapter discover/proof and GitHub call-count assertions.

`landed-ci-history-identity.test.mjs` six cases use MakeMe facts and actual isolated machine-store APIs: read-only legacy normalization, new equivalent/later reuse without duplication, mismatched exact/non-exact gaps, ambiguous and mismatched-proof gaps, opaque tuple boundaries/native key preservation, numeric IDs/matching-proof rejection/immutable accepted summary. Existing order file renews G10 all-parent ancestry/persisted fallback/stale partial refusal. Main journey renews real collection→authenticated read→rendered entry, selected endpoint, actual local-store failure/retry and no browsing acquisition.

Host basis: AC, 48GiB; initial load10.06/15.12/16.83 and final recheck7.87/6.22/9.53, one owned browser worker under caffeinate, no full repeat. Changed-path diff-check exit0. No remaining running commands or writers.

## Consumer dispositions

Mandatory base5187 discovery `/tmp/trace-proof-285-g11-consumers-raw.md` and narrowed `/tmp/trace-proof-285-g11-consumers-directed-discovery.md` both exited0. This directed index supersedes their raw lexical rows for G11. Prior reconciliation and G10 indices remain accepted for unchanged effects.

| Consumer | Disposition |
| --- | --- |
| `dashboard/server/landedCiCollection.ts` | run: backend8 observes distinct adapter acquisition plus same-true-attempt dedup and retained summaries; actual collector consumes the normalized read before final/pending decisions. Identity gaps are final unavailable evidence, not an asserted retry lifecycle. Native collection and four original adapter/artifact proof outcomes pass. |
| `dashboard/server/intentCiHistoryRead.ts` | run: new backend public scoped reads and main journey pass; both project/scoped paths consume the existing strict store read, so compatibility applies before either projection. No browsing CI acquisition added. |
| `dashboard/server/ciScopeHistory.ts` | run: actual backend distinct run/revision subjects yield1200/3400 and two keys; repeated true attempt yields one1200 point/two represented references. Node legacy tests observe safe exact proof, explicit identity gaps and new equivalent/later sharing one point. Projector body unchanged. Source commitments31/98/99 are observed. |
| `dashboard/server/landedCiHistoryEntries.ts`; `landedCiMeasuredBuilds.ts` | run/reused: existing project backend collection cases pass after key change. Both treat build keys as opaque references and skip gap observations; no attempt-key parsing. Their delivered pending/final-gap/window ownership remains unchanged and G2 is open. |
| `dashboard/server/landedCiResolution.ts`; `revisionBuildSlot.ts` | reused: types/comment consumers only; they do not construct/parse retained build keys. Shared resolver is unchanged. Prior accepted equivalent/later native proof session6581 remains valid; trusted store resolutions in the new Node file prove full-subject legacy reuse. |
| `dashboard/server/ciAdapterProof.ts`; `ciProofArtifact.ts`; `intentCiProofRead.ts`; `baseCiAdapterAttempts.ts` | run/reused: new distinct-subject backend requests cross the existing validated adapter reader; original four acquisition cases renew native artifact identity/mismatch/expiry and adapter branch behavior. Discovery/proof memo/freshness implementation unchanged. Tuple identity follows existing text-ID proof subject ownership, without importing their private cache keys. |
| `dashboard/src/ciScopeHistory.ts`; `authenticatedIntentCiHistoryRead.ts`; `useIntentCiScopeHistory.ts`; `IntentScopeTimingHistory.tsx`; `IntentCiHistoryChart.tsx` | run/reused: schema accepts opaque nonempty key strings and does not parse key prefixes. Actual new backend scoped payload and renewed main rendered journey pass; prior UI11 proof remains accepted for unchanged rendering/keyboard/phone/segments/links. No new rendered-adapter-specific assertion is claimed. |
| `dashboard/src/authenticatedIntentCiProofRead.ts`; `useIntentCiComparisonEntries.ts`; `useIntentCiShownProof.ts`; default authenticatedGet callers | reused: live proof queries, identity matching, freshness/refresh keys and default upstream guard are untouched. Prior comparison9, UI11 and controlled-clock local/live checks remain accepted; G11 changes only retained history identity. |
| New backend identity spec; retained-proof spec; existing history-collection spec | run: exact backend8 command above; original adapter retention assertion now selects its complete internal key rather than bare attemptId. |
| Main collected-history spec; identity/order/scope/client Node specs | run: exact final commands above; no ready-made scoped answer replaces collection in new acquisition cases. Legacy byte formats are deliberately arranged via canonical MakeMe history facts at the local store boundary. |
| `dashboard/tests/support/landedCiHistory.ts` | run/reused: unchanged reader-only restart helper used after actual collection for deterministic no-browsing-acquisition assertions; no periodic poll race or clock-freeze invention. |
| `tests/support/landedCiProofTestData.mjs`; `makeMe.mjs` | run: additive forAdapter proof and aLandedCiResolution builder provide explicit canonical test facts. Existing aCiProof/native history defaults are unchanged; new getter is instantiated only by six new identity tests. Pending supplier's duplicate history builder remains unimported. |
| Root-owned PLAN/source/consumer records | coordination/reference readers; root owns acceptance updates. Current G11 supersedes bare adapter-key and reconstructability assumptions in earlier temporal records. |

Generic full-base PLAN/README/segment/series/receivedAt/run-field/unchanged MakeMe imports remain the grouped lexical exclusions in the prior reconciliation index. Unrelated builders/tests do not invoke the new getter or forAdapter setter. Narrow discovery has all runtime/test/helper consumers disposed above. No existing consumer parses the retained adapter-key format; key construction/compatibility remains the sole store owner's responsibility.

G2 final supplier cohort/window/outside-retention acceptance remains open. No unpublished supplier work, slice2 or slice3 execution begun. Exact current owned product/test/documentation manifest: `/tmp/trace-proof-285-reconcile-owned-paths.txt` (39 paths, root-owned .planning excluded). No staging, formatting, refactor pass, commit or publication.
