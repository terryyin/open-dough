# Open Review changes on a Story card in Intent

**Identity:** SEED-420#route-review-changes-to-intent
**Source:** [Open Review changes on a Story card in Intent](../../seeds/SEED-420-unified-intent-review.md#route-review-changes-to-intent)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Goal and provisional scope

**Review changes** on a Story card opens Intent on that story's changes, so
a story has one review destination. The seed holds the scope and examples.
They were split from
the completed SEED-420#open-review-in-intent
at `7634d96a0`. No original executable plan existed. These slices provisionally
receive that story's entry and rollout scope. Refinement must confirm the
examples, the journey cohorts and proof operations before this plan becomes
executable.

## Architecture and existing owners

[`StoryReviewAction`](../../../dashboard/src/StoryReviewAction.tsx) opens the
Side panel review through
[`useOpenStoryReview`](../../../dashboard/src/pageStoryReviews.ts). The
session entries
([`AdHocSessionReviewAction`](../../../dashboard/src/AdHocSessionReviewAction.tsx),
[`PublishedSessionEntry`](../../../dashboard/src/PublishedSessionEntry.tsx))
keep that opening. The review journeys reach the review through
[`reviewChangesPage.ts`](../../../dashboard/test-support/reviewChangesPage.ts),
which alone knows where each control lives. At `7634d96a0` about 36 specs under
`e2e/review` and 22 under `dashboard/frontend-tests/review` use it. Size
the slices by those journey cohorts.

## Provisional slices and proof ownership

### 1. Intent keeps its comparison and Compare while a chosen read is in flight

Type: Behavior (correction of SEED-420#choose-story-comparison-in-intent,
provenance `29cd279`..`97eecc1`; found by its execution retrospective)
Status: planned
Behavior: while a commit range, a chosen landed run or a Refresh reads,
Intent keeps the last shown comparison and the Compare group, says that it
is reading, keeps focus on the pressed control, and leaves Refresh
focusable but unavailable, as the Side panel does
([`StoryReview.tsx`](../../../dashboard/src/StoryReview.tsx)). Today
[`useIntentStoryLens`](../../../dashboard/src/useIntentStoryLens.ts) turns
the comparison to `reading`, so `compareOf` and `defaultReviewOf` drop
Compare and the default. A Done story's locations and CI Done endpoint keep
reading the default throughout: the lens exposes `defaultReview` whatever
the chosen read's state. `isDefault` moves into `useStoryReviewSelection`
beside the defaults it compares, `defaultStoryComparison` goes, and
`wholeStory` gets one derivation (today `useIntentStoryLens` and
`IntentPage`).
Proof: Vitest Browser Mode cases on the mounted Intent view
([`intent-ci-perspective-mount.ts`](../../../dashboard/frontend-tests/intent/intent-ci-perspective-mount.ts),
[`intent-story-compare-stories.ts`](../../../dashboard/frontend-tests/intent/intent-story-compare-stories.ts),
[`intent-story-compare-page.ts`](../../../dashboard/frontend-tests/intent/intent-story-compare-page.ts)),
where the case's own `ReviewSource` returns a pending promise for the range
read and for the Refresh snapshot read, show the Compare group staying,
focus on the pressed control and the header saying it reads; a Done case
whose `ReviewSource` leaves the chosen run read pending keeps the locations
browser and the CI endpoint text. The five `intent-story-compare-*` specs
and `dashboard/frontend-tests/review` stay green. Order it first: slice 2 makes Intent the only story review.

### 2. Review changes on a Story card opens the story's Changes in Intent
Type: Behavior
Status: planned
Proof: The terminal example: the story is selected, Intent shows its
**Changes** on the first changed file, and the Side panel is unchanged.
Returning to Development shows the Board with the story selected.

### 3. The review page object reaches a story's review in Intent
Type: Structure
Status: planned
Proof: The story review journeys run against Intent through
`reviewChangesPage.ts` with unchanged scenarios. Cohorts by its parts:
comparison and commits, landed runs and details, files and diffs, frame and
touch. Enables slice 2's delivery, so order it before slice 2 or split it by
cohort at refinement.

### 4. Session entries keep the Side panel review
Type: Behavior
Status: planned
Proof: **Review changes** on an ad hoc Done entry and a published session
entry opens the Side panel review. Story-only paths of that review are
removed, including the request-comparison path no caller sends since
`ffb4ef63d`: `RequestedComparison`, `StoryReviewRequest.comparison` and
`historical`, the reconcile in `useStoryReviewRequest`, and the selection's
request-only options.
