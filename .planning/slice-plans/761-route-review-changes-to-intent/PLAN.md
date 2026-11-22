# Keep a story's comparison while its review is still reading

**Identity:** SEED-420#route-review-changes-to-intent
**Source:** [Keep a story's comparison while its review is still reading](../../seeds/SEED-420-unified-intent-review.md#route-review-changes-to-intent)
**Source review:** [Source-only review](source-review.md)

## Goal and scope

While one story is open in Intent, a commit range, a chosen landed run, or
Refresh keeps that story's last comparison and Compare on screen. Selecting
another story does not show the previous story's files while the new review
is unread. The card opening continues as
SEED-420#open-review-changes-from-a-story-card. The seed holds the narrowed
scope and key examples.

## Key examples and outside-in proof

| Promise | Owner | Observable signal |
| --- | --- | --- |
| Intent keeps its comparison and Compare while that story's chosen read is in flight | Slice 1 | `intent-story-compare-reading.spec.ts` |
| Selecting another story does not show the previous story's files while the new review is unread | Slice 1 | `intent-done-source-selection.spec.ts` |

The card-opening promises moved with plan 777.

## Architecture and existing owners

[`StoryReviewAction`](../../../dashboard/src/StoryReviewAction.tsx) opens the
Side panel review through
[`useOpenStoryReview`](../../../dashboard/src/pageStoryReviews.ts). The
session entries
([`AdHocSessionReviewAction`](../../../dashboard/src/AdHocSessionReviewAction.tsx),
[`PublishedSessionEntry`](../../../dashboard/src/PublishedSessionEntry.tsx))
keep that opening. The review journeys reach the review through
[`reviewChangesPage.ts`](../../../dashboard/test-support/reviewChangesPage.ts),
which alone knows where each control lives.

## Current decisions

- **The card's opening.** The card action becomes a page-level request
  beside the Selected story: it selects the story, writes the story's
  **Changes** tab and story scope into Intent's kept reading place
  ([`pageIntentReading.tsx`](../../../dashboard/src/pageIntentReading.tsx),
  keys `storyTab` and `scope` in
  [`intentStoryTabs.tsx`](../../../dashboard/src/intentStoryTabs.tsx)) for
  that selection, and selects the Intent perspective through
  [`dashboardRoute.ts`](../../../dashboard/src/dashboardRoute.ts), which
  already pushes one history entry. `useChoiceFor` compares the selection by
  reference, so the request must write for the same `SelectedStory` value
  the selection publishes.
- **First changed file.** The story-scope file selection
  ([`intentWorkspaceSelection.ts`](../../../dashboard/src/intentWorkspaceSelection.ts))
  is kept per scope, not per story. The request marks that a first file is
  wanted; once the story's comparison is read, Intent selects the first
  changed file in the tree's order (`useIntentStoryTree.ts`) unless the
  kept selection is a file the story's comparison lists. Keep that rule in
  one place beside the tree's existing first-changed-location expansion.
- **Journey placement.** `reviewChangesPage.ts` stays the one place that
  knows where review controls are. Its parts gain an Intent placement:
  Compare lives in Intent's header, so `details` reveals nothing there;
  `frame` (Maximize, Close) has no Intent counterpart. A journey that proves
  only Side panel frame mechanics moves to a session entry subject in
  slice 9; a journey whose only Side panel assertion is the frame drops it.
- **Interim root.** Slices 4–6 open the review in Intent through a root that
  selects the card and chooses Intent and **Changes** from the banner.
  Slice 7 replaces it with the card press and removes it.
- **No retired-only retention.** The Side panel half of
  `intent-done-retained-workspace.spec.ts` goes in slice 7, as decided.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts):
  opening a review in Intent sets the Selected story; the Selected story and
  Intent's view stay disposable page state. No ADR change. Slice 7 updates
  the Side panel review sentence in
  [Board interaction](../../../docs/dashboard-board-interaction.md) and drops
  the "Under the unified review design" qualifier there; the North Star's
  [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  keeps its topic until the later SEED-420 stories implement the rest.

## Decisive premises

| Consuming operation | Observation (form, profile, when) | Result | Remainder |
| --- | --- | --- | --- |
| Slices 4–7 reach a story's Changes in Intent from the Board and run review journeys | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR caffeinate -s -i npm run --silent test:e2e -- --workers=2 e2e/intent/intent-done-retained-workspace.spec.ts e2e/review/story-review-commits.spec.ts` at `442c4b6ed`, 2026-11-22 | Exit 0 in 56 s: selecting a Done story and choosing Intent then **Changes** reads its files and diffs; the commit cohort's root journey is green before the move | None |
| Slices 4–6 find every comparison control the journeys use in Intent | Accepted proof of SEED-420#choose-story-comparison-in-intent at `c64549aac` (`intent-story-compare-commits.spec.ts`, `-uncommitted`, `-done`) and SEED-420#open-review-in-intent at `f7964681` (`intent-story-outside-locations.spec.ts`, `intent-story-changes-no-locations.spec.ts`) | Commits, uncommitted changes, landed runs, published completion, outside files and diffs operate in Intent | None for controls; the context wording is the next row |
| Slices 4–6 assert the context line and kept-in-baseline feedback unchanged | Read at `442c4b6ed`: [`IntentStoryComparison.tsx`](../../../dashboard/src/IntentStoryComparison.tsx) `ComparedRevisions` says only "Compared <rev> with worktree <path> at <rev>"; no Intent module renders [`StoryReviewContext.tsx`](../../../dashboard/src/StoryReviewContext.tsx) or the kept-in note of [`StoryReviewFeedback.tsx`](../../../dashboard/src/StoryReviewFeedback.tsx); `story-review-context-line`, `-trunk-own-changes`, `-trunk-own-older-git` and `-landed` assert the branch, "less the story's 2 published commits" and the kept-in feedback | False as Intent stands: slice 3 adds that context before the journeys move | None |
| Slice 7's Done example | Same run: `intent-done-retained-workspace.spec.ts` | The Side panel reads the retained workspace's later edit; Intent reads the immutable completion | None |
| Slice 9 keeps session reviews | `grep` of story subjects in `dashboard/frontend-tests/review/*.spec.ts` at `442c4b6ed` | 11 specs mount the panel with `doneStory`; `adHocSession` exists in `story-review-page-contexts.ts` | Which of them prove story-only behavior Intent already covers is decided per spec in slice 8 |

## Slices

### 1. Intent keeps its comparison and Compare while a chosen read is in flight

Type: Behavior (correction of SEED-420#choose-story-comparison-in-intent,
provenance `29cd279`..`97eecc1`; found by its execution retrospective)
Status: done
Behavior: while a commit range, a chosen landed run or a Refresh reads,
Intent keeps the last shown comparison and the Compare group, says that it
is reading, keeps focus on the pressed control, and leaves Refresh
focusable but unavailable, as the Side panel does
([`StoryReview.tsx`](../../../dashboard/src/StoryReview.tsx)). Today
[`useIntentStoryLens`](../../../dashboard/src/useIntentStoryLens.ts) turns
the comparison to `reading`, so `compareOf` and `defaultReviewOf` drop
Compare and the default. A Done story's locations and CI Done endpoint keep
reading the default throughout: the lens exposes `defaultReview` whatever
the chosen read's state. This slice does not move `isDefault`, remove
`defaultStoryComparison`, or unify `wholeStory`; slice 2 does.
Proof: Vitest Browser Mode cases on the mounted Intent view
([`intent-ci-page-mount.ts`](../../../dashboard/frontend-tests/intent/intent-ci-page-mount.ts),
[`intent-story-compare-stories.ts`](../../../dashboard/frontend-tests/intent/intent-story-compare-stories.ts),
[`intent-story-compare-page.ts`](../../../dashboard/frontend-tests/intent/intent-story-compare-page.ts)),
where the case's own `ReviewSource` returns a pending promise for the range
read and for the Refresh snapshot read, show the Compare group staying,
focus on the pressed control and the header saying it reads; a Done case
whose `ReviewSource` leaves the chosen run read pending keeps the locations
browser and the CI endpoint text. The five `intent-story-compare-*` specs
and `dashboard/frontend-tests/review` stay green. Ordered first: slice 7
makes Intent the only story review.


Slices 2–9 of this plan moved to
[plan 777](../777-open-review-changes-from-a-story-card/PLAN.md) with
SEED-420#open-review-changes-from-a-story-card. This plan's only slice is the
delivered in-flight comparison.

## Execution complete

Product advice: retrospective skipped. The developer closed this story at the delivered in-flight comparison and queued the card opening first as SEED-420#open-review-changes-from-a-story-card. Plan 777 awaits story refinement.

## Learnings

- Slice 1 overran on 2026-11-22 at 17.8 active minutes, with no edit and no
  proof. `storyOverruns` is 1. Failed sizing assumption: one fresh delegation
  could find why Compare disappears and also move `isDefault`, remove
  `defaultStoryComparison`, and give `wholeStory` one derivation, then prove
  that, within 15 active minutes. Reading alone used the budget. The visible
  behavior does not need those moves, so they are slice 2. A second overrun
  reassesses the story boundary before another slice-only refinement.
- Slice 1 mechanism, so the next attempt does not re-read it.
  `useIntentStoryLens` returns `{ state: "reading" }` while a comparison can
  still be shown. Refresh keeps the previous snapshot through `useReviewRead`.
  A range read clears the range comparison while `range.reading`, and a chosen
  run leaves `review` unset until `answeredRunKey` matches. `compare` and
  `defaultReview` are still computed; `compareOf` and `defaultReviewOf` only
  read `compared` and `unreadable`. Side panel Refresh is `aria-disabled`
  while reading and does not advance the round. The mount helper is
  `intent-ci-page-mount.ts`. `intent-story-compare-stories.ts` already has
  `unanswered` as a promise that never settles.
- Second overrun, 2026-11-22, paused at 17.5 active minutes. The return
  reported 15.7. No edit and no proof. `storyOverruns` is 2. Story-boundary
  reassessment: delivered product value is none; the plan split and source
  review are published at `d6822a76`. Remaining scope is slices 1–9. Goal,
  examples, and scope are unchanged. The story stays one story. Both overruns
  were this slice's reading before an edit, not a second outcome and not a
  wrong story cut. No story resplit and no further slice split: the behavior
  is one proof loop, and the plan is already at 9 slices. Sizing reason for
  continuing: the second attempt confirmed the edit and the three cases below
  and did not write them. The next attempt writes that edit and does not
  survey the comparison modules again.
- Confirmed edit, written in this session. `useStoryComparison` remembers
  the last shown comparison and the review that produced it for the story
  key, and keeps both while the selection read or the commit-range read is
  in flight. Range reading counts as reading, and `StoryCompare` carries
  `reading`. The lens prefers `compared` with `reading: true` when a
  comparison is still shown, and a bare `reading` state still carries
  `defaultReview` and `compare`. `compareOf` and `defaultReviewOf` read
  that state. `CompactComparisonState` says "Reading the story's changes…"
  while a compared story is reading. Intent Refresh is `aria-disabled`
  while reading, stays focusable, and does not advance the round.
  `intent-story-compare-reading.spec.ts` covers a pending range, a pending
  Refresh whose second press does not read again, and a pending Done run
  that keeps the locations browser and the CI Done endpoint on the default.
  `isDefault`, `defaultStoryComparison`, and `wholeStory` stay for slice 2.
- Third overrun, 2026-11-22, paused at 17.1 active minutes. The return
  reported 15.3. No edit and no proof. `storyOverruns` is 3. Failed
  assumption: a write-first brief that named the four edits and the three
  tests would be written inside 15 active minutes. The attempt still only
  read. The story boundary from the second overrun stands: one story, nine
  slices, no further split. Another fresh delegation repeats this failure.
  Slice 1 stays planned until this session's proof is published.
- The developer chose to write the edit in this session. Active time paused
  at 12.6 minutes, under the limit. Proof is the mounted Intent cases in
  `intent-story-compare-reading.spec.ts`, the other five
  `intent-story-compare-*` specs, `dashboard/frontend-tests/review` before
  the kept-review adjustment (that adjustment is Intent-only;
  `useStoryComparison` has no Side panel caller), and
  `npm run --silent typecheck:dashboard` after the final production edit.
  Refactor pass: none — already clean. Files stay under 250 lines.
- A newly selected story was still showing the previous story's comparison
  while its own review was in flight, which failed
  `intent-done-source-selection.spec.ts`. The kept comparison now stays only
  for the story that already showed it. That spec passes, the three reading
  cases pass, and `npm run --silent typecheck:dashboard` passes.

## Execution context

- Ai-chan, Story Branch Mode, `cursor/open-review-changes-on-a-story-card-in-intent`.
  Workspace `/Users/terryyin/git/open-dough/.worktrees/open-review-changes-on-a-story-card-in-intent`.
  Take `0337d549f628c7a5524e464e41ee688833657e27` was accepted on `origin/main`.
  Starting revision `3c3b7c2e30395c30cbd862a2fba8c9b7ee558891`.
- Replanning permission: existing planning authority preserved.

## Planning review

Refinement: not needed. The slices follow the page object's parts, each
with one proof loop, and the cohorts were sized from each spec's part usage
at `442c4b6ed` (7–11 specs per Structure slice). Slice 3 was added after reading Intent's
comparison line against the context the journeys assert.

Remaining concern: none identified in this review. Slices 4–6 retain the
Side panel opening from the card until slice 7; that interim root is named
and slice 7 removes it.
