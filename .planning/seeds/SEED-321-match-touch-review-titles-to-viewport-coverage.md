---
id: SEED-321
status: active
planted: 2026-11-12
planted_during: SEED-312#speed-up-touch-review-checks wrap-up, whose review left tablet titles and stroke/helper wording overstating what each viewport runs
trigger_when: SEED-300#express-review-test-intent-through-page-objects has landed, or a tablet touch-review failure's title overstates what broke
scope: story
---

# SEED-321 — Match touch review titles to what each viewport runs

## Why this matters

[Speed up touch review checks](https://github.com/terryyin/open-dough/blob/03dff46c07c05315a026cafac77fccdbf30234bc/.planning/seeds/SEED-312-touch-review-checks.md#speed-up-touch-review-checks) cut the touch review journey so the
phone alone chooses the comparison, file browser controls, and panel controls
that no arrangement changes, while the tablet repeats only what its layout
changes. The four cases in
[story-review-touch.spec.ts](../../e2e/review/story-review-touch.spec.ts)
still share the titles "chooses a comparison and file and reads within each
pane" and "keeps the chosen file and reading places through rotation and panel
controls", helpers that decide the owning viewport from page width, and
`largeReviewRevision` / `largeWorktree` names that still imply an 18-file
comparison. Comments in
[storyReviewTouchJourney.ts](../../dashboard/test-support/support/storyReviewTouchJourney.ts)
already say what each viewport runs. Until titles and scenario steps match
that split, a tablet failure's title overstates what broke.

[Express review and Side panel test intent through page objects](https://github.com/terryyin/open-dough/blob/26bcdab755a81875c698cb51eb941037646bcb7f/.planning/seeds/SEED-300-dashboard-test-page-objects.md#express-review-test-intent-through-page-objects) will own the review
helpers and call sites that express this intent. Settling the titles and
comments before that ownership lands would race the page-object rewrite or be
rewritten again. This story waits for that supplier, then aligns the wording
with the viewport split [Speed up touch review checks](https://github.com/terryyin/open-dough/blob/03dff46c07c05315a026cafac77fccdbf30234bc/.planning/seeds/SEED-312-touch-review-checks.md#speed-up-touch-review-checks) already runs.

<a id="match-touch-review-titles-to-viewport-coverage"></a>

### Match touch review titles to what each viewport runs

**Identity:** SEED-321#match-touch-review-titles-to-viewport-coverage
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-321#match-touch-review-titles-to-viewport-coverage","dependencies":[{"supplier":{"identity":"SEED-300#express-review-test-intent-through-page-objects","href":"seeds/SEED-300-dashboard-test-page-objects.md#express-review-test-intent-through-page-objects"},"implementation":"Review and Side panel page-object ownership for the helpers and call sites that express touch review intent","rationale":"The titles, stroke comments, viewport-ownership helpers, and comparison names live in the same review support and specs that SEED-300#express-review-test-intent-through-page-objects will re-own. Starting before that ownership lands would either race that rewrite or force a second edit of the same wording after the page objects settle. Shared direction and reconciliation cannot replace waiting for that ownership to exist.","condition":"SEED-300#express-review-test-intent-through-page-objects has landed with its review helper and call-site ownership integrated on the authorized trunk.","state":"satisfied","resolution":{"revision":"26bcdab755a81875c698cb51eb941037646bcb7f","path":".planning/seeds/SEED-300-dashboard-test-page-objects.md#express-review-test-intent-through-page-objects","summary":"Accepted integration3d5653e4d7cc9acf49a284c584dc9b979e812724 on origin/main contains the completed review/control ownership. storyCardControls, reviewControls, existing tree/pane/context owners and sidePanelFrame/Width provide shared procedural/fluent mechanics consumed by the unchanged phone/tablet touch split. Complete current review66 includes all4touch cases with original native input, file/context/reading-place, held-answer and frame observations; branch closure6b5684785b47ff2a7d931884ec424c5d5bfdfb5f had exact CI success. Recover original source, done slices and concrete proof at before-cleanup26bcdab755a81875c698cb51eb941037646bcb7f:.planning/slice-plans/582-review-test-intent/PLAN.md and slice4/slice5 evidence. The supplier ownership is integrated, satisfying the recorded prerequisite; this does not refine or implement SEED321, alter its viewport split, or authorize execution.\nCondition satisfied: SEED-300#express-review-test-intent-through-page-objects has landed with its review helper and call-site ownership integrated on the authorized trunk.\nAccepted integration: 3d5653e4d7cc9acf49a284c584dc9b979e812724 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/611-match-touch-review-titles-to-viewport-coverage/PLAN.md","assessment":"not-ready","reasons":["Recheck the four focused E2E cases and the viewport-specific proof roster on published comparisons after SEED-427. Verify the existing ReviewChanges page objects can express the surviving beats."],"basis":{"document":"cfa66b38657fdbcb3b88c4f22645df3f6261715512586cd48a063e7704433aee","plan":"7d50f4919f8cd25ad0453c475ca04734aafe1c6f0d140637cb4ddea0ca661806"}}
```

#### Goal

A developer reading a failed touch review case can tell from its title which
viewport's journey broke and what that viewport actually runs, without
reconstructing the phone-versus-tablet split from helper code. What a case
runs comes from the same declaration as its title, so a case cannot silently
skip beats its title claims.

#### Scope

- Give each viewport's two touch review cases in
  [story-review-touch.spec.ts](../../e2e/review/story-review-touch.spec.ts)
  a title that names what that viewport runs. Use published Git comparisons
  for both viewports. The phone keeps titles naming the comparison choice and
  the panel controls it alone covers (Hide and Show files, Next file, Refresh,
  Close). The phone's fixture offers a meaningful choice of published
  comparisons. The tablet's titles name reading the chosen file
  within each pane under the comparison the review opens with, and keeping the
  file and reading places through rotation, Maximize and Restore.
- Under the [Architectural North Star](../NORTH-STAR.md) (test support holds
  only MakeMe builders and page objects; no wrappers may be added and touches
  outside builders and page objects only remove from `test-support`), eliminate
  the page-width `ownsSharedObservations` check and retire the journey-wrapper
  files
  [storyReviewTouchJourney.ts](../../dashboard/test-support/support/storyReviewTouchJourney.ts)
  and
  [storyReviewTouchContext.ts](../../dashboard/test-support/support/storyReviewTouchContext.ts)
  from `dashboard/test-support/support/`, expressing each viewport's declared
  steps directly in `e2e/review/story-review-touch.spec.ts` through the
  existing `ReviewChanges` and Side panel page objects (`32a64ed10`).
- Preserve the phone-and-tablet behavioral split, the four cases, the reading,
  context and panel assertions for published comparisons, and native touch
  input. Use the existing page objects for those assertions.

##### Scope limits

- The stroke-count comment the seed was planted for no longer exists, so
  there is nothing to align.
- Keep the large file and diff needed to demonstrate reading and scrolling.
  Recheck shared fixture callers against the published comparison before
  changing a fixture used by both touch and desktop review.

Required restrictions and reasons: this is wording and ownership of existing
proof, not a new product behavior or a timeout campaign. Keep MakeMe domain
setup and causal waits. A flaky check remains failing under the project's
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).

#### Key examples

- A tablet failure while reading the long file's wide line reports a title
  such as "tablet review by touch › chooses a file and reads within each pane
  under the opened comparison"; it does not claim the phone-only comparison
  choice.
- A tablet failure after landscape Maximize reports a title naming rotation,
  Maximize and Restore, not "panel controls" the tablet never taps.
- A phone failure on Refresh or Close still reports a title naming the panel
  controls, and a failure choosing the published comparison still names the
  choice.
- A phone context case whose page is left in landscape when its rotation
  ends still runs Hide and Show files through Close, because the phone case
  declares those beats. Today the page-width check skips them there and the
  case passes under a title that claims panel controls.
