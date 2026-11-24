# Diagnosis: intent-scope-timing-click

## Failure signature

- CI run https://github.com/terryyin/open-dough/actions/runs/45296057233
  attempt 1, job "dashboard-frontend / shard 1/2" (138116728582), SHA
  a49313babdf979e36e9bae4f6d46786cdfc454a9. Log excerpt:
  `$E/ci-45296057233-shard1.log` lines 617-789.
- `dashboard/frontend-tests/intent/intent-scope-timing-history-units.spec.ts:78`
  "invalid retained proof explains why the scope has no timing":
  `TimeoutError: locator.click: Timeout 14834ms exceeded`, waiting for
  `getByRole('button', { name: 'dashboard/tests typescript' })` at
  `openScopeSummary` intent-scope-history-page.ts:142, via
  `openDoneScopeHistory` intent-done-scope-history.ts:37. 1 of 461 cases on
  the shard failed.

## Attribution

- The failing helper line was last changed by trunk commit 2dd0eb94f
  ("Stabilize frontend recovery and review tests"), which replaced
  `userEvent.click(locationNameControl(path))` with
  `userEvent.click(locationNameControl(path).element())` and the comment
  "The comparison can rename this button before the native click arrives".
- This story's commits (a42a333c, 1f50e333 merge, 422abd0f, a49313ba) do not
  touch `IntentLocationHeader.tsx`, `intentTreeComparison.ts`,
  `intent-scope-history-page.ts` or `intent-ci-homepage-page.ts`; PageReads
  changes (unreadPageReads association read) are checked below.

## Hypothesis 1 (round 1)

The location name button's accessible name changes when the Done comparison
reading arrives (`IntentLocationHeader.tsx` sets `aria-label` to
`treeComparisonAccessibleName(...)` = "tests, <comparison words>" once
`treeLocationComparisonOf` answers; before that the name is the drawn label
"dashboard/tests typescript"). `page.elementLocator(element)` and
`userEvent.click(element)` both turn the element into a role+name selector
at call time, so when the comparison lands between selector generation and
Playwright's resolution, the stale-name locator matches nothing and the
click waits out the case timeout. 2dd0eb94f's `.element()` change did not
remove the name dependency.

Experiment (forced): temporary instrument in `openScopeSummary` takes the
locator first, then waits until the button carries its comparison
`aria-label`, then clicks the stale locator. Expectation: the same
TimeoutError naming `'dashboard/tests typescript'`. Stopping count: 1 run
(deterministic by construction); a match confirms the mechanism.

## Runs (local macOS, Chromium, `--workers=2`, load ~5.6 at start, no other suites running)

Evidence dir `E=$(git rev-parse --git-path open-dough/evidence)`; each log has
a `<log>.run.json` run record.

1. `diag-click-forced-1.log` - instrument waited for the comparison label
   after locating: PASS. Did not match: locally the comparison label is
   already present when the button is drawn (`aria-label` = "dashboard/tests,
   typescript, **/*.spec.ts, 4 -> 6 test cases ..."), so the locator was
   generated from the comparison name. Hypothesis refined: CI's selector name
   "dashboard/tests typescript" is the label-less text content, so in CI the
   button was located BEFORE the comparison answered.
2. `diag-click-instrument-1.log` - observer logging: comparison label present
   at draw, only `aria-pressed` mutates; both cases PASS (natural order).
3. `diag-click-forced-2.log` - forced order: temporary gate held
   `readProof` answers (intent-story-compare-stories.ts) until
   `openScopeSummary` had located the label-less button, then waited for the
   comparison label, then `userEvent.click(locator)`. BOTH cases FAIL with the
   CI signature: `TimeoutError: locator.click: Timeout 14776ms/14820ms
   exceeded ... waiting for ... getByRole('button', { name: 'dashboard/tests
   typescript' })`. 2 of 2 matched. Hypothesis 1 CONFIRMED.
4. `diag-click-forced-after.log` - same forced gate, with the repair: BOTH
   cases PASS (phone-viewport case included).

## Cause

Test-support race, not production: `openScopeSummary` clicked through a
locator that `page.elementLocator`/`userEvent.click(element)` derives from the
button's accessible name at call time. When the Done comparison answers
after the location is drawn, `IntentLocationHeader` adds the comparison
`aria-label`, the derived role+name locator stops matching, and the click
waits out the case. The page behaves correctly (renaming with the comparison
is intended). Rate locally under natural order: 0 (comparison answers first).

## Repair

`dashboard/frontend-tests/intent/intent-scope-history-page.ts`:
`openScopeSummary` presses the drawn button with a native mouse
press/release at its shown centre (CDP `Input.dispatchMouseEvent`, after
asserting the point hits the button), so no name is involved. No timeout,
retry or settle wait. Instruments (gate in intent-story-compare-stories.ts
and intent-done-scope-history.ts, logging in intent-scope-history-page.ts)
were all removed; none remain.

Related latent defect (not repaired, out of this failure's scope):
`intent-summary-proof-page.ts` `openSummary` asserts
`expect.element(locationNameControl(path)).toBeVisible()` through the same
name-derived locator, so it can wait out a case if the comparison answers
between locating and asserting.

## Attribution result

Trunk-owned support defect (2dd0eb94f kept the name dependency). This story's
commits do not touch the button, the comparison naming or the helper; their
PageReads/unreadPageReads changes alter read timing only indirectly. Repaired
here because the CI failure is on this execution's revision.

## Acceptance batch (hypothesis and stopping count written before running)

Hypothesis: with the name-independent press, the failing file and every spec
sharing intent-scope-history-page.ts / intent-done-scope-history.ts pass in
natural order. Stopping count: failing file 10 runs; the 17 sharing spec
files 3 runs; any failure stops the batch and is diagnosed.

### Acceptance batch 1 results

- `repair-click-units-x10.log`: failing file 10 runs, 20/20 cases PASS (load
  4.3 -> 4.7).
- `repair-click-sharing-x3.log`: STOPPED at run 1 - 24 pass, 1 FAIL:
  `intent-project-ci-history-chart-marks.spec.ts:118` "at the narrowest
  supported width the duration axis labels stay whole inside the chart",
  `expected false to be true` at the repair's hit-test assertion. A new defect
  of the first repair, not the CI signature.
- `diag-click-narrow-1.log` (temporary point logging): deterministic 3/3 at
  the 320x256 viewport - the wrapped 51px-tall location button is shown only
  in part above the reading pane, so its box centre (y 229) lies on
  `.intent-reading`. Repair revised: press the centre of the button's FIRST
  LINE OF WORDS (Range client rect) instead of the box centre.
- `repair-click-narrow-x3.log`: that spec 3 runs, 6/6 PASS.
- `diag-click-forced-after-2.log`: forced order (gate re-installed
  temporarily) against the revised repair: both cases PASS. Instruments removed
  again; `git diff` shows only intent-scope-history-page.ts.

### Acceptance batch 2 (hypothesis and stopping count written before running)

Hypothesis: the revised press passes the failing file and all 17 spec files
sharing intent-scope-history-page.ts / intent-done-scope-history.ts in natural
order at every viewport they use. Stopping count: failing file 10 runs; the
17 sharing files 3 runs; any failure stops the batch.

### Acceptance batch 2 results

- `repair-click-units-x10-b2.log`: 20/20 PASS; `repair-click-sharing-x3-b2.log`:
  3 x (17 files, 25 cases) PASS, 75/75 (load 6.1 -> 5.0).
- Typecheck then flagged `line` possibly undefined; narrowed through the
  existing `presentElement` (no behaviour change) and the batch was rerun as
  the final proof:
  - `repair-click-units-x10-final.log`: 20/20 PASS (10 runs).
  - `repair-click-sharing-x3-final.log`: 75/75 PASS (3 runs x 17 files);
    load 3.5 -> 3.9.
  - `repair-click-typecheck-2.log` exit 0; `repair-click-eslint-2.log` exit 0;
    `repair-click-prettier-2.log` (check only) clean.
- Consumer trace (base a49313babdf9): `repair-click-consumer-trace.txt`.
  Dispositions: the 17 spec files sharing the page object (10 listed by the
  trace plus the 7 reaching it through intent-done-scope-history.ts) - run;
  intent-ci-wall-time-history-page.ts - excluded: imports only the unchanged
  `scrollingSidewaysIn`; `pressWhereShown`/`clickCount` matches in
  board-reading-page.ts, side-panel-width-view.ts, story-reference-done-page.ts,
  story-review-files-divider-view.ts, board-clamp/board-height/final-report
  specs, test-support controlReachability/pageLayout/sidePanelFrame and
  e2e final-report-done-native - excluded: separate same-named or
  Playwright-engine helpers this private function does not reach;
  `.planning/done/SEED-413_speed-intent-scope-timing-reading.json` -
  excluded: archived report text.

## Final state

- The refactor pass made `openSummary` (`intent/intent-summary-proof-page.ts`)
  the one helper that opens a location's Summary. It presses the name through
  `pressLocationName` (`intent/intent-ci-homepage-page.ts`), which finds the
  button by path and presses its first line of words through the shared
  `pressAt` (`navigation/board-reading-page.ts`). That also repairs the same
  race in the former `openSummary` visibility check. `openScopeSummary` and
  the repair's private press are gone; 11 importers moved to `openSummary`.
- Proof after the refactor: 34 consumer files ×3, 73/73 each
  (`refactor-press-x3.log`); the failing file ×10, 20/20
  (`refactor-press-units-x10.log`); typecheck, eslint and prettier check clean.
  Forced-order proof is the repair's (`diag-click-forced-after-2.log`).
- Temporary diagnostic edits: none remain.
- Parked changes in tested tree: none (slice 3 work stayed in the
  coordinator's CI repair stash entry).

## Clock

Round 1 of 3, cumulative about 5.5 active minutes; cause confirmed and
repaired within the round.
