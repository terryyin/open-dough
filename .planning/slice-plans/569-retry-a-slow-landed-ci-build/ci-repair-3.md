# CI repair 3: reveal the project action before observing its touch target

Implemented and focused proof passed. The only owned edit is `dashboard/tests/configuration/system-settings-project-management-touch.spec.ts` (153 lines), three added lines: a comment and an explicit `removeProject.scrollIntoViewIfNeeded()` before the existing `tapWhereShown(removeProject)`. No production or shared proof helper changed. No commit, push, format, lint, planning or DearDough change was made.

Failure policy applies as written: [AGENTS.md#failing-and-flaky-tests](../../../AGENTS.md#failing-and-flaky-tests).

## Diagnosis and observed cause

Both run 42832244638/attempt1 (earlier accepted 4f9cde; `/tmp/seed285-ci-repair3-related-diagnostic.json`) and run 42845502760/attempt1 (accepted `3ca39fd13d3ff021ac7bab68fb8b870602e0a8a0`; `/tmp/seed285-ci-repair3-diagnostic.json`) have complete inventories with exactly one failed job and the same sole failure: `phone project settings editing › touch edits at reduced height and retries a real failed save with the exact draft`, the Remove Sample App touch target outside what clips it. These are coalesced because the exact current test reproduced the identical failure locally, and the current layout explains the identical failing transition; no hosted attempt was retried.

`SystemSettings` renders `CiFollowUpSetting` after the facts (`dl`) inside the project details, before the separate project actions. `project-configuration.css` wraps these two divs on phone and explicitly keeps settings content in ordinary page scrolling. Neither the row nor the settings content imposes a clipped fixed-height container; `styles.css` body has no height/overflow clipping. The test reads the final Client configuration `dd`, then immediately tries to touch Remove. That assumption of adjacency is no longer true: the new paragraphs extend below the 390x320 viewport. The unmodified touch observer correctly refuses the unshown target.

Baseline trace's final frame `/tmp/seed285-ci3-before.jpeg` shows the last fact at the top and the follow-up explanation continuing through the viewport bottom. The exact failure's retained trace is `dashboard/test-results/2026-11-10T15-41-54.835Z-76640/tests-configuration-system-b090f-d-save-with-the-exact-draft-chromium/trace.zip`. The repaired journey proves browser scrolling reaches the action: after the explicit scroll, the unchanged `tapWhereShown` checks the target's full bounds against the viewport and every clipping ancestor, minimum 44px dimensions, center hit target, and actual native touch landing. The scroll is a deliberate setup action, separate from touching; no activation silently supplies visibility and no assertion was weakened. Native finger scrolling itself is not claimed as newly proved.

The whole affected journey still opens the add dialog, touches and edits at reduced height, rotates while retaining the exact repository and checkout, induces a real permission-denied save, observes the error and unchanged predecessor/draft, restores permission and retries, observes the exact saved data, scrolls/touches Remove, confirms deletion, and observes the original configuration bytes and unrelated machine files. Relevant layout, read/return and recovery siblings passed together, rather than treating the one failing assertion as the acceptance boundary.

## Host/headroom decision

Before browser proof, actual local Mac: 16 CPUs, 48 GiB RAM, 64% memory free, load averages 10.88/11.46/9.94, AC power100%. `pmset -g log` showed latest sleep/wake Nov7, outside Nov10 proof window; machine fully awake. Known competitors were SEED287's two-worker paired watcher baseline in `/tmp/seed287-slice3-baseline-bubrhpdj` and installation/native setup's full dashboard suite in its named worktree. Root explicitly ran no proof alongside this repair. Capacity supported one exact browser test, then one seven-test browser command, followed by typecheck; all used `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i`. No own heavy checks overlapped. Reconsideration condition was changed pressure, contention or unexplained failure. Final snapshot retained64% free memory and load10.82/11.45/10.25; no pressure-related failure occurred. Remote runner headroom is unknown and not inferred from the local Mac.

## Proof

Baseline (expected diagnostic failure):

- Command: `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- tests/configuration/system-settings-project-management-touch.spec.ts --workers=1 --reporter=list`
- Result: exit1, one test failed in5.4s with exactly `Remove project Sample App is cut by what clips it` at `tapWhereShown` and spec's existing Remove step. No mutating workaround was present. This establishes the reproducer, not an exempt failure.

proof:
  command: PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- tests/configuration/system-settings-project-management-touch.spec.ts tests/configuration/system-settings-project-management.spec.ts tests/configuration/system-settings-look.spec.ts --workers=1 --reporter=list
  covers: repaired complete phone editing/recovery/removal journey and all six related settings layout/recovery journeys in the other two files
  boundary: real built-preview settings UI, real local configuration writes and failure/retry, browser touch/geometry and keyboard return
  observations:
    - system-settings-project-management-touch.spec.ts / touch edits at reduced height and retries a real failed save with the exact draft: unchanged assertions prove exact draft/predecessor through rotation and save failure, successful retry, exact saved repository/localPath/ref, native touches including Remove after deliberate scrolling, removal back to predecessor and unrelated files/calls unchanged
    - system-settings-project-management.spec.ts / project settings errors retain the form draft and predecessor and allow explicit retry: invalid repository and real failed save retain draft and bytes, corrected explicit retry adds project
    - system-settings-project-management.spec.ts / failed row removal keeps configuration, confirmation feedback and retry: failed remove preserves bytes and feedback; retry removes and navigation selects prior neighbor
    - system-settings-project-management.spec.ts / long configured facts reflow at narrow width and 200 percent zoom with keyboard return: long local path is rendered, document has no sideways scroll at both widths/zoom, keyboard returns to settings trigger
    - system-settings-look.spec.ts / each setting group is a headed region in one column, with readable text and recognisable controls: region, shared column, contrast, readable texts/control geometry
    - system-settings-look.spec.ts / settings and its project dialogs fit a 420 pixel window without sideways scrolling: Add and Remove open/cancel, focus, readable regions, dialog viewport fit and no sideways scroll
    - system-settings-look.spec.ts / touch reads host-local groups and returns from the last group after rotation: reads project facts and host-local groups, rotates, native-touches sticky Back and observes roster return/focus/project selection
  setup: projectAddMachine supplies installed machine/project preconditions and fixture preview; the touch journey itself performs every claimed edit/failure/retry/removal; long facts use shared makeMe.aConfiguredProject builder
  result: pass,7 tests,18.4s,exit0

proof:
  command: PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run typecheck:dashboard
  covers: dashboard TypeScript build contracts including the changed spec
  boundary: compile-time project references
  observations:
    - tsc --build dashboard/tsconfig.json: no type diagnostics, exit0
  setup: existing installed dependencies; no new fixture required
  result: pass

Additional non-test check: `git diff --check` exited0. Every yielded command reached its terminal result: baseline session68611 exit1, seven-test session11693 exit0, typecheck session6195 exit0. No owned watch/server/browser or pending command remains; test fixtures closed their resources. No observer state was read, written, polled or acknowledged.

## Consumer trace and proof preservation

Final script record: `/tmp/seed285-ci-repair3-consumer-trace.md`; literal command:
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/repeat-a-slow-landed-ci-build-once-and-flag-a-pe --base HEAD --term 'project actions below the facts' --term 'Remove project Sample App'`

Effect is local to this test body's explicit scrolling precondition; no shared callable/default/rendered product output changes. Every located consumer is dispositioned: `dashboard/longest-first-journeys` is excluded because it retains the same spec identity/selection contract, and `docs/maintainer/dashboard-touch-family-timings.md` is excluded because it is historical timing evidence. Test/support/journey kinds have no match in that effect trace. The affected test itself was executed in full.

Supplementary broader helper-family search: `/tmp/seed285-ci-repair3-helper-family-trace.md`, also every row dispositioned. It searched unchanged `tapWhereShown` and `readSetting` families to inspect enclosing observation assumptions. Settings look's3tests and the shared unchanged control/read helpers were exercised. Other separate touch consumers are excluded because this local test-body change cannot reach their boundaries; unrelated readSetting/readSettings name matches are excluded explicitly. The source fixture's `readSetting` warning that action checks do not use that reader helper was preserved; the new scroll is explicit at the intended action.

Original feature production and guidance paths, all original feature tests, and the earlier retained-history fresh-port repair remain exactly at accepted3ca39fd. This repair invalidates only the old failing touch-journey observation, now replaced by its whole passing replay. Existing accepted proof for unchanged feature boundaries remains reusable subject to root's normal correspondence review; this report does not claim to have rerun CI acquisition/repetition/retention. It also does not turn either failed required hosted verdict green.

## Gaps and next boundary

No focused implementation gap remains. Hosted final CI on the coordinator's repair publication is still required and root-owned. Root retains refactor review, selective formatting/hooks, publication, observer lifecycle and eventual wrap-up. Unowned stash00c1a7d and the coordinator's empty stash result were untouched. Files were left uncommitted for review; repository status contains only the single owned spec edit.


## Coordinator acceptance

Inspected actual test, unmodified strict helper, ordinary scrolling CSS and
baseline screenshot. The new control changes what is below the last fact;
explicitly revealing the later action preserves the intended touch observation.
Accepted the full seven-case replay, independent expectations and typecheck.
Fresh refactor `/tmp/seed285-refactor-ci3-return.md` ends REFACTOR COMPLETE:
none — already clean, no edits/tests,153-line spec. Both actual script traces
have every consumer dispositioned; no proof boundary changed by refactoring.
Earlier follow-up implementation/proof and product advice remain unchanged.

Owned attempts42832244638/1 (4f9cde) and42845502760/1 (3ca39fd) each have complete
inventories with only this reproduced failure. No rerun was requested. Run
42845123145 at9bef had16 cancelled jobs and zero failed jobs,15:33:09–24Z,
after3ca's push run created15:33:05Z. ci.yml's same-ref cancel-in-progress
policy proves supersession; it supplies no successful validation.
Freshness unchanged at main34853dbe8874fdb501ec1d8d2072c25a128b9dc3;
named supplier source/reference owners unchanged since09b455646.
The repair publication still owes applicable final CI with confirmed shutdown.
