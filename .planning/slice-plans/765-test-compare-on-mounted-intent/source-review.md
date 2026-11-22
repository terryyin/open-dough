# Source review for SEED-420#test-compare-on-mounted-intent

The coordinator launched a fresh general-purpose reviewer on 2026-11-22 with
no conversation inheritance. Its only input was the story's Goal and Scope and
the plan's correction findings and preserved promises, without slicing. It was
told to read no files and change nothing. The launch input and the returned
commitments are in this execution's Claude Code conversation.

Unnumbered context returned:
- "Fast unit feedback" states no threshold, so the 20.8 s baseline is context
  only.
- Reason: the story broke the North Star. Playwright belongs only in `e2e/`,
  test support may only shrink outside MakeMe, and unit cases mount the owning
  component with typed inputs.
- Provenance: `beb2e240` (`29cd279ec`..`97eecc17a`).
- Wrapper locations: `frontendStoryReview.ts`, `frontendStoryReviewRoutes.ts`
  and `intentStoryPage.ts`.

C3's behaviors are the observations recorded for the corrected story at
`beb2e240:.planning/slice-plans/760-choose-story-comparison-in-intent/source-review.md`
(ids 1–18 and 20–22), each kept by the moved case that observed it.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | The five intent-story-compare specs (commits, uncommitted, done, evidence, gaps) run as plain Vitest Browser Mode cases that mount the production Intent view with a typed review source. | slice 4 | observed: intent-story-compare-{commits,uncommitted,done,evidence,gaps}.spec.ts import vitest and mount production IntentPerspective through intent-ci-perspective-mount.ts with a typed ReviewSource (s4-proof-1.json, r-proof-1.json) |
| C2 | Those specs contain no `@playwright/test` import, no `page.route`, no `test.step` and no Dashboard Test Support page object. | slice 4 | observed: rg for @playwright/test, page.route, test.step and test-support/support over the five specs finds nothing |
| C3 | Every behavior the 10 cases observe stays proved, with the same distinguishing observation. Case titles may stay. | slice 4 | observed: every observation of the 10 Playwright cases asserted in the Vitest specs (s1-, s3-, s4-report.md); the Taken evidence case's same-text check runs over unavailable CI answers (gap recorded in the plan) |
| C4 | Dashboard Test Support no longer contains the story's wrappers: `failNextRange`, `failNextRunSnapshot`, `failNextReviewRead`, `storyCompare`, and the `compare`, `panel` and `wholeStoryNote` members of `intentStory`, `header.alert` and the `storyTabPanel` re-export. | slice 4 | observed: failNextRange, failNextRunSnapshot, failNextReviewRead, storyCompare, intentStory.compare, intentStory.wholeStoryNote and header.alert removed; intentStory.panel kept for 3 later consumers and storyTabPanel predates the story (plan slice 4 note) |
| C5 | The review MakeMe builders `aReviewCommit` and `anUncommittedReviewItem` load in the page MakeMe entry (`pageMakeMe.mjs`). | slice 1 | observed: Distribution/tests/support/pageMakeMe.mjs registers reviewCommitMakeMeProperties; intent-story-compare-commits.spec.ts builds commits with pageMakeMe's aReviewCommit |
| C6 | Plan 761 slice 1's proof is restated on the same Vitest Browser Mode mount, no longer prescribing `holdNextRange` and `holdNextSnapshot`. | slice 4 | observed: plan 761 slice 1 Proof restated on intent-ci-perspective-mount.ts with the case's own pending ReviewSource answers |
| C7 | No product behavior changes. | slice 4 | observed: dashboard/src changes only move the done-record read behind PageReads (slice 2); typecheck and E2E journeys pass |
