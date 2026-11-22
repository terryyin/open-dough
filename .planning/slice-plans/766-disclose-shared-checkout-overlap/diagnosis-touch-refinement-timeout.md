# Diagnosis: touch-refinement-timeout

Identity: SEED-418#disclose-shared-checkout-overlap; diagnosis name `touch-refinement-timeout`.

## Failure signature

- CI run 44985422719 attempt 1, job "dashboard-frontend / shard 2/2" (137094814813), step
  "Run the group's browser tests"; artifact `dashboard-frontend-playwright-report-2`.
- `dashboard/frontend-tests/launches/ad-hoc-refinement-touch.spec.ts:37` "Test timed out in 15000ms".
- Trace ends at `selectOptions Model` (spec:30 via spec:48, +524ms, 24ms). Custom command
  `tapMountedControl` (Playwright `locator.tap()`) is not traced, so the hang lies in the next
  untraced action: `tap(labelOf(Standard radio))` (spec:49) or `tap(options)` (spec:52).
- Failure screenshot: dialog intact, Model "Sonnet", Standard checked (default), Refinement options
  still closed, nothing covering the controls. A native select popup is not captured in a page
  screenshot.

## Attribution

Commit 841aa35 changes only published-session review code; it touches neither the launch dialog,
the spec nor its page objects. Not this story's change; repair still owed (failure policy).

## Round 1 (started 12:44, load 13-17 on 16 cores)

- Baseline: spec passes alone locally (ci2-base2, 4.5 s, load 13.5).
- H1: the tap helper's picker suppression is racy — `setChoiceAfterTap` removes its `mousedown`
  preventDefault listener as soon as `tap()` resolves; if Chromium's compat mousedown (generated
  from the GestureTap after touchend) arrives later, the Model picker opens after the `:open`
  check, and on Linux an open native popup swallows the next CDP touch so `tap()` never returns.
  - ci2-order1: without suppression, the tap opens the picker (compat events
    pointerdown,touchstart,pointerup,touchend,mousedown,mouseup,click all before tap resolved).
  - ci2-forced1 (macOS): with the Model picker forced open, the next label tap still completes —
    macOS headless cannot show the hang; Linux observation needed.
  - ci2-order3 (load ~11) and ci2-order4 (+24 `yes`, load ~13): 20 iterations each, compat
    mousedown always arrived before the listener removal on macOS. No late event observed.
- Next: Linux (colima, mcr.microsoft.com/playwright:v1.65.0-noble) — does a forced open Model
  picker hang the next tap there?
- Linux container (colima arm64, mcr.microsoft.com/playwright:v1.65.0-noble, Node 26.13.1, npm ci
  in scratch copy `/Users/terryyin/.claude/jobs/22fb0da2/tmp/ci2-linux`, run via
  `node scripts/test-frontend.mjs <spec>`):
  - ci2-linux-forced1: Model picker forced open (open=true after tap and after selectOptions); the
    next label tap still completes. **H1's hang mechanism refuted on Linux too.**
  - ci2-linux-repeat1: real spec 12/12 pass, `--cpus 2`, host load 7-9.
- Round 1 end: 11.4+ cumulative minutes; no reproduction. Next round switches kind to
  instrumentation: what selector `page.elementLocator(label)` serializes to, and whether the
  Model change re-renders the dialog after `selectOptions` resolves (a stale or index-based
  selector matching nothing would make Playwright's `tap()` wait forever — no action timeout).
- Prior history (commit 341de8f4a, record `diagnosis-refinement-touch-picker.md` in that commit):
  the same signature (timeout right after `selectOptions Model`, before the Standard label tap)
  was attributed to a leaked native Model picker, visible in that hosted screenshot, and repaired
  with the mousedown suppression now in `setChoiceAfterTap`.
- **This run's hosted screenshot shows no open native menu** (Model closed, reads Sonnet), unlike
  the earlier hosted capture. The suppression worked here, yet the next tap still hung: the leaked
  picker is not this failure's cause (further refutes H1).
- ci2-selectors1 (macOS): `labelOf(Standard)` serializes to the page-wide `internal:text="Standard"i`;
  options to `internal:role=dialog >> internal:text=/^Refinement options/`. The Model selection
  causes only attribute mutations on inputs (no node replacement) before `selectOptions` resolves.
- `@vitest/browser-playwright` sets no `actionTimeout` unless configured, so a Playwright action
  that waits on actionability retries silently past the 15 s test timeout: the trace cannot name
  what `tap()` waited for.

## Round 2 (kind switch: full-shard contention on Linux)

Hypothesis H2: the stall needs the full shard's concurrent workers (passes alone, fails in the
full run). Experiment: run `OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT=2/2 node scripts/test-frontend.mjs`
in the Linux image with `--cpus 2` (hosted runner has 2-4 vCPU). Stopping count: 3 shard runs or
first matching timeout.
- ci2-linux-shard2-1: full frontend shard 2/2 (51 files, same set as hosted) in the Linux image,
  `--cpus 2`, host load ~9.7-9.9: all passed; the touch case took 930 ms. Runs 2 and 3 were
  stopped unfinished when round 1 overran (`[killed]`; ci2-linux-shard2-2.log is partial).
  H2 not reproduced at 1 of the planned 3.

## State at round 1 end (overrun)

- Clock: round 1 of 3, 16.3 cumulative active minutes, paused (overrun). The H2 batch ran inside
  round 1's overrun window; round 2 has not been started on the clock.
- Reproductions: 0 of 1 single (macOS), 0 of 12 single (Linux, 2 CPU), 0 of 1 full shard (Linux,
  2 CPU), 0 of 40 late compat mousedown (macOS, loads 11-13). The signature has never reproduced
  locally, here or in the earlier 341de8f4a diagnosis.
- Ruled out: leaked native Model picker (hosted screenshot shows it closed; forced-open picker
  does not block the next tap on macOS or Linux); late compat mousedown at measured loads;
  node replacement of the Standard label by the Model change.
- Temporary edits: none remaining (scratch `zz-scratch-tap-order.spec.ts` removed from the checkout
  and the Linux copy). Checkout clean; no parked changes. Linux scratch copy with Linux
  node_modules: `/Users/terryyin/.claude/jobs/22fb0da2/tmp/ci2-linux` (removable).
- Unrelated defects: none found.
- Leading hypothesis: Playwright's `locator.tap()` on `internal:text="Standard"i` (or on the
  Refinement options summary) waits on an actionability step (stable / hit target / scroll) that
  never completes on the hosted amd64 runner; without a configured `actionTimeout` the wait is
  silent and only the 15 s test timeout fires, so no evidence names the step.
- Next discriminating experiment (diagnostics kind, lets the next CI failure answer): make the
  mounted tap command name its stall, e.g. `iframe.locator(selector).tap({ timeout: <below 15 s> })`
  in `tapMountedControl` in `dashboard/frontend.vitest.config.mts` (or a provider `actionTimeout`),
  so the hosted failure reports Playwright's call log (which target, which actionability wait).
  This changes the failure-mode contract of mounted actions and needs maintainer judgment against
  AGENTS.md's timeout rules (it is an action bound, not a test-timeout override).

## Round 2 on the clock (instrumentation; started round 2, 16.3 cumulative minutes)

Kind switch authorized by the coordinator: instrument the mounted tap so the next hosted failure
names its stall. Instrument (temporary, uncommitted): `tapMountedControl` in
`dashboard/frontend.vitest.config.mts` now calls `iframe.locator(selector).tap({ timeout: 10_000 })`.
No test timeout changed, no retries.
- Batch ci2r2-forced (hypothesis: a tap stuck on actionability now fails at ~10 s with Playwright's
  call log naming the wait, inside the 15 s test timeout). Scratch spec taps a control covered by
  an overlay. Stopping count: 1 run.
- ci2r2-forced: exit 1 at 10.5 s (inside 15 s) with `TimeoutError: locator.tap: Timeout 10000ms
  exceeded` and Playwright's call log naming the wait (`<div></div> intercepts pointer events`,
  retried hit-target check). **Instrument confirmed.** Scratch spec removed.
- Batch ci2r2-real (hypothesis: the bound does not disturb passing taps). Runs the real spec and
  the other specs reaching `tapMountedControl` (via `tap` in `launch-layout-page.ts`:
  ad-hoc-start-session-answer, ad-hoc-launch-dialog through `refinement-launch-page.ts`).
  Stopping count: 1 run each.
- ci2r2-real: ad-hoc-refinement-touch passed (touch case 3988 ms). ci2r2-others:
  ad-hoc-start-session-answer + ad-hoc-launch-dialog 7/7 passed. Load 8.7-10.9 on 16 cores, macOS.

## State at round 2 end

- Clock: round 2 of 3, 17.1 cumulative active minutes, paused (not overrun).
- Progress: instrumentation added and proven (captures the missing evidence on the next failure).
- Temporary diagnostic edit (uncommitted, in the tested tree): the `{ timeout: 10_000 }` tap bound
  and its comment in `tapMountedControl`, `dashboard/frontend.vitest.config.mts` (~line 36-39).
  It must ship with the repair delivery for the next hosted failure to carry the call log; decide
  then whether it stays as a permanent action bound. Scratch spec removed; no other edits.
- Reproductions this round: none attempted (instrument proof only); totals unchanged from round 1.
- Leading hypothesis: unchanged — `locator.tap()` on `internal:text="Standard"i` or the Refinement
  options summary waits on an actionability step (stable / hit target / scroll) that never
  completes on the hosted amd64 runner.
- Next discriminating experiment: the next hosted failure of this spec; its
  `TimeoutError: locator.tap: Timeout 10000ms exceeded` call log names the target and the
  actionability wait (e.g. "intercepts pointer events", "element is not stable", "not visible").
