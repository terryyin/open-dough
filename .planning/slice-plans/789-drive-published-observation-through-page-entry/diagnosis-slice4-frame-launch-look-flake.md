# Diagnosis: `frame-launch-look` narrow Cancel→Enter flake

Failure policy: [failure-policy.md](../../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md) — flake counts as failing until stable.

## Failure

`frame-launch-look.spec.ts` “at a narrow window Start session…” under parallel Board suite (`slice4-frontend-proof-final.log`): after Cancel, launcher has focus, `userEvent.keyboard("{Enter}")` does not open the dialog (prompt never focuses, 15s). Passes alone (`slice4-frontend-proof-launch.log`). A11y dump shows Board with no dialog.

## Hypothesis

Slice 4 replaced the sync `useAgentLaunches` mock (`noSessions`) with production launches driven by typed `PageReads.machine`. The first open (pointer click) works; reopen via Enter fails under load because a post-mount machine-session settlement (and follow-on Board/Recently done update) still lands around Cancel→focus→Enter, so keyboard activation does not open the dialog even though the launcher briefly reports focus.

## Experiment

1. Wait in `mountBoardFrame` until the stories Board shows sessions-settled copy (“No sessions launched…”) so the first launch-owner read has committed before any case interacts.
2. Harden `useLaunchDialogLauncher` focus return after close so the launcher keeps focus across a same-turn re-render after the modal unmounts.
3. Re-run the narrow case alone and the same parallel Board selection (twice when time allows) via `slice-clock run`.

## Result

Hypothesis held. After Cancel, Enter reached the focused launcher but the
platform’s click synthesis could be dropped when a same-turn Board update
followed modal focus return (exposed once production `useAgentLaunches` and
typed machine reads replaced the sync mock).

Fix:
- `mountBoardFrame` waits for the first machine-session answer when the Board
  is present (Taken entry count complete; no “Reading sessions…”).
- `useLaunchDialogLauncher` reclaims launcher focus once more after close.
- `StartSession` / `StartLaunch` open on Enter/Space `keydown` (preventDefault)
  so reopen does not depend on click synthesis after modal teardown.

Proof (slice-clock `run`, exit 0):
- alone: `open-dough/evidence/slice4-flake-alone-2.log`
- parallel ×2: `open-dough/evidence/slice4-flake-parallel-3.log`,
  `open-dough/evidence/slice4-flake-parallel-4.log`
