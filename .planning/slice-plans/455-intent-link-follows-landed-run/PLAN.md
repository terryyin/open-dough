# Return a landed-run review to Intent's comparison

**Identity:** SEED-192#intent-link-follows-landed-run
**Source:** [correction story](../../seeds/SEED-192-review-product-intent.md#intent-link-follows-landed-run),
correcting story 5a (`SEED-192#align-intent-story-lens`), recoverable as
`git show 6a3a18c5:.planning/seeds/SEED-192-review-product-intent.md`
(section `#align-intent-story-lens`) with its plan at
`6a3a18c5:.planning/slice-plans/448-align-intent-story-lens/PLAN.md`.

## Provenance

The execution retrospective of SEED-192#align-intent-story-lens (claim
`b4035111`; commits `dc0b44e3`, `2a11506c`, `2e3100bc`) found this at
`2e3100bc`. Story 5a's contract: "Intent's link to Review changes shows the
same comparison Intent shows, even for a story with a review mark"; story 5:
"Changed files show the same comparison Review changes shows for that story,
so the two views never disagree".

## Finding

`dashboard/src/useStoryReviewRequest.ts` returns a shown review to the
requested comparison only when `selection.selectedRun === undefined`. A
developer can choose **Landed run** in Review's comparison switch
(`StoryReview.tsx`, `onRun(newest.key)`) for a Taken story with a live
workspace. Intent then still shows the workspace's all changes
(`useStoryComparison.ts`, active only while its own selection has no run),
while following Intent's **Review changes** link again leaves Review on the
run. The guard is right only when the workspace answer itself carries
`selectedRun` (the server's landed fallback), which Intent shows as well.
`dashboard/STORY-REVIEW-MARKS.md` states the link's behavior without that
exception. `dashboard/tests/intent-story-changes-marked.spec.ts` has no
landed run.

Still present at trunk `a29f6252` (2026-11-03): `useStoryReviewRequest.ts`
is unchanged since `2a11506c`.

## Goal and scope

Intent's link returns a review showing a developer-chosen landed run to
Intent's comparison; a review on the workspace answer's own landed fallback
stays on it. Preserved: every story 5 and 5a promise and accepted proof,
Review changes' own default when opened from a card, Review's own comparison
switch, and the published-completion comparison. Excluded: any new comparison
choice inside Intent.

## Existing solutions and decisions

- `useStoryReviewSelection` distinguishes the answer's own `selectedRun` from
  a chosen run internally (`answer.selectedRun !== selection.run` drives its
  historical read) but does not return that distinction. `onWorkspace` clears
  a chosen run; clearing the answer's own run would leave a landed review
  without its run choice, since the selection follows the answer only when
  the answer changes. The request hook therefore needs to know whether the
  shown run is the answer's own before it yields to Intent's request.
- The server answers the landed fallback when the story's workspace is not
  readable and a captured landing exists (`server/storyReviewRequest.ts`),
  for a Taken story whose worktree is gone and for a completed one; Intent
  shows a landed review as a fixed comparison (`src/storyComparisonShown.ts`).
- Starting states, settled in this checkout on 2026-11-03:
  - A live-workspace snapshot whose `runs` list landed runs, with the
    Comparison switch offering **Landed runs**, is observed by
    `story-review-one-shot-choice.spec.ts` and
    `story-review-story-branch-landed.spec.ts`. `capturedChoice`
    (`support/oneShotReviewChoices.ts`) lands a one-shot run for Story A
    through the real installed delivery with the Codex native fixture, which
    `support/preparationPage.ts` supplies under
    `test.use({ preparationHost: "codex" })`; `selectTakenStoryInIntent`
    (`support/intentStoryPage.ts`) then takes Story A with a live workspace
    and shows Intent, and `support/storyReviewMark.ts` marks it.
  - The landed fallback with capture is observed after retirement on the
    Recently done card in `story-review-story-branch-landed.spec.ts`
    (`kind: "landed"` with `selectedRun`); Intent selects a done card as
    `intent-story-completed.spec.ts` does.

## Outside-in proof

| Example | Signal |
| --- | --- |
| Taken story with a live workspace and a landed run; Review switched to Landed run; Intent's **Review changes** followed | Review shows All changes with uncommitted changes included, and a changed file's diff equals Intent's |
| A review whose workspace answer falls back to a landed run (workspace retired, landing captured) | following Intent's link keeps that run, which Intent shows too |

Command:
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`

Local gates: the slice changes shared Review changes code, so run the full
`npm test` (Homebrew Bash 5 first on PATH) and the whole dashboard suite on the
final state before publishing. Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests) as
written.

## Ordered slices

### 1. Intent's link leaves a chosen landed run
Type: Behavior
Status: planned
Proof: extend an Intent journey with a landed run from the fixtures above:
switch Review to Landed run, follow Intent's link, and observe All changes
with Intent's diff; a landed-fallback review stays on its run; the `intent-`,
`story-review` and `boundary/story-review` suites stay green. Update the
sentence in `dashboard/STORY-REVIEW-MARKS.md`.

Behavior: a review showing a developer-chosen landed run → the developer
follows Intent's **Review changes** → Review shows Intent's comparison.

## Current decisions

- Only a developer-chosen run yields to Intent's request; the answer's own
  landed fallback is what Intent shows and stays.

## Concern evidence

Refinement not needed: one slice with one proof loop, a directly owned
correction of one finding. Decisive premises (the finding's presence and the
fixtures for both examples) were settled on 2026-11-03 in this checkout, as
recorded above; no slice-specific concern remains.
