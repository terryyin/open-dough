# Return a landed-run review to Intent's comparison

**Identity:** SEED-192#intent-link-follows-landed-run
**Source:** [correction story](../../seeds/SEED-192-review-product-intent.md#intent-link-follows-landed-run),
correcting story 5a (`SEED-192#align-intent-story-lens`), whose plan was
`.planning/slice-plans/448-align-intent-story-lens/PLAN.md`.

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

## Goal and scope

Intent's link returns a review showing a developer-chosen landed run to
Intent's comparison; a review on the workspace answer's own landed fallback
stays on it. Preserved: every story 5 and 5a promise and accepted proof,
Review changes' own default when opened from a card, Review's own comparison
switch, and the published-completion comparison. Excluded: any new comparison
choice inside Intent.

## Existing solutions and decisions

- `useStoryReviewSelection` already distinguishes the answer's own
  `selectedRun` from a chosen run; `onWorkspace` clears a chosen run.
- The marked journey's fixture (`support/intentStoryPage.ts`
  `selectTakenStoryInIntent`, `support/storyReviewMark.ts`) and the landed-run
  fixtures used by `story-review` journeys supply the starting state.

## Outside-in proof

| Example | Signal |
| --- | --- |
| Taken story with a live workspace and a landed run; Review switched to Landed run; Intent's **Review changes** followed | Review shows All changes with uncommitted changes included, and a changed file's diff equals Intent's |
| A review whose workspace answer falls back to a landed run | following Intent's link keeps that run, which Intent shows too |

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
Proof: extend an Intent journey with a landed run: switch Review to Landed
run, follow Intent's link, and observe All changes with Intent's diff; a
landed-fallback review stays on its run; the `intent-`, `story-review` and
`boundary/story-review` suites stay green. Update the sentence in
`dashboard/STORY-REVIEW-MARKS.md`.

Behavior: a review showing a developer-chosen landed run → the developer
follows Intent's **Review changes** → Review shows Intent's comparison.

## Current decisions

- Only a developer-chosen run yields to Intent's request; the answer's own
  landed fallback is what Intent shows and stays.

## Concern evidence

Refinement not needed: one slice with one proof loop, a directly owned
correction of one finding.
