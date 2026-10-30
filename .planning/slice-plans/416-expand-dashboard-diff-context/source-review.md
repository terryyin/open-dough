# Source review: SEED-189#expand-dashboard-diff-context

**Launch:** Fresh general-purpose reviewer (no conversation inheritance); model inherit.
**Input:** Only the selected story Goal, Scope (required behavior, limits, deferred, boundary assumptions), and Key examples from `.planning/seeds/SEED-189-dashboard-diff-context-expansion.md#expand-dashboard-diff-context`. No plan, product, proof, or suspected omission.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reviewing a story’s changed files in the dashboard Side panel story review can read the unchanged code surrounding a change without leaving the review, using directional load-more controls in the line-number gutter in the manner of the GitHub diff controls shown in the source screenshot. | slice 2 | |
| 2 | Where unchanged lines are omitted before, between, or after diff hunks, show directional gutter controls. | slice 2 | |
| 3 | Each activation reveals **20** more preceding or following context lines at that boundary from the same file revisions as the comparison (`baseline`/`from` and `tree`, with rename `oldPath` when present). | slice 2 | |
| 4 | Repeated activation continues until that gap is exhausted. | slice 2 | |
| 5 | Overlapping expansions show each context line once. | slice 2 | |
| 6 | Old and new line numbers stay correct when context is expanded. | slice 2 | |
| 7 | Change markers stay correct when context is expanded. | slice 2 | |
| 8 | Code order stays correct when context is expanded. | slice 2 | |
| 9 | Insertions above the reading position keep the current place usable. | slice 2 | |
| 10 | Controls work with pointer. | slice 2 | |
| 11 | Controls work with keyboard. | slice 2 | |
| 12 | Controls work with touch. | slice 2 | |
| 13 | When additional context cannot be read, the existing diff stays readable. | slice 2 | |
| 14 | When additional context cannot be read, the failure is visible. | slice 2 | |
| 15 | When additional context cannot be read, there is a way to retry. | slice 2 | |
| 16 | Do not change the initial hunk context Git already prints. | slice 1 | observed: `dashboard/tests/story-review-file-text-admission.spec.ts` printed `/review/file` body equal before and after text reads; `storyReviewFileResponse` still default `git diff` without raising `-U` |
| 17 | Do not add a one-click “load entire remaining gap” action. | slice 2 | |
| 18 | Do not add a one-click “load whole file” action. | slice 2 | |
| 19 | Do not match GitHub styling beyond the directional gutter interaction. | slice 2 | |
| 20 | Do not add side-by-side diffs. | slice 2 | |
| 21 | Do not add word-level diffs. | slice 2 | |
| 22 | Do not persist expansion state across files. | slice 2 | |
| 23 | Do not persist expansion state across sessions. | slice 2 | |
| 24 | Whole-gap expand in one action is deferred (not accepted in this story). | slice 2 | |
| 25 | Whole-file expand in one action is deferred (not accepted in this story). | slice 2 | |
| 26 | Different chunk sizes are deferred (not accepted in this story). | slice 2 | |
| 27 | Changing default `-U` for the first paint is deferred (not accepted in this story). | slice 2 | |
| 28 | Qualification: The review already admits one file under a concrete `baseline`/`from` and `tree` (and optional `oldPath`). | slice 1 | observed: `fileTextRequest` and `fileDiffRequest` both call shared `admitReviewedFile` with the same query identity (`dashboard/server/storyReviewAdmission.ts`); admission spec uses that identity for text and printed diff |
| 29 | Qualification: Omitted ranges are filled from those revisions’ file text, not by inventing a larger printed unified diff as the product model. | slice 2 | |
| 30 | Journey: A hunk starts at line 54 with earlier unchanged lines omitted → an upward gutter control reveals the 20 preceding lines immediately above it (or fewer when fewer remain). | slice 2 | |
| 31 | Journey: Two hunks end at line 61 and start at line 124 → a downward control after the first hunk and an upward control before the second each reveal 20 lines from their end of the omitted gap. | slice 2 | |
| 32 | Journey: Repeated expansion of that inter-hunk gap eventually closes the gap without duplicate lines. | slice 2 | |
| 33 | Journey: When fewer than 20 lines remain in a gap, only those lines appear and that control becomes unavailable. | slice 2 | |
| 34 | Journey: Unchanged lines remain after the final hunk → its downward gutter control reveals following lines in the same 20-line steps. | slice 2 | |
| 35 | Journey: No expansion is offered beyond the beginning or end of the file. | slice 2 | |
| 36 | Journey: The comparison contains additions or removals → expanding unchanged context preserves old/new numbering and existing added/removed styling. | slice 2 | |
| 37 | Journey: The developer has scrolled so a hunk is mid-viewport, then expands upward above that hunk → the previously focused lines stay in view (reading position remains usable). | slice 2 | |
| 38 | Journey: Context for a gap cannot be read → the printed diff remains as before; the failure is visible at that control with a way to retry. | slice 2 | |
