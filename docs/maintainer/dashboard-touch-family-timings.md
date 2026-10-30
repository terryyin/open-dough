# Local touch-family reduction (SEED-180, 2026-10-30)

Measured under ADR 0010 like-conditions rules on the developer's Mac host.
Focused command (default workers):

```sh
env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=… \
  npx playwright test --config dashboard/playwright.config.ts \
  dashboard/tests/agent-launch-dialog-touch.spec.ts \
  dashboard/tests/agent-launch-start-session-touch.spec.ts \
  dashboard/tests/agent-launch-start-session-answer-touch.spec.ts \
  dashboard/tests/agent-terminal-touch.spec.ts \
  dashboard/tests/recently-done-sessions-sidebar-touch.spec.ts \
  dashboard/tests/session-management-touch.spec.ts \
  dashboard/tests/sessions-sidebar-touch.spec.ts \
  dashboard/tests/story-review-touch.spec.ts \
  dashboard/tests/system-settings-look.spec.ts \
  dashboard/tests/system-settings-openai-recovery.spec.ts \
  dashboard/tests/system-settings-project-management-touch.spec.ts \
  dashboard/tests/system-settings-terminal-theme.spec.ts
```

Before (slice 2 baseline at `bf6a6c6581bc9d9fc9c677376b8b9ddd166b65a3`): 36
cases in 14 files. After (working tree on
`f81371b3774ac890935cd7fe31d9dcaa91eb1e4a` plus this record): 21 cases in 12
files. Fifteen removals: ten plain tablet matrix cases, the terminal tablet
case, two `844×390` launched/refused answer cases, and the
`story-review-mark-touch` / `system-settings-terminal-touch` files folded into
owners, plus step trims that cite non-touch or sibling owners.

| Role | Revision | Cases / files | Focused walls (s) | Load before → after (1m) | Proofs |
| --- | --- | ---: | --- | --- | --- |
| Before | `bf6a6c65` | 36 / 14 | 37.551 / 35.696 / 36.279 | ~11.08→13.42; 13.42→15.28; 15.28→25.49 | `/tmp/seed-180-slice2-baseline/pass{2,3,4}.json` |
| After | `f81371b3` + docs | 21 / 12 | 32.647 / 33.074 / 31.827 | ~12.34→13.58; 13.58→16.68; 16.68→15.33 | `/tmp/seed-180-slice6-proof/pass{1,2,3}.json` |

Ordinary `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard` once after the
change is the green check only (suite-wall speedup out of scope):
`selectedCount=1742`, `strictStatus=passed`, wall 635.077 s at load before
~11.97 (5m/15m still elevated from concurrent work); proof
`/tmp/seed-180-slice6-proof/suite.json`. An earlier contested suite under
1m after ~25–28 failed one unrelated paging case
(`recently-done-sessions-sidebar-paging`); that record is kept as
`suite-contested-high-load*` and is not the green check.

### Surviving proof (retained)

| Removal | Surviving proof |
| --- | --- |
| Tablet cases of `agent-launch-dialog-touch`, `agent-launch-start-session-touch`, `session-management-touch`, `sessions-sidebar-touch`, `story-review-mark-touch` (folded), `system-settings-project-management-touch`, `system-settings-terminal-touch` (folded), `system-settings-look`, `system-settings-openai-recovery`, `system-settings-terminal-theme` (10) | Each remaining phone case runs the same body via `launchTouchViewports`; reduced-height steps still force ≤480 px on phone; `system-settings-look` 420 px case owns narrow settings fit |
| Tablet case of `agent-terminal-touch` (1) | Phone case holds shared assertions plus identity-header scroll; 390 stacked and 844 landscape cover panel arrangements |
| `844×390` launched and refused cases of `agent-launch-start-session-answer-touch` (2) | Each `390×844` case still rotates into 844×390 and asserts the row there |
| `story-review-mark-touch` file | Uncommitted-check rule in `story-review-uncommitted-check.spec.ts`; 44 px label tap and state through rotation in `story-review-touch` |
| `system-settings-terminal-touch` file | Attachment survival in `system-settings.spec.ts` with a viewport change while settings hide the terminal; touch read/rotation/Back in `system-settings-look` |
| Step trims (openai remove-failure/clear-on-leave; project Remove failure and Cancel; session-management Session details and assertion-free rotation; repeated Maximize/Restore in `agent-terminal-touch`) | Non-touch openai case + `system-settings-openai.spec.ts`; `system-settings-project-management.spec.ts` / `project-remove.spec.ts`; `sessions-sidebar-touch`; first Maximize/Restore per arrangement kept in `agent-terminal-touch` |

Kept as unique: `story-review-touch` tablet (side-by-side body ≥ 556 px),
`430×932` and held answer cases, `recently-done-sessions-sidebar-touch`, and
launch-dialog refinement choices through resize.

### Comparison limits

Focused-family wall over three consecutive passes is the measured evidence;
suite wall is not. Host contention from concurrent pygardon pytest produced
unlike elevated-load walls (40.955 / 43.567 / 32.593 s under 1m ~16–25) and one
contested clipped-target failure on the unchanged phone `story-review-touch`
case; those are retained outside Git under
`/tmp/seed-180-slice6-proof/*elevated*` and `*contested*` and are not the
comparison. Official after walls above used quieter starting load (~12–17)
comparable to the baseline's before-loads. Suite green check is not a
suite-wall claim. No product behavior change; no retries, sleeps, skips, or
focus markers. Redundancy outside this touch family and suite-wall speedup
claims remain out of scope.
