# Correct the proof residue of Intent collected scope timing and chart marks

**Identity:** SEED-413#correct-scope-timing-chart-proof-residue
**Source:** [Correct the proof residue of Intent collected scope timing and chart marks](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#correct-scope-timing-chart-proof-residue)
**Source review:** [source-review.md](source-review.md)

## Correction input

SEED-413#speed-intent-scope-timing-reading delivered plan 777 on its story
branch in `5119da43d..91ebbc1fa`. Recover plan 777, its source review and
cohort comparison from `d156695c5:.planning/slice-plans/777-speed-intent-scope-timing-reading/`
(the before-cleanup revision); its story is at
`d156695c5:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-reading`.
The execution retrospective's independent outcome review found the following
at `91ebbc1fa`. The coordinator confirmed findings 2 and 4 by reading the
files.

1. **The Done pointer and keyboard chart-mark case repeats the Project
   case.** `intent-ci-history-chart-marks.spec.ts:30-56` and
   `intent-project-ci-history-chart-marks.spec.ts:52-92` mount the same
   `HistoryChart` with the same `intent-marked-scope-history-fixtures.ts`
   history. Both assert the same `markNames`, `builds()` and failed
   `drawnUnder`, hover the failed mark and Tab to the endpoint. The Done
   wording "Selected landing" is also asserted by the provenance, units, gaps
   and scope-glance specs. The Done case is the slowest remaining case of the
   cohort, at 2.7–4.3 s. The cohort stayed at 14 cases with no reason
   recorded for keeping this pair.
2. **The legacy-only unit case lost its no-timing check.** At `419aeed53`
   it asserted `not.toContainText(/\d+(?:\.\d+)?\s*(?:ms|s)\b/)`.
   `intent-scope-timing-history-units.spec.ts:103` now checks only that no
   unit name appears. A gap shown as a time would pass, and the cohort
   comparison did not record the drop.
3. **The Project dark pass cannot tell dark from light.**
   `intent-project-ci-history-chart-marks.spec.ts:72-79` expects the same
   all-true `painting` for both schemes. Nothing checks that the scheme
   switched. The legacy case had the same weakness. Intent Coverage at
   `973e1faf` showed the dark pass already fails when only the chart's marks
   ignore the dark scheme. The remaining risk is an app that ignores the
   scheme entirely, which would rerun light.
4. **Spent shared support.** `dashboard/test-support/historyChartPage.ts`
   members `partial`, `failed` and `averageLabel` have no consumer. `failed`
   lost its last consumers in plan 777.
5. **A second reader of the Done comparison.**
   `intent-scope-timing-history-reading.spec.ts:71-75,85-86,95-96`
   re-implements `expectDoneEntryComparisonKept` through `rowTextsOf` and its
   own `ownFigures`.
6. **`openScopeSummary` waits within Vitest's default poll timeout.**
   During the Intent Coverage check at `973e1faf`, its poll for the location
   name control (`intent-scope-history-page.ts:134`) timed out at load about
   44 before the case reached its subject. The fault was CSS-only, so the
   timeout was unrelated to it. The failure policy treats this load flake as
   a defect. Every moved Done scope history case opens through it.

The review also found that the dark-chart step in
`intent-story-dark-appearance.spec.ts:138-191` duplicates the Project
`painting` assertion. That file's migration story owns it, not this
correction.

## Goal and scope

Every moved scope history and chart-mark assertion can fail, and no
chart-mark case repeats another's checks. Feedback stays at least as fast.
Plan 777's promises stay as written. The Done chart stays readable by touch
through its own entry, and the Project chart by pointer and keyboard in both
schemes and at the narrowest width. Change only the files named above.

## Current decisions

- Done and Project charts share `HistoryChart`, so one pointer and keyboard
  case on the Project entry represents both, under the shared acceptance's
  "Use representative cases for equivalent paths". The Done touch case stays
  as the Done entry's chart-mark proof.
- Each moved check keeps a break check that fails without it.
- Use the plan 777 local gate: two workers, default timeouts, and
  `caffeinate -s -i` on AC under the
  [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Apply the shared
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Decisive premises

Observed on 2026-11-23 at `e313d887d` in the preparation worktree after
`npm ci` (Node 24.21.0), each with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run --silent test:dashboard:frontend -- <spec> --workers=2`
and the default reporter. Every scratch edit was reverted and
`git status --porcelain` was empty afterwards. Since `91ebbc1fa`, trunk
changed only `intent-scope-history-page.ts`'s touch `choose` among the named
files, which none of these paths reach.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Finding 2: the units case passes when the legacy-only history shows a time | `intent-scope-timing-history-units.spec.ts` | Scratch `<span> 0 ms</span>` beside the "legacy unit unknown" status in `IntentCiHistoryPanel.tsx` (load about 10) | Passed 2/2; the legacy-only case took 969 ms |
| Finding 3: the Project dark pass passes on a page that ignores the dark scheme | `intent-project-ci-history-chart-marks.spec.ts` | Scratch: every `prefers-color-scheme: dark` query in `dashboard/src` (`appearance.css`, `intent-ci-cues.css`, `source-tokens.css`) renamed to an unmatched scheme (load about 16–38) | Passed 2/2; the unfaulted run also passed, in 1.73 s |
| Slice 2: the Done case's line pattern, unavailable-at-failed level, zero and unavailable hovers and full Tab walk hold on the Project entry | `intent-project-ci-history-chart-marks.spec.ts` | Scratch: the Done case's assertions added to the Project case before its scheme loop, with `[...readoutsBefore, endpoint]` as the walk (load about 40–60) | Passed 2/2; line `M58 70 L190.7 58.4 M456 128 M721.3 35.2 M854 41`; the case took 3.44 s |
| Finding 6: `openScopeSummary`'s default poll times out under load | Same command on `intent-project-ci-history-chart-marks.spec.ts` | Retained Intent Coverage run 1 at `973e1faf8` (load about 44), recorded in `.planning/done/SEED-413_speed-intent-scope-timing-reading.json` | Timed out at `intent-scope-history-page.ts:134`; `openScopeSummary` is unchanged since |

Findings 1, 4 and 5 rest on the files as read at `e313d887d`: the two
chart-mark cases, `historyChartPage.ts` lines 25, 26 and 30 with no
`partial`, `failed` or `averageLabel` reader in `dashboard`, `e2e` or
`Distribution`, and the reading spec's `rowTextsOf` and `ownFigures`.

## Planning review

Slice-plan refinement was not needed: two Structure slices with separate
proof, each within one change set. This review found no remaining
slice-specific concern.

## Slices

### 1. Unit and scheme checks fail on their regressions, and the Summary opens under load

Type: Structure
Status: done

In the legacy-only unit case, assert that the history shows no timing
(`\d+(?:\.\d+)?\s*(?:ms|s)(?![a-z])`: the joined history text runs a unit
into the next word, which `\b` missed in the break check). In the Project chart-mark loop, wait until
the chart's paint differs from the previous scheme before reading
`painting`.

Make `openScopeSummary` wait for the location name control as long as the
mount needs under load, waiting on the control itself rather than lengthening
any case timeout.

**Proof.** Run both specs. Render a scratch "0 ms" in the legacy-only status
and require the units case to fail. Ignore `prefers-color-scheme` for the
whole page in scratch and require the Project case to fail on the dark pass.
Run the scope history specs that use `openScopeSummary` under comparable
load, at about 40, and require no timeout.

**Accepted proof (2026-11-23, load 26–88).** Both changed specs 4/4; the 17
`openScopeSummary` consumer specs, 26 cases, passed at load 64→47 with no
timeout. A scratch "0 ms" beside the legacy status fails the units case at its
no-timing check; unmatched dark-scheme queries fail the Project dark pass on its
readout-ink change poll, rechecked after refactoring. Refactoring moved
`locationNameDrawn` beside `locationNameControl` in `intent-ci-homepage-page.ts`
and the readout ink reader into `intent-scope-history-chart-page.ts`.

### 2. One pointer and keyboard chart-mark case, with no spent support

Type: Structure
Status: done

Move the Done case's distinct checks into the Project case: the full 7-mark
Tab walk, the broken-line pattern, the zero and unavailable hovers, and the
unavailable mark level with the failed one. Then delete the Done pointer and
keyboard case. Remove `historyChart().partial` and `.averageLabel`;
`.failed` keeps an e2e reader (G1). Make the reading spec call `expectDoneEntryComparisonKept`,
keeping its table only for `standsAbove`.

**Proof.** The chart-mark, reading and scope-glance specs pass, as does
`npm run typecheck:dashboard`. Map each removed Done assertion to its
Project owner, and break-check the Tab walk and hover there. A whole-repo
search finds no consumer of the removed members. Compare the two chart-mark
specs at two workers before and after, with load recorded.

**Accepted proof (2026-11-23).** Chart-mark, reading and both scope-glance
specs 6/6 and the dashboard typecheck pass. Scratch removals of the zero mark's
Tab stop and its pointer-enter fail the Project case's walk and hover. At two
workers, the chart-mark specs went from Project 5347 ms, narrow 862 ms, Done
pointer and keyboard 4578 ms and touch 2901 ms (load 16–28) to Project
3559 ms, narrow 576 ms and touch 2861 ms (load 13–18). `historyChart().failed`
stays: `e2e/intent/intent-ci-wall-time-history-later.spec.ts:135` reads it
through `measureHistoryChart` (G1). The refactor pass found nothing to change.

## Execution complete

Product advice: no change. The outcome review at `50d02ebe7` found no defect
or residue: every moved check has a break check that fails without it, the
Done touch case remains the Done entry's chart-mark proof, and the chart-mark
specs got faster. `historyChart().failed` stays as a live e2e reader (G1).

## Story obligations

### G1. `historyChart().failed` still has a consumer
Reported: slice 2 — "The e2e wall-time history spec reads `measureHistoryChart(history).failed` (`e2e/intent/intent-ci-wall-time-history-later.spec.ts:135`), so `.failed` is not spent; only `partial` and `averageLabel` were removed."
Story clause: "Remove the spent `historyChart()` members"
Disposition: no user cost "no case repeats another's checks": `.failed` is a live reader of the failed-build mark in the e2e wall-time history journey, not spent support; removing it would delete a check, while `partial` and `averageLabel` (no reader in dashboard, e2e or Distribution) are removed
Commitment: 7
