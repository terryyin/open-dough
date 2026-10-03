# Prove that a story's landed slices leave its review

**Identity:** SEED-088#prove-landed-slices-leave-the-review
**Source:** [correction story](../../seeds/SEED-088-dashboard-story-code-review.md#prove-landed-slices-leave-the-review).
**Prepared:** 2026-10-03 by the execution retrospective of
SEED-088#dashboard-story-code-review.

## Provenance and finding

The reviewed story is
[SEED-088#dashboard-story-code-review](../../seeds/SEED-088-dashboard-story-code-review.md#dashboard-story-code-review).
It was executed through plan 226, slices 1–5, in commits `23eba318`,
`389bb8f1`, `e63074a2`, `312a1bb4`, and `6ff2c450`.

Finding: key example 2 has no observing proof. The example says that when one
of the story's slices has already landed on trunk and its remaining commits
have not, the review shows only the unlanded changes. Plan 226's proof table
assigned it to slice 2. The slice 2 fixture
(`dashboard/tests/support/storyReviewWorktree.ts`) lands only another story's
file and a later trunk commit, and no story commit reaches trunk. None of the
`dashboard/tests/story-review*.spec.ts` journeys exercises a landed story
commit. A later change to the review baseline could therefore drop the example
without any test failing.

## Preserved promises and constraints

- The review baseline is still the merge-base of the snapshot's head and the
  freshly fetched `<remote>/<target>`, as plan 226 decided.
- Every existing review journey keeps its assertions.
- No feature promise is added.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| A story commit pushed to trunk becomes the merge-base, so the review lists only later story changes. | Scratch repository: bare origin, linked worktree `story`. Commit `landed.txt` and push `story:main`. Commit `later.txt`. Then `git fetch origin main`, `merge-base HEAD origin/main`, the temporary-index `write-tree`, and `diff --name-status base tree`. | The merge-base equalled the landed commit, and the output was only `A later.txt`. |

## Proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| Story example 2: a landed slice drops out and the unlanded changes remain | 1 | Page journey |

## Slices

### 1. A landed slice leaves the review
Type: Behavior
Status: planned
Proof: a review page journey, either a new `dashboard/tests/story-review-*.spec.ts`
or a step in an existing one that stays under the project's file-size
convention. Run it with
`npm run test:dashboard -- story-review` together with
`npm run typecheck:dashboard`.

Behavior: a story worktree off a real bare origin has a first story commit
pushed to trunk, then a second story commit and an uncommitted edit that are
not on trunk. The developer opens the story's review. The review names the
landed commit as its baseline and lists only the second commit's file and the
edited file. The landed commit's file is not listed.

Reuse the existing fixture helpers in
`dashboard/tests/support/storyReviewWorktree.ts` (such as `keepLaunchRecord`)
rather than building a second worktree fixture.

## Current decisions

- This correction is proof-only unless the journey shows that the behavior
  differs from the story. If it does, stop and report rather than changing the
  baseline rule.
