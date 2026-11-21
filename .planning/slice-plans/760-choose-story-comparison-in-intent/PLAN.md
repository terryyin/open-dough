# Choose what a story's review compares in Intent

**Identity:** SEED-420#choose-story-comparison-in-intent
**Source:** [Choose what a story's review compares in Intent](../../seeds/SEED-420-unified-intent-review.md#choose-story-comparison-in-intent)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Goal and provisional scope

A developer reviewing a story in Intent chooses what is compared without
leaving it. The seed holds the scope and examples. They were split from
the completed SEED-420#open-review-in-intent
at `7634d96a0`. No original executable plan existed. These slices provisionally
receive that story's comparison scope. Refinement must confirm the examples
and proof operations before this plan becomes executable.

## Architecture and existing owners

The Side panel review owns the choices today:
[`useStoryReviewRequest`](../../../dashboard/src/useStoryReviewRequest.ts)
for the worktree, runs and uncommitted changes,
[`useStoryReviewComparison`](../../../dashboard/src/useStoryReviewComparison.ts)
for all changes or commits, and
[`StoryReviewDetailsSection`](../../../dashboard/src/StoryReviewDetailsSection.tsx)
for the controls. Intent reads only the default through
[`useStoryComparison`](../../../dashboard/src/useStoryComparison.ts) in
[`useIntentStoryLens`](../../../dashboard/src/useIntentStoryLens.ts). Give
Intent's story scope the same owners. Do not add a second selection model.
The Side panel review keeps them until
[plan 761](../761-route-review-changes-to-intent/PLAN.md).

## Provisional slices and proof ownership

### 1. Intent's story lens reads the review's selection owner
Type: Structure
Status: planned
Proof: The lens reads the default comparison through the review's selection
owners. Every story-scoped Intent spec stays green. Enables slice 2.

### 2. Choosing commits or leaving out uncommitted changes updates Changes
Type: Behavior
Status: planned
Proof: The last-two-commits and uncommitted examples, with the header
naming the range, and a refresh of the worktree.

### 3. A Done story chooses a landed run or its published completion
Type: Behavior
Status: planned
Proof: The retired-worktree example and a captured landed run chosen in its
place.

### 4. CI views say when they describe the whole story
Type: Behavior
Status: planned
Proof: With a non-default comparison chosen, CI comparison, Proof and Intent
coverage each say so. With the default chosen, none does.

### 5. Changes explains a comparison it cannot show
Type: Behavior
Status: planned
Proof: No workspace, several worktrees and an unavailable landing each name
what is missing. A failed read offers Retry.
