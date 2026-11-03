# Source review: SEED-192#intent-link-follows-landed-run

Launch: fresh general-purpose reviewer (no conversation inheritance), on
2026-11-03, given only story 5b's Goal and Scope text and the provenance
quotes of story 5a and story 5 from the plan; told to read no files and
change nothing. Returned commitments, numbered by the reviewer:

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal actor and start: a developer reviewing a story in Intent who has switched Review changes to Landed run | slice 1 | observed: dashboard/tests/intent-story-changes-landed-run.spec.ts "Review changes, opened from Intent, is switched to the landed run" step |
| 1.1 | "such as Terry" illustrates the developer, not a limit | slice 1 | observed: dashboard/tests/intent-story-changes-landed-run.spec.ts uses no developer-specific setup |
| 2 | Trigger: the developer then follows Intent's Review changes link again | slice 1 | observed: dashboard/tests/intent-story-changes-landed-run.spec.ts second step, intentChoice then openReviewFromIntent |
| 3 | The developer sees the comparison Intent shows | slice 1 | observed: dashboard/tests/intent-story-changes-landed-run.spec.ts second step, All changes checked, uncommitted checked, Landed run heading gone |
| 3.1 | So the two views do not disagree | slice 1 | observed: dashboard/tests/intent-story-changes-landed-run.spec.ts second step, reviewDiff equals intentDiff for the modified and added files |
| 4 | A bounded retrospective correction of story 5a | slice 1 | observed: diff confined to dashboard/src/useStoryReviewRequest.ts and useStoryReviewSelection.ts answerRun |
| 4.1 | Adds no new product promise | slice 1 | observed: no new control in Intent; StoryReview.tsx comparison switch unchanged |
| 5 | Intent's link returns a shown review from a landed run the developer chose to Intent's comparison | slice 1 | observed: dashboard/tests/intent-story-changes-landed-run.spec.ts first test; red on the old hook (All changes unchecked), green on the new |
| 5.1 | The landed run is shown because the developer chose it | slice 1 | observed: dashboard/tests/intent-story-changes-landed-run.spec.ts first test checks Landed runs in Review's Comparison switch |
| 6 | A review whose workspace answer falls back to a landed run, which Intent shows too, stays on that run | slice 1 | observed: dashboard/tests/intent-story-changes-landed-run.spec.ts second test, Landed runs checked and listbox at the run after the link is opened and followed again |
| 6.1 | The run comes from the workspace answer's own fallback | slice 1 | observed: dashboard/tests/intent-story-changes-landed-run.spec.ts second test removes the workspace so the answer falls back to the captured landing |
| 6.2 | Intent shows that same landed run too | slice 1 | observed: dashboard/tests/intent-story-changes-landed-run.spec.ts second test "Intent shows the landed run's tree", revision title equals the receipt revision |
| 6.3 | Following the link does not move this review off its fallback run | slice 1 | observed: dashboard/tests/intent-story-changes-landed-run.spec.ts second test "followed again" iteration |
| 7 | The Review changes marks doc states the rule (5 with 6) | slice 1 | observed: dashboard/STORY-REVIEW-MARKS.md paragraph on Intent's way to Review changes |
| 8 | Intent's link to Review changes shows the same comparison Intent shows | slice 1 | observed: dashboard/tests/intent-story-changes-landed-run.spec.ts first test and dashboard/tests/intent-story-changes-marked.spec.ts, both passing |
| 8.1 | Even for a story with a review mark | slice 1 | observed: dashboard/tests/intent-story-changes-marked.spec.ts passing on the changed hook |
| 9 | Changed files show the same comparison Review changes shows for that story | slice 1 | observed: intent- suite (intent-story-changes*.spec.ts) passing on the changed hook |
| 9.1 | So the two views never disagree | slice 1 | observed: dashboard/tests/intent-story-changes-landed-run.spec.ts first test diff equality and intent-story-changes-marked diff equality |
