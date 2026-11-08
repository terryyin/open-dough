# Surface a named sibling landing before delivering against its old shape

**Identity:** SEED-010#notice-named-sibling-landings-before-delivery

**Source:** [Surface a named sibling landing before delivering against its old shape](../../seeds/SEED-010-learn-from-execution-retrospectives.md#notice-named-sibling-landings-before-delivery)

## Goal and boundaries

A coordinator delivering a planned Story Branch slice can see an explicitly
named sibling's accepted change to product behavior the slice still relies on.
The coordinator keeps the increment recoverable and addresses the overlap before
delivery. An unrelated landing, a disjoint named landing, or a sibling change
already accounted for leaves ordinary delivery available. [ODF-429](../../../docs/maintainer/findings/ODF-429.md)

Use the coordination already expressed in the source or plan. Automatic sibling
discovery, a landing registry, new Take dependencies, automatic merges, and
additional Trunk Mode or planless gates are outside the delivery commitment.

## Current decisions

- **Use the existing delivery boundary.** In the shared `dough-execute-plan`
  source, extend the Story Branch check in [Deliver the change](../../../src/skills/dough-execute-plan/references/deliver-the-change.md)
  step 5, before the obligations check and guarded fresh delivery. Use the
  fetched trunk revision and merge base already returned by
  [source freshness](../../../src/skills/dough-execute-plan/references/source-freshness.md),
  after handling any source amendment. Source absorption and product
  reconciliation each have their own evidence. This is a coordinator decision
  in the existing guidance, using existing Git and story records. The freshness
  CLI, guarded publisher, and completion and cleanup callers keep their contracts.
- **Attribute the product change.** Resolve the named sibling's story identity
  from its coordination reference. Use evidence on the pinned trunk revision,
  such as a canonical done record and the first-parent integration that adds it
  alongside the product change. Where closure and the product change are separate,
  use an attributable product revision if available. A done record or a broad
  branch-to-trunk diff alone cannot attribute the change to that sibling. Check
  the slice's current behavior and proof, including its reliance on prior slices,
  against the accepted change. A filename match alone cannot establish stale
  behavior. Keep uncertainty separate from a confirmed overlap and handle material
  uncertainty through the existing execution decisions.
- **Keep reconciliation scoped.** With a confirmed overlap, identify the sibling,
  its accepted revision, the affected slice, and the shared paths or behavior.
  Withhold the affected delivery until the coordinator accounts for the new shape
  and rechecks affected proof. Reuse the existing decision and escalation path for
  unresolved product choices. This supports earlier coordination under
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
- **Keep one shared guidance source and evaluate it in use.** Author the change
  under `src/skills/`. Use representative behavior review, track any outstanding
  native behavior evidence separately before release, and record release and
  ordinary-use evidence at the finding. [Maintainer guidance](../../../AGENTS.md#skill-authoring) ·
  [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) ·
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) ·
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md) ·
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| Intent reading overlap is visible while slice 3 is under review | Slice 1 | Walk normal planned delivery using the SEED-243 case and the accepted SEED-241 integration below. Name the affected slice, revision, and page-held reading change. The coordinator withholds the done mark, commit, and push and retains the candidate edits while deciding how to reconcile. |
| Source-link absorption cannot clear a product overlap | Slice 1 | Walk SEED-255 slice 3 both before and after the link amendment. Both shared comparison paths still reflect the old timing model on the branch, although the slice does not directly edit them. The coordinator identifies SEED-256 and the accepted revision and rechecks proof on the reconciled shape before allowing delivery. |
| Ordinary delivery still works when the named change does not affect the slice | Slice 1 | Use a disjoint named integration and a separate same-path trunk change to check attribution. Also walk a branch that already accounts for the sibling change. Neither adds a hold. A slice with no named sibling keeps the ordinary route, including the source-freshness contract. |
| Finding remains evaluable after delivery | Slice 1 and release follow-through | ODF-429 identifies the delivered revision and ordinary-use criterion. Record the first containing release when identified. Compare the first qualifying ordinary use with the retained late-reconciliation baseline, including unnecessary interruptions. Leave ordinary-use effectiveness pending until observed. |

## Decisive premises

Observed in this preparation at `91a90d73e` on 2026-11-08 with Node `v24.21.0`
and Git `2.50.1`. The historical checks ran the current source
`source-freshness.mjs check --workspace <fixture> --identity <story> --remote origin --target-ref refs/heads/main`
in isolated clones of bare remotes pinned to the revisions below. The product
and attribution checks read the same historical trees with Git. No scratch
changes are carried into preparation.

| Consuming operation | Observation and result |
| --- | --- |
| Reuse the fetched comparison in the reading-state example | For SEED-243, branch `04a149de2^` at trunk `632e107e8` returns `amended` for the story and `unchanged` for the plan. Branch `04a149de2` returns `unchanged` for both, with the same base `4e53e1442`. `git log --first-parent -1 --diff-filter=A` on the exact SEED-241 done-record path at `632e107e8` finds `c9a142ac3`. Its first-parent diff changes `IntentPerspective.tsx` and `IntentSelectionReading.tsx` and adds `IntentLocationsUnavailable.tsx`. The branch from the same base also changes the first two paths. |
| Reuse the fetched comparison after link-only absorption in the timing example | For SEED-255 at trunk `550875ae5`, branch `9a31e3c39^` returns `amended` and `9a31e3c39` returns `unchanged`; both use base `200f5104a`. The first-parent addition of the exact SEED-256 done-record path is `550875ae5`. Its first-parent diff changes `IntentCiComparison.tsx` and `storyCiComparisonWording.ts`; the branch since the base changes both, but `9a31e3c39^..9a31e3c39` changes neither. The side-branch closure `1aa1ddd47` alone has no diff on either path. |
| Preserve the ordinary source check and its delivery route | `caffeinate -s -i node --test src/skills/dough-execute-plan/scripts/source-freshness{,-guidance}.test.mjs` passed all 24 cases, including the ordinary boundary before obligations and an unrelated file change leaving source freshness unchanged. These tests prove the current source contract. The new decision requires the representative walkthrough above. |

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Run the focused source-freshness and guidance tests above and the maintainer
behavior review through the normal delivery passage. For a full run, start on
awake macOS with AC power and use `caffeinate -s -i`. On battery, plug in or
start fully awake with the lid open under `caffeinate -i` and inspect the sleep
log afterward. [Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

## Ordered slices

### 1. Bring the named sibling's landed behavior into the delivery decision

Type: Behavior
Status: planned
Proof: Walk the two pinned overlap cases and the proceed controls through the
delivery passage, record the coordinator decision and evidence at each boundary,
and run the focused existing freshness tests.

Update the shared coordinator guidance at the existing pre-delivery step. On a
hold, verify that the slice has not been marked done and that working changes,
local HEAD, and the published story branch remain recoverable. On a proceed
case, verify the ordinary obligations and guarded delivery steps are still
reachable. Record the finding response with its observed proof and the
ordinary-use criterion. Any release identification belongs to release
follow-through. One delivered slice leaves the guidance and proof complete for
this scope.

## Preparation review

Slice-plan refinement was unnecessary because one coordinator decision owns
the shared rule, both historical cases, and the proceed controls. No remaining
slice-specific concern was identified in this review.
