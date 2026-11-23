# Correct the proof residue of Intent collected scope timing and chart marks

**Identity:** SEED-413#correct-scope-timing-chart-proof-residue
**Source:** [Correct the proof residue of Intent collected scope timing and chart marks](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#correct-scope-timing-chart-proof-residue)

## Correction input

SEED-413#speed-intent-scope-timing-reading delivered plan 777 on its story
branch in `5119da43d..91ebbc1fa`. Recover plan 777, its source review and
cohort comparison from `91ebbc1fa:.planning/slice-plans/777-speed-intent-scope-timing-reading/`.
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
   switched. The legacy case had the same weakness.
4. **Spent shared support.** `dashboard/test-support/historyChartPage.ts`
   members `partial`, `failed` and `averageLabel` have no consumer. `failed`
   lost its last consumers in plan 777.
5. **A second reader of the Done comparison.**
   `intent-scope-timing-history-reading.spec.ts:71-75,85-86,95-96`
   re-implements `expectDoneEntryComparisonKept` through `rowTextsOf` and its
   own `ownFigures`.

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

## Slices

### 1. Unit and scheme checks fail on their regressions

Type: Structure
Status: planned

In the legacy-only unit case, assert that the history shows no timing
(`\d+(?:\.\d+)?\s*(?:ms|s)\b`). In the Project chart-mark loop, wait until
the chart's paint differs from the previous scheme before reading
`painting`.

**Proof.** Run both specs. Render a scratch "0 ms" in the legacy-only status
and require the units case to fail. Ignore `prefers-color-scheme` for the
chart in scratch and require the Project case to fail on the dark pass.

### 2. One pointer and keyboard chart-mark case, with no spent support

Type: Structure
Status: planned

Move the Done case's distinct checks into the Project case: the full 7-mark
Tab walk, the broken-line pattern, the zero and unavailable hovers, and the
unavailable mark level with the failed one. Then delete the Done pointer and
keyboard case. Remove `historyChart().partial`, `.failed` and
`.averageLabel`. Make the reading spec call `expectDoneEntryComparisonKept`,
keeping its table only for `standsAbove`.

**Proof.** The chart-mark, reading and scope-glance specs pass, as does
`npm run typecheck:dashboard`. Map each removed Done assertion to its
Project owner, and break-check the Tab walk and hover there. A whole-repo
search finds no consumer of the removed members. Compare the two chart-mark
specs at two workers before and after, with load recorded.
