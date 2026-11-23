# Keep the attention completion journey within its timeout under load

**Identity:** SEED-341#keep-attention-completion-journey-within-timeout
**Source:** [Attention completion journey](../../seeds/SEED-341-simplify-session-tests.md#keep-attention-completion-journey-within-timeout)
**Source review:** [Independent source review](source-review.md)

## Execution context

- Story Branch Mode on `codex/keep-the-attention-completion-journey-within-its`,
  owned dashboard worktree, publisher `dashboard-territory.local-open-dough`,
  agent Yui-chan. Integration checkout is `/Users/terryyin/git/open-dough`.
- Starting revision `e313d887db5072de5fa3edd0fb0533a002703211`.
  Established claim, initial candidate and published branch base
  `497eed2c20fc57eca705f184765a1d2f70f5d92d` on `origin`.
- Authorized closure target `origin/main`. GitHub Actions `ci.yml`
  (CI) observes the execution branch during slice delivery, coordinator
  `codex-fa1b57e7`, directory `/tmp/dough-ci-501/watch-1t2yyr`,
  stream cell `g362:9`, shell session 35327 and observer PID 48150.
- Slice 1 accepted and registered at `4e31faa0f56b91dccf1c8858106d464fe952387f`
  on the story branch. The managed delivery receipt retained the matching
  candidate and initial claim as its suffix base.
- Slice 2 accepted and registered at `bdf484822c970f05d8450d5acc580768c19e6cf1`
  on the story branch, with Slice 1 as its suffix base.

## Goal and scope

Keep the installed-report and manual completion proof in
`e2e/sessions/agent-completion-attention.spec.ts` within the default
30-second case budget under the contention described in the story. Keep the
actual installed report connected to the Board and the restarted dashboard.
Give the Read and Done actions their own case from a retained unfinished
report so they can run without first launching a story or restarting a server.
The attention spec is the only product file touched. Its private setup stays
inside the normal test budget.

## Current decisions

- Use the real launch HTTP boundary (`launch`, `codexStart`,
  `makeMe.aLaunchRequest`) for setup. Use the same Story A identity and title
  as the queued origin's `storyA`. The existing
  [Codex card start](../../../e2e/launches/agent-launch-start-codex.spec.ts)
  exercises the actual Start execution control and Codex selection on that
  origin, including claim, workspace and first input. This story exercises the
  confirmed input with its installed reporting command, the actual installed
  child process and the record that the open Board reads.
- For the second case use the existing `codexLaunch` dashboard fixture,
  `makeMe.aLaunchRecord` with the native thread, missing workspace,
  confirmed first input and unfinished completion, and `keepLaunchRecords`.
  `keepFinalReport` supplies the vendor's distinct final answer.
  Read the real Taken revision from `publishStoryColumnsJourney` through
  `publishCommittedOrigin`. Reuse the existing Board, message part, Final
  report, and Done entry controls. The store supplies a precondition. The
  controls still drive production readers, writes and the native transport.
- Both cases follow
  [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  by using existing product entry points, builders and page objects.
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  informs the readiness cues and keeps the report-to-poll ordering observable.
  The journeys still cross the installed command, dashboard server, Board or
  native transport, so Playwright belongs here under
  [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Refusal rules stay with the existing
  [backend proof](../../../dashboard/backend-tests/sessions/agent-completion-identity.spec.ts).
  Judge the timing benefit from comparable observations under
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Outside-in proof

| Promise | Owner and observation |
| --- | --- |
| The confirmed Codex first input contains the reporting command for this dashboard. The selected workspace holds the installed script. | Slice 1 asserts the stored input state, first native `turn/start` input, command origin and installed executable before invoking it. Slice 2 retains this in the delivery case. |
| A completed-with-attention report gives a recorded receipt for the same launch and Codex session. The store keeps its receipt and message, leaves `doneAt` absent, and sends no native interrupt, rename or new turn. A later unfinished report keeps that outcome and message and still leaves `doneAt` absent. | Slice 1 through the installed command from outside the workspace, its receipts, store and native call list. Slice 2 retains this in the delivery case. |
| The open Backlog card shows Working, the exact attention text with zero script elements, the completed-with-attention unread label and Mark as read. The later unfinished report changes the card on its next session read. The message follows the published move to Taken. | Slice 1 uses both actual reports, the paused page clock and an observed read per pace, then advances the published revision and reads the Taken card. Slice 2 retains this in the delivery case. |
| Removing the workspace leaves the installed command callable. Its retained receipt and message survive server restart and are available to the Board. | Slice 1 removes the actual workspace, checks the new receipt, restarts on the same machine and reads the persisted receipt and Taken message after a fresh page load. Slice 2 retains this in the delivery case. |
| Final report shows the exact native answer, with the attention reminder and Mark as read absent from the panel. Mark as read on the card clears its button, records the receipt as `reportRead`, leaves `doneAt` absent and adds zero panel controls. | Slice 2 starts with an unread retained record. Open the real report panel, show Taken with the panel open, and observe the card, panel and store before and after Read. |
| Mark as done closes the panel, removes the live card message, sets `doneAt` without a done problem, renames the Codex session and interrupts its observed turn. Done shows the new name, keeps Unfinished work collapsed until expanded, and still reads the native final answer. | Slice 2 continues from Read using the same record. Check exact native calls, including the absence of an incidental resume or new turn, then the Done entry and its final report. |
| Both cases pass within the default budget under comparable contention. | Slice 1 captures the unsplit baseline. Slice 2 compares the two cases to it and records the slowest case along with the observed setup and load. |

## Decisive premises and preparation observations

At `fa264d219` on 23 November 2026, Node 24.21.0, awake AC macOS and 16
logical CPUs, use the focused command in Local gates at one worker, with a
fresh `OPEN_DOUGH_E2E_PROOF_RECORD` per run. Scratch edits were restored.

| Consuming operation | Observation and result |
| --- | --- |
| The original test reaches the combined reporting, Board, restart and native actions on this runner. | The unchanged case passed in 6.631 s at natural load 10.36 → 9.47 with `--trace on`. The [earlier 30-second failure](../../seeds/SEED-341-simplify-session-tests.md#keep-attention-completion-journey-within-timeout) supplies the contention symptom. This run establishes behavior at current natural load. |
| The launch HTTP setup still produces the exact command and preserves the real report-to-Board journey. | Replace only the startup with `launch`, using the published Story A identity and title, confirm input from the stored record and wait for Working before reporting. The whole original journey passed in 7.460 s at natural load 11.45 → 10.10. The first scratch run located the wrong card when it used `queuedTitle` ("Prepare the queued start"). Use `storyA.title` for launch and card. The timing of this probe establishes reachability. |
| A retained unfinished Codex record drives the panel, Read, native Done and the renamed Done entry without an actual launch. | A scratch test in the same spec used the existing builder, real store, published Taken revision and fake native protocol. It passed in 4.948 s at natural load 11.34 → 15.79. It observed the native answer, receipt marked read with no Done mark, then panel closure, a stored Done mark, exact rename and interrupt, and the new name on Done. An earlier scratch attempt showed Taken before opening the panel and timed out clicking Read because the pane paged Taken offscreen. Show Taken after opening the panel. |
| The final split fits under the default limit at the relevant load. | The preparation probes exercised the candidate seams at natural load 9–16. The prior browser-free timings came from a different split. Slice 1 opens the loaded comparison before edits and Slice 2 closes it on the final cases. |

## Slices

### 1. The installed report reaches the Board from one confirmed launch

Type: Structure
Status: done

Capture the timed unsplit baseline from the execution base before editing.
Replace the Start dialog arrangement and duplicate store polling with the
observed launch setup and one confirmed launch. Keep the Board on the queued
revision until the published move, and start the open-page observation after
the launch with the reporting command still unused. Preserve the settled
reading before each delivery and the real read after it. Keep the complete
journey green while shortening the startup and reporting arrangement. This
enables the next slice to keep installed delivery, placement and restart
together as a short case. Preserve the current report-ID, workspace and
Codex input assertions. For workspace loss compare the pre-removal card to
the fresh Taken read after restart.

Proof is the full focused attention spec with the new arrangement. Check
the existing Start control proof owner before removing setup and assert
first input confirmation directly.

Execution baseline at `497eed2c2` on 23 November 2026: awake AC macOS
26.6.2, Node 24.21.0, Chromium 158.0.8127.18 and 16 logical CPUs. The five
specs named in the loaded gate ran with four workers, a fresh dashboard
build and normal per-test fixtures. 86 synthetic `yes` processes at nice 5
raised the one-minute load from the natural 8.78 to 43.53 before the run
and 87.55 at its end. The unsplit case reached the default 30-second
limit in the final Done reload (32.966 s reported with teardown).
All seven neighboring cases passed in 17.155–22.954 s. The runner elapsed
time was 84.57 s. `baseline-loaded.log.run.json`, `baseline-loaded.json`
and the failure trace are in this checkout's Git evidence directory.
Use the same workload for the first final comparison. The upper end of
the observed load exceeded the earlier 52–59 report.

Focused execution proof on the changed spec at `497eed2c2`: the full
combined case passed in 8.230 s (12.471 s runner), one Chromium worker,
with the local sleep guard and no supplemental workload. The launch
stored exactly one confirmed input and sent the installed command to
Codex. The two reports, the Board reads, Taken placement, workspace
removal, restart and the original Read and Done all passed. The unchanged
Codex card start spec remains the owner of the Start control. Inspect
`slice-1-focused.log.run.json`, `slice-1-focused.json` and
`slice-1-implementation.md` in Git evidence for the selection, terminal
result, setup and assertions.

### 2. The developer can read or finish a retained unfinished report

Type: Behavior
Status: done

Given a published Taken card and a retained unfinished Codex report with its
workspace gone, open its Final report and surface the Taken card with the
panel open. Read the report on the card, then mark the observed working
session done from the panel. Verify the independent Read and Done effects
and the Done history from the proof table. Use one private store and fake
native thread for this case. Keep the installed delivery, Board and restart
observations in the first case, and move the manual actions and Done history
into this one. Use the existing Done listing and reload cues unless a focused
check shows the mark's own page update already proves the persisted result.

Proof is both cases passing, each alone and together through normal E2E
selection, plus the matched loaded comparison. Keep the spec within the
existing file-size gate using the existing data and control owners.
If either case still times out or the split needs new support, retain the
last green proof and reassess the remaining cost before extending the change.

**Slice 2 proof**

Both cases passed alone and together at one worker with the normal AC
sleep guard. The installed case took 3.426 s alone and together, and the
retained case took 3.830 s alone and 3.235 s together. The combined
runner took 8.791 s. The one-file change preserves installed launch,
receipt, Board placement and fresh-read proof. The retained case
observes Read, the actual Done update, exact native calls and Done
history directly. The Done mark updates history without an extra reload.
See `slice-2-implementation.md` and its linked proof records.

Matched four-worker comparison on the same 16-logical-CPU AC host, Node,
Chromium, locked deps, five-spec selection, fresh dashboard builds and
private fixtures. The split ran first, then the unsplit checkout at
`497eed2c2`. Both used natural load with zero supplemental burners.

| Candidate or baseline | Natural one-minute load | Attention cases | Neighboring cases | Runner |
| --- | --- | --- | --- | --- |
| Split at `4e31faa0f` with the Slice 2 edit | 35.84 → 36.05 | Installed attention survives restart: 25.871 s. Read leaves the session open for Done: 12.236 s. Both passed. | Seven passed, 16.121–25.260 s | 67.81 s, pass |
| Unsplit at `497eed2c2` | 31.83 → 39.87 | Installed attention report stays open, durable and readable through column change, retirement, restart, Mark as read and Mark as done: timed out at 30 s at Read final report (33.236 s with teardown). | Seven passed, 20.651–27.470 s | 79.61 s, fail |

The natural load reading was below the historical synthetic 52–59.
The actual neighboring-case durations overlap the initial loaded
baseline's 17.155–22.954 s, and the original timeout reproduced in the
matched pair. These observations establish comparable contention and
a passing split in that context. They do not establish a ceiling
under all synthetic workloads. The 86-burner candidate and 48-burner
baseline replay overshot the historical load. At 20 burners the
candidate's installed case and six unchanged neighbors timed out or
failed amid system contention, with roughly 30 GB swap in use.
Those runs remain diagnostic. `natural-load-candidate.json` and
`natural-load-baseline.json` retain per-case names, durations, selection
and terminal results; the matching logs record machine load, runner time
and the baseline assertion. This comparison applies ADR 0010's useful
outcome and evidenced comparison criteria.

## Local gates

- Run from fully awake macOS on AC with `caffeinate -s -i` under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  On battery use the documented awake, lid-open `caffeinate -i` path and
  inspect the sleep log. Use
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/sessions/agent-completion-attention.spec.ts --workers=1`
  for focused proof. Keep default timeouts and omit `test.slow()`.
- For the loaded gate, use the same runner with `--workers=4` and match the
  attention, quiet, cursor, execution and quiet-claude spec selection across
  baseline and candidate. Alternate baseline and candidate samples when
  contention is comparable to the reported failure. Record before/after
  natural load, CPU count, worker count, fixture and cache conditions,
  any supplemental workload and its priority, case titles and durations
  from distinct `OPEN_DOUGH_E2E_PROOF_RECORD` files. Record the slowest case
  and runner elapsed time as well as the typical result. A light-load pass
  leaves the loaded gate open. Use
  [Load while measuring](../../../Distribution/tests/local-test-resources.md#load-while-measuring)
  to distinguish natural load and synthetic work.
- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to failed or flaky observations. Run the
  [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  and account for affected proofs. The
  [test-entry selector](../../../.agents/skills/dough-execute-plan/references/test-entry-rules.md)
  selected MakeMe and page objects for this spec. Run the staged lint and
  dashboard typecheck required by the repository commit hook.

## Concern evidence

Slice-plan refinement was unnecessary because startup shortening leaves an
executable combined case and the second slice has one retained-session
lifecycle to exercise. Both reuse observed seams within one file and fit the
15-active-minute sizing rule. The loaded comparison begins with the unedited
baseline and gates acceptance of the final split. Preparation found no
additional slice-specific concern.

## Execution complete

Product advice: no change. The two journeys retain the integration proof that
depends on the installed command, the real report store, the Board and the
native protocol. The maintained Codex card and backend refusal cases still
own their boundaries. The matched comparison found the split worthwhile
under the measured contention and stayed within the one-file scope. The
existing remaining-session-test story retains its priority.

The review found no supported correction. It attributed implementation to
`4e31faa0f` and `bdf484822`, with the Take as provenance. E2E observations
drove and checked the proof split. No shared testing or product APIs changed.
Branch CI is pending here. The selected process review continues in wrap-up
with the automatic Intent Coverage result.

## Story obligations
