# Source-only review

Codex reviewer `/root/source_review` was started in a fresh, unforked session.
The launch passed only the selected seed section’s Goal, Scope and three Key
examples, with instructions to read no files and derive observable promises.
The ordered return below preserves its IDs and wording. Rows 01–09 are from
Goal or Scope, 10–11 from Scope, 12–15 from example 1, 16–21 from example 2,
and 22–28 from example 3, with Scope qualifications as applicable.

“Preserve each distinct assertion” applies across the migration. The source
identifies the assertions above and does not provide the contents of the five
existing cases. The Story Notes pilot supplies sequencing context. The remaining
families carry the full-suite timing target. History collection, the size of the
server’s retained window, Done-story and scope histories, and final runner
retirement have other owners.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 01 | The five cases in the four `intent-ci-wall-time-history*` specs run in plain Vitest Browser Mode in headless Chromium using prepared history, judgment, and proof. This is a migration from the built app. | slice 3 | |
| 02 | The existing family filter still selects the CI wall-time history family. | slice 3 | |
| 03 | The existing case listing still lists the family’s cases. | slice 3 | |
| 04 | CI still provides the existing proof for the family. | slice 3 | |
| 05 | Summed case time is compared with the built-app baseline for the same family. | slice 3 | |
| 06 | Command elapsed time is reported separately from summed case time. | slice 3 | |
| 07 | Unit cases use typed MakeMe inputs. | slice 3 | |
| 08 | The unit cases add zero test-support wrappers. | slice 3 | |
| 09 | Support retired by the migration has lost its last consumer. | slice 3 | |
| 10 | Evidence keeps its exact existing wording. The story source does not supply the literal strings. | slice 3 | |
| 11 | Run links keep their existing destinations. | slice 3 | |
| 12 | When the reader opens **Builds and evidence** for two measured builds flanking a gap, all three rows appear in answer order even though the build dates run backwards in landing order. | slice 1 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history-evidence.mounted.spec.ts, order case checks three row labels and datetime attributes in answer order |
| 13 | In that same history, the heading spans the actual build dates. | slice 1 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history-evidence.mounted.spec.ts, order case checks heading text and the earliest and latest build datetime attributes |
| 14 | In that same history, no line connects the measured points across the gap. | slice 1 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history-evidence.mounted.spec.ts, order case checks that neither SVG stroke joins points |
| 15 | The displayed measurement follows the supplied measured time when it differs from the run’s wall time. | slice 1 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history-evidence.mounted.spec.ts, order case gives run 213 a five-minute interval and a three-minute measure and checks its latest value and row |
| 16 | When the reader views the supplied window of twenty measured builds and six gaps, the chart duration rises and falls with the measured values. | slice 1 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history-evidence.mounted.spec.ts, window case checks the x order and every direction change among twenty points |
| 17 | Every break in that window is visible in the chart. | slice 1 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history-evidence.mounted.spec.ts, window case checks stroke lengths 6, 2, 3, 3, 2, 4 |
| 18 | When the reader expands evidence for that window, all 26 entries have evidence. | slice 1 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history-evidence.mounted.spec.ts, window case opens evidence and compares all 26 ordered rows |
| 19 | With empty history, the judgment remains visible. | slice 2 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history.mounted.spec.ts, empty case requires the passing trunk judgment with the revision and subject |
| 20 | With empty history, **Proof** remains visible. | slice 2 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history.mounted.spec.ts, empty case requires the Proof region and all three exact accessible labels |
| 21 | With empty history, no evidence disclosure is offered. | slice 2 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history.mounted.spec.ts, empty case checks that history has no summary or chart |
| 22 | At a 390 px viewport, with focus on **Check again**, Shift+Tab opens the keyboard path to **Builds and evidence**. | slice 2 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history.mounted.spec.ts, measured case checks 390 × 844, focuses Check again, sends Shift+Tab, and observes the disclosure focused |
| 23 | From the resulting position in that phone journey, Enter expands **Builds and evidence**. | slice 2 | observed: dashboard/frontend-tests/intent/intent-ci-wall-time-history.mounted.spec.ts, measured case sends Enter from the focused disclosure and observes the visible list and exact row |
| 24 | The run links reached in that journey have their expected names. | slice 3 | |
| 25 | After expansion in the phone journey, successive Tabs reach the run links in order. | slice 3 | |
| 26 | The gap-only answer explains each gap. | slice 3 | |
| 27 | The page fits the 390 px viewport. | slice 3 | |
| 28 | The history fits the 390 px viewport. | slice 3 | |
