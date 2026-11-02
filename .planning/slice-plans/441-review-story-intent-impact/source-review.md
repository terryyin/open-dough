# Source review — SEED-192#review-story-intent-impact

Launch: fresh general-purpose reviewer (no conversation inheritance),
source-only inputs: Goal, Scope, key examples, exclusions from
`.planning/seeds/SEED-192-review-product-intent.md#review-story-intent-impact`.
No plan, return, product, or proof supplied.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Developer selects a story on the Development board and, in Intent, sees that story's test-file changes in place in the project's test source | slice 4 | |
| 2 | Intent connects to the near-future question about a story without whole-product entry cost; Terry evaluates vs Review changes plus editor (ADR 0010) | slice 7 | |
| 3.1 | Clicking empty area of active story card selects it exactly as Inspect story, showing detail | slice 1 | observed: story-card-selection.spec.ts: empty-area click → story-card-selected + Detail region + Hide detail |
| 3.2 | Clicking selected card empty area again deselects | slice 1 | observed: story-card-selection.spec.ts: second empty-area click clears selection; Inspect restored |
| 3.3 | Hide detail deselects | slice 1 | observed: story-card-selection.spec.ts: Hide detail click clears selection; Inspect restored |
| 3.4 | Clicks on buttons, links, inputs, session entries, disclosures do not change selection | slice 1 | observed: story-card-selection.spec.ts: Start force-click, session entry, disclosure/link leave or do not set selection as promised |
| 3.5 | Recently done card selectable/deselectable the same way, showing selected state | slice 1 | observed: story-card-selection.spec.ts: done card empty-area + Select story Enter/Space toggle with aria-pressed |
| 3.6 | Done card has no detail to show | slice 1 | observed: story-card-selection.spec.ts: selected done card has no Detail for region |
| 3.7 | One story selected per project at a time, active or done | slice 1 | observed: story-card-selection.spec.ts: selecting done clears active selection (one per project) |
| 4.1 | Selected card has visible selected state | slice 1 | observed: story-card-selection.spec.ts: story-card-selected + inset boxShadow |
| 4.2 | Selected state told apart from shown in Side panel | slice 1 | observed: story-cards.css: selected inset accent ring vs .in-side-panel soft fill; expectSelected asserts inset |
| 4.3 | Opening session from sidebar does not change selection | slice 1 | observed: story-card-selection.spec.ts: Sessions sidebar Open Dough session keeps board selection |
| 5.1 | Selection survives switching between Development and Intent | slice 1 | observed: story-card-selection.spec.ts: Intent round-trip keeps data-selected-story / selected mark |
| 5.2 | Intent names the selected story | slice 4 | |
| 5.3 | Selection stays disposable page state, not URL (ADR 0008) | slice 1 | observed: pageStorySelection.tsx + PageFrame provider; no URL write in selection owner |
| 6.1 | With story selected, Intent offers Selected story only toggle | slice 5 | |
| 6.2 | Toggle off by default; whole tree with changes highlighted | slice 4 | |
| 6.3 | Without selected story, Intent shows no toggle or highlight (apart from folder default) | slice 1 | observed: story-card-selection.spec.ts: deselected Intent has no Selected story only control/text |
| 7.1 | Intent uses selected story's default Review changes comparison (all changes incl. uncommitted) | slice 4 | |
| 7.2 | Same comparison read as Review changes | slice 3 | |
| 7.3 | Intent states which revisions it compared | slice 4 | |
| 7.4 | No comparison → explanation | slice 4 | |
| 7.5 | Failed read → explanation and retry | slice 4 | |
| 7.6 | Neither missing nor failed comparison shown as no changes | slice 4 | |
| 8.1 | In-scope: path or old path in configured location selection | slice 4 | |
| 8.2 | Added files shown where they belong | slice 4 | |
| 8.3 | Out-of-location changes not listed | slice 4 | |
| 8.4 | Count outside + Review changes pointer | slice 4 | |
| 9.1 | Selected story only: only in-scope changed files and folders | slice 5 | |
| 9.2 | No in-scope changes message | slice 5 | |
| 9.3 | Outside count when any | slice 5 | |
| 10.1 | Full published tree; change-kind styles | slice 4 | |
| 10.2 | Contains-changes background on folders/groups with changes | slice 4 | |
| 10.3 | Deleted file stays visible and styled removed | slice 4 | |
| 11.1 | One change-kind style set including modified | slice 3 | |
| 11.2 | Review changes shows same styles | slice 3 | |
| 11.3 | Review needs no contains-changes; not forbidden | slice 3 | |
| 12.1 | Changed file → same FileDiff as Review in Purpose | slice 4 | |
| 12.2 | Unchanged files show published source | slice 4 | |
| 12.3 | Proof describes published revision and says so | slice 4 | |
| 12.4 | Proof for story's version not claimed | slice 4 | |
| 13 | Changed file matches Review; views never disagree | slice 4 | |
| 14.1 | Folders start collapsed when tree first shown | slice 2 | |
| 14.2 | Open folders containing changes on Intent open with selection or toggle | slice 4 | |
| 14.3 | First changed location group opens | slice 4 | |
| 14.4 | Other folders stay collapsed | slice 4 | |
| 14.5 | Story change while Intent hidden does not rearrange | slice 5 | |
| 14.6 | Rule applies next Intent open or toggle | slice 5 | |
| 15.1 | One comparison-read implementation | slice 3 | |
| 15.2 | One change-kind/styles implementation | slice 3 | |
| 15.3 | One file-tree implementation | slice 3 | |
| 15.4 | One diff implementation | slice 3 | |
| 16.1 | Playwright covers key examples with workspace + completed fixtures | slice 6 | |
| 16.2 | Terry evaluation on real Open Dough story | slice 7 | |
| 16.3 | Apply failing and flaky test policy | slice 1 | observed: AGENTS.md failing/flaky policy applied; focused selection+navigation specs green |
| 17 | Never present missing/failed comparison or no in-scope changes as empty change set | slice 4 | |
| E1 | Journey: Taken workspace story select + Intent highlight/diff | slice 4 | |
| E2 | Journey: Selected story only toggle on/off | slice 5 | |
| E3 | Journey: outside-locations count | slice 4 | |
| E4 | Journey: product-only / no in-scope message | slice 5 | |
| E5 | Journey: completed Recently done + published comparison | slice 6 | |
| E6 | Journey: no comparison explanation; tree usable | slice 4 | |
| E7 | Journey: deselect clears Intent toggle; Start/session do not select | slice 1 | observed: story-card-selection.spec.ts: deselect clears Intent toggle absence; Start/session do not select |
| E8 | Journey: no selection → folders collapsed | slice 2 | |
| X1 | Deferred: other Intent comparisons |  | X1 |
| X2 | Deferred: Intent config changed by story |  | X2 |
| X3 | Deferred: proof of story version / protection / complexity |  | X3 |
| X4 | Deferred: marking review from Intent |  | X4 |
| X5 | Deferred: URL selection / sidebar / refs beyond today |  | X5 |
