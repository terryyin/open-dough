# Get faster feedback on the seven phone-board checks

**Identity:** SEED-404#run-dashboard-frontend-checks-at-doughnut-speed
**Source:** [Get faster feedback on the seven phone-board checks](../../seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-dashboard-frontend-checks-at-doughnut-speed)
**Source review:** [Independent story commitments](source-review.md)

## Goal and scope

Move the two [indicator cases](../../../dashboard/frontend-tests/board-indicators.mounted.spec.ts) and five [swipe cases](../../../dashboard/frontend-tests/board-swipe.mounted.spec.ts) to a production React screen mounted with production CSS in Vitest browser mode. Playwright supplies touch Chromium. The developer runs the same seven behaviors through `npm run test:dashboard:frontend`, with under 0.5 s combined case time across repeated comparable runs. Measure startup and full command elapsed time separately. CI reports each once under Dashboard Frontend Test. The other 685 cases at the preparation baseline keep their existing owners. The [follow-up](../../seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed) owns the full-suite speed target.

## Current decisions and proof boundaries

- Use the existing frontend group, its configured Intent location, its two CI shards and its normal file/title selection. Share selection, admission, worker budget, deadline and output ownership across the engines. A phone-only invocation can skip Playwright's static builds. A filter that matches only retained cases should start only Playwright. Exercise list-only, empty, mixed and failed selections. Preserve the supported direct runner entry for retained journeys and describe precisely which command covers the entire group. [Frontend runner](../../../dashboard/frontend.playwright.config.ts), [group selection](../../../dashboard/tests/support/testFiles.mjs), [local resource contract](../../../Distribution/tests/local-test-resources.md)
- Keep per-file isolation. Within a file, mount and unmount a real screen for each case. Give each case its own service answers and starting view. Reuse the existing [published facts](../../../dashboard/tests/support/frontendPublishedFixtures.ts) and [authenticated answer logic](../../../dashboard/tests/support/frontendAuthenticatedReadSubstitute.ts) at the browser fetch boundary. If building domain data requires Node, pass the prepared data into the browser. The capture used for the rehearsal was disposable. Keep live data, the dashboard backend and production navigation in their existing proof owners.
- Dispatch touch events directly to the mounted board and deliver transition completion without progressing real time. Keep the production components and observe real DOM, focus, CSS and viewport changes. The published-project [phone-board E2E](../../../e2e/navigation/phone-board.spec.ts) retains full-page routing, gesture wiring, vertical reading and native hit testing of the thin indicator. Existing keyboard paging coverage exercises Enter through the built page. [Keyboard and paging cases](../../../dashboard/frontend-tests/navigation/board-paging.spec.ts)
- The [CI producer](../../../.github/workflows/browser-test-group.yml), [fragment reader](../../../Distribution/src/skills/dough-test-optimization/scripts/ci-proof-fragments.mjs) and [frontend report](../../../scripts/frontend-test-proof.mjs) already support timed case counts by file. Combine the disjoint selections once per shard. Preserve failed, skipped, unfinished and load-error evidence and the group exit status. Two same-part case fragments would overwrite one another. Keep case identities in runner output and file attribution in the report.
- [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md) leaves tool selection open. Apply [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md) to the seven-case developer wait and the cost of supporting both runners. The established [North Star](../../NORTH-STAR.md) requires no production architecture change for this test boundary.

## Premises and observations

Local macOS observations used the owned preparation checkout on AC power on 2026-11-18. The shared seed holds the full-suite CI baseline.

| Premise and operation | Observed result and limits |
| --- | --- |
| The old two-worker selection exercises all seven named cases. At `b6a759be6`, `caffeinate -s -i /usr/bin/time -p npm run test:dashboard:frontend -- 'frontend-tests/board-(indicators\|swipe)\.spec\.ts' --workers=2 --reporter=line` (the alternation is a literal pipe). | Seven passed, Playwright reported 21.1 s and command elapsed time was 22.07 s. At `7abb4771c`, real proof records from each file separately contained the two and five passing case outcomes. Full discovery at the earlier revision was 692 in 291 files. Re-inventory at execution if trunk has since added or moved cases. |
| Vitest can run this React screen on this project's browser. In a disposable copy of the manifests at `7abb4771c`, resolve and install Vitest and its Playwright provider at 5.1.0 with Playwright 1.65.0 and Vite 8.3.8. Run `caffeinate -s -i node "$probe/node_modules/vitest/vitest.mjs" run --config "$probe/vitest.config.mts"` using the installed provider's default Chromium shell (1254). | Four representative cases passed on the pinned stack in 11.71 s elapsed, and again in 11.19 s after the control below. Mounted App used the production stylesheets and captured replies from the real frontend test fixture, supplied to fetch inside the browser. No per-case static server or production page load. These four cases are feasibility evidence. The seven original cases still supply acceptance. |
| A native gesture reaches the mounted React board and CSS constrains the resulting layout. Use the above command with a temporary transform changing the touch indicator from 0.75 rem to 44 px. | A native swipe reached Taken. In the original styling, both indicators measured 12 px and view/card each measured 366 px in a 390 px board. The control measured 44, 44 and 302 px respectively, failed the width assertion, and the runner exited nonzero. Restoration passed. Native tap and cancelled touch also reached the intended frame. |
| Consecutive cases have independent starting state. Mount, go to Recently done, unmount, clear storage, remount and exercise keyboard focus. | Clearing storage alone exposed the last column cached by [keptChoice](../../../dashboard/src/keptPreference.ts). The second case focused the Backlog indicator instead of Recently done. Arranging its starting Backlog preference before the fresh mount restored the expected Enter/focus sequence in the same open browser. Preserve the production fallback for users whose storage is unavailable. |
| The browser can supply the harder inputs without supplying their outcomes. On the same stack, dispatch timed native touches on a card and its launch action, tap inspection and selection, set reduced motion, resize 390 × 844 → 844 × 390 → 390 × 844, and use a long backlog for vertical scrolling. | The swipes left the card unselected, inspection collapsed and launch writes at zero. Taps selected and inspected the card, and both states survived rotation. A native vertical stroke on the 16-item backlog advanced actual scrollTop and kept Backlog visible. Wait for scrollend before observing the settled region, as the existing touch helper does. |
| Both runner reports can reach the existing frontend artifact. On `7abb4771c`, normalize the actual scratch Vitest JSON and the retained five-swipe Playwright record to outcomes and seconds by repository path. Replay `ci-proof-summary.mjs fragment --by-file --unit case --entry dashboard/frontend-tests --part 1 --of 1 --outcomes … --times …`, then `summarize --expect dashboard/frontend-tests=1:case` and `node scripts/frontend-test-proof.mjs`. | With the width control, the artifact showed 8 passed and 1 failed, with the failure under the scratch mount file. Restoration showed 9 passed across the two files with separate durations. This tested local artifact consumption in one part. The mixed normal command, both actual CI shards and the seven-case speed comparison are execution proof. |

## Ordered slices

### 1. Preserve case outcomes from a mixed frontend selection

Type: Structure
Status: done

Add the bounded frontend producer adapter that slice 2 needs to publish one timed case result per selected case. Feed the existing fragment and report readers. Keep the current shard declarations and Playwright-only results valid.

**Proof.** Replay real runner output through the frontend producer with a passing case from each engine, a failed mounted assertion, an unfinished run and a file that cannot load. Read the group verdict and final frontend report. A failed or absent result stays distinguishable from a pass, and the per-file counts and timings add up. The local replay above establishes the existing collector input.

**Observed.** Nine real-report replay scenarios passed through the existing case fragment and Markdown report commands. The mixed assertion failure recorded four passes, one failure and one other case. An interrupted Playwright run retained two other cases. A missing report, missing selected title, failed import and empty mounted collection left the part missing. The replay checked every file duration and the total against recorded case times. The retained-only record preserved its original contents and unassigned case evidence. The 16 fragment, action and report consumer checks and dashboard typecheck passed. Commands and artifacts are in `slice1-return.md` and `slice1-complete-reports/` in the checkout's Git evidence directory. Slice 2 supplies the normal command and CI wiring.

### 2. Select the right browser runner from the normal frontend command

Type: Behavior
Status: done

With mounted and retained specs in an isolated runner fixture, a developer runs the frontend command with a file, title, mixed filter or no filter. Start only the necessary runners, honor the existing group limits, and collect the combined result. Pin the Vitest browser provider and reuse the existing Chromium installation. All current product cases still run under Playwright in this increment.

**Proof.** Exercise the command in the runner fixture for both owners, one owner, no matches, list-only and a failing case. Compare selected and executed titles, process status and the report from slice 1. Exercise the existing local admission, deadline and output-directory consumers across the new entry point. Verify the ordinary retained-only run in this checkout.

**Observed.** The ordinary command in a disposable locked checkout executed mixed, single-owner and unfiltered selections, printed disjoint shard and list-only inventories, and returned the established no-match verdict without a browser. The retained-only run stayed quiet. The mounted assertion control kept the retained pass and mounted failure once each in the CI-format report. A 6.500 s deadline stopped the mounted run at 6.555 s and retained the incomplete record. Held repository admission blocked both engines until release. All seven existing phone-board cases passed in Playwright, and full discovery matched 697 cases in 293 files. The existing runner-ownership scenario, 18 focused admission and CI consumer checks, and dashboard typecheck passed after using the required Bash 5 on this Mac. Evidence is in `slice2-return.md` in the checkout's Git evidence directory. Mounted specs keep the same group and shard selection using a `.mounted` suffix, and the command accepts the original filename filter.

### 3. Mount a fresh phone board in the open browser

Type: Structure
Status: done

Prepare the test-side mount that the two indicator cases in slice 4 need. Reuse the real screen's providers, CSS, MakeMe data and frontend service answers. Establish the initial column, viewport and input profile per case, unmount, release pending replies and restore the affected browser state. Keep the seven originals running until their own transfers.

**Proof.** In a disposable smoke selection, run the same sequence that failed during preparation: leave the board at Recently done, tear down, remount with the next case's starting state, and use Enter from Backlog to Taken. Observe the named focused indicator and real width. Run the existing indicator selection to protect unchanged Playwright callers if the service answer code moves.

**Observed.** Two cases reused one Chromium Document. The first read the actual 12 px controls and 390/366/366 px board, view and card, then reached Recently done by native touch. The second observed the empty detached root, a held HTTP reply released during teardown, restored history, storage and viewport, and its own changed MakeMe publication. It began in Backlog, opened Taken with Enter and focused the Recently done indicator. The last teardown again emptied its detached root. A mixed normal-command gate recorded 18 passes across both smoke cases and the retained indicator, swipe, accessible board and control reachability cases. Dashboard typecheck passed. The disposable proof and raw results are in `slice3-return.md` and its referenced artifacts in the checkout's Git evidence directory.

### 4. Give the developer faster phone-indicator feedback

Type: Behavior
Status: done

Given a phone board with the original published stories and service answers, running the indicator selection mounts the real screen and styles in long-lived touch Chromium. The two existing cases exercise native swipes and taps, control names, actual story/view geometry, visible focus and keyboard handoff. Transfer their ownership atomically in the focused command, full selection and CI.

**Proof.** Run the indicator file and its title selections via the normal npm command. Exercise each in isolation and both in succession. Widen the indicators in a disposable negative control and observe the original geometry assertion fail, then pass after restoration. Read the resulting CI-format artifact for both cases. A mixed selection still runs a retained Playwright file. The other five phone cases remain in Playwright until their individual transfers below.

**Observed.** The saved filename and both exact title filters reached the mounted cases through the normal command. Both cases also passed in succession. In their actual board, both controls measured 12 px, and the rendered view and card each gained 64 px over the former 302 px viewing width. The 44 px CSS control measured 44/44 px and 390/302/302 px for board, view and card. It failed the original width assertion. Restoring the exact CSS restored both passes. The mixed shard-2 selection kept one retained case alongside two mounted passes and published the three timed cases in one local CI-format artifact. Full list discovery counted 697, including both mounted indicators and the five retained swipes. Dashboard typecheck passed. The Git evidence directory retains `slice4-return.md` and the report and control artifacts.

### 5. Check completed, short and cancelled swipes on the mounted board

Type: Behavior
Status: done

A completed finger stroke pages exactly one whole column and clamps at either end. A short or cancelled stroke leaves the visible column alone, and the following completed swipe works. Move the two existing travel/cancellation cases with their full action sequences.

**Proof.** Run both named cases through the frontend command. Keep the observed whole-column geometry, named controls and boundary destinations after each step. Confirm an incomplete stroke cannot satisfy the completed-stroke expectation. During a partial-file move, keep each original title discoverable and executable exactly once.

**Observed.** The saved swipe filename listed and ran each of the five original titles once, with two mounted and three retained. The two mounted titles each passed alone, including both end stops, the 24 px short stroke, native cancellation and the following completed stroke. Replacing the first completed left stroke with native cancel kept Backlog visible and failed the original Taken named-control assertion. Exact restoration passed both mounted cases. The two mounted indicators still passed their default swipes. Dashboard typecheck passed. The Git evidence directory retains `slice5-return.md` with the discovery, execution and negative-control records.

### 6. Preserve story interaction while paging and rotating

Type: Behavior
Status: done

Move the two story-card cases. A swipe beginning on card content or on Start execution must page without selecting, inspecting or accepting a launch. An ordinary tap still selects or inspects. In reduced motion, the controls and swipes agree on the column, trigger zero slides and retain detail and selection through rotation.

**Proof.** Run the two existing case sequences, including empty-area and action hit tests, no dialog or accepted launch, selected styling, expanded detail, zero recorded slides and the portrait/landscape/portrait column geometry. Repeat them after another case has changed the board preference.

**Observed.** Both native swipe origins reached Taken while selection, inspection and launch observations stayed clear. Native Inspect and empty-area taps then expanded and selected the story. With reduced motion active, the first swipe recorded zero slides. Chromium and the test frame both reached 844 × 390 and returned to 390 × 844. Whole-column geometry, open detail and selected styling passed. Each moved case passed alone and after the short/cancel case ended in Taken in the same file. The mixed run passed six mounted phone cases and the retained vertical-scroll case. Two retained slide consumers, six touch-reachability checks, dashboard typecheck and a disposable media/viewport/slide-recorder teardown probe passed. Evidence is in `slice6-return.md` in the checkout's Git evidence directory.

### 7. Make the seven phone-board cases complete without elapsed-time waits

Type: Behavior
Status: planned

The native mounted and retained Playwright runs took about the same time.
Single-worker profiling attributed 85–87% of the bodies to horizontal input
and destination/layout checks. A minimal native Chromium stroke still took
about 600 ms. The developer authorized direct event delivery and controlled
time in the seven mounted cases. Use one mounted indicator file and one
mounted swipe file under their existing logical filename selection.

**Proof.** The seven cases still exercise direction, end stops, short and
cancelled input, click suppression, selection, inspection, focus handoff,
indicator widths and reduced motion through rotation. A vertical touch is
unconsumed and the same Backlog stays visible. One published-project E2E
covers the full wiring, actual vertical reachability and native indicator
hit target. Deliberately break the swipe response or click suppression and
observe the relevant checks fail before restoring production bytes.
Measure combined case time under one worker and measure the whole command
under the normal two-worker selection. Where possible, compare against the
kept native baseline. Verify both logical file selections, the complete
inventory and the two shards, and check hosted frontend proof once accepted.

**Prior approach.** The same seven titles passed in their native mounted
form. Three paired two-worker runs measured 10.36–10.90 s with Playwright
and 10.09–11.06 s mounted; the ranges overlapped. The final split mounted
run retained all 697 logical cases and reported a controlled indicator
failure alongside a retained deep-link pass. The active Git evidence
directory retains `slice7-return.md`, `slice7-timing-split/` and
`profile-phone-board/`.

**Observed locally.** After mounting the production App once per case and
keeping real geometry checks for each distinct layout, three consecutive
final one-worker runs recorded 314.9, 323.5 and 350.7 ms combined across the
seven cases. Full command elapsed time was 2.26–2.42 s. The final two-worker
selection took 2.27 and 2.34 s including startup, with about 458 and 446 ms
of summed case time respectively. Earlier matched two-worker
runs compared the direct-event candidate at 3.14 and 3.26 s against 18.31
and 16.54 s for the native Playwright baseline. Use the serial sum for the
case-time target and two-worker elapsed time for developer feedback.

The gesture and compatibility-click controls each failed their intended
assertion after a deliberate product regression, as did widening the
indicator to 44 px. Exact restoration passed. The published-project E2E
passed three consecutive checks and the final typecheck and mixed-run gate.
The mixed local CI-format report includes all seven mounted cases and one
retained deep-link case. The unfiltered and sharded inventories match the
697 original logical cases, accounting for three updated phone titles.
The physical shard counts remain 360 and 337. The Git evidence directory
`phone-board-event-optimization/` retains the commands, runner records,
controls, consumer trace and report. Hosted results are still pending.

## Verification and review

- **Local gates.** Follow [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos). Fully awake on AC, use `caffeinate -s -i`; on battery use the lid-open `caffeinate -i` procedure and inspect the sleep log. Run the affected case/title selections through `npm run test:dashboard:frontend -- board-indicators.spec.ts board-swipe.spec.ts --workers=2`, the [runner ownership](../../../dashboard/backend-tests/runtime/runner-ownership.spec.ts) and [focused resource](../../../Distribution/tests/support/local-test-suite-focused-runners.test.mjs) consumers touched by selection changes, and the [CI fragment checks](../../../Distribution/tests/skills/dough-test-optimization/ci-proof-fragments.test.mjs) for any changed proof boundary. For partial transfers include any temporary file owners in selection. Run typecheck and affected lint. Compare unfiltered discovery and both declared shard selections with the starting inventory. Hosted CI owns the actual shard run and upload. Verify the resulting artifact.
- Use the [test-entry selector](../../../.agents/skills/dough-execute-plan/references/test-entry-rules.md) before changing sources. Both original specs select MakeMe and page objects. Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md) as written at every gate.
- Plan refinement split mixed-result reporting from command selection, and isolated the fresh board mount immediately before its first case transfer. The last slice revises the event and timing boundary after profiling. The measured case time and preserved proof are the delivery criteria.

## Execution context

Maki-chan resumed the published Take at `b14434bb1bf4413f690fa31a9981fa203bd8d39e` in Story Branch Mode on `codex/get-faster-feedback-on-the-seven-phone-board-che`. Increments publish to the branch on `origin`, with `origin/main` as the integration target. Checkout-local locked install, dashboard typecheck and native Chromium validation passed. CI uses GitHub Actions `ci.yml`, Codex coordinator `maki-701`, mailbox `/tmp/dough-ci-501/watch-nVMtXI`, yielded cell `g86:66`, session 86736, PID 34336. The Take on trunk is unobserved by this branch observer.

At the Take revision, guarded Playwright list-only discovery found 697 cases in 293 files, with 360 in 155 files on shard 1 and 337 in 138 files on shard 2. The checkout's Git evidence directory retains all three inventories as `baseline-*.log`. Use these inventories for the migration comparison and account for separately accepted later changes.

The seed's [hosted baseline, run 44267762058 attempt 1](https://github.com/terryyin/open-dough/actions/runs/44267762058), attributed 5.726 s to the two indicator cases and 15.649 s to the five swipe cases, 21.375 s summed. With the wrapper in place and the seven cases still in Playwright, [run 44294037209 attempt 1](https://github.com/terryyin/open-dough/actions/runs/44294037209) attributed 4.637 s and 12.069 s, 16.706 s summed. Its frontend test steps took 197 s and 149 s, with 360 and 337 cases respectively. The Git evidence directory retains both original reports and the recent steps. Keep CI case times and job steps separate from locally measured elapsed time.


## Story obligations

### G1. The seven-case selection must meet the revised speed target
Reported: slice 7 — "The split mounted median was 10.43 s versus 10.85 s for Playwright. The ranges overlapped, so the comparison did not establish a repeatable speedup."
Story clause: "combined recorded case time is under 0.5 seconds in repeated comparable runs"
Disposition: proved by slice 7: phone-board-event-optimization/event-publish-{1,2,3}.json and two-worker-comparison.log in Git evidence
Commitment: P01
