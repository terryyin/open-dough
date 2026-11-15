# Slice 6 observing setup and scroll helper occurrences

Original source prefix: `37fb6a94cbb6:dashboard/tests/intent/intent-revision-`.
Original shared opener observation: `37fb6a94cbb6:intentRevisionJourney.ts:81`.
Both maintained transport openers now call `intentRevisionJourney.ts:62`
`openJobsFeature`; its line69 retains the identical Archive source assertion.
The original caller-supplied files, feature path and scenario remain unchanged.
Neither opener constructs expected output. `scrollIntentReadingHalfway` remains the same real page object
at `dashboard/tests/intentPerspectivePage.ts:207`; it asserts offset >20.

| Original suffix and line | Named case | Maintained call | Observing disposition |
| --- | --- | --- | --- |
| notice:59 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | dashboard/frontend-tests/intent/intent-revision-notice.spec.ts:60 | Real app entry, expanded feature and selected Purpose; opener asserts source contains Scenario: Archive a job. Same original files/revision; immutable service answers replace acquisition setup. |
| notice:63 | newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read | dashboard/frontend-tests/intent/intent-revision-notice.spec.ts:65 | Same real reading-pane scroll; unchanged helper asserts offset >20 and returns measured offset for exact equality checks. |
| notice:138 | Development follows a new revision while Intent, opened again, keeps its reading behind the notice | dashboard/frontend-tests/intent/intent-revision-notice.spec.ts:141 | Real app entry, expanded feature and selected Purpose; opener asserts source contains Scenario: Archive a job. Same original files/revision; immutable service answers replace acquisition setup. |
| notice:176 | a selected feature the latest revision deleted is explained, with nothing else selected | dashboard/frontend-tests/intent/intent-revision-notice.spec.ts:181 | Real app entry, expanded feature and selected Purpose; opener asserts source contains Scenario: Archive a job. Same original files/revision; immutable service answers replace acquisition setup. |
| planning-only:32 | a planning-only update keeps a persistent browser revision with no file selected | dashboard/frontend-tests/intent/intent-revision-planning-only.spec.ts:33 | Real app entry, expanded feature and selected Purpose; opener asserts source contains Scenario: Archive a job. Same original files/revision; immutable service answers replace acquisition setup. |
| settings-update:22 | an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update | dashboard/frontend-tests/intent/intent-revision-settings-update.spec.ts:23 | Real app entry, expanded feature and selected Purpose; opener asserts source contains Scenario: Archive a job. Same original files/revision; immutable service answers replace acquisition setup. |
| update-boundaries:47 | an unusable settings file at the latest revision takes the reading's focus into its explanation | dashboard/frontend-tests/intent/intent-revision-update-boundaries.spec.ts:47 | Real app entry, expanded feature and selected Purpose; opener asserts source contains Scenario: Archive a job. Same original files/revision; immutable service answers replace acquisition setup. |
| update-boundaries:68 | choosing another project while an update is held shows only that project's reading when it is answered | dashboard/frontend-tests/intent/intent-revision-update-boundaries.spec.ts:68 | Real app entry, expanded feature and selected Purpose; opener asserts source contains Scenario: Archive a job. Same original files/revision; immutable service answers replace acquisition setup. |
| update-outcomes:48 | a failed update keeps the shown reading with its failure and Retry, which applies the update | dashboard/frontend-tests/intent/intent-revision-update-outcomes.spec.ts:49 | Real app entry, expanded feature and selected Purpose; opener asserts source contains Scenario: Archive a job. Same original files/revision; immutable service answers replace acquisition setup. |
| update-outcomes:136 | Development → Intent during a held then failing update keeps the shown reading with its failure and Retry | dashboard/frontend-tests/intent/intent-revision-update-outcomes.spec.ts:139 | Real app entry, expanded feature and selected Purpose; opener asserts source contains Scenario: Archive a job. Same original files/revision; immutable service answers replace acquisition setup. |

These 10 calls supplement the 118 exact observing statements in the five assertion tables.
