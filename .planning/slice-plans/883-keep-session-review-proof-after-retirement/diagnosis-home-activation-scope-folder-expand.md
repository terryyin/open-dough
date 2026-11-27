# Diagnosis: home-activation-scope-folder-expand

## Failure signature

- CI run 46001524031, attempt 1, job dashboard-frontend (140514087265), SHA
  4cce05fd289bb177150df91d8b37b02d6c96906f (HEAD). Log: EVIDENCE/ci-46001524031-job.log
  lines 346, 1224. Failure screenshot in the run's kept test-results artifact.
- `intent-home-activation-scope.spec.ts:134` (15292 ms):
  `expect(toggle).toHaveAttribute("aria-expanded","true")` received "false" at
  `expandShownFolderPath` (intent-story-files-page.ts:58), via
  `expandFolderPath` → `selectBrowsedFile("story")` → `readStoryChanges`.
- Trace: `dashboard` was collapsed, activated, became expanded; then
  `dashboard/tests` read "false", was activated, and never became "true".
- Totals: 1 failed, 941 passed, 1 expected fail.

## Reproduction rate and conditions

- Spec alone at HEAD: 3/3 pass at load about 11–19 (EVIDENCE/ci2-repro-*.log).
- main's latest CI (4dbd60bda) passed.

## Base versus candidate attribution

- Story commits (767b1bd76, 3def01aa7, 4cce05fd2) touch useStoryComparison's
  opening, the lens's `sessionChosen` and CI evidence options, and proof-only
  specs. None touches the tree, `useIntentOpenFolders`, `useIntentStoryTree`,
  `IntentBrowserTree`, the page object, or this spec.
- Trunk: e777eed80 (in base) made `activateButton` an in-page click after one
  yielded task; f06b3467f held the story's folder reveal until its inventory
  is read.

## Hypotheses

1. (Leading) Check-then-toggle across a yield in the page object.
   `expandShownFolderPath` reads `aria-expanded="false"`, then
   `activateButton` awaits visibility and one task before clicking. If the
   story overlay's expansion round (`useIntentOpenFolders`) applies in that
   gap, it opens the folder, and the click then closes it; the hand choice
   (`chosen=false`) then keeps it closed across later rounds. In normal runs
   the expansion has already applied, so no folder needs a click; in the CI
   failure `dashboard` still needed one, so the expansion was late.
   Experiment: forcing spec that holds the story's review read, starts
   `expandShownFolderPath`, and answers the read so the expansion lands
   between the page object's read of the state and its click.
   Stopping count: forcing, 1 run; a fail with the signature confirms; pass
   refutes this timing and leads to instrumenting the gap.
   Result: CONFIRMED. Before the fix the forcing spec failed with the exact CI
   signature (`dashboard` opened, `dashboard/tests` read "false", activated,
   stayed "false", 14.8 s matcher timeout) — EVIDENCE/d1-force-before.log, load
   5.9. After the fix it passed in 112 ms — EVIDENCE/d1-force-after.log, load
   5.5. Attribution: base defect (page object + e777eed80's yield before the
   click), not this story's changes; it surfaces when the story's expansion
   round is late, as under CI load.

## Fix

Test synchronization defect, fixed in the page object: new `expandButton`
(dashboard/frontend-tests/page-objects/activateButton.ts) waits for
visibility, yields one task, then reads `aria-expanded` and clicks only if
"false", in the same task, so a committed opening is never toggled closed.
`expandShownFolderPath` (intent-story-files-page.ts) uses it;
dashboard/frontend-tests/README.md names it beside `pressButton`.

Proof: forcing spec (above); intent folder + stories/taken-slice-progress +
review folder 163 files / 447 tests passed (EVIDENCE/d1-consumers.log, load
5.7 at start, about 30 at end with the other worktree's suites);
`npm run typecheck:dashboard` and `npm run lint` passed
(EVIDENCE/d1-typecheck.log, EVIDENCE/d1-lint.log).

## Environments ruled out

## Reproduction command and instruments

Scratch spec (deleted from the checkout; copy at
/Users/terryyin/.claude/jobs/2e89351d/tmp/zz-scratch-folder-race.spec.ts):
mounts `readStoryChanges`'s page with the story's review read held
(`heldRead`), waits for the inventory with `dashboard` collapsed, then wraps
`Element.prototype.getAttribute` so the page object's first `aria-expanded`
read answers the held review; calls
`story.expandShownFolderPath("dashboard/tests/nested")`. Run through
`slice-clock.mjs run` with `npm run --silent test:dashboard:frontend -- <spec>`.

## Temporary diagnostic edits to revert

None left: the scratch spec and its test-results folder were removed.

## Parked changes

- Slice 4's uncommitted test edits are stashed (record
  EVIDENCE/ci-repair-stash-record-copy.json); the tested tree is clean HEAD.

## Unrelated defects

Same read-then-click-across-a-yield pattern, not fixed here:
`disclose` in dashboard/frontend-tests/intent/intent-ci-homepage-page.ts
(Project Intent, no expansion rounds), `showActions` in
sessions/session-card-page.ts, and spec-local folder openers in
intent-story-dark-appearance.spec.ts and intent-story-ci-cues.spec.ts
(trusted clicks wait on frames, a wider gap). Candidates for `expandButton`.

## Leading hypothesis and next experiment

Confirmed hypothesis 1; no further experiment.

## Rounds

- Round 1 started by the coordinator; cause confirmed and fixed within it.
  Clock at close: round 1, cumulativeMinutes 3.6.
