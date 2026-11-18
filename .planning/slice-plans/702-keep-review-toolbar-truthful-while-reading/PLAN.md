# Keep the Review changes toolbar truthful while it reads

**Source:** [Keep the Review changes toolbar truthful while it reads](../../seeds/SEED-384-keep-review-changes-focused-on-the-diff.md#keep-review-toolbar-truthful-while-reading)
**Identity:** SEED-384#keep-review-toolbar-truthful-while-reading

## Provenance and findings

Retrospective correction of
Keep Review changes focused on the diff
(SEED-384#keep-review-changes-focused-on-the-diff; story and plan 695 at
`a53f0d5dff97`), reviewed commits
`1b33fda6a`, `5911f9ae7`, `902b0139d`, `8d1132cb5`. That story's promises stand:
one toolbar naming the comparison shown, details collapsed on every opening
behind the eye, and full-size touch toggles with room to read the diff.

Findings at `8d1132cb5`, each a regression of those commits:

1. **Toolbar before the answer.** `dashboard/src/StoryReview.tsx` derives the
   toolbar name from `shownComparison`, which falls back to the workspace
   choice (`"all"`) while `review` is undefined. A completed story, published
   completion or ad hoc landing therefore reads “All changes” until its first
   answer, and keeps it when the read fails. In those states `ComparisonSwitch`,
   `RunChoice` and `ReviewContext` render nothing, yet the eye is offered and
   reveals an empty “Review details” group.
2. **Touch height.** `dashboard/src/story-review-touch.css` gives
   `.story-review-top` and `.story-review-details` each their own 30% height
   cap. Before the story the status area alone had that cap, kept so a short
   landscape view leaves room for the diff; with details revealed and a status
   shown the two now take up to 60%.
3. **Test layer.** `e2e/review/story-review-details-runs.spec.ts` (84 lines)
   pays for three real launches to check toolbar text, revealed state across a
   run choice and Refresh, and Escape from the picker, all frontend
   behaviour; it opens through the details step, so no test opens a two-run
   landed review as the reader first meets it. Choosing a run and reading its
   facts end to end stays covered by `e2e/review/story-review-one-shot-choice*.spec.ts`.

Outcome: the toolbar and eye stay truthful before and without an answer, the
touch layout keeps one height budget for what sits above the work area, and
the landed-run key examples are proved at the frontend layer.

Excluded: the run picker shown for a story's single landed run (excluded as
G3 in the reviewed plan; today's behaviour); tapping the eye on touch; naming
the selected run.

## Outside-in proof ownership

| Promise | Slice | Observable proof |
| --- | --- | --- |
| While the first answer is pending, and after a failed read, the toolbar names no comparison and offers no eye; once a landed or published answer arrives it names “Landed runs” or “Published completion” | 1 | Frontend review spec holding the snapshot response: toolbar name empty and no **Show review details** button while reading; after release, the expected name and the eye. Failed read (500): no name, no eye, the problem text shown. |
| A workspace review still names “All changes” as soon as it reads, and details hold content whenever the eye is offered | 1 | Existing `dashboard/frontend-tests/review/story-review-details.spec.ts` stays green; the new spec asserts the eye is absent exactly when the details would be empty. |
| On touch, revealed details and status together stay within the one 30% budget | 2 | Touch journey (`e2e/review/story-review-touch.spec.ts` / `dashboard/tests/support/storyReviewTouchContext.ts`) or a frontend touch spec at a short landscape size: with details revealed and a status shown, the combined height above the work area is at most 30% of the panel (or the control-size floor), and the diff keeps its viewport. |
| A two-run landed review opens collapsed; revealing shows the picker and run facts; choosing the older run keeps details revealed across Refresh; Escape on the picker hides them and focuses the eye | 3 | New frontend spec with two runs from `frontendStoryReviewFixtures.ts`, opened through `openFrontendStoryReviewAsOpened`. `e2e/review/story-review-details-runs.spec.ts` is removed, or reduced to what needs real launches, only after that spec is green. |

## Ordered slices

### 1. Toolbar and eye wait for the review's answer
Type: Behavior
Status: planned
Proof: first two rows; focused frontend review specs, the whole
`dashboard/frontend-tests/review` folder, typecheck.

Behavior: a completed story, published completion or ad hoc session with a
held first read → open **Review changes** → the toolbar shows no comparison
name and no eye → the answer arrives → the toolbar names the comparison shown
and offers the eye. A failed read → no name and no eye, the problem shown.

### 2. Touch details share the status height budget
Type: Behavior
Status: planned
Proof: third row; the touch journey and narrow-layout checks, typecheck.

Behavior: touch input, short landscape panel, details revealed and a status
shown → the details and status together take at most the existing budget and
scroll inside it; the diff keeps its viewport.

### 3. Landed-run review details proved at the frontend layer
Type: Structure
Status: planned
Proof: fourth row; the new frontend spec, then `e2e/review` whole after the
e2e spec's removal or reduction.

Structure: move the toolbar/details/Escape observations of
`e2e/review/story-review-details-runs.spec.ts` into a frontend spec opened
collapsed on two runs, then remove or reduce the e2e spec. Directly owned
retrospective correction of the test-boundary finding.

## Verification and delivery

- Follow [the failing/flaky-test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written; a base failure is attribution, never an exemption.
- Before test edits, apply [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md)
  and [dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  selection. No sleeps, `test.slow()`, or timeout overrides.
- Local gate per slice: focused specs through `npm run --silent
  test:dashboard:frontend -- <paths>` or `npm run --silent test:e2e --
  <paths>` (`bash scripts/test.sh` refuses Playwright specs), typecheck,
  post-change refactoring, staged lint. Slice 1 changes product code read by
  every review, so it also runs the dashboard frontend suite whole; no other
  full local suite. Hosted CI runs the shards.
- Run under maintained `caffeinate -s -i` on AC, per
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos);
  on battery, `caffeinate -i` awake with the lid open and read the sleep log.
- Keep `StoryReview.tsx` (238 lines), `story-review.css` (246) and
  `dashboard/frontend-tests/review/story-review-details.spec.ts` (249) within
  250 lines: new logic and assertions go in sibling modules, support or new
  specs.

## Current decisions

- While the review has no answer the toolbar shows no comparison name rather
  than guessing one from the request; the eye is offered only when the
  details render content.
