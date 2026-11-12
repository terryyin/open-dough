# Remove unused Taken comparison navigation

**Identity:** SEED-318#remove-unused-taken-comparison-navigation

**Source:** [Minimal correction story](../../seeds/SEED-318-remove-unused-taken-comparison-navigation.md#remove-unused-taken-comparison-navigation)

**Source review:** [source-only commitments](source-review.md)

## Goal and bounded correction input

Remove one dormant test journey and the imports used only by it from
`dashboard/tests/support/selectDoneStoryForSummaryComparison.ts`. Keep all used
Done/Changed-tests/Summary/drill operations and their callers unchanged. Keep
existing Taken-story journeys in their existing owner. No new product behavior,
fixture, helper abstraction, scenario reduction or timing promise.

## Current finding and provenance

At reviewed codea48ca574, selectTakenStoryForSummaryComparison has no reference
outside its declaration across dashboard, src, tests and planning. The same
whole-dashboard Git search at original start8ad6544 found only its declaration.
Slice8's90b5845 changed its read continuation while preserving the unused API.
This exposed older residue rather than introducing a product regression.
Its26-line body alone uses imports parts, showColumn and expectSelected.

Reviewed execution: [original story and complete evidence](https://github.com/terryyin/open-dough/blob/a48ca574df6df318f6d0708a109813c736aa2d45/.planning/slice-plans/581-intent-test-reading/PLAN.md).
Related result is the uncontaminated c6d2645-to-a48ca574 aggregate: nine slices,
CI repair3f1c22bf, and history-preserving reconciliation534ac4d. Relevant change
90b5845 and original8ad6544 establish the finding's attribution.

## Architecture and existing solution

PFE inspected the shared comparison helper and its consumers. Existing
`support/intentStoryPage.ts:selectTakenStoryInIntent` owns the real Taken
setup/selection/read flow and has maintained callers. Remove the dormant route
without moving or wrapping the live route. One93-line test-support module is
implicated; no production subsystem or oversized-file reorganization.
Follow Accepted [ADR0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [ADR0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
Existing near-future direction favors understandable, worthwhile proof; no
North Star change or human-owned product decision is needed.

## Decisive premises and proof ownership

| Premise | Current evidence / consuming observation |
| --- | --- |
| Direct callers are absent | Whole-project current search and Git search at8ad return only the declaration; installed payload does not expose dashboard test helpers. Inspect namespace/computed imports again before deletion. |
| Used operations retain behavior after removal | Current candidate scratch removed only the unused export/imports; typecheck and complete unchanged Sort journey passed, case17.039s/default30/retry0. Both story loops and all sort/drill assertions ran. Exact original SHA256ab7969422158b9adbdc084cd730d950f514e4395d9544b24122fd63ec71c2f69 was restored in finally. |
| Focused route is available | The exact Summary sort/drill/story-selection case has retained strict passing proof in slice8/refactor8 under this checkout and default budgets. It exercises the three used comparison helpers and their real Git/HTTP inputs. |

## Ordered slices

### 1. Retire the dormant Taken comparison route
Type: Structure
Status: done

Internal change: recheck all literal, namespace and computed callers; remove only
selectTakenStoryForSummaryComparison and its three now-unused imports. Preserve
all used function bodies and export contracts. An unexpected caller or module
initialization effect stops this candidate before commit and returns evidence;
do not invent a compatibility wrapper or silently expand scope.

Unchanged external behavior: the existing Done comparison, folder drill-down,
story switching, row order and retained sort work through the same real inputs.
Existing Taken-story setup remains with its current owner.

Proof: `npm run typecheck:dashboard`, then the complete existing journey:

```sh
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-summary-story-comparison-sort.spec.ts --workers=1
```

The named case independently observes signed Landed order, folder rows, missing
columns/tree order and restored story sort. Setup uses its shared MakeMe-backed
publication fixture; no outcome is supplied in setup. Keep native actions and
expected rows/focus visible. Do not add a test of the unused export.

Accepted proof (execution, 2026-11-12): caller recheck found no literal,
namespace or computed import; the deletion-only diff leaves every retained
export unchanged. `npm run typecheck:dashboard` exit 0; the Sort journey above
passed once, case 24.1s/default 30/retry 0, one worker, AC, external load
41-48. Independent refactor pass: none needed. Per-commitment observations are
in the linked source review.

## Execution complete

Product advice: no change. The helper now holds only supported Done,
Changed-tests, Summary and drill-down navigation; review of the aggregate
result found no residue, drift or coverage change to act on.

## Gates and current decisions

Local gate: dashboard typecheck and the focused journey above; on AC use
`caffeinate -s -i`, or battery `caffeinate -i` with lid open and sleep-log
inspection under [the maintained macOS guard](../../../tests/local-test-resources.md#machine-sleep-on-macos).
The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to this plan and every delegation or repair handoff.
Perform independent post-change refactoring, selective `npm run format`, normal
check-only commit hooks and managed delivery/CI. No generator or project-summary
trigger is known for this removal. Never stash or overwrite another owner's work.

## Preparation assessment

Refinement not needed: one cohesive Structure correction removes a concrete
unused route, with no independent second outcome or speculative preparation.
No remaining preparation concern. The earlier scratch timed out30.950s; its
negative evidence remains `/tmp/seed318-preparation-preservation-{result,proof}.json`.
After completed supplier-component assessment and the current same-Git/preview
readiness repair, the fresh candidate-removal check passed at00:17UTC: typecheck0,
whole Sort case17.039s/default30/retry0, runner24.245s, runa75e8a79, AC100/one
worker, preflight load57.56/49.08/42.37. Exact helper restore succeeded.
Evidence `/tmp/seed300-unused-helper-ready-preservation-{result,proof}.json` and
log. Rechecked current code imports are named; no namespace/computed caller of
the dormant export exists. No implementation was retained or queue changed.
Record the actual ready assessment; it grants no execution authority.
