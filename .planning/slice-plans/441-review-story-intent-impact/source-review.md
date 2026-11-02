# Source review — SEED-192#review-story-intent-impact

Launch: fresh general-purpose reviewer (no conversation inheritance),
source-only inputs: Goal, Scope, key examples, exclusions from
`.planning/seeds/SEED-192-review-product-intent.md#review-story-intent-impact`.
No plan, return, product, or proof supplied.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Developer selects a story on the Development board and, in Intent, sees that story's test-file changes in place in the project's test source | slice 4 | observed: intent-story-changes.spec.ts: card-area click selects a Taken workspace story; Intent shows its test changes over the published tree |
| 2 | Intent connects to the near-future question about a story without whole-product entry cost; Terry evaluates vs Review changes plus editor (ADR 0010) | slice 7 | observed: PLAN.md 'Slice 7 evaluation (delegated by Terry)' — five real Open Dough stories in Intent vs Review changes; judged useful |
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
| 5.2 | Intent names the selected story | slice 4 | observed: intent-story-changes.spec.ts: step 'Intent names the story…' — .intent-story-name text |
| 5.3 | Selection stays disposable page state, not URL (ADR 0008) | slice 1 | observed: pageStorySelection.tsx + PageFrame provider; no URL write in selection owner |
| 6.1 | With story selected, Intent offers Selected story only toggle | slice 5 | observed: intent-story-changes-only.spec.ts test 1: 'Selected story only' checkbox present, unchecked on arrival; intent-story-changes-gaps.spec.ts: absent without a comparison, offered unchecked after Retry |
| 6.2 | Toggle off by default; whole tree with changes highlighted | slice 4 | observed: intent-story-changes.spec.ts: unchanged kept.spec.ts visible and plain beside changed files (no toggle until slice 5) |
| 6.3 | Without selected story, Intent shows no toggle or highlight (apart from folder default) | slice 1 | observed: story-card-selection.spec.ts: deselected Intent has no Selected story only control/text |
| 7.1 | Intent uses selected story's default Review changes comparison (all changes incl. uncommitted) | slice 4 | observed: intent-story-changes.spec.ts: revisions line 'uncommitted changes included'; untracked added b.spec.ts shown with Review's diff |
| 7.2 | Same comparison read as Review changes | slice 3 | observed: useStoryComparison.ts calls useStoryReviewSelection + useStoryReviewComparison, the reads Review changes uses; story-review-* journeys green (171) |
| 7.3 | Intent states which revisions it compared | slice 4 | observed: intent-story-changes.spec.ts: revisions line names baseline sha, worktree path and head sha |
| 7.4 | No comparison → explanation | slice 4 | observed: intent-story-changes-gaps.spec.ts: no-workspace test — exact no-comparison explanation, no Retry |
| 7.5 | Failed read → explanation and retry | slice 4 | observed: intent-story-changes-gaps.spec.ts: route-failed review read shows explanation with Retry; Retry then shows the changes |
| 7.6 | Neither missing nor failed comparison shown as no changes | slice 4 | observed: intent-story-changes-gaps.spec.ts: expectPublishedTreeUsable — no data-kind, no contains-changes, no 'no changes' text in both variants |
| 8.1 | In-scope: path or old path in configured location selection | slice 4 | observed: intent-story-changes-moves.spec.ts: into/out-of/between renames each visible once; out-of rename at its old path |
| 8.2 | Added files shown where they belong | slice 4 | observed: intent-story-changes.spec.ts: Added boundary/b.spec.ts inserted at its path; intent-story-changes-moves.spec.ts: into-rename at new path |
| 8.3 | Out-of-location changes not listed | slice 4 | observed: intent-story-changes.spec.ts: App.tsx and notes.md not listed; intent-story-changes-moves.spec.ts: docs rename not listed |
| 8.4 | Count outside + Review changes pointer | slice 4 | observed: intent-story-changes.spec.ts: exact outside-count text with Review changes button opening the review; intent-story-changes-moves.spec.ts: count stays 2 (rename once) |
| 9.1 | Selected story only: only in-scope changed files and folders | slice 5 | observed: intent-story-changes-only.spec.ts test 1 'on' step: only the changed files and their folders; intent-story-changes-moves.spec.ts: deleted and renamed entries in both states with equal diffs |
| 9.2 | No in-scope changes message | slice 5 | observed: intent-story-changes-only.spec.ts test 2: .intent-story-none exact text, no location sections |
| 9.3 | Outside count when any | slice 5 | observed: intent-story-changes-only.spec.ts test 2: outside-count text when off and on |
| 10.1 | Full published tree; change-kind styles | slice 4 | observed: intent-story-changes.spec.ts: computed name styles for modified/added/deleted/renamed vs plain |
| 10.2 | Contains-changes background on folders/groups with changes | slice 4 | observed: intent-story-changes.spec.ts: data-contains-changes and equal non-transparent background on changed folders and both location sections; 'other' has neither |
| 10.3 | Deleted file stays visible and styled removed | slice 4 | observed: intent-story-changes.spec.ts and intent-story-changes-moves.spec.ts: Deleted gone.spec.ts visible with deleted style |
| 11.1 | One change-kind style set including modified | slice 3 | observed: change-kinds.css — added/modified/deleted/renamed; story-review-tree.spec.ts kind-style step asserts modified = --accent |
| 11.2 | Review changes shows same styles | slice 3 | observed: story-review-tree.spec.ts: Modified rows in Review changes compute to --accent; StoryReviewFileTree.tsx imports change-kinds.css |
| 11.3 | Review needs no contains-changes; not forbidden | slice 3 | observed: FileTree renders data-contains-changes; no Review style for it; boundary/story-review-folders.spec.ts contains-changes model test |
| 12.1 | Changed file → same FileDiff as Review in Purpose | slice 4 | observed: intent-story-changes.spec.ts: Modified and Added diffs equal Review changes' .story-review-code text |
| 12.2 | Unchanged files show published source | slice 4 | observed: intent-story-changes.spec.ts: step 'an unchanged file shows its published source' — 'kept 11', no diff, no proof note |
| 12.3 | Proof describes published revision and says so | slice 4 | observed: intent-story-changes.spec.ts: .intent-proof-published exact text naming the published revision |
| 12.4 | Proof for story's version not claimed | slice 4 | observed: intent-story-changes.spec.ts: proof note says 'not this story's version of the file' |
| 13 | Changed file matches Review; views never disagree | slice 4 | observed: intent-story-changes.spec.ts and intent-story-changes-moves.spec.ts: every changed kind's diff equals Review changes' |
| 14.1 | Folders start collapsed when tree first shown | slice 2 | observed: intent-entry-folder-summaries-folders.spec.ts: Ex 8 step — every folder caret aria-expanded=false, nested file hidden; intent-test-optimization-candidates-open.spec.ts: Ex 8 record-opened file selected with its folders open |
| 14.2 | Open folders containing changes on Intent open with selection or toggle | slice 4 | observed: intent-story-changes.spec.ts: expansion step — arriving, boundary, out folders open |
| 14.3 | First changed location group opens | slice 4 | observed: intent-story-changes.spec.ts: dashboard/tests group open, tests group collapsed |
| 14.4 | Other folders stay collapsed | slice 4 | observed: intent-story-changes.spec.ts: 'other' folder collapsed, other/c.spec.ts hidden |
| 14.5 | Story change while Intent hidden does not rearrange | slice 5 | observed: intent-story-changes-only.spec.ts test 1 hidden-selection step: Story B selected in Development while Intent hidden, Intent opens on B's state; reselecting A re-applies its expansion (Intent unmounts while hidden) |
| 14.6 | Rule applies next Intent open or toggle | slice 5 | observed: intent-story-changes-only.spec.ts test 1: hand-collapsed folders reopen at each toggle; hidden-selection step shows the rule on next open |
| 15.1 | One comparison-read implementation | slice 3 | observed: storyComparisonShown.ts used by StoryReviewBody and useStoryComparison; storyComparisonOffered gates StoryReviewAction |
| 15.2 | One change-kind/styles implementation | slice 3 | observed: one ChangeKind in reviewFileTree.ts, one style file change-kinds.css |
| 15.3 | One file-tree implementation | slice 3 | observed: reviewFileTree/FileTree remain the only tree, used by Review and IntentLocationGroup; Intent journeys green |
| 15.4 | One diff implementation | slice 3 | observed: FileDiff unchanged; storyComparisonShown returns its reviewed/from/tree arguments |
| 16.1 | Playwright covers key examples with workspace + completed fixtures | slice 6 | observed: dashboard/tests/intent-story-completed.spec.ts (completed fixture) plus intent-story-changes*.spec.ts (workspace fixture) |
| 16.2 | Terry evaluation on real Open Dough story | slice 7 | observed: PLAN.md 'Slice 7 evaluation (delegated by Terry)' — Terry delegated the evaluation to the agent on 2026-11-02 ("you do the evaluation") |
| 16.3 | Apply failing and flaky test policy | slice 1 | observed: AGENTS.md failing/flaky policy applied; focused selection+navigation specs green |
| 17 | Never present missing/failed comparison or no in-scope changes as empty change set | slice 4 | observed: intent-story-changes-gaps.spec.ts: expectPublishedTreeUsable in no-comparison and failed-read variants |
| E1 | Journey: Taken workspace story select + Intent highlight/diff | slice 4 | observed: intent-story-changes.spec.ts: whole journey |
| E2 | Journey: Selected story only toggle on/off | slice 5 | observed: intent-story-changes-only.spec.ts test 1 and intent-story-changes-moves.spec.ts both toggle states |
| E3 | Journey: outside-locations count | slice 4 | observed: intent-story-changes.spec.ts and intent-story-changes-moves.spec.ts: outside-count steps |
| E4 | Journey: product-only / no in-scope message | slice 5 | observed: intent-story-changes-only.spec.ts test 2 (product-only change) |
| E5 | Journey: completed Recently done + published comparison | slice 6 | observed: dashboard/tests/intent-story-completed.spec.ts test 1 — Recently done card click selects; Intent shows the published comparison, deletion absent from published tree shown removed in both toggle states, diffs equal Review's |
| E6 | Journey: no comparison explanation; tree usable | slice 4 | observed: intent-story-changes-gaps.spec.ts: no-workspace test then expand, select a.spec.ts, source 'a 11' |
| E7 | Journey: deselect clears Intent toggle; Start/session do not select | slice 1 | observed: story-card-selection.spec.ts: deselect clears Intent toggle absence; Start/session do not select |
| E8 | Journey: no selection → folders collapsed | slice 2 | observed: intent-entry-folder-summaries-folders.spec.ts: Ex 8 step with no story selected |
| X1 | Deferred: other Intent comparisons |  | X1 |
| X2 | Deferred: Intent config changed by story |  | X2 |
| X3 | Deferred: proof of story version / protection / complexity |  | X3 |
| X4 | Deferred: marking review from Intent |  | X4 |
| X5 | Deferred: URL selection / sidebar / refs beyond today |  | X5 |
