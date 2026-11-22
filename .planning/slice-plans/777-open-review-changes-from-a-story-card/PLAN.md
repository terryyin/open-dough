# Open Review changes on a Story card in Intent

**Story:** [Open Review changes on a Story card in Intent](../../seeds/SEED-420-unified-intent-review.md#open-review-changes-from-a-story-card)
**Identity:** SEED-420#open-review-changes-from-a-story-card
**Source review:** [Source-only review](source-review.md)
**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

Split from SEED-420#route-review-changes-to-intent after its delivered slice.
Former plan 761 slices 2–9 are provisional input here, renumbered 1–8.
Old slice readiness does not make this plan executable. Resume through story
refinement and plan realignment.

| Former slice | This plan | Outcome |
| --- | --- | --- |
| 2 | 1 | `isDefault` sits beside the defaults it compares, and `wholeStory` has one derivation |
| 3 | 2 | Intent names what the story's comparison runs between, as Review changes does |
| 4 | 3 | Commit and trunk review journeys run in Intent |
| 5 | 4 | Uncommitted, refresh and explanation journeys run in Intent |
| 6 | 5 | Landed, completed and follow-up journeys run in Intent |
| 7 | 6 | Review changes on a Story card opens the story's Changes in Intent |
| 8 | 7 | Side panel review cases use a session subject |
| 9 | 8 | Session entries keep the Side panel review, which serves only sessions |

## Slices

### 1. isDefault sits beside the defaults it compares, and wholeStory has one derivation

Type: Structure (preserves slice 1; correction of
SEED-420#choose-story-comparison-in-intent)
Status: planned
Change: `isDefault` moves into
[`useStoryReviewSelection`](../../../dashboard/src/useStoryReviewSelection.ts)
beside the defaults it compares, `defaultStoryComparison` goes, and
`wholeStory` has one derivation. Today
[`useIntentStoryLens`](../../../dashboard/src/useIntentStoryLens.ts) and
[`IntentPage`](../../../dashboard/src/IntentPage.tsx) each derive it.
[`IntentFileReading.tsx`](../../../dashboard/src/IntentFileReading.tsx) is
already 249 lines; do not add a prop there. External behavior stays as
slice 1 left it.
Proof: the five `intent-story-compare-*` specs stay green;
`npm run typecheck:dashboard`.

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

Type: Structure (enables slice 7)
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

Type: Structure (enables slice 7)
Status: planned
Change: Intent placements for `context`, `files` and the remaining `status`
reads. Journeys: `story-review-uncommitted-check`,
`-uncommitted-check-refresh`, `-refresh`, `-nothing`, `-context-line`,
`-trunk-worktree-ambiguity` and `story-review.spec.ts`. Frame-only
assertions follow the journey-placement decision.
Proof: those 7 specs green in Intent.

### 5. Landed, completed and follow-up journeys run in Intent

Type: Structure (enables slice 7)
Status: planned
Change: Intent placements for `landedRun`, `diffs` and `code`. Journeys:
`story-review-landed`, `-story-branch-landed`, `-completed`, `-follow-up`,
`-one-shot`, `-panes`, and `e2e/intent/intent-story-completed.spec.ts`.
`story-review-panes` keeps only what Intent's Changes shows; its Side panel
pane mechanics move with slice 9 if no other session journey proves them.
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
edit; slices 4–6's journeys green through the card root;
`npm run typecheck:dashboard`.

### 7. Side panel review cases use a session subject

Type: Structure (enables slice 9)
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
Run the whole `e2e/review` directory at slices 7 and 9, since every story
review journey reaches the changed opening.
