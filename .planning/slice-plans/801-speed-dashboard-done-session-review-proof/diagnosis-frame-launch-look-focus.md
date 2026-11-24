# Diagnosis: frame-launch-look-focus

## Failure signature
`dashboard/frontend-tests/navigation/frame-launch-look.spec.ts` cases "at a narrow window Start session keeps every control reachable and readable without sideways scrolling" (:195) and "at 200% zoom …" (:200) fail in `startSessionReadsAt` at line 184 `await expect.element(prompt).toHaveFocus()` (expect.poll did not resolve in time) after Cancel → launcher focused → `userEvent.keyboard("{Enter}")`.

## Reproductions so far (slice 2 candidate tree, macOS, Chromium, --workers=2, no other test work running)
| Batch | Command | Result | Load | Log |
| --- | --- | --- | --- | --- |
| slice-2 consumers | 13 board-frame Vitest files | FAIL :200 (matches) | ~4.5 | /Users/terryyin/git/open-dough/.git/worktrees/get-fast-proof-of-finding-and-reviewing-done-ses/open-dough/evidence/s2-cons-vitest.log |
| solo | frame-launch-look.spec.ts alone | pass 3/3 cases | 4.55 | /Users/terryyin/git/open-dough/.git/worktrees/get-fast-proof-of-finding-and-reviewing-done-ses/open-dough/evidence/s2-look-rerun.log |
| repeat r1–r3 (stop at 3) | 13 files | r1 FAIL :195 (matches); r2, r3 pass | 4.2–5.6 | /Users/terryyin/git/open-dough/.git/worktrees/get-fast-proof-of-finding-and-reviewing-done-ses/open-dough/evidence/s2-flake-r{1,2,3}.log, s2-flake-load.txt |
Rate on candidate: 2 of 4 combined runs; 0 of 1 solo.

Reproduction command (from checkout, files as separate argv words):
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node .claude/skills/dough-execute-plan/scripts/slice-clock.mjs run --log … --exit-file … -- npm run test:dashboard:frontend -- <13 files> --workers=2`
13 files: sessions/recently-done-sessions-sidebar-mount, sessions/recently-done-sessions-sidebar-room-mount, navigation/{frame-roster-look, development-intent-frame-sessions, board-reading-keys, accessible-board-announcements, board-scroll, frame-board-look, accessible-board-keyboard, accessible-board-scroll, accessible-board, frame-launch-look, story-card-selection} (.spec.ts under dashboard/frontend-tests).

## Parked slice 2 changes in the tested tree (uncommitted)
Production: dashboard/src/{machineReadSource.ts, pageReads.tsx, recentlyDoneLink.ts, recentlyDoneSelection.ts, recentlyDoneShownLinks.ts} (done-link reads through PageReads; useShownDoneLinks effect deps now [context, reads]).
Test frame: frontend-tests/navigation/{board-frame-mount.ts, board-frame-observation-supply.ts} (association, doneCatalog, sessions options; default association answers "absent"); test-support/component-mount/unreadPageReads.ts; sessions mount page/specs; deleted 4 legacy select specs. frame-launch-look.spec.ts itself unchanged since base.

## Round 1
Batch A — attribution at base 1f50e333f (temp worktree under the job tmp).
- Hypothesis H1: the failure is pre-existing (load-dependent focus race in the Start session dialog) and reproduces at base; H2 alternative: the parked changes (board-frame supply / shown-links reads) introduce it, so base stays green.
- Stop count: 3 runs of the 13 files at --workers=2. Any matching failure at base supports H1; 0/3 at base with comparable load is weak support for H2 (candidate rate ~50%).
- Result A: base 3/3 pass (26/26 each), load 3.6–4.4 (diag-base-{1,2,3}.log, diag-base-load.txt). Candidate rate 2/4 vs base 0/3: weak support for H2, not conclusive.
- Note: frame-launch-look mounts with `emptyMachineAnswer()` (no Done rows), so `useShownDoneLinks` reads nothing and the association/doneCatalog/sessions supply options are unused there; the parked production change reaches it only through the extra `useDoneLinkReads` hook calls (memoized over stable reads).

Batch B — instrument on candidate.
- Temporary diagnostic edit (REVERT): frame-launch-look.spec.ts wraps line 184's focus assertion and logs `DIAG` {document.activeElement outerHTML, dialogs and open state, launcher focused} on failure.
- Hypothesis H3: after Enter the dialog does not reopen (Enter's key events land while the launcher is focused but before its activation path runs, or the Cancel close is still in progress); H4: the dialog reopens but focus stays on/returns to the launcher (dialog focus effect races the close's focus return).
- Stop count: up to 4 candidate runs of the 13 files, stopping at the first matching failure.
- Result B: candidate 0/4 (26/26 each), load 3.8–4.6 (diag-cand-{1..4}.log, diag-cand-load.txt); no DIAG captured. Cumulative candidate rate 2/8, base 0/3: base-vs-candidate not distinguished.

Batch C — raise contention, interleaved base/candidate.
- Hypothesis H5: the race is CPU-contention dependent (both earlier failures came in the first batch after a quiet period / alongside other runs); at --workers=4 the rate rises on whichever tree carries the cause. Instrument from Batch B stays on the candidate.
- Stop count: 3 interleaved pairs (base, candidate) of the 13 files at --workers=4; stop early at the first candidate DIAG capture.
- Result C: BASE reproduced at --workers=4: diag-c-base-3.log FAIL :200 "at 200% zoom …" — `prompt` not found: after Enter no Start-session dialog exists (ARIA tree shows the launcher and no dialog; connection logo "awaiting updates since return"). Candidate 0/3 at --workers=4. Loads 5.2–7.6 (diag-c-load.txt). **Attribution: pre-existing at base 1f50e333f; the parked slice 2 changes are not required for it.** Matches H3 (dialog never reopens), refines the signature: the poll times out because the dialog is absent, not because focus is elsewhere inside it.

Batch D — capture state at failure on both trees.
- Temporary diagnostic edit (REVERT): the same DIAG instrument copied into the base temp worktree's frame-launch-look.spec.ts (scratch tree, removed at end).
- Hypothesis H6: between the asserted launcher focus and the Enter, focus leaves the launcher (a Board update after the modal unmounts, or the launcher's queued microtask reclaim racing), so Enter's keydown never reaches `openDialogFromActivation`; DIAG would show `launcherFocused: false`. H7 alternative: the launcher keeps focus and `open()` runs but the dialog is closed/unmounted again (DIAG `launcherFocused: true`, no dialog).
- Stop count: up to 4 interleaved pairs (base, candidate) at --workers=4, stopping at the first DIAG capture.
- Result D: 0/4 base, 0/4 candidate at --workers=4, load 4.1–4.5 (diag-d-{base,cand}-{1..4}.log, diag-d-load.txt). No DIAG.
- Evidence from the base failure trace (diag-c-base-3.log): Cancel click 188 ms → `not.toBeInTheDocument` dialog at +415 ms (0 ms) → launcher `toHaveFocus` at +416 ms (0 ms, passed) → keyboard Enter +416 ms (45 ms) → prompt never appears (14.5 s). The launcher had focus the instant the dialog left; whether focus stayed there through Enter is unknown. Code read: `useLaunchDialogLauncher` layout effect focuses the launcher and reclaims once in a microtask ("a same-turn Board update after the modal unmounts can steal activation from a lone layout focus"); `openDialogFromActivation` opens only from keydown on the launcher; `LaunchDialog` calls `showModal()` and focuses the prompt in a mount effect. Leading hypothesis H6 (focus leaves the launcher after the 0 ms check, before Enter, so keydown lands on body).

Batch E — more instrumented samples (same kind as D; last of this round).
- Hypothesis H6 vs H7 as in Batch D.
- Stop count: up to 5 interleaved pairs at --workers=4, stopping at the first DIAG capture.
- Result E: 0/5 base, 0/5 candidate at --workers=4, load 5.1–7.8 (diag-e-*.log, diag-e-load.txt). Cumulative: candidate 2/17 combined runs, base 1/15; repetition is not raising the rate.

Batch F — switch kind: always-on instrumentation (candidate tree only).
- Temporary diagnostic edit (REVERT): frame-launch-look.spec.ts records capture-phase focusin/focusout/keydown/close events (time, tag, aria-label) from before Cancel through Enter and logs `DIAGSEQ` on every run, pass or fail.
- Hypothesis H6 predicts, on some passing runs, a focusout of the launcher (or a late focusin elsewhere) after `dialog-gone`, i.e. a window in which Enter would land on body; H7 predicts keydown on the launcher followed by a `close` event of the new dialog.
- Stop count: 3 runs of frame-launch-look.spec.ts alone plus 2 runs of the 13 files at --workers=4; read every DIAGSEQ.
- Result F: solo run 1 FAILED with the matching signature and DIAGSEQ captured (diag-f-solo-1.log):
  `["113 focusout TEXTAREA","114 focusin BUTTON","115 focusout BUTTON","115 focusin BUTTON:Start session in Open Dough","178 cancel-clicked","178 dialog-gone","181 keydown BUTTON:Start session in Open Dough","205 close DIALOG"]`
  Every passing sequence (solo 1 other case, solo 2–3) has `close DIALOG` BEFORE `dialog-gone`, then after Enter `focusin TEXTAREA`. In the failure the native dialog was already closed (so `getByRole('dialog')` found nothing and the browser had returned focus to the launcher) but its `close` event — the only path to React `onClose` → `closeDialog` → `setOpen(false)` — had not run. Enter's keydown hit the launcher, `openDialog()` set `open` true while it was still true (no-op), then the queued `close` event closed it: the reopen is lost.
- **Cause (H7 variant), production race in trunk code**: `LaunchDialog` closes natively in its Cancel handler (`dialog.current.close()`) and reports closure only from the asynchronous `close` event; `useLaunchDialogLauncher.openDialog` during that gap is swallowed. A user pressing Enter (or clicking) on the launcher right after Cancel loses the reopen. H6 refuted for this failure (focus stayed on the launcher through keydown). Pre-existing at base; not caused by slice 2.

Batch G — forced reproduction (confirmation before any fix).
- Temporary diagnostic file (DELETE): dashboard/frontend-tests/navigation/diag-launch-reopen.spec.ts dispatches Cancel's click and then the launcher's Enter keydown synchronously, before the close event task.
- Hypothesis: it fails deterministically (prompt never focused) on the current code.
- Stop count: 2 runs; both must fail with the signature.
- Result G: forced reproduction FAILED 2/2 with the matching signature (diag-g-1.log, diag-g-2.log): the activeElement check on the launcher passed, then the prompt never appeared. **Cause confirmed** by a reproduction that fails before any fix; diag-launch-reopen.spec.ts is that reproduction and becomes the fix's proof.

## Environments ruled out / counts
- Candidate tree, 13 files --workers=2: 2 fails / 8 runs; --workers=4: 0 / 8. Base tree, --workers=2: 0 / 3; --workers=4: 1 / 12. Solo file with instrument: 1 / 3. Load 3.6–7.8, macOS, Chromium (Vitest browser), no other test work running. Total natural rate ≈ 4 / 34 runs.

## Unrelated defects found
None beyond the cause (which is itself independent of slice 2).

## Temporary diagnostic edits
- frame-launch-look.spec.ts DIAG/DIAGSEQ instrument: REVERTED (file equals HEAD).
- Base temp worktree (/Users/terryyin/.claude/jobs/7a4cc949/tmp/base-wt, with the instrument): REMOVED.
- dashboard/frontend-tests/navigation/diag-launch-reopen.spec.ts: DELETED; folded into the permanent regression case below.

## Leading cause and next step
- Confirmed cause: `useLaunchDialogLauncher.openDialog` is a no-op while the previous `LaunchDialog` is natively closed but its asynchronous `close` event has not yet run `onClose` → `setOpen(false)`; that late event then closes the reopen. Trunk code (src/launchDialogLauncher.ts, src/LaunchDialog.tsx, src/StartSession.tsx; also FollowUp.tsx uses the same launcher), present at base 1f50e333f.
- Proposed fix (needs its own slice clock per diagnosis-rounds "Confirm the cause and fix it"; trunk-code cause is fixed and delivered before parked slice 2 resumes): give each opening its own generation — `openDialog` always starts a new generation and keys the mounted `LaunchDialog` by it, and `closeDialog` from a dialog's close event only applies when its generation is current — so a reopen during the close gap mounts a fresh modal and the stale close is ignored. Proof: diag-launch-reopen.spec.ts passes (fails before), then frame-launch-look.spec.ts + the 13-file batch stable at a stated repeat count (e.g. 5 runs at --workers=4), plus the FollowUp/StartSession launch specs.
- No timeout/retry/settle wait involved.

## Round / minutes
Round 1 of 3 authorized. Clock at record time: {"command":"status","identity":"SEED-413#speed-dashboard-done-session-review-proof","diagnosis":"frame-launch-look-focus","round":1,"roundsAuthorized":3,"cumulativeMinutes":4.7,"state":"running","elapsedMinutes":4.7,"remainingMinutes":10.3,"limitMinutes":15,"overrun":false,"storyOverruns":0}

## Repair (slice clock `repair-launch-reopen`)
- Fix: `useLaunchDialogLauncher` numbers each opening (`opening`, a ref-backed counter); `openDialog` always starts a new opening; `closeDialog(opening, accepted)` applies only to the current opening and returns false otherwise. `StartSession.tsx` and `StartLaunch.tsx` key `LaunchDialog` by `opening` and run their close effects only when `closeDialog` applied. FollowUp.tsx uses StartSession and needs no change. No timeout, retry or settle wait; no test seam.
- Regression case: `dashboard/frontend-tests/launches/ad-hoc-start-session.spec.ts` "Enter on the launcher right after Cancel reopens the launch dialog" (replaces the deleted diag-launch-reopen.spec.ts). Before the fix: FAILED (repair-before.log; prompt never found). After: passes (repair-after.log, 3/3 in file).
- Stability batch — hypothesis: with stale closes ignored, the 13 board-frame consumer files show no lost reopen; stop count 5 runs at --workers=2 (any line-184 failure refutes the fix). Plus once: all frontend-tests/launches specs and the frontend specs that open Start session / Follow up.
- Final-form regression case also FAILED on HEAD code in a temporary worktree (repair-before-final.log; worktree removed) and passes with the fix (repair-after.log).
- Stability result: 5/5 runs of the 13 files at --workers=2 passed, 26/26 each (repair-stab-{1..5}.log), under heavy external load 7.1–22.7 (repair-stab-load.txt) — well above the loads where the flake appeared.
- Launcher consumers: 33 frontend specs (all frontend-tests/launches plus the Start session / Follow up specs) passed, 27 Vitest files / 132 tests and the Playwright ones, exit 0 (repair-cons.log, load 15–17); e2e agent-launch-host-switch-fresh, recently-done-follow-up, intent-story-follow-up, story-review-follow-up passed (repair-e2e.log).
- typecheck repair-tc2.log (0); eslint --max-warnings 0 on the four repair files repair-eslint.log (0). Consumer trace (base 1f50e333f, terms useLaunchDialogLauncher, closeDialog, openDialog, launchDialogLauncher): repair-consumer-trace.txt — code consumers of the hook are only StartSession.tsx and StartLaunch.tsx (FollowUp reaches it through StartSession); the trace also lists the parked slice 2 paths because it diffs the whole checkout.
- Status: fixed; the round's leading cause is confirmed and repaired. Repair clock at record time: {"command":"status","identity":"SEED-413#speed-dashboard-done-session-review-proof","slice":"repair-launch-reopen","state":"running","elapsedMinutes":2.6,"remainingMinutes":12.4,"limitMinutes":15,"overrun":false,"storyOverruns":0}
