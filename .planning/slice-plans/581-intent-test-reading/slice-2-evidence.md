# Slice 2 implementation handoff

Uncommitted implementation, no commit/push/done marking/refactor/formatting.
Checkout `/Users/terryyin/git/open-dough/.worktrees/express-intent-test-reading-through-page-objects`;
branch `codex/express-intent-test-reading-through-page-objects`, story-branch, origin/main.
Identity `SEED-300#express-dashboard-test-intent-through-page-objects`; publisher
`dashboard-territory.local-open-dough`; agent `stanly-chan`. Published base
`71d39d5965906dd4dcd28d4d3cd0c1ffcb0a4385`; prior suffix base
`8299f4e64f49939e1d6120390ebd0b44a0532328`. Coordinator owns planning edits.

## Implemented outcome and ownership

- `intentCiComparisonPage.ts`: `comparisonEntryCell(panel, entry, column)` names
  the displayed entry figure instead of reconstructing tbody/row/cell indexes.
- `intentScopeProofPage.ts`: `scopeComparisonFigure` and `scopeComparisonCell`
  name own/child figures; `expectNamedScopeRows` shares the row lookup below.
- `proofTablePage.ts`: `proofTableRowsNamed` owns relative exact row-header matching.
  Existing semantic table observation remains unchanged.
- `intentFileProofPage.ts`: `fileComparisonCell(proof, path, column)` owns a
  single-row file comparison's figure. Mixed-unit row readers stay intact.
- `relativeTimingMarks.ts`: `timeMarks`, `relativePresentation` and
  `expectPercentageValues` own the repeated mark/percentage observation.
  Geometry extraction and literal measurement expectations stay independent.
- Sort scenarios reuse existing `expectSortedBy(..., expectedOrder)` and
  `expectUnsortedRows`. Existing `expectSortedBy`/`expectRenderedSortedBy`,
  `sortButton`, `showPercent`, and static rendering contracts are unchanged.
- Native click/Enter/Space/Tab/focus remain explicit. Static `sort` and
  `showPercent` inputs stay on each `renderComparison` call. No runtime change.

Owned paths: `/tmp/seed300-slice2-owned-paths.json` (16 dashboard paths).
Every affected selector/same-sequence sibling found in the trace has a disposition.

## Source commitments and inspected observations

| Commitments | Trigger/setup and observing assertions |
| --- | --- |
| 21, 23, 49, 59 | `intent-ci-comparison-presentation-bindings.spec.ts` mounts a live frame with served MakeMe proofs, drives click/Enter/focus+Space and checks `expectSortedBy` including order and semantic sort/arrow state. `intent-summary-story-comparison-presentation-bindings.spec.ts` does the live Summary counterpart. `intent-ci-status-sort.spec.ts` retains actual Tab/Enter/Space and `toBeFocused`, multi-unit gap evidence, exact row counts. |
| 47, 48 | `intent-ci-comparison-mounted-sort.spec.ts`, `intent-summary-story-comparison-mounted-sort.spec.ts`, `intent-summary-story-comparison-mounted-signed-sort.spec.ts` configure static `sort`; relative rendered specs configure static `showPercent`. Expected signed values, both directions and gaps-last orders remain literal and use `expectRenderedSortedBy`. |
| 56, 57 | `intent-summary-ci-proof-sort.spec.ts`, `intent-summary-story-comparison-sort.spec.ts` drive real headers, check complete expected order with existing sort-state observation, retain drilling/story changes and unsorted fallback. Initial no-sort rows use `expectUnsortedRows`. |
| 58 | `intent-ci-comparison-relative.spec.ts` sets independent timed entries, reads explicit Branch/Landed words/geometry, focuses Show % then uses Space, expects all caller percentages through `expectPercentageValues`, and independently checks kept order/geometry. Rendered `intent-ci-comparison-mounted-relative.spec.ts` retains combined `relativeFigures` snapshots, exact identity positions, geometry and percentage membership. Scope/file relative cases assert their literal words and reference scales through named cells/figures. |

The selected legacy/units cases also re-exercise `expectNamedScopeRows` after
its equivalent row lookup is shared. Setup remains MakeMe/fixture inputs; UI
assertions, native input, service request evidence and expected values stay outside
those setups and browser owners. No source commitment is known unproved.

## Proof

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice2-proof.json npm run test:dashboard -- tests/intent/intent-ci-comparison-drilldown-relative.spec.ts tests/intent/intent-ci-comparison-mounted-legacy.spec.ts tests/intent/intent-ci-comparison-mounted-relative.spec.ts tests/intent/intent-ci-comparison-mounted-sort.spec.ts tests/intent/intent-ci-comparison-mounted-units.spec.ts tests/intent/intent-ci-comparison-presentation-bindings.spec.ts tests/intent/intent-ci-comparison-relative.spec.ts tests/intent/intent-ci-comparison-units-bindings.spec.ts tests/intent/intent-ci-status-sort.spec.ts tests/intent/intent-summary-ci-proof-sort.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts tests/intent/intent-summary-story-comparison-mounted-file.spec.ts tests/intent/intent-summary-story-comparison-mounted-relative.spec.ts tests/intent/intent-summary-story-comparison-mounted-signed-sort.spec.ts tests/intent/intent-summary-story-comparison-mounted-sort.spec.ts tests/intent/intent-summary-story-comparison-presentation-bindings.spec.ts tests/intent/intent-summary-story-comparison-sort.spec.ts --workers=1
```

Terminal exit 0; 17 specs selected 45 cases, every execution expected and every
attempt passed, no retries. Runner and strict verdict passed. Run
`b7b6a863-03ba-422b-ada3-209e810a5472`, 59.3s; terminal proof
`/tmp/seed300-slice2-proof.json`. `npm run typecheck:dashboard` passed.
`git diff --check` passed.

## Restored scratch discrimination

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice2-scratch-proof.json npm run test:dashboard -- tests/intent/intent-ci-comparison-relative.spec.ts tests/intent/intent-ci-comparison-mounted-relative.spec.ts --grep 'relative changes share one centred scale|summary and entries share a centred fifty percent scale' --workers=1
```

Temporarily shifted `comparisonEntryCell` one column right. Exactly 2 cases
(integrated and rendered) failed on caller Branch `+30 s` versus actual Landed
`+1 min`. Both failures occurred at the intended displayed-cell boundary;
`/tmp/seed300-slice2-scratch-proof.json` retains them. Terminal scratch exit 1
was observed and the exact reader bytes restored in `finally` before normal
proof. No further faults or retries were needed.

## Consumer trace and reuse

Installed consumer-trace ran with effect terms `comparisonEntryCell`,
`scopeComparisonCell`, `scopeComparisonFigure`, `fileComparisonCell`,
`proofTableRowsNamed`, `timeMarks`, `percentages`, `expectPercentageValues`,
`expectSortedBy` and `expectUnsortedRows`. Raw record
`/tmp/seed300-slice2-consumer-trace-raw.md`; every located consumer's disposition
in `/tmp/seed300-slice2-consumer-trace.md`; exact selection
`/tmp/seed300-slice2-selection.json`. Changed helper callers and three old
`expectNamedScopeRows` consumers are in the 17-spec run. Other imports use
unchanged exports/selectors: the new operations do not reach their boundaries,
so they are explicitly excluded. Existing slice1 proof remains valid for
unchanged metrics, semantic table reading and other Summary operations.
Lexical production/guidance/record matches have no runtime change and are excluded.

## Source reading comparison and cost

Before: local `cell`/`timingCell`/`childBranch` functions rebuilt row-header
filters and numeric column positions separately in integrated/rendered scenarios.
After: `comparisonEntryCell(panel, "e/slower", "Branch")` and
`scopeComparisonCell(summary, path, child, "Branch")` expose the chosen reading
while literal values and geometry expectations remain alongside them.
Sort-state and row order now form one named observation; real input remains visible.
At both `7eab3d6ca` and slice2 HEAD, mark/percent selectors appeared directly
in six scenario files. All now use the existing relative-timing owner; exact
browser geometry internals remain in that owner. No fluent framework added.
Small named figure adapters and one shared row lookup cost about 60 added
helper lines before formatting, while removing repeated local plumbing.
Actual owner sizes before formatting: comparison44, scope210, file49, table67,
relative157; all changed specs <=224. The maintenance gain is one column/row/mark
mechanism per responsibility, with explicit scenario intent, rather than a
locator-count or performance claim.

## Resource and remaining state

Actual host local Mac16 logical CPUs/48GiB/AC, prelaunch load4.50, 49% free memory.
One worker under `caffeinate -s -i`; no unowned process modified. Other worktrees'
proof was known but not controlled. Retain this bounded choice and reconsider
if contention, workload or failures change its basis.
No active proof command or writer remains. No failures/gaps/obligations remain
from implementation. Coordinator still owns freshness, acceptance, independent
refactor, formatting and delivery.

Coordinator acceptance: source freshness unchanged at8299; no incoming named sibling changes. Inspected named row/column/percentage owners and live CI status-sort/relative assertions; all allocated commitments accepted.

## Independent refactor and delivery boundary

# Slice 2 independent refactor

Outcome: none — already clean. No repository edits.

## Inspected scope

- Current unstaged diff and empty staged diff; all 16 owned dashboard paths.
- `intentCiComparisonPage.ts`: named entry figures share the exact row owner and
  comparison-column definition. Named endpoint reading remains unchanged.
- `intentScopeProofPage.ts`: own and child figure adapters preserve the real
  difference between definitions and child cells (including the Change offset).
  The named-row observer uses the shared exact row lookup.
- `intentFileProofPage.ts`: single-row file figures are independent of navigation;
  existing complete mixed-unit row reading remains intact.
- `proofTablePage.ts`: one exact row-header owner with a page-rooted relative
  locator; semantic whole-table polling is unchanged.
- `relativeTimingMarks.ts`: mark/percentage selectors and collection have one
  owner; the browser geometry extractor remains an independent measurement.
- Relative integrated/static scenarios, live CI status/Summary sort scenarios,
  signed static Summary sorting, and file absence cases retain their literal
  expected values, row orders, gaps-last, exact keyboard and focus evidence.
- Unchanged live and rendered sorting helpers already own semantic sort state,
  arrow/cardinality and expected row-order reading. No second sorting API added.
- Source and plan links, accepted commitments and delivered plan reorganization
  were preserved. Planning records remain coordinator-owned.

## Decisions

No materially implicated duplication, misleading domain name, dead export,
shotgun-surgery mechanism, or proof gap needs an additional refactor.
Column mappings reuse one column definition; the different offsets represent
actual table/figure layouts, so another abstraction would add cost without
removing a distinct responsibility. Every newly exported operation has callers.
No production subsystem, generated artifact, or runtime contract is changed.

All current changed files were counted: largest code file224 lines;
`intentScopeProofPage.ts`210, relative owner157, plan222, source review120,
slice2 evidence115. All under250. The earlier linked preparation/design/proof
record split remains coherent with its supplied reorganization decision.

## Proof disposition

No refactor edit invalidated any accepted implementation, setup, boundary or
observing assertion. Reuse the full accepted 17-spec/45-case strict and runner
pass in `slice-2-evidence.md`, its literal command and terminal verdict
`/tmp/seed300-slice2-proof.json`, run `b7b6a863-03ba-422b-ada3-209e810a5472`.
Reuse accepted `npm run typecheck:dashboard` and `git diff --check` results.
The shared-reader scratch fault and restoration evidence remain unchanged.

Consumer tracing: inspected exported-operation references and relevant scenarios
against `/tmp/seed300-slice2-consumer-trace.md`. Changed operations' 17-spec
selection and the three named-row consumers remain covered. Other imports use
unchanged operations, and lexical production/record matches are excluded as
recorded. No new refactor paths or consumers exist, so no new trace is needed.

Tests: skipped — no refactor edits. No proof command launched or left running.
Retain the accepted local Mac16CPU/48GiB/AC, load4.50/free49%, one-worker
`caffeinate -s -i` choice for any later required proof; reconsider at launch if
conditions change. No expensive verification was necessary in this review.

No unresolved gap, contradiction, renaming, extraction, split, deletion, or
human decision. No formatting, lint, staging, commit, push, stash or branch
operation. Approximate active elapsed time: 2 minutes.

## REFACTOR COMPLETE

Final freshness unchanged; pinned trunk4d7a2ff66 adds only a preparation agent profile for SEED-307. No named sibling behavior or accepted proof is affected.
