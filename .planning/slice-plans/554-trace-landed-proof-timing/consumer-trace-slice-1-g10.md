# G10 recorded-landing ancestry correction

Identity SEED-285#trace-landed-proof-timing, working contents over supplier-integrated base `5187b17548e20e3d48f839b5d0b55a2f700e6293`. Failure policy: [AGENTS.md#failing-and-flaky-tests](/Users/terryyin/git/open-dough/.worktrees/trace-a-done-story-s-timing-history-into-test-pr/AGENTS.md#failing-and-flaky-tests).

The G6 implementation had introduced a first-parent-only cohort assumption that the source did not require. `readLandingOrder` now chooses a locally known descendant tip, walks topological ancestry in reverse across all parents, and filters the result to requested retained landing revisions (plus the selected endpoint). No fetch, new resolver, pin change or timestamp ordering is introduced. The confirmed-skip CI resolver remains unchanged.

## Exact proof

Red, before changing the reader:

```sh
PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh tests/support/landed-ci-history-order.test.mjs
```

Session79979, terminal exit1 at the new order assertion, test line60. The real MakeMe repository starts with A→P and private workspace B from A. A real merge makes C with verified parents `[B,P]`, then trunk fast-forwards to C and advances to R. Old output was A/B/C/R: P was missing and private commits were returned. Only P/C/R have recorded landing observations. This is the intended failed assertion, not an arrangement or runner error.

Green after the bounded reader correction:

```sh
PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh tests/support/landed-ci-history-order.test.mjs tests/support/intent-ci-scope-history.test.mjs tests/support/dashboard-ci-scope-history-read.test.mjs
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-scope-collected-timing-history.spec.ts tests/intent/intent-ci-comparison-fast-forward.spec.ts --workers=1
npm run typecheck:dashboard
```

Shell3 session29151 exit0; browser4 session92609 exit0; typecheck session52331 exit0. The new real graph case asserts order `[P,C,R]`, private B absent, projected measured values `[100,200]`, represented cohort `[P,C]` with C selected, and R absent. Existing order test renews inverted receipts, persisted-order fallback with missing local Git and stale partial update refusal. Main real journey renews collection/public read/rendered endpoint, persisted-order fallback, local store failure/retry and no browsing acquisition. Three existing fast-forward cases preserve accepted story-first Branch/Landed endpoint behavior.

Changed-boundary diff-check passed. No formatting, staging, commit or publication. Host was AC; initial load61.80/35.70/22.55 caused lightweight proof first, then reconsidered load24.16/34.22/25.12 plus coordinator confirmation of no competing owned heavy proof allowed the bounded one-worker browser run. No full repeat.

## Consumer dispositions

Mandatory base trace `/tmp/trace-proof-285-g10-consumers-raw.md` and narrowed `/tmp/trace-proof-285-g10-consumers-directed-discovery.md` both reached terminal exit0. They are lexical discovery, superseded for G10 acceptance by this index and the prior accepted reconciliation index `/tmp/trace-proof-285-reconciliation-consumer-dispositions.md` for unchanged effects.

| Consumer | Disposition |
| --- | --- |
| `dashboard/server/ciScopeHistory.ts` | run: new real Git graph feeds the actual projector and asserts P/C retained, R/private B absent; focused scope tests renew explicit ordering, gaps and zero. The projector body is unchanged. |
| `dashboard/server/intentCiHistoryRead.ts` | run: renewed main journey exercises local order selection and persisted fallback through authenticated public read; scoped read parsing/identity tests pass. Body/schema unchanged. |
| `dashboard/server/landedCiCollection.ts` | run: renewed main journey collects actual landings/proof and persists derived order using the changed reader. Existing unread-CI G9 backend result session6581 is reused for its unchanged break/write behavior; this correction changes only the local order source. |
| `dashboard/server/landedCiHistoryStore.ts` | run: focused order test renews actual persisted bounded order and refusal of stale partial replacement. Only comment corrected here: explicit deletion may remove pins, or local Git may disappear; host launch-history retention itself does not remove pins. Store schema/update bodies unchanged. |
| `dashboard/server/landedCiHistoryEntries.ts`; `landedCiMeasuredBuilds.ts`; `landedCiResolution.ts`; `revisionBuildSlot.ts` | reused/excluded from G10 effect: these consume retained observations/builds or share types/comments; none reads trunkOrder or invokes readLandingOrder. Existing supplier/backend/project proof session6581 and UI13436 remain accepted. Confirmed-skip/later-build resolution is unchanged. |
| `dashboard/server/launchLandingReservation.ts`; `launchRecordDeletion.ts` | excluded from G10 mutation: unchanged verify/pin/remove callers do not call readLandingOrder, and their function bodies/signatures are unchanged. Their ancestry/pin lifecycle informed the correction but is not rewritten. Renewed fast-forward cases preserve accepted story-first review endpoints. |
| `dashboard/backend-tests/intent/landed-ci-scope-pending-proof.spec.ts` | reused: actual G1/G9 pass session6581; no pending/schema/poll/stop behavior changed. Main collector proof and order boundary tests cover new ancestry implementation. |
| `dashboard/backend-tests/review/story-branch-landing-capture.spec.ts` | excluded: verification/capture owner unchanged; new read-only traversal does not mutate Git refs or alter capture. |
| `dashboard/tests/intent/intent-scope-collected-timing-history.spec.ts`; `tests/support/intent-ci-scope-history.test.mjs`; `tests/support/landed-ci-history-order.test.mjs` | run: exact renewed commands above; actual graph, full public/rendered journey and existing projection/fallback boundaries. |
| `dashboard/tests/support/landedCiHistory.ts`; `tests/support/landedCiProofTestData.mjs` | run/reused: helper closes collection then reopens the same store for main reading; explicit MakeMe facts provide retained history. Both helpers unchanged in G10. |
| `docs/dashboard-development-intent-ci-comparison.md` | changed and inspected: all-parent recorded ancestry, retained-revision filtering, story-first inclusion, truthful explicit-deletion/object-loss pin premise; separate confirmed-skip first-parent rule preserved. |
| Root-owned PLAN and consumer/source records | coordination/reference readers; coordinator owns correction. Earlier first-parent cohort or automatic pin-expiry descriptions are superseded by G10's observed correction. |

The mandatory full-base raw trace's generic PLAN/README/segment/series/date/run-identity/unchanged MakeMe/default-read matches remain covered by the concrete grouped exclusions in the prior reconciliation index; no new exported schema, builder getter or default behavior was added here. The narrowed discovery has every effect-reaching runtime/test consumer disposed above. Shared proof dispatch, history UI and default authenticated-read consumers retain the earlier accepted terminal proof; their responsibilities did not change in G10.

G10 is observed; G2 supplier551 slice3 remains external. G5 transient proof resumption, folder/file slice2 and full restart/backfill slice3 remain unclaimed. All writers and commands are quiescent.
