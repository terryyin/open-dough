# Keep the story lens consistent with Review changes

**Identity:** SEED-192#align-intent-story-lens
**Source:** [correction story](../../seeds/SEED-192-review-product-intent.md#align-intent-story-lens),
correcting story 5, recoverable as `git show 66cfcb6d:.planning/seeds/SEED-192-review-product-intent.md`
(section `#review-story-intent-impact`) with its plan at
`66cfcb6d:.planning/slice-plans/441-review-story-intent-impact/PLAN.md`.
**Source review:** [source review](source-review.md)

## Provenance

The execution retrospective of SEED-192#review-story-intent-impact (plan 441;
claim `9470bb4b`, branch commits `5b8aeba9`, `f0888fb9`, `d73c75dd`,
`28a663e3`, `2d4903a4`, `5a1ecb5f`, `7c71049b`, and slice 1's code in
`c64319b6`) found these at `7c71049b`. The original contract is story 5's
section.

## Findings

1. **Disclosure content selects the card.** `storyCardNonEmptyAreaSelector`
   (`dashboard/src/pageStorySelection.tsx`) excludes `summary` but not an opened
   `details` body, so a click on the explanation text inside a card's opened
   Dependencies disclosure (`StoryCardDependencies.tsx`) toggles selection and
   detail. Story 5: "Clicks on the card's buttons, links, inputs, session
   entries, and disclosures keep their own behavior and do not change the
   selection." `story-card-selection.spec.ts` clicks only the summary and link.
2. **Intent's Review changes link can show another comparison.** Intent shows
   all changes including uncommitted ones (story 5's comparison clause). Its
   outside-count **Review changes** button (`IntentStoryLens.tsx`) opens Review
   changes through `StoryReviewRequest` (`pageStoryReviews.ts`), which carries no
   comparison, and Review changes opens on "since" when the story has a review
   mark (`useStoryReviewSelection.ts`). For a marked story the linked view
   omits files Intent counted and shows different diffs, against story 5's
   restriction "Changed files show the same comparison Review changes shows for
   that story, so the two views never disagree". No fixture had a mark.
3. **Docs lag the code.** `dashboard/README.md` does not describe empty-area
   selection, the selected mark distinct from "shown in Side panel", Recently
   done's **Select story**, or selection scoping Intent.
   `docs/dashboard-development-intent.md` does not state that folders start
   collapsed, or that a file opened from the candidates record opens its
   folders.
4. **Residue.**
   - The comment in `dashboard/src/intentLocationSelection.ts` claims parity
     with Node's `matchesGlob` on POSIX; the rule is case-sensitive on every
     platform, while Node on macOS is case-insensitive.
   - The diff-start rule (`includesTrunkFrom`, else the comparison's `from`) is
     written in both `IntentFileReading.tsx` and `StoryReviewSnapshotView.tsx`.
   - `intentSourceKinds` and `IntentSourceKind` are exported from
     `dashboard/src/intentLocationSelection.ts` with no outside consumer.
   - `intentStoryOverlay.ts` repeats a `startsWith(prefix)` check its caller
     already guarantees.
   - `dashboard/tests/story-card-selection.spec.ts` is 253 lines, over the
     250-line limit.
   - The kind-style probe exists twice: `story-review-tree.spec.ts` and
     `support/intentStoryPage.ts` (`kindStyles`). The overlay's placement rules
     are proved only through browser journeys, and "same diff in both toggle
     states" is asserted in both `intent-story-changes-moves.spec.ts` and
     `intent-story-completed.spec.ts`.

## Goal and scope

Restore story 5's selection and comparison promises and remove the residue
above. Preserved: every story 5 promise and its accepted proof, Intent's "all
changes, including uncommitted" comparison, Review changes' own default when
opened from a card, and Review's published-completion comparison for completed
stories. Excluded: any new comparison choice inside Intent (story 5 scope
limit), and trimming the North Star section, which story 5's wrap-up owns.

## Existing solutions and decisions

- Review changes already offers **All changes**; `useStoryReviewSelection`
  holds its initial `workspace` choice. Opening from Intent supplies that
  initial choice on the request; Review's own control still changes it.
- `dashboard/tests/support/storyReviewMark.ts` (`markReviewed`,
  `keptStoryAMark`) gives a marked story; `support/intentStoryPage.ts` and
  `support/intentStoryWorktree.ts` give the Intent workspace fixture.
- Pure-function boundary specs run under Playwright without a browser, as
  `dashboard/tests/boundary/story-review-folders.spec.ts` does.

## Outside-in proof

| Example | Signal |
| --- | --- |
| Clicking text inside an opened Dependencies disclosure | the card stays unselected, and a selected card stays selected (dependency journey, in its own spec) |
| A marked Taken story in Intent, then its **Review changes** link | Review opens on All changes; its file list includes the files Intent counted, and a changed file's diff equals Intent's; Review opened from the card still opens on "since" |
| Overlay placement rules | boundary spec on `intentStoryOverlay`, `storyChangesOnly`, `storyOverlayExpansion` covers rename into, out of, between and neither, deletion absent from the published tree, a change counted once outside, and first-changed-location expansion |

Command:
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`

Local gates: slices 2 and 3 change shared Review changes code, so run the full
`npm test` (Homebrew Bash 5 first on PATH) and the whole dashboard suite on the
final state before publishing. Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests) as
written.

## Ordered slices

### 1. Disclosure content leaves the selection alone
Type: Behavior
Status: done
Proof: move the dependency test out of `story-card-selection.spec.ts` into its
own spec (bringing both files under 250 lines) and add clicks on the opened
explanation text for an unselected and a selected card.

Behavior: a card with an opened Dependencies disclosure → the developer clicks
its explanation text → the selection and detail are unchanged.

Accepted proof: `storyCardControlSelector` lists `details` in place of
`summary`; `story-card-dependency-selection.spec.ts` failed at the explanation
click before the fix and passes after; 44 related selection, board and Intent
specs and typecheck pass. `story-card-selection.spec.ts` is 212 lines.

### 2. Intent's Review changes link shows Intent's comparison
Type: Behavior
Status: done
Proof: an Intent journey on a marked Taken story: Intent shows its changes;
the outside-count **Review changes** button opens Review on All changes with
the counted files listed and a changed file's diff equal to Intent's; Review
opened from the card opens on "since".

Behavior: a Taken story with a review mark, selected in Intent → the developer
follows **Review changes** → Review changes shows all changes including
uncommitted ones, the comparison Intent shows.

Accepted proof: `StoryReviewRequest` carries an optional `comparison`;
Intent's outside-count button passes `defaultStoryComparison`, and
`useStoryReviewRequest` opens on it or returns a shown review to it unless a
captured run is shown. `intent-story-changes-marked.spec.ts` failed before the
fix (opened on Since the review) and passes after; 203 `intent-`,
`story-review` and `boundary/story-review` specs and typecheck pass.

### 3. Remove the lens residue and describe it
Type: Structure
Status: done
Proof: existing Intent and Review changes journeys unchanged
(`intent-`, `story-review`, `boundary/story-review`, `story-card-selection`);
the new boundary overlay spec; typecheck.

Directly owned retrospective correction: move the diff-start rule beside
`storyComparisonShown` for both callers; drop the dead exports and the repeated
guard; reword the matcher comment; make `story-review-tree.spec.ts` use
`kindStyles`; add the boundary overlay spec and keep the both-toggle-states
diff check in one integrated journey only; add the README and Intent doc
sentences for findings 3.

Accepted proof: `diffStartOf` beside `storyComparisonShown` serves both client
callers; the server admission's own copy of the rule stays outside this
correction. `boundary/intent-story-overlay.spec.ts` covers the overlay rules;
the change-kind probe lives in `support/changeKindStyle.ts`. 209 surface specs
and typecheck pass. Final state: `npm test` passes, and the whole dashboard
suite passes 1944 with no failures or flakes (29.8 min, load 7–9).

## Current decisions

- Intent keeps "all changes, including uncommitted"; only its link to Review
  changes carries that choice. Review opened from a card keeps its default.

## Concern evidence

Refinement not needed: three slices, each with its own proof; slice 3 is one
directly owned correction of findings 3 and 4. No remaining slice-specific
concern.

## Execution complete

Product advice: no change to priorities. The retrospective found that
Intent's **Review changes** link leaves a review on a landed run the developer
chose, so the views can still disagree; the follow-up correction
[SEED-192#intent-link-follows-landed-run](../../seeds/SEED-192-review-product-intent.md#intent-link-follows-landed-run)
([plan 455](../455-intent-link-follows-landed-run/PLAN.md)) owns it.
SEED-224#unify-story-selection, now Taken on trunk, changes card selection
(selection by **Select story**, **Inspect story** only opening detail), so its
execution must revise the selection paragraph this correction added to
`dashboard/README.md` and the disclosure rule in `pageStorySelection.tsx`.
