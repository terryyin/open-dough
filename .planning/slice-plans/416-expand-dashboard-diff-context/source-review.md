# Source review: SEED-189#expand-dashboard-diff-context

**Launch:** Fresh general-purpose reviewer (no conversation inheritance); model inherit.
**Input:** Only the selected story Goal, Scope (required behavior, limits, deferred, boundary assumptions), and Key examples from `.planning/seeds/SEED-189-dashboard-diff-context-expansion.md#expand-dashboard-diff-context`. No plan, product, proof, or suspected omission.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reviewing a story’s changed files in the dashboard Side panel story review can read the unchanged code surrounding a change without leaving the review, using directional load-more controls in the line-number gutter in the manner of the GitHub diff controls shown in the source screenshot. | slice 2 | observed: `dashboard/tests/story-review-diff-context.spec.ts` journey; `StoryReviewFileDiff.tsx` / `StoryReviewDiffLines.tsx` / `StoryReviewContextGap.tsx` gutter expand in Side panel review |
| 2 | Where unchanged lines are omitted before, between, or after diff hunks, show directional gutter controls. | slice 2 | observed: story-review-diff-context.spec.ts — before/between/after gap lists expose preceding/following buttons; `omittedGaps` + `GapBlock` |
| 3 | Each activation reveals **20** more preceding or following context lines at that boundary from the same file revisions as the comparison (`baseline`/`from` and `tree`, with rename `oldPath` when present). | slice 2 | observed: `CONTEXT_EXPAND_CHUNK = 20`; spec steps assert Show 20 preceding/following; text from `storyReviewFileTextEndpoint` |
| 4 | Repeated activation continues until that gap is exhausted. | slice 2 | observed: inter-hunk and trailing steps click until controls gone |
| 5 | Overlapping expansions show each context line once. | slice 2 | observed: between-gap step `expect(texts).toEqual([...new Set(texts)])` |
| 6 | Old and new line numbers stay correct when context is expanded. | slice 2 | observed: upward step `shownLineNumbers` 31–50; markers step keeps hunk numbers |
| 7 | Change markers stay correct when context is expanded. | slice 2 | observed: markers step — removed/added classes on `-line 54` / `+changed fifty-four` after expand |
| 8 | Code order stays correct when context is expanded. | slice 2 | observed: closed between-gap lines 58…123 contiguous; trailing ends at line 160 |
| 9 | Insertions above the reading position keep the current place usable. | slice 2 | observed: mid-viewport upward expand step `\|afterTop-beforeTop\| < 4` with product scroll adjust |
| 10 | Controls work with pointer. | slice 2 | observed: `.click()` on expand buttons in journey |
| 11 | Controls work with keyboard. | slice 2 | observed: between-gap `.press("Enter")` on following control |
| 12 | Controls work with touch. | slice 2 | observed: `test.use({ hasTouch: true })` and `.tap()` on preceding control |
| 13 | When additional context cannot be read, the existing diff stays readable. | slice 2 | observed: failed-read step keeps first-hunk printed lines |
| 14 | When additional context cannot be read, the failure is visible. | slice 2 | observed: `role=alert` “Additional context could not be read” |
| 15 | When additional context cannot be read, there is a way to retry. | slice 2 | observed: alert Retry button restores expand controls |
| 16 | Do not change the initial hunk context Git already prints. | slice 1 | observed: `dashboard/tests/story-review-file-text-admission.spec.ts` printed `/review/file` body equal before and after text reads; `storyReviewFileResponse` still default `git diff` without raising `-U` |
| 17 | Do not add a one-click “load entire remaining gap” action. | slice 2 | observed: spec asserts zero buttons matching `/entire\|whole\|all remaining\|whole file/i`; only directional chunk controls in `GapBlock` |
| 18 | Do not add a one-click “load whole file” action. | slice 2 | observed: same whole-file button absence assertion |
| 19 | Do not match GitHub styling beyond the directional gutter interaction. | slice 2 | observed: `story-review-diff.css` expand controls are local ▲/▼ buttons; no GitHub chrome/classes |
| 20 | Do not add side-by-side diffs. | slice 2 | observed: still single unified `story-review-code` column; no side-by-side layout |
| 21 | Do not add word-level diffs. | slice 2 | observed: lines remain whole-line `DiffLine` kinds; no word-level split |
| 22 | Do not persist expansion state across files. | slice 2 | observed: `StoryReviewSnapshotView.tsx` keys `FileDiff` by ``${from}:${comparedTree}:${selected.path}``; reveals are component `useState` only |
| 23 | Do not persist expansion state across sessions. | slice 2 | observed: reveals in `useState` only — no localStorage/sessionStorage/server mark for expansion |
| 24 | Whole-gap expand in one action is deferred (not accepted in this story). | slice 2 | observed: only 20-line (or remainder) chunk buttons; no whole-gap control |
| 25 | Whole-file expand in one action is deferred (not accepted in this story). | slice 2 | observed: no whole-file expand control |
| 26 | Different chunk sizes are deferred (not accepted in this story). | slice 2 | observed: single `CONTEXT_EXPAND_CHUNK = 20` |
| 27 | Changing default `-U` for the first paint is deferred (not accepted in this story). | slice 2 | observed: first-paint assertions still match Git default hunk headers/context; `storyReviewFileResponse` has no `-U` raise |
| 28 | Qualification: The review already admits one file under a concrete `baseline`/`from` and `tree` (and optional `oldPath`). | slice 1 | observed: `fileTextRequest` and `fileDiffRequest` both call shared `admitReviewedFile` with the same query identity (`dashboard/server/storyReviewAdmission.ts`); admission spec uses that identity for text and printed diff |
| 29 | Qualification: Omitted ranges are filled from those revisions’ file text, not by inventing a larger printed unified diff as the product model. | slice 2 | observed: `diffContextExpansion.ts` splices from `FileLineSides`; UI fetches `storyReviewFileTextEndpoint`; printed path still default `git diff` |
| 30 | Journey: A hunk starts at line 54 with earlier unchanged lines omitted → an upward gutter control reveals the 20 preceding lines immediately above it (or fewer when fewer remain). | slice 2 | observed: upward-before-first step lines 31–50 |
| 31 | Journey: Two hunks end at line 61 and start at line 124 → a downward control after the first hunk and an upward control before the second each reveal 20 lines from their end of the omitted gap. | slice 2 | observed: between-gap down then up steps show 58–77 and 104–123 |
| 32 | Journey: Repeated expansion of that inter-hunk gap eventually closes the gap without duplicate lines. | slice 2 | observed: closed length 66, unique texts, 58…123 |
| 33 | Journey: When fewer than 20 lines remain in a gap, only those lines appear and that control becomes unavailable. | slice 2 | observed: `Show 6 following` then between buttons count 0; trailing `Show 10 following` then buttons 0 |
| 34 | Journey: Unchanged lines remain after the final hunk → its downward gutter control reveals following lines in the same 20-line steps. | slice 2 | observed: after-gap 20 then 10 trailing lines |
| 35 | Journey: No expansion is offered beyond the beginning or end of the file. | slice 2 | observed: before-gap has no following; after-gap has no preceding; trailing exhausts at line 160 EOF |
| 36 | Journey: The comparison contains additions or removals → expanding unchanged context preserves old/new numbering and existing added/removed styling. | slice 2 | observed: markers/numbering step on first hunk after expands |
| 37 | Journey: The developer has scrolled so a hunk is mid-viewport, then expands upward above that hunk → the previously focused lines stay in view (reading position remains usable). | slice 2 | observed: mid-viewport upward expand step with scroll adjust |
| 38 | Journey: Context for a gap cannot be read → the printed diff remains as before; the failure is visible at that control with a way to retry. | slice 2 | observed: failed-read step alert + Retry |
