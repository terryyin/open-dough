# Remove the obsolete native revision opener

**Identity:** SEED-334#remove-obsolete-native-revision-opener
**Source:** [Correction story](../../seeds/SEED-334-product-wide-end-to-end-tests.md#remove-obsolete-native-revision-opener)

## Goal and scope

Remove the unused native `openWithFeatureSelected` entry from
`dashboard/tests/intentRevisionJourney.ts` and its now-unused imports. This
leaves maintainers one live revision opener for the converted Frontend journeys.
Preserve the module's live `jobsFeatures`, `intentReads`, `publishedFiles` and
`openJobsFeature`, the Frontend opener, all product behavior and all real E2E
publication helpers. No runner, query, cache, fixture-data or timeout changes;
no new behavior or speed claim.

## Retrospective input and provenance

Correction of [the reading/review conversion](https://github.com/terryyin/open-dough/blob/ce066347444bb41bf036d27412eac26c29becc8b/.planning/slice-plans/647-move-intent-reading-and-review-checks/PLAN.md)
and its [review manifest](https://github.com/terryyin/open-dough/blob/ce066347444bb41bf036d27412eac26c29becc8b/.planning/slice-plans/647-move-intent-reading-and-review-checks/execution-context.md).
Reviewed implementation ends at `e3a4103b2d735afa95b51171697aeeadb249519a`.
The native opener retained a caller at slice6 (`76ff4d6`), then slices7/8
converted the last native consumers. At e3a4103 its definition has no caller:
all six importing Frontend specs use `tests/support/frontendIntentRevisionJourney.ts`.
Keeping the obsolete export leaves an unnecessary parallel entry and native
publication/clock imports in the shared browser helper. Expected saving is the
28-line obsolete function and its dead imports, with no runtime saving measured.

## Existing solution and constraints

PFE: the Frontend opener already owns controlled immutable answers and revision
stimulus; `openJobsFeature` owns the shared browser entry. Reuse both unchanged.
`publishMovingFiles` still has real E2E consumers (including CI story gaps,
reopened-project reads and steady refresh), so remove only this module's import.
No new representation, architectural boundary or North Star topic is warranted.
Accepted ADR0002 (outside-in proof), ADR0008 (origin authority) and ADR0010
(test boundaries) remain applicable; no exception or product restriction.

## Settled premises

At e3a4103 in the owned execution checkout, a temporary removal of the exact
function and its three import lines passed `npm run typecheck:dashboard` and
`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/tmp/647-cleanup-premise.json caffeinate -s -i npm run test:dashboard:frontend -- frontend-tests/intent/intent-revision-notice.spec.ts frontend-tests/intent/intent-home-activation.spec.ts --workers=1`.
All six cases passed strictly, one attempt each (2026-11-15T19:42:51Z).
Their actual browser observations retain selected-feature source, notice,
Show latest, revision isolation, CI return and keyboard reading. The scratch
edit was restored before writing records. No unverified premise remains for
this deletion; execution must recheck callers against its current checkout.

## Outside-in proof and local gates

Slice1 owns preservation of those six cases and all nine revision cases in the
five `frontend-tests/intent/intent-revision-*.spec.ts` files. Inspect actual
selection and strict terminal records; preserve assertions without new mirror tests.
Run `npm run typecheck:dashboard`; normal delivery runs formatting and lint.
No E2E publication behavior changes, so retain existing real-boundary proof.
Apply [test conventions](../../../AGENTS.md#test-automation) before test edits,
and the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. The local browser gate uses the maintained macOS
[sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
awake on AC under `caffeinate -s -i`; on battery plug in or keep the lid open
under `caffeinate -i`, then inspect the sleep log. Inspect load, memory and
competing work before expensive proof. Keep defaults and one worker.

## Ordered slices

### 1. Keep one live revision journey opener
Type: Structure
Status: done

Remove only the dead native export and resulting unused imports, retaining
all live browser/data exports and the real publisher. Search the whole product
for callers and import aliases, trace affected exports, and apply independent
post-change refactoring. The existing Frontend opener remains the one owning
controlled-source revision stimulus. This slice directly owns the evidenced
retrospective residue; it enables no hypothetical behavior.
Proof: the focused revision and home-activation suites above pass unchanged,
typechecking passes, and no caller references the removed native export.
Accepted proof (2026-11-16, at 25c66a1 plus this change): whole-repo search
found every `openWithFeatureSelected` caller importing the Frontend opener;
`npm run typecheck:dashboard` and eslint on the module passed; the six revision
and home-activation spec files passed 12/12 (three home-activation, nine
revision), one attempt each, `--workers=1` under `caffeinate -s -i` on AC at
load ~9. The independent refactor pass changed nothing; the four removed
imports keep other live consumers.

## Readiness and sizing

One cohesive deletion and one preserved-behavior proof loop; expected under
15 active minutes. Refinement not needed: no independent outcome, special case,
remaining slice-specific concern or unsettled proof boundary was identified.
