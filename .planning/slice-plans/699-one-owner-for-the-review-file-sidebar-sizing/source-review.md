# Source review for SEED-384#one-owner-for-the-review-file-sidebar-sizing

The coordinator launched a fresh general-purpose reviewer on 2026-11-18
(agent `43dbeb22-e15a-4a94-aa22-fdeeddaffdf9`) with only the seed section's
Goal and Scope. It was asked to read no project files and change nothing.
The launch input and returned commitments are retained in this execution's
conversation and summarized here.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P1 | One owner for side-by-side sizing. Goal: Dashboard maintainers change the review file sidebar's width … in one place each; Scope: The review file sidebar's side-by-side … sizing … each have one owner. | slice 1 | observed: dashboard/src/story-review-workarea.css .story-review-workarea > .story-review-files flex: 0 0 var(--story-review-files-width); story-review.css .story-review-files no longer owns flex basis |
| P2 | One owner for stacked sizing. Goal (same width … in one place each); Scope: The review file sidebar's … stacked sizing … each have one owner. | slice 1 | observed: dashboard/src/story-review-workarea.css @container stacked .story-review-workarea > .story-review-files flex:none max-height:40%; stacked block removed from story-review.css |
| P3 | One owner for the 16rem default. Goal: its default … in one place each; Scope: its 16rem default, each have one owner. | slice 1 | observed: dashboard/src/reviewFileSidebarWidth.ts defaultFileSidebarWidthRem; StoryReviewWorkarea.tsx sets --story-review-files-width rem-then-px; CSS var without 16rem fallback |
| P4 | Panel divider and Files divider share one vertical grip. Goal: its divider's grip in one place each; Scope: the Panel divider and the Files divider share one vertical grip. | slice 1 | observed: dashboard/src/resize-divider.css .resize-divider[aria-orientation=vertical]::after shared geometry; panel-divider and story-review-files-divider ::after left only |
| P5 | Review sidebar tests prove only what the review adds to the shared kept preference. Goal: its tests prove only what the review adds to the shared kept preference; Scope: The Files divider specs … stop repeating the shared kept-preference proof. | slice 2 |  |
| P6 | Files divider specs keep proof of the review's own rules. Scope: The Files divider specs keep proof of the review's own rules. | slice 2 |  |
| P7 | Reaching the divider's upper bound is explicit. Scope: reaching the divider's upper bound is explicit. | slice 2 |  |
| P8 | Review / product behavior unchanged. Goal: with the review's behavior unchanged; Scope: No product behavior changes. | slice 1 | observed: evidence slice1-20261118T164915 frontend-review, e2e-review, typecheck exitStatus 0; side-panel-width green after grip move |
| P9 | Intent's locations column keeps its width. Scope: Intent's locations column keeps its width. | slice 1 | observed: dashboard/src/story-review.css .story-review-files shared box retained; evidence slice1-20261118T164915-frontend-intent exitStatus 0 |

## Unnumbered source context

- Identity: `SEED-384#one-owner-for-the-review-file-sidebar-sizing`; correction from the retrospective of Resize and remember the Review changes file sidebar.
- Scope exclusion / non-result: "no new product promise."
- No separate Key examples beyond Scope; no human amendments beyond that text.
