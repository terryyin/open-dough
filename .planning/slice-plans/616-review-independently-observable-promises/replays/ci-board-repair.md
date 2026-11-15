# CI repair: wait for the launch answer before Board membership

CI run [43733702195, attempt 1](https://github.com/terryyin/open-dough/actions/runs/43733702195)
failed registered revision `c6eabcac7f6301062c756df32b45831b0072f8fe`.
The complete diagnostic inventory names one failed job and one failed test:
`dashboard-integrated / shard 1/4`, job `132871536262`,
`navigation/board-paging-side-panel.spec.ts` (the 54rem Board journey).
The final failure inventory is complete with no gaps; it names an assertion failure.

## Failing observation and cause

The faithful CI trace starts the membership assertion at 46607.589ms.
The Start acceptance request remains unanswered until about 47306ms.
The later sessions answer still shows the launch running and only the earlier
ad hoc session. Its next native-launch change request remains pending when
the assertion expires at 51617.843ms. The final error snapshot subsequently
shows Story B's Execution session and two working sessions.

The check outran the action's answer. The initial unchanged focused local run
passed; that pass did not dispose of this intermittent failure. Artifact
14169214675 and the bounded extraction are retained outside checkout cleanup:
`/tmp/open-dough-board-artifact.zip`, `/tmp/open-dough-board-trace.zip`,
`/tmp/open-dough-board-error-context.md`, `/tmp/open-dough-board-diagnosis.json`.

## Repair and accepted observation

The spec calls existing `untilPageRequestsAnswered(page)` after Start, as the
maintained [journey rule](../../../../dashboard/tests/writing-journeys.md#a-checks-bound-starts-after-the-answer-it-depends-on)
requires. This waits through native-launch changes and resulting reads.
Every existing expected value, assertion and timeout remains unchanged.
No shared helper or production behavior changed.

Passed, exit 0:

```sh
PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_DASHBOARD_INTEGRATED_PROOF_RECORD=/tmp/open-dough-board-repair-proof.json caffeinate -s -i npm run test:dashboard:integrated -- dashboard/tests/navigation/board-paging-side-panel.spec.ts --workers=1
```

The proof record reports selectedCount 1, strictStatus passed, test 6645ms and
run 8292ms. Setup: real dashboard/native launch path, synthetic Claude launched
scenario, launchJourney's committed origin (Story A Taken, B/C Backlog),
108rem viewport. Observations retain all-three columns, attached terminal,
54rem Board, paging controls and one slide, close/reopen restored view,
one Story B session, Recently done zero, and the selected Backlog/Taken view.

[Consumer trace and every disposition](ci-board-consumers.md) show a new call
only in this spec. The existing synchronization owner is exercised; other
callers and shared support remain unchanged. Whole-group proof is not required.
MakeMe and page-object selection both apply; existing owners were reused.

The local Mac had 16 CPUs/48GiB, moderate load near 6, about 16GiB inactive
memory and AC power. One worker under the maintained sleep guard was bounded;
another worktree's named proof remained with its unknown owner. Native setup
check passed with matching pinned Node/Playwright and Chromium 158.0.8127.18.
No timeout override, sleep or rerun-until-green was used. Active repair about
five minutes. Original guidance/replay proof remains valid; final applicable
CI after repair publication is still required.
Independent refactor completed with no edits; all 84 consumer dispositions and
the accepted native proof remained applicable, with no rerun.
