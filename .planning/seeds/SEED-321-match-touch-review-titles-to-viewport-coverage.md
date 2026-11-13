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

SEED-312#speed-up-touch-review-checks cut the touch review journey so the
phone alone chooses the comparison, file browser controls, and panel controls
that no arrangement changes, while the tablet repeats only what its layout
changes. The four cases in
[story-review-touch.spec.ts](../../dashboard/tests/review/story-review-touch.spec.ts)
still share the titles "chooses a comparison and file and reads within each
pane" and "keeps the chosen file and reading places through rotation and panel
controls", a comment that still counts 31 strokes, helpers that decide the
owning viewport from page width, and `largeReviewRevision` /
`largeWorktree` names that still imply an 18-file comparison. SEED-312 left
that file byte-identical so SEED-287's branch could merge over it cleanly;
comments in
[storyReviewTouchJourney.ts](../../dashboard/tests/support/storyReviewTouchJourney.ts)
already say what each viewport runs. Until titles and helper wording match
that split, a tablet failure's title overstates what broke.

SEED-300#express-review-test-intent-through-page-objects will own the review
helpers and call sites that express this intent. Settling the titles and
comments before that ownership lands would race the page-object rewrite or be
rewritten again. This story waits for that supplier, then aligns the wording
with the viewport split SEED-312 already runs.

<a id="match-touch-review-titles-to-viewport-coverage"></a>

### Match touch review titles to what each viewport runs

**Identity:** SEED-321#match-touch-review-titles-to-viewport-coverage
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-321#match-touch-review-titles-to-viewport-coverage","dependencies":[{"supplier":{"identity":"SEED-300#express-review-test-intent-through-page-objects","href":"seeds/SEED-300-dashboard-test-page-objects.md#express-review-test-intent-through-page-objects"},"implementation":"Review and Side panel page-object ownership for the helpers and call sites that express touch review intent","rationale":"The titles, stroke comments, viewport-ownership helpers, and comparison names live in the same review support and specs that SEED-300#express-review-test-intent-through-page-objects will re-own. Starting before that ownership lands would either race that rewrite or force a second edit of the same wording after the page objects settle. Shared direction and reconciliation cannot replace waiting for that ownership to exist.","condition":"SEED-300#express-review-test-intent-through-page-objects has landed with its review helper and call-site ownership integrated on the authorized trunk.","state":"satisfied","resolution":{"revision":"26bcdab755a81875c698cb51eb941037646bcb7f","path":".planning/seeds/SEED-300-dashboard-test-page-objects.md#express-review-test-intent-through-page-objects","summary":"Accepted integration3d5653e4d7cc9acf49a284c584dc9b979e812724 on origin/main contains the completed review/control ownership. storyCardControls, reviewControls, existing tree/pane/context owners and sidePanelFrame/Width provide shared procedural/fluent mechanics consumed by the unchanged phone/tablet touch split. Complete current review66 includes all4touch cases with original native input, file/context/reading-place, held-answer and frame observations; branch closure6b5684785b47ff2a7d931884ec424c5d5bfdfb5f had exact CI success. Recover original source, done slices and concrete proof at before-cleanup26bcdab755a81875c698cb51eb941037646bcb7f:.planning/slice-plans/582-review-test-intent/PLAN.md and slice4/slice5 evidence. The supplier ownership is integrated, satisfying the recorded prerequisite; this does not refine or implement SEED321, alter its viewport split, or authorize execution.\nCondition satisfied: SEED-300#express-review-test-intent-through-page-objects has landed with its review helper and call-site ownership integrated on the authorized trunk.\nAccepted integration: 3d5653e4d7cc9acf49a284c584dc9b979e812724 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Queued from SEED-312's review to wait for SEED-300#express-review-test-intent-through-page-objects; refine after that story lands. No execution authority is granted."],"basis":{"document":"3658fd96177151bb5cfe47a8c561ac54783a6f1c9ec1af13d90c898657de9551"}}
```

#### Goal

A developer reading a failed touch review case can tell from the case title and
nearby comments which viewport's journey broke and what that viewport actually
runs, without reconstructing the phone-versus-tablet split from helper code.

#### Scope to refine

- After SEED-300#express-review-test-intent-through-page-objects lands, align
  the tablet case titles, the stroke-count comment, viewport-ownership helpers,
  and comparison/worktree names in the touch review specs and support with
  what each viewport now runs.
- Preserve the phone-and-tablet behavioral split and every reading or context
  assertion SEED-312 retained. Do not restore removed strokes or enlarge the
  comparison beyond what the assertions distinguish.
- Prefer the review page-object owners that story leaves in place; do not
  invent a second helper family for the same controls.

Required restrictions and reasons: this is wording and naming of existing
proof, not a new product behavior or a timeout campaign. Keep MakeMe domain
setup and causal waits. A flaky check remains failing under the project's
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).

#### Key examples to refine

- A tablet reading or context failure names only the arrangement that viewport
  proves; it does not claim the phone-only comparison or panel-control beats.
- The stroke-count comment and helper names match the strokes and comparison
  size the current cases actually run.
- Phone titles still name the shared-control ownership the phone alone keeps.
