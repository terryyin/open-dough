# Launch options Cancel viewport CI diagnosis

[Failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)

## Round 1

- Registered Story Branch revision `3c453c5640760205e0b2920f445beafcb81d6a10`.
  [CI run 45990366794, attempt 1, frontend job 140476466138](https://github.com/terryyin/open-dough/actions/runs/45990366794/job/140476466138).
- `launch-refinement-options.spec.ts:50` could resolve Cancel on the
  execution launch dialog. Playwright found it visible, enabled and stable,
  and repeatedly reported it outside the viewport. The actual 390 × 844
  failure screenshot shows a fully rendered Cancel in the footer at
  about y=775–819. The diagnostic, job log, and frontend artifact
  (15193269592) are retained under `ci-45990366794-*` in Git evidence.
- Historical repair `8b12ee059` is already in this candidate. Its controlled
  reproduction matched Cancel's y=775–819 when Chromium's outer page
  returned to 1280 × 720 but Vitest's tester frame stayed 390 × 844.
  That repair aligned the configured initial viewports. Read the prior
  diagnosis from that commit. A later geometry transition or a different
  clipping cause could still account for this run.
- Observe inner and outer viewport bounds, iframe and button rectangles,
  or comparable discriminating evidence in one focused reproduction
  using the prior work where it applies. Record the hypothesis and
  stop after one run, then reassess if it does not match. Support any
  repair with the full failing journey and every affected genuine
  layout/dismissal owner. If a shared browser runner change is necessary,
  observe the whole frontend suite once after proving its focused shape.
- Slice 8's four paths are parked in owned stash
  `b9bdb18128cdd07a2e8c5807c0a756b8786225d2`. Its replacement and final
  backend proofs are green. The pre-pause typecheck returned a nonzero
  result and remains with its writer after restoration.

The CI log shows the Usage 200% zoom case finish immediately before the
failed case's estimated start, so test that predecessor along with the
failing spec in one process. The probe captures Chromium layout metrics
and tester, iframe, top-level page and button geometry at the unchanged
native Cancel. If the native click still fails, capture geometry on the
error path. A healthy pass leaves the hypothesized inherited geometry
transition unconfirmed. Stop after one run.

The focused run passed 9/9. Vitest scheduled the launch file first, so
the paired files did not exercise inherited Usage geometry. The click
used 390 × 844 at DPR 1 in both contexts and Cancel spanned y=775–819.
The next instrument inserts one predecessor in the same spec with the
actual Usage zoom helper and mount at 640 × 450, including both original
test-finished hooks. Observe the same Cancel geometry after that fixed
order. Stop after one run, with no drift injected.

The same-page run passed 5/5. The predecessor mounted at 640 × 450. Its
resize had already returned DPR to 1, and the subsequent original
Cancel measured a 390 × 844 main frame and tester at DPR 1. This leaves
the hosted predecessor and actual outer geometry unknown.

Run one deliberate mechanism control. Use Chromium's real device
metrics override to leave the 390 × 844 tester under a 390 × 720 outer
viewport, while keeping the original test's native pointer actions.
This isolates outer clipping from product layout. The expected failure
matches a visible Cancel underneath the outer viewport, including
Playwright's outside-viewport result. The run cannot identify what
transition occurred on the hosted browser. Stop after one selected
case and retain both, then assess the proof's dependence on incidental
footer pointer reach. Separate Cancel dismissal and action reach
owners can continue to exercise native pointer intent.

The maintained command rejected the case-name flag before starting
Chromium. Use the single spec filename with one worker. The temporary
geometry injection is confined to the first case. Its cleanup restores
device metrics before the other cases. The same one-run hypothesis
and stopping count apply.

The one mechanism run reproduced the CI action failure. The unchanged
Cancel is visible, enabled and stable in the 390 × 844 tester and
repeatedly rejected as outside the 390 × 720 outer viewport. Before
and after the failed action both layout metrics report the same outer
width and height, with the iframe still at (0, 0) and Cancel at
y=775–819. Cleanup restores device metrics and all three sibling cases
passed. The first case failed in one attempt by its default timeout.
The Mac was on AC, with 16 logical CPUs and a one-minute load near 30.

Evidence in the checkout's Git evidence directory includes
`launch-cancel-repro-geometry.log.run.json`,
`launch-cancel-same-page-predecessor.log.run.json`,
`launch-cancel-outer-clip-spec-before.log.run.json`, the matching
logs, and `launch-cancel-outer-clip-before.patch`. These experiments
establish a test dependency on native pointer reach in an unrelated
dismissal step. The historical restoration bug and the specific
geometry transition on the original hosted browser remain distinct
from the reproduced mechanism. The observed screenshot and symptom do
not require a product layout change.

## Scoped repair

Round 1 paused at 4.3 active minutes. This options-ownership case opens
both real workflows and asserts their respective option exposure. Use
the existing native Escape dismissal and observe the execution dialog
close before opening refinement. The spec's dedicated Cancel case
continues to click Cancel to verify clearing after a refused Start.
The model/effort dismissal cases and launch geometry cases continue
to own native Cancel behavior and reachability. The fix changes no
browser runner state.

Prove the scoped case once under the same 720 px outer perturbation,
using the same maintained spec command. Its before-click geometry must
still show the clipped footer. All four cases should pass. Remove
temporary instrumentation and then run the concerned witnesses once
at their real viewports before handing off.

The matched CDP run passed 4/4. The comparative case observed the same
720 px outer viewport, 844 px iframe and Cancel at y=775–819, dismissed
execution by real Escape, observed the dialog close and continued to
the expected refinement options. Evidence is
`launch-cancel-outer-clip-after.log.run.json`, its log and
`launch-cancel-outer-clip-after.patch`. The temporary test instruments
have been removed.

Run the repaired workflow and its direct dismissal and layout witnesses
once at one worker. The selected files are the options and effort
specs, ad hoc dialog and frame launch layout. Expect options ownership,
native Cancel including focus restoration where asserted, and reach at
narrow and zoomed viewports to continue passing. Stop after one run.

The uninstrumented one-worker command passed all 16 cases in four
files. The options case completed both launch modes. Its same-file
Cancel case still clears retained choices after a refused refinement.
The effort and frame suites exercised native Cancel, keyboard
dismissal and focus return. The ad hoc and frame suites also observed
reachable controls at narrow and zoomed viewports. No shared product,
runner or fixture code changed. Evidence is
`launch-cancel-focused-final.log.run.json` and its log, plus
`launch-cancel-consumer-trace.md` and `launch-cancel-return.md` in
the checkout's Git evidence directory. The repair awaits its hosted
validation after publication.
