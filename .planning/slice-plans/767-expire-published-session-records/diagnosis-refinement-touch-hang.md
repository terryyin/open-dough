# Diagnosis: refinement touch hang

Owed repair: hosted CI failure on this execution's published slice 1
(`c86dd3425`), under the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Earlier diagnosis of the same signature: plan 762
`diagnosis-refinement-touch-picker.md`, repaired by `341de8f4a`.

## Signature

`dashboard/frontend-tests/launches/ad-hoc-refinement-touch.spec.ts:37`
("touch rotation and restricted height preserve the refinement draft and
choices, and Cancel sends nothing") times out at 15 s. The trace ends right
after `selectOptions Model`; the next action is a `tapMountedControl` tap
(Standard label or Refinement options), which the trace does not show. The
failure screenshot shows the dialog intact with no native menu open.

- Run 44986821554 attempt 1, job 137099094787 (dashboard-frontend shard 2/2),
  SHA `c86dd3425` (this execution). Artifacts: job tmp `ci1-artifacts/`.
- Run 44985422719, SHA `841aa3594` (branch
  `claude/disclose-shared-checkout-overlap-in-published-se`, without
  `c86dd3425`): same signature. That worktree shows no repair in progress.
- Rate since `341de8f4a`: about 2 failures in 15 hosted runs; hosted amd64 only.

## Attribution

This story's changes touch no launch or frontend file (slice 1 diff
`dcae18ad4..c86dd3425`); the hang also occurs without them. The repair is
still owed here because it failed on this execution's revision.

## Rounds

Investigation 1 (repair agent, about 18 active minutes, run before this
record and the diagnosis clock): no reproduction.

| Hypothesis | Experiment | Result |
| --- | --- | --- |
| An open native Model menu blocks the next tap | Tap Standard with the menu open; macOS and Linux arm64 (local CI image) | Tap resolves in 406 ms / 53 ms; not reproduced |
| Tap issued while the menu is opening | Tap 0–100 ms after Model's mousedown, Linux arm64 | 35–49 ms; not reproduced |
| Compat mousedown lands after `tap()` returns | Timing probe macOS; Linux arm64 with CPU throttle ×1–×20 | Mousedown always before tap resolves; not reproduced |
| Playwright retries the tap forever | playwright-core 1.65.0 hit-target interceptor source | Ruled out: no event → done |

Environments ruled out (no reproduction): macOS host load 5–11; Linux arm64
container with CPU throttling. Evidence: execution evidence directory
`ci1-probe-*.log` and `ci1-repair-report.md`. No unrelated defects found.

Leading hypothesis: a stage inside Playwright `locator.tap()` (actionability
wait, scroll, or touch dispatch acknowledgement) never resolves on hosted
amd64; `tapMountedControl` sets no action timeout, so the stuck stage runs
silently to the 15 s test timeout.

Round 1 (diagnosis clock): switch experiment kind to instrumentation. Give
`tapMountedControl` a bounded Playwright action timeout so the next hosted
occurrence fails with Playwright's call log naming the stuck stage. Hypothesis
for the CI runs that follow: the next hosted occurrence reports a tap timeout
whose call log names the stage; stopping count: the first hosted occurrence,
or this execution's last publication, whichever comes first.

Temporary diagnostic edits to revert: none (the action bound stays as
ordinary failure reporting). Parked changes: slice 2's uncommitted work in
stash `b0a4de32a136ce6cc1e5f6ed62038bcd8053f744`.

Round 1 result: instrument in place (`dashboard/frontend.vitest.config.mts`,
`tapMountedControl` taps with `{ timeout: 5000 }`). Captured evidence: a
scratch tap on a missing control (deleted) failed with `TimeoutError:
locator.tap: Timeout 5000ms exceeded.` and a call log naming the waiting
stage (`ci1-r1-instrument-probe.log`). Launches frontend group 23 files / 72
tests pass with it (`ci1-r1-launches.log`); dashboard typecheck passes.
Progress: diagnostics that let the next hosted occurrence answer which stage
hangs. Round count 1, cumulative about 2 active minutes on the diagnosis
clock. Next discriminating experiment: read the call log of the next hosted
occurrence.
