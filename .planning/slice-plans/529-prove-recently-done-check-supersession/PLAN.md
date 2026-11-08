# Prove Recently done selection's check rules and tidy its catalog read

**Identity:** SEED-272#prove-recently-done-check-supersession

**Source:** [Prove Recently done selection's check rules and tidy its catalog read](../../seeds/SEED-272-select-recently-done-sessions.md#prove-recently-done-check-supersession)

## Provenance

Execution retrospective of
[Select recently done sessions](../../seeds/SEED-272-select-recently-done-sessions.md#select-recently-done-sessions)
(plan 527), reviewing commits `2d8fcf4d7` (slice 1) and `1980a44f8`
(slice 2) as the net diff from the Take `0e6d4e750`. That plan's decisions
required ignoring "answers superseded by a later choice or navigation" and
keeping "an unread or failed catalog distinct from a miss, including when it
names an unreadable file for that identity."

## Current findings

1. A project change during an unanswered check
   (`useLayoutEffect(supersede, [stories.selected, supersede])` in
   `dashboard/src/recentlyDoneSelection.ts`) and an explicit Open
   (`recentlyDone.supersede()` in `goToSession`, `dashboard/src/PageFrame.tsx`)
   abandon the check, but no test fails if either is dropped. A late linked
   answer would then move an Intent reader to another project or override the
   Open's reveal. Only supersession by choosing another row is tested.
2. `linkIn` maps a catalog naming the story's done record unreadable to a
   problem, but no test arranges that case; a regression to "absent" would
   silently select the session as standalone.
3. `readLink` copies the gap-or-catalogued conversion in `cataloguedAt`
   (`dashboard/src/doneStories.ts`), and the row says a catalog gap with the raw
   problem while the Board says it with `doneUnreadProblem` and
   `doneCatalogRepair`.
4. Overlapping tests: the phone-width Development test in
   `recently-done-sessions-select-touch.spec.ts` re-proves the linked and
   standalone reveal and range extension of
   `recently-done-sessions-select-development.spec.ts`; that spec's test 2
   step 1 repeats the row-choice supersession already proved in
   `recently-done-sessions-select-check.spec.ts` without waiting for the
   abandoned request. Since CI repair `5e4a0cc`, the phone test's linked step
   also holds the Board's catalog read until the overlay closes, which no
   other test proves; keep that step.
5. `dashboard/src/PageFrame.tsx` grew to 255 lines with a hard-to-parse
   header sentence about going to what was selected.

## Preserved promises and constraints

All SEED-272#select-recently-done-sessions promises and its
[source review](../527-select-recently-done-sessions/source-review.md)
observations stay as delivered: Select and Open distinct, linked and
standalone selection, Intent reading kept, Development Board reveal with range
extension, phone overlay kept on Select, checking and failed checks said apart
from a confirmed miss. The Board's Recently done wording and window stay the
same. Excluded: whether a standalone choice should clear when the Selected
story changes; that product question stays with the developer.

## Current decisions

- Keep catalog reading in `doneStories.ts`: expose one function there that
  answers catalogued records or the Board's gap problem for a revision, and
  have `readLink` use it so the row repeats the Board's wording.
- Arrange an unreadable done record the way
  `dashboard/tests/stories/recently-done-stories.spec.ts` already does (a
  record the catalog lists unreadable), through the shared MakeMe builders.
- Hold and release reads through the existing `holdPygardonCatalog` events and
  wait for the abandoned request (`requestfailed`) before asserting.

## Outside-in proof

| Promise | Slice | Observable check |
| --- | --- | --- |
| Unreadable done record and catalog gap stay apart from a miss, in the Board's words | 1 | Choosing the linked row while Pygardon's catalog names its done record unreadable shows "could not be checked" and keeps project and Selected story; a catalog gap repeats the Board's gap problem. |
| Project change and Open supersede an unanswered check | 2 | Hold Pygardon's catalog, choose the linked row, then change project (and, separately, Open another row); after the abandoned request fails and the hold is released, project, Selected story and panel are those the developer went to. |
| Overlapping selection tests trimmed without losing promises | 2 | The phone Development test keeps its held-read linked overlay step and drops reveal and range assertions the development spec proves; development test 2 drops its duplicate supersession step; every source-review observation location still exists. |

**Local gate.** The select, select-check, select-development, select-touch,
recently-done-stories and Recently done sidebar specs; lint; dashboard
typecheck. Start long runs awake on AC power under `caffeinate -s -i`
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).
Failing and flaky tests follow [the project policy](../../../AGENTS.md#failing-and-flaky-tests).

## Slices

### 1. Share the done-catalog reading and prove the unreadable record

Type: Behavior
Status: planned
Proof: unreadable record and catalog gap row from the outside-in table.

The row's check reads the catalog through the Board's catalog reading, says a
gap in the Board's words, and an unreadable done record for the story is
proved distinct from a miss.

### 2. Prove check supersession by navigation and trim overlapping tests

Type: Behavior
Status: planned
Proof: supersession and trimmed-tests rows from the outside-in table.

Project change and explicit Open are proved to abandon an unanswered check;
duplicated selection steps are removed; `PageFrame.tsx` returns under 250
lines with a clear header comment.

## Preparation review

Slice-plan refinement was not needed: each slice has one observable result
and its own proof. No slice-specific concerns remain.
