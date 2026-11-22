# Open Review changes on a Story card in Intent

**Identity:** SEED-420#route-review-changes-to-intent
**Source:** [Open Review changes on a Story card in Intent](../../seeds/SEED-420-unified-intent-review.md#route-review-changes-to-intent)

## Goal and scope

**Review changes** on a Story card opens Intent on that story's **Changes**,
so a story has one review destination and the Side panel keeps its terminal.
The seed holds the scope, exclusions and key examples. Two decisions made
during refinement (2026-11-22): pressing it again keeps a file already
selected for the story, and a Done story's review is its published
completion, so a retained workspace's later edits are no longer reviewed
from the card.

Excluded, as the seed records: session selection, the bookmark's scope
choices, file filters, and a reloadable link to a review. Session entries
keep the Side panel review.

## Key examples and outside-in proof

| Promise | Owner | Observable signal |
| --- | --- | --- |
| Intent keeps its comparison and Compare while a chosen read is in flight | Slice 1 | Vitest Browser Mode on the mounted Intent view with pending reads |
| The story review journeys hold in Intent with unchanged scenarios | Slices 3–5 | Each moved `e2e/review` spec green through `reviewChangesPage.ts` opened in Intent |
| Terminal stays; Intent shows Changes with the first changed file's diff; keyboard on the Changes tab; Back shows the Board with the story selected | Slice 6 | New `e2e/review` journey from a Taken card, plus `frontend-tests/review/story-review-action.spec.ts` |
| Pressing again keeps a selected file, also after a Project Intent visit or another tab | Slice 6 | Same journey, second press |
| Entering Intent from the banner opens CI comparison; Changes lists the same files | Slice 6 | Existing Intent story specs stay green; journey asserts the same list |
| A Done card with a retained, later-edited workspace shows the published completion | Slice 6 | `e2e/intent/intent-done-retained-workspace.spec.ts`, its Side panel half replaced by the card press |
| Intent names the branch, the baseline and what it leaves out, the worktree, a landed run's facts, and the kept-in-baseline notice | Slice 2 | Vitest Browser Mode on the mounted Intent view; `story-review-context-line`, `-trunk-own-changes`, `-landed` once moved |
| Several worktrees holding the claim are explained in Intent | Slice 4 | `story-review-trunk-worktree-ambiguity.spec.ts` in Intent |
| No workspace on this machine: no Review changes | Slice 6 | Existing card offer cases stay green |
| Ad hoc and published session entries open the Side panel review | Slice 8 | `recently-done-published-sessions.spec.ts`, `frontend-tests/sessions/recently-done-ad-hoc-review.spec.ts` |

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
  slice 8; a journey whose only Side panel assertion is the frame drops it.
- **Interim root.** Slices 3–5 open the review in Intent through a root that
  selects the card and chooses Intent and **Changes** from the banner.
  Slice 6 replaces it with the card press and removes it.
- **No retired-only retention.** The Side panel half of
  `intent-done-retained-workspace.spec.ts` goes in slice 6, as decided.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts):
  opening a review in Intent sets the Selected story; the Selected story and
  Intent's view stay disposable page state. No ADR change. Slice 6 updates
  the Side panel review sentence in
  [Board interaction](../../../docs/dashboard-board-interaction.md) and drops
  the "Under the unified review design" qualifier there; the North Star's
  [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  keeps its topic until the later SEED-420 stories implement the rest.

## Decisive premises

| Consuming operation | Observation (form, profile, when) | Result | Remainder |
| --- | --- | --- | --- |
| Slices 3–6 reach a story's Changes in Intent from the Board and run review journeys | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR caffeinate -s -i npm run --silent test:e2e -- --workers=2 e2e/intent/intent-done-retained-workspace.spec.ts e2e/review/story-review-commits.spec.ts` at `442c4b6ed`, 2026-11-22 | Exit 0 in 56 s: selecting a Done story and choosing Intent then **Changes** reads its files and diffs; the commit cohort's root journey is green before the move | None |
| Slices 3–5 find every comparison control the journeys use in Intent | Accepted proof of SEED-420#choose-story-comparison-in-intent at `c64549aac` (`intent-story-compare-commits.spec.ts`, `-uncommitted`, `-done`) and SEED-420#open-review-in-intent at `f7964681` (`intent-story-outside-locations.spec.ts`, `intent-story-changes-no-locations.spec.ts`) | Commits, uncommitted changes, landed runs, published completion, outside files and diffs operate in Intent | None for controls; the context wording is the next row |
| Slices 3–5 assert the context line and kept-in-baseline feedback unchanged | Read at `442c4b6ed`: [`IntentStoryComparison.tsx`](../../../dashboard/src/IntentStoryComparison.tsx) `ComparedRevisions` says only "Compared <rev> with worktree <path> at <rev>"; no Intent module renders [`StoryReviewContext.tsx`](../../../dashboard/src/StoryReviewContext.tsx) or the kept-in note of [`StoryReviewFeedback.tsx`](../../../dashboard/src/StoryReviewFeedback.tsx); `story-review-context-line`, `-trunk-own-changes`, `-trunk-own-older-git` and `-landed` assert the branch, "less the story's 2 published commits" and the kept-in feedback | False as Intent stands: slice 2 adds that context before the journeys move | None |
| Slice 6's Done example | Same run: `intent-done-retained-workspace.spec.ts` | The Side panel reads the retained workspace's later edit; Intent reads the immutable completion | None |
| Slice 8 keeps session reviews | `grep` of story subjects in `dashboard/frontend-tests/review/*.spec.ts` at `442c4b6ed` | 11 specs mount the panel with `doneStory`; `adHocSession` exists in `story-review-page-contexts.ts` | Which of them prove story-only behavior Intent already covers is decided per spec in slice 7 |

## Slices

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
and `dashboard/frontend-tests/review` stay green. Ordered first: slice 6
makes Intent the only story review.

### 2. Intent names what the story's comparison runs between, as Review changes does

Type: Behavior
Status: planned
Behavior: a Trunk Mode story with 2 published commits whose worktree is
compared → Intent's comparison shows the Side panel's context: branch,
baseline "origin/main less 2 story commits" in short and in full, worktree,
and the note that this machine's Git kept the published commits in its
baseline; a landed run shows its landed facts; a published completion its
completion facts. Reuse
[`StoryReviewContext.tsx`](../../../dashboard/src/StoryReviewContext.tsx)
and the kept-in sentence rather than copying them; `ComparedRevisions`
gives way where the shared context says the same.
Proof: Vitest Browser Mode cases on the mounted Intent view
(`intent-story-compare-page.ts`) for a worktree snapshot with published
commits kept in the baseline, a landed run and a published completion;
the `intent-story-compare-*` specs stay green.

### 3. Commit and trunk review journeys run in Intent

Type: Structure (enables slice 6)
Status: planned
Change: `reviewChangesPage.ts` gains the interim Intent root and Intent
placements for `comparison`, `commits` and `status`. These journeys open
through it with unchanged scenarios: `story-review-commits`,
`-commit-ranges`, `-commit-races`, `-commit-refresh`, `-commit-renames`,
`-commit-trunk`, `-commit-worktree`, `-trunk-own-changes`,
`-trunk-own-flagged`, `-trunk-own-older-git` and `-trunk-worktree`.
Proof: those 11 specs green in Intent; the Side panel story review still
opens from the card (no product change).

### 4. Uncommitted, refresh and explanation journeys run in Intent

Type: Structure (enables slice 6)
Status: planned
Change: Intent placements for `context`, `files` and the remaining `status`
reads. Journeys: `story-review-uncommitted-check`,
`-uncommitted-check-refresh`, `-refresh`, `-nothing`, `-context-line`,
`-trunk-worktree-ambiguity` and `story-review.spec.ts`. Frame-only
assertions follow the journey-placement decision.
Proof: those 7 specs green in Intent.

### 5. Landed, completed and follow-up journeys run in Intent

Type: Structure (enables slice 6)
Status: planned
Change: Intent placements for `landedRun`, `diffs` and `code`. Journeys:
`story-review-landed`, `-story-branch-landed`, `-completed`, `-follow-up`,
`-one-shot`, `-panes`, and `e2e/intent/intent-story-completed.spec.ts`.
`story-review-panes` keeps only what Intent's Changes shows; its Side panel
pane mechanics move with slice 8 if no other session journey proves them.
Proof: those 7 specs green in Intent.

### 6. Review changes on a Story card opens the story's Changes in Intent

Type: Behavior
Status: planned
Behavior: the Side panel shows a Taken story's terminal → **Review
changes** on its card → Intent shows that story's **Changes** with the
first changed file's diff, the keyboard on the **Changes** tab, the
terminal still in the Side panel; browser Back shows the Board with the
story selected. Pressing again after choosing another file, visiting
Project Intent or **Intent coverage** shows **Changes** with that file. The
same applies to Done cards on the Board and in Recently done. The interim
root goes: `openReviewChanges(page, card)` presses the card and lands in
Intent. Board interaction text updated.
Proof: a new `e2e/review` journey for the terminal and second-press
examples; `frontend-tests/review/story-review-action.spec.ts` for the
card's offer and keyboard order; `intent-done-retained-workspace.spec.ts`
pressing the Done card and asserting the completion without the later
edit; slices 3–5's journeys green through the card root;
`npm run typecheck:dashboard`.

### 7. Side panel review cases use a session subject

Type: Structure (enables slice 8)
Status: planned
Change: each `dashboard/frontend-tests/review` spec that mounts the panel
with `doneStory` either moves to `adHocSession` when it proves shared Side
panel mechanics (files divider, toolbar, touch height, details) or retires
when it proves story-only behavior Intent's specs already prove (notes in
Intent's header, uncommitted check, story runs), naming the covering Intent
spec in the commit message.
Proof: the moved specs green with a session subject; each retirement names
its covering Intent spec.

### 8. Session entries keep the Side panel review, which serves only sessions

Type: Behavior
Status: planned
Behavior: **Review changes** on an ad hoc Done entry and a published
session entry opens the Side panel review, as today. The review's
story-only paths go: `RequestedComparison`, `StoryReviewRequest.comparison`
and `historical`, the reconcile in `useStoryReviewRequest`, the selection's
request-only options, and the story-subject branch of the request.
Proof: `e2e/sessions/recently-done-published-sessions.spec.ts`,
`frontend-tests/sessions/recently-done-ad-hoc-review.spec.ts`,
`frontend-tests/review` and the Intent story specs green;
consumer trace for the removed symbols; `npm run typecheck:dashboard`.

## Local gate

On macOS run from an awake machine on AC using `caffeinate -s -i` under the
maintained [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, the default test timeouts, explicit path selections, and the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run `npm run typecheck:dashboard` for changed production code and types.
Run the whole `e2e/review` directory at slices 6 and 8, since every story
review journey reaches the changed opening.

## Planning review

Refinement: not needed. The slices follow the page object's parts, each
with one proof loop, and the cohorts were sized from each spec's part usage
at `442c4b6ed` (7–11 specs per Structure slice). Slice 2 was added after reading Intent's
comparison line against the context the journeys assert.

Remaining concern: none identified in this review. Slices 3–5 retain the
Side panel opening from the card until slice 6; that interim root is named
and slice 6 removes it.
