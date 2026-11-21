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

### 1. Review changes on a Story card opens the story's Changes in Intent
Type: Behavior
Status: planned
Proof: The terminal example: the story is selected, Intent shows its
**Changes** on the first changed file, and the Side panel is unchanged.
Returning to Development shows the Board with the story selected.

### 2. The review page object reaches a story's review in Intent
Type: Structure
Status: planned
Proof: The story review journeys run against Intent through
`reviewChangesPage.ts` with unchanged scenarios. Cohorts by its parts:
comparison and commits, landed runs and details, files and diffs, frame and
touch. Enables slice 1's delivery, so order it first or split it by cohort
at refinement.

### 3. Session entries keep the Side panel review
Type: Behavior
Status: planned
Proof: **Review changes** on an ad hoc Done entry and a published session
entry opens the Side panel review. Story-only paths of that review are
removed.
