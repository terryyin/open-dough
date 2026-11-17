# Diagnosis: show-column-flake

## Signature

`frontend-tests/review/story-review-note-context.spec.ts:21` fails at
`showColumn` (`dashboard/tests/boardColumnNavigation.ts:81`, called from spec
line 90): `the column fits or its paging control is ready` — `Timeout 5000ms
exceeded while waiting on the predicate`.

## Reproduction rate and conditions

- 1 of 1 occurrences in a 120-test Frontend run, 2 workers, load avg ~9–12
  from other sessions, macOS on AC.
- Rerun alone `--repeat-each=4`: 4/4 pass.

## Attribution

Pre-existing. The story's changes touch neither the spec nor
`boardColumnNavigation.ts` (nor `dashboard/src/columnPaging.ts`).

## Evidence captured

Trace `dashboard/frontend-tests/test-results/2026-11-17T10-38-13.107Z-30030/frontend-tests-review-stor-47ece-on-endpoints-without-a-line-chromium/trace.zip`
(unzipped to the job tmp `trace-showcolumn/`, `1-trace.trace`):

- 65480 click side-panel Close; 65622 done.
- 65739–65744 `queryCount` Backlog control = 0, Taken control = **1**.
- 65745 `box(Taken region)` returns.
- 65752 `waitForSelector` Taken control (from `box(control)`) — **never
  returns**; test ends at 70742.
- Page snapshot at failure: no column paging control; all three columns shown.

## Hypotheses

1. (Leading, confirmed by trace) `pagingControlToward` counts a control, then
   reads its box with `locator.boundingBox()`, which waits for the element to
   attach. The Taken control is left over from the narrower Board while the
   review panel was open; the product removes it only after its
   ResizeObserver remeasures `--columns-shown` once the panel has closed. When
   the control unmounts between `count()` and `boundingBox()`, the poll
   callback blocks on a gone element and the whole 5 s poll times out in one
   iteration. `rested()` watches only the target region's x, which does not
   reveal the pending remeasure. Load widens the gap between the two reads.
   - Experiment: repair by reading each control's presence and box in one
     non-waiting browser read, and only act on a choice that two consecutive
     readings agree on; run the spec `--repeat-each=20 --workers=4` under the
     current load, then every `showColumn` consumer once.
   - Stopping count: 20 repeats; any failure matching the signature refutes
     the repair. Result: 20/20 passed (59.2 s, 4 workers, load avg 27.8 at
     end). Consumers once: Frontend 38 direct/helper-mediated consumer specs,
     84 passed (4 workers, load 34.5). Integrated 12 consumer specs at 4
     workers, load 24.8–34.5: 22 passed, 4 failed, all on the 30 s test
     timeout (the intent comparison specs, which take 13–26 s each when
     healthy); one of them was inside `showColumn` when the test budget ran
     out, its poll callbacks all returned promptly (trace
     `dashboard/tests/test-results/2026-11-17T10-48-09.933Z-32068/tests-intent-intent-summar-e5eb8--and-restoring-it-on-return-chromium/trace.zip`:
     test started 48086, ended 69533 at the 30 s budget), not the
     original hang. Rerun of those 3 files at 2 workers, load ~19–20: 4/4
     passed (13.5–21.4 s).

## Repair

`dashboard/tests/boardColumnNavigation.ts`: `pagingControlToward` reads each
control's x with a non-waiting `evaluateAll` (absent → no control) and
returns the column name; `showColumn` acts on a choice only once two
consecutive poll readings agree, then resolves the control by name.

## Unrelated observation

Integrated intent comparison specs (`intent-ci-comparison-drilldown-relative`,
`intent-summary-story-comparison-file`, `intent-summary-story-comparison-sort`)
run 13–26 s healthy and exceed the 30 s test timeout at 4 workers under
external load ≥25. Not this signature; for the coordinator to classify.

## Temporary edits / parked changes

None. Unowned uncommitted slice-4 changes in the checkout are left untouched.

## Round

Round 1 (clock `show-column-flake`).

## Coordinator proof after the refactor (2026-11-17)

After the refactor (`seen.control`, one reading kept), load 44–47 from
external Java/VM work: 130 Frontend specs that reach `showColumn` or its
helpers, 2 workers, 283 passed and 1 failed; `story-review-note-context`
`--repeat-each=20` at 2 workers, 20 passed. The failure,
`intent-summary-ci-proof-sort` folder Counts `aria-sort` empty after drilling,
matched slice 5's concurrent scratch break of `useSummarySorting` in the shared
checkout; rerun on clean source with `--repeat-each=3`, 3 passed. Limit: proof
runs shared with an implementer's scratch product breaks are not evidence.
