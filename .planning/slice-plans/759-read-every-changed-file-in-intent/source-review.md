# Source review: SEED-420#open-review-in-intent

Launch: a fresh general-purpose reviewer, no fork or inherited conversation,
on 2026-11-21 before the first delegation. Input: only the selected story
section of `.planning/seeds/SEED-420-unified-intent-review.md`
(`#open-review-in-intent`, Goal, Scope, out of scope, key examples, UI,
Architecture and effort hypothesis), with the story-state JSON removed;
sha256 of the input `89ed89bfa4b798a1c74bbe7d18623526a6dacbc9bd2d6386f380ca99c44dcabb`.
Instruction: use only that text, read no other files, change nothing, number
independently observable promises.

Unnumbered context returned: the story is the first of three opening a
story's change review in Intent; out of scope are the comparison choices,
**Review changes** on a card, the Intent only and Changes only filters, the
Home control, the repository inventory and sidebar behavior; the selected
file and line stay presentation state and are not part of a link; ADR 0008
makes Intent the shared review context and the tree becomes one join of the
Intent locations with all changed files; effort M.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The selected story's file view is named **Changes** instead of **Changed tests**. Source: "**Changes** replaces **Changed tests** as the name of the selected story's file view." | slice 4 |  |
| 2 | **Changes** lists every file the story's comparison changed, including production code, plans and documents. Example: a Taken story's worktree changed `dashboard/server/landing.ts`, `dashboard/backend-tests/review/landing.spec.ts` and its `PLAN.md`, and all three are listed. | slice 1 | observed: dashboard/frontend-tests/intent/intent-story-outside-locations.spec.ts "the changed files outside every Intent location follow the locations, once each…" (located specs plus dashboard/src/App.tsx and a docs rename listed); backend intent-story-overlay.spec.ts outside list |
| 3 | A changed file that sits in an Intent location stays in that location's tree. Example: "lists the spec in its location". | slice 1 | observed: dashboard/backend-tests/intent/intent-story-overlay.spec.ts placement cases; intent-story-changes-only.spec.ts located specs stay in their locations |
| 4a | Changed files outside Intent locations are listed after the locations, under their repository folders. | slice 1 | observed: dashboard/frontend-tests/intent/intent-story-outside-locations.spec.ts listing test: outside group last, files under dashboard/src and docs folders; overlay spec outsideFolders |
| 4b | Those outside files use the same rows, change markers and folder controls as files in locations. | slice 1 | observed: dashboard/frontend-tests/intent/intent-story-outside-locations.spec.ts listing test: each outside row carries its change marker (data-kind) through shared FileTree/IntentTreeFileRow, docs folder control open |
| 4c | The outside files follow the locations in the same tree, under one heading that says they are outside Intent locations. | slice 1 | observed: dashboard/frontend-tests/intent/intent-story-outside-locations.spec.ts listing test: heading "Outside Intent locations" after the location groups |
| 5 | Selecting any listed file, including one outside Intent locations, shows its diff as Purpose. Example: "Selecting `landing.ts` shows its diff." | slice 1 | observed: dashboard/frontend-tests/intent/intent-story-outside-locations.spec.ts "a file outside every Intent location reads its diff as Purpose…": App.tsx heading and diff text |
| 6 | That diff offers the diff notes and Follow up that Intent's diffs offer today, for every listed file. | slice 1 | observed: e2e/intent/intent-story-follow-up.spec.ts file Follow up on outside dashboard/src/landing.ts (dialog Path); dashboard/frontend-tests/intent/intent-story-notes.spec.ts "a line note can start from the diff of a file outside Intent locations" |
| 7 | Proof of a test file reads its CI evidence as it does today. | slice 3 |  |
| 8 | Proof says so when a file has no file-level CI evidence. Example: "Proof of `landing.ts` says that it has no file-level CI evidence." | slice 3 |  |
| 9a | Going from a diff to Proof and back returns to the same file and line, as it does today for a changed test. | slice 3 |  |
| 9b | Going from a diff to CI comparison and back returns to the same file and line. | slice 3 |  |
| 10 | **Selected story only** narrows the tree to the changed files and includes those outside Intent locations. Example: "**Selected story only** leaves the spec, `landing.ts` and `PLAN.md`." | slice 1 | observed: dashboard/frontend-tests/intent/intent-story-outside-locations.spec.ts selecting test: outside file stays listed and selected under Selected story only; listing test keeps the outside group |
| 11 | Under **Selected story only**, a story that changed only product code lists that code and says that no test files in Intent locations changed. | slice 1 | observed: Product-code-only story (only dashboard/src/App.tsx changed): dashboard/frontend-tests/intent/intent-story-outside-locations.spec.ts selecting test shows App.tsx listed and selected under Selected story only; intent-story-changes-only.spec.ts "a story that changed only product code…" shows "No test files in Intent locations changed in this story" |
| 12 | The header no longer shows a count of changed files outside Intent locations. | slice 2 | observed: dashboard/frontend-tests/intent/intent-story-outside-locations.spec.ts "the selected story's header counts none of the files listed outside every Intent location": outside file listed, story summary has no "outside Intent locations" text and no button named /outside/ |
| 13a | In a project with no configured Intent locations, **Changes** still lists the selected story's changed files under their repository folders. | slice 5 |  |
| 13b | In that same project, the view still says that no locations are configured. | slice 5 |  |
| 14 | The comparison used is the story's default one, read as Intent reads it today. | slice 1 | observed: dashboard/src/IntentPage.tsx and useIntentStoryTree read story.compared.shown.comparison.files unchanged; no new comparison reader (diff inspection) |
| 15a | A Taken story with no workspace on this machine keeps today's explanation and Retry. | slice 5 |  |
| 15b | When several worktrees hold the story's claim, today's explanation and Retry are kept. | slice 5 |  |
| 15c | When the read fails, today's explanation and Retry are kept. | slice 5 |  |
| 16 | A Done story whose worktree is retired lists every file of its published completion, production code included. | slice 1 | observed: dashboard/frontend-tests/intent/intent-story-outside-locations.spec.ts "a Done story lists its published completion's product code outside the locations…" |
| 17 | The story's Intent keeps its three views in the order CI comparison, **Changes**, Intent coverage. | slice 4 |  |
